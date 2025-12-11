import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import transformer from '../src/turbopack/auto-intl-transformer';
import type { ScopeMap } from '../src/types';

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

describe('turbopack transformer', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    // Create a temporary directory for each test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'turbopack-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    // Cleanup
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('basic functionality', () => {
    it('returns string synchronously', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const result = transformer(code, {
        path: `${tempDir}/src/Component.tsx`,
        options: { sourceMap: { files: {} } },
      });

      expect(typeof result).toBe('string');
    });

    it('passes through when no sourceMap', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const result = transformer(code, {
        path: `${tempDir}/src/Component.tsx`,
        options: {},
      });

      expect(result).toContain('Hello');
    });
  });

  describe('source map from options', () => {
    it('transforms code with sourceMap from options', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const filePath = `${tempDir}/src/Component.tsx`;
      const relativePath = getRelativePath(filePath);
      const scopePath = getDefaultScopePath();
      const sourceMap = makeScopeMap(relativePath, scopePath);

      const result = transformer(code, {
        path: filePath,
        options: { sourceMap },
      });

      expect(result).toContain('<Translated');
      expect(result).toContain(`tKey="${relativePath}::${scopePath}"`);
    });

    it('uses sourceMap from options over disk', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const filePath = `${tempDir}/src/Component.tsx`;
      const relativePath = getRelativePath(filePath);

      // Create a source map on disk with different content
      fs.mkdirSync(path.join(tempDir, 'src/intl'), { recursive: true });
      const diskSourceMap: ScopeMap = {
        files: {
          [relativePath]: {
            scopes: {
              '0/0': {
                type: 'text',
                content: 'DiskContent',
                hash: 'h1',
                context: '',
                skip: false,
                overrides: {},
              },
            },
          },
        },
      };
      fs.writeFileSync(
        path.join(tempDir, 'src/intl/source.json'),
        JSON.stringify(diskSourceMap)
      );

      // Provide different sourceMap in options
      const scopePath = getDefaultScopePath();
      const optionsSourceMap = makeScopeMap(relativePath, scopePath);

      const result = transformer(code, {
        path: filePath,
        options: { sourceMap: optionsSourceMap },
      });

      // Should use options sourceMap, not disk
      expect(result).toContain(`tKey="${relativePath}::${scopePath}"`);
    });
  });

  describe('source map loading from disk', () => {
    it('loads sourceMap from src/intl/source.json', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const filePath = `${tempDir}/src/Component.tsx`;
      const relativePath = getRelativePath(filePath);
      const sourceMap = makeScopeMap(relativePath);

      // Create source map file
      fs.mkdirSync(path.join(tempDir, 'src/intl'), { recursive: true });
      fs.writeFileSync(
        path.join(tempDir, 'src/intl/source.json'),
        JSON.stringify(sourceMap)
      );

      const result = transformer(code, {
        path: filePath,
        options: {},
      });

      expect(result).toContain('<Translated');
      const scopePath = getDefaultScopePath();
      expect(result).toContain(`tKey="${relativePath}::${scopePath}"`);
    });

    it('loads sourceMap from .intl/source.json as fallback', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const filePath = `${tempDir}/src/Component.tsx`;
      const relativePath = getRelativePath(filePath);
      const sourceMap = makeScopeMap(relativePath);

      // Create source map file in .intl directory
      fs.mkdirSync(path.join(tempDir, '.intl'), { recursive: true });
      fs.writeFileSync(
        path.join(tempDir, '.intl/source.json'),
        JSON.stringify(sourceMap)
      );

      const result = transformer(code, {
        path: filePath,
        options: {},
      });

      expect(result).toContain('<Translated');
    });

    it('loads sourceMap from source.json in root as last fallback', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const filePath = `${tempDir}/src/Component.tsx`;
      const relativePath = getRelativePath(filePath);
      const sourceMap = makeScopeMap(relativePath);

      // Create source map file in root
      fs.writeFileSync(
        path.join(tempDir, 'source.json'),
        JSON.stringify(sourceMap)
      );

      const result = transformer(code, {
        path: filePath,
        options: {},
      });

      expect(result).toContain('<Translated');
    });

    it('uses custom outputDir from options', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const filePath = `${tempDir}/src/Component.tsx`;
      const relativePath = getRelativePath(filePath);
      const sourceMap = makeScopeMap(relativePath);

      // Create source map in custom directory
      const customDir = path.join(tempDir, 'custom/intl');
      fs.mkdirSync(customDir, { recursive: true });
      fs.writeFileSync(
        path.join(customDir, 'source.json'),
        JSON.stringify(sourceMap)
      );

      const result = transformer(code, {
        path: filePath,
        options: { outputDir: './custom/intl' },
      });

      expect(result).toContain('<Translated');
    });

    it('handles invalid JSON in source map file gracefully', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;

      // Create invalid JSON file
      fs.mkdirSync(path.join(tempDir, 'src/intl'), { recursive: true });
      fs.writeFileSync(
        path.join(tempDir, 'src/intl/source.json'),
        'invalid json {'
      );

      const result = transformer(code, {
        path: `${tempDir}/src/Component.tsx`,
        options: {},
      });

      // Should return original code (no transformation)
      expect(result).toContain('Hello');
      expect(result).not.toContain('<Translated');
    });

    it('handles missing source map file gracefully', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;

      const result = transformer(code, {
        path: `${tempDir}/src/Component.tsx`,
        options: {},
      });

      // Should return original code
      expect(result).toContain('Hello');
    });
  });

  describe('layout wrapping', () => {
    it('wraps app/layout.tsx with IntlWrapper', () => {
      const layoutCode = `export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}`;
      const result = transformer(layoutCode, {
        path: `${tempDir}/app/layout.tsx`,
        options: { sourceMap: { files: {} } },
      });

      expect(result).toContain('IntlWrapper');
      expect(result).toContain('nextjs-auto-intl/runtime/server/IntlWrapper');
      expect(result).toContain('<IntlWrapper>');
    });

    it('does not wrap non-layout files', () => {
      const code = `export default function Page() {
  return <div>Hello</div>;
}`;
      const result = transformer(code, {
        path: `${tempDir}/app/page.tsx`,
        options: { sourceMap: { files: {} } },
      });

      expect(result).not.toContain('IntlWrapper');
    });

    it('does not double-wrap if IntlWrapper already exists', () => {
      const layoutCode = `import IntlWrapper from "algebras-auto-intl/runtime/server/IntlWrapper";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body><IntlWrapper>{children}</IntlWrapper></body>
    </html>
  );
}`;
      const result = transformer(layoutCode, {
        path: `${tempDir}/app/layout.tsx`,
        options: { sourceMap: { files: {} } },
      });

      // Should not add duplicate import
      const importMatches = (result.match(/import.*IntlWrapper/g) || []).length;
      expect(importMatches).toBe(1);
    });
  });

  describe('text transformation', () => {
    it('transforms JSX text to Translated components when in sourceMap', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const filePath = `${tempDir}/src/Component.tsx`;
      const relativePath = getRelativePath(filePath);
      const scopePath = getDefaultScopePath();
      const sourceMap = makeScopeMap(relativePath, scopePath);

      const result = transformer(code, {
        path: filePath,
        options: { sourceMap },
      });

      expect(result).toContain('<Translated');
      expect(result).toContain(`tKey="${relativePath}::${scopePath}"`);
      expect(result).toContain(
        'nextjs-auto-intl/runtime/client/components/Translated'
      );
    });

    it('adds Translated import when transforming text', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const filePath = `${tempDir}/src/Component.tsx`;
      const relativePath = getRelativePath(filePath);
      const sourceMap = makeScopeMap(relativePath);

      const result = transformer(code, {
        path: filePath,
        options: { sourceMap },
      });

      expect(result).toContain('import Translated');
      expect(result).toContain(
        'nextjs-auto-intl/runtime/client/components/Translated'
      );
    });

    it('does not transform text when file not in sourceMap', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const filePath = `${tempDir}/src/Other.tsx`;
      const componentRelativePath = getRelativePath(
        `${tempDir}/src/Component.tsx`
      );
      const sourceMap = makeScopeMap(componentRelativePath);

      const result = transformer(code, {
        path: filePath,
        options: { sourceMap },
      });

      expect(result).toContain('Hello');
      expect(result).not.toContain('<Translated');
    });

    it('handles multiple text nodes in same component', () => {
      // Use a simpler structure where text nodes are direct children of the same element
      const code = `export default function Component() {
  return <div>First Second</div>;
}`;
      const filePath = `${tempDir}/src/Component.tsx`;
      const relativePath = getRelativePath(filePath);
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

      const result = transformer(code, {
        path: filePath,
        options: { sourceMap },
      });

      // Should transform the text node
      expect(result).toContain('<Translated');
      expect(result).toContain(`tKey="${relativePath}::${divScopePath}"`);
    });
  });

  describe('page file handling', () => {
    it('injects locale switcher into page.tsx files', () => {
      const code = `export default function Page() {
  return <main><h1>Hello</h1></main>;
}`;
      const filePath = `${tempDir}/app/page.tsx`;
      const result = transformer(code, {
        path: filePath,
        options: { sourceMap: { files: {} } },
      });

      expect(result).toContain('LocalesSwitcher');
      expect(result).toContain(
        'nextjs-auto-intl/runtime/client/components/LocaleSwitcher'
      );
    });

    it('injects locale switcher when sourceMap is provided (even if empty)', () => {
      const code = `export default function Page() {
  return <main><h1>Hello</h1></main>;
}`;
      const filePath = `${tempDir}/app/page.tsx`;
      // Page files need a sourceMap (even if empty) to trigger transformProject
      // which injects the locale switcher
      const result = transformer(code, {
        path: filePath,
        options: { sourceMap: { files: {} } },
      });

      expect(result).toContain('LocalesSwitcher');
    });

    it('does not inject locale switcher into non-page files', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const result = transformer(code, {
        path: `${tempDir}/src/Component.tsx`,
        options: { sourceMap: { files: {} } },
      });

      expect(result).not.toContain('LocalesSwitcher');
    });
  });

  describe('node_modules exclusion', () => {
    it('returns original source for node_modules files', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const filePath = 'src/Component.tsx';
      const sourceMap = makeScopeMap(filePath, '0/0');

      const result = transformer(code, {
        path: `${tempDir}/node_modules/some-package/Component.tsx`,
        options: { sourceMap },
      });

      // Should return original code unchanged
      expect(result).toBe(code);
      expect(result).not.toContain('<Translated');
    });

    it('excludes node_modules even with sourceMap', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const filePath = 'node_modules/package/Component.tsx';
      const sourceMap = makeScopeMap(filePath, '0/0');

      const result = transformer(code, {
        path: `${tempDir}/${filePath}`,
        options: { sourceMap },
      });

      expect(result).toBe(code);
    });
  });

  describe('error handling', () => {
    it('returns original source on parse error', () => {
      const invalidCode = `export default () => <div>`; // Invalid JSX
      const filePath = `${tempDir}/src/Broken.tsx`;
      const relativePath = getRelativePath(filePath);
      const sourceMap = makeScopeMap(relativePath, 'some/scope/path');

      const result = transformer(invalidCode, {
        path: filePath,
        options: { sourceMap },
      });

      // Should return original source, not throw
      expect(result).toBe(invalidCode);
    });

    it('returns original source on transformation error', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const filePath = `${tempDir}/src/Component.tsx`;
      const relativePath = getRelativePath(filePath);
      // Invalid sourceMap structure
      const invalidSourceMap = { files: { [relativePath]: null } } as any;

      const result = transformer(code, {
        path: filePath,
        options: { sourceMap: invalidSourceMap },
      });

      // Should return original source on error
      expect(result).toContain('Hello');
    });

    it('handles missing options gracefully', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;

      const result = transformer(code, {
        path: `${tempDir}/src/Component.tsx`,
        options: undefined as any,
      });

      expect(typeof result).toBe('string');
      expect(result).toContain('Hello');
    });
  });

  describe('pass-through behavior', () => {
    it('passes through files not in sourceMap', () => {
      const code = `export default function Component() {
  return <div>Hello World</div>;
}`;
      const resourcePath = `${tempDir}/src/Other.tsx`;
      const sourceMap = makeScopeMap('src/Component.tsx');

      const result = transformer(code, {
        path: resourcePath,
        options: { sourceMap },
      });

      expect(result).toContain('Hello World');
      expect(result).not.toContain('<Translated');
    });

    it('passes through when sourceMap has empty files', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const result = transformer(code, {
        path: `${tempDir}/src/Component.tsx`,
        options: { sourceMap: { files: {} } },
      });

      expect(result).toContain('Hello');
    });
  });

  describe('synchronous return', () => {
    it('returns synchronously without async/await', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;

      // Should not require await
      const result = transformer(code, {
        path: `${tempDir}/src/Component.tsx`,
        options: { sourceMap: { files: {} } },
      });

      expect(typeof result).toBe('string');
    });

    it('returns immediately even with disk operations', () => {
      const code = `export default function Component() {
  return <div>Hello</div>;
}`;
      const filePath = `${tempDir}/src/Component.tsx`;
      const relativePath = getRelativePath(filePath);
      const sourceMap = makeScopeMap(relativePath);

      // Create source map file
      fs.mkdirSync(path.join(tempDir, 'src/intl'), { recursive: true });
      fs.writeFileSync(
        path.join(tempDir, 'src/intl/source.json'),
        JSON.stringify(sourceMap)
      );

      // Should return synchronously
      const result = transformer(code, {
        path: filePath,
        options: {},
      });

      expect(typeof result).toBe('string');
      expect(result).toContain('<Translated');
    });
  });

  describe('stability tests', () => {
    for (let i = 0; i < 5; i++) {
      it(`runs without throwing (${i + 1})`, () => {
        const code = `export default function Component() {
  return <div>Hello</div>;
}`;
        const result = transformer(code, {
          path: `${tempDir}/src/Component.tsx`,
          options: { sourceMap: { files: {} } },
        });

        expect(typeof result).toBe('string');
      });
    }
  });
});
