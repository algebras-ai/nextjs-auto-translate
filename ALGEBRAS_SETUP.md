# Algebras AI Translation Setup

This guide explains how to use the Algebras AI translation API for automatic translations in your Next.js project.

## Setup

### 1. Create `.env` file

Create a `.env` file in the root of your project with your Algebras AI credentials:

```bash
ALGEBRAS_API_KEY=your_api_key_here
ALGEBRAS_API_URL=https://platform.algebras.ai/api/v1
```

### 2. Usage Example

Here's how to use the Algebras AI translation provider:

```typescript
import { AlgebrasTranslationProvider, DictionaryGenerator } from "algebras-auto-intl";

// Load environment variables
const apiKey = process.env.ALGEBRAS_API_KEY!;
const apiUrl = process.env.ALGEBRAS_API_URL || "https://platform.algebras.ai/api/v1";

// Create the translation provider
const translationProvider = new AlgebrasTranslationProvider({
  apiKey,
  apiUrl, // Optional, defaults to https://beta.algebras.ai/api/v1
  // Optional translation settings:
  // glossaryId: "your-glossary-id", // Use a custom glossary for domain-specific terms
  // prompt: "Translate in a casual tone", // Add custom instructions
  // flag: false, // API-specific flag
  // ignoreCache: false // Force fresh translations
});

// Create dictionary generator with Algebras AI
const generator = new DictionaryGenerator({
  defaultLocale: "en",
  targetLocales: ["es", "fr", "de", "zh", "ja"], // Add your target languages
  outputDir: "./translations",
  translationProvider // Pass the provider here
});

// Generate translations
const sourceMap = /* your source map */;
const dictionaryPath = await generator.generateDictionary(sourceMap);
console.log(`Dictionary generated at: ${dictionaryPath}`);
```

## Features

### Batch Translation

The Algebras provider automatically batches translations to minimize API calls:

- Translates up to 20 texts at once per language (API maximum)
- Processes each target language separately
- Includes rate limiting delays (500ms between batches, 1s between languages)
- Caches translations to avoid duplicate API calls

### Fallback Behavior

If the API is unavailable or an error occurs:

- Falls back to mock translations (prefixed with language code)
- Logs detailed error messages
- Continues processing without crashing

### Optimization

The provider includes several optimizations:

1. **Batch Processing**: Groups up to 20 texts per API call per language (API maximum)
2. **Caching**: Remembers previously translated texts to avoid duplicate calls
3. **Rate Limiting**: Adds 500ms delays between batches and 1s delays between languages
4. **Error Handling**: Gracefully handles API errors with fallback translations
5. **Language Separation**: Processes each target language in its own batch for accuracy

## API Details

The integration uses the Algebras AI Batch Translation API:

- **Endpoint**: `POST https://platform.algebras.ai/api/v1/translation/translate-batch`
- **Authentication**: Uses `X-Api-Key` header (not `Authorization: Bearer`)
- **Response Format**: Returns translations with index, content, word count, and credit usage
- **Request Format**:

  ```json
  {
    "texts": ["Hello world", "How are you?"],
    "sourceLanguage": "en",
    "targetLanguage": "es",
    "glossaryId": null,
    "prompt": null,
    "flag": false,
    "ignoreCache": false
  }
  ```

  **Note**: All fields except `texts`, `sourceLanguage`, and `targetLanguage` are optional and can be customized in the provider configuration.

- **Response Format**:
  ```json
  {
    "translations": ["Hola mundo", "¿Cómo estás?"]
  }
  ```

The provider automatically:

- Batches up to 20 texts per API call (API maximum)
- Processes each target language separately
- Adds rate limiting delays between batches

For more information, visit [Algebras AI Platform](https://platform.algebras.ai/api/v1)

## Troubleshooting

### API Key Issues

If you get authentication errors:

1. Verify your API key is correct in `.env`
2. Check that the key is properly loaded (not undefined)
3. Ensure there are no extra spaces or quotes in the `.env` file

### Translation Quality

To improve translation quality:

- **Use custom prompts**: Pass a `prompt` parameter to add context or tone instructions
  ```typescript
  new AlgebrasTranslationProvider({
    apiKey: '...',
    prompt: 'Translate in a professional, formal tone',
  });
  ```
- **Use glossaries**: Pass a `glossaryId` for domain-specific terminology
- **Keep source texts clear**: Avoid mixing languages in a single text
- **Use consistent terminology**: Maintain consistency across your content
- **Force fresh translations**: Set `ignoreCache: true` to bypass caching

### Rate Limiting

If you hit rate limits:

- The provider automatically adds 1-second delays between batches
- Reduce the `batchSize` in `translateAll` method if needed
- Consider implementing exponential backoff for retries

## Support

For issues with the Algebras AI API:

- Status Page: [https://status.algebras.ai](https://status.algebras.ai)
- API Documentation: [https://beta.algebras.ai/api/v1](https://beta.algebras.ai/api/v1)
