# nextjs-auto-intl

Automated i18n for React + Next.js that extracts JSX text and generates translation dictionaries during dev/build (works with **webpack** and **Turbopack**).

## Installation

```bash
npm install @dima-algebras/algebras-auto-intl
```

## Next.js usage

### 1) Add the plugin to `next.config.ts`

```ts
import type { NextConfig } from 'next';
import autoIntl, { LanguageCode } from '@dima-algebras/algebras-auto-intl';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default autoIntl({
  defaultLocale: LanguageCode.en,
  targetLocales: [LanguageCode.es, LanguageCode.fr],
  outputDir: './src/intl', // optional (default: ./src/intl)
  includeNodeModules: false, // optional (default: false)
})(nextConfig);
```

### 2) Wrap your root layout with `IntlWrapper`

```ts
import type { ReactNode } from 'react'
import IntlWrapper from '@dima-algebras/algebras-auto-intl/runtime/server/IntlWrapper'

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang='en'>
			<body>
				<IntlWrapper>{children}</IntlWrapper>
			</body>
		</html>
	)
}
```

### 3) (Optional) Add a locale switcher

```ts
'use client'

import LocaleSwitcher from '@dima-algebras/algebras-auto-intl/runtime/client/components/LocaleSwitcher'

export function Header() {
	return (
		<header>
			<LocaleSwitcher />
		</header>
	)
}
```

## Algebras AI translation (optional)

If `ALGEBRAS_API_KEY` is set, translations are generated using Algebras AI. If not, the plugin falls back to mock translations.

Create a `.env`:

```bash
ALGEBRAS_API_KEY=your_api_key_here
ALGEBRAS_API_URL=https://platform.algebras.ai/api/v1
```

## Outputs

The plugin writes generated files to `outputDir`:

- `dictionary.js` (ES module)
- `dictionary.json` (used by `IntlWrapper` at runtime)
- `source.json` (extracted source map used for generation)

## Contributing / project structure

See `CONTRIBUTING.md`.
