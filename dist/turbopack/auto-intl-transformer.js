"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/turbopack/auto-intl-transformer.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Injector_1 = require("../transformer/Injector");
const LayoutWrapper_1 = require("../transformer/LayoutWrapper");
/**
 * Turbopack transformer for auto-intl
 * Transforms JSX files to inject Translated components and wrap layouts with AlgebrasIntlProvider
 *
 * This function supports both:
 * 1. Turbopack transformer interface: transformer(source, context)
 * 2. Webpack loader interface: loader(source) where this.resourcePath and this.getOptions() are available
 *
 * @param source - The source code to transform
 * @param context - Turbopack transformer context OR webpack loader context (this)
 * @returns Transformed source code
 */
// Support both webpack loader and Turbopack transformer interfaces
function transformerImpl(source, filePath, options = {}) {
    // Exclude node_modules files (matching webpack loader behavior)
    if (filePath.includes('node_modules')) {
        return source;
    }
    try {
        // Get the file path relative to the project root and normalize it
        const projectRoot = process.cwd();
        const relativeFilePath = path_1.default
            .relative(projectRoot, filePath)
            .split(path_1.default.sep)
            .join('/'); // Normalize to forward slashes to match sourceMap format
        // First, automatically wrap layout with AlgebrasIntlProvider
        let result = (0, LayoutWrapper_1.wrapLayoutWithIntl)(source, filePath);
        // Load source map - try from options first, then from disk
        let sourceMap = options.sourceMap || null;
        if (!sourceMap ||
            !sourceMap.files ||
            Object.keys(sourceMap.files).length === 0) {
            // Try to load from disk (similar to the old webpack loader approach)
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
                        console.warn(`[AutoIntlTransformer] Failed to load source map from ${sourceMapPath}:`, err);
                    }
                }
            }
        }
        if (!sourceMap || !sourceMap.files) {
            // No source map found, return layout-wrapped code (if applicable)
            return result;
        }
        // Then, transform the project with translation injections
        // transformProject will handle page files and sourceMap files correctly
        // Use the absolute path for transformProject (it will normalize internally)
        result = (0, Injector_1.transformProject)(result, {
            sourceMap,
            filePath: path_1.default.resolve(projectRoot, relativeFilePath),
        });
        return result;
    }
    catch (err) {
        console.error('🔴 Auto-intl Turbopack transformer error:', err);
        // Return original source on error to prevent build failure
        return source;
    }
}
// Export function that handles both webpack loader and Turbopack transformer interfaces
// When used as a webpack loader, 'this' is bound to the loader context
// When used as a Turbopack transformer, context is passed as second parameter
function transformerWrapper(source, contextOrMap) {
    let filePath;
    let options = {};
    // Check if this is webpack loader interface (this.resourcePath exists)
    // Webpack loaders are called with 'this' bound to loader context
    if (this && typeof this === 'object' && this.resourcePath) {
        // Webpack loader interface - use 'this' context
        filePath = this.resourcePath;
        try {
            if (typeof this.getOptions === 'function') {
                options = this.getOptions() || {};
            }
        }
        catch (e) {
            console.warn('[AutoIntlTransformer] Failed to get loader options:', e);
        }
    }
    // Check if context is passed as second parameter (Turbopack transformer or webpack loader with context param)
    else if (contextOrMap && typeof contextOrMap === 'object') {
        // Check for webpack loader interface (passed as second param)
        if (contextOrMap.resourcePath &&
            typeof contextOrMap.getOptions === 'function') {
            filePath = contextOrMap.resourcePath;
            try {
                options = contextOrMap.getOptions() || {};
            }
            catch (e) {
                console.warn('[AutoIntlTransformer] Failed to get loader options:', e);
            }
        }
        // Check for Turbopack transformer interface
        else if (contextOrMap.path) {
            filePath = contextOrMap.path;
            options = contextOrMap.options || {};
        }
        else {
            // Unknown format
            console.warn('[AutoIntlTransformer] Unknown context format, returning source unchanged');
            return source;
        }
    }
    else {
        // No context provided
        console.warn('[AutoIntlTransformer] No context provided, returning source unchanged');
        return source;
    }
    return transformerImpl(source, filePath, options);
}
// Export as default - works for both webpack loader and Turbopack transformer
exports.default = transformerWrapper;
