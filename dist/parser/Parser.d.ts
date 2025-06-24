import { ScopeMap, ParserOptions } from "../types";
export declare class Parser {
    private options;
    private lockPath;
    private sourceStore;
    constructor(options?: ParserOptions & {
        outputDir?: string;
    });
    parseProject(): Promise<ScopeMap>;
    private hasChanges;
}
