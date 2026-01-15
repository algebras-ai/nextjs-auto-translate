import { ITranslateProvider } from './Translator';
export interface AlgebrasTranslationOptions {
    apiKey: string;
    apiUrl?: string;
    glossaryId?: string | null;
    prompt?: string | null;
    flag?: boolean;
    ignoreCache?: boolean;
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
    translations: string[];
}
export interface AlgebrasAPIResponse {
    status: string;
    timestamp: string;
    data: {
        translations: Array<{
            index: number;
            content: string;
        }>;
        batch_summary: {
            total: number;
            successful: number;
            failed: number;
            total_credits: number;
        };
        word_count: number;
    };
}
export declare class AlgebrasTranslationProvider implements ITranslateProvider {
    private apiKey;
    private apiUrl;
    private glossaryId?;
    private prompt?;
    private flag?;
    private ignoreCache?;
    private cache;
    private quotaExceeded;
    private rateLimitExceeded;
    constructor(options: AlgebrasTranslationOptions);
    /**
     * Translate a single text to a target language
     */
    translateText(text: string, targetLang: string): Promise<string>;
    /**
     * Translate multiple texts to a single target language using batch endpoint
     */
    translateBatch(texts: string[], targetLanguage: string, sourceLanguage?: string): Promise<BatchTranslationResponse>;
    /**
     * Optimized translation for entire dictionary generation
     * Batches all texts and processes each language separately
     */
    translateAll(textsMap: Map<string, string>, targetLanguages: string[], sourceLanguage?: string): Promise<Map<string, Map<string, string>>>;
}
