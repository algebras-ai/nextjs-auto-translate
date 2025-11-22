// src/transformer/LayoutWrapper.ts
import generateDefault from "@babel/generator";
import { parse } from "@babel/parser";
import traverseDefault from "@babel/traverse";
import * as t from "@babel/types";
const traverse = traverseDefault.default || traverseDefault;
const generate = generateDefault.default || generateDefault;
export function wrapLayoutWithIntl(code, filePath) {
    // Only process app/layout.tsx or app/layout.jsx
    if (!filePath.includes("app/layout.tsx") && !filePath.includes("app/layout.jsx")) {
        return code;
    }
    let ast;
    try {
        ast = parse(code, {
            sourceType: "module",
            plugins: ["jsx", "typescript"]
        });
    }
    catch (e) {
        console.warn(`[LayoutWrapper] Failed to parse ${filePath}:`, e);
        return code;
    }
    let hasIntlWrapperImport = false;
    let hasLocaleSwitcherImport = false;
    let hasWrapped = false;
    let layoutExportNode = null;
    // Check if IntlWrapper is already imported
    traverse(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value === "algebras-auto-intl/runtime/server/IntlWrapper" ||
                path.node.source.value === "algebras-auto-intl/runtime/server" ||
                path.node.source.value.includes("IntlWrapper")) {
                hasIntlWrapperImport = true;
            }
            if (path.node.source.value === "algebras-auto-intl/runtime/client/components/LocaleSwitcher" ||
                path.node.source.value.includes("LocaleSwitcher")) {
                hasLocaleSwitcherImport = true;
            }
        },
        ExportDefaultDeclaration(path) {
            layoutExportNode = path;
        }
    });
    // If already has both imports, assume it's already wrapped
    if (hasIntlWrapperImport && hasLocaleSwitcherImport) {
        return code;
    }
    // Add IntlWrapper import if not present
    if (!hasIntlWrapperImport) {
        const intlWrapperImport = t.importDeclaration([t.importDefaultSpecifier(t.identifier("IntlWrapper"))], t.stringLiteral("algebras-auto-intl/runtime/server/IntlWrapper"));
        ast.program.body.unshift(intlWrapperImport);
    }
    // Add LocaleSwitcher import if not present (as dynamic import for client component)
    if (!hasLocaleSwitcherImport) {
        // We'll inject it as a client component inline, so we don't need to import it here
        // The LocaleSwitcher will be wrapped in a client component boundary
    }
    // Wrap the layout's children with IntlWrapper
    traverse(ast, {
        ExportDefaultDeclaration(path) {
            if (hasWrapped)
                return;
            const declaration = path.node.declaration;
            // Handle function declaration
            if (t.isFunctionDeclaration(declaration) || t.isArrowFunctionExpression(declaration)) {
                const funcNode = t.isFunctionDeclaration(declaration) ? declaration : declaration;
                traverse(funcNode, {
                    JSXElement(bodyPath) {
                        const openingElement = bodyPath.node.openingElement;
                        // Find the <body> element
                        if (t.isJSXIdentifier(openingElement.name) &&
                            openingElement.name.name === "body") {
                            const bodyChildren = bodyPath.node.children;
                            // Check if IntlWrapper is already there
                            const hasIntlWrapper = bodyChildren.some((child) => t.isJSXElement(child) &&
                                t.isJSXIdentifier(child.openingElement.name) &&
                                child.openingElement.name.name === "IntlWrapper");
                            if (!hasIntlWrapper) {
                                // LocaleSwitcher is now included in IntlWrapper, so we don't need to inject it here
                                // Just wrap children with IntlWrapper
                                // Wrap children with IntlWrapper (LocaleSwitcher is included in IntlWrapper)
                                const intlWrapperElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier("IntlWrapper"), [], false), t.jsxClosingElement(t.jsxIdentifier("IntlWrapper")), bodyChildren, false);
                                bodyPath.node.children = [intlWrapperElement];
                                hasWrapped = true;
                            }
                            // LocaleSwitcher is now included in IntlWrapper, so no need to add it separately
                        }
                    }
                }, path.scope, path.state);
            }
        }
    });
    const output = generate(ast, {
        retainLines: true,
        retainFunctionParens: true
    });
    return output.code;
}
