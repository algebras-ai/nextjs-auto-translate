import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { languages } from '../data/languages';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputPath = resolve(__dirname, '../src/data/languageMap.ts');
const outputDir = dirname(outputPath);
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Generate enum entries
const enumEntries = languages.map(
  ({ language, name }) =>
    `  /** ${name} */\n  ${language} = ${JSON.stringify(language)},`
);

// Generate map entries
const mapEntries = languages.map(
  ({ language, name }) =>
    `  [LanguageCode.${language}]: ${JSON.stringify(name)},`
);

// Final file content
const fileContent = `// 🛑 GENERATED FILE — DO NOT EDIT MANUALLY
// Run \`npm run build\` to regenerate

/** Language codes */
export enum LanguageCode {
${enumEntries.join('\n')}
}

export const languageMap = {
${mapEntries.join('\n')}
} as const;
`;

writeFileSync(outputPath, fileContent, 'utf-8');
console.log('✅ languageMap.ts generated at:', outputPath);
