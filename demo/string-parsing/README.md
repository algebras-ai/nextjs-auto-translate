This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Description

This project serves as a comprehensive test suite for string rendering scenarios through React components. It is designed to validate the functionality of the [`@nextjs-auto-translate`](../../README.md) package by testing various patterns of how strings can be rendered and displayed in React and Next.js applications.

The goal is to modernize this project using the `@nextjs-auto-translate` package so that all content is properly translated and internationalized. Each scenario directory contains test cases for different string rendering patterns that should be handled by the translation system.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Test Scenarios

The following scenarios need to be tested and modernized with `@nextjs-auto-translate`:

- [✅] **Root Page** (`app/page.tsx`) - Main landing page with scenario overview
- [✅] **1. Direct Rendering** (`app/1-direct-rendering/page.tsx`) - JSXText between tags (visible text)
- [✅] **2. Expressions** (`app/2-expressions/page.tsx`) - JSXExpressionContainer with various expression types returning strings
- [✅] **3. Visible Attributes** (`app/3-visible-attributes/page.tsx`) - JSXAttribute with title, alt, aria-label, aria-describedby, aria-placeholder and other accessibility attributes
- [✅] **4. Components** (`app/4-components/page.tsx`) - Through props and children that render visible text
- [✅] **5. Functions** (`app/5-functions/page.tsx`) - Through function calls returning strings for display
- [✅] **6. Conditional Logic** (`app/6-conditional-logic/page.tsx`) - Through ternary operators and logical expressions returning strings
- [✅] **7. Loops** (`app/7-loops/page.tsx`) - Through map, forEach and other array methods rendering strings
- [ ] **8. Next.js Specifics** (`app/8-nextjs-specifics/page.tsx`) - Metadata (title, description), Server/Client Components
- [✅] **9. Forms** (`app/9-forms/page.tsx`) - Placeholder, value, label text, button text, option text
- [✅] **10. Special Cases** (`app/10-special-cases/page.tsx`) - Portals, Suspense fallback, Error Boundary

> **Note:** Please update this checklist as you progress with implementing translations for each scenario.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
