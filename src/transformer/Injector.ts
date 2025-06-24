import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

// Injects {t("scope")} in place of JSXText
export function injectT(scope: string): t.JSXExpressionContainer {
  return t.jsxExpressionContainer(
    t.callExpression(t.identifier("t"), [t.stringLiteral(scope)])
  );
}

// Ensures import { t } from 'algebras-auto-intl/runtime' exists
export function ensureImportT(ast: t.File) {
  let hasImport = false;
  traverse(ast, {
    ImportDeclaration(path) {
      if (
        path.node.source.value === "algebras-auto-intl/runtime" &&
        path.node.specifiers.some(
          (s) =>
            t.isImportSpecifier(s) &&
            t.isIdentifier(s.imported) &&
            s.imported.name === "t"
        )
      ) {
        hasImport = true;
        path.stop();
      }
    }
  });
  if (!hasImport) {
    const importDecl = t.importDeclaration(
      [t.importSpecifier(t.identifier("t"), t.identifier("t"))],
      t.stringLiteral("algebras-auto-intl/runtime")
    );
    ast.program.body.unshift(importDecl);
  }
}

// Transforms all .tsx/.jsx files in the project, injecting t() calls
export async function transformProject(sourceMap: any) {
  const files = Object.keys(sourceMap.files || {});
  console.log("files", files);
  for (const filePath of files) {
    const absPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(absPath)) continue;
    const code = fs.readFileSync(absPath, "utf-8");
    let ast;
    try {
      ast = parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
      });
    } catch (e) {
      console.warn(`[Injector] Failed to parse ${filePath}:`, e);
      continue;
    }
    let changed = false;
    const fileScopes = sourceMap.files[filePath]?.scopes || {};
    console.log("FILESCOPES", Object.keys(fileScopes)[0]);
    traverse(ast, {
      JSXText(path: NodePath<t.JSXText>) {
        const text = path.node.value.trim();
        if (!text) return;
        // Find the closest JSXElement ancestor
        const jsxElement = path.findParent((p) => p.isJSXElement());
        if (!jsxElement) return;
        // Find the scope for this element
        const scopePath = jsxElement
          .getPathLocation()
          .replace(/\[(\d+)\]/g, "$1")
          .replace(/\./g, "/");
        console.log("FILEPATH", filePath);
        console.log("SCOPEPATH", scopePath);
        if (!fileScopes[scopePath]) return;
        // Replace text with {t("scope")}
        path.replaceWith(injectT(`${filePath}::${scopePath}`));
        console.log("FILEPATH", filePath);
        changed = true;
      }
    });
    console.log("changed", changed);
    if (changed) {
      ensureImportT(ast);
      const output = generate(ast, { retainLines: true });
      console.log("output", output);
      // fs.writeFileSync(absPath, output.code, "utf-8");
      // console.log(`[Injector] Transformed ${filePath}`);
    }
  }
}
