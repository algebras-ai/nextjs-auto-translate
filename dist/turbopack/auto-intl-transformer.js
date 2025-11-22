// src/turbopack/auto-intl-transformer.ts
// Turbopack transformer for auto-intl
// This is a Turbopack-compatible loader that transforms files
import { transformProject } from "../transformer/Injector.js";
import { wrapLayoutWithIntl } from "../transformer/LayoutWrapper.js";
import fs from "fs";
import path from "path";
/**
 * Turbopack loader function
 * Turbopack loaders receive (source, context) and return transformed source
 */
export default function loader(source, context) {
    try {
        const { resourcePath, rootContext } = context;
        const projectRoot = rootContext || process.cwd();
        // Load source map from the output directory
        const outputDir = process.env.ALGEBRAS_INTL_OUTPUT_DIR || "src/intl";
        const sourceMapPath = path.resolve(projectRoot, outputDir, "source.json");
        let sourceMap = null;
        if (fs.existsSync(sourceMapPath)) {
            try {
                const sourceMapContent = fs.readFileSync(sourceMapPath, "utf-8");
                sourceMap = JSON.parse(sourceMapContent);
            }
            catch (err) {
                // If source map doesn't exist yet, that's okay - it will be generated
                // Return original source without transformation
                return source;
            }
        }
        else {
            // Source map not ready yet, return original source
            return source;
        }
        if (!sourceMap || !sourceMap.files || Object.keys(sourceMap.files).length === 0) {
            // Still wrap layout even if no sourceMap
            return wrapLayoutWithIntl(source, resourcePath);
        }
        // First, automatically wrap layout with IntlWrapper
        let result = wrapLayoutWithIntl(source, resourcePath);
        // Then, transform the project with translation injections
        result = transformProject(result, {
            sourceMap,
            filePath: resourcePath
        });
        return result;
    }
    catch (err) {
        console.error("🔴 Turbopack auto-intl transformer error:", err);
        // Return original source on error to prevent build failure
        return source;
    }
}
