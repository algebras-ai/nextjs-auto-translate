// src/parser/Parser.ts
import { parse } from '@babel/parser';
import traverseDefault from '@babel/traverse';
import * as t from '@babel/types';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { SourceStore } from '../storage/SourceStore';
import { ParserOptions, ScopeData, ScopeMap } from '../types';
import {
  buildContent,
  extractExpressionContent,
  getRelativeScopePath,
} from './utils';

// @babel/traverse has different exports for ESM vs CommonJS
const traverse = (traverseDefault as any).default || traverseDefault;

export class Parser {
  private lockPath: string;
  private sourceStore: SourceStore;

  constructor(private options: ParserOptions & { outputDir?: string } = {}) {
    const outputDir = options.outputDir || '.intl';
    this.lockPath = path.resolve(process.cwd(), outputDir, '.lock');
    this.sourceStore = new SourceStore(outputDir);
  }

  private findFilesSync(
    dir: string,
    extensions: string[],
    ignorePatterns: string[]
  ): string[] {
    const files: string[] = [];

    const isIgnored = (filePath: string): boolean => {
      return ignorePatterns.some((pattern) => {
        // Convert glob pattern to regex-like matching
        const regexPattern = pattern
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^/]*')
          .replace(/\//g, '\\/');
        const regex = new RegExp(regexPattern);
        return regex.test(filePath);
      });
    };

    const walkDir = (currentDir: string): void => {
      try {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          const relativePath = path.relative(dir, fullPath);

          if (isIgnored(relativePath)) {
            continue;
          }

          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
        console.warn(`[Parser] Cannot read directory: ${currentDir}`);
      }
    };

    walkDir(dir);
    return files;
  }

  parseProject(): ScopeMap {
    // Ensure .intl directory exists
    const intlDir = path.dirname(this.sourceStore['path']);
    fs.mkdirSync(intlDir, { recursive: true });

    // Lock file check
    if (fs.existsSync(this.lockPath)) {
      console.log('🟡 Skipping parse: lock file present.');
      return this.sourceStore.load();
    }

    // Create lock file
    fs.writeFileSync(this.lockPath, '');
    try {
      console.log('[Parser] Scanning project for translatable strings...');
      const ignore = ['**/.next/**', '**/dist/**'];
      if (!this.options.includeNodeModules) {
        ignore.push('**/node_modules/**');
      }
      const files = this.findFilesSync(process.cwd(), ['.tsx', '.jsx'], ignore);
      console.log(`[Parser] Found ${files.length} files to scan.`);

      const scopeMap: ScopeMap = {
        version: 0.1,
        files: {},
      };

      const projectRoot = process.cwd();

      for (const file of files) {
        const code = fs.readFileSync(file, 'utf-8');
        let ast;
        try {
          ast = parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
          });
        } catch {
          console.warn(`[Parser] Skipping file with parse error: ${file}`);
          continue;
        }

        // Get relative file path from project root
        const relativeFilePath = path.relative(projectRoot, file);
        const fileScopes: { [scope: string]: ScopeData } = {};

        // Map to store variable scopes per function/component
        // Key: function path location, Value: Map<variableName, stringValue>
        const functionScopes = new Map<string, Map<string, string>>();

        // Map to store function return scopes per function/component
        // Key: function path location, Value: Map<functionName, stringReturnValue>
        const functionReturnScopes = new Map<string, Map<string, string>>();

        // First pass: Build variable and function scope maps for each function/component
        traverse(ast, {
          // Track variable declarations with string literal initializers
          VariableDeclarator(path: any) {
            if (
              t.isIdentifier(path.node.id) &&
              path.node.init &&
              t.isStringLiteral(path.node.init)
            ) {
              const varName = path.node.id.name;
              const stringValue = path.node.init.value;

              // Find the parent function/component
              const functionPath = path.findParent((p: any) => {
                return (
                  p.isFunctionDeclaration() ||
                  p.isArrowFunctionExpression() ||
                  p.isFunctionExpression() ||
                  (p.isVariableDeclarator() &&
                    p.node.init &&
                    (t.isArrowFunctionExpression(p.node.init) ||
                      t.isFunctionExpression(p.node.init)))
                );
              });

              if (functionPath) {
                const functionLocation = functionPath.getPathLocation();
                if (!functionScopes.has(functionLocation)) {
                  functionScopes.set(functionLocation, new Map());
                }
                const scope = functionScopes.get(functionLocation)!;
                scope.set(varName, stringValue);
              } else {
                // Top-level variable - use file path as scope key
                const fileScopeKey = `file:${relativeFilePath}`;
                if (!functionScopes.has(fileScopeKey)) {
                  functionScopes.set(fileScopeKey, new Map());
                }
                const scope = functionScopes.get(fileScopeKey)!;
                scope.set(varName, stringValue);
              }
            }
          },
        });

        // First pass (continued): Build function return scopes for deterministic string-returning functions.
        // We only record functions when we can prove the return value is a single stable string
        // (e.g., `function getGreeting(){ return 'Hello' }`).
        traverse(ast, {
          FunctionDeclaration(path: any) {
            if (!path.node.id || !t.isIdentifier(path.node.id)) return;

            const funcName = path.node.id.name;

            // Collect string literal returns for this function body only (skip nested functions).
            const returnValues = new Set<string>();
            path.traverse({
              Function(inner: any) {
                if (inner.node !== path.node) {
                  inner.skip();
                }
              },
              ReturnStatement(retPath: any) {
                const arg = retPath.node.argument;
                if (!arg) return;
                if (!t.isStringLiteral(arg)) {
                  // Non-string return -> not deterministic for our purposes
                  returnValues.add('__NON_STRING__');
                  return;
                }
                returnValues.add(arg.value);
              },
            });

            if (returnValues.size !== 1 || returnValues.has('__NON_STRING__')) {
              return;
            }

            const onlyValue = Array.from(returnValues)[0];

            // Determine scope key (file-level or enclosing function/component)
            const enclosingFunctionPath = path.findParent((p: any) => {
              if (p === path) return false;
              return (
                p.isFunctionDeclaration() ||
                p.isArrowFunctionExpression() ||
                p.isFunctionExpression() ||
                (p.isVariableDeclarator() &&
                  p.node.init &&
                  (t.isArrowFunctionExpression(p.node.init) ||
                    t.isFunctionExpression(p.node.init)))
              );
            });

            const fileScopeKey = `file:${relativeFilePath}`;
            const scopeKey = enclosingFunctionPath
              ? enclosingFunctionPath.getPathLocation()
              : fileScopeKey;

            if (!functionReturnScopes.has(scopeKey)) {
              functionReturnScopes.set(scopeKey, new Map());
            }
            functionReturnScopes.get(scopeKey)!.set(funcName, onlyValue);
          },

          VariableDeclarator(path: any) {
            // Handle: const getGreeting = () => 'Hello'
            if (!t.isIdentifier(path.node.id) || !path.node.init) return;

            const funcName = path.node.id.name;
            const init = path.node.init;

            const extractDeterministicReturn = (): string | null => {
              // Arrow function: () => 'Hello'
              if (t.isArrowFunctionExpression(init)) {
                if (t.isStringLiteral(init.body)) {
                  return init.body.value;
                }
                if (t.isBlockStatement(init.body)) {
                  const returnValues = new Set<string>();
                  for (const stmt of init.body.body) {
                    if (!t.isReturnStatement(stmt)) continue;
                    const arg = stmt.argument;
                    if (!arg) continue;
                    if (!t.isStringLiteral(arg)) return null;
                    returnValues.add(arg.value);
                  }
                  return returnValues.size === 1
                    ? Array.from(returnValues)[0]
                    : null;
                }
                return null;
              }

              // Function expression: const fn = function(){ return 'Hello' }
              if (
                t.isFunctionExpression(init) &&
                t.isBlockStatement(init.body)
              ) {
                const returnValues = new Set<string>();
                for (const stmt of init.body.body) {
                  if (!t.isReturnStatement(stmt)) continue;
                  const arg = stmt.argument;
                  if (!arg) continue;
                  if (!t.isStringLiteral(arg)) return null;
                  returnValues.add(arg.value);
                }
                return returnValues.size === 1
                  ? Array.from(returnValues)[0]
                  : null;
              }

              return null;
            };

            const onlyValue = extractDeterministicReturn();
            if (!onlyValue) return;

            const enclosingFunctionPath = path.findParent((p: any) => {
              return (
                p.isFunctionDeclaration() ||
                p.isArrowFunctionExpression() ||
                p.isFunctionExpression() ||
                (p.isVariableDeclarator() &&
                  p.node.init &&
                  (t.isArrowFunctionExpression(p.node.init) ||
                    t.isFunctionExpression(p.node.init)))
              );
            });

            const fileScopeKey = `file:${relativeFilePath}`;
            const scopeKey = enclosingFunctionPath
              ? enclosingFunctionPath.getPathLocation()
              : fileScopeKey;

            if (!functionReturnScopes.has(scopeKey)) {
              functionReturnScopes.set(scopeKey, new Map());
            }
            functionReturnScopes.get(scopeKey)!.set(funcName, onlyValue);
          },
        });

        // Second pass: Process JSXElements with variable scope context
        traverse(ast, {
          JSXElement(path: any) {
            // Get the element name
            const elementName = path.node.openingElement.name;
            let tagName = 'Unknown';
            if (t.isJSXIdentifier(elementName)) {
              tagName = elementName.name;
            } else if (t.isJSXMemberExpression(elementName)) {
              tagName = elementName.property.name;
            }

            // Find the parent function/component to get its variable scope
            const functionPath = path.findParent((p: any) => {
              return (
                p.isFunctionDeclaration() ||
                p.isArrowFunctionExpression() ||
                p.isFunctionExpression() ||
                (p.isVariableDeclarator() &&
                  p.node.init &&
                  (t.isArrowFunctionExpression(p.node.init) ||
                    t.isFunctionExpression(p.node.init)))
              );
            });

            // Get variable scope for this function, or use file-level scope
            // Merge both function-level and file-level scopes
            const fileScopeKey = `file:${relativeFilePath}`;
            const fileLevelScope =
              functionScopes.get(fileScopeKey) || new Map();
            const fileLevelFunctionScope =
              functionReturnScopes.get(fileScopeKey) || new Map();

            let variableScope = new Map<string, string>(fileLevelScope);
            let functionReturnScope = new Map<string, string>(
              fileLevelFunctionScope
            );

            if (functionPath) {
              const functionLocation = functionPath.getPathLocation();
              const functionLevelScope =
                functionScopes.get(functionLocation) || new Map();
              const functionLevelFunctionScope =
                functionReturnScopes.get(functionLocation) || new Map();
              // Merge function-level scope into file-level scope
              for (const [key, value] of functionLevelScope) {
                variableScope.set(key, value);
              }
              for (const [key, value] of functionLevelFunctionScope) {
                functionReturnScope.set(key, value);
              }
            }

            // Debug: Log variable scope for template literals
            // This helps verify that variables are in scope when processing template literals

            // Check if this element is nested inside another element that has text
            // If so, skip extracting it to avoid duplication (content is already in parent's extraction)
            let parentPath: any = path.parentPath;
            while (parentPath) {
              if (parentPath.isJSXElement && parentPath.isJSXElement()) {
                const parentElementName = parentPath.node.openingElement.name;
                let parentTagName = 'Unknown';
                if (t.isJSXIdentifier(parentElementName)) {
                  parentTagName = parentElementName.name;
                } else if (t.isJSXMemberExpression(parentElementName)) {
                  parentTagName = parentElementName.property.name;
                }

                // Check if parent has JSXText or translatable expressions
                const hasContentInParent = parentPath.node.children.some(
                  (child: any) => {
                    if (t.isJSXText(child) && child.value.trim()) {
                      return true;
                    }
                    if (t.isJSXExpressionContainer(child)) {
                      const expr = child.expression;
                      // Check if it's a translatable expression
                      if (
                        t.isStringLiteral(expr) ||
                        t.isTemplateLiteral(expr) ||
                        t.isConditionalExpression(expr) ||
                        t.isLogicalExpression(expr) ||
                        (t.isBinaryExpression(expr) && expr.operator === '+')
                      ) {
                        return true;
                      }
                    }
                    return false;
                  }
                );

                // If parent has content, this nested element's content is already included
                if (hasContentInParent) {
                  return;
                }
              }
              parentPath = parentPath.parentPath;
            }

            // Check if element has translatable content
            const hasTranslatableContent = path.node.children.some(
              (child: any) => {
                if (t.isJSXText(child) && child.value.trim()) {
                  return true;
                }
                if (t.isJSXExpressionContainer(child)) {
                  const expr = child.expression;
                  // Check for translatable expressions
                  if (
                    t.isStringLiteral(expr) ||
                    t.isTemplateLiteral(expr) ||
                    t.isConditionalExpression(expr) ||
                    t.isLogicalExpression(expr) ||
                    (t.isBinaryExpression(expr) && expr.operator === '+') ||
                    t.isCallExpression(expr) ||
                    t.isIdentifier(expr) ||
                    t.isMemberExpression(expr)
                  ) {
                    return true;
                  }
                }
                return false;
              }
            );

            if (hasTranslatableContent) {
              // Pass variableScope to buildContent
              const content = buildContent(
                path.node,
                variableScope,
                functionReturnScope
              );
              if (content.trim()) {
                const hash = crypto
                  .createHash('md5')
                  .update(content)
                  .digest('hex');
                const fullScopePath = path.getPathLocation();
                const relativeScopePath = getRelativeScopePath(fullScopePath);

                fileScopes[relativeScopePath] = {
                  type: 'element',
                  hash,
                  context: '',
                  skip: false,
                  overrides: {},
                  content,
                };

                // Static variables are now resolved directly in extractExpressionContent
                // Only runtime variables (not in variableScope) will remain as placeholders

                // Extract conditional expression branches (ternary) as separate entries
                // This enables preserving runtime conditional logic while translating each branch.
                // Pattern: {scopePath}_cond_{index}_{consequent|alternate}
                let conditionalIndex = 0;
                path.node.children.forEach((child: any) => {
                  if (!t.isJSXExpressionContainer(child)) return;
                  const expr = child.expression;
                  if (!t.isConditionalExpression(expr)) return;

                  const consequentContent = extractExpressionContent(
                    expr.consequent,
                    variableScope,
                    functionReturnScope
                  );
                  const alternateContent = extractExpressionContent(
                    expr.alternate,
                    variableScope,
                    functionReturnScope
                  );

                  if (!consequentContent || !alternateContent) return;

                  const consequentKey = `${relativeScopePath}_cond_${conditionalIndex}_consequent`;
                  const alternateKey = `${relativeScopePath}_cond_${conditionalIndex}_alternate`;

                  if (!fileScopes[consequentKey]) {
                    const hash = crypto
                      .createHash('md5')
                      .update(consequentContent)
                      .digest('hex');
                    fileScopes[consequentKey] = {
                      type: 'element',
                      hash,
                      context: 'Conditional expression consequent branch',
                      skip: false,
                      overrides: {},
                      content: consequentContent,
                    };
                  }

                  if (!fileScopes[alternateKey]) {
                    const hash = crypto
                      .createHash('md5')
                      .update(alternateContent)
                      .digest('hex');
                    fileScopes[alternateKey] = {
                      type: 'element',
                      hash,
                      context: 'Conditional expression alternate branch',
                      skip: false,
                      overrides: {},
                      content: alternateContent,
                    };
                  }

                  conditionalIndex++;
                });

                // Extract logical expression right operands as separate entries
                // This enables preserving runtime logic like: condition && "Text" or value || "Fallback"
                // Pattern: {scopePath}_logic_{index}_{and|or}_right
                let logicalIndex = 0;
                path.node.children.forEach((child: any) => {
                  if (!t.isJSXExpressionContainer(child)) return;
                  const expr = child.expression;
                  if (!t.isLogicalExpression(expr)) return;

                  // Only safe to extract when right side is a plain string literal.
                  // We do NOT extract template literals/identifiers here to avoid breaking runtime interpolation.
                  if (!t.isStringLiteral(expr.right)) return;

                  const op = expr.operator;
                  const opName =
                    op === '&&' ? 'and' : op === '||' ? 'or' : null;
                  if (!opName) return;

                  const rightContent = expr.right.value;
                  if (!rightContent) return;

                  const key = `${relativeScopePath}_logic_${logicalIndex}_${opName}_right`;
                  if (!fileScopes[key]) {
                    const hash = crypto
                      .createHash('md5')
                      .update(rightContent)
                      .digest('hex');
                    fileScopes[key] = {
                      type: 'element',
                      hash,
                      context: `Logical expression (${op}) right operand`,
                      skip: false,
                      overrides: {},
                      content: rightContent,
                    };
                  }

                  logicalIndex++;
                });
              }
            }
          },
        });

        // Only add files that have scopes
        if (Object.keys(fileScopes).length > 0) {
          scopeMap.files[relativeFilePath] = {
            scopes: fileScopes,
          };
        }
      }

      // Compare with previous
      const prev = this.sourceStore.load();
      const prevFiles = prev.files || {};
      const newFiles = scopeMap.files;

      const changed = this.hasChanges(prevFiles, newFiles);

      if (!changed) {
        console.log('🟢 Skipping parse: no changes detected.');
        return prev;
      }

      const totalEntries = Object.values(newFiles).reduce(
        (count, file) => count + Object.keys(file.scopes).length,
        0
      );

      console.log(
        `[Parser] Extraction complete. Found ${totalEntries} entries across ${
          Object.keys(newFiles).length
        } files.`
      );
      // Save new sources
      this.sourceStore.save(scopeMap);
      return scopeMap;
    } finally {
      // Remove lock file
      fs.unlinkSync(this.lockPath);
    }
  }

  private hasChanges(
    prevFiles: {
      [filePath: string]: { scopes: { [scope: string]: ScopeData } };
    },
    newFiles: { [filePath: string]: { scopes: { [scope: string]: ScopeData } } }
  ): boolean {
    const prevFilePaths = Object.keys(prevFiles);
    const newFilePaths = Object.keys(newFiles);

    // Check if file count changed
    if (prevFilePaths.length !== newFilePaths.length) {
      return true;
    }

    // Check each file
    for (const filePath of newFilePaths) {
      const prevFile = prevFiles[filePath];
      const newFile = newFiles[filePath];

      if (!prevFile) {
        return true; // New file added
      }

      const prevScopes = Object.keys(prevFile.scopes);
      const newScopes = Object.keys(newFile.scopes);

      // Check if scope count changed
      if (prevScopes.length !== newScopes.length) {
        return true;
      }

      // Check each scope
      for (const scope of newScopes) {
        const prevScope = prevFile.scopes[scope];
        const newScope = newFile.scopes[scope];

        if (!prevScope || prevScope.hash !== newScope.hash) {
          return true;
        }
      }
    }

    return false;
  }
}
