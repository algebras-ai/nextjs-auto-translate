"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionaryGenerator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Fake translation service - returns original text as placeholder
class MockTranslationService {
    translate(text, targetLocale) {
        // Mock translations should never mutate content; return source text.
        // Real translations are handled by the translationProvider.
        return text;
    }
}
class DictionaryGenerator {
    options;
    translationService = new MockTranslationService();
    translationProvider;
    constructor(options) {
        this.options = options;
        this.translationProvider = options.translationProvider;
    }
    preserveEdgeWhitespace(source, translated) {
        const leading = source.match(/^\s+/)?.[0] ?? '';
        const trailing = source.match(/\s+$/)?.[0] ?? '';
        const core = translated.trim();
        return `${leading}${core}${trailing}`;
    }
    /**
     * Check if translation provider has exceeded quota or rate limit
     */
    isProviderLimitExceeded() {
        if (!this.translationProvider) {
            return false;
        }
        const provider = this.translationProvider;
        return (provider.quotaExceeded === true || provider.rateLimitExceeded === true);
    }
    /**
     * Get the reason for limit exceeded (for logging)
     */
    getLimitExceededReason() {
        if (!this.translationProvider) {
            return null;
        }
        const provider = this.translationProvider;
        if (provider.quotaExceeded) {
            return 'Quota';
        }
        if (provider.rateLimitExceeded) {
            return 'Rate limit';
        }
        return null;
    }
    /**
     * Try to load existing dictionary.json from outputDir.
     * Returns null if file doesn't exist or cannot be parsed.
     */
    loadExistingDictionary() {
        try {
            const outputPath = path_1.default.resolve(process.cwd(), this.options.outputDir);
            const dictionaryJsonPath = path_1.default.join(outputPath, 'dictionary.json');
            if (!fs_1.default.existsSync(dictionaryJsonPath)) {
                return null;
            }
            const content = fs_1.default.readFileSync(dictionaryJsonPath, 'utf-8');
            const parsed = JSON.parse(content);
            return parsed;
        }
        catch (error) {
            console.warn('[DictionaryGenerator] Failed to load existing dictionary, starting fresh:', error);
            return null;
        }
    }
    async generateDictionary(sourceMap) {
        const allLocales = [
            this.options.defaultLocale,
            ...this.options.targetLocales,
        ];
        const existingDictionary = this.loadExistingDictionary();
        const dictionary = {
            // preserve existing version if present, otherwise start with 0.1
            version: existingDictionary &&
                typeof existingDictionary.version === 'number'
                ? existingDictionary.version
                : 0.1,
            files: {},
        };
        // Use Algebras AI translation if provider is available
        if (this.translationProvider && this.options.targetLocales.length > 0) {
            await this.generateWithAlgebrasAI(sourceMap, dictionary, existingDictionary || undefined);
        }
        else {
            // Fallback to mock translation
            this.generateWithMockTranslation(sourceMap, dictionary, allLocales);
        }
        // Write dictionary files
        const outputPath = this.writeDictionaryFiles(dictionary);
        const dictionaryJsonPath = path_1.default.join(outputPath, 'dictionary.json');
        return dictionaryJsonPath;
    }
    /**
     * Generate dictionary using Algebras AI with incremental behavior:
     * - reuse existing translations when hash matches
     * - call API only for new/changed scopes or for locales that are missing
     */
    async generateWithAlgebrasAI(sourceMap, dictionary, existingDictionary) {
        const defaultLocale = this.options.defaultLocale;
        const targetLocales = this.options.targetLocales;
        // For each locale, collect only texts that actually need translation
        const requestsByLocale = {};
        for (const locale of targetLocales) {
            requestsByLocale[locale] = { texts: [], keys: [] };
        }
        // First pass: build dictionary structure and decide what needs translation
        for (const [filePath, fileData] of Object.entries(sourceMap.files)) {
            dictionary.files[filePath] = { entries: {} };
            const existingFile = existingDictionary && existingDictionary.files
                ? existingDictionary.files[filePath]
                : undefined;
            for (const [scopePath, scopeData] of Object.entries(fileData.scopes)) {
                const key = `${filePath}::${scopePath}`;
                const existingEntry = existingFile && existingFile.entries
                    ? existingFile.entries[scopePath]
                    : undefined;
                const isSameHash = existingEntry && existingEntry.hash === scopeData.hash;
                const content = {};
                // default locale is always original text
                content[defaultLocale] = scopeData.content;
                // For each target locale: either reuse or schedule for translation
                for (const locale of targetLocales) {
                    if (isSameHash &&
                        existingEntry &&
                        existingEntry.content &&
                        existingEntry.content[locale]) {
                        // Reuse existing translation
                        content[locale] = this.preserveEdgeWhitespace(scopeData.content, existingEntry.content[locale]);
                    }
                    else {
                        // Need translation for this locale/scope
                        requestsByLocale[locale].texts.push(scopeData.content);
                        requestsByLocale[locale].keys.push(key);
                    }
                }
                // Optionally keep any extra locales from existing entry when hash matches
                if (isSameHash && existingEntry && existingEntry.content) {
                    for (const [locale, value] of Object.entries(existingEntry.content)) {
                        if (locale !== defaultLocale &&
                            !targetLocales.includes(locale) &&
                            content[locale] === undefined) {
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
            // Check if rate limit or quota exceeded before processing locale
            if (this.isProviderLimitExceeded()) {
                const reason = this.getLimitExceededReason() || 'Limit';
                console.log(`[DictionaryGenerator] ${reason} exceeded - skipping remaining translations for ${locale}...`);
                continue;
            }
            for (let i = 0; i < texts.length; i += batchSize) {
                // Check before each batch
                if (this.isProviderLimitExceeded()) {
                    const reason = this.getLimitExceededReason() || 'Limit';
                    console.log(`[DictionaryGenerator] ${reason} exceeded - skipping remaining batches...`);
                    break;
                }
                const batchTexts = texts.slice(i, i + batchSize);
                const batchKeys = keys.slice(i, i + batchSize);
                const batchResult = await this.translationProvider.translateBatch(batchTexts, locale, defaultLocale);
                // If provider fell back due to API errors/rate limits/quota, do not write
                // non-translated locales into the dictionary.
                const provider = this.translationProvider;
                if (provider.lastBatchHadError) {
                    continue;
                }
                // Map translations back into dictionary
                for (let j = 0; j < batchKeys.length; j++) {
                    const key = batchKeys[j];
                    const translated = batchResult.translations[j];
                    if (translated === undefined) {
                        // Missing translation -> do not write this locale entry.
                        continue;
                    }
                    const [filePath, scopePath] = key.split('::');
                    const file = dictionary.files[filePath];
                    if (!file)
                        continue;
                    const entry = file.entries[scopePath];
                    if (!entry)
                        continue;
                    entry.content[locale] = this.preserveEdgeWhitespace(batchTexts[j], translated);
                }
            }
        }
    }
    generateWithMockTranslation(sourceMap, dictionary, allLocales) {
        const defaultLocale = this.options.defaultLocale;
        // Process each file
        for (const [filePath, fileData] of Object.entries(sourceMap.files)) {
            dictionary.files[filePath] = {
                entries: {},
            };
            // Process each scope in the file
            for (const [scopePath, scopeData] of Object.entries(fileData.scopes)) {
                // Only write default/source locale when no provider is available.
                // Do not write non-translated locales into the dictionary.
                const translations = {
                    [defaultLocale]: this.translationService.translate(scopeData.content, defaultLocale),
                };
                dictionary.files[filePath].entries[scopePath] = {
                    content: translations,
                    hash: scopeData.hash,
                };
            }
        }
    }
    writeDictionaryFiles(dictionary) {
        const outputPath = path_1.default.resolve(process.cwd(), this.options.outputDir);
        // Ensure output directory exists
        fs_1.default.mkdirSync(outputPath, { recursive: true });
        // Write dictionary.json file (for debugging/inspection)
        const dictionaryJsonPath = path_1.default.join(outputPath, 'dictionary.json');
        fs_1.default.writeFileSync(dictionaryJsonPath, JSON.stringify(dictionary, null, 2), 'utf-8');
        const totalEntries = Object.values(dictionary.files).reduce((count, file) => count + Object.keys(file.entries).length, 0);
        return outputPath;
    }
}
exports.DictionaryGenerator = DictionaryGenerator;
