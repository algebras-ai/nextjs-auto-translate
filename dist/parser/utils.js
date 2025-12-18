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
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContent = buildContent;
exports.getRelativeScopePath = getRelativeScopePath;
const t = __importStar(require("@babel/types"));
/**
 * Builds a readable content string from a JSXElement node,
 * using pseudo-tags for JSXElements and trimmed text for JSXText.
 */
function buildContent(node) {
    let out = '';
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const prevChild = i > 0 ? children[i - 1] : null;
        const nextChild = i < children.length - 1 ? children[i + 1] : null;
        if (t.isJSXText(child)) {
            const text = child.value;
            // Preserve leading space if this text comes after an element or expression
            const hasLeadingSpace = /^\s/.test(text);
            const shouldPreserveLeadingSpace = hasLeadingSpace &&
                prevChild &&
                (t.isJSXElement(prevChild) || t.isJSXExpressionContainer(prevChild));
            // Preserve trailing space if this text comes before an element or expression
            const hasTrailingSpace = /\s$/.test(text);
            const shouldPreserveTrailingSpace = hasTrailingSpace &&
                nextChild &&
                (t.isJSXElement(nextChild) || t.isJSXExpressionContainer(nextChild));
            let processedText = text;
            if (shouldPreserveLeadingSpace && shouldPreserveTrailingSpace) {
                // Keep as-is (has spaces on both sides that are meaningful)
                processedText = text;
            }
            else if (shouldPreserveLeadingSpace) {
                // Preserve leading space, trim trailing
                processedText = text.trimEnd();
            }
            else if (shouldPreserveTrailingSpace) {
                // Preserve trailing space, trim leading
                processedText = text.trimStart();
            }
            else {
                // No meaningful spaces, trim both sides
                processedText = text.trim();
            }
            if (processedText)
                out += processedText;
        }
        else if (t.isJSXExpressionContainer(child)) {
            // Handle JSXExpressionContainer nodes (e.g., {" "} for preserving spaces)
            // This is crucial for preserving spaces between text and elements
            const expression = child.expression;
            if (t.isStringLiteral(expression)) {
                // Extract string literal value (e.g., " " from {" "})
                // This preserves explicit spaces that developers add
                out += expression.value;
            }
            // Ignore other expression types (variables, function calls, etc.)
        }
        else if (t.isJSXElement(child)) {
            const nameNode = child.openingElement.name;
            let name = 'Unknown';
            if (t.isJSXIdentifier(nameNode)) {
                name = nameNode.name;
            }
            else if (t.isJSXMemberExpression(nameNode)) {
                name = nameNode.property.name;
            }
            // Skip <p> tags - just include their content directly without the element wrapper
            if (name === 'p') {
                const inner = buildContent(child);
                out += inner;
            }
            else {
                // Recursively build inner content if needed
                const inner = buildContent(child);
                out += `<element:${name}>${inner}</element:${name}>`;
            }
        }
    }
    return out;
}
/**
 * Convert full AST path to a relative scope path
 */
function getRelativeScopePath(fullPath) {
    // Extract the meaningful part of the path after "program.body"
    const parts = fullPath.split('.');
    const bodyIndex = parts.findIndex((part) => part === 'body');
    if (bodyIndex !== -1 && parts[bodyIndex - 1] === 'program') {
        // Take everything after "program.body"
        const relativeParts = parts.slice(bodyIndex + 1);
        return relativeParts.join('/').replace(/\[(\d+)\]/g, '$1');
    }
    // Fallback: use the full path but clean it up
    return fullPath.replace(/\[(\d+)\]/g, '$1').replace(/\./g, '/');
}
