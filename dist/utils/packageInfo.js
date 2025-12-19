import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let cachedPackageName = null;
function readPackageName() {
    // src/utils/* and dist/utils/* are both nested 2 levels under the package root
    const pkgPath = path.resolve(__dirname, '../../package.json');
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
    if (typeof pkg.name !== 'string' || pkg.name.length === 0) {
        throw new Error(`[AutoIntl] Could not read package name from ${pkgPath}`);
    }
    return pkg.name;
}
export function getPackageName() {
    if (cachedPackageName)
        return cachedPackageName;
    cachedPackageName = readPackageName();
    return cachedPackageName;
}
export const PACKAGE_NAME = getPackageName();
export function runtimeImportPath(subpath) {
    return `${PACKAGE_NAME}/${subpath}`;
}
