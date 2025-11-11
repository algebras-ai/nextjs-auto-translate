/**
 * Example Next.js configuration with Algebras AI translation integration
 * 
 * This example shows how to configure nextjs-auto-translate to use
 * Algebras API for automatic translation during build time.
 * 
 * SETUP:
 * 1. Copy this file to your project root as next.config.mjs
 * 2. Create .env.local and add: ALGEBRAS_API_KEY=your-api-key
 * 3. Run: npm install nextjs-auto-translate
 * 4. Run: npm run build
 */

import algebrasIntl from 'nextjs-auto-translate';

const nextConfig = {
  // Your existing Next.js configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // Other configurations...
};

// Export with Algebras translation configuration
export default algebrasIntl({
  // REQUIRED: Source language (the language your code is written in)
  defaultLocale: 'en',
  
  // REQUIRED: Target languages to translate to
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
  ],
  
  // RECOMMENDED: Use environment variable for API key (stored in .env.local)
  algebrasApiKey: process.env.ALGEBRAS_API_KEY,
  
  // OPTIONAL: Output directory for translation files (default: './src/intl')
  outputDir: './src/intl',
  
  // OPTIONAL: Batch size for API requests (default: 50)
  // Increase for larger projects, decrease if hitting rate limits
  batchSize: 50,
  
  // OPTIONAL: Force mock translations (useful for testing)
  // useMockTranslation: true,
  
  // OPTIONAL: Include node_modules in translation (default: false)
  // includeNodeModules: false,
})(nextConfig);

/**
 * PRODUCTION CHECKLIST:
 * 
 * ✅ API key is stored in .env.local (not committed to git)
 * ✅ .env.local is in .gitignore
 * ✅ defaultLocale matches your source code language
 * ✅ targetLocales includes all needed languages
 * ✅ outputDir is in your .gitignore if you don't want to commit translations
 * 
 * DEVELOPMENT TIP:
 * For faster development builds, you can:
 * 1. Use useMockTranslation: true
 * 2. Reduce targetLocales to just 1-2 languages
 * 3. Run: npm run build
 */

