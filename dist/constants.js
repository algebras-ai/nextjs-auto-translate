"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RUNTIME_PATHS = exports.PACKAGE_NAME = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function readPackageName() {
    try {
        const pkgPath = path_1.default.resolve(__dirname, '..', 'package.json');
        const raw = fs_1.default.readFileSync(pkgPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed &&
            typeof parsed === 'object' &&
            'name' in parsed &&
            typeof parsed.name === 'string' &&
            parsed.name.trim().length > 0) {
            return parsed.name.trim();
        }
    }
    catch {
        // ignore - fall back below
    }
    // Fallback only for unusual runtimes where package.json isn't available.
    return 'algebras-auto-intl';
}
exports.PACKAGE_NAME = readPackageName();
exports.RUNTIME_PATHS = {
    SERVER_INTL_WRAPPER: `${exports.PACKAGE_NAME}/runtime/server/IntlWrapper`,
    CLIENT_TRANSLATED: `${exports.PACKAGE_NAME}/runtime/client/components/Translated`,
    CLIENT_LOCALE_SWITCHER: `${exports.PACKAGE_NAME}/runtime/client/components/LocaleSwitcher`,
    TURBOPACK_TRANSFORMER: `${exports.PACKAGE_NAME}/turbopack/auto-intl-transformer`,
};
