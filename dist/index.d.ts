import type { NextConfig } from "next";
export interface PluginOptions {
    defaultLocale: string;
    targetLocales: string[];
    includeNodeModules?: boolean;
    outputDir?: string;
}
export default function myPlugin(options: PluginOptions): (nextConfig: NextConfig) => NextConfig;
