"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocale = void 0;
const headers_1 = require("next/headers");
const getLocale = async () => {
    const cookieStore = await (0, headers_1.cookies)();
    const headerStore = await (0, headers_1.headers)();
    return (cookieStore.get('locale')?.value ||
        headerStore.get('accept-language')?.split(',')[0].split('-')[0] ||
        'en');
};
exports.getLocale = getLocale;
