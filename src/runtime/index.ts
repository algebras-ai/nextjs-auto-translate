// src/runtime/index.ts
export {
  loadDictionary,
  loadDictionaryDefault,
  preloadDictionaries,
  clearDictionaryCache
} from "./dictionary.js";

export {
  setLocale,
  getLocale,
  setOutputDir,
  getOutputDir,
  translate,
  t,
  translateScope,
  configure,
  translateWithFallback
} from "./translate.js";

// Default configuration helper
export function createTranslator(
  outputDir: string = "./intl",
  defaultLocale: string = "en"
) {
  const {
    configure,
    translate,
    translateScope,
    t,
    setLocale,
    getLocale
  } = require("./translate.js");

  // Initialize with provided settings
  configure({ locale: defaultLocale, outputDir });

  return {
    setLocale,
    getLocale,
    translate,
    translateScope,
    t,
    // Pre-configured translate function
    tr: (scope: string) => translate(scope),
    // Pre-configured scope translate function
    ts: (filePath: string, scopePath: string) =>
      translateScope(filePath, scopePath)
  };
}
