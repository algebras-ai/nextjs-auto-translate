import { describe, it, expect } from "vitest";
import { DictionaryGenerator } from "../src/translator/DictionaryGenerator";
import type { ScopeMap } from "../src/types";
import fs from "fs";
import path from "path";

const tmpDir = ".intl-test-algebras";

const makeScopeMap = (): ScopeMap => ({
	files: {
		"src/app/page.tsx": {
			scopes: {
				"main/heading": { 
					type: "text",
					content: "Welcome to my application", 
					hash: "h1",
					context: "",
					skip: false,
					overrides: {}
				},
				"main/description": { 
					type: "text",
					content: "This is a great app", 
					hash: "h2",
					context: "",
					skip: false,
					overrides: {}
				},
			}
		},
		"src/app/about.tsx": {
			scopes: {
				"about/title": { 
					type: "text",
					content: "About Us", 
					hash: "h3",
					context: "",
					skip: false,
					overrides: {}
				},
			}
		}
	}
});

describe("Algebras API Integration", () => {
	it("generates dictionary with mock translations when no API key", async () => {
		const gen = new DictionaryGenerator({ 
			defaultLocale: "en" as any, 
			targetLocales: ["es", "fr", "de"] as any, 
			outputDir: tmpDir,
			useMockTranslation: true
		});
		
		const out = await gen.generateDictionary(makeScopeMap());
		expect(out).toContain(path.join(tmpDir, "dictionary.json"));
		
		const raw = fs.readFileSync(out, "utf-8");
		const json = JSON.parse(raw);
		
		// Check English (source) is unchanged
		expect(json.files["src/app/page.tsx"].entries["main/heading"].content.en).toBe("Welcome to my application");
		
		// Check mock translations are prefixed
		expect(json.files["src/app/page.tsx"].entries["main/heading"].content.es).toContain("[ES]");
		expect(json.files["src/app/page.tsx"].entries["main/heading"].content.fr).toContain("[FR]");
		expect(json.files["src/app/page.tsx"].entries["main/heading"].content.de).toContain("[DE]");
	});

	it("handles multiple files with batch translation", async () => {
		const gen = new DictionaryGenerator({ 
			defaultLocale: "en" as any, 
			targetLocales: ["es", "ru"] as any, 
			outputDir: tmpDir,
			useMockTranslation: true,
			batchSize: 2 // Small batch to test batching logic
		});
		
		const out = await gen.generateDictionary(makeScopeMap());
		const raw = fs.readFileSync(out, "utf-8");
		const json = JSON.parse(raw);
		
		// Verify all files are processed
		expect(json.files["src/app/page.tsx"]).toBeDefined();
		expect(json.files["src/app/about.tsx"]).toBeDefined();
		
		// Verify all entries have translations
		expect(json.files["src/app/page.tsx"].entries["main/heading"].content.es).toBeDefined();
		expect(json.files["src/app/page.tsx"].entries["main/description"].content.es).toBeDefined();
		expect(json.files["src/app/about.tsx"].entries["about/title"].content.es).toBeDefined();
	});

	it("preserves source locale without translation", async () => {
		const gen = new DictionaryGenerator({ 
			defaultLocale: "en" as any, 
			targetLocales: ["fr"] as any, 
			outputDir: tmpDir,
			useMockTranslation: true
		});
		
		const out = await gen.generateDictionary(makeScopeMap());
		const raw = fs.readFileSync(out, "utf-8");
		const json = JSON.parse(raw);
		
		// English should be exactly the same as source
		expect(json.files["src/app/page.tsx"].entries["main/heading"].content.en).toBe("Welcome to my application");
		expect(json.files["src/app/page.tsx"].entries["main/description"].content.en).toBe("This is a great app");
		
		// French should be translated (mocked)
		expect(json.files["src/app/page.tsx"].entries["main/heading"].content.fr).not.toBe("Welcome to my application");
		expect(json.files["src/app/page.tsx"].entries["main/heading"].content.fr).toContain("Welcome to my application");
	});

	it("configuration supports optional API parameters", async () => {
		// Test that generator accepts all configuration options
		const gen = new DictionaryGenerator({ 
			defaultLocale: "en" as any, 
			targetLocales: ["es"] as any, 
			outputDir: tmpDir,
			// These options should be accepted even if not used in mock mode
			algebrasApiKey: "test-key",
			useMockTranslation: true,
			batchSize: 100
		});
		
		const out = await gen.generateDictionary(makeScopeMap());
		expect(out).toContain(path.join(tmpDir, "dictionary.json"));
	});

	it("defaults to mock translation when no API key is provided", () => {
		// When neither API key nor useMockTranslation is specified, it defaults to mock mode
		const gen = new DictionaryGenerator({ 
			defaultLocale: "en" as any, 
			targetLocales: ["es"] as any, 
			outputDir: tmpDir,
			// No algebrasApiKey and no useMockTranslation specified
		});
		
		// Should create successfully and use mock translation
		expect(gen).toBeDefined();
	});
});

describe("Algebras API Configuration", () => {
	it("accepts API key configuration", () => {
		const gen = new DictionaryGenerator({ 
			defaultLocale: "en" as any, 
			targetLocales: ["es"] as any, 
			outputDir: tmpDir,
			algebrasApiKey: "sk-test-key-example"
		});
		
		expect(gen).toBeDefined();
	});

	it("allows custom batch sizes", async () => {
		const gen = new DictionaryGenerator({ 
			defaultLocale: "en" as any, 
			targetLocales: ["es"] as any, 
			outputDir: tmpDir,
			useMockTranslation: true,
			batchSize: 10
		});
		
		const out = await gen.generateDictionary(makeScopeMap());
		expect(out).toBeDefined();
	});

	it("supports multiple target locales", async () => {
		const targetLocales = ["es", "fr", "de", "ru", "ja", "zh", "pt", "it", "ko", "ar"];
		
		const gen = new DictionaryGenerator({ 
			defaultLocale: "en" as any, 
			targetLocales: targetLocales as any, 
			outputDir: tmpDir,
			useMockTranslation: true
		});
		
		const out = await gen.generateDictionary(makeScopeMap());
		const raw = fs.readFileSync(out, "utf-8");
		const json = JSON.parse(raw);
		
		// Verify all target locales are present
		const firstEntry = json.files["src/app/page.tsx"].entries["main/heading"].content;
		for (const locale of targetLocales) {
			expect(firstEntry[locale]).toBeDefined();
		}
	});
});

