import type { NextConfig } from "next";
export default function myPlugin(options?: {
    includeNodeModules?: boolean;
    targetLocales?: string[];
    outputDir?: string;
}): (nextConfig: NextConfig) => NextConfig;
