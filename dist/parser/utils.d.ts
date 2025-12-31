import * as t from '@babel/types';
type VariableScope = Map<string, string>;
type FunctionScope = Map<string, string>;
/**
 * Extracts a readable representation of an expression
 * for translation purposes.
 */
export declare function extractExpressionContent(expression: t.Expression | t.JSXEmptyExpression, variableScope?: VariableScope, functionScope?: FunctionScope): string;
/**
 * Builds a readable content string from a JSXElement node,
 * using pseudo-tags for JSXElements and trimmed text for JSXText.
 */
export declare function buildContent(node: t.JSXElement, variableScope?: VariableScope, functionScope?: FunctionScope): string;
/**
 * Convert full AST path to a relative scope path
 */
export declare function getRelativeScopePath(fullPath: string): string;
export {};
