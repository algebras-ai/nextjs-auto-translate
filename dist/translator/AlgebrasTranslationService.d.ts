export interface AlgebrasTranslationOptions {
    apiKey: string;
    apiBaseUrl?: string;
    batchSize?: number;
    retryAttempts?: number;
    retryDelay?: number;
}
export interface BatchTranslationRequest {
    sourceLanguage: string;
    targetLanguage: string;
    texts: string[];
}
export interface BatchTranslationResponse {
    translations: string[];
}
export declare class AlgebrasTranslationService {
    private apiKey;
    private apiBaseUrl;
    private batchSize;
    private retryAttempts;
    private retryDelay;
    constructor(options: AlgebrasTranslationOptions);
    /**
     * Translate a single text string
     */
    translate(text: string, targetLocale: string, sourceLocale?: string): Promise<string>;
    /**
     * Translate multiple texts in a single batch request
     */
    translateBatch(texts: string[], targetLocale: string, sourceLocale?: string): Promise<string[]>;
    /**
     * Make HTTP request to Algebras API
     */
    private makeRequest;
    /**
     * Translate all texts for multiple locales efficiently
     */
    translateForMultipleLocales(texts: string[], targetLocales: string[], sourceLocale?: string): Promise<Record<string, string[]>>;
}
