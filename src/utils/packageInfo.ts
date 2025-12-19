import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedPackageName: string | null = null;

function readPackageName(): string {
  // src/utils/* and dist/utils/* are both nested 2 levels under the package root
  const pkgPath = path.resolve(__dirname, '../../package.json');
  const raw = fs.readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(raw) as { name?: unknown };

  if (typeof pkg.name !== 'string' || pkg.name.length === 0) {
    throw new Error(`[AutoIntl] Could not read package name from ${pkgPath}`);
  }

  return pkg.name;
}

export function getPackageName(): string {
  if (cachedPackageName) return cachedPackageName;
  cachedPackageName = readPackageName();
  return cachedPackageName;
}

export const PACKAGE_NAME = getPackageName();

export function runtimeImportPath(subpath: string): string {
  return `${PACKAGE_NAME}/${subpath}`;
}
