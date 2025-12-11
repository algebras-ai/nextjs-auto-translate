'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { DictStructure } from '../types.js';
import { LanguageCode } from '../../data/languageMap.js';

const context = createContext<{
  dictionary: DictStructure;
  locale: string;
  setLocale: (locale: string) => void;
}>({
  dictionary: {
    version: '',
    files: {},
  },
  locale: 'en',
  setLocale: () => {},
});

export const useAlgebrasIntl = () => {
  const ctx = useContext(context);

  const getLocales = () => {
    // Collect all unique locales from all files and entries
    const localeSet = new Set<string>();

    // Debug: log dictionary structure
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      console.log(
        '[AlgebrasIntl] Dictionary files count:',
        Object.keys(ctx.dictionary.files).length
      );
    }

    // Iterate through all files
    for (const file of Object.values(ctx.dictionary.files)) {
      if (!file.entries) continue;

      // Iterate through all entries in the file
      for (const entry of Object.values(file.entries)) {
        if (!entry.content) continue;

        // Add all locale keys from this entry's content
        for (const locale of Object.keys(entry.content)) {
          localeSet.add(locale);
        }
      }
    }

    // Return sorted array of unique locales, defaulting to ['en'] if empty
    const locales = Array.from(localeSet).sort();

    // Debug: log found locales
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      console.log('[AlgebrasIntl] Found locales:', locales);
    }

    return locales.length > 0 ? locales : ['en'];
  };

  return {
    ...ctx,
    getLocales,
  };
};

interface AlgebrasIntlProviderProps {
  children: ReactNode;
  dictJson: string;
  initialLocale: string;
}

const AlgebrasIntlClientProvider = (props: AlgebrasIntlProviderProps) => {
  const [dictionary] = useState<DictStructure>(() =>
    JSON.parse(props.dictJson)
  );
  const [locale, setLocaleState] = useState<string>(props.initialLocale);

  // Update cookie when locale changes (skip initial mount to prevent hydration mismatch)
  useEffect(() => {
    // Skip cookie update on initial mount - server already set the correct locale
    // Only update if locale actually changed from user interaction
    if (typeof document !== 'undefined' && locale !== props.initialLocale) {
      document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]); // Intentionally exclude props.initialLocale to only run on locale changes

  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale);
    // Update cookie immediately when user changes locale
    if (typeof document !== 'undefined') {
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      dictionary,
      locale,
      setLocale,
    }),
    [dictionary, locale, setLocale]
  );

  return (
    <context.Provider value={contextValue}>{props.children}</context.Provider>
  );
};

export default AlgebrasIntlClientProvider;
