"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const headers_1 = require("next/headers");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const Provider_1 = __importDefault(require("../client/Provider"));
const languageMap_1 = require("../../data/languageMap");
const IntlWrapper = async ({ children }) => {
    const cookieStore = await (0, headers_1.cookies)();
    let cookiesLocale = cookieStore.get('locale')?.value || 'en';
    if (!Object.values(languageMap_1.LanguageCode).includes(cookiesLocale)) {
        cookiesLocale = 'en';
    }
    // Load dictionary directly as JSON
    const outputDir = process.env.ALGEBRAS_INTL_OUTPUT_DIR || '.intl';
    const dictionaryPath = path_1.default.join(process.cwd(), outputDir, 'dictionary.json');
    let dictionary;
    try {
        // Check if file exists
        try {
            await promises_1.default.access(dictionaryPath);
        }
        catch (accessError) {
            console.error(`[AlgebrasIntl] Dictionary file does not exist at ${dictionaryPath}`);
            throw new Error(`Dictionary file not found at ${dictionaryPath}`);
        }
        const dictionaryJson = await promises_1.default.readFile(dictionaryPath, 'utf8');
        const parsed = JSON.parse(dictionaryJson);
        // Ensure version is a string (dictionary might have number version)
        dictionary = {
            ...parsed,
            version: String(parsed.version || '0.1'),
        };
    }
    catch (error) {
        console.error(`[AlgebrasIntl] Failed to load dictionary from ${dictionaryPath}:`, error);
        // Return empty dictionary structure as fallback
        dictionary = {
            version: '0.1',
            files: {},
        };
    }
    // Create completely plain serializable object
    const dictData = JSON.stringify(dictionary);
    return ((0, jsx_runtime_1.jsx)(Provider_1.default, { dictJson: dictData, initialLocale: cookiesLocale, children: children }));
};
exports.default = IntlWrapper;
