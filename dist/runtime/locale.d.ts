export declare function setLocale(locale: string): void;
export declare function getLocale(): string;
export declare function detectServerLocale(options?: {
    req?: any;
    defaultLocale?: string;
}): string;
export declare function detectBrowserLocale(defaultLocale?: string): string;
