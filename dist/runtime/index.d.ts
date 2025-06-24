export { loadDictionary, loadDictionaryDefault, preloadDictionaries, clearDictionaryCache } from "./dictionary.js";
export { setOutputDir, getOutputDir, translate, t, translateScope, configure, translateWithFallback } from "./translate.js";
export { setLocale, getLocale, detectServerLocale, detectBrowserLocale } from "./locale.js";
export declare function createTranslator(outputDir?: string, defaultLocale?: string): {
    setLocale: any;
    getLocale: any;
    translate: any;
    translateScope: any;
    t: any;
    tr: (scope: string) => any;
    ts: (filePath: string, scopePath: string) => any;
};
