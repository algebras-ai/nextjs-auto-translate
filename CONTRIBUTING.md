# Contributing

This repo is split into source (`src/`) and compiled output (`dist/`). Please edit `src/` only.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
```

## Commands

- Build:

```bash
npm run build
```

- Tests:

```bash
npm run test
npm run test:watch
```

- Format:

```bash
npm run format
npm run format:check
```

## Repository structure

### Source of truth vs output

- `src/`: TypeScript source (edit here)
- `dist/`: generated output (built by `npm run build`)

### Key code paths

- `src/index.ts`
  - Next.js plugin entry point
  - Kicks off parsing + dictionary generation
  - Configures Webpack loader + Turbopack transformer

- `src/parser/`
  - JSX/TSX parsing and scope extraction

- `src/translator/`
  - Dictionary generation
  - Translation provider(s), including Algebras AI provider

- `src/runtime/`
  - Server runtime: `runtime/server/IntlWrapper.tsx` loads `dictionary.json` from `outputDir`
  - Client runtime: provider + `Translated` + `LocaleSwitcher`

- `src/webpack/`
  - Webpack loader implementation

- `src/turbopack/`
  - Turbopack transformer implementation

- `src/storage/`
  - Helpers for saving/loading sources and dictionaries

- `src/data/`
  - Language map and related data

### Demo app

- `demo/next.js/`: Next.js example showing integration

Run it:

```bash
npm run build
cd demo/next.js
npm install
npm run dev
```

## Generated artifacts

The plugin writes artifacts into `outputDir` (default `./src/intl`). The runtime reads `dictionary.json` from that same directory (via `ALGEBRAS_INTL_OUTPUT_DIR`).

If you change generation paths, keep runtime loading in sync.

## Docs policy

- `README.md`: user docs (install + setup + config)
- `CONTRIBUTING.md`: repo structure + development workflow
