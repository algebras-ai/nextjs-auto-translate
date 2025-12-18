import { LanguageCode } from './data/languageMap';
export { LanguageCode } from './data/languageMap';
export { AlgebrasTranslationProvider } from './translator/AlgebrasTranslationProvider';
export { DictionaryGenerator } from './translator/DictionaryGenerator';
export interface PluginOptions {
    defaultLocale: LanguageCode;
    targetLocales: LanguageCode[];
    includeNodeModules?: boolean;
    outputDir?: string;
    translationApiKey?: string;
    translationApiUrl?: string;
}
export default function myPlugin(options: PluginOptions): (nextConfig: Partial<Record<string, any>>) => Partial<Record<string, any>>;
