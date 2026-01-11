import fs from 'fs';
import path from 'path';
import { ScopeMap } from '../types';
import { AlgebrasTranslationProvider } from './AlgebrasTranslationProvider';

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
    if (targetLocale === 'en') {
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

  private preserveEdgeWhitespace(source: string, translated: string): string {
    const leading = source.match(/^\s+/)?.[0] ?? '';
    const trailing = source.match(/\s+$/)?.[0] ?? '';
    const core = translated.trim();
    return `${leading}${core}${trailing}`;
  }

  /**
   * Try to load existing dictionary.json from outputDir.
   * Returns null if file doesn't exist or cannot be parsed.
   */
  private loadExistingDictionary(): Dictionary | null {
    try {
      const outputPath = path.resolve(process.cwd(), this.options.outputDir);
      const dictionaryJsonPath = path.join(outputPath, 'dictionary.json');

      if (!fs.existsSync(dictionaryJsonPath)) {
        return null;
      }

      const content = fs.readFileSync(dictionaryJsonPath, 'utf-8');
      const parsed = JSON.parse(content) as Dictionary;

      return parsed;
    } catch (error) {
      console.warn(
        '[DictionaryGenerator] Failed to load existing dictionary, starting fresh:',
        error
      );
      return null;
    }
  }

  async generateDictionary(sourceMap: ScopeMap): Promise<string> {
    const allLocales = [
      this.options.defaultLocale,
      ...this.options.targetLocales,
    ];

    const existingDictionary = this.loadExistingDictionary();

    const dictionary: Dictionary = {
      // preserve existing version if present, otherwise start with 0.1
      version:
        existingDictionary &&
        typeof (existingDictionary as any).version === 'number'
          ? (existingDictionary as any).version
          : 0.1,
      files: {},
    };

    // Use Algebras AI translation if provider is available
    if (this.translationProvider && this.options.targetLocales.length > 0) {
      await this.generateWithAlgebrasAI(
        sourceMap,
        dictionary,
        existingDictionary || undefined
      );
    } else {
      // Fallback to mock translation
      this.generateWithMockTranslation(sourceMap, dictionary, allLocales);
    }

    // Write dictionary files
    const outputPath = this.writeDictionaryFiles(dictionary);
    const dictionaryJsonPath = path.join(outputPath, 'dictionary.json');

    return dictionaryJsonPath;
  }

  /**
   * Generate dictionary using Algebras AI with incremental behavior:
   * - reuse existing translations when hash matches
   * - call API only for new/changed scopes or for locales that are missing
   */
  private async generateWithAlgebrasAI(
    sourceMap: ScopeMap,
    dictionary: Dictionary,
    existingDictionary?: Dictionary
  ): Promise<void> {
    const defaultLocale = this.options.defaultLocale;
    const targetLocales = this.options.targetLocales;

    // For each locale, collect only texts that actually need translation
    const requestsByLocale: Record<
      string,
      {
        texts: string[];
        keys: string[]; // filePath::scopePath
      }
    > = {};

    for (const locale of targetLocales) {
      requestsByLocale[locale] = { texts: [], keys: [] };
    }

    // First pass: build dictionary structure and decide what needs translation
    for (const [filePath, fileData] of Object.entries(sourceMap.files)) {
      dictionary.files[filePath] = { entries: {} };

      const existingFile =
        existingDictionary && existingDictionary.files
          ? existingDictionary.files[filePath]
          : undefined;

      for (const [scopePath, scopeData] of Object.entries(fileData.scopes)) {
        const key = `${filePath}::${scopePath}`;
        const existingEntry =
          existingFile && existingFile.entries
            ? existingFile.entries[scopePath]
            : undefined;

        const isSameHash =
          existingEntry && existingEntry.hash === scopeData.hash;

        const content: Record<string, string> = {};

        // default locale is always original text
        content[defaultLocale] = scopeData.content;

        // For each target locale: either reuse or schedule for translation
        for (const locale of targetLocales) {
          if (
            isSameHash &&
            existingEntry &&
            existingEntry.content &&
            existingEntry.content[locale]
          ) {
            // Reuse existing translation
            content[locale] = this.preserveEdgeWhitespace(
              scopeData.content,
              existingEntry.content[locale]
            );
          } else {
            // Need translation for this locale/scope
            requestsByLocale[locale].texts.push(scopeData.content);
            requestsByLocale[locale].keys.push(key);
          }
        }

        // Optionally keep any extra locales from existing entry when hash matches
        if (isSameHash && existingEntry && existingEntry.content) {
          for (const [locale, value] of Object.entries(existingEntry.content)) {
            if (
              locale !== defaultLocale &&
              !targetLocales.includes(locale) &&
              content[locale] === undefined
            ) {
              content[locale] = value;
            }
          }
        }

        dictionary.files[filePath].entries[scopePath] = {
          content,
          hash: scopeData.hash,
        };
      }
    }

    // Second pass: perform translations only for scheduled texts
    const batchSize = 20; // API limit per batch
    for (const locale of targetLocales) {
      const { texts, keys } = requestsByLocale[locale];

      if (texts.length === 0) {
        continue;
      }

      for (let i = 0; i < texts.length; i += batchSize) {
        const batchTexts = texts.slice(i, i + batchSize);
        const batchKeys = keys.slice(i, i + batchSize);

        const batchResult = await this.translationProvider!.translateBatch(
          batchTexts,
          locale,
          defaultLocale
        );

        // Map translations back into dictionary
        for (let j = 0; j < batchKeys.length; j++) {
          const key = batchKeys[j];
          const translated =
            batchResult.translations[j] !== undefined
              ? batchResult.translations[j]
              : batchTexts[j]; // fallback to original text if something is missing

          const [filePath, scopePath] = key.split('::');
          const file = dictionary.files[filePath];
          if (!file) continue;

          const entry = file.entries[scopePath];
          if (!entry) continue;

          entry.content[locale] = this.preserveEdgeWhitespace(
            batchTexts[j],
            translated
          );
        }
      }
    }
  }

  private generateWithMockTranslation(
    sourceMap: ScopeMap,
    dictionary: Dictionary,
    allLocales: string[]
  ): void {
    // Process each file
    for (const [filePath, fileData] of Object.entries(sourceMap.files)) {
      dictionary.files[filePath] = {
        entries: {},
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
          hash: scopeData.hash,
        };
      }
    }
  }

  private writeDictionaryFiles(dictionary: Dictionary): string {
    const outputPath = path.resolve(process.cwd(), this.options.outputDir);

    // Ensure output directory exists
    fs.mkdirSync(outputPath, { recursive: true });

    // Write dictionary.json file (for debugging/inspection)
    const dictionaryJsonPath = path.join(outputPath, 'dictionary.json');
    fs.writeFileSync(
      dictionaryJsonPath,
      JSON.stringify(dictionary, null, 2),
      'utf-8'
    );

    const totalEntries = Object.values(dictionary.files).reduce(
      (count, file) => count + Object.keys(file.entries).length,
      0
    );

    return outputPath;
  }
}
