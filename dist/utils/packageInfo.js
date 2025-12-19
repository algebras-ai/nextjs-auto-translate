"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PACKAGE_NAME = void 0;
exports.getPackageName = getPackageName;
exports.runtimeImportPath = runtimeImportPath;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_url_1 = require("node:url");
const __filename = (0, node_url_1.fileURLToPath)(import.meta.url);
const __dirname = node_path_1.default.dirname(__filename);
let cachedPackageName = null;
function readPackageName() {
    // src/utils/* and dist/utils/* are both nested 2 levels under the package root
    const pkgPath = node_path_1.default.resolve(__dirname, '../../package.json');
    const raw = node_fs_1.default.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
    if (typeof pkg.name !== 'string' || pkg.name.length === 0) {
        throw new Error(`[AutoIntl] Could not read package name from ${pkgPath}`);
    }
    return pkg.name;
}
function getPackageName() {
    if (cachedPackageName)
        return cachedPackageName;
    cachedPackageName = readPackageName();
    return cachedPackageName;
}
exports.PACKAGE_NAME = getPackageName();
function runtimeImportPath(subpath) {
    return `${exports.PACKAGE_NAME}/${subpath}`;
}
