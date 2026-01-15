# @dima-algebras/algebras-auto-intl

Automated i18n for **Next.js (App Router)** that:

- **Extracts user-visible strings** from JSX during `next dev` / `next build`
- Generates `dictionary.json` + `source.json` into your configured output directory
- **Rewrites components automatically** to render translated text at runtime
- Works with **Webpack** and **Turbopack**

## Installation

```bash
npm i @dima-algebras/algebras-auto-intl
```

## Quickstart (Next.js App Router)

### 1) Add the plugin to `next.config.ts`

```ts
import type { NextConfig } from 'next';
import autoIntl, { LanguageCode } from '@dima-algebras/algebras-auto-intl';

const nextConfig: NextConfig = autoIntl({
  defaultLocale: LanguageCode.en,
  targetLocales: [LanguageCode.ru],
  outputDir: './src/intl',
  includeNodeModules: false,
  // Optional: override env vars (not recommended for production)
  // translationApiKey: process.env.ALGEBRAS_API_KEY,
  // translationApiUrl: process.env.ALGEBRAS_API_URL,
})({
  reactStrictMode: true,
});

export default nextConfig;
```

### 2) Wrap your root layout with `IntlWrapper`

`app/layout.tsx`:

```tsx
import type { ReactNode } from 'react';
import IntlWrapper from '@dima-algebras/algebras-auto-intl/runtime/server/IntlWrapper';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <IntlWrapper>{children}</IntlWrapper>
      </body>
    </html>
  );
}
```

### 3) (Optional) Add a locale switcher

```tsx
'use client';

import LocaleSwitcher from '@dima-algebras/algebras-auto-intl/runtime/client/components/LocaleSwitcher';

export function Header() {
  return (
    <header>
      <LocaleSwitcher />
    </header>
  );
}
```

## Translation Provider (Algebras AI) — optional

If you provide `ALGEBRAS_API_KEY`, the generator translates via Algebras AI.
If not provided, it falls back to mock translations.

Create a `.env`:

```bash
ALGEBRAS_API_KEY=your_api_key_here
ALGEBRAS_API_URL=https://platform.algebras.ai/api/v1
```

## Output files

The plugin writes generated files to `outputDir` (default is `./src/intl`):

- **`dictionary.json`**: runtime dictionary consumed by `IntlWrapper`
- **`source.json`**: extracted scope map used by the injector/translator

## Selective translation of attributes / props (opt-in)

By default, the compiler **does not translate JSX props or HTML attributes**.
You can opt-in per element using JSX comments placed immediately above the element.

### Translate a single attribute

```tsx
{
  /* @algb-translate-attr-title */
}
<button title="Click to send">Send</button>;
```

Supports hyphenated attributes too:

```tsx
{
  /* @algb-translate-attr-aria-label */
}
<button aria-label="Close dialog">×</button>;
```

### Translate selected props on a component

```tsx
{
  /* @algb-translate-props-[title,description] */
}
<ProductCard title="New" description="Limited offer" ref={ref} />;
```

Only the listed props are considered; everything else is ignored.

## Notes / troubleshooting

- **Monorepo / `file:` dependency**: Next.js runs the package from `dist/`. If you change this package locally, run `npm run build` in the package so `dist/` is updated.
- **Dev cache**: if you see stale behavior, restart dev and delete `.next/` in your app.
