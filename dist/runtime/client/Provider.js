"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAlgebrasIntl = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const context = (0, react_1.createContext)({
    dictionary: {
        version: '',
        files: {},
    },
    locale: 'en',
    setLocale: () => { },
});
const useAlgebrasIntl = () => {
    const ctx = (0, react_1.useContext)(context);
    const getLocales = () => {
        // Collect all unique locales from all files and entries
        const localeSet = new Set();
        // Debug: log dictionary structure
        if (typeof window !== 'undefined' &&
            process.env.NODE_ENV === 'development') {
            console.log('[AlgebrasIntl] Dictionary files count:', Object.keys(ctx.dictionary.files).length);
        }
        // Iterate through all files
        for (const file of Object.values(ctx.dictionary.files)) {
            if (!file.entries)
                continue;
            // Iterate through all entries in the file
            for (const entry of Object.values(file.entries)) {
                if (!entry.content)
                    continue;
                // Add all locale keys from this entry's content
                for (const locale of Object.keys(entry.content)) {
                    localeSet.add(locale);
                }
            }
        }
        // Return sorted array of unique locales, defaulting to ['en'] if empty
        const locales = Array.from(localeSet).sort();
        // Debug: log found locales
        if (typeof window !== 'undefined' &&
            process.env.NODE_ENV === 'development') {
            console.log('[AlgebrasIntl] Found locales:', locales);
        }
        return locales.length > 0 ? locales : ['en'];
    };
    return {
        ...ctx,
        getLocales,
    };
};
exports.useAlgebrasIntl = useAlgebrasIntl;
const AlgebrasIntlClientProvider = (props) => {
    const [dictionary] = (0, react_1.useState)(() => JSON.parse(props.dictJson));
    const [locale, setLocaleState] = (0, react_1.useState)(props.initialLocale);
    // Update cookie when locale changes (skip initial mount to prevent hydration mismatch)
    (0, react_1.useEffect)(() => {
        // Skip cookie update on initial mount - server already set the correct locale
        // Only update if locale actually changed from user interaction
        if (typeof document !== 'undefined' && locale !== props.initialLocale) {
            document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale]); // Intentionally exclude props.initialLocale to only run on locale changes
    const setLocale = (0, react_1.useCallback)((newLocale) => {
        setLocaleState(newLocale);
        // Update cookie immediately when user changes locale
        if (typeof document !== 'undefined') {
            document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
        }
    }, []);
    const contextValue = (0, react_1.useMemo)(() => ({
        dictionary,
        locale,
        setLocale,
    }), [dictionary, locale, setLocale]);
    return ((0, jsx_runtime_1.jsx)(context.Provider, { value: contextValue, children: props.children }));
};
exports.default = AlgebrasIntlClientProvider;
