# EAAS-Typescript

ESG-as-a-Service (ESG reporting platform)

## Repository docs

- [Baseline quality metrics](docs/quality/baseline.md)
- [Architectural decision records](docs/adr)
- [Migrations](docs/migrations)
- [Runbooks](docs/runbooks)
- [Changelog](CHANGELOG.md)
- [Modulreferencer](docs/modules)

## Development quickstart

- Install dependencies with `pnpm install`.
- Run the core quality gates locally via `pnpm -w run lint`, `pnpm -w run typecheck`, `pnpm -w run test` og `pnpm -w run build`.
- Format code with `pnpm run format` (or check via `pnpm run format:check`).
- CI kører de samme kvalitetskontroller på hver pull request.

## Moduloverblik

- Scope 2-modulerne B1–B11 er fuldt implementeret med beregninger, UI og tests.
- Scope 1-modulerne A1–A4 er implementeret med dynamisk brændsels-, proces- og kølemiddelregistrering, beregninger og UI.
- Scope 3-modulerne C10–C15 er implementeret med schema, beregning, UI og tests, så upstream/downstream aktiver, franchising, investeringer, behandling og øvrige screeningskategorier kan indberettes.
- Governance-modulet D1 beregner en governance-score på baggrund af organisatorisk afgrænsning, Scope 2-metode, Scope 3-screening, datakvalitet og strategibeskrivelser.

## Publishing

- Se [publish-runbooken](docs/runbooks/publishing.md) for hvordan du genererer en midlertidig `~/.npmrc`, når du skal udgive pakker.
- Almindelig udvikling kræver ingen GitHub Packages token længere; adgangen konfigureres kun under release.