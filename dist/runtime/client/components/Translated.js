"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Provider_1 = require("../Provider");
const loggedMissingKeys = new Set();
const Translated = (props) => {
    const { tKey, params, children } = props;
    const [fileKey, entryKey] = tKey.split('::');
    const { dictionary, locale } = (0, Provider_1.useAlgebrasIntl)();
    // Check if the file exists in dictionary
    if (!dictionary.files[fileKey]) {
        if (process.env.NODE_ENV === 'development') {
            const logKey = `file-missing::${tKey}`;
            if (!loggedMissingKeys.has(logKey)) {
                loggedMissingKeys.add(logKey);
                console.error(`File "${fileKey}" not found in dictionary`);
                console.error(`Available files:`, Object.keys(dictionary.files));
                console.error(`tKey was:`, tKey);
            }
        }
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children ?? null });
    }
    // Check if the entry exists in the file
    if (!dictionary.files[fileKey].entries[entryKey]) {
        if (process.env.NODE_ENV === 'development') {
            const logKey = `entry-missing::${tKey}`;
            if (!loggedMissingKeys.has(logKey)) {
                loggedMissingKeys.add(logKey);
                console.error(`Entry "${entryKey}" not found in file "${fileKey}"`);
            }
        }
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children ?? null });
    }
    // Check if the locale content exists
    const entry = dictionary.files[fileKey].entries[entryKey];
    const content = entry.content[locale];
    if (!content) {
        if (process.env.NODE_ENV === 'development') {
            const logKey = `content-missing::${tKey}::${locale}`;
            if (!loggedMissingKeys.has(logKey)) {
                loggedMissingKeys.add(logKey);
                console.error(`Content for locale "${locale}" not found in "${fileKey}::${entryKey}"`);
            }
        }
        // Prefer original source content (typically the first/only locale in content),
        // otherwise fall back to children (original JSX).
        const firstLocale = Object.keys(entry.content)[0];
        const fallbackContent = firstLocale
            ? entry.content[firstLocale]
            : undefined;
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: fallbackContent ?? children ?? null });
    }
    // Replace placeholders like {variableName} with translated variable values
    // Professional approach: Extract all placeholders first, then replace them all at once
    const replacePlaceholders = (text) => {
        // Look for placeholders in format {variableName}
        const placeholderRegex = /\{(\w+)\}/g;
        const placeholders = new Map();
        let match;
        // First pass: Find all placeholders and their translated values
        while ((match = placeholderRegex.exec(text)) !== null) {
            const varName = match[1];
            // Skip if already processed
            if (placeholders.has(varName)) {
                continue;
            }
            // 1) If runtime params are provided (e.g. map() interpolations), prefer them.
            if (params && Object.prototype.hasOwnProperty.call(params, varName)) {
                const raw = params[varName];
                placeholders.set(varName, raw === null || raw === undefined ? '' : String(raw));
                continue;
            }
            // Try to find the translated variable value in the dictionary
            // Pattern: {entryKey}_var_{variableName}
            const varEntryKey = `${entryKey}_var_${varName}`;
            let varEntry = dictionary.files[fileKey]?.entries[varEntryKey];
            // If not found with exact pattern, search for any entry ending with _var_{varName}
            if (!varEntry) {
                const allEntries = dictionary.files[fileKey]?.entries || {};
                for (const [key, entry] of Object.entries(allEntries)) {
                    if (key.endsWith(`_var_${varName}`)) {
                        varEntry = entry;
                        break;
                    }
                }
            }
            if (varEntry?.content[locale]) {
                const translatedValue = varEntry.content[locale];
                placeholders.set(varName, translatedValue);
            }
            else {
                // If translation not found, keep the placeholder as-is
                // This allows the original variable value to be used at runtime
                placeholders.set(varName, `{${varName}}`);
            }
        }
        // Second pass: Replace all placeholders at once
        let result = text;
        for (const [varName, translatedValue] of placeholders) {
            // Replace all occurrences of {varName} with translated value
            // Use a more robust regex that handles edge cases
            const regex = new RegExp(`\\{${varName}\\}`, 'g');
            result = result.replace(regex, translatedValue);
        }
        return result;
    };
    // Parse content with <element:tag> syntax back into React elements
    const parseContent = (text) => {
        // First replace placeholders with translated variable values
        const textWithPlaceholders = replacePlaceholders(text);
        const elementRegex = /<element:(\w+)>(.*?)<\/element:\1>/gs;
        const parts = [];
        let lastIndex = 0;
        let match;
        let iterationCount = 0;
        const maxIterations = 100; // Prevent infinite loops
        // Void elements that cannot have children
        const voidElements = new Set([
            'area',
            'base',
            'br',
            'col',
            'embed',
            'hr',
            'img',
            'input',
            'link',
            'meta',
            'param',
            'source',
            'track',
            'wbr',
        ]);
        while ((match = elementRegex.exec(text)) !== null) {
            // Safety check to prevent infinite loops
            if (++iterationCount > maxIterations) {
                console.error('Maximum iterations exceeded in parseContent');
                break;
            }
            // Add text before the element (with placeholders replaced)
            if (match.index > lastIndex) {
                parts.push(textWithPlaceholders.substring(lastIndex, match.index));
            }
            // Add the element
            const tagName = match[1];
            const innerContent = match[2];
            // Void elements cannot have children
            if (voidElements.has(tagName)) {
                parts.push((0, react_1.createElement)(tagName, { key: match.index }));
            }
            else {
                parts.push((0, react_1.createElement)(tagName, { key: match.index }, parseContent(innerContent)));
            }
            lastIndex = elementRegex.lastIndex;
            // Safety check: if we're not advancing, break to prevent infinite loop
            if (lastIndex <= match.index) {
                console.error('Regex not advancing, breaking to prevent infinite loop');
                break;
            }
        }
        // Add remaining text (with placeholders replaced)
        if (lastIndex < textWithPlaceholders.length) {
            parts.push(textWithPlaceholders.substring(lastIndex));
        }
        return parts.length > 0 ? parts : textWithPlaceholders;
    };
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: parseContent(content) });
};
exports.default = Translated;
