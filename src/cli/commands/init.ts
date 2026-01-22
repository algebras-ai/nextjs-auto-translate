import { checkNextJsProject, checkAppRouter, installPackage } from '../checker';
import { askQuestions } from '../questionnaire';
import {
  updateNextConfig,
  updateEnvLocal,
  createIntlDirectory,
} from '../fileWriter';
import type { CliOptions, InitConfig } from '../types';

export async function initCommand(options: CliOptions): Promise<void> {
  console.log('🚀 Setting up Algebras Auto Intl for Next.js...\n');

  // Check if this is a Next.js project
  if (!checkNextJsProject()) {
    process.exit(1);
  }

  if (!checkAppRouter()) {
    process.exit(1);
  }

  // Install package if needed
  await installPackage();

  // Ask questions if options are not complete
  let config: InitConfig;

  const hasAllRequiredOptions =
    options.defaultLocale &&
    options.targetLocales &&
    options.targetLocales.length > 0 &&
    options.outputDir;

  if (hasAllRequiredOptions) {
    // Use provided options, fill in defaults for optional ones
    // TypeScript knows these are defined due to hasAllRequiredOptions check
    config = {
      defaultLocale: options.defaultLocale!,
      targetLocales: options.targetLocales!,
      outputDir: options.outputDir!,
      apiKey: options.apiKey,
      apiUrl: options.apiUrl || 'https://platform.algebras.ai/api/v1',
    };
  } else {
    // Ask questions for missing options
    const answers = await askQuestions(options);
    config = {
      defaultLocale: answers.defaultLocale,
      targetLocales: answers.targetLocales,
      outputDir: answers.outputDir,
      apiKey: answers.apiKey,
      apiUrl: answers.apiUrl || 'https://platform.algebras.ai/api/v1',
    };
  }

  // Create intl directory
  createIntlDirectory(config.outputDir);

  // Update next.config
  updateNextConfig(config);

  // Update .env.local (always, even if API key is not provided)
  updateEnvLocal(config.apiKey, config.apiUrl);

  console.log('\n✨ Setup complete!');
  console.log('\nNext steps:');
  if (!config.apiKey) {
    console.log(
      '1. Add your ALGEBRAS_API_KEY to .env.local (optional, for translations)'
    );
    console.log(
      '   Get your API key at: https://platform.algebras.ai/api-keys'
    );
  }
  console.log('2. Run: npm run dev');
  console.log(
    '3. The plugin will automatically extract strings and generate translations'
  );
}
