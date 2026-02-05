// types.ts
export type ElementPropDescriptor = {
  tag: string;
  props: Record<string, unknown>;
};

export type ScopeData = {
  type: 'text' | 'element' | 'attribute';
  hash: string;
  context: string;
  skip: boolean;
  overrides: Record<string, string>;
  content: string;
  /** For element scopes: tag + props for each <element:...> in content (same order). */
  elementProps?: ElementPropDescriptor[];
};

export type FileScopes = {
  scopes: {
    [scope: string]: ScopeData;
  };
};

export type ScopeMap = {
  version?: number;
  files: {
    [filePath: string]: FileScopes;
  };
};

export type Dictionary = {
  [locale: string]: {
    [scope: string]: string;
  };
};

export interface ParserOptions {
  includeNodeModules?: boolean;
  outputDir?: string;
}
