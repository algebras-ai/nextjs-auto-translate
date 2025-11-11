#!/usr/bin/env tsx
/**
 * Test script to verify Algebras API integration
 * This script makes real API calls to test the translation service
 * 
 * Usage:
 *   ALGEBRAS_API_KEY=your-key tsx scripts/test-api-integration.ts
 */

import { config } from 'dotenv';
import { AlgebrasTranslationService } from '../src/translator/AlgebrasTranslationService';
import { DictionaryGenerator } from '../src/translator/DictionaryGenerator';
import type { ScopeMap } from '../src/types';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env and .env.local
config({ path: '.env' });
config({ path: '.env.local', override: true });

if (!process.env.ALGEBRAS_API_KEY) {
  console.error('❌ ERROR: ALGEBRAS_API_KEY not found in environment variables!');
  console.error('Please create .env.local with: ALGEBRAS_API_KEY=your-api-key');
  process.exit(1);
}

const API_KEY: string = process.env.ALGEBRAS_API_KEY;

async function testSingleTranslation() {
  console.log('\n🧪 Test 1: Single Text Translation');
  console.log('=' .repeat(50));
  
  const service = new AlgebrasTranslationService({
    apiKey: API_KEY,
    batchSize: 10
  });

  try {
    const text = "Hello, World!";
    console.log(`Source (en): "${text}"`);
    
    const spanish = await service.translate(text, 'es', 'en');
    console.log(`Spanish (es): "${spanish}"`);
    
    const french = await service.translate(text, 'fr', 'en');
    console.log(`French (fr): "${french}"`);
    
    const german = await service.translate(text, 'de', 'en');
    console.log(`German (de): "${german}"`);
    
    if (spanish.includes('[ES]') || french.includes('[FR]')) {
      console.log('❌ FAIL: Receiving mock translations instead of real ones!');
      return false;
    }
    
    console.log('✅ PASS: Real translations received!');
    return true;
  } catch (error) {
    console.log('❌ FAIL:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function testBatchTranslation() {
  console.log('\n🧪 Test 2: Batch Translation');
  console.log('=' .repeat(50));
  
  const service = new AlgebrasTranslationService({
    apiKey: API_KEY,
    batchSize: 10
  });

  try {
    const texts = [
      "Welcome to my app",
      "Click here to continue",
      "Thank you for visiting",
      "Please enter your email",
      "Sign up for free"
    ];
    
    console.log(`Translating ${texts.length} texts to Spanish...`);
    const translations = await service.translateBatch(texts, 'es', 'en');
    
    console.log('\nResults:');
    texts.forEach((text, i) => {
      console.log(`  EN: "${text}"`);
      console.log(`  ES: "${translations[i]}"`);
      console.log();
    });
    
    if (translations.some(t => t.includes('[ES]'))) {
      console.log('❌ FAIL: Receiving mock translations!');
      return false;
    }
    
    console.log('✅ PASS: Batch translations received!');
    return true;
  } catch (error) {
    console.log('❌ FAIL:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function testMultiLocaleTranslation() {
  console.log('\n🧪 Test 3: Multi-Locale Translation');
  console.log('=' .repeat(50));
  
  const service = new AlgebrasTranslationService({
    apiKey: API_KEY,
    batchSize: 10
  });

  try {
    const texts = [
      "Hello",
      "Goodbye",
      "Thank you"
    ];
    
    const locales = ['es', 'fr', 'de', 'ru'];
    
    console.log(`Translating ${texts.length} texts to ${locales.length} locales...`);
    const results = await service.translateForMultipleLocales(texts, locales, 'en');
    
    console.log('\nResults:');
    texts.forEach((text, i) => {
      console.log(`\n  EN: "${text}"`);
      for (const locale of locales) {
        console.log(`  ${locale.toUpperCase()}: "${results[locale][i]}"`);
      }
    });
    
    const hasMockTranslations = Object.values(results).some(translations =>
      translations.some(t => t.includes('['))
    );
    
    if (hasMockTranslations) {
      console.log('\n❌ FAIL: Receiving mock translations!');
      return false;
    }
    
    console.log('\n✅ PASS: Multi-locale translations received!');
    return true;
  } catch (error) {
    console.log('❌ FAIL:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function testDictionaryGenerator() {
  console.log('\n🧪 Test 4: Full Dictionary Generation with API');
  console.log('=' .repeat(50));
  
  const tmpDir = '.intl-test-api-real';
  
  const scopeMap: ScopeMap = {
    files: {
      'src/app/page.tsx': {
        scopes: {
          'main/heading': {
            type: 'text',
            content: 'Welcome to my application',
            hash: 'h1',
            context: '',
            skip: false,
            overrides: {}
          },
          'main/button': {
            type: 'text',
            content: 'Get started now',
            hash: 'h2',
            context: '',
            skip: false,
            overrides: {}
          }
        }
      }
    }
  };

  try {
    const generator = new DictionaryGenerator({
      defaultLocale: 'en' as any,
      targetLocales: ['es', 'fr'] as any,
      outputDir: tmpDir,
      algebrasApiKey: API_KEY,
      useMockTranslation: false // Use real API
    });
    
    console.log('Generating dictionary with real API translations...');
    const outputPath = await generator.generateDictionary(scopeMap);
    
    const dictionaryPath = path.join(tmpDir, 'dictionary.json');
    const dictionary = JSON.parse(fs.readFileSync(dictionaryPath, 'utf-8'));
    
    console.log('\nGenerated Dictionary:');
    console.log(JSON.stringify(dictionary, null, 2));
    
    const firstEntry = dictionary.files['src/app/page.tsx'].entries['main/heading'].content;
    
    if (firstEntry.es.includes('[ES]') || firstEntry.fr.includes('[FR]')) {
      console.log('\n❌ FAIL: Dictionary contains mock translations!');
      return false;
    }
    
    console.log('\n✅ PASS: Dictionary generated with real translations!');
    console.log(`\nOutput saved to: ${outputPath}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function main() {
  console.log('🚀 Algebras API Integration Test');
  console.log('=' .repeat(50));
  console.log(`API Key: ${API_KEY.substring(0, 20)}...`);
  console.log();
  
  const results = {
    test1: await testSingleTranslation(),
    test2: await testBatchTranslation(),
    test3: await testMultiLocaleTranslation(),
    test4: await testDictionaryGenerator()
  };
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results Summary');
  console.log('=' .repeat(50));
  console.log(`Test 1 (Single Translation): ${results.test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 2 (Batch Translation): ${results.test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 3 (Multi-Locale): ${results.test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 4 (Dictionary Generator): ${results.test4 ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Algebras API integration is working correctly!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

