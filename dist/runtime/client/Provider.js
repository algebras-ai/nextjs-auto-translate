"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
const context = createContext({
    dictionary: {
        version: "",
        files: {}
    },
    locale: "en",
    setLocale: () => { }
});
export const useAlgebrasIntl = () => {
    const ctx = useContext(context);
    const getLocales = () => {
        const entries = Object.values(ctx.dictionary.files)[0]?.entries;
        if (!entries)
            return [];
        const content = Object.values(entries)[0]?.content;
        if (!content)
            return [];
        return Object.keys(content);
    };
    return {
        ...ctx,
        getLocales
    };
};
const AlgebrasIntlClientProvider = (props) => {
    const [dictionary] = useState(() => JSON.parse(props.dictJson));
    const [locale, setLocaleState] = useState(props.initialLocale);
    // Update cookie when locale changes (skip initial mount to prevent hydration mismatch)
    useEffect(() => {
        // Skip cookie update on initial mount - server already set the correct locale
        // Only update if locale actually changed from user interaction
        if (typeof document !== "undefined" && locale !== props.initialLocale) {
            document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale]); // Intentionally exclude props.initialLocale to only run on locale changes
    const setLocale = useCallback((newLocale) => {
        setLocaleState(newLocale);
        // Update cookie immediately when user changes locale
        if (typeof document !== "undefined") {
            document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
        }
    }, []);
    const contextValue = useMemo(() => ({
        dictionary,
        locale,
        setLocale
    }), [dictionary, locale, setLocale]);
    return (_jsx(context.Provider, { value: contextValue, children: props.children }));
};
export default AlgebrasIntlClientProvider;
