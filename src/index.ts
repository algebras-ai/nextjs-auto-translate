// src/index.ts
import fs from "fs";
import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { Parser } from "./parser/Parser.js";
import { DictionaryGenerator } from "./translator/DictionaryGenerator.js";
import { AlgebrasTranslationProvider } from "./translator/AlgebrasTranslationProvider.js";
import { ScopeMap } from "./types.js";
import { LanguageCode } from "./data/languageMap.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Re-export commonly used types and components
export { LanguageCode } from "./data/languageMap.js";
export { AlgebrasTranslationProvider } from "./translator/AlgebrasTranslationProvider.js";
export { DictionaryGenerator } from "./translator/DictionaryGenerator.js";
// Note: AlgebrasIntlProvider should be imported directly from the runtime path
// export { default as AlgebrasIntlProvider } from "./runtime/server/Provider.js";

let hasScheduled = false;
let cachedSourceMap: ScopeMap | null = null;

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export interface PluginOptions {
  defaultLocale: LanguageCode;
  targetLocales: LanguageCode[];
  includeNodeModules?: boolean;
  outputDir?: string;
  translationApiKey?: string;
  translationApiUrl?: string;
}

export default function myPlugin(options: PluginOptions) {
  const {
    defaultLocale = "en",
    targetLocales,
    includeNodeModules = false,
    outputDir = "./src/intl"
  } = options;

  process.env.ALGEBRAS_INTL_OUTPUT_DIR = outputDir;

  const scheduledFlagPath = path.resolve(
    process.cwd(),
    outputDir,
    ".scheduled"
  );
  const parserLockPath = path.resolve(process.cwd(), outputDir, ".lock");

  async function prepareSourceMap() {
    try {
      const parser = new Parser({ includeNodeModules, outputDir });
      const sourceMap = parser.parseProject();
      cachedSourceMap = sourceMap;

      // Create translation provider if API key is provided
      let translationProvider: AlgebrasTranslationProvider | undefined;
      const apiKey = options.translationApiKey || process.env.ALGEBRAS_API_KEY;
      const apiUrl = options.translationApiUrl || process.env.ALGEBRAS_API_URL;

      console.log("\n========================================");
      console.log("[AlgebrasIntl] Translation Configuration:");
      console.log("  API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "NOT FOUND");
      console.log("  API URL:", apiUrl || "https://beta.algebras.ai/api/v1");
      console.log("  Target Locales:", targetLocales.join(", "));
      console.log("========================================\n");

      if (apiKey) {
        console.log("[AlgebrasIntl] ✅ Using Algebras AI translation service");
        translationProvider = new AlgebrasTranslationProvider({
          apiKey,
          apiUrl: apiUrl || "https://platform.algebras.ai/api/v1"
        });
      } else {
        console.warn("[AlgebrasIntl] ⚠️  No API key found!");
        console.warn("[AlgebrasIntl] Set ALGEBRAS_API_KEY in your .env file or pass translationApiKey in config");
        console.warn("[AlgebrasIntl] Falling back to mock translations...\n");
      }

      const dictionaryGenerator = new DictionaryGenerator({
        defaultLocale,
        targetLocales,
        outputDir,
        translationProvider
      });
      await dictionaryGenerator.generateDictionary(sourceMap);

      fs.writeFileSync(
        path.resolve(outputDir, "source.json"),
        JSON.stringify(sourceMap, null, 2),
        "utf-8"
      );
    } catch (err) {
      console.error("❌ Failed to parse/generate source map:", err);
      cachedSourceMap = null;
    }
  }

  function wrapWebpack(
    nextWebpack?: NextConfig["webpack"]
  ): NextConfig["webpack"] {
    // Call prepareSourceMap without awaiting (runs in background)
    prepareSourceMap().catch((err) => {
      console.error("❌ Background source map preparation failed:", err);
    });
    return function webpack(config, options) {
      config.module.rules.push({
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: path.resolve(__dirname, "./webpack/auto-intl-loader.js"),
            options: {
              sourceMap: cachedSourceMap ?? {}
            }
          }
        ]
      });

      if (typeof nextWebpack === "function") {
        return nextWebpack(config, options);
      }

      return config;
    };
  }

  function wrapTurbopack(
    nextTurbopack?: any
  ): any {
    // Call prepareSourceMap without awaiting (runs in background)
    prepareSourceMap().catch((err) => {
      console.error("❌ Background source map preparation failed:", err);
    });

    const transformerPath = path.resolve(__dirname, "./turbopack/auto-intl-transformer.js");
    
    // Use explicit patterns for common Next.js source directories to avoid matching node_modules
    // The transformer itself also checks for node_modules as a fallback
    const sourcePatterns = [
      "app/**/*.{js,jsx,ts,tsx}",
      "src/**/*.{js,jsx,ts,tsx}",
      "pages/**/*.{js,jsx,ts,tsx}",
      "components/**/*.{js,jsx,ts,tsx}",
      "lib/**/*.{js,jsx,ts,tsx}",
      "utils/**/*.{js,jsx,ts,tsx}",
      "hooks/**/*.{js,jsx,ts,tsx}",
      "styles/**/*.{js,jsx,ts,tsx}"
    ];
    
    const rules: Record<string, any> = { ...nextTurbopack?.rules };
    
    // Add a rule for each source directory pattern
    for (const pattern of sourcePatterns) {
      rules[pattern] = {
        loaders: [
          {
            loader: transformerPath,
            options: {
              sourceMap: cachedSourceMap ?? {},
              outputDir
            }
          }
        ],
        as: "*.{js,jsx,ts,tsx}"
      };
    }
    
    return {
      ...nextTurbopack,
      rules
    };
  }

  return function wrapNextConfig(nextConfig: Partial<Record<string, any>>) {
    const config: Partial<Record<string, any>> = { ...nextConfig };

    // Helper to set both webpack and turbopack configs
    const applyConfigs = () => {
      // Always configure webpack (for webpack builds)
      config.webpack = wrapWebpack(nextConfig.webpack);
      
      // Always configure turbopack (for Turbopack builds)
      // Next.js 15/16 uses `turbopack` directly, not `experimental.turbo`
      const existingTurbopack = (config as any).turbopack || (config.experimental as any)?.turbo;
      const wrappedTurbopack = wrapTurbopack(existingTurbopack);
      
      // Always set turbopack directly (Next.js 15/16)
      (config as any).turbopack = wrappedTurbopack;
      
      // Also set experimental.turbo for older Next.js versions that might use it
      if (!config.experimental) {
        config.experimental = {};
      }
      (config.experimental as any).turbo = wrappedTurbopack;
    };

    if (hasScheduled) {
      applyConfigs();
      return config;
    }

    if (fs.existsSync(scheduledFlagPath)) {
      const flagPid = parseInt(fs.readFileSync(scheduledFlagPath, "utf-8"));
      if (isProcessAlive(flagPid)) {
        applyConfigs();
        return config;
      } else {
        fs.unlinkSync(scheduledFlagPath);
      }
    }

    hasScheduled = true;
    fs.mkdirSync(path.dirname(scheduledFlagPath), { recursive: true });
    fs.writeFileSync(scheduledFlagPath, process.pid.toString());
    if (fs.existsSync(parserLockPath)) fs.unlinkSync(parserLockPath);

    applyConfigs();
    return config;
  };
}
