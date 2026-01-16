import fs from 'fs';
import path from 'path';
import { describe, expect, it, vi } from 'vitest';
import { DictionaryGenerator } from '../src/translator/DictionaryGenerator';
import type { ScopeMap } from '../src/types';

const tmpDir = '.intl-test';

const makeScopeMap = (): ScopeMap => ({
  files: {
    'src/C.tsx': {
      scopes: {
        'a/b/c': {
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

describe('DictionaryGenerator', () => {
  it('generates dictionary.json with only default locale when provider is missing (no mock prefixes)', async () => {
    const gen = new DictionaryGenerator({
      defaultLocale: 'en' as any,
      targetLocales: ['es', 'fr'] as any,
      outputDir: tmpDir,
    });
    const out = await gen.generateDictionary(makeScopeMap());
    expect(out).toContain(path.join(tmpDir, 'dictionary.json'));
    const raw = fs.readFileSync(out, 'utf-8');
    const json = JSON.parse(raw);
    expect(json.files['src/C.tsx'].entries['a/b/c'].content.en).toBe('Hello');
    // No provider -> do not write untranslated locales
    expect(json.files['src/C.tsx'].entries['a/b/c'].content.es).toBeUndefined();
  });

  it('reuses existing translations when hash is unchanged and only translates missing locales', async () => {
    // Prepare initial dictionary with a provider that returns a real translation for 'es'
    const baseDir = '.intl-incremental';
    if (fs.existsSync(baseDir)) {
      fs.rmSync(baseDir, { recursive: true, force: true });
    }
    const translateBatchEs = vi.fn(async (texts: string[]) => ({
      translations: texts.map(() => 'Hola'),
    }));
    const providerEs = { translateBatch: translateBatchEs } as any;
    const gen1 = new DictionaryGenerator({
      defaultLocale: 'en' as any,
      targetLocales: ['es'] as any,
      outputDir: baseDir,
      translationProvider: providerEs,
    });

    const out1 = await gen1.generateDictionary(makeScopeMap());
    const raw1 = fs.readFileSync(out1, 'utf-8');
    const json1 = JSON.parse(raw1);

    const existingEs = json1.files['src/C.tsx'].entries['a/b/c'].content.es;

    // Now run with a fake Algebras provider that we can spy on
    const translateBatch = vi.fn(async (texts: string[]) => ({
      translations: texts.map((t) => `Ciao ${t}`),
    }));

    const fakeProvider = {
      translateBatch,
    } as any;

    const gen2 = new DictionaryGenerator({
      defaultLocale: 'en' as any,
      targetLocales: ['es', 'it'] as any,
      outputDir: baseDir,
      translationProvider: fakeProvider,
    });

    const out2 = await gen2.generateDictionary(makeScopeMap());
    const raw2 = fs.readFileSync(out2, 'utf-8');
    const json2 = JSON.parse(raw2);

    const entry2 = json2.files['src/C.tsx'].entries['a/b/c'].content;

    // es должен быть переиспользован из старого словаря, а не сгенерирован через провайдер
    expect(entry2.es).toBe(existingEs);
    // it должен быть создан через провайдер
    expect(entry2.it).toBe('Ciao Hello');

    // Для данного scope hash не менялся, поэтому translateBatch должен был вызваться только для новых локалей
    expect(translateBatch).toHaveBeenCalledTimes(1);
    const callArgs = translateBatch.mock.calls[0][0] as string[];
    expect(callArgs).toEqual(['Hello']); // только один текст
  });
});
