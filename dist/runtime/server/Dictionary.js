"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class Dictionary {
    locale;
    dictionary = {
        version: '',
        files: {},
    };
    constructor(locale) {
        this.locale = locale;
    }
    load = async () => {
        const outputDir = process.env.ALGEBRAS_INTL_OUTPUT_DIR;
        if (!outputDir) {
            throw new Error('ALGEBRAS_INTL_OUTPUT_DIR is not set');
        }
        const dictionaryJsonPath = path_1.default.join(process.cwd(), outputDir, 'dictionary.json');
        console.log('[Dictionary] Loading from:', dictionaryJsonPath);
        const dictionaryJson = await promises_1.default.readFile(dictionaryJsonPath, 'utf8');
        const parsed = JSON.parse(dictionaryJson);
        console.log('[Dictionary] Loaded files:', Object.keys(parsed.files));
        // Return a completely new plain object without any class instance references
        return {
            version: parsed.version,
            files: Object.fromEntries(Object.entries(parsed.files).map(([filePath, fileData]) => [
                filePath,
                {
                    entries: Object.fromEntries(Object.entries(fileData.entries).map(([entryKey, entryData]) => [
                        entryKey,
                        {
                            content: { ...entryData.content },
                            hash: entryData.hash,
                        },
                    ])),
                },
            ])),
        };
    };
    setLocale = (locale) => {
        this.locale = locale;
    };
}
exports.default = Dictionary;
