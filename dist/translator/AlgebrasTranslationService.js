import https from "https";
import http from "http";
import zlib from "zlib";
export class AlgebrasTranslationService {
    constructor(options) {
        this.apiKey = options.apiKey;
        this.apiBaseUrl =
            options.apiBaseUrl || "https://platform.algebras.ai/api/v1";
        this.batchSize = options.batchSize || 50; // Translate up to 50 texts per batch
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000; // 1 second
    }
    /**
     * Translate a single text string
     */
    async translate(text, targetLocale, sourceLocale = "en") {
        const result = await this.translateBatch([text], targetLocale, sourceLocale);
        return result[0];
    }
    /**
     * Translate multiple texts in a single batch request
     */
    async translateBatch(texts, targetLocale, sourceLocale = "en") {
        // If source and target are the same, no translation needed
        if (sourceLocale === targetLocale) {
            return texts;
        }
        // If batch is larger than batchSize, split into multiple requests
        if (texts.length > this.batchSize) {
            const results = [];
            for (let i = 0; i < texts.length; i += this.batchSize) {
                const batch = texts.slice(i, i + this.batchSize);
                const batchResults = await this.translateBatch(batch, targetLocale, sourceLocale);
                results.push(...batchResults);
            }
            return results;
        }
        const requestBody = {
            texts: texts,
            sourceLanguage: sourceLocale,
            targetLanguage: targetLocale,
            glossaryId: null,
            prompt: null,
            flag: false,
            ignoreCache: false,
        };
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`[AlgebrasTranslationService] Translating ${texts.length} texts from ${sourceLocale} to ${targetLocale} (attempt ${attempt}/${this.retryAttempts})`);
                const response = await this.makeRequest(requestBody);
                console.log(`[AlgebrasTranslationService] Successfully translated ${response.data.translations.length} texts`);
                // Extract the translated content from the response
                return response.data.translations.map(t => t.content);
            }
            catch (error) {
                console.warn(`[AlgebrasTranslationService] Translation attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error));
                if (attempt < this.retryAttempts) {
                    // Wait before retrying
                    await new Promise((resolve) => setTimeout(resolve, this.retryDelay * attempt));
                }
                else {
                    // All attempts failed, return original texts as fallback
                    console.error(`[AlgebrasTranslationService] All ${this.retryAttempts} attempts failed. Returning original texts.`);
                    return texts;
                }
            }
        }
        // Fallback (should never reach here due to the else block above)
        return texts;
    }
    /**
     * Make HTTP request to Algebras API
     */
    makeRequest(requestBody) {
        return new Promise((resolve, reject) => {
            // Construct full URL properly
            const baseUrl = this.apiBaseUrl.endsWith('/') ? this.apiBaseUrl.slice(0, -1) : this.apiBaseUrl;
            const fullUrl = `${baseUrl}/translation/translate-batch`;
            const url = new URL(fullUrl);
            const protocol = url.protocol === "https:" ? https : http;
            const postData = JSON.stringify(requestBody);
            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(postData),
                    "X-Api-Key": this.apiKey,
                    "Accept": "*/*",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Connection": "keep-alive",
                    "User-Agent": "nextjs-auto-translate/1.0",
                },
            };
            const req = protocol.request(options, (res) => {
                // Handle compressed responses
                let stream = res;
                const encoding = res.headers['content-encoding'];
                if (encoding === 'gzip') {
                    stream = res.pipe(zlib.createGunzip());
                }
                else if (encoding === 'deflate') {
                    stream = res.pipe(zlib.createInflate());
                }
                else if (encoding === 'br') {
                    stream = res.pipe(zlib.createBrotliDecompress());
                }
                let data = "";
                stream.on("data", (chunk) => {
                    data += chunk.toString();
                });
                stream.on("end", () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const response = JSON.parse(data);
                            1;
                            // Validate response structure
                            if (response.status !== "ok" || !response.data || !response.data.translations) {
                                reject(new Error(`Invalid response structure: ${data}`));
                                return;
                            }
                            resolve(response);
                        }
                        catch (error) {
                            reject(new Error(`Failed to parse response: ${error instanceof Error ? error.message : String(error)}`));
                        }
                    }
                    else {
                        reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
                    }
                });
            });
            req.on("error", (error) => {
                reject(new Error(`Network error: ${error.message}`));
            });
            req.write(postData);
            req.end();
        });
    }
    /**
     * Translate all texts for multiple locales efficiently
     */
    async translateForMultipleLocales(texts, targetLocales, sourceLocale = "en") {
        const results = {};
        // Translate for each target locale
        for (const targetLocale of targetLocales) {
            results[targetLocale] = await this.translateBatch(texts, targetLocale, sourceLocale);
        }
        return results;
    }
}
