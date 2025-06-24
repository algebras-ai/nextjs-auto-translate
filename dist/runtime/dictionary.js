import fs from "fs";
import path from "path";
const loaded = {};
export function loadDictionary(locale, outputDir = "./intl") {
    const cacheKey = `${locale}:${outputDir}`;
    if (loaded[cacheKey])
        return loaded[cacheKey];
    const dictPath = path.resolve(process.cwd(), outputDir, "dictionary.json");
    try {
        const raw = fs.readFileSync(dictPath, "utf-8");
        const all = JSON.parse(raw);
        // Flatten the structure for the given locale
        const flat = {};
        if (all.files) {
            for (const filePath of Object.keys(all.files)) {
                const file = all.files[filePath];
                if (file.entries) {
                    for (const scopePath of Object.keys(file.entries)) {
                        const entry = file.entries[scopePath];
                        if (entry.content && entry.content[locale]) {
                            // Compose a flat key, e.g. `${filePath}::${scopePath}`
                            flat[`${filePath}::${scopePath}`] = entry.content[locale];
                        }
                    }
                }
            }
        }
        loaded[cacheKey] = flat;
        return flat;
    }
    catch (error) {
        console.warn(`[Dictionary] Failed to load dictionary from ${dictPath}:`, error);
        loaded[cacheKey] = {};
        return loaded[cacheKey];
    }
}
// Convenience function that uses default output directory
export function loadDictionaryDefault(locale) {
    return loadDictionary(locale, "./intl");
}
// Function to preload multiple locales
export function preloadDictionaries(locales, outputDir = "./intl") {
    locales.forEach((locale) => {
        loadDictionary(locale, outputDir);
    });
}
// Function to clear cache (useful for development/testing)
export function clearDictionaryCache() {
    Object.keys(loaded).forEach((key) => {
        delete loaded[key];
    });
}
