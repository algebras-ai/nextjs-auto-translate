import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { LanguageCode } from '../data/languageMap';

export function checkNextJsProject(): boolean {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error(
      '❌ Error: package.json not found. Are you in a Next.js project?'
    );
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const hasNext =
      (packageJson.dependencies && packageJson.dependencies.next) ||
      (packageJson.devDependencies && packageJson.devDependencies.next);

    if (!hasNext) {
      console.error(
        '❌ Error: Next.js not found in dependencies. This tool is for Next.js projects only.'
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error: Failed to read package.json:', error);
    return false;
  }
}

export function checkAppRouter(): boolean {
  const appDir = path.join(process.cwd(), 'app');
  const pagesDir = path.join(process.cwd(), 'pages');

  if (!fs.existsSync(appDir) && !fs.existsSync(pagesDir)) {
    console.error(
      '❌ Error: Neither app/ nor pages/ directory found. This tool requires Next.js App Router.'
    );
    return false;
  }

  if (fs.existsSync(pagesDir) && !fs.existsSync(appDir)) {
    console.warn(
      '⚠️  Warning: Pages Router detected. This tool is optimized for App Router.'
    );
  }

  return true;
}

export function checkPackageInstalled(): boolean {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    return '@dima-algebras/algebras-auto-intl' in allDeps;
  } catch {
    return false;
  }
}

export async function installPackage(): Promise<void> {
  if (checkPackageInstalled()) {
    console.log('✅ Package already installed');
    return;
  }

  console.log('📦 Installing @dima-algebras/algebras-auto-intl...');
  try {
    execSync('npm install @dima-algebras/algebras-auto-intl', {
      stdio: 'inherit',
    });
    console.log('✅ Package installed successfully');
  } catch (error) {
    console.error(
      '❌ Failed to install package. Please run: npm install @dima-algebras/algebras-auto-intl'
    );
    throw error;
  }
}

export function validateLocale(locale: string): boolean {
  return Object.values(LanguageCode).includes(locale as LanguageCode);
}
