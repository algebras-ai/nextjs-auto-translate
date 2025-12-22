import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { PACKAGE_NAME, RUNTIME_PATHS } from '../src/constants';

describe('constants (PACKAGE_NAME / RUNTIME_PATHS)', () => {
  it('derives PACKAGE_NAME from package.json', () => {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
      name?: unknown;
    };

    expect(typeof pkg.name).toBe('string');
    expect(PACKAGE_NAME).toBe(pkg.name);
  });

  it('builds runtime import paths from PACKAGE_NAME', () => {
    expect(RUNTIME_PATHS.SERVER_INTL_WRAPPER).toBe(
      `${PACKAGE_NAME}/runtime/server/IntlWrapper`
    );
    expect(RUNTIME_PATHS.CLIENT_TRANSLATED).toBe(
      `${PACKAGE_NAME}/runtime/client/components/Translated`
    );
    expect(RUNTIME_PATHS.CLIENT_LOCALE_SWITCHER).toBe(
      `${PACKAGE_NAME}/runtime/client/components/LocaleSwitcher`
    );
    expect(RUNTIME_PATHS.TURBOPACK_TRANSFORMER).toBe(
      `${PACKAGE_NAME}/turbopack/auto-intl-transformer`
    );
  });
});
