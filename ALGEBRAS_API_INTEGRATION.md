# Algebras API Integration Guide

This guide explains how to integrate your Next.js project with Algebras AI translation API for automatic translation during build time.

## Overview

The `nextjs-auto-translate` plugin now supports real-time translation using the Algebras AI API. During the build process, all strings are automatically sent to Algebras for translation in batch, making the process efficient and fast.

## Setup

### 1. Get Your API Key

You should have received an Algebras API key. The key format looks like:
```

```

### 2. Configure Environment Variables (Recommended)

For security, store your API key in an environment variable:

Create or update your `.env.local` file:

```env
ALGEBRAS_API_KEY=sk-
```

**Important:** Add `.env.local` to your `.gitignore` to avoid committing your API key.

### 3. Configure the Plugin

In your `next.config.js` or `next.config.mjs`:

#### Option A: Using Environment Variable (Recommended)

```javascript
import algebrasIntl from 'nextjs-auto-translate';

const nextConfig = {
  // ... your other config
};

export default algebrasIntl({
  defaultLocale: 'en',
  targetLocales: ['es', 'fr', 'de', 'ru', 'ja'], // Add your target languages
  algebrasApiKey: process.env.ALGEBRAS_API_KEY,
  outputDir: './src/intl',
})(nextConfig);
```

#### Option B: Direct Configuration (Not Recommended for Production)

```javascript
import algebrasIntl from 'nextjs-auto-translate';

const nextConfig = {
  // ... your other config
};

export default algebrasIntl({
  defaultLocale: 'en',
  targetLocales: ['es', 'fr', 'de'],
  algebrasApiKey: 'sk-your-api-key-here',
  outputDir: './src/intl',
})(nextConfig);
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `defaultLocale` | `string` | Yes | - | The source language code (e.g., 'en') |
| `targetLocales` | `string[]` | Yes | - | Array of target language codes |
| `algebrasApiKey` | `string` | No | - | Your Algebras API key. If not provided, uses mock translations |
| `outputDir` | `string` | No | `'./src/intl'` | Directory where translation files are stored |
| `useMockTranslation` | `boolean` | No | `false` | Force use of mock translations (prefixes like [ES], [FR]) |
| `batchSize` | `number` | No | `50` | Number of texts to translate per API request |
| `includeNodeModules` | `boolean` | No | `false` | Whether to translate strings in node_modules |

## How It Works

### During Build Process:

1. **Parse Phase**: The plugin scans your React/Next.js components for translatable text
2. **Collection Phase**: All unique strings are collected from your codebase
3. **Batch Translation**: Strings are sent to Algebras API in efficient batches
4. **Dictionary Generation**: A translation dictionary is created with all translations
5. **Code Transformation**: Your code is automatically modified to use translations at runtime

### Translation Flow:

```
Source Code → Parser → String Collection → Algebras API (Batch) → Dictionary → Transformed Code
```

## Batch Translation

The integration uses Algebras' batch translation endpoint for optimal performance:

- **Endpoint**: `https://platform.algebras.ai/api/v1/translation/translate-batch`
- **Method**: POST
- **Batch Size**: Configurable (default: 50 texts per request)
- **Retry Logic**: 3 attempts with exponential backoff
- **Fallback**: If API fails, original text is used

### Example API Request:

```json
{
  "sourceLanguage": "en",
  "targetLanguage": "es",
  "texts": [
    "Hello, World!",
    "Welcome to our application",
    "Click here to continue"
  ]
}
```

### Example API Response:

```json
{
  "translations": [
    "¡Hola, Mundo!",
    "Bienvenido a nuestra aplicación",
    "Haga clic aquí para continuar"
  ]
}
```

## Mock Mode (Development/Testing)

For development or testing without consuming API credits, you can use mock mode:

```javascript
export default algebrasIntl({
  defaultLocale: 'en',
  targetLocales: ['es', 'fr'],
  useMockTranslation: true, // This will use mock translations
  outputDir: './src/intl',
})(nextConfig);
```

Mock translations will be prefixed with locale code:
- English: "Hello" → "Hello"
- Spanish: "Hello" → "[ES] Hello"
- French: "Hello" → "[FR] Hello"

## Error Handling

The integration includes robust error handling:

1. **Network Errors**: Automatic retry with exponential backoff
2. **API Errors**: Logged with details, falls back to original text
3. **Partial Failures**: Successfully translated texts are used, failed ones use original
4. **Build Failures**: If translation completely fails, build continues with original text

### Monitoring Translation Status:

During build, you'll see logs like:

```
[DictionaryGenerator] Using Algebras API translation service
[DictionaryGenerator] Translating 150 texts to 3 target locales
[AlgebrasTranslationService] Translating 50 texts from en to es (attempt 1/3)
[AlgebrasTranslationService] Successfully translated 50 texts
```

## Troubleshooting

### Issue: Build is slow

**Solution**: Increase batch size or reduce target locales for testing
```javascript
algebrasApiKey: process.env.ALGEBRAS_API_KEY,
batchSize: 100, // Increase from default 50
```

### Issue: API errors

**Solution**: Check your API key and network connection
```javascript
// Enable more verbose logging by checking the build output
```

### Issue: Some strings not translating

**Possible causes**:
1. Strings are in node_modules (excluded by default)
2. Strings are dynamically generated
3. Build cache needs to be cleared

**Solution**:
```bash
# Clear build cache
rm -rf .next
rm -rf src/intl

# Rebuild
npm run build
```

### Issue: Translations are wrong

**Solution**: Check that your source language is set correctly:
```javascript
defaultLocale: 'en', // Make sure this matches your actual source language
```

## Advanced Usage

### Custom Batch Size for Large Projects:

```javascript
export default algebrasIntl({
  defaultLocale: 'en',
  targetLocales: ['es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
  algebrasApiKey: process.env.ALGEBRAS_API_KEY,
  batchSize: 100, // Larger batches for projects with many strings
})(nextConfig);
```

### Testing Translation Integration:

```javascript
// next.config.test.js
export default algebrasIntl({
  defaultLocale: 'en',
  targetLocales: ['es'],
  useMockTranslation: true, // Use mock for testing
})(nextConfig);
```

## API Specification

### Translation Service Implementation

The integration uses the `AlgebrasTranslationService` class which implements:

- **Batch Translation**: Translates multiple texts in a single API call
- **Automatic Batching**: Splits large requests into optimal batch sizes
- **Retry Logic**: 3 attempts with 1s, 2s, 3s delays
- **Error Recovery**: Falls back to original text on complete failure
- **Multi-locale Support**: Efficiently translates to multiple languages

### API Requirements:

- **Authentication**: X-Api-Key header
- **Rate Limits**: Handled automatically with retry logic
- **Content Types**: application/json
- **Timeouts**: Default system timeout (configurable if needed)

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for production
3. **Rotate keys regularly** as per your organization's policy
4. **Monitor API usage** through Algebras dashboard
5. **Restrict API key** to necessary IP ranges if possible

## Support

For issues related to:
- **Plugin configuration**: Check this documentation and examples
- **API errors**: Check Algebras API documentation or contact Algebras support
- **Build issues**: Check Next.js and webpack logs

## Example Projects

See the `demo/` directory for complete example projects using the Algebras integration.

## Changelog

### Version 1.0.0 (Algebras Integration)
- ✅ Batch translation support via Algebras API
- ✅ Automatic retry with exponential backoff
- ✅ Configurable batch sizes
- ✅ Mock mode for development
- ✅ Comprehensive error handling
- ✅ Environment variable support
- ✅ Multi-locale parallel translation

---

For more information, visit:
- Algebras API Documentation: https://platform.algebras.ai/docs
- Project Repository: [Your repo URL]
