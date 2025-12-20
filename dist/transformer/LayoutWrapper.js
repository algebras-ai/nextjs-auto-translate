"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapLayoutWithIntl = wrapLayoutWithIntl;
// src/transformer/LayoutWrapper.ts
const generator_1 = __importDefault(require("@babel/generator"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const constants_1 = require("../constants");
const traverse = traverse_1.default.default || traverse_1.default;
const generate = generator_1.default.default || generator_1.default;
function wrapLayoutWithIntl(code, filePath) {
    // Only process app/layout.tsx or app/layout.jsx
    if (!filePath.includes('app/layout.tsx') &&
        !filePath.includes('app/layout.jsx')) {
        return code;
    }
    console.log(`[LayoutWrapper] Processing layout file: ${filePath}`);
    let ast;
    try {
        ast = (0, parser_1.parse)(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
        });
    }
    catch (e) {
        console.warn(`[LayoutWrapper] Failed to parse ${filePath}:`, e);
        return code;
    }
    let hasIntlWrapperImport = false;
    let hasWrapped = false;
    let layoutExportNode = null;
    // Check if IntlWrapper is already imported
    traverse(ast, {
        ImportDeclaration(path) {
            const sourceValue = path.node.source.value;
            // Check for various import paths that might be used
            const isIntlWrapperImport = sourceValue === constants_1.RUNTIME_PATHS.SERVER_INTL_WRAPPER ||
                sourceValue === `${constants_1.RUNTIME_PATHS.SERVER_INTL_WRAPPER.split('/').slice(0, -1).join('/')}`;
            if (isIntlWrapperImport &&
                path.node.specifiers.some((s) => (t.isImportDefaultSpecifier(s) &&
                    t.isIdentifier(s.local) &&
                    s.local.name === 'IntlWrapper') ||
                    (t.isImportSpecifier(s) &&
                        t.isIdentifier(s.imported) &&
                        s.imported.name === 'IntlWrapper'))) {
                hasIntlWrapperImport = true;
                console.log(`[LayoutWrapper] Found existing IntlWrapper import from: ${sourceValue}`);
            }
        },
        ExportDefaultDeclaration(path) {
            layoutExportNode = path;
        },
    });
    // If already has the import, assume it's already wrapped
    if (hasIntlWrapperImport) {
        return code;
    }
    // Add IntlWrapper import
    const intlWrapperImport = t.importDeclaration([t.importDefaultSpecifier(t.identifier('IntlWrapper'))], t.stringLiteral(constants_1.RUNTIME_PATHS.SERVER_INTL_WRAPPER));
    ast.program.body.unshift(intlWrapperImport);
    // Wrap the layout's children with IntlWrapper
    traverse(ast, {
        ExportDefaultDeclaration(path) {
            if (hasWrapped)
                return;
            const declaration = path.node.declaration;
            // Handle function declaration
            if (t.isFunctionDeclaration(declaration) ||
                t.isArrowFunctionExpression(declaration)) {
                const funcNode = t.isFunctionDeclaration(declaration)
                    ? declaration
                    : declaration;
                traverse(funcNode, {
                    JSXElement(bodyPath) {
                        const openingElement = bodyPath.node.openingElement;
                        // Find the <body> element
                        if (t.isJSXIdentifier(openingElement.name) &&
                            openingElement.name.name === 'body') {
                            const bodyChildren = bodyPath.node.children;
                            // Check if IntlWrapper is already there
                            const hasIntlWrapper = bodyChildren.some((child) => t.isJSXElement(child) &&
                                t.isJSXIdentifier(child.openingElement.name) &&
                                child.openingElement.name.name === 'IntlWrapper');
                            if (!hasIntlWrapper) {
                                // Wrap children with IntlWrapper
                                const intlWrapperElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('IntlWrapper'), [], false), t.jsxClosingElement(t.jsxIdentifier('IntlWrapper')), bodyChildren, false);
                                bodyPath.node.children = [intlWrapperElement];
                                hasWrapped = true;
                            }
                        }
                    },
                }, path.scope, path.state);
            }
        },
    });
    const output = generate(ast, {
        retainLines: true,
        retainFunctionParens: true,
    });
    return output.code;
}
