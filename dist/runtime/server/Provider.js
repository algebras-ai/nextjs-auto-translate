"use server";
import { jsx as _jsx } from "react/jsx-runtime";
import { cookies } from "next/headers";
import AlgebrasIntlClientProvider from "../client/Provider";
import Dictionary from "./Dictionary";
import { LanguageCode } from "../../data/languageMap";
const AlgebrasIntlProvider = async ({ children }) => {
    const cookieStore = await cookies();
    let cookiesLocale = cookieStore.get("locale")?.value;
    if (!cookiesLocale) {
        cookiesLocale = LanguageCode.en;
    }
    if (!Object.values(LanguageCode).includes(cookiesLocale)) {
        cookiesLocale = LanguageCode.en;
    }
    const locale = cookiesLocale;
    const dictionary = new Dictionary(locale);
    const dictionaryObject = await dictionary.load();
    return (_jsx(AlgebrasIntlClientProvider, { dictionary: dictionaryObject, locale: locale, children: children }));
};
export default AlgebrasIntlProvider;
