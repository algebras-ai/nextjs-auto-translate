"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";
import { DictStructure } from "../types";
import { LanguageCode } from "../../data/languageMap";

const context = createContext<{
  dictionary: DictStructure;
  locale: LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  getLocales: () => LanguageCode[];
}>({
  dictionary: {
    version: "",
    files: {}
  },
  locale: LanguageCode.en,
  setLocale: () => {},
  getLocales: () => []
});

export const useAlgebrasIntl = () => {
  return useContext(context);
};

interface AlgebrasIntlProviderProps {
  children: ReactNode;
  dictionary: DictStructure;
  locale: LanguageCode;
}

const AlgebrasIntlClientProvider = (props: AlgebrasIntlProviderProps) => {
  const [locale, setLocale] = useState<LanguageCode>(props.locale);

  useEffect(() => {
    document.cookie = `locale=${locale}; path=/;`;
  }, [locale]);

  const getLocales = () => {
    const entries = Object.values(props.dictionary.files)[0].entries;
    const content = Object.values(entries)[0].content;
    const locales = Object.keys(content) as LanguageCode[];
    return locales;
  };

  return (
    <context.Provider
      value={{ dictionary: props.dictionary, locale, setLocale, getLocales }}
    >
      {props.children}
    </context.Provider>
  );
};

export default AlgebrasIntlClientProvider;
