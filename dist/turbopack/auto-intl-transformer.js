// src/turbopack/auto-intl-transformer.ts
import fs from "fs";
import path from "path";
import { transformProject } from "../transformer/Injector.js";
import { wrapLayoutWithIntl } from "../transformer/LayoutWrapper.js";
/**
 * Turbopack transformer for auto-intl
 * Transforms JSX files to inject Translated components and wrap layouts with IntlWrapper
 *
 * @param source - The source code to transform
 * @param context - Turbopack transformer context containing file path and options
 * @returns Transformed source code
 */
export default function transformer(source, context) {
    const { path: filePath, options = {} } = context;
    // Exclude node_modules files (matching webpack loader behavior)
    if (filePath.includes("node_modules")) {
        return source;
    }
    try {
        // First, automatically wrap layout with IntlWrapper
        let result = wrapLayoutWithIntl(source, filePath);
        // Load source map - try from options first, then from disk
        let sourceMap = options.sourceMap || null;
        if (!sourceMap) {
            // Try to load from disk (similar to the old webpack loader approach)
            const outputDir = options.outputDir || process.env.ALGEBRAS_INTL_OUTPUT_DIR || "./src/intl";
            const projectRoot = process.cwd();
            const possibleSourceMapPaths = [
                path.resolve(projectRoot, outputDir, "source.json"),
                path.resolve(projectRoot, "src/intl/source.json"),
                path.resolve(projectRoot, ".intl/source.json"),
                path.resolve(projectRoot, "source.json")
            ];
            for (const sourceMapPath of possibleSourceMapPaths) {
                if (fs.existsSync(sourceMapPath)) {
                    try {
                        const sourceMapContent = fs.readFileSync(sourceMapPath, "utf-8");
                        sourceMap = JSON.parse(sourceMapContent);
                        break;
                    }
                    catch (err) {
                        console.warn(`[AutoIntlTransformer] Failed to load source map from ${sourceMapPath}:`, err);
                    }
                }
            }
        }
        if (!sourceMap) {
            // No source map found, return layout-wrapped code (if applicable)
            return result;
        }
        // Then, transform the project with translation injections
        result = transformProject(result, {
            sourceMap,
            filePath
        });
        return result;
    }
    catch (err) {
        console.error("🔴 Auto-intl Turbopack transformer error:", err);
        // Return original source on error to prevent build failure
        return source;
    }
}
