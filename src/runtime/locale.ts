let currentLocale = "en";

export function setLocale(locale: string) {
  currentLocale = locale;
}

export function getLocale() {
  return currentLocale;
}

// Detect locale on the server (Node.js/SSR)
// Usage: pass req, res, or use process.env, or parse from URL
export function detectServerLocale(options?: {
  req?: any;
  defaultLocale?: string;
}): string {
  // 1. Try process.env.LOCALE
  if (process.env.LOCALE) return process.env.LOCALE;
  // 2. Try options.req (Next.js API route or middleware)
  if (options?.req) {
    // Try cookie, header, or URL param
    const cookieLocale = options.req.cookies?.locale;
    if (cookieLocale) return cookieLocale;
    const headerLocale =
      options.req.headers?.["accept-language"]?.split(",")[0];
    if (headerLocale) return headerLocale;
    // Try URL param (e.g. /en/)
    const match = options.req.url?.match(/^\/(\w{2})(\/|$)/);
    if (match) return match[1];
  }
  // 3. Fallback
  return options?.defaultLocale || "en";
}

// Detect locale in the browser (CSR)
export function detectBrowserLocale(defaultLocale = "en"): string {
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language.split("-")[0];
  }
  return defaultLocale;
}
