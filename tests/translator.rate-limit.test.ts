import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlgebrasTranslationProvider } from '../src/translator/AlgebrasTranslationProvider';
import { DictionaryGenerator } from '../src/translator/DictionaryGenerator';
import type { ScopeMap } from '../src/types';
import fs from 'fs';
import path from 'path';

// Mock fetch globally
global.fetch = vi.fn();

const tmpDir = '.intl-rate-limit-test';

const makeScopeMap = (): ScopeMap => ({
  files: {
    'src/Test.tsx': {
      scopes: {
        'test/scope': {
          type: 'text',
          content: 'Hello World',
          hash: 'h1',
          context: '',
          skip: false,
          overrides: {},
        },
        'test/scope2': {
          type: 'text',
          content: 'Goodbye World',
          hash: 'h2',
          context: '',
          skip: false,
          overrides: {},
        },
      },
    },
  },
});

describe('Rate Limit Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clean up test directory
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('should stop making API calls after 429 rate limit error', async () => {
    const provider = new AlgebrasTranslationProvider({
      apiKey: 'test-key',
      apiUrl: 'https://test.api.com/v1',
    });

    // First call: successful
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        timestamp: new Date().toISOString(),
        data: {
          translations: [{ index: 0, content: 'Hola Mundo' }],
          batch_summary: {
            total: 1,
            successful: 1,
            failed: 0,
            total_credits: 1,
          },
          word_count: 2,
        },
      }),
    });

    // Second call: rate limit (429)
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => 'Rate limit exceeded',
    });

    // First batch should succeed
    const result1 = await provider.translateBatch(['Hello'], 'es');
    expect(result1.translations[0]).toBe('Hola Mundo');
    expect((global.fetch as any).mock.calls.length).toBe(1);

    // Second batch should hit rate limit
    const result2 = await provider.translateBatch(['World'], 'es');
    expect(result2.translations[0]).toBe('[ES] World'); // Fallback
    expect((global.fetch as any).mock.calls.length).toBe(2);

    // Third batch should NOT make API call (rate limit already exceeded)
    const result3 = await provider.translateBatch(['Test'], 'es');
    expect(result3.translations[0]).toBe('[ES] Test'); // Fallback
    expect((global.fetch as any).mock.calls.length).toBe(2); // Still 2, no new call
  });

  it('should handle rate limit in translateAll method', async () => {
    const provider = new AlgebrasTranslationProvider({
      apiKey: 'test-key',
      apiUrl: 'https://test.api.com/v1',
    });

    // Create 25 texts to force multiple batches (batch size is 20)
    const textsMap = new Map();
    for (let i = 0; i < 25; i++) {
      textsMap.set(`key${i}`, `Text ${i}`);
    }

    // First batch (20 texts): successful
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        timestamp: new Date().toISOString(),
        data: {
          translations: Array.from({ length: 20 }, (_, i) => ({
            index: i,
            content: `Texto ${i}`,
          })),
          batch_summary: {
            total: 20,
            successful: 20,
            failed: 0,
            total_credits: 20,
          },
          word_count: 40,
        },
      }),
    });

    // Second batch (5 texts): rate limit
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => 'Rate limit exceeded',
    });

    const results = await provider.translateAll(textsMap, ['es']);

    // First 20 should be translated
    expect(results.get('key0')?.get('es')).toBe('Texto 0');
    expect(results.get('key19')?.get('es')).toBe('Texto 19');

    // Last 5 should be fallback (rate limit hit)
    expect(results.get('key20')?.get('es')).toBe('[ES] Text 20');
    expect(results.get('key24')?.get('es')).toBe('[ES] Text 24');

    // Should only make 2 API calls (first batch + rate limit error)
    expect((global.fetch as any).mock.calls.length).toBe(2);
  });

  it('should handle rate limit error message in catch block', async () => {
    const provider = new AlgebrasTranslationProvider({
      apiKey: 'test-key',
      apiUrl: 'https://test.api.com/v1',
    });

    // Simulate network error with rate limit message
    (global.fetch as any).mockRejectedValueOnce(
      new Error(
        'Algebras API error: 429 Too Many Requests - Rate limit exceeded'
      )
    );

    const result = await provider.translateBatch(['Hello'], 'es');

    expect(result.translations[0]).toBe('[ES] Hello'); // Fallback
    expect((global.fetch as any).mock.calls.length).toBe(1);

    // Next call should not make API request
    const result2 = await provider.translateBatch(['World'], 'es');
    expect(result2.translations[0]).toBe('[ES] World');
    expect((global.fetch as any).mock.calls.length).toBe(1); // Still 1
  });

  it('should stop DictionaryGenerator from making API calls after rate limit', async () => {
    const provider = new AlgebrasTranslationProvider({
      apiKey: 'test-key',
      apiUrl: 'https://test.api.com/v1',
    });

    const scopeMap = makeScopeMap();

    // First batch: rate limit immediately
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => 'Rate limit exceeded',
    });

    const generator = new DictionaryGenerator({
      defaultLocale: 'en' as any,
      targetLocales: ['es'] as any,
      outputDir: tmpDir,
      translationProvider: provider,
    });

    await generator.generateDictionary(scopeMap);

    // Should only make 1 API call (the rate limit error)
    expect((global.fetch as any).mock.calls.length).toBe(1);

    // Verify dictionary has fallback translations
    const dictPath = path.join(tmpDir, 'dictionary.json');
    expect(fs.existsSync(dictPath)).toBe(true);

    const dict = JSON.parse(fs.readFileSync(dictPath, 'utf-8'));
    const entry = dict.files['src/Test.tsx'].entries['test/scope'].content;

    expect(entry.es).toBe('[ES] Hello World'); // Fallback
  });

  it('should handle rate limit mid-batch in DictionaryGenerator', async () => {
    const provider = new AlgebrasTranslationProvider({
      apiKey: 'test-key',
      apiUrl: 'https://test.api.com/v1',
    });

    // Create scope map with 25 texts to force multiple batches
    const scopeMap: ScopeMap = {
      files: {
        'src/Test.tsx': {
          scopes: {},
        },
      },
    };

    for (let i = 0; i < 25; i++) {
      scopeMap.files['src/Test.tsx'].scopes[`test/scope${i}`] = {
        type: 'text',
        content: `Text ${i}`,
        hash: `h${i}`,
        context: '',
        skip: false,
        overrides: {},
      };
    }

    // First batch (20 texts): successful
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        timestamp: new Date().toISOString(),
        data: {
          translations: Array.from({ length: 20 }, (_, i) => ({
            index: i,
            content: `Texto ${i}`,
          })),
          batch_summary: {
            total: 20,
            successful: 20,
            failed: 0,
            total_credits: 20,
          },
          word_count: 40,
        },
      }),
    });

    // Second batch (5 texts): rate limit
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => 'Rate limit exceeded',
    });

    const generator = new DictionaryGenerator({
      defaultLocale: 'en' as any,
      targetLocales: ['es'] as any,
      outputDir: tmpDir,
      translationProvider: provider,
    });

    await generator.generateDictionary(scopeMap);

    // Should make 2 API calls (first success, second rate limit)
    expect((global.fetch as any).mock.calls.length).toBe(2);

    const dictPath = path.join(tmpDir, 'dictionary.json');
    const dict = JSON.parse(fs.readFileSync(dictPath, 'utf-8'));

    // First entry should be translated
    expect(dict.files['src/Test.tsx'].entries['test/scope0'].content.es).toBe(
      'Texto 0'
    );

    // Last entry should be fallback (rate limit hit)
    expect(dict.files['src/Test.tsx'].entries['test/scope24'].content.es).toBe(
      '[ES] Text 24'
    );
  });

  it('should distinguish between quota exceeded and rate limit', async () => {
    const provider = new AlgebrasTranslationProvider({
      apiKey: 'test-key',
      apiUrl: 'https://test.api.com/v1',
    });

    // Rate limit (429)
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => 'Rate limit exceeded',
    });

    const result1 = await provider.translateBatch(['Hello'], 'es');
    expect(result1.translations[0]).toBe('[ES] Hello');

    // Check that rateLimitExceeded is set
    const providerAny = provider as any;
    expect(providerAny.rateLimitExceeded).toBe(true);
    expect(providerAny.quotaExceeded).toBe(false);

    // Next call should not make API request
    const result2 = await provider.translateBatch(['World'], 'es');
    expect(result2.translations[0]).toBe('[ES] World');
    expect((global.fetch as any).mock.calls.length).toBe(1); // Still 1, no new call
  });
});
