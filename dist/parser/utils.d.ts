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
/**
 * Translation instruction types
 */
export interface TranslationInstructions {
    translateAttributes: Set<string>;
    translateProps: Set<string>;
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
export declare function parseTranslationInstruction(comment: string): TranslationInstructions | null;
/**
 * Find translation instructions in JSX comments before a JSX element
 * Looks for JSXExpressionContainer with JSXEmptyExpression containing comments
 * @param path - The JSXElement path
 * @param sourceCode - Optional source code to extract comment text directly
 */
export declare function findTranslationInstructions(path: any, sourceCode?: string): TranslationInstructions | null;
export {};
