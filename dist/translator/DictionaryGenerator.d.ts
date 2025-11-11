import { ScopeMap } from "../types";
export interface DictionaryGeneratorOptions {
    defaultLocale: string;
    targetLocales: string[];
    outputDir: string;
    algebrasApiKey?: string;
    useMockTranslation?: boolean;
    batchSize?: number;
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
    private useMockTranslation;
    constructor(options: DictionaryGeneratorOptions);
    generateDictionary(sourceMap: ScopeMap): Promise<string>;
    private writeDictionaryFiles;
}
