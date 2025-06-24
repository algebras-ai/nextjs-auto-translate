export { loadDictionary, loadDictionaryDefault, preloadDictionaries, clearDictionaryCache } from "./dictionary";
export { setLocale, getLocale, setOutputDir, getOutputDir, translate, t, translateScope, configure, translateWithFallback } from "./translate";
export declare function createTranslator(outputDir?: string, defaultLocale?: string): {
    setLocale: any;
    getLocale: any;
    translate: any;
    translateScope: any;
    t: any;
    tr: (scope: string) => any;
    ts: (filePath: string, scopePath: string) => any;
};
