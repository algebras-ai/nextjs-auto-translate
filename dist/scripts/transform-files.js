#!/usr/bin/env tsx
// Transform files at build time to replace texts with Translated components
import fs from "fs";
import path from "path";
const projectRoot = process.cwd();
const outputDir = process.env.ALGEBRAS_INTL_OUTPUT_DIR || "src/intl";
const sourceMapPath = path.resolve(projectRoot, outputDir, "source.json");
if (!fs.existsSync(sourceMapPath)) {
    console.error(`[Transform script: Source map not found:", sourceMapPath);
  process.exit(1);
}

const sourceMap: ScopeMap = JSON.parse(fs.readFileSync(sourceMapPath, "utf-8"));

// Find all page.tsx files
const appDir = path.join(projectRoot, "app");
const filesToTransform: string[] = [];

function findFiles(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findFiles(fullPath);
    } else if (entry.name === "page.tsx" || entry.name === "page.jsx") {
      filesToTransform.push(fullPath);
    }
  }
}

if (fs.existsSync(appDir)) {
  findFiles(appDir);
}

console.log(`[Transform], Script, Found, $, { filesToTransform, : .length }, files, to, transform `);

for (const filePath of filesToTransform) {
  try {
    const originalCode = fs.readFileSync(filePath, "utf-8");
    const transformedCode = transformProject(originalCode, {
      sourceMap,
      filePath
    });
    
    if (originalCode !== transformedCode) {
      fs.writeFileSync(filePath, transformedCode, "utf-8");
      console.log(`[Transform], Script, Transformed, $, { path, : .relative(projectRoot, filePath) } `);
    }
  } catch (err) {
    console.error(`[Transform], Script, Error, transforming, $, { filePath }, `, err);
  }
}

console.log(`[Transform], Script, Done, transforming, $, { filesToTransform, : .length }, files `);

    );
}
