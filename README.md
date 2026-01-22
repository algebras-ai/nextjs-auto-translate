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

## CLI Setup

The easiest way to set up Algebras Auto Intl in your Next.js project is using the CLI command:

### Using npx (recommended for first-time setup)

```bash
npx @dima-algebras/algebras-auto-intl init
```

### Using the installed package

After installation, you can run:

```bash
algebras-auto-intl init
```

### Command options

You can provide configuration via command-line flags:

- `--default-locale <code>` - Default locale code (e.g., `en`)
- `--target-locales <codes>` - Comma-separated target locale codes (e.g., `ru,es,fr`)
- `--output-dir <path>` - Output directory for intl files (default: `./src/intl`)
- `--api-key <key>` - Algebras AI API key (optional)
- `--api-url <url>` - Algebras AI API URL (optional, default: `https://platform.algebras.ai/api/v1`)

### Examples

```bash
# Interactive mode (will prompt for missing options)
algebras-auto-intl init

# With all options provided
algebras-auto-intl init --default-locale en --target-locales ru,es,fr --output-dir ./src/intl --api-key your_api_key_here

# Minimal setup
algebras-auto-intl init --default-locale en --target-locales ru
```

### What the CLI does

The `init` command automatically:

- ✅ Checks that you're in a Next.js project
- ✅ Installs the package if not already installed
- ✅ Updates `next.config.ts/js/mjs` with the plugin configuration
- ✅ Creates the output directory for intl files
- ✅ Updates `.env.local` with API credentials (adds empty key with comment if not provided)
- ✅ The compiler automatically adds `IntlWrapper` to your layout during build

See supported languages: [https://platform.algebras.ai/translation/translate](https://platform.algebras.ai/translation/translate)

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

### 2) (Optional) Add a locale switcher

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

#### Programmatic locale management

If you need to manage locales programmatically without using the `LocaleSwitcher` component, you can use the `useAlgebrasIntl` hook:

```tsx
'use client';

import { useAlgebrasIntl } from '@dima-algebras/algebras-auto-intl/runtime';
import { useRouter } from 'next/navigation';

export function CustomLocaleButton() {
  const { locale, setLocale, getLocales } = useAlgebrasIntl();
  const router = useRouter();
  const availableLocales = getLocales();

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    // Refresh the page to update server components with new locale
    router.refresh();
  };

  return (
    <div>
      <p>Current locale: {locale}</p>
      {availableLocales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          disabled={loc === locale}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
```

**How it works:**

- `setLocale(locale)` - Updates the locale and automatically sets a cookie: `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`
- `getLocales()` - Returns an array of all available locales from your dictionary
- `locale` - Current active locale
- `router.refresh()` - Required to refresh server components after locale change (from `next/navigation`)

**Server-side locale access:**

On the server, you can read the locale from cookies:

```ts
import { cookies } from 'next/headers';

export async function ServerComponent() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';
  // Use locale...
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

### Translate multiple attributes on the same element

```tsx
{
  /* @algb-translate-attrs-[title,placeholder,aria-label] */
}
<input title="Hello" placeholder="Enter text" aria-label="Search" />;
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
