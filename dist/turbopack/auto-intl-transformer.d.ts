import { ScopeMap } from "../types.js";
interface TransformerOptions {
    sourceMap?: ScopeMap;
    outputDir?: string;
}
/**
 * Turbopack transformer for auto-intl
 * Transforms JSX files to inject Translated components and wrap layouts with AlgebrasIntlProvider
 *
 * @param source - The source code to transform
 * @param context - Turbopack transformer context containing file path and options
 * @returns Transformed source code
 */
export default function transformer(source: string, context: {
    path: string;
    options?: TransformerOptions;
}): string;
export {};
