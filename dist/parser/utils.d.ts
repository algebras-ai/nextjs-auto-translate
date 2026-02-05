import * as t from '@babel/types';
type VariableScope = Map<string, string>;
/** Descriptor for a single <element:...> placeholder: tag name + serialized props. */
export type ElementPropDescriptor = {
    tag: string;
    props: Record<string, unknown>;
};
type FunctionScope = Map<string, string>;
/** Result of buildContent: content string and element descriptors in same order as <element:...>. */
export type BuildContentResult = {
    content: string;
    elementProps: ElementPropDescriptor[];
};
/**
 * Extracts a readable representation of an expression
 * for translation purposes.
 */
export declare function extractExpressionContent(expression: t.Expression | t.JSXEmptyExpression, variableScope?: VariableScope, functionScope?: FunctionScope): string;
/**
 * Builds a readable content string from a JSXElement node and collects
 * element descriptors (tag + props) for each <element:...> in the same order.
 */
export declare function buildContent(node: t.JSXElement, variableScope?: VariableScope, functionScope?: FunctionScope): BuildContentResult;
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
