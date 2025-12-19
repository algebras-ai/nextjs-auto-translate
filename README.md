# algebras-auto-intl

Automatic internationalization (i18n) for Next.js/React.

You write normal JSX text. During `dev`/`build`, this package extracts that text and generates translation dictionaries for your target locales. It works with **Webpack** and **Turbopack**.

## Compatibility

- Next.js: 14 / 15 / 16
- Bundlers: Webpack + Turbopack

See `NEXTJS_COMPATIBILITY.md` and `NEXTJS_COMPATIBILITY_REPORT.md`.

## Installation

```bash
npm install algebras-auto-intl
```

## Setup (App Router)

### 1) Add the plugin to `next.config.ts`

```ts
import type { NextConfig } from 'next';
import autoIntl, { LanguageCode } from 'algebras-auto-intl';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default autoIntl({
  defaultLocale: LanguageCode.en,
  targetLocales: [LanguageCode.es, LanguageCode.fr],
  outputDir: './src/intl',
  includeNodeModules: false,
})(nextConfig);
```

### 2) Wrap your root layout with `IntlWrapper`

In `app/layout.tsx`:

```tsx
import IntlWrapper from 'algebras-auto-intl/runtime/server/IntlWrapper';

export default function RootLayout({
	children,
}: {
  children: React.ReactNode;
}) {
	return (
    <html lang="en">
			<IntlWrapper>
				<body>{children}</body>
			</IntlWrapper>
		</html>
  );
}
```

### 3) (Optional) Add a locale switcher

In any client component:

```tsx
'use client';

import LocaleSwitcher from 'algebras-auto-intl/runtime/client/components/LocaleSwitcher';

export function Header() {
	return (
		<header>
			<LocaleSwitcher />
		</header>
  );
}
```

## Algebras AI translations (optional)

Create `.env` or `.env.local` in your Next.js app:

```bash
ALGEBRAS_API_KEY=your_api_key_here
ALGEBRAS_API_URL=https://platform.algebras.ai/api/v1
```

Then restart the dev server so Next.js picks up the env vars.

If `ALGEBRAS_API_KEY` is not set, the plugin falls back to mock translations.

## What gets generated?

By default, files are generated into `./src/intl` (configurable via `outputDir`):

- `dictionary.json` (runtime uses this)
- `dictionary.js` (ES module)
- `source.json` (extracted source strings)
- `.lock` / `.scheduled` (internal coordination files)

## Configuration

```ts
type PluginOptions = {
  defaultLocale: LanguageCode;
  targetLocales: LanguageCode[];
  includeNodeModules?: boolean; // default: false
  outputDir?: string; // default: "./src/intl"
  translationApiKey?: string; // override ALGEBRAS_API_KEY
  translationApiUrl?: string; // override ALGEBRAS_API_URL
};
```

## Troubleshooting

### `Dictionary file not found`

- Make sure you ran `npm run dev` or `npm run build` at least once after enabling the plugin.
- Confirm the `outputDir` in `next.config.ts` matches where you expect files to be written.
- Make sure `IntlWrapper` import is exactly:
  - `algebras-auto-intl/runtime/server/IntlWrapper`

### Changing `.env` has no effect

Restart `npm run dev` after editing `.env` / `.env.local`.

## More docs

- Quick start: see `QUICK_START.md` in the GitHub repository
- Algebras AI setup: see `ALGEBRAS_SETUP.md` in the GitHub repository

## Contributing

See `CONTRIBUTING.md`.
