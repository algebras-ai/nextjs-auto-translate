import fs from 'fs';
import path from 'path';

function readPackageName(): string {
  try {
    const pkgPath = path.resolve(__dirname, '..', 'package.json');
    const raw = fs.readFileSync(pkgPath, 'utf-8');
    const parsed: unknown = JSON.parse(raw);

    if (
      parsed &&
      typeof parsed === 'object' &&
      'name' in parsed &&
      typeof (parsed as { name?: unknown }).name === 'string' &&
      (parsed as { name: string }).name.trim().length > 0
    ) {
      return (parsed as { name: string }).name.trim();
    }
  } catch {
    // ignore - fall back below
  }

  // Fallback only for unusual runtimes where package.json isn't available.
  return 'algebras-auto-intl';
}

export const PACKAGE_NAME = readPackageName();

export const RUNTIME_PATHS = {
  SERVER_INTL_WRAPPER: `${PACKAGE_NAME}/runtime/server/IntlWrapper`,
  CLIENT_TRANSLATED: `${PACKAGE_NAME}/runtime/client/components/Translated`,
  CLIENT_LOCALE_SWITCHER: `${PACKAGE_NAME}/runtime/client/components/LocaleSwitcher`,
  TURBOPACK_TRANSFORMER: `${PACKAGE_NAME}/turbopack/auto-intl-transformer`,
} as const;
