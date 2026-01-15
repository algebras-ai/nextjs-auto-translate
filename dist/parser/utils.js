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
exports.extractExpressionContent = extractExpressionContent;
exports.buildContent = buildContent;
exports.getRelativeScopePath = getRelativeScopePath;
exports.parseTranslationInstruction = parseTranslationInstruction;
exports.findTranslationInstructions = findTranslationInstructions;
const t = __importStar(require("@babel/types"));
/**
 * Checks if an expression node can produce a string output
 * that should be translated.
 */
function isTranslatableExpression(expression) {
    if (t.isJSXEmptyExpression(expression)) {
        return false;
    }
    // Direct string literals
    if (t.isStringLiteral(expression)) {
        return true;
    }
    // Template literals (e.g., `Hello ${name}`)
    if (t.isTemplateLiteral(expression)) {
        return true;
    }
    // Conditional expressions (e.g., condition ? 'Yes' : 'No')
    if (t.isConditionalExpression(expression)) {
        return (isTranslatableExpression(expression.consequent) ||
            isTranslatableExpression(expression.alternate));
    }
    // Logical expressions (e.g., show && 'Text')
    if (t.isLogicalExpression(expression)) {
        return (isTranslatableExpression(expression.left) ||
            isTranslatableExpression(expression.right));
    }
    // Binary expressions - string concatenation (e.g., 'Hello ' + name)
    if (t.isBinaryExpression(expression) && expression.operator === '+') {
        const leftIsValid = t.isExpression(expression.left) &&
            isTranslatableExpression(expression.left);
        const rightIsValid = t.isExpression(expression.right) &&
            isTranslatableExpression(expression.right);
        return leftIsValid || rightIsValid;
    }
    // Function calls that might return strings
    // But skip array methods like map(), filter(), forEach() - they return JSX elements
    if (t.isCallExpression(expression)) {
        // Check if it's an array method call
        if (t.isMemberExpression(expression.callee)) {
            const memberExpr = expression.callee;
            if (t.isIdentifier(memberExpr.property)) {
                const methodName = memberExpr.property.name;
                const arrayMethods = [
                    'map',
                    'filter',
                    'forEach',
                    'reduce',
                    'find',
                    'some',
                    'every',
                ];
                if (arrayMethods.includes(methodName)) {
                    // Skip array methods - they don't return translatable strings
                    return false;
                }
            }
        }
        return true;
    }
    // Variables that might contain strings
    // But skip React prop identifiers like 'children' which are not translatable strings
    if (t.isIdentifier(expression)) {
        // Skip common React prop names that should never be translated
        const reactPropNames = ['children', 'className', 'id', 'key', 'ref'];
        if (reactPropNames.includes(expression.name)) {
            return false;
        }
        return true;
    }
    return false;
}
/**
 * Resolves an identifier to its string literal value if available in scope
 */
function resolveIdentifierValue(identifier, variableScope) {
    const varName = identifier.name;
    if (variableScope.has(varName)) {
        return variableScope.get(varName);
    }
    return null;
}
/**
 * Resolves a function call to its string literal return value if available in scope
 */
function resolveFunctionCall(callExpression, functionScope) {
    if (t.isIdentifier(callExpression.callee)) {
        const funcName = callExpression.callee.name;
        if (functionScope.has(funcName)) {
            return functionScope.get(funcName);
        }
    }
    return null;
}
/**
 * Resolves a member function call like obj.getText() to its string literal return value,
 * when we recorded it as a deterministic object-literal method (keyed as "obj.getText").
 */
function resolveMemberFunctionCall(callExpression, functionScope) {
    if (!t.isMemberExpression(callExpression.callee))
        return null;
    const callee = callExpression.callee;
    if (callee.computed)
        return null;
    if (!t.isIdentifier(callee.object))
        return null;
    if (!t.isIdentifier(callee.property))
        return null;
    const key = `${callee.object.name}.${callee.property.name}`;
    if (functionScope.has(key)) {
        return functionScope.get(key);
    }
    return null;
}
/**
 * Extracts a readable representation of an expression
 * for translation purposes.
 */
function extractExpressionContent(expression, variableScope = new Map(), functionScope = new Map()) {
    if (t.isJSXEmptyExpression(expression)) {
        return '';
    }
    // String literal - return the value
    if (t.isStringLiteral(expression)) {
        return expression.value;
    }
    // Template literal - build representation
    // Resolve static variables directly, keep runtime variables as placeholders
    if (t.isTemplateLiteral(expression)) {
        let content = '';
        for (let i = 0; i < expression.quasis.length; i++) {
            content += expression.quasis[i].value.raw;
            if (i < expression.expressions.length) {
                const expr = expression.expressions[i];
                if (t.isIdentifier(expr)) {
                    // Check if this is a static variable (in scope)
                    const varValue = variableScope.get(expr.name);
                    if (varValue !== undefined) {
                        // Static variable: resolve directly
                        content += varValue;
                    }
                    else {
                        // Runtime variable: use placeholder
                        content += `{${expr.name}}`;
                    }
                }
                else {
                    // Complex expression: use placeholder
                    content += `{expr}`;
                }
            }
        }
        return content;
    }
    // Conditional expression - extract both branches
    // Extract both string values so they can be translated
    // Format preserves both values with a clear separator
    if (t.isConditionalExpression(expression)) {
        const consequent = extractExpressionContent(expression.consequent, variableScope, functionScope);
        const alternate = extractExpressionContent(expression.alternate, variableScope, functionScope);
        if (consequent && alternate) {
            // Return both strings with a clear conditional format
            // This format makes it clear these are two separate translatable strings
            // that belong to a conditional expression
            return `{? "${consequent}" : "${alternate}"}`;
        }
        else if (consequent) {
            return consequent;
        }
        else if (alternate) {
            return alternate;
        }
    }
    // Logical expression - extract the string part
    if (t.isLogicalExpression(expression)) {
        const left = extractExpressionContent(expression.left, variableScope, functionScope);
        const right = extractExpressionContent(expression.right, variableScope, functionScope);
        if (expression.operator === '&&' && right) {
            // For logical AND, the right side is the string that gets rendered
            // Return just the string value - the condition (left) doesn't need translation
            return right;
        }
        if (expression.operator === '||') {
            // For logical OR, return whichever side has a string value
            return left || right;
        }
    }
    // Binary expression - string concatenation
    if (t.isBinaryExpression(expression) && expression.operator === '+') {
        const left = t.isExpression(expression.left)
            ? extractExpressionContent(expression.left, variableScope, functionScope)
            : '';
        const right = t.isExpression(expression.right)
            ? extractExpressionContent(expression.right, variableScope, functionScope)
            : '';
        return left + right;
    }
    // Member expression - method calls
    if (t.isMemberExpression(expression) &&
        !t.isPrivateName(expression.property)) {
        // Member expressions like `scenario.title` or `data.title` are runtime values.
        // We must NOT convert them into placeholders like `{variable.title()}`
        // because that would replace actual runtime output with unresolved text.
        //
        // If you want these values translated, translate them at the origin where
        // the string literal exists (or extend scope analysis to resolve them).
        return '';
    }
    // Call expression - function calls
    if (t.isCallExpression(expression)) {
        // Handle method calls like text.toUpperCase()
        if (t.isMemberExpression(expression.callee)) {
            // First: resolve deterministic object-literal method calls (e.g. obj.getText() -> "Text")
            const resolvedMemberCall = resolveMemberFunctionCall(expression, functionScope);
            if (resolvedMemberCall !== null) {
                return resolvedMemberCall;
            }
            const memberExpr = expression.callee;
            // Check if object is an identifier (variable)
            if (t.isIdentifier(memberExpr.object)) {
                const varName = memberExpr.object.name;
                // Try to resolve the variable value
                const resolvedValue = resolveIdentifierValue(memberExpr.object, variableScope);
                if (resolvedValue !== null && t.isIdentifier(memberExpr.property)) {
                    const methodName = memberExpr.property.name;
                    // Try to call common string methods on the resolved value
                    try {
                        let result = null;
                        switch (methodName) {
                            case 'toUpperCase':
                                result = resolvedValue.toUpperCase();
                                break;
                            case 'toLowerCase':
                                result = resolvedValue.toLowerCase();
                                break;
                            case 'trim':
                                result = resolvedValue.trim();
                                break;
                            case 'trimStart':
                            case 'trimLeft':
                                result = resolvedValue.trimStart();
                                break;
                            case 'trimEnd':
                            case 'trimRight':
                                result = resolvedValue.trimEnd();
                                break;
                            case 'substring': {
                                const [start, end] = expression.arguments;
                                if (start &&
                                    t.isNumericLiteral(start) &&
                                    (!end || t.isNumericLiteral(end))) {
                                    result = resolvedValue.substring(start.value, end?.value);
                                }
                                break;
                            }
                            case 'slice': {
                                const [start, end] = expression.arguments;
                                if ((!start || t.isNumericLiteral(start)) &&
                                    (!end || t.isNumericLiteral(end))) {
                                    const startVal = start && t.isNumericLiteral(start)
                                        ? start.value
                                        : undefined;
                                    const endVal = end && t.isNumericLiteral(end) ? end.value : undefined;
                                    result = resolvedValue.slice(startVal, endVal);
                                }
                                break;
                            }
                            case 'replace': {
                                const [searchValue, replaceValue] = expression.arguments;
                                // Keep this intentionally conservative: only string-to-string replace with literal args.
                                if (searchValue &&
                                    replaceValue &&
                                    t.isStringLiteral(searchValue) &&
                                    t.isStringLiteral(replaceValue)) {
                                    result = resolvedValue.replace(searchValue.value, replaceValue.value);
                                }
                                break;
                            }
                            default:
                                // Unsupported/unknown method: don't guess.
                                // Returning the original string would create a wrong translation entry and replace runtime output.
                                result = null;
                        }
                        if (result !== null) {
                            return result;
                        }
                    }
                    catch {
                        // If method call fails, fall through to default handling
                    }
                }
            }
            // Fallback: return method call format
            if (t.isIdentifier(memberExpr.property)) {
                // If we can't resolve this method call deterministically at build time,
                // don't emit placeholders like `{obj.method()}`. They would end up
                // rendered literally and/or replace real runtime output.
                return '';
            }
        }
        // Handle regular function calls
        // Skip array methods like map(), filter(), forEach() - they return JSX elements, not strings
        if (t.isMemberExpression(expression.callee)) {
            const memberExpr = expression.callee;
            if (t.isIdentifier(memberExpr.property)) {
                const methodName = memberExpr.property.name;
                const arrayMethods = [
                    'map',
                    'filter',
                    'forEach',
                    'reduce',
                    'find',
                    'some',
                    'every',
                ];
                if (arrayMethods.includes(methodName)) {
                    // Skip array methods - they don't return translatable strings
                    return '';
                }
            }
        }
        // Try to resolve function call to its return value
        if (t.isIdentifier(expression.callee)) {
            const resolvedValue = resolveFunctionCall(expression, functionScope);
            if (resolvedValue !== null) {
                // Return the actual string value instead of function call
                return resolvedValue;
            }
            // If we can't resolve the return value at build time, do NOT emit a placeholder
            // like "{fn()}" because the injector would replace runtime output and break UI.
            return '';
        }
    }
    // Identifier - variable reference
    // Try to resolve to string literal value
    if (t.isIdentifier(expression)) {
        // Skip React prop identifiers - these are not translatable strings
        // They are props passed to components, not user-facing text
        const reactPropNames = ['children', 'className', 'id', 'key', 'ref'];
        if (reactPropNames.includes(expression.name)) {
            return ''; // Don't extract React props as translatable strings
        }
        const resolvedValue = resolveIdentifierValue(expression, variableScope);
        if (resolvedValue !== null) {
            // Return the actual string value instead of variable name
            return resolvedValue;
        }
        // If we can't resolve the value at build time, do NOT emit a placeholder
        // because the injector would replace runtime output and break UI.
        return '';
    }
    return '';
}
/**
 * Builds a readable content string from a JSXElement node,
 * using pseudo-tags for JSXElements and trimmed text for JSXText.
 */
function buildContent(node, variableScope = new Map(), functionScope = new Map()) {
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
            // Handle JSXExpressionContainer nodes
            // This includes: string literals, template literals, ternaries, logical expressions, etc.
            const expression = child.expression;
            if (isTranslatableExpression(expression)) {
                const content = extractExpressionContent(expression, variableScope, functionScope);
                if (content) {
                    out += content;
                }
            }
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
                const inner = buildContent(child, variableScope, functionScope);
                out += inner;
            }
            else {
                // Recursively build inner content if needed
                const inner = buildContent(child, variableScope, functionScope);
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
function mergeTranslationInstructions(target, next) {
    for (const a of next.translateAttributes)
        target.translateAttributes.add(a);
    for (const p of next.translateProps)
        target.translateProps.add(p);
}
function getInstructionFromCommentText(commentText) {
    if (!commentText)
        return null;
    // Try parsing the whole text first
    const direct = parseTranslationInstruction(commentText);
    if (direct)
        return direct;
    // Fallback: extract directive substring if extra text exists
    const match = commentText.match(/@algb-translate-(?:attr-[\w-]+|props-\[[^\]]+\])/);
    if (!match)
        return null;
    return parseTranslationInstruction(match[0]);
}
function extractInstructionFromJsxCommentSibling(sibling, sourceCode) {
    if (!t.isJSXEmptyExpression(sibling.expression))
        return null;
    const emptyExpr = sibling.expression;
    const commentBuckets = [
        ...(emptyExpr.leadingComments ?? []),
        ...(emptyExpr.innerComments ?? []),
        ...(emptyExpr.trailingComments ?? []),
        ...(sibling.leadingComments ?? []),
        ...(sibling.innerComments ?? []),
        ...(sibling.trailingComments ?? []),
    ];
    for (const c of commentBuckets) {
        const comment = c;
        if (!comment || comment.type !== 'CommentBlock')
            continue;
        const instr = getInstructionFromCommentText(comment.value);
        if (instr)
            return instr;
    }
    // Last resort: slice raw source for this JSXExpressionContainer and look for directive.
    if (sourceCode && sibling.loc?.start && sibling.loc?.end) {
        try {
            const lines = sourceCode.split('\n');
            const startLine = sibling.loc.start.line - 1;
            const endLine = sibling.loc.end.line - 1;
            const startCol = sibling.loc.start.column;
            const endCol = sibling.loc.end.column;
            let slice = '';
            if (startLine === endLine) {
                const line = lines[startLine] ?? '';
                slice = line.substring(startCol, endCol);
            }
            else {
                for (let i = startLine; i <= endLine; i++) {
                    const line = lines[i] ?? '';
                    if (i === startLine)
                        slice += line.substring(startCol);
                    else if (i === endLine)
                        slice += '\n' + line.substring(0, endCol);
                    else
                        slice += '\n' + line;
                }
            }
            return getInstructionFromCommentText(slice);
        }
        catch {
            // ignore
        }
    }
    return null;
}
/**
 * Parse translation instruction comments
 * Supports:
 * - @algb-translate-attr-placeholder (in JSX comment)
 * - @algb-translate-props-[title,description] (in JSX comment)
 *
 * Example JSX comments:
 * {/ * @algb-translate-attr-placeholder * /}
 * {/ * @algb-translate-props-[title,description] * /}
 */
function parseTranslationInstruction(comment) {
    // Remove comment markers if present
    let trimmed = comment.trim();
    // Remove /* and */ if they're part of the comment value
    trimmed = trimmed
        .replace(/^\/\*+/, '')
        .replace(/\*+\/$/, '')
        .trim();
    // Match: @algb-translate-attr-{attrName}
    // Allow hyphenated/colon attrs like aria-label, xlink:href, etc.
    const attrMatch = trimmed.match(/@algb-translate-attr-([A-Za-z][\w:-]*)/);
    if (attrMatch) {
        return {
            translateAttributes: new Set([attrMatch[1]]),
            translateProps: new Set(),
        };
    }
    // Match: @algb-translate-props-[prop1,prop2,...]
    const propsMatch = trimmed.match(/@algb-translate-props-\[([^\]]+)\]/);
    if (propsMatch) {
        const props = propsMatch[1]
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean);
        return {
            translateAttributes: new Set(),
            translateProps: new Set(props),
        };
    }
    return null;
}
/**
 * Find translation instructions in JSX comments before a JSX element
 * Looks for JSXExpressionContainer with JSXEmptyExpression containing comments
 * @param path - The JSXElement path
 * @param sourceCode - Optional source code to extract comment text directly
 */
function findTranslationInstructions(path, sourceCode) {
    const parent = path.parentPath;
    const parentNode = parent?.node;
    const children = parentNode?.children;
    if (!Array.isArray(children))
        return null;
    const currentIndex = children.findIndex((child) => child === path.node);
    if (currentIndex < 0)
        return null;
    const combined = {
        translateAttributes: new Set(),
        translateProps: new Set(),
    };
    // Scan backwards only over immediately preceding "whitespace or JSX comment" siblings.
    for (let i = currentIndex - 1; i >= 0; i--) {
        const sibling = children[i];
        // Skip whitespace-only JSXText
        if (t.isJSXText(sibling) && !sibling.value.trim()) {
            continue;
        }
        // Parse JSX comment containers: {/* ... */}
        if (t.isJSXExpressionContainer(sibling) &&
            t.isJSXEmptyExpression(sibling.expression)) {
            const instr = extractInstructionFromJsxCommentSibling(sibling, sourceCode);
            if (instr)
                mergeTranslationInstructions(combined, instr);
            continue;
        }
        // Stop on first non-comment / non-whitespace node.
        break;
    }
    if (combined.translateAttributes.size === 0 &&
        combined.translateProps.size === 0) {
        return null;
    }
    return combined;
}
