'use client';

import { useAlgebrasIntl } from '../Provider';

/**
 * Hook that returns a translation function for use in attributes and expressions
 * Usage: const { t } = useTranslation(); title={t('file::key')}
 */
export function useTranslation() {
  const { dictionary, locale } = useAlgebrasIntl();

  const t = (key: string): string => {
    const [fileKey, entryKey] = key.split('::');

    // Check if the file exists in dictionary
    if (!dictionary.files[fileKey]) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `[useTranslation] File "${fileKey}" not found in dictionary`
        );
      }
      return key; // Return key as fallback
    }

    // Check if the entry exists in the file
    const entry = dictionary.files[fileKey].entries[entryKey];
    if (!entry) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `[useTranslation] Entry "${entryKey}" not found in file "${fileKey}"`
        );
      }
      return key; // Return key as fallback
    }

    // Get the translated content for the current locale
    const content = entry.content[locale];
    if (!content) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `[useTranslation] Content for locale "${locale}" not found in "${key}"`
        );
      }
      // Fallback to first available locale or key
      const firstLocale = Object.keys(entry.content)[0];
      return firstLocale ? entry.content[firstLocale] : key;
    }

    return content;
  };

  return { t };
}
