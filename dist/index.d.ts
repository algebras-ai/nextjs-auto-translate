import { LanguageCode } from "./data/languageMap.js";
export { LanguageCode } from "./data/languageMap.js";
export { AlgebrasTranslationProvider } from "./translator/AlgebrasTranslationProvider.js";
export { DictionaryGenerator } from "./translator/DictionaryGenerator.js";
export interface PluginOptions {
    defaultLocale: LanguageCode;
    targetLocales: LanguageCode[];
    includeNodeModules?: boolean;
    outputDir?: string;
    translationApiKey?: string;
    translationApiUrl?: string;
}
export default function myPlugin(options: PluginOptions): (nextConfig: Partial<Record<string, any>>) => Partial<Record<string, any>>;
