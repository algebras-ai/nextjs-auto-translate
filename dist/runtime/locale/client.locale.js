"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLocale = exports.getLocale = void 0;
const getLocale = () => {
    const match = document.cookie.match(/(^|;) ?locale=([^;]*)/);
    return match?.[2] ?? navigator.language.split('-')[0] ?? 'en';
};
exports.getLocale = getLocale;
const setLocale = (locale) => {
    document.cookie = `locale=${locale}; path=/`;
};
exports.setLocale = setLocale;
