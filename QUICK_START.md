# Quick Start Guide - Algebras AI Translation

## Step 1: Create `.env` file

Create a `.env` file in your project root:

```bash
ALGEBRAS_API_KEY=your_api_key_from_platform_algebras_ai
ALGEBRAS_API_URL=https://platform.algebras.ai/api/v1
```

## Step 2: Configure Next.js

Update your `next.config.ts`:

```typescript
import algebrasAutoIntl from "algebras-auto-intl";

const nextConfig = algebrasAutoIntl({
  defaultLocale: "en",
  targetLocales: ["es", "fr", "de", "zh", "ja"],
  outputDir: "./src/intl"
})({
  // your existing Next.js config
});

export default nextConfig;
```

## Step 3: Run your build

```bash
npm run build
# or
npm run dev
```

The plugin will automatically:
1. ✅ Scan your JSX/TSX files for translatable text
2. ✅ Send texts to Algebras AI batch translation API
3. ✅ Generate translation dictionaries in `./src/intl/`
4. ✅ Process translations in batches of 20 texts per language (API maximum)

## API Endpoint Used

**POST** `https://platform.algebras.ai/api/v1/translation/translate-batch`

**Request:**
```json
{
  "texts": ["Hello world", "Welcome"],
  "sourceLanguage": "en",
  "targetLanguage": "es"
}
```

**Response:**
```json
{
  "translations": ["Hola mundo", "Bienvenido"]
}
```

## That's it!

Your translations will be automatically generated during build time. The plugin handles:
- ✅ Batch processing (20 texts per call, API maximum)
- ✅ Rate limiting (automatic delays)
- ✅ Error handling (fallback to mock translations)
- ✅ Caching (avoids duplicate API calls)
- ✅ Progress logging (see console output)

## Troubleshooting

**API Key not working?**
- Make sure `.env` is in the project root (same directory as `next.config.ts`)
- Restart your dev server after creating/modifying `.env`
- Check for extra spaces or quotes in the `.env` file

**No translations generated?**
- Check console output for errors
- Verify API key is valid
- Check internet connection
- Look at generated files in `./src/intl/dictionary.json`

## More Info

- Full documentation: See `README.md`
- Detailed setup: See `ALGEBRAS_SETUP.md`
- API status: https://status.algebras.ai

