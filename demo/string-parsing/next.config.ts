// example.config.ts
// Example Next.js configuration with Algebras AI translation

import autoIntl, { LanguageCode } from '@dima-algebras/algebras-auto-intl';
import type { NextConfig } from 'next';

// Make sure to create a .env file in your project root with:
// ALGEBRAS_API_KEY=your_api_key_from_platform_algebras_ai
// ALGEBRAS_API_URL=https://platform.algebras.ai/api/v1

const nextConfig: NextConfig = autoIntl({
  defaultLocale: LanguageCode.en,
  targetLocales: [LanguageCode.es],
  outputDir: './src/intl',
  includeNodeModules: false,
  // The plugin automatically reads ALGEBRAS_API_KEY and ALGEBRAS_API_URL from .env
  // Optional: You can pass the API key directly (not recommended for production)
  // translationApiKey: process.env.ALGEBRAS_API_KEY,
  // translationApiUrl: process.env.ALGEBRAS_API_URL,
})({
  // Your other Next.js config options
  reactStrictMode: true,
  // ... other options
});

export default nextConfig;
