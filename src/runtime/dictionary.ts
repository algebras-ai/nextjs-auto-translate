import fs from "fs";
import path from "path";

type Dictionary = Record<string, string>;
const loaded: Record<string, Dictionary> = {};

export function loadDictionary(
  locale: string,
  outputDir: string = "./intl"
): Dictionary {
  const cacheKey = `${locale}:${outputDir}`;
  if (loaded[cacheKey]) return loaded[cacheKey];

  const dictPath = path.resolve(process.cwd(), outputDir, "dictionary.json");
  try {
    const raw = fs.readFileSync(dictPath, "utf-8");
    const all = JSON.parse(raw);
    loaded[cacheKey] = all[locale] || {};
    return loaded[cacheKey];
  } catch (error) {
    console.warn(
      `[Dictionary] Failed to load dictionary from ${dictPath}:`,
      error
    );
    loaded[cacheKey] = {};
    return loaded[cacheKey];
  }
}

// Convenience function that uses default output directory
export function loadDictionaryDefault(locale: string): Dictionary {
  return loadDictionary(locale, "./intl");
}

// Function to preload multiple locales
export function preloadDictionaries(
  locales: string[],
  outputDir: string = "./intl"
): void {
  locales.forEach((locale) => {
    loadDictionary(locale, outputDir);
  });
}

// Function to clear cache (useful for development/testing)
export function clearDictionaryCache(): void {
  Object.keys(loaded).forEach((key) => {
    delete loaded[key];
  });
}
