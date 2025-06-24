import * as t from "@babel/types";
export declare function injectT(scope: string): t.JSXExpressionContainer;
export declare function ensureImportT(ast: t.File): void;
export declare function transformProject(sourceMap: any): Promise<void>;
