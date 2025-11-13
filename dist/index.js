// src/index.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Parser } from "./parser/Parser.js";
import { DictionaryGenerator } from "./translator/DictionaryGenerator.js";
import { AlgebrasTranslationProvider } from "./translator/AlgebrasTranslationProvider.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Re-export commonly used types and components
export { LanguageCode } from "./data/languageMap.js";
export { AlgebrasTranslationProvider } from "./translator/AlgebrasTranslationProvider.js";
export { DictionaryGenerator } from "./translator/DictionaryGenerator.js";
// Note: AlgebrasIntlProvider should be imported directly from the runtime path
// export { default as AlgebrasIntlProvider } from "./runtime/server/Provider.js";
let hasScheduled = false;
let cachedSourceMap = null;
function isProcessAlive(pid) {
    try {
        process.kill(pid, 0);
        return true;
    }
    catch {
        return false;
    }
}
export default function myPlugin(options) {
    const { defaultLocale = "en", targetLocales, includeNodeModules = false, outputDir = "./src/intl" } = options;
    process.env.ALGEBRAS_INTL_OUTPUT_DIR = outputDir;
    const scheduledFlagPath = path.resolve(process.cwd(), outputDir, ".scheduled");
    const parserLockPath = path.resolve(process.cwd(), outputDir, ".lock");
    async function prepareSourceMap() {
        try {
            const parser = new Parser({ includeNodeModules, outputDir });
            const sourceMap = parser.parseProject();
            cachedSourceMap = sourceMap;
            // Create translation provider if API key is provided
            let translationProvider;
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
            }
            else {
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
            fs.writeFileSync(path.resolve(outputDir, "source.json"), JSON.stringify(sourceMap, null, 2), "utf-8");
        }
        catch (err) {
            console.error("❌ Failed to parse/generate source map:", err);
            cachedSourceMap = null;
        }
    }
    function wrapWebpack(nextWebpack) {
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
    return function wrapNextConfig(nextConfig) {
        if (hasScheduled) {
            return {
                ...nextConfig,
                webpack: wrapWebpack(nextConfig.webpack)
            };
        }
        if (fs.existsSync(scheduledFlagPath)) {
            const flagPid = parseInt(fs.readFileSync(scheduledFlagPath, "utf-8"));
            if (isProcessAlive(flagPid)) {
                return {
                    ...nextConfig,
                    webpack: wrapWebpack(nextConfig.webpack)
                };
            }
            else {
                fs.unlinkSync(scheduledFlagPath);
            }
        }
        hasScheduled = true;
        fs.mkdirSync(path.dirname(scheduledFlagPath), { recursive: true });
        fs.writeFileSync(scheduledFlagPath, process.pid.toString());
        if (fs.existsSync(parserLockPath))
            fs.unlinkSync(parserLockPath);
        return {
            ...nextConfig,
            webpack: wrapWebpack(nextConfig.webpack)
        };
    };
}
