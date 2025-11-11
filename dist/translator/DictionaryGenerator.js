import fs from "fs";
import path from "path";
import { AlgebrasTranslationService } from "./AlgebrasTranslationService";
// Fake translation service - returns original text as placeholder
class MockTranslationService {
    translate(text, targetLocale) {
        // For now, just return the original text with a locale prefix
        // In a real implementation, this would call an actual translation API
        if (targetLocale === "en") {
            return text;
        }
        return `[${targetLocale.toUpperCase()}] ${text}`;
    }
    async translateBatch(texts, targetLocale) {
        return texts.map(text => this.translate(text, targetLocale));
    }
}
export class DictionaryGenerator {
    constructor(options) {
        this.options = options;
        this.useMockTranslation = options.useMockTranslation ?? !options.algebrasApiKey;
        if (this.useMockTranslation) {
            console.log("[DictionaryGenerator] Using mock translation service");
            this.translationService = new MockTranslationService();
        }
        else if (options.algebrasApiKey) {
            console.log("[DictionaryGenerator] Using Algebras API translation service");
            this.translationService = new AlgebrasTranslationService({
                apiKey: options.algebrasApiKey,
                batchSize: options.batchSize || 50,
            });
        }
        else {
            throw new Error("Either algebrasApiKey must be provided or useMockTranslation must be true");
        }
    }
    async generateDictionary(sourceMap) {
        const allLocales = [
            this.options.defaultLocale,
            ...this.options.targetLocales
        ];
        console.log(`[DictionaryGenerator] Generating dictionary for locales: ${allLocales.join(", ")}`);
        const dictionary = {
            version: 0.1,
            files: {}
        };
        // Collect all texts that need translation
        const textsToTranslate = [];
        for (const [filePath, fileData] of Object.entries(sourceMap.files)) {
            for (const [scopePath, scopeData] of Object.entries(fileData.scopes)) {
                textsToTranslate.push({
                    text: scopeData.content,
                    filePath,
                    scopePath
                });
            }
        }
        // Extract just the texts for batch translation
        const texts = textsToTranslate.map(item => item.text);
        console.log(`[DictionaryGenerator] Translating ${texts.length} texts to ${this.options.targetLocales.length} target locales`);
        // Translate all texts for all target locales in batch
        const translationsByLocale = {};
        // Add source locale (no translation needed)
        translationsByLocale[this.options.defaultLocale] = texts;
        // Translate for each target locale using batch API
        if (this.useMockTranslation) {
            // Use mock service (synchronous)
            for (const locale of this.options.targetLocales) {
                try {
                    translationsByLocale[locale] = await this.translationService.translateBatch(texts, locale);
                }
                catch (error) {
                    console.warn(`[DictionaryGenerator] Failed to translate batch to ${locale}:`, error);
                    translationsByLocale[locale] = texts; // Fallback
                }
            }
        }
        else {
            // Use Algebras API (async batch)
            try {
                const results = await this.translationService.translateForMultipleLocales(texts, this.options.targetLocales, this.options.defaultLocale);
                Object.assign(translationsByLocale, results);
            }
            catch (error) {
                console.error(`[DictionaryGenerator] Failed to translate using Algebras API:`, error);
                // Fallback: use original texts for all locales
                for (const locale of this.options.targetLocales) {
                    translationsByLocale[locale] = texts;
                }
            }
        }
        // Build dictionary structure with translated texts
        for (let i = 0; i < textsToTranslate.length; i++) {
            const { filePath, scopePath } = textsToTranslate[i];
            if (!dictionary.files[filePath]) {
                dictionary.files[filePath] = { entries: {} };
            }
            const translations = {};
            for (const locale of allLocales) {
                translations[locale] = translationsByLocale[locale][i];
            }
            dictionary.files[filePath].entries[scopePath] = {
                content: translations,
                hash: sourceMap.files[filePath].scopes[scopePath].hash
            };
        }
        // Write dictionary files
        const outputPath = this.writeDictionaryFiles(dictionary);
        const dictionaryJsonPath = path.join(outputPath, "dictionary.json");
        return dictionaryJsonPath;
    }
    writeDictionaryFiles(dictionary) {
        const outputPath = path.resolve(process.cwd(), this.options.outputDir);
        // Ensure output directory exists
        fs.mkdirSync(outputPath, { recursive: true });
        // Write dictionary.json file (for debugging/inspection)
        const dictionaryJsonPath = path.join(outputPath, "dictionary.json");
        fs.writeFileSync(dictionaryJsonPath, JSON.stringify(dictionary, null, 2), "utf-8");
        const totalEntries = Object.values(dictionary.files).reduce((count, file) => count + Object.keys(file.entries).length, 0);
        console.log(`[DictionaryGenerator] Generated dictionary with ${totalEntries} entries across ${Object.keys(dictionary.files).length} files`);
        console.log(`[DictionaryGenerator] Dictionary files written to: ${outputPath}`);
        return outputPath;
    }
}
