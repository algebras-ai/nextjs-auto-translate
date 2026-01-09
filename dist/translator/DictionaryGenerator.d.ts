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
export declare class DictionaryGenerator {
    private options;
    private translationService;
    private translationProvider?;
    constructor(options: DictionaryGeneratorOptions);
    private preserveEdgeWhitespace;
    /**
     * Try to load existing dictionary.json from outputDir.
     * Returns null if file doesn't exist or cannot be parsed.
     */
    private loadExistingDictionary;
    generateDictionary(sourceMap: ScopeMap): Promise<string>;
    /**
     * Generate dictionary using Algebras AI with incremental behavior:
     * - reuse existing translations when hash matches
     * - call API only for new/changed scopes or for locales that are missing
     */
    private generateWithAlgebrasAI;
    private generateWithMockTranslation;
    private writeDictionaryFiles;
}
