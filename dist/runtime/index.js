// src/runtime/index.ts
export { loadDictionary, loadDictionaryDefault, preloadDictionaries, clearDictionaryCache } from "./dictionary";
export { setLocale, getLocale, setOutputDir, getOutputDir, translate, t, translateScope, configure, translateWithFallback } from "./translate";
// Default configuration helper
export function createTranslator(outputDir = "./intl", defaultLocale = "en") {
    const { configure, translate, translateScope, t, setLocale, getLocale } = require("./translate");
    // Initialize with provided settings
    configure({ locale: defaultLocale, outputDir });
    return {
        setLocale,
        getLocale,
        translate,
        translateScope,
        t,
        // Pre-configured translate function
        tr: (scope) => translate(scope),
        // Pre-configured scope translate function
        ts: (filePath, scopePath) => translateScope(filePath, scopePath)
    };
}
