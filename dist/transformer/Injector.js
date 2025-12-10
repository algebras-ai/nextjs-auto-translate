import generateDefault from '@babel/generator';
import { parse } from '@babel/parser';
import traverseDefault from '@babel/traverse';
import * as t from '@babel/types';
import path from 'path';
// @babel/traverse and @babel/generator have different exports for ESM vs CommonJS
const traverse = traverseDefault.default || traverseDefault;
const generate = generateDefault.default || generateDefault;
// Injects <Translated tKey="scope" /> in place of JSXText
export function injectTranslated(scope) {
    return t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('Translated'), [t.jsxAttribute(t.jsxIdentifier('tKey'), t.stringLiteral(scope))], true // self-closing
    ), null, [], true);
}
// Ensures import Translated from 'algebras-auto-intl/runtime/client/components/Translated' exists
export function ensureImportTranslated(ast) {
    let hasImport = false;
    traverse(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value ===
                'nextjs-auto-intl/runtime/client/components/Translated' &&
                path.node.specifiers.some((s) => t.isImportDefaultSpecifier(s) &&
                    t.isIdentifier(s.local) &&
                    s.local.name === 'Translated')) {
                hasImport = true;
                path.stop();
            }
        },
    });
    if (!hasImport) {
        const importDecl = t.importDeclaration([t.importDefaultSpecifier(t.identifier('Translated'))], t.stringLiteral('nextjs-auto-intl/runtime/client/components/Translated'));
        ast.program.body.unshift(importDecl);
    }
}
// Ensures import LocalesSwitcher exists
export function ensureImportLocalesSwitcher(ast) {
    let hasImport = false;
    traverse(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value ===
                'nextjs-auto-intl/runtime/client/components/LocaleSwitcher' &&
                path.node.specifiers.some((s) => t.isImportDefaultSpecifier(s) &&
                    t.isIdentifier(s.local) &&
                    s.local.name === 'LocalesSwitcher')) {
                hasImport = true;
                path.stop();
            }
        },
    });
    if (!hasImport) {
        const importDecl = t.importDeclaration([t.importDefaultSpecifier(t.identifier('LocalesSwitcher'))], t.stringLiteral('nextjs-auto-intl/runtime/client/components/LocaleSwitcher'));
        ast.program.body.unshift(importDecl);
    }
}
// Create the language switcher element
function createSwitcherElement() {
    return t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('div'), [
        t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('fixed top-4 right-4 z-[9999]')),
    ], false), t.jsxClosingElement(t.jsxIdentifier('div')), [
        t.jsxText('\n          '),
        t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('LocalesSwitcher'), [], true), null, [], true),
        t.jsxText('\n        '),
    ], false);
}
// Inject LocalesSwitcher into the page component's return statement
export function injectLocaleSwitcher(ast) {
    let injected = false;
    // Strategy 1: Find return statement and inject into its JSX
    traverse(ast, {
        ReturnStatement(path) {
            if (injected)
                return;
            const returnArg = path.node.argument;
            // If return has a JSX element, try to inject into it
            if (t.isJSXElement(returnArg)) {
                const switcherElement = createSwitcherElement();
                // Try to inject as first child
                if (Array.isArray(returnArg.children)) {
                    returnArg.children.unshift(t.jsxText('\n        '), switcherElement);
                    injected = true;
                    path.stop();
                }
            }
            // If return has a JSX fragment, inject into it
            else if (t.isJSXFragment(returnArg)) {
                const switcherElement = createSwitcherElement();
                if (Array.isArray(returnArg.children)) {
                    returnArg.children.unshift(t.jsxText('\n        '), switcherElement);
                    injected = true;
                    path.stop();
                }
            }
            // If return has a parenthesized expression (common in JSX), unwrap and try again
            else if (t.isParenthesizedExpression(returnArg) &&
                t.isJSXElement(returnArg.expression)) {
                const jsxElement = returnArg.expression;
                const switcherElement = createSwitcherElement();
                if (Array.isArray(jsxElement.children)) {
                    jsxElement.children.unshift(t.jsxText('\n        '), switcherElement);
                    injected = true;
                    path.stop();
                }
            }
        },
    });
    // Strategy 2: Handle arrow function expressions (common in Next.js pages)
    if (!injected) {
        traverse(ast, {
            ArrowFunctionExpression(path) {
                if (injected)
                    return;
                const body = path.node.body;
                // If arrow function returns JSX directly
                if (t.isJSXElement(body)) {
                    const switcherElement = createSwitcherElement();
                    if (Array.isArray(body.children)) {
                        body.children.unshift(t.jsxText('\n        '), switcherElement);
                        injected = true;
                        path.stop();
                    }
                }
                // If arrow function returns a fragment
                else if (t.isJSXFragment(body)) {
                    const switcherElement = createSwitcherElement();
                    if (Array.isArray(body.children)) {
                        body.children.unshift(t.jsxText('\n        '), switcherElement);
                        injected = true;
                        path.stop();
                    }
                }
                // If arrow function returns parenthesized JSX
                else if (t.isParenthesizedExpression(body) &&
                    t.isJSXElement(body.expression)) {
                    const jsxElement = body.expression;
                    const switcherElement = createSwitcherElement();
                    if (Array.isArray(jsxElement.children)) {
                        jsxElement.children.unshift(t.jsxText('\n        '), switcherElement);
                        injected = true;
                        path.stop();
                    }
                }
            },
        });
    }
    // Strategy 3: If we didn't find a return statement, try to find any JSX element
    // (fallback for different patterns)
    if (!injected) {
        traverse(ast, {
            JSXElement(path) {
                if (injected)
                    return;
                const openingElement = path.node.openingElement;
                const tagName = openingElement.name;
                // Look for common container elements: main, section, div, article
                if (t.isJSXIdentifier(tagName) &&
                    (tagName.name === 'main' ||
                        tagName.name === 'section' ||
                        tagName.name === 'div' ||
                        tagName.name === 'article')) {
                    const switcherElement = createSwitcherElement();
                    // Inject as first child
                    if (Array.isArray(path.node.children)) {
                        path.node.children.unshift(t.jsxText('\n        '), switcherElement);
                        injected = true;
                        path.stop();
                    }
                }
            },
        });
    }
    // Strategy 4: If still not injected, wrap the entire return in a fragment
    if (!injected) {
        traverse(ast, {
            ReturnStatement(path) {
                if (injected)
                    return;
                const returnArg = path.node.argument;
                const switcherElement = createSwitcherElement();
                // Wrap return value in a fragment with the switcher
                const fragment = t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), [switcherElement, t.jsxText('\n        '), returnArg]);
                path.node.argument = fragment;
                injected = true;
                path.stop();
            },
        });
    }
    // Log if injection failed (for debugging)
    if (!injected) {
        console.warn('[AutoIntl] Failed to inject LocaleSwitcher - no suitable injection point found');
    }
}
// Transforms the specified file, injecting t() calls
export function transformProject(code, options) {
    const { filePath } = options;
    // Normalize path to match sourceMap format (forward slashes)
    const relativePath = path
        .relative(process.cwd(), filePath)
        .split(path.sep)
        .join('/');
    const isPageFile = relativePath.includes('page.tsx') || relativePath.includes('page.jsx');
    const isInSourceMap = options.sourceMap.files && options.sourceMap.files[relativePath];
    // For page files, always parse AST to inject language switcher
    // For other files, only process if they exist in sourceMap
    if (!isPageFile && !isInSourceMap) {
        return code;
    }
    let ast;
    try {
        ast = parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
        });
    }
    catch (e) {
        console.warn(`[Injector] Failed to parse ${relativePath}:`, e);
        return code;
    }
    let changed = false;
    // Only do text transformation if file is in sourceMap
    if (isInSourceMap) {
        const fileScopes = options.sourceMap.files[relativePath]?.scopes || {};
        const processedElements = new Set();
        // First pass: Replace entire elements that have scope entries
        // This handles cases where an element contains both text and nested elements
        traverse(ast, {
            JSXElement(path) {
                const scopePath = path
                    .getPathLocation()
                    .replace(/\[(\d+)\]/g, '$1')
                    .replace(/\./g, '/');
                if (!fileScopes[scopePath])
                    return;
                if (processedElements.has(scopePath))
                    return;
                // Check if any ancestor element also has a scope entry
                // If so, this element is nested inside it and shouldn't be replaced separately
                let parentPath = path.parentPath;
                while (parentPath) {
                    if (parentPath.isJSXElement && parentPath.isJSXElement()) {
                        const parentScopePath = parentPath
                            .getPathLocation()
                            .replace(/\[(\d+)\]/g, '$1')
                            .replace(/\./g, '/');
                        if (fileScopes[parentScopePath]) {
                            return;
                        }
                    }
                    parentPath = parentPath.parentPath;
                }
                // Check if this element has JSXText children (meaning it should be replaced)
                const hasText = path.node.children.some((child) => t.isJSXText(child) && child.value.trim());
                if (hasText) {
                    // Replace all children with a single Translated component
                    path.node.children = [
                        injectTranslated(`${relativePath}::${scopePath}`),
                    ];
                    processedElements.add(scopePath);
                    changed = true;
                }
            },
        });
        // Second pass: Handle any remaining JSXText nodes that weren't part of replaced elements
        traverse(ast, {
            JSXText(path) {
                const text = path.node.value.trim();
                if (!text)
                    return;
                // Find the closest JSXElement ancestor
                const jsxElement = path.findParent(p => p.isJSXElement());
                if (!jsxElement)
                    return;
                // Find the scope for this element
                const scopePath = jsxElement
                    .getPathLocation()
                    .replace(/\[(\d+)\]/g, '$1')
                    .replace(/\./g, '/');
                // Skip if this element was already processed in the first pass
                if (processedElements.has(scopePath))
                    return;
                if (!fileScopes[scopePath])
                    return;
                // Check if any ancestor element also has a scope entry
                let parentPath = jsxElement.parentPath;
                while (parentPath) {
                    if (parentPath.isJSXElement && parentPath.isJSXElement()) {
                        const parentScopePath = parentPath
                            .getPathLocation()
                            .replace(/\[(\d+)\]/g, '$1')
                            .replace(/\./g, '/');
                        if (fileScopes[parentScopePath]) {
                            return;
                        }
                    }
                    parentPath = parentPath.parentPath;
                }
                // Replace text with <Translated tKey="scope" />
                path.replaceWith(injectTranslated(`${relativePath}::${scopePath}`));
                changed = true;
            },
        });
        // Add Translated import if we made text changes
        if (changed) {
            ensureImportTranslated(ast);
        }
    }
    // Always inject language switcher for page files, regardless of text changes or sourceMap
    if (isPageFile) {
        ensureImportLocalesSwitcher(ast);
        injectLocaleSwitcher(ast);
    }
    // Only regenerate code if we made changes (text transformation or language switcher injection)
    // For page files, we always inject the switcher, so we always need to regenerate
    if (changed || isPageFile) {
        const output = generate(ast, {
            retainLines: true,
            retainFunctionParens: true,
        });
        return output.code;
    }
    return code;
}
