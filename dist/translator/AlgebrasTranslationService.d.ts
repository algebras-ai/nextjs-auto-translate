export interface AlgebrasTranslationOptions {
    apiKey: string;
    apiBaseUrl?: string;
    batchSize?: number;
    retryAttempts?: number;
    retryDelay?: number;
}
export interface BatchTranslationRequest {
    texts: string[];
    sourceLanguage: string;
    targetLanguage: string;
    glossaryId?: string | null;
    prompt?: string | null;
    flag?: boolean;
    ignoreCache?: boolean;
}
export interface BatchTranslationResponse {
    status: string;
    timestamp: string;
    data: {
        translations: Array<{
            index: number;
            content: string;
            warning?: string;
            error?: string;
            status_code?: number;
        }>;
        batch_summary: {
            total: number;
            successful: number;
            failed: number;
            total_credits: number;
        };
    };
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
