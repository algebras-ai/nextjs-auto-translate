import path from "path";
import fs from "fs/promises";
import { DictStructure } from "../types";

class Dictionary {
  private locale: string;
  private dictionary: DictStructure = {
    version: "",
    files: {}
  };

  constructor(locale: string) {
    this.locale = locale;
  }

  load = async () => {
    const outputDir = process.env.ALGEBRAS_INTL_OUTPUT_DIR;
    if (!outputDir) {
      throw new Error("ALGEBRAS_INTL_OUTPUT_DIR is not set");
    }

    const dictionaryJsonPath = path.join(
      process.cwd(),
      outputDir,
      "dictionary.json"
    );
    const dictionaryJson = await fs.readFile(dictionaryJsonPath, "utf8");
    this.dictionary = JSON.parse(dictionaryJson) as DictStructure;

    return this.dictionary;
  };

  setLocale = (locale: string) => {
    this.locale = locale;
  };
}

export default Dictionary;
