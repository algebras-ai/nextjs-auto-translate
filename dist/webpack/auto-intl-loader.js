"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = loader;
// src/webpack/auto-intl-loader.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Injector_1 = require("../transformer/Injector");
const LayoutWrapper_1 = require("../transformer/LayoutWrapper");
function loader(source) {
    const options = this.getOptions() || {};
    const callback = this.async();
    const processFile = async () => {
        try {
            // Get the file path relative to the project root and normalize it
            const projectRoot = this.rootContext || process.cwd();
            const relativeFilePath = path_1.default
                .relative(projectRoot, this.resourcePath)
                .split(path_1.default.sep)
                .join('/'); // Normalize to forward slashes to match sourceMap format
            // First, automatically wrap layout with AlgebrasIntlProvider
            let result = (0, LayoutWrapper_1.wrapLayoutWithIntl)(source, this.resourcePath);
            // Load source map - try from options first, then from disk
            let sourceMap = options.sourceMap || null;
            if (!sourceMap ||
                !sourceMap.files ||
                Object.keys(sourceMap.files).length === 0) {
                // Try to load from disk (similar to turbopack transformer)
                const outputDir = options.outputDir ||
                    process.env.ALGEBRAS_INTL_OUTPUT_DIR ||
                    './src/intl';
                const possibleSourceMapPaths = [
                    path_1.default.resolve(projectRoot, outputDir, 'source.json'),
                    path_1.default.resolve(projectRoot, 'src/intl/source.json'),
                    path_1.default.resolve(projectRoot, '.intl/source.json'),
                    path_1.default.resolve(projectRoot, 'source.json'),
                ];
                for (const sourceMapPath of possibleSourceMapPaths) {
                    if (fs_1.default.existsSync(sourceMapPath)) {
                        try {
                            const sourceMapContent = fs_1.default.readFileSync(sourceMapPath, 'utf-8');
                            sourceMap = JSON.parse(sourceMapContent);
                            break;
                        }
                        catch (err) {
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
            result = (0, Injector_1.transformProject)(result, {
                sourceMap,
                filePath: path_1.default.resolve(projectRoot, relativeFilePath),
            });
            callback(null, result);
        }
        catch (err) {
            console.error('🔴 Auto-intl plugin error:', err);
            // Return original source on error to prevent build failure
            callback(null, source);
        }
    };
    processFile();
}
