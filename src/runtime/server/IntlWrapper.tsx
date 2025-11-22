import { cookies } from "next/headers";
import { ReactNode } from "react";
import fs from "fs/promises";
import path from "path";
import AlgebrasIntlClientProvider from "../client/Provider.js";
import LocaleSwitcher from "../client/components/LocaleSwitcher.js";
import { LanguageCode } from "../../data/languageMap.js";
import { DictStructure } from "../types.js";

interface IntlWrapperProps {
  children: ReactNode;
}

const IntlWrapper = async ({ children }: IntlWrapperProps) => {
  const cookieStore = await cookies();
  let cookiesLocale = cookieStore.get("locale")?.value || "en";

  if (!Object.values(LanguageCode).includes(cookiesLocale as LanguageCode)) {
    cookiesLocale = "en";
  }

  // Load dictionary directly as JSON
  // Try multiple possible locations
  const possiblePaths = [
    process.env.ALGEBRAS_INTL_OUTPUT_DIR || "src/intl",
    "src/intl",
    ".intl"
  ];
  
  let dictionaryJson: string | null = null;
  let dictionaryPath: string | null = null;
  
  for (const outputDir of possiblePaths) {
    const testPath = path.join(process.cwd(), outputDir, "dictionary.json");
    try {
      dictionaryJson = await fs.readFile(testPath, "utf8");
      dictionaryPath = testPath;
      break;
    } catch {
      // Try next path
      continue;
    }
  }
  
  if (!dictionaryJson) {
    throw new Error(
      `Dictionary not found. Tried: ${possiblePaths.map(d => path.join(process.cwd(), d, "dictionary.json")).join(", ")}`
    );
  }
  
  const dictionary: DictStructure = JSON.parse(dictionaryJson);

  // Create completely plain serializable object
  const dictData = JSON.stringify(dictionary);
  const parsedDict = JSON.parse(dictData);

  return (
    <AlgebrasIntlClientProvider 
      dictJson={dictData}
      initialLocale={cookiesLocale}
    >
      <div 
        style={{
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 99999,
          pointerEvents: "auto"
        }}
      >
        <LocaleSwitcher />
      </div>
      {children}
    </AlgebrasIntlClientProvider>
  );
};

export default IntlWrapper;


