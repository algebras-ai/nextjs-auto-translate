export declare function setOutputDir(outputDir: string): void;
export declare function getOutputDir(): string;
export declare function translate(scope: string, locale?: string, outputDir?: string): string;
export declare function t(scope: string): string;
export declare function translateScope(filePath: string, scopePath: string, locale?: string, outputDir?: string): string;
export declare function configure(options: {
    locale?: string;
    outputDir?: string;
}): void;
export declare function translateWithFallback(scope: string, fallback: string, locale?: string, outputDir?: string): string;
