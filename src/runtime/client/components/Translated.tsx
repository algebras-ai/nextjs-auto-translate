'use client';

import { createElement } from 'react';
import { useAlgebrasIntl } from '../Provider';

const loggedMissingKeys = new Set<string>();

export type ElementPropDescriptor = {
  tag: string;
  props: Record<string, unknown>;
};

interface TranslatedProps {
  tKey: string;
  params?: Record<string, unknown>;
  children?: React.ReactNode;
  /** Build-time injected: tag + props for each <element:...> in content (same order). */
  elementProps?: ElementPropDescriptor[];
  /** Build-time injected: map of PascalCase tag name -> React component for <element:Component>. */
  components?: Record<string, React.ComponentType<unknown>>;
}

const Translated = (props: TranslatedProps) => {
  const { tKey, params, children, elementProps, components } = props;
  const [fileKey, entryKey] = tKey.split('::');

  const { dictionary, locale } = useAlgebrasIntl();

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
    return <>{children ?? null}</>;
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
    return <>{children ?? null}</>;
  }

  // Check if the locale content exists
  const entry = dictionary.files[fileKey].entries[entryKey];
  const content = entry.content[locale];
  if (!content) {
    if (process.env.NODE_ENV === 'development') {
      const logKey = `content-missing::${tKey}::${locale}`;
      if (!loggedMissingKeys.has(logKey)) {
        loggedMissingKeys.add(logKey);
        console.error(
          `Content for locale "${locale}" not found in "${fileKey}::${entryKey}"`
        );
      }
    }
    // Prefer original source content (typically the first/only locale in content),
    // otherwise fall back to children (original JSX).
    const firstLocale = Object.keys(entry.content)[0];
    const fallbackContent = firstLocale
      ? entry.content[firstLocale]
      : undefined;
    return <>{fallbackContent ?? children ?? null}</>;
  }

  // Replace placeholders like {variableName} with translated variable values
  // Professional approach: Extract all placeholders first, then replace them all at once
  const replacePlaceholders = (text: string): string => {
    // Look for placeholders in format {variableName}
    const placeholderRegex = /\{(\w+)\}/g;
    const placeholders = new Map<string, string>();
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
        const raw = (params as Record<string, unknown>)[varName];
        placeholders.set(
          varName,
          raw === null || raw === undefined ? '' : String(raw)
        );
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
      } else {
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
  const parseContent = (
    text: string,
    elementIndexRef: { current: number } = { current: 0 }
  ): React.ReactNode => {
    const textWithPlaceholders = replacePlaceholders(text);

    const elementRegex = /<element:(\w+)>(.*?)<\/element:\1>/gs;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let iterationCount = 0;
    const maxIterations = 100;

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

    const isPascalCase = (s: string) =>
      s.length > 0 &&
      s[0] === s[0].toUpperCase() &&
      s[0] !== s[0].toLowerCase();

    while ((match = elementRegex.exec(textWithPlaceholders)) !== null) {
      if (++iterationCount > maxIterations) {
        console.error('Maximum iterations exceeded in parseContent');
        break;
      }

      if (match.index > lastIndex) {
        parts.push(textWithPlaceholders.substring(lastIndex, match.index));
      }

      const tagFromString = match[1];
      const innerContent = match[2];
      const descriptor = elementProps?.[elementIndexRef.current];
      const tagName = descriptor?.tag ?? tagFromString;
      const propsFromDescriptor = descriptor?.props ?? {};
      elementIndexRef.current += 1;

      const resolvedComponent =
        isPascalCase(tagName) && components?.[tagName]
          ? components[tagName]
          : null;
      const elementType = resolvedComponent ?? tagName;
      const mergedProps = { ...propsFromDescriptor, key: match.index };

      if (voidElements.has(tagName)) {
        parts.push(createElement(elementType, mergedProps));
      } else {
        parts.push(
          createElement(
            elementType,
            mergedProps,
            parseContent(innerContent, elementIndexRef)
          )
        );
      }

      lastIndex = elementRegex.lastIndex;
      if (lastIndex <= match.index) {
        console.error('Regex not advancing, breaking to prevent infinite loop');
        break;
      }
    }

    if (lastIndex < textWithPlaceholders.length) {
      parts.push(textWithPlaceholders.substring(lastIndex));
    }

    return parts.length > 0 ? parts : textWithPlaceholders;
  };

  return <>{parseContent(content, { current: 0 })}</>;
};

export default Translated;
