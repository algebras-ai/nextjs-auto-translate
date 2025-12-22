# Contributing

Thanks for contributing!

## Development

### Prerequisites

- Node.js + npm

### Install

```bash
npm ci
```

### Build

```bash
npm run build
```

### Format

```bash
npm run format
```

### Tests

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

## Project structure

### Package layout

```
nextjs-auto-translate/
├── src/                # Source (TypeScript)
├── dist/               # Build output (published)
├── scripts/            # Build-time utilities
├── tests/              # Vitest test suite
├── demo/               # Example Next.js apps
└── data/               # Language metadata
```

### Key source folders

- **`src/index.ts`**: Next.js plugin entry (wraps Next config and triggers generation)
- **`src/parser/`**: JSX/TSX parsing + extraction
- **`src/transformer/`**: AST/code injection helpers used by bundler integrations
- **`src/runtime/`**: Runtime providers/components (`IntlWrapper`, `Translated`, `LocaleSwitcher`)
- **`src/translator/`**: Dictionary generation + translation providers
- **`src/webpack/`** and **`src/turbopack/`**: Bundler integrations

## Notes

- Generated runtime artifacts for a consuming app are written into its configured `outputDir` (see README). This folder also holds internal scheduling/lock files used to avoid concurrent parsing.
