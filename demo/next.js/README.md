# Next.js 15 Example Project

This is a simple Next.js 15 example project. Follow the steps below to add automatic internationalization with `nextjs-auto-intl`.

## Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

## Quick Start

### 1. Build the Parent Package

First, build the `nextjs-auto-intl` package from the repository root:

```bash
cd ../../
npm run build
cd demo/next.js
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

**Note:** The example uses a local file reference to the parent package. If you want to use the published package instead, update `package.json`:

```json
"nextjs-auto-intl": "^1.0.3"
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see a simple Next.js app with no internationalization yet.

## Adding Internationalization

Follow these simple steps to add automatic internationalization to your Next.js app:

### Step 1: Update `next.config.ts`

Open `next.config.ts` and wrap your config with the `autoIntl` plugin:

```typescript
import type { NextConfig } from "next";
import autoIntl, { LanguageCode } from "nextjs-auto-intl";

const nextConfig: NextConfig = autoIntl({
  defaultLocale: LanguageCode.en,
  targetLocales: [LanguageCode.es, LanguageCode.fr, LanguageCode.de],
  outputDir: "./src/intl",
  includeNodeModules: false,
})({
  reactStrictMode: true,
});

export default nextConfig;
```

**What this does:**
- Configures the plugin to extract translatable strings
- Sets English as the default language
- Adds Spanish, French, and German as target languages
- Outputs translation dictionaries to `./src/intl`

### Step 2: Add Locale Switcher to Your Header

Open `app/components/Header.tsx` and add the `LocaleSwitcher` component:

```typescript
"use client";

import Link from "next/link";
import LocaleSwitcher from "nextjs-auto-intl/runtime/client/components/LocaleSwitcher";

export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 0",
        borderBottom: "2px solid #e5e7eb",
        marginBottom: "32px",
      }}
    >
      <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
      </nav>
      <LocaleSwitcher />
    </header>
  );
}
```

**What this does:**
- Adds a language switcher dropdown to your header
- Allows users to switch between available languages
- The locale preference is stored in cookies

### Step 3: Restart Your Dev Server

Stop your dev server (Ctrl+C) and restart it:

```bash
npm run dev
```

**What happens:**
- The plugin automatically scans your JSX/TSX files
- Extracts all translatable text content
- Generates translation dictionaries
- Wraps your layout with `IntlWrapper` automatically
- Replaces JSX text with `Translated` components

### Step 4: Test It Out!

1. Open [http://localhost:3000](http://localhost:3000)
2. You should see a language switcher in the header
3. Click it and select a different language (e.g., Spanish)
4. Watch as all the text on the page changes!

**Note:** Without an API key, you'll see mock translations like `[ES] Welcome` or `[FR] Welcome`. This is perfect for testing.

## Optional: Use Real Translations

If you want to use real translations via Algebras AI:

### Step 5: Create `.env.local`

Create a `.env.local` file in the project root:

```bash
ALGEBRAS_API_KEY=your_api_key_here
ALGEBRAS_API_URL=https://platform.algebras.ai/api/v1
```

### Step 6: Restart Dev Server

Restart your dev server to pick up the environment variables:

```bash
npm run dev
```

Now the plugin will use Algebras AI to generate high-quality translations automatically!

## How It Works

Once you've added the plugin:

1. **Automatic Extraction**: The plugin scans all `.tsx` and `.jsx` files and extracts translatable text
2. **Dictionary Generation**: Creates translation dictionaries in `src/intl/` during build
3. **Layout Wrapping**: Automatically wraps your `app/layout.tsx` with `IntlWrapper`
4. **Component Injection**: Replaces JSX text with `Translated` components automatically

You don't need to change your component code - just write normal JSX and the plugin handles everything!

## Project Structure

```
demo/next.js/
├── app/
│   ├── components/
│   │   ├── Header.tsx          # Header component
│   │   ├── Welcome.tsx          # Welcome component
│   │   └── Features.tsx         # Features component
│   ├── about/
│   │   └── page.tsx             # About page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── next.config.ts               # Next.js config
├── package.json
├── tsconfig.json
└── README.md
```

## Generated Files (After Adding Localization)

After adding the plugin and running the dev server, you'll see:

```
src/intl/
├── dictionary.js               # ES module dictionary
└── dictionary.json             # JSON dictionary (for debugging)

.intl/
├── source.json                 # Extracted source strings
├── .lock                       # Lock file
└── .scheduled                  # Process scheduling flag
```

## Translation Modes

### Mock Translations (Default)

Without an API key, the plugin uses mock translations:
- `en`: Original text unchanged
- `es`: `[ES] Original text`
- `fr`: `[FR] Original text`
- `de`: `[DE] Original text`

Perfect for development and testing!

### Algebras AI Translations (Optional)

With an API key, the plugin uses Algebras AI for high-quality translations:
- Professional translations
- Batch processing (up to 20 texts per API call)
- Automatic caching
- Supports custom glossaries and prompts

## Troubleshooting

### Translations Not Appearing

1. **Restart Dev Server**: The plugin runs during build, so restart after configuration changes
2. **Check Build Output**: Look for any errors in the terminal
3. **Check Generated Files**: Verify `src/intl/dictionary.json` exists after building
4. **Check Console**: Look for errors in the browser console

### Locale Switcher Not Working

1. **Check Client Directive**: Make sure `Header.tsx` has `"use client"` at the top
2. **Check Import**: Verify the `LocaleSwitcher` import is correct
3. **Check Cookies**: The locale is stored in cookies - check browser dev tools

### Build Errors

1. **Check TypeScript**: Run `npm run build` to see TypeScript errors
2. **Check Dependencies**: Make sure all dependencies are installed
3. **Check Node Version**: Ensure you're using Node.js 18+

## Next Steps

- Read the [main README](../../README.md) for detailed documentation
- Check [ALGEBRAS_SETUP.md](../../ALGEBRAS_SETUP.md) for advanced configuration
- Explore the [source code](../../src/) to understand how it works

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [nextjs-auto-intl Documentation](../../README.md)
- [Algebras AI Platform](https://platform.algebras.ai)
