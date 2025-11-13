export class AlgebrasTranslationProvider {
    apiKey;
    apiUrl;
    glossaryId;
    prompt;
    flag;
    ignoreCache;
    cache = new Map();
    constructor(options) {
        this.apiKey = options.apiKey;
        this.apiUrl = options.apiUrl || "https://platform.algebras.ai/api/v1";
        this.glossaryId = options.glossaryId;
        this.prompt = options.prompt;
        this.flag = options.flag;
        this.ignoreCache = options.ignoreCache;
        console.log(`[AlgebrasTranslationProvider] Initialized with endpoint: ${this.apiUrl}`);
        if (this.glossaryId)
            console.log(`[AlgebrasTranslationProvider] Using glossaryId: ${this.glossaryId}`);
        if (this.prompt)
            console.log(`[AlgebrasTranslationProvider] Using custom prompt: ${this.prompt}`);
    }
    /**
     * Translate a single text to a target language
     */
    async translateText(text, targetLang) {
        const cacheKey = `${text}:${targetLang}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const result = await this.translateBatch([text], targetLang);
        const translated = result.translations[0];
        this.cache.set(cacheKey, translated);
        return translated;
    }
    /**
     * Translate multiple texts to a single target language using batch endpoint
     */
    async translateBatch(texts, targetLanguage, sourceLanguage = "en") {
        if (texts.length === 0) {
            return { translations: [] };
        }
        console.log(`[AlgebrasTranslation] Translating ${texts.length} texts from ${sourceLanguage} to ${targetLanguage}...`);
        try {
            // Build request body with only provided optional fields
            const requestBody = {
                texts,
                sourceLanguage,
                targetLanguage
            };
            // Only add optional fields if they are explicitly set
            if (this.glossaryId !== undefined && this.glossaryId !== null) {
                requestBody.glossaryId = this.glossaryId;
            }
            if (this.prompt !== undefined && this.prompt !== null) {
                requestBody.prompt = this.prompt;
            }
            if (this.flag !== undefined) {
                requestBody.flag = this.flag;
            }
            if (this.ignoreCache !== undefined) {
                requestBody.ignoreCache = this.ignoreCache;
            }
            const response = await fetch(`${this.apiUrl}/translation/translate-batch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Api-Key": this.apiKey
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Algebras API error: ${response.status} ${response.statusText} - ${errorText}`);
            }
            const apiResponse = await response.json();
            if (!apiResponse.data || !apiResponse.data.translations || !Array.isArray(apiResponse.data.translations)) {
                throw new Error("Invalid response format: missing translations array");
            }
            // Extract translations in order
            const translations = apiResponse.data.translations
                .sort((a, b) => a.index - b.index)
                .map(t => t.content);
            console.log(`[AlgebrasTranslation] Successfully translated ${texts.length} texts to ${targetLanguage} (${apiResponse.data.word_count} words, ${apiResponse.data.batch_summary.total_credits} credits)`);
            return { translations };
        }
        catch (error) {
            console.error("\n❌ [AlgebrasTranslation] Translation API Error:");
            console.error("   Endpoint:", `${this.apiUrl}/translation/translate-batch`);
            console.error("   Target Language:", targetLanguage);
            console.error("   Number of texts:", texts.length);
            console.error("   Error details:", error);
            console.error("   ⚠️  Falling back to mock translations\n");
            // Fallback: return original texts with locale prefix
            return {
                translations: texts.map((text) => `[${targetLanguage.toUpperCase()}] ${text}`)
            };
        }
    }
    /**
     * Optimized translation for entire dictionary generation
     * Batches all texts and processes each language separately
     */
    async translateAll(textsMap, targetLanguages, sourceLanguage = "en") {
        const keys = Array.from(textsMap.keys());
        const texts = Array.from(textsMap.values());
        if (texts.length === 0) {
            return new Map();
        }
        const batchSize = 20; // API limit: 20 texts maximum per batch
        const results = new Map();
        // Initialize result structure
        for (const key of keys) {
            results.set(key, new Map());
        }
        // Process each target language
        for (const targetLang of targetLanguages) {
            console.log(`[AlgebrasTranslation] Translating all texts to ${targetLang}...`);
            // Process in batches for this language
            for (let i = 0; i < texts.length; i += batchSize) {
                const batchTexts = texts.slice(i, i + batchSize);
                const batchKeys = keys.slice(i, i + batchSize);
                console.log(`[AlgebrasTranslation] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)} for ${targetLang}...`);
                const batchResult = await this.translateBatch(batchTexts, targetLang, sourceLanguage);
                // Map results back to keys
                for (let j = 0; j < batchKeys.length; j++) {
                    const key = batchKeys[j];
                    const translated = batchResult.translations[j] || batchTexts[j];
                    results.get(key).set(targetLang, translated);
                }
                // Small delay to avoid rate limiting
                if (i + batchSize < texts.length) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                }
            }
            // Delay between languages to avoid rate limiting
            if (targetLanguages.indexOf(targetLang) < targetLanguages.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        return results;
    }
}
