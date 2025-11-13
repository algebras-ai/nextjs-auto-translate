import fs from "fs";
import path from "path";
import { ScopeMap } from "../types.js";
import { AlgebrasTranslationProvider } from "./AlgebrasTranslationProvider.js";

export interface DictionaryGeneratorOptions {
  defaultLocale: string;
  targetLocales: string[];
  outputDir: string;
  translationProvider?: AlgebrasTranslationProvider;
}

export interface DictionaryEntry {
  content: Record<string, string>;
  hash: string;
}

export interface DictionaryFile {
  entries: Record<string, DictionaryEntry>;
}

export interface Dictionary {
  version: number;
  files: Record<string, DictionaryFile>;
}

// Fake translation service - returns original text as placeholder
class MockTranslationService {
  translate(text: string, targetLocale: string): string {
    // For now, just return the original text with a locale prefix
    // In a real implementation, this would call an actual translation API
    if (targetLocale === "en") {
      return text;
    }
    return `[${targetLocale.toUpperCase()}] ${text}`;
  }
}

export class DictionaryGenerator {
  private translationService = new MockTranslationService();
  private translationProvider?: AlgebrasTranslationProvider;

  constructor(private options: DictionaryGeneratorOptions) {
    this.translationProvider = options.translationProvider;
  }

  async generateDictionary(sourceMap: ScopeMap): Promise<string> {
    const allLocales = [
      this.options.defaultLocale,
      ...this.options.targetLocales
    ];
    console.log(
      `[DictionaryGenerator] Generating dictionary for locales: ${allLocales.join(
        ", "
      )}`
    );

    const dictionary: Dictionary = {
      version: 0.1,
      files: {}
    };

    // Use Algebras AI translation if provider is available
    if (this.translationProvider && this.options.targetLocales.length > 0) {
      await this.generateWithAlgebrasAI(sourceMap, dictionary, allLocales);
    } else {
      // Fallback to mock translation
      this.generateWithMockTranslation(sourceMap, dictionary, allLocales);
    }

    // Write dictionary files
    const outputPath = this.writeDictionaryFiles(dictionary);
    const dictionaryJsonPath = path.join(outputPath, "dictionary.json");

    return dictionaryJsonPath;
  }

  private async generateWithAlgebrasAI(
    sourceMap: ScopeMap,
    dictionary: Dictionary,
    allLocales: string[]
  ): Promise<void> {
    console.log("[DictionaryGenerator] Using Algebras AI for translation...");

    // Collect all texts to translate
    const textsMap = new Map<string, string>();
    const keyToFileScope = new Map<string, { filePath: string; scopePath: string }>();

    for (const [filePath, fileData] of Object.entries(sourceMap.files)) {
      dictionary.files[filePath] = { entries: {} };

      for (const [scopePath, scopeData] of Object.entries(fileData.scopes)) {
        const key = `${filePath}::${scopePath}`;
        textsMap.set(key, scopeData.content);
        keyToFileScope.set(key, { filePath, scopePath });
      }
    }

    // Translate all texts at once (optimized batch translation)
    const targetLocales = this.options.targetLocales;
    const translationResults = await this.translationProvider!.translateAll(
      textsMap,
      targetLocales,
      this.options.defaultLocale
    );

    // Build dictionary from translation results
    for (const [key, translations] of translationResults.entries()) {
      const { filePath, scopePath } = keyToFileScope.get(key)!;
      const scopeData = sourceMap.files[filePath].scopes[scopePath];

      const translationRecord: Record<string, string> = {
        [this.options.defaultLocale]: scopeData.content // Original text in default locale
      };

      // Add all target locale translations
      for (const locale of targetLocales) {
        translationRecord[locale] = translations.get(locale) || scopeData.content;
      }

      dictionary.files[filePath].entries[scopePath] = {
        content: translationRecord,
        hash: scopeData.hash
      };
    }
  }

  private generateWithMockTranslation(
    sourceMap: ScopeMap,
    dictionary: Dictionary,
    allLocales: string[]
  ): void {
    console.log("[DictionaryGenerator] Using mock translation...");

    // Process each file
    for (const [filePath, fileData] of Object.entries(sourceMap.files)) {
      dictionary.files[filePath] = {
        entries: {}
      };

      // Process each scope in the file
      for (const [scopePath, scopeData] of Object.entries(fileData.scopes)) {
        const translations: Record<string, string> = {};

        // Generate translations for each locale
        for (const locale of allLocales) {
          try {
            translations[locale] = this.translationService.translate(
              scopeData.content,
              locale
            );
          } catch (error) {
            console.warn(
              `[DictionaryGenerator] Failed to translate "${scopeData.content}" to ${locale}:`,
              error
            );
            // Fallback to original content
            translations[locale] = scopeData.content;
          }
        }

        dictionary.files[filePath].entries[scopePath] = {
          content: translations,
          hash: scopeData.hash
        };
      }
    }
  }

  private writeDictionaryFiles(dictionary: Dictionary): string {
    const outputPath = path.resolve(process.cwd(), this.options.outputDir);

    // Ensure output directory exists
    fs.mkdirSync(outputPath, { recursive: true });

    // Write dictionary.json file (for debugging/inspection)
    const dictionaryJsonPath = path.join(outputPath, "dictionary.json");
    fs.writeFileSync(
      dictionaryJsonPath,
      JSON.stringify(dictionary, null, 2),
      "utf-8"
    );

    const totalEntries = Object.values(dictionary.files).reduce(
      (count, file) => count + Object.keys(file.entries).length,
      0
    );

    console.log(
      `[DictionaryGenerator] Generated dictionary with ${totalEntries} entries across ${
        Object.keys(dictionary.files).length
      } files`
    );
    console.log(
      `[DictionaryGenerator] Dictionary files written to: ${outputPath}`
    );

    return outputPath;
  }
}
