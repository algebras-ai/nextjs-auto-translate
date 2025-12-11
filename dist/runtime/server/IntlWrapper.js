import { jsx as _jsx } from "react/jsx-runtime";
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import AlgebrasIntlClientProvider from '../client/Provider.js';
import { LanguageCode } from '../../data/languageMap.js';
const IntlWrapper = async ({ children }) => {
    const cookieStore = await cookies();
    let cookiesLocale = cookieStore.get('locale')?.value || 'en';
    if (!Object.values(LanguageCode).includes(cookiesLocale)) {
        cookiesLocale = 'en';
    }
    // Load dictionary directly as JSON
    const outputDir = process.env.ALGEBRAS_INTL_OUTPUT_DIR || '.intl';
    const dictionaryPath = path.join(process.cwd(), outputDir, 'dictionary.json');
    console.log(`[AlgebrasIntl] Attempting to load dictionary from: ${dictionaryPath}`);
    console.log(`[AlgebrasIntl] ALGEBRAS_INTL_OUTPUT_DIR: ${process.env.ALGEBRAS_INTL_OUTPUT_DIR}`);
    console.log(`[AlgebrasIntl] outputDir: ${outputDir}`);
    console.log(`[AlgebrasIntl] process.cwd(): ${process.cwd()}`);
    let dictionary;
    try {
        // Check if file exists
        try {
            await fs.access(dictionaryPath);
            console.log(`[AlgebrasIntl] Dictionary file exists at ${dictionaryPath}`);
        }
        catch (accessError) {
            console.error(`[AlgebrasIntl] Dictionary file does not exist at ${dictionaryPath}`);
            throw new Error(`Dictionary file not found at ${dictionaryPath}`);
        }
        const dictionaryJson = await fs.readFile(dictionaryPath, 'utf8');
        const parsed = JSON.parse(dictionaryJson);
        // Ensure version is a string (dictionary might have number version)
        dictionary = {
            ...parsed,
            version: String(parsed.version || '0.1'),
        };
        // Debug: log dictionary info
        const fileCount = Object.keys(dictionary.files || {}).length;
        console.log(`[AlgebrasIntl] Loaded dictionary with ${fileCount} files from ${dictionaryPath}`);
        console.log(`[AlgebrasIntl] Dictionary files:`, Object.keys(dictionary.files || {}));
        // Verify dictionary structure
        if (!dictionary.files || Object.keys(dictionary.files).length === 0) {
            console.warn(`[AlgebrasIntl] WARNING: Dictionary has no files!`);
        }
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
    const parsedDict = JSON.parse(dictData);
    // Verify serialization
    const serializedFileCount = Object.keys(parsedDict.files || {}).length;
    console.log(`[AlgebrasIntl] After serialization, dictionary has ${serializedFileCount} files`);
    return (_jsx(AlgebrasIntlClientProvider, { dictJson: dictData, initialLocale: cookiesLocale, children: children }));
};
export default IntlWrapper;
