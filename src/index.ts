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
      // Check if source.json already exists and has data
      const sourceMapPath = path.resolve(outputDir, "source.json");
      if (fs.existsSync(sourceMapPath)) {
        try {
          const existingSourceMap = JSON.parse(fs.readFileSync(sourceMapPath, "utf-8")) as ScopeMap;
          if (existingSourceMap.files && Object.keys(existingSourceMap.files).length > 0) {
            console.log(`[AlgebrasIntl] ✅ Using existing sourceMap with ${Object.keys(existingSourceMap.files).length} files`);
            cachedSourceMap = existingSourceMap;
            // Still generate dictionary in case translations are missing
            const apiKey = options.translationApiKey || process.env.ALGEBRAS_API_KEY;
            const apiUrl = options.translationApiUrl || process.env.ALGEBRAS_API_URL;
            
            let translationProvider: AlgebrasTranslationProvider | undefined;
            if (apiKey) {
              translationProvider = new AlgebrasTranslationProvider({
                apiKey,
                apiUrl: apiUrl || "https://platform.algebras.ai/api/v1"
              });
            }
            
            const dictionaryGenerator = new DictionaryGenerator({
              defaultLocale,
              targetLocales,
              outputDir,
              translationProvider
            });
            await dictionaryGenerator.generateDictionary(existingSourceMap);
            return;
          }
        } catch (err) {
          // If source.json is corrupted, continue to parse
        }
      }
      
      // Clear lock file to force fresh parse
      const lockPath = path.resolve(process.cwd(), outputDir, ".lock");
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath);
      }
      
      const parser = new Parser({ includeNodeModules, outputDir });
      const sourceMap = parser.parseProject();
      cachedSourceMap = sourceMap;
      
      // If sourceMap is empty, log warning
      if (!sourceMap.files || Object.keys(sourceMap.files).length === 0) {
        console.warn("[AlgebrasIntl] ⚠️  SourceMap is empty! Files may already be transformed.");
        console.warn("[AlgebrasIntl] 💡 Try: rm -rf src/intl/.lock src/intl/.scheduled src/intl/source.json && git restore app/page.tsx");
        return;
      }

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
      // Preserve existing resolve configuration
      if (!config.resolve) {
        config.resolve = {};
      }
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }
      
      // Enable symlinks resolution (important for npm link)
      config.resolve.symlinks = true;
      
      // Ensure package.json exports are resolved
      if (!config.resolve.conditionNames) {
        config.resolve.conditionNames = ["require", "node", "import", "default"];
      }
      
      // Help resolve the linked package (for npm link scenarios)
      const linkedPackagePath = path.resolve(process.cwd(), "node_modules/algebras-auto-intl");
      let realPackagePath: string | null = null;
      
      try {
        if (fs.existsSync(linkedPackagePath)) {
          realPackagePath = fs.realpathSync(linkedPackagePath);
        }
      } catch {
        // If realpath fails, use the symlink path
        if (fs.existsSync(linkedPackagePath)) {
          realPackagePath = linkedPackagePath;
        }
      }
      
      if (realPackagePath && fs.existsSync(realPackagePath)) {
        // Resolve main package
        if (!config.resolve.alias["algebras-auto-intl"]) {
          config.resolve.alias["algebras-auto-intl"] = realPackagePath;
        }
        
        // Resolve subpaths (critical for exports like /runtime/server)
        const subpaths = [
          "runtime",
          "runtime/server",
          "runtime/server/IntlWrapper",
          "runtime/client",
          "runtime/client/components/Translated",
          "runtime/client/components/LocaleSwitcher",
          "webpack/auto-intl-loader",
          "turbopack/auto-intl-transformer"
        ];
        
        subpaths.forEach((subpath) => {
          const aliasKey = `algebras-auto-intl/${subpath}`;
          if (!config.resolve.alias[aliasKey]) {
            // For runtime/server, point directly to Provider.js
            if (subpath === "runtime/server") {
              const providerPath = path.join(realPackagePath, "dist", subpath, "Provider.js");
              if (fs.existsSync(providerPath)) {
                config.resolve.alias[aliasKey] = providerPath;
              }
            } else if (subpath === "runtime/client") {
              const providerPath = path.join(realPackagePath, "dist", subpath, "Provider.js");
              if (fs.existsSync(providerPath)) {
                config.resolve.alias[aliasKey] = providerPath;
              }
            } else {
              // For other subpaths, try .js extension first
              const subpathFile = path.join(realPackagePath, "dist", subpath);
              if (fs.existsSync(subpathFile + ".js")) {
                config.resolve.alias[aliasKey] = subpathFile + ".js";
              } else if (fs.existsSync(subpathFile)) {
                config.resolve.alias[aliasKey] = subpathFile;
              }
            }
          }
        });
      }
      
      // Add our loader rule
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

    // Resolve npm-linked packages
    let linkedPackagePath: string | null = null;
    try {
      const linkedPath = path.resolve(process.cwd(), "node_modules/algebras-auto-intl");
      if (fs.existsSync(linkedPath)) {
        linkedPackagePath = fs.realpathSync(linkedPath);
      }
    } catch {
      if (fs.existsSync(path.resolve(process.cwd(), "node_modules/algebras-auto-intl"))) {
        linkedPackagePath = path.resolve(process.cwd(), "node_modules/algebras-auto-intl");
      }
    }

    // Configure webpack for module resolution (needed even with Turbopack)
    const webpackConfigFn = wrapWebpack(nextConfig.webpack);
    
    const config: Partial<Record<string, any>> = {
      ...nextConfig,
      // Add transpilePackages for npm-linked packages
      transpilePackages: [
        ...(nextConfig.transpilePackages || []),
        "algebras-auto-intl"
      ],
      // Webpack config is needed for resolve.alias even with Turbopack
      webpack: webpackConfigFn
    };

    // Configure outputFileTracingRoot for Turbopack to resolve linked packages
    if (linkedPackagePath) {
      const projectRoot = process.cwd();
      const parentDir = path.dirname(projectRoot);
      // Only set if the linked package is actually outside the project root
      if (linkedPackagePath.startsWith(parentDir)) {
        config.outputFileTracingRoot = parentDir;
      }
    }
    
    return config;
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
