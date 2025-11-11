# Quick Start Guide - Algebras API Integration

Get your Next.js app translating in 5 minutes!

## Step 1: Install the Package

```bash
npm install nextjs-auto-translate
```

## Step 2: Get Your API Key

Your Algebras API key:
```
sk-
```

## Step 3: Create `.env.local`

In your project root, create `.env.local`:

```env
ALGEBRAS_API_KEY=sk-
```

**Important:** Make sure `.env.local` is in your `.gitignore`!

## Step 4: Configure Next.js

Update your `next.config.js` (or create it):

```javascript
import algebrasIntl from 'nextjs-auto-translate';

const nextConfig = {
  // Your existing Next.js config
};

export default algebrasIntl({
  defaultLocale: 'en',
  targetLocales: ['es', 'fr', 'de', 'ru', 'ja'], // Add languages you need
  algebrasApiKey: process.env.ALGEBRAS_API_KEY,
})(nextConfig);
```

If using `.mjs` (ES modules), name it `next.config.mjs`:

```javascript
import algebrasIntl from 'nextjs-auto-translate';

const nextConfig = {
  reactStrictMode: true,
};

export default algebrasIntl({
  defaultLocale: 'en',
  targetLocales: ['es', 'fr', 'de'],
  algebrasApiKey: process.env.ALGEBRAS_API_KEY,
})(nextConfig);
```

## Step 5: Wrap Your App with Provider

Update `app/layout.tsx` (or `_app.tsx` for Pages Router):

### App Router (`app/layout.tsx`):

```typescript
import AlgebrasIntlProvider from 'nextjs-auto-translate';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AlgebrasIntlProvider>
          {children}
        </AlgebrasIntlProvider>
      </body>
    </html>
  );
}
```

### Pages Router (`pages/_app.tsx`):

```typescript
import type { AppProps } from 'next/app';
import AlgebrasIntlProvider from 'nextjs-auto-translate';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AlgebrasIntlProvider>
      <Component {...pageProps} />
    </AlgebrasIntlProvider>
  );
}
```

## Step 6: Build Your App

```bash
npm run build
```

During build, you'll see:

```
[DictionaryGenerator] Using Algebras API translation service
[DictionaryGenerator] Translating 150 texts to 3 target locales
[AlgebrasTranslationService] Translating 50 texts from en to es (attempt 1/3)
[AlgebrasTranslationService] Successfully translated 50 texts
...
```

## Step 7: Test Translations

Your text will be automatically translated! No code changes needed:

```tsx
// This component's text will be auto-translated
export default function Home() {
  return (
    <div>
      <h1>Welcome to my app</h1>
      <p>This text will be translated automatically</p>
      <button>Click me</button>
    </div>
  );
}
```

## That's It! 🎉

Your app now supports multiple languages automatically!

## Next Steps

### Add Locale Switcher

Let users change languages:

```tsx
import { LocaleSwitcher } from 'nextjs-auto-translate/client';

export default function Header() {
  return (
    <header>
      <LocaleSwitcher />
    </header>
  );
}
```

### Customize Available Languages

Edit your `next.config.js`:

```javascript
export default algebrasIntl({
  defaultLocale: 'en',
  targetLocales: [
    'es',  // Spanish
    'fr',  // French  
    'de',  // German
    'ru',  // Russian
    'ja',  // Japanese
    'zh',  // Chinese
    'pt',  // Portuguese
    'it',  // Italian
    'ko',  // Korean
    'ar',  // Arabic
    'hi',  // Hindi
    'tr',  // Turkish
  ],
  algebrasApiKey: process.env.ALGEBRAS_API_KEY,
})(nextConfig);
```

### Development Mode (Mock Translations)

For faster development without API calls:

```javascript
export default algebrasIntl({
  defaultLocale: 'en',
  targetLocales: ['es'],
  useMockTranslation: true, // Use mock translations
})(nextConfig);
```

## Troubleshooting

### Build is slow?
- Reduce target languages during development
- Increase batch size: `batchSize: 100`

### Translations not appearing?
1. Clear build cache: `rm -rf .next src/intl`
2. Rebuild: `npm run build`
3. Check that API key is correct in `.env.local`

### Need help?
- Check full docs: `ALGEBRAS_API_INTEGRATION.md`
- Check examples: `examples/next.config.algebras.example.mjs`

## Example Project Structure

```
your-nextjs-app/
├── .env.local                    # API key (don't commit!)
├── .gitignore                    # Include .env.local
├── next.config.mjs               # Algebras config
├── package.json
├── app/
│   ├── layout.tsx               # Provider wrapper
│   └── page.tsx                 # Your pages
└── src/
    └── intl/                    # Generated translations (auto-created)
        ├── dictionary.json
        └── source.json
```

## API Key Security

✅ DO:
- Store API key in `.env.local`
- Add `.env.local` to `.gitignore`
- Use environment variables in production

❌ DON'T:
- Commit API key to git
- Share API key publicly
- Hardcode API key in source code

---

**You're all set!** Start building multilingual apps with zero effort! 🌍

