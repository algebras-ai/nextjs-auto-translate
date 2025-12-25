import Navigation from '@/components/Navigation';
import LocaleSwitcher from '@dima-algebras/algebras-auto-intl/runtime/client/components/LocaleSwitcher';
import IntlWrapper from '@dima-algebras/algebras-auto-intl/runtime/server/IntlWrapper';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'String Rendering Patterns',
  description:
    'Demonstration of all string rendering patterns in React and Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <IntlWrapper>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Navigation />
          <LocaleSwitcher />
          <main>{children}</main>
        </body>
      </IntlWrapper>
    </html>
  );
}
