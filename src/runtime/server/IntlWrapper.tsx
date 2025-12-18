import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import fs from 'fs/promises';
import path from 'path';
import AlgebrasIntlClientProvider from '../client/Provider.js';
import { LanguageCode } from '../../data/languageMap.js';
import { DictStructure } from '../types.js';

interface IntlWrapperProps {
  children: ReactNode;
}

const IntlWrapper = async ({ children }: IntlWrapperProps) => {
  const cookieStore = await cookies();
  let cookiesLocale = cookieStore.get('locale')?.value || 'en';

  if (!Object.values(LanguageCode).includes(cookiesLocale as LanguageCode)) {
    cookiesLocale = 'en';
  }

  // Load dictionary directly as JSON
  const outputDir = process.env.ALGEBRAS_INTL_OUTPUT_DIR || '.intl';
  const dictionaryPath = path.join(process.cwd(), outputDir, 'dictionary.json');

  let dictionary: DictStructure;
  try {
    // Check if file exists
    try {
      await fs.access(dictionaryPath);
    } catch (accessError) {
      console.error(
        `[AlgebrasIntl] Dictionary file does not exist at ${dictionaryPath}`
      );
      throw new Error(`Dictionary file not found at ${dictionaryPath}`);
    }

    const dictionaryJson = await fs.readFile(dictionaryPath, 'utf8');
    const parsed = JSON.parse(dictionaryJson);

    // Ensure version is a string (dictionary might have number version)
    dictionary = {
      ...parsed,
      version: String(parsed.version || '0.1'),
    };
  } catch (error) {
    console.error(
      `[AlgebrasIntl] Failed to load dictionary from ${dictionaryPath}:`,
      error
    );
    // Return empty dictionary structure as fallback
    dictionary = {
      version: '0.1',
      files: {},
    };
  }

  // Create completely plain serializable object
  const dictData = JSON.stringify(dictionary);

  return (
    <AlgebrasIntlClientProvider
      dictJson={dictData}
      initialLocale={cookiesLocale}
    >
      {children}
    </AlgebrasIntlClientProvider>
  );
};

export default IntlWrapper;
