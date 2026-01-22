"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNextConfig = updateNextConfig;
exports.updateEnvLocal = updateEnvLocal;
exports.createIntlDirectory = createIntlDirectory;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function updateNextConfig(config) {
    const configPath = path_1.default.join(process.cwd(), 'next.config.ts');
    const configJsPath = path_1.default.join(process.cwd(), 'next.config.js');
    const configMjsPath = path_1.default.join(process.cwd(), 'next.config.mjs');
    let configPathToUse = null;
    let isTypeScript = false;
    if (fs_1.default.existsSync(configPath)) {
        configPathToUse = configPath;
        isTypeScript = true;
    }
    else if (fs_1.default.existsSync(configJsPath)) {
        configPathToUse = configJsPath;
    }
    else if (fs_1.default.existsSync(configMjsPath)) {
        configPathToUse = configMjsPath;
    }
    else {
        // Create new config file
        configPathToUse = configPath;
        isTypeScript = true;
    }
    const defaultLocale = config.defaultLocale;
    const targetLocales = config.targetLocales;
    const outputDir = config.outputDir;
    const importStatement = isTypeScript
        ? `import autoIntl, { LanguageCode } from '@dima-algebras/algebras-auto-intl';`
        : `const autoIntl = require('@dima-algebras/algebras-auto-intl').default;\nconst { LanguageCode } = require('@dima-algebras/algebras-auto-intl');`;
    if (fs_1.default.existsSync(configPathToUse)) {
        const existingContent = fs_1.default.readFileSync(configPathToUse, 'utf-8');
        // Check if already configured
        if (existingContent.includes('@dima-algebras/algebras-auto-intl') ||
            existingContent.includes('algebras-auto-intl')) {
            console.log('⚠️  next.config already contains auto-intl configuration. Skipping...');
            return;
        }
        // Try to merge with existing config
        if (isTypeScript) {
            // For TypeScript, we need to be more careful
            let newConfig = existingContent;
            // Add import if not present
            if (!newConfig.includes('@dima-algebras/algebras-auto-intl')) {
                const importMatch = newConfig.match(/^(import.*?from.*?;[\s\n]*)+/m);
                if (importMatch) {
                    newConfig = newConfig.replace(importMatch[0], importMatch[0] + importStatement + '\n');
                }
                else {
                    // Add after type import if exists
                    const typeImportMatch = newConfig.match(/^(import type.*?;[\s\n]*)/m);
                    if (typeImportMatch) {
                        newConfig = newConfig.replace(typeImportMatch[0], typeImportMatch[0] + importStatement + '\n');
                    }
                    else {
                        newConfig = importStatement + '\n\n' + newConfig;
                    }
                }
            }
            // Wrap existing config
            const configMatch = newConfig.match(/(const\s+nextConfig\s*:\s*NextConfig\s*=\s*)([^;]+)(;[\s\n]*export\s+default\s+nextConfig)/);
            if (configMatch) {
                const before = configMatch[1];
                const configBody = configMatch[2].trim();
                const after = configMatch[3];
                const wrappedConfig = `${before}autoIntl({\n  defaultLocale: LanguageCode.${defaultLocale},\n  targetLocales: [${targetLocales.map((l) => `LanguageCode.${l}`).join(', ')}],\n  outputDir: '${outputDir}',\n  includeNodeModules: false,\n})(${configBody})${after}`;
                newConfig = newConfig.replace(configMatch[0], wrappedConfig);
            }
            else {
                // Fallback: try to find export default
                const exportMatch = newConfig.match(/(export\s+default\s+)([^;]+)(;)/s);
                if (exportMatch) {
                    const before = exportMatch[1];
                    const configBody = exportMatch[2].trim();
                    const after = exportMatch[3];
                    const wrappedConfig = `${before}autoIntl({\n  defaultLocale: LanguageCode.${defaultLocale},\n  targetLocales: [${targetLocales.map((l) => `LanguageCode.${l}`).join(', ')}],\n  outputDir: '${outputDir}',\n  includeNodeModules: false,\n})(${configBody})${after}`;
                    newConfig = newConfig.replace(exportMatch[0], wrappedConfig);
                }
                else {
                    console.log('⚠️  Could not automatically merge config. Please add autoIntl manually.');
                    return;
                }
            }
            fs_1.default.writeFileSync(configPathToUse, newConfig, 'utf-8');
            console.log(`✅ Updated ${path_1.default.basename(configPathToUse)}`);
        }
        else {
            // For JavaScript
            let newConfig = existingContent;
            // Add import
            if (!newConfig.includes('@dima-algebras/algebras-auto-intl')) {
                const requireMatch = newConfig.match(/^(const.*?=.*?require\(.*?\);[\s\n]*)+/m);
                if (requireMatch) {
                    newConfig = newConfig.replace(requireMatch[0], requireMatch[0] + importStatement + '\n');
                }
                else {
                    newConfig = importStatement + '\n\n' + newConfig;
                }
            }
            // Wrap config
            const configMatch = newConfig.match(/(module\.exports\s*=\s*|export\s+default\s+)([^;]+)(;)/s);
            if (configMatch) {
                const before = configMatch[1];
                const configBody = configMatch[2].trim();
                const after = configMatch[3];
                const wrappedConfig = `const autoIntlConfig = autoIntl({\n  defaultLocale: LanguageCode.${defaultLocale},\n  targetLocales: [${targetLocales.map((l) => `LanguageCode.${l}`).join(', ')}],\n  outputDir: '${outputDir}',\n  includeNodeModules: false,\n});\n\n${before}autoIntlConfig(${configBody})${after}`;
                newConfig = newConfig.replace(configMatch[0], wrappedConfig);
                fs_1.default.writeFileSync(configPathToUse, newConfig, 'utf-8');
                console.log(`✅ Updated ${path_1.default.basename(configPathToUse)}`);
            }
            else {
                console.log('⚠️  Could not automatically merge config. Please add autoIntl manually.');
            }
        }
    }
    else {
        // Create new config file
        const configContent = isTypeScript
            ? `import type { NextConfig } from 'next';\n${importStatement}\n\nconst nextConfig: NextConfig = autoIntl({\n  defaultLocale: LanguageCode.${defaultLocale},\n  targetLocales: [${targetLocales.map((l) => `LanguageCode.${l}`).join(', ')}],\n  outputDir: '${outputDir}',\n  includeNodeModules: false,\n})({\n  reactStrictMode: true,\n});\n\nexport default nextConfig;\n`
            : `/** @type {import('next').NextConfig} */\n${importStatement}\n\nconst nextConfig = autoIntl({\n  defaultLocale: LanguageCode.${defaultLocale},\n  targetLocales: [${targetLocales.map((l) => `LanguageCode.${l}`).join(', ')}],\n  outputDir: '${outputDir}',\n  includeNodeModules: false,\n})({\n  reactStrictMode: true,\n});\n\nmodule.exports = nextConfig;\n`;
        fs_1.default.writeFileSync(configPathToUse, configContent, 'utf-8');
        console.log(`✅ Created ${path_1.default.basename(configPathToUse)}`);
    }
}
function updateEnvLocal(apiKey, apiUrl) {
    const API_KEYS_URL = 'https://platform.algebras.ai/api-keys';
    const DEFAULT_API_URL = 'https://platform.algebras.ai/api/v1';
    const envLocalPath = path_1.default.join(process.cwd(), '.env.local');
    let existingContent = '';
    if (fs_1.default.existsSync(envLocalPath)) {
        existingContent = fs_1.default.readFileSync(envLocalPath, 'utf-8');
    }
    // Parse existing env vars
    const lines = existingContent.split('\n');
    const envVars = {};
    const otherLines = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            otherLines.push(line);
            continue;
        }
        const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
        if (match) {
            envVars[match[1]] = match[2];
        }
        else {
            otherLines.push(line);
        }
    }
    const existingApiKey = envVars['ALGEBRAS_API_KEY'];
    const existingApiUrl = envVars['ALGEBRAS_API_URL'];
    // Логика для ALGEBRAS_API_KEY
    const hasApiKeyProvided = apiKey && apiKey.trim() !== '';
    if (hasApiKeyProvided) {
        // Пользователь указал ключ - перезаписать/добавить
        envVars['ALGEBRAS_API_KEY'] = apiKey.trim();
    }
    else {
        // Пользователь не указал ключ
        if (existingApiKey !== undefined) {
            // Ключ уже есть в файле - сохранить существующий
            envVars['ALGEBRAS_API_KEY'] = existingApiKey;
        }
        else {
            // Ключа нет в файле - добавить пустой с комментарием
            envVars['ALGEBRAS_API_KEY'] = '';
        }
    }
    // Логика для ALGEBRAS_API_URL
    const finalApiUrl = apiUrl || DEFAULT_API_URL;
    if (existingApiUrl !== undefined && existingApiUrl === finalApiUrl) {
        // URL уже есть и совпадает - не трогать
        envVars['ALGEBRAS_API_URL'] = existingApiUrl;
    }
    else {
        // URL отличается или отсутствует - обновить/добавить
        envVars['ALGEBRAS_API_URL'] = finalApiUrl;
    }
    // Reconstruct file
    let newContent = '';
    if (otherLines.length > 0 && !otherLines[0].startsWith('#')) {
        newContent = otherLines.join('\n') + '\n';
    }
    // Add Algebras AI section
    newContent += '# Algebras AI Translation API\n';
    // Добавить комментарий для API ключа, если он пустой и не был в файле
    if (!hasApiKeyProvided && existingApiKey === undefined) {
        newContent += `# Get your API key at: ${API_KEYS_URL}\n`;
    }
    newContent += `ALGEBRAS_API_KEY=${envVars['ALGEBRAS_API_KEY']}\n`;
    newContent += `ALGEBRAS_API_URL=${envVars['ALGEBRAS_API_URL']}\n`;
    newContent += '\n';
    // Add other env vars
    for (const [key, value] of Object.entries(envVars)) {
        if (key !== 'ALGEBRAS_API_KEY' && key !== 'ALGEBRAS_API_URL') {
            newContent += `${key}=${value}\n`;
        }
    }
    fs_1.default.writeFileSync(envLocalPath, newContent.trim() + '\n', 'utf-8');
    console.log('✅ Updated .env.local with API credentials');
}
function createIntlDirectory(outputDir) {
    const fullPath = path_1.default.join(process.cwd(), outputDir);
    if (!fs_1.default.existsSync(fullPath)) {
        fs_1.default.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created directory: ${outputDir}`);
    }
}
