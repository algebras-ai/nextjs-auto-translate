import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { LanguageCode } from '../src/data/languageMap';
import Translated from '../src/runtime/client/components/Translated';
import ClientProvider from '../src/runtime/client/Provider';
import type { DictStructure } from '../src/runtime/types';

const makeDict = (): DictStructure => ({
  version: '0.1',
  files: {
    'src/F.tsx': {
      entries: {
        'x/y': {
          content: {
            [LanguageCode.en]: 'Hello',
            [LanguageCode.es]: 'Hola',
          },
          hash: 'h',
        },
      },
    },
  },
});

// Test wrapper that converts dictionary object to the expected props
const TestProvider = ({
  dictionary,
  locale,
  children,
}: {
  dictionary: DictStructure;
  locale: string;
  children: React.ReactNode;
}) => {
  return (
    <ClientProvider
      dictJson={JSON.stringify(dictionary)}
      initialLocale={locale}
    >
      {children}
    </ClientProvider>
  );
};

describe('Translated component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders content for locale en', () => {
    render(
      <TestProvider dictionary={makeDict()} locale={LanguageCode.en}>
        <Translated tKey="src/F.tsx::x/y" />
      </TestProvider>
    );
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('renders content for locale es', () => {
    render(
      <TestProvider dictionary={makeDict()} locale={LanguageCode.es}>
        <Translated tKey="src/F.tsx::x/y" />
      </TestProvider>
    );
    expect(screen.getByText('Hola')).toBeTruthy();
  });

  for (let i = 0; i < 8; i++) {
    it(`renders multiple times (${i + 1})`, () => {
      render(
        <TestProvider dictionary={makeDict()} locale={LanguageCode.en}>
          <Translated tKey="src/F.tsx::x/y" />
        </TestProvider>
      );
      expect(screen.getByText('Hello')).toBeTruthy();
    });
  }
});
