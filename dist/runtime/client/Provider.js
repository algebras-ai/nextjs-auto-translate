"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { LanguageCode } from "../../data/languageMap";
const context = createContext({
    dictionary: {
        version: "",
        files: {}
    },
    locale: LanguageCode.en,
    setLocale: () => { },
    getLocales: () => []
});
export const useAlgebrasIntl = () => {
    return useContext(context);
};
const AlgebrasIntlClientProvider = (props) => {
    const [locale, setLocale] = useState(props.locale);
    useEffect(() => {
        document.cookie = `locale=${locale}; path=/;`;
    }, [locale]);
    const getLocales = () => {
        const entries = Object.values(props.dictionary.files)[0].entries;
        const content = Object.values(entries)[0].content;
        const locales = Object.keys(content);
        return locales;
    };
    return (_jsx(context.Provider, { value: { dictionary: props.dictionary, locale, setLocale, getLocales }, children: props.children }));
};
export default AlgebrasIntlClientProvider;
