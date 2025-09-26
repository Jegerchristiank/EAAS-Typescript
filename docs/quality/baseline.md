# Baseline – February 2025

## Installation
- `pnpm install` succeeds with warnings about missing `GITHUB_TOKEN` and a broken lockfile that contains duplicated mapping keys for `next`. Install pulls ~540 packages and completes in ~50s.

## Lint
- `pnpm -w run lint` fails because `apps/web` relies on `next lint` with a `next.config.ts` file. Next 14.2.5 aborts linting when configuration is not provided via `.js` or `.mjs`.

## Typecheck
- `pnpm -w run typecheck` fails in `packages/tooling` due to merge artefacts inside `src/csv-to-schema.ts` that break TypeScript parsing.

## Tests
- `pnpm -w run test` fails in `packages/shared`. The Vitest suite cannot parse `calculations/__tests__/runModule.spec.ts` because duplicated comments/imports left from a merge introduce stray text.

## Build
- `pnpm -w run build` fails for the same `packages/tooling` TypeScript errors seen during typechecking.

## Notable Risks
- Repository lockfile is invalid, preventing deterministic installs.
- `.npmrc` enforces a GitHub token for all commands, spamming local workflows.
- Duplicate dependency keys exist in `apps/web/package.json`, causing Vite warnings during tests.
