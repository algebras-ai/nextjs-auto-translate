"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionaryStore = void 0;
// src/storage/DictionaryStore.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class DictionaryStore {
    path = path_1.default.resolve(process.cwd(), '.intl/dictionary.json');
    save(data) {
        fs_1.default.mkdirSync(path_1.default.dirname(this.path), { recursive: true });
        fs_1.default.writeFileSync(this.path, JSON.stringify(data, null, 2));
    }
    load() {
        if (!fs_1.default.existsSync(this.path))
            return {};
        return JSON.parse(fs_1.default.readFileSync(this.path, 'utf-8'));
    }
    merge(newData) {
        const existing = this.load();
        for (const locale of Object.keys(newData)) {
            existing[locale] = { ...existing[locale], ...newData[locale] };
        }
        return existing;
    }
}
exports.DictionaryStore = DictionaryStore;
