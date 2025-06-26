"use server";
import { cookies } from "next/headers";
import { ReactNode } from "react";
import AlgebrasIntlClientProvider from "../client/Provider";
import Dictionary from "./Dictionary";
import { LanguageCode } from "../../data/languageMap";

interface AlgebrasIntlProviderProps {
  children: ReactNode;
}

const AlgebrasIntlProvider = async ({
  children
}: AlgebrasIntlProviderProps) => {
  const cookieStore = await cookies();

  let cookiesLocale = cookieStore.get("locale")?.value;

  if (!cookiesLocale) {
    cookiesLocale = LanguageCode.en;
  }

  if (!Object.values(LanguageCode).includes(cookiesLocale as LanguageCode)) {
    cookiesLocale = LanguageCode.en;
  }

  const locale = cookiesLocale as LanguageCode;

  const dictionary = new Dictionary(locale);
  const dictionaryObject = await dictionary.load();

  return (
    <AlgebrasIntlClientProvider dictionary={dictionaryObject} locale={locale}>
      {children}
    </AlgebrasIntlClientProvider>
  );
};

export default AlgebrasIntlProvider;
