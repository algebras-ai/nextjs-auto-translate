"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askQuestions = askQuestions;
const languageMap_1 = require("../data/languageMap");
// Dynamic import for inquirer (ES module)
// Using Function constructor to ensure true dynamic import (not compiled to require)
async function getInquirer() {
    try {
        // Use Function constructor to create a true dynamic import that won't be transformed by TypeScript
        // Node.js will resolve modules from node_modules automatically
        const dynamicImport = new Function('specifier', 'return import(specifier)');
        const inquirerModule = await dynamicImport('inquirer');
        const autocompleteModule = await dynamicImport('inquirer-autocomplete-prompt');
        // Register autocomplete prompt
        inquirerModule.default.registerPrompt('autocomplete', autocompleteModule.default);
        return inquirerModule.default;
    }
    catch (error) {
        console.error('❌ Failed to load inquirer:', error?.message || error);
        console.error('Make sure inquirer and inquirer-autocomplete-prompt are installed in node_modules');
        throw error;
    }
}
const SUPPORTED_LANGUAGES_URL = 'https://platform.algebras.ai/translation/translate';
const API_KEYS_URL = 'https://platform.algebras.ai/api-keys';
// Создаем список языков в формате "code - Language Name"
const languageList = Object.entries(languageMap_1.languageMap).map(([code, name]) => ({
    code: code,
    name,
    display: `${code} - ${name}`,
}));
// Функция поиска для autocomplete
// inquirer-autocomplete-prompt expects source to be a function that returns a Promise
function createLanguageSearch() {
    return (answersSoFar, input) => {
        return new Promise((resolve) => {
            if (!input || input === '') {
                resolve(languageList.map((lang) => lang.display));
                return;
            }
            const searchLower = input.toLowerCase();
            const filtered = languageList
                .filter((lang) => lang.code.toLowerCase().includes(searchLower) ||
                lang.name.toLowerCase().includes(searchLower))
                .map((lang) => lang.display);
            resolve(filtered);
        });
    };
}
// Извлекает код языка из строки "code - Language Name"
function extractLanguageCode(displayString) {
    if (!displayString) {
        return displayString;
    }
    // Может быть уже код, или "code - Language Name"
    const match = displayString.match(/^([a-z_]+)\s*-/);
    if (match) {
        return match[1];
    }
    // Если это просто код (без дефиса), вернуть как есть
    if (/^[a-z_]+$/.test(displayString)) {
        return displayString;
    }
    return displayString;
}
async function askQuestions(options) {
    const inquirer = await getInquirer();
    const languageSearch = createLanguageSearch();
    // Определяем, какие вопросы нужно задать
    const needsDefaultLocale = !options?.defaultLocale;
    const needsTargetLocales = !options?.targetLocales || options.targetLocales.length === 0;
    const needsOutputDir = !options?.outputDir;
    const needsApiKey = !options?.apiKey;
    const needsApiUrl = !options?.apiUrl;
    const answers = {};
    // Default locale
    if (needsDefaultLocale) {
        const defaultLocaleAnswer = await inquirer.prompt([
            {
                type: 'autocomplete',
                name: 'defaultLocale',
                message: `Select default locale (See supported languages: ${SUPPORTED_LANGUAGES_URL}):`,
                source: languageSearch,
                pageSize: 10,
            },
        ]);
        answers.defaultLocale = extractLanguageCode(defaultLocaleAnswer.defaultLocale);
    }
    else {
        answers.defaultLocale = options.defaultLocale;
    }
    // Target locales (можно выбрать несколько)
    if (needsTargetLocales) {
        const targetLocales = [];
        let addMore = true;
        while (addMore) {
            const targetLocaleAnswer = await inquirer.prompt([
                {
                    type: 'autocomplete',
                    name: 'targetLocale',
                    message: `Select target locale ${targetLocales.length > 0 ? `(${targetLocales.length} selected)` : ''} (See supported languages: ${SUPPORTED_LANGUAGES_URL}):`,
                    source: languageSearch,
                    pageSize: 10,
                },
                {
                    type: 'confirm',
                    name: 'addMore',
                    message: 'Add another target locale?',
                    default: true,
                },
            ]);
            const code = extractLanguageCode(targetLocaleAnswer.targetLocale);
            targetLocales.push(code);
            addMore = targetLocaleAnswer.addMore;
        }
        answers.targetLocales = targetLocales;
    }
    else {
        answers.targetLocales = options.targetLocales;
    }
    // Output directory
    if (needsOutputDir) {
        const outputDirAnswer = await inquirer.prompt([
            {
                type: 'input',
                name: 'outputDir',
                message: 'Output directory for intl files:',
                default: './src/intl',
                validate: (input) => {
                    if (!input.trim()) {
                        return 'Output directory cannot be empty';
                    }
                    return true;
                },
            },
        ]);
        answers.outputDir = outputDirAnswer.outputDir;
    }
    else {
        answers.outputDir = options.outputDir;
    }
    // API key (опционально)
    if (needsApiKey) {
        const apiKeyAnswer = await inquirer.prompt([
            {
                type: 'input',
                name: 'apiKey',
                message: `Algebras AI API key (optional, press Enter to skip):\nGet your API key: ${API_KEYS_URL}\n`,
                default: '',
            },
        ]);
        if (apiKeyAnswer.apiKey?.trim()) {
            answers.apiKey = apiKeyAnswer.apiKey.trim();
        }
    }
    else if (options.apiKey) {
        answers.apiKey = options.apiKey;
    }
    // API URL (опционально)
    if (needsApiUrl) {
        const apiUrlAnswer = await inquirer.prompt([
            {
                type: 'input',
                name: 'apiUrl',
                message: 'Algebras AI API URL (optional, press Enter for default):',
                default: 'https://platform.algebras.ai/api/v1',
            },
        ]);
        if (apiUrlAnswer.apiUrl?.trim()) {
            answers.apiUrl = apiUrlAnswer.apiUrl.trim();
        }
        else {
            answers.apiUrl = 'https://platform.algebras.ai/api/v1';
        }
    }
    else if (options.apiUrl) {
        answers.apiUrl = options.apiUrl;
    }
    return answers;
}
