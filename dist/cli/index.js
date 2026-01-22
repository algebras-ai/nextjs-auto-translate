#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const init_1 = require("./commands/init");
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};
    let command = null;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (!arg.startsWith('--') && !arg.startsWith('-') && !command) {
            command = arg;
            continue;
        }
        switch (arg) {
            case '--default-locale':
                options.defaultLocale = args[++i];
                break;
            case '--target-locales':
                const locales = args[++i];
                options.targetLocales = locales.split(',').map((l) => l.trim());
                break;
            case '--output-dir':
                options.outputDir = args[++i];
                break;
            case '--api-key':
                options.apiKey = args[++i];
                break;
            case '--api-url':
                options.apiUrl = args[++i];
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
                break;
        }
    }
    return { command, options };
}
function printHelp() {
    console.log(`
Usage: algebras-auto-intl <command> [options]

Commands:
  init    Initialize Algebras Auto Intl in your Next.js project

Options:
  --default-locale <code>    Default locale code (e.g., en)
  --target-locales <codes>    Comma-separated target locale codes (e.g., ru,es,fr)
  --output-dir <path>         Output directory for intl files (default: ./src/intl)
  --api-key <key>            Algebras AI API key (optional)
  --api-url <url>             Algebras AI API URL (optional, default: https://platform.algebras.ai/api/v1)
  --help, -h                  Show this help message

Examples:
  algebras-auto-intl init
  algebras-auto-intl init --default-locale en --target-locales ru,es,fr
  algebras-auto-intl init --api-key your_api_key_here

See supported languages: https://platform.algebras.ai/translation/translate
`);
}
async function main() {
    const { command, options } = parseArgs();
    if (!command || command === '--help' || command === '-h') {
        printHelp();
        return;
    }
    switch (command) {
        case 'init':
            await (0, init_1.initCommand)(options);
            break;
        default:
            console.error(`❌ Unknown command: ${command}`);
            printHelp();
            process.exit(1);
    }
}
// Run if called directly
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
}
