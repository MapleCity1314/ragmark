# AGENTS.md

## Monorepo

- **Package manager:** pnpm (v9.0.0), enforced in `package.json` `packageManager` field
- **Build orchestration:** Turborepo v2, configured in `turbo.json`
- **Workspace layout:** `apps/*` and `packages/*`
- **Shared configs:** `@ragmark/eslint-config` (packages/eslint-config), `@ragmark/typescript-config` (packages/typescript-config)

## Commands

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start dev server(s) (turbo runs all `dev` tasks) |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages and apps |
| `pnpm check-types` | Typecheck all packages and apps |
| `pnpm test` | Run all tests with Vitest |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm format` | Format all source files with Prettier |
| `pnpm exec turbo <task> --filter=<pkg>` | Run a turbo task scoped to a single package |

Build depends on `^build` (upstream packages build first), lint on `^lint`, check-types on `^check-types`, test on `^build`. Dev has caching disabled and is persistent.

## Toolchain

- **Node:** `>=18`
- **TypeScript:** 5.9.2 — use `@ragmark/typescript-config` as base for per-package tsconfigs (exports: `base.json`, `nextjs.json`, `react-library.json`)
- **Linter:** ESLint 9 flat config — use `@ragmark/eslint-config` as base (exports: `./base`, `./react`)
- **Formatter:** Prettier (`prettier --write "**/*.{ts,tsx,md}"`)
- **Test:** Vitest 4 with workspace config (`vitest.workspace.ts` covers `packages/*` and `apps/*`)

## Naming conventions

- **Scope:** All packages use `@ragmark/` prefix (e.g. `@ragmark/ui`, `@ragmark/utils`)
- **Apps** go under `apps/` (e.g. `@ragmark/web`, `@ragmark/docs`)
- **Shared packages** go under `packages/` (e.g. `@ragmark/eslint-config`, `@ragmark/typescript-config`)

## Adding a new package

1. Create directory under `apps/` or `packages/`
2. Add `package.json` with workspace-scoped name:

```json
{
  "name": "@ragmark/<name>",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "lint": "eslint .",
    "check-types": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "@ragmark/eslint-config": "workspace:*",
    "@ragmark/typescript-config": "workspace:*",
    "vitest": "workspace:*"
  }
}
```

3. `tsconfig.json`:

```json
{
  "extends": "@ragmark/typescript-config/base.json",
  "include": ["."],
  "exclude": ["node_modules", "dist"]
}
```

Variants: `base.json` (generic TS), `nextjs.json` (Next.js app), `react-library.json` (React component lib).

4. `eslint.config.js`:

```js
import baseConfig from "@ragmark/eslint-config/base";

export default [...baseConfig, { ignores: ["dist/"] }];
```

For React packages, extend `@ragmark/eslint-config/react` instead.

5. Run `pnpm install` from root (symlinks packages automatically)

## Agent skills

This repo has agent skills installed under `.agents/skills/`. To update or install skills, use the OpenCode CLI. The lock file is at `skills-lock.json`.
