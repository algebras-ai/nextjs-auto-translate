"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceStore = void 0;
// src/storage/SourceStore.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class SourceStore {
    path;
    constructor(outputDir = '.intl') {
        this.path = path_1.default.resolve(process.cwd(), outputDir, 'source.json');
    }
    save(data) {
        fs_1.default.mkdirSync(path_1.default.dirname(this.path), { recursive: true });
        fs_1.default.writeFileSync(this.path, JSON.stringify(data, null, 2));
    }
    load() {
        if (!fs_1.default.existsSync(this.path)) {
            return { version: 0.1, files: {} };
        }
        try {
            const content = JSON.parse(fs_1.default.readFileSync(this.path, 'utf-8'));
            // Check if it's the old format (flat structure)
            if (!content.files && !content.version) {
                console.log('[SourceStore] Detected old format, migrating to new structure...');
                // This is the old flat format, return empty new format to trigger re-parsing
                return { version: 0.1, files: {} };
            }
            // Ensure the structure has required fields
            return {
                version: content.version || 0.1,
                files: content.files || {},
            };
        }
        catch (error) {
            console.warn('[SourceStore] Error reading source.json, starting fresh:', error);
            return { version: 0.1, files: {} };
        }
    }
}
exports.SourceStore = SourceStore;
