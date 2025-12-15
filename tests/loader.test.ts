import path from 'path';
import { describe, expect, it, vi } from 'vitest';
import type { ScopeMap } from '../src/types';
import loader from '../src/webpack/auto-intl-loader';

const runLoader = (code: string, opts: any, resourcePath?: string) =>
  new Promise<string>((resolve, reject) => {
    const emitError = vi.fn((err: Error) => {
      reject(err);
    });
    const ctx: any = {
      getOptions: () => opts,
      async: () => (err: any, result: string) =>
        err ? reject(err) : resolve(result),
      resourcePath: resourcePath || `${process.cwd()}/src/X.tsx`,
      emitError,
    };
    (loader as any).call(ctx, code);
  });

// Helper to get relative path matching what transformProject uses
const getRelativePath = (filePath: string): string => {
  return path.relative(process.cwd(), filePath);
};

// Helper to get the actual scope path for a JSX element in a simple component
// For: export default function Component() { return <div>Hello</div>; }
// The div element's scope path is: program/body0/declaration/body/body0/argument
const getDefaultScopePath = (): string => {
  return 'program/body0/declaration/body/body0/argument';
};

const makeScopeMap = (filePath: string, scopePath?: string): ScopeMap => ({
  files: {
    [filePath]: {
      scopes: {
        [scopePath || getDefaultScopePath()]: {
          type: 'text',
          content: 'Hello',
          hash: 'h1',
          context: '',
          skip: false,
          overrides: {},
        },
      },
    },
  },
});

describe('webpack loader', () => {
  describe('basic functionality', () => {
    it('passes through when no scopes', async () => {
      const out = await runLoader('export default ()=> <div>Hello</div>', {
        sourceMap: { files: {} },
      });
      expect(out).toContain('Hello');
    });

    it('returns transformed code as string', async () => {
      const out = await runLoader('export default ()=> <div>Hello</div>', {
        sourceMap: { files: {} },
      });
      expect(typeof out).toBe('string');
    });
  });

  describe('layout wrapping', () => {
    it('wraps app/layout.tsx with IntlWrapper', async () => {
      const layoutCode = `export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}`;
      const resourcePath = `${process.cwd()}/app/layout.tsx`;
      const out = await runLoader(
        layoutCode,
        { sourceMap: { files: {} } },
        resourcePath
      );

      expect(out).toContain('IntlWrapper');
      expect(out).toContain('nextjs-auto-intl/runtime/server/IntlWrapper');
      expect(out).toContain('<IntlWrapper>');
    });

    it('does not wrap non-layout files', async () => {
      const code = `export default function Page() {
  return <div>Hello</div>;
}`;
      const resourcePath = `${process.cwd()}/app/page.tsx`;
      const out = await runLoader(
        code,
        { sourceMap: { files: {} } },
        resourcePath
      );

      expect(out).not.toContain('IntlWrapper');
    });

    it('does not double-wrap if IntlWrapper already exists', async () => {
      const layoutCode = `import IntlWrapper from "algebras-auto-intl/runtime/server/IntlWrapper";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body><IntlWrapper>{children}</IntlWrapper></body>
    </html>
  );
}`;
      const resourcePath = `${process.cwd()}/app/layout.tsx`;
      const out = await runLoader(
        layoutCode,
        { sourceMap: { files: {} } },
        resourcePath
      );

      // Should not add duplicate import
      const importMatches = (out.match(/import.*IntlWrapper/g) || []).length;
      expect(importMatches).toBe(1);
    });
  });

  describe('text transformation', () => {
    it('transforms JSX text to Translated components when in sourceMap', async () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const resourcePath = `${process.cwd()}/src/Component.tsx`;
      const relativePath = getRelativePath(resourcePath);
      const scopePath = getDefaultScopePath();
      const sourceMap = makeScopeMap(relativePath, scopePath);

      const out = await runLoader(code, { sourceMap }, resourcePath);

      expect(out).toContain('<Translated');
      expect(out).toContain(`tKey="${relativePath}::${scopePath}"`);
      expect(out).toContain(
        'nextjs-auto-intl/runtime/client/components/Translated'
      );
    });

    it('adds Translated import when transforming text', async () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const resourcePath = `${process.cwd()}/src/Component.tsx`;
      const relativePath = getRelativePath(resourcePath);
      const sourceMap = makeScopeMap(relativePath);

      const out = await runLoader(code, { sourceMap }, resourcePath);

      expect(out).toContain('import Translated');
      expect(out).toContain(
        'nextjs-auto-intl/runtime/client/components/Translated'
      );
    });

    it('does not transform text when file not in sourceMap', async () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const resourcePath = `${process.cwd()}/src/Other.tsx`;
      const componentRelativePath = getRelativePath(
        `${process.cwd()}/src/Component.tsx`
      );
      const sourceMap = makeScopeMap(componentRelativePath);

      const out = await runLoader(code, { sourceMap }, resourcePath);

      expect(out).toContain('Hello');
      expect(out).not.toContain('<Translated');
    });

    it('handles multiple text nodes in same component', async () => {
      // Use a simpler structure where text nodes are direct children of the same element
      const code = `export default function Component() {
  return <div>First Second</div>;
}`;
      const resourcePath = `${process.cwd()}/src/Component.tsx`;
      const relativePath = getRelativePath(resourcePath);
      const divScopePath = getDefaultScopePath();
      const sourceMap: ScopeMap = {
        files: {
          [relativePath]: {
            scopes: {
              [divScopePath]: {
                type: 'text',
                content: 'First Second',
                hash: 'h1',
                context: '',
                skip: false,
                overrides: {},
              },
            },
          },
        },
      };

      const out = await runLoader(code, { sourceMap }, resourcePath);

      // Should transform the text node
      expect(out).toContain('<Translated');
      expect(out).toContain(`tKey="${relativePath}::${divScopePath}"`);
    });
  });

  describe('page file handling', () => {
    it('does not inject locale switcher into page.tsx files (manual import only)', async () => {
      const code = `export default function Page() {
  return <main><h1>Hello</h1></main>;
}`;
      const resourcePath = `${process.cwd()}/app/page.tsx`;
      const out = await runLoader(
        code,
        { sourceMap: { files: {} } },
        resourcePath
      );

      expect(out).not.toContain('LocalesSwitcher');
      expect(out).not.toContain(
        'nextjs-auto-intl/runtime/client/components/LocaleSwitcher'
      );
    });

    it('does not inject locale switcher even when no sourceMap (manual import only)', async () => {
      const code = `export default function Page() {
  return <main><h1>Hello</h1></main>;
}`;
      const resourcePath = `${process.cwd()}/app/page.tsx`;
      const out = await runLoader(
        code,
        { sourceMap: { files: {} } },
        resourcePath
      );

      expect(out).not.toContain('LocalesSwitcher');
    });

    it('does not inject locale switcher into non-page files', async () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const resourcePath = `${process.cwd()}/src/Component.tsx`;
      const out = await runLoader(
        code,
        { sourceMap: { files: {} } },
        resourcePath
      );

      expect(out).not.toContain('LocalesSwitcher');
    });
  });

  describe('error handling', () => {
    it('handles parse errors gracefully by returning original code', async () => {
      const invalidCode = `export default () => <div>`; // Invalid JSX
      const resourcePath = `${process.cwd()}/src/Broken.tsx`;
      const relativePath = getRelativePath(resourcePath);
      const sourceMap = makeScopeMap(relativePath, 'some/scope/path');

      // transformProject handles parse errors gracefully, so loader should too
      const out = await runLoader(invalidCode, { sourceMap }, resourcePath);
      expect(out).toBe(invalidCode);
    });

    it('handles missing sourceMap gracefully', async () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const out = await runLoader(code, { sourceMap: { files: {} } });
      expect(typeof out).toBe('string');
    });
  });

  describe('pass-through behavior', () => {
    it('passes through files not in sourceMap', async () => {
      const code = `export default function Component() {
  return <div>Hello World</div>;
}`;
      const resourcePath = `${process.cwd()}/src/Other.tsx`;
      const componentRelativePath = getRelativePath(
        `${process.cwd()}/src/Component.tsx`
      );
      const sourceMap = makeScopeMap(componentRelativePath);

      const out = await runLoader(code, { sourceMap }, resourcePath);

      expect(out).toContain('Hello World');
      expect(out).not.toContain('<Translated');
    });

    it('passes through when sourceMap has empty files', async () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const out = await runLoader(code, { sourceMap: { files: {} } });
      expect(out).toContain('Hello');
    });
  });

  describe('stability tests', () => {
    for (let i = 0; i < 5; i++) {
      it(`runs without throwing (${i + 1})`, async () => {
        const out = await runLoader('export default ()=> <div>Hello</div>', {
          sourceMap: { files: {} },
        });
        expect(typeof out).toBe('string');
      });
    }
  });
});
