// src/parser/Parser.ts
import { parse } from '@babel/parser';
import traverseDefault from '@babel/traverse';
import * as t from '@babel/types';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { SourceStore } from '../storage/SourceStore';
import { ParserOptions, ScopeData, ScopeMap } from '../types';
import { shouldTranslateJsxAttribute } from '../utils/jsxAttributeTranslation';
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

        // Map to store conditional-return function scopes (string-returning based on param value)
        // Key: function path location, Value: Map<functionName, { cases, defaultReturn }>
        const functionConditionalReturnScopes = new Map<
          string,
          Map<
            string,
            { cases: Map<string, string>; defaultReturn: string | null }
          >
        >();

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
            if (!t.isIdentifier(path.node.id) || !path.node.init) return;

            const varName = path.node.id.name;
            const init = path.node.init;

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

            const ensureScopeMap = (): Map<string, string> => {
              if (!functionReturnScopes.has(scopeKey)) {
                functionReturnScopes.set(scopeKey, new Map());
              }
              return functionReturnScopes.get(scopeKey)!;
            };

            const extractDeterministicReturnFromFunctionLike = (
              fn:
                | t.ArrowFunctionExpression
                | t.FunctionExpression
                | t.ObjectMethod
            ): string | null => {
              // Arrow: () => 'Hello'
              if (t.isArrowFunctionExpression(fn)) {
                if (t.isStringLiteral(fn.body)) {
                  return fn.body.value;
                }
                if (t.isBlockStatement(fn.body)) {
                  const returnValues = new Set<string>();
                  for (const stmt of fn.body.body) {
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

              // FunctionExpression / ObjectMethod: function(){ return 'Hello' }
              if (
                (t.isFunctionExpression(fn) || t.isObjectMethod(fn)) &&
                t.isBlockStatement(fn.body)
              ) {
                const returnValues = new Set<string>();
                for (const stmt of fn.body.body) {
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

            // Handle: const obj = { getText: () => 'Hello' } or const obj = { getText() { return 'Hello' } }
            if (t.isObjectExpression(init)) {
              const scopeMap = ensureScopeMap();
              for (const prop of init.properties) {
                if (t.isSpreadElement(prop)) continue;

                // obj: { getText: () => 'Hello' }
                if (t.isObjectProperty(prop)) {
                  if (!t.isIdentifier(prop.key)) continue;
                  const methodName = prop.key.name;
                  const value = prop.value;
                  if (
                    !t.isArrowFunctionExpression(value) &&
                    !t.isFunctionExpression(value)
                  ) {
                    continue;
                  }
                  const onlyValue =
                    extractDeterministicReturnFromFunctionLike(value);
                  if (!onlyValue) continue;
                  scopeMap.set(`${varName}.${methodName}`, onlyValue);
                }

                // obj: { getText() { return 'Hello' } }
                if (t.isObjectMethod(prop)) {
                  if (!t.isIdentifier(prop.key)) continue;
                  const methodName = prop.key.name;
                  const onlyValue =
                    extractDeterministicReturnFromFunctionLike(prop);
                  if (!onlyValue) continue;
                  scopeMap.set(`${varName}.${methodName}`, onlyValue);
                }
              }
              return;
            }

            // Handle: const getGreeting = () => 'Hello'
            if (
              !t.isArrowFunctionExpression(init) &&
              !t.isFunctionExpression(init)
            ) {
              return;
            }

            const onlyValue = extractDeterministicReturnFromFunctionLike(init);
            if (!onlyValue) return;

            ensureScopeMap().set(varName, onlyValue);
          },
        });

        // First pass (continued): Build conditional-return function scopes.
        // We record functions that return different stable strings based on a single param, e.g.:
        // - if (status === 'loading') return 'Loading...'
        // - switch (status) { case 'pending': return 'Pending' }
        traverse(ast, {
          FunctionDeclaration(path: any) {
            if (!path.node.id || !t.isIdentifier(path.node.id)) return;
            if (path.node.params.length !== 1) return;
            const param = path.node.params[0];
            if (!t.isIdentifier(param)) return;
            if (!t.isBlockStatement(path.node.body)) return;

            const funcName = path.node.id.name;
            const paramName = param.name;

            const cases = new Map<string, string>();
            let defaultReturn: string | null = null;

            const extractFirstReturnString = (
              stmts: t.Statement[]
            ): string | null => {
              for (const stmt of stmts) {
                if (!t.isReturnStatement(stmt)) continue;
                const arg = stmt.argument;
                if (arg && t.isStringLiteral(arg)) {
                  return arg.value;
                }
              }
              return null;
            };

            // Pattern 1: switch(param) { case 'x': return '...'; default: return '...'; }
            const switchStmt = path.node.body.body.find((s: t.Statement) =>
              t.isSwitchStatement(s)
            ) as t.SwitchStatement | undefined;
            if (
              switchStmt &&
              t.isIdentifier(switchStmt.discriminant) &&
              switchStmt.discriminant.name === paramName
            ) {
              for (const cs of switchStmt.cases) {
                const ret = extractFirstReturnString(cs.consequent);
                if (!ret) continue;
                if (!cs.test) {
                  defaultReturn = ret;
                  continue;
                }
                if (t.isStringLiteral(cs.test)) {
                  cases.set(cs.test.value, ret);
                }
              }
            } else {
              // Pattern 2: if (param === 'x') return '...'; ...; return '...';
              for (const stmt of path.node.body.body) {
                if (!t.isIfStatement(stmt)) continue;
                const test = stmt.test;
                if (!t.isBinaryExpression(test) || test.operator !== '===') {
                  continue;
                }

                const left = test.left;
                const right = test.right;
                const match =
                  (t.isIdentifier(left) &&
                    left.name === paramName &&
                    t.isStringLiteral(right) &&
                    right.value) ||
                  (t.isIdentifier(right) &&
                    right.name === paramName &&
                    t.isStringLiteral(left) &&
                    left.value);

                if (!match) continue;

                const value = t.isStringLiteral(left)
                  ? left.value
                  : t.isStringLiteral(right)
                    ? right.value
                    : '';
                const consequentStmts: t.Statement[] = t.isBlockStatement(
                  stmt.consequent
                )
                  ? stmt.consequent.body
                  : t.isStatement(stmt.consequent)
                    ? [stmt.consequent]
                    : [];

                const ret = extractFirstReturnString(consequentStmts);
                if (ret) {
                  cases.set(value, ret);
                }
              }

              // Default: first top-level string literal return statement (commonly the final return)
              defaultReturn = extractFirstReturnString(path.node.body.body);
            }

            if (cases.size === 0 || !defaultReturn) return;

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

            if (!functionConditionalReturnScopes.has(scopeKey)) {
              functionConditionalReturnScopes.set(scopeKey, new Map());
            }
            functionConditionalReturnScopes
              .get(scopeKey)!
              .set(funcName, { cases, defaultReturn });
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
            const fileLevelConditionalReturnScope =
              functionConditionalReturnScopes.get(fileScopeKey) || new Map();

            let variableScope = new Map<string, string>(fileLevelScope);
            let functionReturnScope = new Map<string, string>(
              fileLevelFunctionScope
            );
            let functionConditionalReturnScope = new Map<
              string,
              { cases: Map<string, string>; defaultReturn: string | null }
            >(fileLevelConditionalReturnScope);

            if (functionPath) {
              const functionLocation = functionPath.getPathLocation();
              const functionLevelScope =
                functionScopes.get(functionLocation) || new Map();
              const functionLevelFunctionScope =
                functionReturnScopes.get(functionLocation) || new Map();
              const functionLevelConditionalReturnScope =
                functionConditionalReturnScopes.get(functionLocation) ||
                new Map();
              // Merge function-level scope into file-level scope
              for (const [key, value] of functionLevelScope) {
                variableScope.set(key, value);
              }
              for (const [key, value] of functionLevelFunctionScope) {
                functionReturnScope.set(key, value);
              }
              for (const [key, value] of functionLevelConditionalReturnScope) {
                functionConditionalReturnScope.set(key, value);
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
              const fullScopePath = path.getPathLocation();
              const relativeScopePath = getRelativeScopePath(fullScopePath);

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
                //
                // Also supports TemplateLiteral on the right side:
                // Pattern: {scopePath}_logic_{index}_{and|or}_right_quasi_{i}
                let logicalIndex = 0;
                path.node.children.forEach((child: any) => {
                  if (!t.isJSXExpressionContainer(child)) return;
                  const expr = child.expression;
                  if (!t.isLogicalExpression(expr)) return;

                  const op = expr.operator;
                  const opName =
                    op === '&&' ? 'and' : op === '||' ? 'or' : null;
                  if (!opName) return;

                  // Case 1: right side is a plain string literal.
                  if (t.isStringLiteral(expr.right)) {
                    const rightContent = expr.right.value;
                    if (!rightContent) {
                      logicalIndex++;
                      return;
                    }

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
                    return;
                  }

                  // Case 2: right side is a template literal.
                  // We extract ONLY the static quasis as their own entries so runtime interpolations stay untouched.
                  if (t.isTemplateLiteral(expr.right)) {
                    const template = expr.right;
                    for (let i = 0; i < template.quasis.length; i++) {
                      const quasi = template.quasis[i];
                      const quasiText =
                        quasi.value.cooked ?? quasi.value.raw ?? '';
                      if (!quasiText) continue;

                      const key = `${relativeScopePath}_logic_${logicalIndex}_${opName}_right_quasi_${i}`;
                      if (!fileScopes[key]) {
                        const hash = crypto
                          .createHash('md5')
                          .update(quasiText)
                          .digest('hex');
                        fileScopes[key] = {
                          type: 'element',
                          hash,
                          context: `Logical expression (${op}) right template quasi ${i}`,
                          skip: false,
                          overrides: {},
                          content: quasiText,
                        };
                      }
                    }

                    logicalIndex++;
                    return;
                  }

                  // Other right-hand expressions (identifiers, calls, etc) are intentionally skipped.
                  logicalIndex++;
                });
              }

              // Extract conditional-return function call branches as separate entries.
              // This enables translating runtime call-expressions like: {getMessage(status)}
              // by mapping status -> translated string at runtime.
              //
              // Pattern:
              // - {scopePath}_call_{index}_{funcName}_case_{encodeURIComponent(caseValue)}
              // - {scopePath}_call_{index}_{funcName}_default
              let callIndex = 0;
              path.node.children.forEach((child: any) => {
                if (!t.isJSXExpressionContainer(child)) return;
                const expr = child.expression;
                if (!t.isCallExpression(expr)) return;
                if (!t.isIdentifier(expr.callee)) return;
                const funcName = expr.callee.name;

                const info = functionConditionalReturnScope.get(funcName);
                if (!info) {
                  callIndex++;
                  return;
                }

                for (const [caseValue, returnText] of info.cases) {
                  if (!returnText) continue;
                  const encoded = encodeURIComponent(caseValue);
                  const key = `${relativeScopePath}_call_${callIndex}_${funcName}_case_${encoded}`;
                  if (!fileScopes[key]) {
                    const hash = crypto
                      .createHash('md5')
                      .update(returnText)
                      .digest('hex');
                    fileScopes[key] = {
                      type: 'element',
                      hash,
                      context: `CallExpression ${funcName} case "${caseValue}"`,
                      skip: false,
                      overrides: {},
                      content: returnText,
                    };
                  }
                }

                if (info.defaultReturn) {
                  const key = `${relativeScopePath}_call_${callIndex}_${funcName}_default`;
                  if (!fileScopes[key]) {
                    const hash = crypto
                      .createHash('md5')
                      .update(info.defaultReturn)
                      .digest('hex');
                    fileScopes[key] = {
                      type: 'element',
                      hash,
                      context: `CallExpression ${funcName} default`,
                      skip: false,
                      overrides: {},
                      content: info.defaultReturn,
                    };
                  }
                }

                callIndex++;
              });
            }
          },
        });

        // Third pass: Process JSXAttribute nodes for visible attributes and component props
        // This handles title, alt, aria-* and also string props on custom components
        // (e.g. <Button label="Click me" />) that render user-visible text.
        traverse(ast, {
          JSXAttribute(path: any) {
            const attrName = path.node.name;
            if (!t.isJSXIdentifier(attrName)) return;

            const attrNameStr = attrName.name;

            // Determine which element this attribute belongs to
            const openingElement = t.isJSXOpeningElement(path.parent)
              ? (path.parent as t.JSXOpeningElement)
              : null;

            if (
              !shouldTranslateJsxAttribute(
                attrNameStr,
                openingElement?.name || null
              )
            ) {
              return;
            }

            // Get the attribute value
            const attrValue = path.node.value;

            // Handle string literal attributes: title="Text"
            if (t.isStringLiteral(attrValue)) {
              const content = attrValue.value;
              if (!content.trim()) return;

              const hash = crypto
                .createHash('md5')
                .update(content)
                .digest('hex');
              const fullScopePath = path.getPathLocation();
              const relativeScopePath = getRelativeScopePath(fullScopePath);

              // Use a unique key for attributes to avoid conflicts with element scopes
              const attributeKey = `${relativeScopePath}_attr_${attrNameStr}`;

              fileScopes[attributeKey] = {
                type: 'attribute',
                hash,
                context: `Attribute: ${attrNameStr}`,
                skip: false,
                overrides: {},
                content,
              };
              return;
            }

            // Handle expression attributes: title={variable} or title={`Hello ${name}`}
            if (t.isJSXExpressionContainer(attrValue)) {
              const expr = attrValue.expression;

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
                for (const [key, value] of functionLevelScope) {
                  variableScope.set(key, value);
                }
                for (const [key, value] of functionLevelFunctionScope) {
                  functionReturnScope.set(key, value);
                }
              }

              // Extract content from expression
              const content = extractExpressionContent(
                expr,
                variableScope,
                functionReturnScope
              );

              if (!content.trim()) return;

              const hash = crypto
                .createHash('md5')
                .update(content)
                .digest('hex');
              const fullScopePath = path.getPathLocation();
              const relativeScopePath = getRelativeScopePath(fullScopePath);

              const attributeKey = `${relativeScopePath}_attr_${attrNameStr}`;

              fileScopes[attributeKey] = {
                type: 'attribute',
                hash,
                context: `Attribute: ${attrNameStr}`,
                skip: false,
                overrides: {},
                content,
              };
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
