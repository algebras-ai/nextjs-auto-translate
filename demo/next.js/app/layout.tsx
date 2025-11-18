import type { Metadata } from "next";
import "./globals.css";

// Note: Once you add the autoIntl plugin to next.config.ts,
// IntlWrapper will be automatically injected here during build.
// You don't need to import it manually.

export const metadata: Metadata = {
  title: "Next.js 16 Example",
  description: "Example Next.js 16 project - add internationalization with algebras-auto-intl",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

