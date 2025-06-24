import { Parser } from "../parser/Parser";
import { transformProject } from "../transformer/Injector";
import { DictionaryGenerator } from "../translator/DictionaryGenerator";
let hasScheduled = false;
export default function myPlugin(options) {
    return function wrapNextConfig(nextConfig) {
        if (hasScheduled) {
            console.log("🟡 Skipping parser: already scheduled.");
            return nextConfig;
        }
        hasScheduled = true;
        setImmediate(() => {
            const parser = new Parser(options);
            parser
                .parseProject()
                .then(async (sourceMap) => {
                // Step 1: Translate and save dictionary
                const targetLocales = options?.targetLocales || ["en"];
                const outputDir = options?.outputDir || ".intl";
                const generator = new DictionaryGenerator({
                    targetLocales,
                    outputDir
                });
                await generator.generateDictionary(sourceMap);
                // Step 2: Inject t() calls
                setImmediate(() => {
                    transformProject(sourceMap).catch((err) => console.error("❌ Injector error:", err));
                });
            })
                .catch((err) => console.error("❌ Parser error:", err));
        });
        return {
            ...nextConfig
        };
    };
}
