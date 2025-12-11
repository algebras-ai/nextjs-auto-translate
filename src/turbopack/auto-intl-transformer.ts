// src/turbopack/auto-intl-transformer.ts
import fs from 'fs';
import path from 'path';
import { transformProject } from '../transformer/Injector.js';
import { wrapLayoutWithIntl } from '../transformer/LayoutWrapper.js';
import { ScopeMap } from '../types.js';

interface TransformerOptions {
  sourceMap?: ScopeMap;
  outputDir?: string;
}

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
function transformerImpl(
  source: string,
  filePath: string,
  options: TransformerOptions = {}
): string {
  // Log that transformer is being called
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AutoIntlTransformer] 🔄 Processing: ${filePath}`);
  }

  // Exclude node_modules files (matching webpack loader behavior)
  if (filePath.includes('node_modules')) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[AutoIntlTransformer] ⏭️  Skipping node_modules: ${filePath}`
      );
    }
    return source;
  }

  try {
    // Get the file path relative to the project root and normalize it
    const projectRoot = process.cwd();
    const relativeFilePath = path
      .relative(projectRoot, filePath)
      .split(path.sep)
      .join('/'); // Normalize to forward slashes to match sourceMap format

    // First, automatically wrap layout with AlgebrasIntlProvider
    let result = wrapLayoutWithIntl(source, filePath);

    // Load source map - try from options first, then from disk
    let sourceMap: ScopeMap | null = options.sourceMap || null;

    if (
      !sourceMap ||
      !sourceMap.files ||
      Object.keys(sourceMap.files).length === 0
    ) {
      // Try to load from disk (similar to the old webpack loader approach)
      const outputDir =
        options.outputDir ||
        process.env.ALGEBRAS_INTL_OUTPUT_DIR ||
        './src/intl';

      const possibleSourceMapPaths = [
        path.resolve(projectRoot, outputDir, 'source.json'),
        path.resolve(projectRoot, 'src/intl/source.json'),
        path.resolve(projectRoot, '.intl/source.json'),
        path.resolve(projectRoot, 'source.json'),
      ];

      for (const sourceMapPath of possibleSourceMapPaths) {
        if (fs.existsSync(sourceMapPath)) {
          try {
            const sourceMapContent = fs.readFileSync(sourceMapPath, 'utf-8');
            sourceMap = JSON.parse(sourceMapContent) as ScopeMap;
            break;
          } catch (err) {
            console.warn(
              `[AutoIntlTransformer] Failed to load source map from ${sourceMapPath}:`,
              err
            );
          }
        }
      }
    }

    if (!sourceMap || !sourceMap.files) {
      // No source map found, return layout-wrapped code (if applicable)
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[AutoIntlTransformer] No source map found for ${relativeFilePath}`
        );
      }
      return result;
    }

    // Remove the check for file in sourceMap - let transformProject handle it
    // transformProject will check if it's a page file or if file is in sourceMap
    if (process.env.NODE_ENV === 'development') {
      const isInSourceMap = sourceMap.files[relativeFilePath] !== undefined;
      if (isInSourceMap) {
        console.log(
          `[AutoIntlTransformer] Processing ${relativeFilePath} with ${
            Object.keys(sourceMap.files[relativeFilePath]?.scopes || {}).length
          } scopes`
        );
      } else {
        console.log(
          `[AutoIntlTransformer] Processing ${relativeFilePath} (may be a page file)`
        );
      }
    }

    // Then, transform the project with translation injections
    // transformProject will handle page files and sourceMap files correctly
    // Use the absolute path for transformProject (it will normalize internally)
    result = transformProject(result, {
      sourceMap,
      filePath: path.resolve(projectRoot, relativeFilePath),
    });

    if (process.env.NODE_ENV === 'development' && result !== source) {
      console.log(`[AutoIntlTransformer] ✅ Transformed ${relativeFilePath}`);
    }

    return result;
  } catch (err) {
    console.error('🔴 Auto-intl Turbopack transformer error:', err);
    // Return original source on error to prevent build failure
    return source;
  }
}

// Export function that handles both webpack loader and Turbopack transformer interfaces
// When used as a webpack loader, 'this' is bound to the loader context
// When used as a Turbopack transformer, context is passed as second parameter
function transformerWrapper(
  this: any,
  source: string,
  contextOrMap?: any
): string {
  let filePath: string;
  let options: TransformerOptions = {};

  // Check if this is webpack loader interface (this.resourcePath exists)
  // Webpack loaders are called with 'this' bound to loader context
  if (this && typeof this === 'object' && this.resourcePath) {
    // Webpack loader interface - use 'this' context
    filePath = this.resourcePath;
    try {
      if (typeof this.getOptions === 'function') {
        options = this.getOptions() || {};
      }
    } catch (e) {
      console.warn('[AutoIntlTransformer] Failed to get loader options:', e);
    }
  }
  // Check if context is passed as second parameter (Turbopack transformer or webpack loader with context param)
  else if (contextOrMap && typeof contextOrMap === 'object') {
    // Check for webpack loader interface (passed as second param)
    if (
      contextOrMap.resourcePath &&
      typeof contextOrMap.getOptions === 'function'
    ) {
      filePath = contextOrMap.resourcePath;
      try {
        options = contextOrMap.getOptions() || {};
      } catch (e) {
        console.warn('[AutoIntlTransformer] Failed to get loader options:', e);
      }
    }
    // Check for Turbopack transformer interface
    else if (contextOrMap.path) {
      filePath = contextOrMap.path;
      options = contextOrMap.options || {};
    } else {
      // Unknown format
      console.warn(
        '[AutoIntlTransformer] Unknown context format, returning source unchanged'
      );
      return source;
    }
  } else {
    // No context provided
    console.warn(
      '[AutoIntlTransformer] No context provided, returning source unchanged'
    );
    return source;
  }

  return transformerImpl(source, filePath, options);
}

// Export as default - works for both webpack loader and Turbopack transformer
export default transformerWrapper;
