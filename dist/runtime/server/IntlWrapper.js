import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import AlgebrasIntlClientProvider from "../client/Provider.js";
import LocaleSwitcher from "../client/components/LocaleSwitcher.js";
import { LanguageCode } from "../../data/languageMap.js";
const IntlWrapper = async ({ children }) => {
    const cookieStore = await cookies();
    let cookiesLocale = cookieStore.get("locale")?.value || "en";
    if (!Object.values(LanguageCode).includes(cookiesLocale)) {
        cookiesLocale = "en";
    }
    // Load dictionary directly as JSON
    // Try multiple possible locations
    const possiblePaths = [
        process.env.ALGEBRAS_INTL_OUTPUT_DIR || "src/intl",
        "src/intl",
        ".intl"
    ];
    let dictionaryJson = null;
    let dictionaryPath = null;
    for (const outputDir of possiblePaths) {
        const testPath = path.join(process.cwd(), outputDir, "dictionary.json");
        try {
            dictionaryJson = await fs.readFile(testPath, "utf8");
            dictionaryPath = testPath;
            break;
        }
        catch {
            // Try next path
            continue;
        }
    }
    if (!dictionaryJson) {
        throw new Error(`Dictionary not found. Tried: ${possiblePaths.map(d => path.join(process.cwd(), d, "dictionary.json")).join(", ")}`);
    }
    const dictionary = JSON.parse(dictionaryJson);
    // Create completely plain serializable object
    const dictData = JSON.stringify(dictionary);
    const parsedDict = JSON.parse(dictData);
    return (_jsxs(AlgebrasIntlClientProvider, { dictJson: dictData, initialLocale: cookiesLocale, children: [_jsx("div", { style: {
                    position: "fixed",
                    top: "16px",
                    left: "16px",
                    zIndex: 99999,
                    pointerEvents: "auto"
                }, children: _jsx(LocaleSwitcher, {}) }), children] }));
};
export default IntlWrapper;
