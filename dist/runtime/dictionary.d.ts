type Dictionary = Record<string, string>;
export declare function loadDictionary(locale: string, outputDir?: string): Dictionary;
export declare function loadDictionaryDefault(locale: string): Dictionary;
export declare function preloadDictionaries(locales: string[], outputDir?: string): void;
export declare function clearDictionaryCache(): void;
export {};
