// src/index.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Parser } from './parser/Parser.js';
import { DictionaryGenerator } from './translator/DictionaryGenerator.js';
import { AlgebrasTranslationProvider } from './translator/AlgebrasTranslationProvider.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Re-export commonly used types and components
export { LanguageCode } from './data/languageMap.js';
export { AlgebrasTranslationProvider } from './translator/AlgebrasTranslationProvider.js';
export { DictionaryGenerator } from './translator/DictionaryGenerator.js';
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
    const { defaultLocale = 'en', targetLocales, includeNodeModules = false, outputDir = './src/intl', } = options;
    process.env.ALGEBRAS_INTL_OUTPUT_DIR = outputDir;
    const scheduledFlagPath = path.resolve(process.cwd(), outputDir, '.scheduled');
    const parserLockPath = path.resolve(process.cwd(), outputDir, '.lock');
    async function prepareSourceMap() {
        try {
            const parser = new Parser({ includeNodeModules, outputDir });
            const sourceMap = parser.parseProject();
            cachedSourceMap = sourceMap;
            // Create translation provider if API key is provided
            let translationProvider;
            const apiKey = options.translationApiKey || process.env.ALGEBRAS_API_KEY;
            const apiUrl = options.translationApiUrl || process.env.ALGEBRAS_API_URL;
            console.log('\n========================================');
            console.log('[AlgebrasIntl] Translation Configuration:');
            console.log('  API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
            console.log('  API URL:', apiUrl || 'https://beta.algebras.ai/api/v1');
            console.log('  Target Locales:', targetLocales.join(', '));
            console.log('========================================\n');
            if (apiKey) {
                console.log('[AlgebrasIntl] ✅ Using Algebras AI translation service');
                translationProvider = new AlgebrasTranslationProvider({
                    apiKey,
                    apiUrl: apiUrl || 'https://platform.algebras.ai/api/v1',
                });
            }
            else {
                console.warn('[AlgebrasIntl] ⚠️  No API key found!');
                console.warn('[AlgebrasIntl] Set ALGEBRAS_API_KEY in your .env file or pass translationApiKey in config');
                console.warn('[AlgebrasIntl] Falling back to mock translations...\n');
            }
            const dictionaryGenerator = new DictionaryGenerator({
                defaultLocale,
                targetLocales,
                outputDir,
                translationProvider,
            });
            await dictionaryGenerator.generateDictionary(sourceMap);
            fs.writeFileSync(path.resolve(outputDir, 'source.json'), JSON.stringify(sourceMap, null, 2), 'utf-8');
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
                        loader: path.resolve(__dirname, './webpack/auto-intl-loader.js'),
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
        // The transformer will be resolved from node_modules/nextjs-auto-intl
        const transformerPath = 'nextjs-auto-intl/turbopack/auto-intl-transformer';
        console.log(`[AutoIntl] 🔧 Configuring Turbopack transformer: ${transformerPath}`);
        console.log(`[AutoIntl] 📁 Output dir: ${outputDir}`);
        console.log(`[AutoIntl] 📊 SourceMap cached: ${cachedSourceMap ? Object.keys(cachedSourceMap.files || {}).length + ' files' : 'not loaded yet'}`);
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
        console.log(`[AutoIntl] ✅ Configured ${patterns.length} Turbopack patterns`);
        console.log(`[AutoIntl] 📋 Sample rule for *.{js,jsx,ts,tsx}:`, JSON.stringify(rules['*.{js,jsx,ts,tsx}'] || {}, null, 2));
        // Return config with rules - Next.js 16 format
        const result = {
            ...nextTurbopack,
            rules,
        };
        console.log(`[AutoIntl] 🔍 Turbopack config keys:`, Object.keys(result));
        return result;
    }
    return function wrapNextConfig(nextConfig) {
        console.log(`[AutoIntl] 🚀 Wrapping Next.js config...`);
        const config = { ...nextConfig };
        // Helper to set both webpack and turbopack configs
        const applyConfigs = () => {
            console.log(`[AutoIntl] ⚙️  Applying configs (webpack + turbopack)...`);
            // Always configure webpack (for webpack builds)
            config.webpack = wrapWebpack(nextConfig.webpack);
            // Always configure turbopack (for Turbopack builds)
            // Next.js 16 uses `turbopack` directly at the top level
            const existingTurbopack = config.turbopack;
            console.log(`[AutoIntl] 📦 Existing turbopack config:`, existingTurbopack ? 'found' : 'none');
            const wrappedTurbopack = wrapTurbopack(existingTurbopack);
            // Set turbopack directly (Next.js 16)
            config.turbopack = wrappedTurbopack;
            console.log(`[AutoIntl] ✅ Set config.turbopack`);
        };
        if (hasScheduled) {
            applyConfigs();
            return config;
        }
        if (fs.existsSync(scheduledFlagPath)) {
            const flagPid = parseInt(fs.readFileSync(scheduledFlagPath, 'utf-8'));
            if (isProcessAlive(flagPid)) {
                applyConfigs();
                return config;
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
        applyConfigs();
        return config;
    };
}
