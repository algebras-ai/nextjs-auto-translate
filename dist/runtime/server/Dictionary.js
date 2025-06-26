import path from "path";
import fs from "fs/promises";
class Dictionary {
    constructor(locale) {
        this.dictionary = {
            version: "",
            files: {}
        };
        this.load = async () => {
            const outputDir = process.env.ALGEBRAS_INTL_OUTPUT_DIR;
            if (!outputDir) {
                throw new Error("ALGEBRAS_INTL_OUTPUT_DIR is not set");
            }
            const dictionaryJsonPath = path.join(process.cwd(), outputDir, "dictionary.json");
            const dictionaryJson = await fs.readFile(dictionaryJsonPath, "utf8");
            this.dictionary = JSON.parse(dictionaryJson);
            return this.dictionary;
        };
        this.setLocale = (locale) => {
            this.locale = locale;
        };
        this.locale = locale;
    }
}
export default Dictionary;
