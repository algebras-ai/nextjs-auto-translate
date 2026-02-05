import * as t from '@babel/types';
import { ElementPropDescriptor, ScopeMap } from '../types';
type JsxChild = t.JSXElement['children'][number];
export declare function injectTranslated(scope: string, fallbackChildren?: JsxChild[], options?: {
    elementProps?: ElementPropDescriptor[];
    components?: t.Expression;
}): t.JSXElement;
export declare function injectTranslatedWithParams(scope: string, params: Record<string, t.Expression>, fallbackChildren?: JsxChild[], options?: {
    elementProps?: ElementPropDescriptor[];
    components?: t.Expression;
}): t.JSXElement;
export declare function ensureImportTranslated(ast: t.File): void;
export declare function ensureImportUseTranslation(ast: t.File): void;
export declare function ensureImportLocalesSwitcher(ast: t.File): void;
export declare function injectLocaleSwitcher(ast: t.File): void;
export declare function transformProject(code: string, options: {
    sourceMap: ScopeMap;
    filePath: string;
}): any;
export {};
