import { ReactNode } from "react";
import { DictStructure } from "../types";
import { LanguageCode } from "../../data/languageMap";
export declare const useAlgebrasIntl: () => {
    dictionary: DictStructure;
    locale: LanguageCode;
    setLocale: (locale: LanguageCode) => void;
    getLocales: () => LanguageCode[];
};
interface AlgebrasIntlProviderProps {
    children: ReactNode;
    dictionary: DictStructure;
    locale: LanguageCode;
}
declare const AlgebrasIntlClientProvider: (props: AlgebrasIntlProviderProps) => import("react/jsx-runtime").JSX.Element;
export default AlgebrasIntlClientProvider;
