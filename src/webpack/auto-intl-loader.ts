// src/webpack/auto-intl-loader.ts
import fs from "fs";
import path from "path";
import { transformProject } from "../transformer/Injector.js";
import { wrapLayoutWithIntl } from "../transformer/LayoutWrapper.js";
import { ScopeMap } from "../types.js";

interface LoaderOptions {
  sourceMap?: ScopeMap;
  outputDir?: string;
}

export default function loader(
  this: any,
  source: string
) {
  const options = this.getOptions() || {};
  const callback = this.async();
  
  const processFile = async () => {
    try {
      // Get the file path relative to the project root and normalize it
      const projectRoot = this.rootContext || process.cwd();
      const relativeFilePath = path
        .relative(projectRoot, this.resourcePath)
        .split(path.sep)
        .join("/"); // Normalize to forward slashes to match sourceMap format
      
      // First, automatically wrap layout with AlgebrasIntlProvider
      let result = wrapLayoutWithIntl(source, this.resourcePath);
      
      // Load source map - try from options first, then from disk
      let sourceMap: ScopeMap | null = options.sourceMap || null;
      
      if (!sourceMap || !sourceMap.files || Object.keys(sourceMap.files).length === 0) {
        // Try to load from disk (similar to turbopack transformer)
        const outputDir = options.outputDir || process.env.ALGEBRAS_INTL_OUTPUT_DIR || "./src/intl";
        
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
              sourceMap = JSON.parse(sourceMapContent) as ScopeMap;
              break;
            } catch (err) {
              console.warn(`[AutoIntlLoader] Failed to load source map from ${sourceMapPath}:`, err);
            }
          }
        }
      }
      
      if (!sourceMap || !sourceMap.files) {
        // No source map found, return layout-wrapped code (if applicable)
        callback(null, result);
        return;
      }
      
      // Then, transform the project with translation injections
      // Use the normalized relative path for matching
      result = transformProject(result, {
        sourceMap,
        filePath: path.resolve(projectRoot, relativeFilePath)
      });
      
      callback(null, result);
    } catch (err) {
      console.error("🔴 Auto-intl plugin error:", err);
      // Return original source on error to prevent build failure
      callback(null, source);
    }
  };
  
  processFile();
}
