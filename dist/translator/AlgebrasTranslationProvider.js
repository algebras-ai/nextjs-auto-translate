export class AlgebrasTranslationProvider {
    apiKey;
    apiUrl;
    glossaryId;
    prompt;
    flag;
    ignoreCache;
    cache = new Map();
    quotaExceeded = false;
    constructor(options) {
        this.apiKey = options.apiKey;
        this.apiUrl = options.apiUrl || 'https://platform.algebras.ai/api/v1';
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
    async translateBatch(texts, targetLanguage, sourceLanguage = 'en') {
        if (texts.length === 0) {
            return { translations: [] };
        }
        // If quota is already exceeded, skip API call and return fallback translations
        if (this.quotaExceeded) {
            console.log(`[AlgebrasTranslation] Quota exceeded - using fallback translations for ${texts.length} texts to ${targetLanguage}...`);
            return {
                translations: texts.map((text) => `[${targetLanguage.toUpperCase()}] ${text}`),
            };
        }
        console.log(`[AlgebrasTranslation] Translating ${texts.length} texts from ${sourceLanguage} to ${targetLanguage}...`);
        try {
            // Build request body with only provided optional fields
            const requestBody = {
                texts,
                sourceLanguage,
                targetLanguage,
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
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': this.apiKey,
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                const errorText = await response.text();
                // Check if this is a quota exceeded error
                if (response.status === 402) {
                    try {
                        const errorJson = JSON.parse(errorText);
                        if (errorJson.error?.quota_exceeded === true) {
                            this.quotaExceeded = true;
                            console.error('\n⚠️  [AlgebrasTranslation] Quota exceeded detected!');
                            console.error('   Organization has no quota left');
                            console.error('   All subsequent translations will use fallback translations\n');
                        }
                    }
                    catch (parseError) {
                        // If we can't parse the error, check the error message
                        if (errorText.includes('quota_exceeded') ||
                            errorText.includes('no quota left')) {
                            this.quotaExceeded = true;
                            console.error('\n⚠️  [AlgebrasTranslation] Quota exceeded detected!');
                            console.error('   All subsequent translations will use fallback translations\n');
                        }
                    }
                }
                throw new Error(`Algebras API error: ${response.status} ${response.statusText} - ${errorText}`);
            }
            const apiResponse = await response.json();
            if (!apiResponse.data ||
                !apiResponse.data.translations ||
                !Array.isArray(apiResponse.data.translations)) {
                throw new Error('Invalid response format: missing translations array');
            }
            // Extract translations in order
            const translations = apiResponse.data.translations
                .sort((a, b) => a.index - b.index)
                .map((t) => t.content);
            console.log(`[AlgebrasTranslation] Successfully translated ${texts.length} texts to ${targetLanguage} (${apiResponse.data.word_count} words, ${apiResponse.data.batch_summary.total_credits} credits)`);
            return { translations };
        }
        catch (error) {
            // Also check error message in catch block in case error was thrown before parsing
            if (!this.quotaExceeded && error instanceof Error) {
                const errorMessage = error.message;
                if (errorMessage.includes('402') ||
                    errorMessage.includes('Payment Required')) {
                    try {
                        // Try to extract JSON from error message
                        const jsonMatch = errorMessage.match(/\{.*\}/s);
                        if (jsonMatch) {
                            const errorJson = JSON.parse(jsonMatch[0]);
                            if (errorJson.error?.quota_exceeded === true) {
                                this.quotaExceeded = true;
                                console.error('\n⚠️  [AlgebrasTranslation] Quota exceeded detected!');
                                console.error('   Organization has no quota left');
                                console.error('   All subsequent translations will use fallback translations\n');
                            }
                        }
                        else if (errorMessage.includes('quota_exceeded') ||
                            errorMessage.includes('no quota left')) {
                            this.quotaExceeded = true;
                            console.error('\n⚠️  [AlgebrasTranslation] Quota exceeded detected!');
                            console.error('   All subsequent translations will use fallback translations\n');
                        }
                    }
                    catch (parseError) {
                        // If parsing fails, check for quota keywords in error message
                        if (errorMessage.includes('quota_exceeded') ||
                            errorMessage.includes('no quota left')) {
                            this.quotaExceeded = true;
                            console.error('\n⚠️  [AlgebrasTranslation] Quota exceeded detected!');
                            console.error('   All subsequent translations will use fallback translations\n');
                        }
                    }
                }
            }
            console.error('\n❌ [AlgebrasTranslation] Translation API Error:');
            console.error('   Endpoint:', `${this.apiUrl}/translation/translate-batch`);
            console.error('   Target Language:', targetLanguage);
            console.error('   Number of texts:', texts.length);
            console.error('   Error details:', error);
            // If quota is exceeded, log a specific message
            if (this.quotaExceeded) {
                console.error('   ⚠️  Quota exceeded - using fallback translations for remaining items\n');
            }
            else {
                console.error('   ⚠️  Falling back to mock translations\n');
            }
            // Fallback: return original texts with locale prefix
            return {
                translations: texts.map((text) => `[${targetLanguage.toUpperCase()}] ${text}`),
            };
        }
    }
    /**
     * Optimized translation for entire dictionary generation
     * Batches all texts and processes each language separately
     */
    async translateAll(textsMap, targetLanguages, sourceLanguage = 'en') {
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
            // If quota is exceeded, skip API calls and use fallback for all remaining languages
            if (this.quotaExceeded) {
                console.log(`[AlgebrasTranslation] Quota exceeded - using fallback translations for all texts to ${targetLang}...`);
                // Generate fallback translations for all texts in this language
                for (let i = 0; i < texts.length; i++) {
                    const key = keys[i];
                    const text = texts[i];
                    results
                        .get(key)
                        .set(targetLang, `[${targetLang.toUpperCase()}] ${text}`);
                }
                continue;
            }
            console.log(`[AlgebrasTranslation] Translating all texts to ${targetLang}...`);
            // Process in batches for this language
            for (let i = 0; i < texts.length; i += batchSize) {
                // Check quota status before each batch
                if (this.quotaExceeded) {
                    console.log(`[AlgebrasTranslation] Quota exceeded during batch processing - using fallback translations for remaining batches...`);
                    // Generate fallback translations for all remaining texts in this language
                    for (let j = i; j < texts.length; j++) {
                        const key = keys[j];
                        const text = texts[j];
                        results
                            .get(key)
                            .set(targetLang, `[${targetLang.toUpperCase()}] ${text}`);
                    }
                    break;
                }
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
                // Check if quota was exceeded during this batch call
                // If so, stop making API calls and use fallback for remaining items
                if (this.quotaExceeded) {
                    console.log(`[AlgebrasTranslation] Quota exceeded detected - using fallback translations for remaining items...`);
                    // Generate fallback translations for all remaining texts in this language
                    for (let j = i + batchSize; j < texts.length; j++) {
                        const key = keys[j];
                        const text = texts[j];
                        results
                            .get(key)
                            .set(targetLang, `[${targetLang.toUpperCase()}] ${text}`);
                    }
                    break; // Stop processing remaining batches for this language
                }
                // Small delay to avoid rate limiting (only if quota not exceeded)
                if (!this.quotaExceeded && i + batchSize < texts.length) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                }
            }
            // Delay between languages to avoid rate limiting (only if quota not exceeded)
            if (!this.quotaExceeded &&
                targetLanguages.indexOf(targetLang) < targetLanguages.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        return results;
    }
}
