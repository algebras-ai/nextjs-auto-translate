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
      
      // Transform files directly on disk (for Turbopack compatibility)
      // Since Turbopack doesn't use webpack loaders, we transform files directly
      const { transformProject } = await import("./transformer/Injector.js");
      const appDir = path.resolve(process.cwd(), "app");
      
      if (fs.existsSync(appDir) && sourceMap.files) {
        const findAndTransform = (dir: string) => {
          try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);
              if (entry.isDirectory()) {
                findAndTransform(fullPath);
              } else if ((entry.name === "page.tsx" || entry.name === "page.jsx") && sourceMap.files) {
                const relativePath = path.relative(process.cwd(), fullPath);
                if (sourceMap.files[relativePath]) {
                  try {
                    const originalCode = fs.readFileSync(fullPath, "utf-8");
                    const transformedCode = transformProject(originalCode, {
                      sourceMap,
                      filePath: fullPath
                    });
                    
                    if (originalCode !== transformedCode) {
                      fs.writeFileSync(fullPath, transformedCode, "utf-8");
                      console.log(`[AlgebrasIntl] ✅ Transformed file: ${relativePath}`);
                    }
                  } catch (err) {
                    console.error(`[AlgebrasIntl] ❌ Error transforming ${relativePath}:`, err);
                  }
                }
              }
            }
          } catch (err) {
            // Ignore directory read errors
          }
        };
        
        findAndTransform(appDir);
      }
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

  function wrapTurbopack(nextConfig: Partial<Record<string, any>>) {
    // Call prepareSourceMap without awaiting (runs in background)
    prepareSourceMap().catch((err) => {
      console.error("❌ Background source map preparation failed:", err);
    });

    // Configure Turbopack loaders
    // Turbopack uses experimental.turbo.loaders to register custom loaders
    const turboLoaders: Record<string, string | string[]> = nextConfig.experimental?.turbo?.loaders || {};
    
    // Use the package export path for the Turbopack loader
    const loaderPath = "algebras-auto-intl/turbopack/auto-intl-transformer";
    
    // Register loader for TS/TSX/JS/JSX files
    const filePatterns = ["*.tsx", "*.ts", "*.jsx", "*.js"];
    
    filePatterns.forEach((pattern) => {
      if (!turboLoaders[pattern]) {
        turboLoaders[pattern] = loaderPath;
      } else if (Array.isArray(turboLoaders[pattern])) {
        // If it's already an array, append our loader
        (turboLoaders[pattern] as string[]).push(loaderPath);
      } else {
        // If it's a string, convert to array
        const existingLoader = turboLoaders[pattern] as string;
        turboLoaders[pattern] = [existingLoader, loaderPath];
      }
    });

    return {
      ...nextConfig,
      experimental: {
        ...nextConfig.experimental,
        turbo: {
          ...nextConfig.experimental?.turbo,
          loaders: turboLoaders
        }
      },
      // Also keep webpack config for fallback when not using Turbopack
      webpack: wrapWebpack(nextConfig.webpack)
    };
  }

  return function wrapNextConfig(nextConfig: Partial<Record<string, any>>) {
    if (hasScheduled) {
      return wrapTurbopack({
        ...nextConfig,
        webpack: wrapWebpack(nextConfig.webpack)
      });
    }

    if (fs.existsSync(scheduledFlagPath)) {
      const flagPid = parseInt(fs.readFileSync(scheduledFlagPath, "utf-8"));
      if (isProcessAlive(flagPid)) {
        return wrapTurbopack({
          ...nextConfig,
          webpack: wrapWebpack(nextConfig.webpack)
        });
      } else {
        fs.unlinkSync(scheduledFlagPath);
      }
    }

    hasScheduled = true;
    fs.mkdirSync(path.dirname(scheduledFlagPath), { recursive: true });
    fs.writeFileSync(scheduledFlagPath, process.pid.toString());
    if (fs.existsSync(parserLockPath)) fs.unlinkSync(parserLockPath);

    return wrapTurbopack({
      ...nextConfig,
      webpack: wrapWebpack(nextConfig.webpack)
    });
  };
}
