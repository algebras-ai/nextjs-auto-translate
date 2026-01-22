"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNextJsProject = checkNextJsProject;
exports.checkAppRouter = checkAppRouter;
exports.checkPackageInstalled = checkPackageInstalled;
exports.installPackage = installPackage;
exports.validateLocale = validateLocale;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const languageMap_1 = require("../data/languageMap");
function checkNextJsProject() {
    const packageJsonPath = path_1.default.join(process.cwd(), 'package.json');
    if (!fs_1.default.existsSync(packageJsonPath)) {
        console.error('❌ Error: package.json not found. Are you in a Next.js project?');
        return false;
    }
    try {
        const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf-8'));
        const hasNext = (packageJson.dependencies && packageJson.dependencies.next) ||
            (packageJson.devDependencies && packageJson.devDependencies.next);
        if (!hasNext) {
            console.error('❌ Error: Next.js not found in dependencies. This tool is for Next.js projects only.');
            return false;
        }
        return true;
    }
    catch (error) {
        console.error('❌ Error: Failed to read package.json:', error);
        return false;
    }
}
function checkAppRouter() {
    const appDir = path_1.default.join(process.cwd(), 'app');
    const pagesDir = path_1.default.join(process.cwd(), 'pages');
    if (!fs_1.default.existsSync(appDir) && !fs_1.default.existsSync(pagesDir)) {
        console.error('❌ Error: Neither app/ nor pages/ directory found. This tool requires Next.js App Router.');
        return false;
    }
    if (fs_1.default.existsSync(pagesDir) && !fs_1.default.existsSync(appDir)) {
        console.warn('⚠️  Warning: Pages Router detected. This tool is optimized for App Router.');
    }
    return true;
}
function checkPackageInstalled() {
    const packageJsonPath = path_1.default.join(process.cwd(), 'package.json');
    if (!fs_1.default.existsSync(packageJsonPath)) {
        return false;
    }
    try {
        const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf-8'));
        const allDeps = {
            ...(packageJson.dependencies || {}),
            ...(packageJson.devDependencies || {}),
        };
        return '@dima-algebras/algebras-auto-intl' in allDeps;
    }
    catch {
        return false;
    }
}
async function installPackage() {
    if (checkPackageInstalled()) {
        console.log('✅ Package already installed');
        return;
    }
    console.log('📦 Installing @dima-algebras/algebras-auto-intl...');
    try {
        (0, child_process_1.execSync)('npm install @dima-algebras/algebras-auto-intl', { stdio: 'inherit' });
        console.log('✅ Package installed successfully');
    }
    catch (error) {
        console.error('❌ Failed to install package. Please run: npm install @dima-algebras/algebras-auto-intl');
        throw error;
    }
}
function validateLocale(locale) {
    return Object.values(languageMap_1.LanguageCode).includes(locale);
}
