import type { NextConfig } from "next";
import { LanguageCode } from "./data/languageMap.js";
export { LanguageCode } from "./data/languageMap.js";
export { default as AlgebrasIntlProvider } from "./runtime/server/Provider.js";
export interface PluginOptions {
    defaultLocale: LanguageCode;
    targetLocales: LanguageCode[];
    includeNodeModules?: boolean;
    outputDir?: string;
}
export default function myPlugin(options: PluginOptions): (nextConfig: NextConfig) => NextConfig;
