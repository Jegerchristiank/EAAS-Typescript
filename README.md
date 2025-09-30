# EAAS-Typescript

ESG-as-a-Service (ESG reporting platform)

## Repository docs

- [Baseline quality metrics](docs/quality/baseline.md)
- [Architectural decision records](docs/adr)
- [Migrations](docs/migrations)
- [Runbooks](docs/runbooks)
- [Changelog](CHANGELOG.md)

## Development quickstart

- Install dependencies with `pnpm install`.
- Run the core quality gates locally via `pnpm -w run lint`, `pnpm -w run typecheck`, `pnpm -w run test` og `pnpm -w run build`.
- Format code with `pnpm run format` (or check via `pnpm run format:check`).
- CI kører de samme kvalitetskontroller på hver pull request.

## Moduloverblik

- Scope 2-modulerne B1–B11 er fuldt implementeret med beregninger, UI og tests.
- Scope 1-modulerne (A1–A4), Scope 3-udvidelserne (C10–C15) og governance-modulet D1 er tilføjet som planlægningssteps med
  schemaer, stubberegninger og UI, så dataejere og go-live-planer kan registreres inden beregningslogik leveres.

## Publishing

- Se [publish-runbooken](docs/runbooks/publishing.md) for hvordan du genererer en midlertidig `~/.npmrc`, når du skal udgive pakker.
- Almindelig udvikling kræver ingen GitHub Packages token længere; adgangen konfigureres kun under release.