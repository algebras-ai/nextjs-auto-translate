"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionaryGenerator = exports.AlgebrasTranslationProvider = exports.LanguageCode = void 0;
exports.default = myPlugin;
// src/index.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Parser_1 = require("./parser/Parser");
const AlgebrasTranslationProvider_1 = require("./translator/AlgebrasTranslationProvider");
const DictionaryGenerator_1 = require("./translator/DictionaryGenerator");
const constants_1 = require("./constants");
// Re-export commonly used types and components
var languageMap_1 = require("./data/languageMap");
Object.defineProperty(exports, "LanguageCode", { enumerable: true, get: function () { return languageMap_1.LanguageCode; } });
var AlgebrasTranslationProvider_2 = require("./translator/AlgebrasTranslationProvider");
Object.defineProperty(exports, "AlgebrasTranslationProvider", { enumerable: true, get: function () { return AlgebrasTranslationProvider_2.AlgebrasTranslationProvider; } });
var DictionaryGenerator_2 = require("./translator/DictionaryGenerator");
Object.defineProperty(exports, "DictionaryGenerator", { enumerable: true, get: function () { return DictionaryGenerator_2.DictionaryGenerator; } });
// Note: AlgebrasIntlProvider should be imported directly from the runtime path
// export { default as AlgebrasIntlProvider } from "./runtime/server/Provider";
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
function myPlugin(options) {
    const { defaultLocale = 'en', targetLocales, includeNodeModules = false, outputDir = './src/intl', } = options;
    process.env.ALGEBRAS_INTL_OUTPUT_DIR = outputDir;
    const scheduledFlagPath = path_1.default.resolve(process.cwd(), outputDir, '.scheduled');
    const parserLockPath = path_1.default.resolve(process.cwd(), outputDir, '.lock');
    async function prepareSourceMap() {
        try {
            const parser = new Parser_1.Parser({ includeNodeModules, outputDir });
            const sourceMap = parser.parseProject();
            cachedSourceMap = sourceMap;
            // Create translation provider if API key is provided
            let translationProvider;
            const apiKey = options.translationApiKey || process.env.ALGEBRAS_API_KEY;
            const apiUrl = options.translationApiUrl || process.env.ALGEBRAS_API_URL;
            if (apiKey) {
                translationProvider = new AlgebrasTranslationProvider_1.AlgebrasTranslationProvider({
                    apiKey,
                    apiUrl: apiUrl || 'https://platform.algebras.ai/api/v1',
                });
            }
            else {
                console.warn('[AlgebrasIntl] ⚠️  No API key found!');
                console.warn('[AlgebrasIntl] Set ALGEBRAS_API_KEY in your .env file or pass translationApiKey in config');
                console.warn('[AlgebrasIntl] Falling back to mock translations...\n');
            }
            const dictionaryGenerator = new DictionaryGenerator_1.DictionaryGenerator({
                defaultLocale,
                targetLocales,
                outputDir,
                translationProvider,
            });
            await dictionaryGenerator.generateDictionary(sourceMap);
            fs_1.default.writeFileSync(path_1.default.resolve(outputDir, 'source.json'), JSON.stringify(sourceMap, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('❌ Failed to parse/generate source map:', err);
            cachedSourceMap = null;
        }
    }
    function wrapWebpack(nextWebpack) {
        // Call prepareSourceMap without awaiting (runs in background)
        prepareSourceMap().catch((err) => {
            console.error('❌ Background source map preparation failed:', err);
        });
        return function webpack(config, options) {
            config.module.rules.push({
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: path_1.default.resolve(__dirname, './webpack/auto-intl-loader.js'),
                        options: {
                            sourceMap: cachedSourceMap ?? {},
                            outputDir,
                        },
                    },
                ],
            });
            if (typeof nextWebpack === 'function') {
                return nextWebpack(config, options);
            }
            return config;
        };
    }
    function wrapTurbopack(nextTurbopack) {
        // Call prepareSourceMap without awaiting (runs in background)
        prepareSourceMap().catch((err) => {
            console.error('❌ Background source map preparation failed:', err);
        });
        // Use relative path from node_modules - Turbopack needs serializable paths
        // The transformer will be resolved from node_modules
        const transformerPath = constants_1.RUNTIME_PATHS.TURBOPACK_TRANSFORMER;
        // Turbopack rules format for Next.js 16
        // Options must be JSON-serializable, so we only pass outputDir
        // The transformer will load sourceMap from disk
        const rules = { ...nextTurbopack?.rules };
        // Add rules for TypeScript/JavaScript files
        // Turbopack uses glob patterns similar to webpack
        const patterns = [
            '*.{js,jsx,ts,tsx}',
            'app/**/*.{js,jsx,ts,tsx}',
            'src/**/*.{js,jsx,ts,tsx}',
            'pages/**/*.{js,jsx,ts,tsx}',
            'components/**/*.{js,jsx,ts,tsx}',
            'lib/**/*.{js,jsx,ts,tsx}',
            'utils/**/*.{js,jsx,ts,tsx}',
            'hooks/**/*.{js,jsx,ts,tsx}',
        ];
        for (const pattern of patterns) {
            // Turbopack format: { loaders: [loaderPath] }
            // Don't set 'as' - let Turbopack preserve the original file type (tsx/jsx)
            // Options must be JSON-serializable - only pass outputDir, not the full sourceMap
            rules[pattern] = {
                loaders: [transformerPath],
                // Pass only serializable options
                options: {
                    outputDir,
                },
            };
        }
        // Return config with rules - Next.js 16 format
        const result = {
            ...nextTurbopack,
            rules,
        };
        return result;
    }
    return function wrapNextConfig(nextConfig) {
        const config = { ...nextConfig };
        // Helper to set both webpack and turbopack configs
        const applyConfigs = () => {
            // Always configure webpack (for webpack builds)
            config.webpack = wrapWebpack(nextConfig.webpack);
            // Always configure turbopack (for Turbopack builds)
            // Next.js 16 uses `turbopack` directly at the top level
            const existingTurbopack = config.turbopack;
            const wrappedTurbopack = wrapTurbopack(existingTurbopack);
            // Set turbopack directly (Next.js 16)
            config.turbopack = wrappedTurbopack;
        };
        if (hasScheduled) {
            applyConfigs();
            return config;
        }
        if (fs_1.default.existsSync(scheduledFlagPath)) {
            const flagPid = parseInt(fs_1.default.readFileSync(scheduledFlagPath, 'utf-8'));
            if (isProcessAlive(flagPid)) {
                applyConfigs();
                return config;
            }
            else {
                fs_1.default.unlinkSync(scheduledFlagPath);
            }
        }
        hasScheduled = true;
        fs_1.default.mkdirSync(path_1.default.dirname(scheduledFlagPath), { recursive: true });
        fs_1.default.writeFileSync(scheduledFlagPath, process.pid.toString());
        if (fs_1.default.existsSync(parserLockPath))
            fs_1.default.unlinkSync(parserLockPath);
        applyConfigs();
        return config;
    };
}
