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

## Publishing

- Se [publish-runbooken](docs/runbooks/publishing.md) for hvordan du genererer en midlertidig `~/.npmrc`, når du skal udgive pakker.
- Almindelig udvikling kræver ingen GitHub Packages token længere; adgangen konfigureres kun under release.
