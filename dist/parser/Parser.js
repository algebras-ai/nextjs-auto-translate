"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
// src/parser/Parser.ts
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SourceStore_1 = require("../storage/SourceStore");
const utils_1 = require("./utils");
// @babel/traverse has different exports for ESM vs CommonJS
const traverse = traverse_1.default.default || traverse_1.default;
class Parser {
    options;
    lockPath;
    sourceStore;
    constructor(options = {}) {
        this.options = options;
        const outputDir = options.outputDir || '.intl';
        this.lockPath = path_1.default.resolve(process.cwd(), outputDir, '.lock');
        this.sourceStore = new SourceStore_1.SourceStore(outputDir);
    }
    findFilesSync(dir, extensions, ignorePatterns) {
        const files = [];
        const isIgnored = (filePath) => {
            return ignorePatterns.some((pattern) => {
                // Convert glob pattern to regex-like matching
                const regexPattern = pattern
                    .replace(/\*\*/g, '.*')
                    .replace(/\*/g, '[^/]*')
                    .replace(/\//g, '\\/');
                const regex = new RegExp(regexPattern);
                return regex.test(filePath);
            });
        };
        const walkDir = (currentDir) => {
            try {
                const entries = fs_1.default.readdirSync(currentDir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path_1.default.join(currentDir, entry.name);
                    const relativePath = path_1.default.relative(dir, fullPath);
                    if (isIgnored(relativePath)) {
                        continue;
                    }
                    if (entry.isDirectory()) {
                        walkDir(fullPath);
                    }
                    else if (entry.isFile()) {
                        const ext = path_1.default.extname(entry.name);
                        if (extensions.includes(ext)) {
                            files.push(fullPath);
                        }
                    }
                }
            }
            catch (error) {
                // Skip directories we can't read
                console.warn(`[Parser] Cannot read directory: ${currentDir}`);
            }
        };
        walkDir(dir);
        return files;
    }
    parseProject() {
        // Ensure .intl directory exists
        const intlDir = path_1.default.dirname(this.sourceStore['path']);
        fs_1.default.mkdirSync(intlDir, { recursive: true });
        // Lock file check
        if (fs_1.default.existsSync(this.lockPath)) {
            console.log('🟡 Skipping parse: lock file present.');
            return this.sourceStore.load();
        }
        // Create lock file
        fs_1.default.writeFileSync(this.lockPath, '');
        try {
            console.log('[Parser] Scanning project for translatable strings...');
            const ignore = ['**/.next/**', '**/dist/**'];
            if (!this.options.includeNodeModules) {
                ignore.push('**/node_modules/**');
            }
            const files = this.findFilesSync(process.cwd(), ['.tsx', '.jsx'], ignore);
            console.log(`[Parser] Found ${files.length} files to scan.`);
            const scopeMap = {
                version: 0.1,
                files: {},
            };
            const projectRoot = process.cwd();
            for (const file of files) {
                const code = fs_1.default.readFileSync(file, 'utf-8');
                let ast;
                try {
                    ast = (0, parser_1.parse)(code, {
                        sourceType: 'module',
                        plugins: ['jsx', 'typescript'],
                    });
                }
                catch {
                    console.warn(`[Parser] Skipping file with parse error: ${file}`);
                    continue;
                }
                // Get relative file path from project root
                const relativeFilePath = path_1.default.relative(projectRoot, file);
                const fileScopes = {};
                traverse(ast, {
                    JSXElement(path) {
                        // Get the element name
                        const elementName = path.node.openingElement.name;
                        let tagName = 'Unknown';
                        if (t.isJSXIdentifier(elementName)) {
                            tagName = elementName.name;
                        }
                        else if (t.isJSXMemberExpression(elementName)) {
                            tagName = elementName.property.name;
                        }
                        // Check if this element is nested inside another element that has text
                        // If so, skip extracting it to avoid duplication (content is already in parent's extraction)
                        let parentPath = path.parentPath;
                        while (parentPath) {
                            if (parentPath.isJSXElement && parentPath.isJSXElement()) {
                                const parentElementName = parentPath.node.openingElement.name;
                                let parentTagName = 'Unknown';
                                if (t.isJSXIdentifier(parentElementName)) {
                                    parentTagName = parentElementName.name;
                                }
                                else if (t.isJSXMemberExpression(parentElementName)) {
                                    parentTagName = parentElementName.property.name;
                                }
                                // Check if parent has JSXText or translatable expressions
                                const hasContentInParent = parentPath.node.children.some((child) => {
                                    if (t.isJSXText(child) && child.value.trim()) {
                                        return true;
                                    }
                                    if (t.isJSXExpressionContainer(child)) {
                                        const expr = child.expression;
                                        // Check if it's a translatable expression
                                        if (t.isStringLiteral(expr) ||
                                            t.isTemplateLiteral(expr) ||
                                            t.isConditionalExpression(expr) ||
                                            t.isLogicalExpression(expr) ||
                                            (t.isBinaryExpression(expr) && expr.operator === '+')) {
                                            return true;
                                        }
                                    }
                                    return false;
                                });
                                // If parent has content, this nested element's content is already included
                                if (hasContentInParent) {
                                    return;
                                }
                            }
                            parentPath = parentPath.parentPath;
                        }
                        // Check if element has translatable content
                        const hasTranslatableContent = path.node.children.some((child) => {
                            if (t.isJSXText(child) && child.value.trim()) {
                                return true;
                            }
                            if (t.isJSXExpressionContainer(child)) {
                                const expr = child.expression;
                                // Check for translatable expressions
                                if (t.isStringLiteral(expr) ||
                                    t.isTemplateLiteral(expr) ||
                                    t.isConditionalExpression(expr) ||
                                    t.isLogicalExpression(expr) ||
                                    (t.isBinaryExpression(expr) && expr.operator === '+') ||
                                    t.isCallExpression(expr) ||
                                    t.isIdentifier(expr) ||
                                    t.isMemberExpression(expr)) {
                                    return true;
                                }
                            }
                            return false;
                        });
                        if (hasTranslatableContent) {
                            const content = (0, utils_1.buildContent)(path.node);
                            if (content.trim()) {
                                const hash = crypto_1.default
                                    .createHash('md5')
                                    .update(content)
                                    .digest('hex');
                                const fullScopePath = path.getPathLocation();
                                const relativeScopePath = (0, utils_1.getRelativeScopePath)(fullScopePath);
                                fileScopes[relativeScopePath] = {
                                    type: 'element',
                                    hash,
                                    context: '',
                                    skip: false,
                                    overrides: {},
                                    content,
                                };
                            }
                        }
                    },
                });
                // Only add files that have scopes
                if (Object.keys(fileScopes).length > 0) {
                    scopeMap.files[relativeFilePath] = {
                        scopes: fileScopes,
                    };
                }
            }
            // Compare with previous
            const prev = this.sourceStore.load();
            const prevFiles = prev.files || {};
            const newFiles = scopeMap.files;
            const changed = this.hasChanges(prevFiles, newFiles);
            if (!changed) {
                console.log('🟢 Skipping parse: no changes detected.');
                return prev;
            }
            const totalEntries = Object.values(newFiles).reduce((count, file) => count + Object.keys(file.scopes).length, 0);
            console.log(`[Parser] Extraction complete. Found ${totalEntries} entries across ${Object.keys(newFiles).length} files.`);
            // Save new sources
            this.sourceStore.save(scopeMap);
            return scopeMap;
        }
        finally {
            // Remove lock file
            fs_1.default.unlinkSync(this.lockPath);
        }
    }
    hasChanges(prevFiles, newFiles) {
        const prevFilePaths = Object.keys(prevFiles);
        const newFilePaths = Object.keys(newFiles);
        // Check if file count changed
        if (prevFilePaths.length !== newFilePaths.length) {
            return true;
        }
        // Check each file
        for (const filePath of newFilePaths) {
            const prevFile = prevFiles[filePath];
            const newFile = newFiles[filePath];
            if (!prevFile) {
                return true; // New file added
            }
            const prevScopes = Object.keys(prevFile.scopes);
            const newScopes = Object.keys(newFile.scopes);
            // Check if scope count changed
            if (prevScopes.length !== newScopes.length) {
                return true;
            }
            // Check each scope
            for (const scope of newScopes) {
                const prevScope = prevFile.scopes[scope];
                const newScope = newFile.scopes[scope];
                if (!prevScope || prevScope.hash !== newScope.hash) {
                    return true;
                }
            }
        }
        return false;
    }
}
exports.Parser = Parser;
