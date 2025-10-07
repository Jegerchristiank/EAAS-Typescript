# AGENT INSTRUKTIONER

## Formål
Denne fil opsummerer de vigtigste arbejdsgange og faldgruber for dette monorepo. Læs den før du skriver kode og tjek om underkataloger har deres egne `AGENTS.md`-filer.

## Arkitektur
- Monorepo styret af pnpm/turbo. Arbejd i apps og packages uden at bryde domænegrænser.
- `apps/web`: Next.js-appen med wizard UI, PDF-preview og designsystem.
- `packages/shared`: Schemaer, typer, beregninger, PDF-komponenter. **Må ikke kende til Next.js.**
- `packages/tooling`: Scripts til at generere schema og formel-map fra CSV.
- `tooling/`: Repo-scripts (lint, typecheck, codegen).

## Centrale principper
- Prioritér stabilitet og determinisme. Undgå “smarte” one-liners der gør logik uforudsigelig.
- Al IO og persistens sker i klienten; ingen servertilstand.
- PDF-generering foregår i klienten eller i en isoleret route handler. Brug `dynamic` import af `@react-pdf/renderer` i Next.
- Scope 2-moduler modellerer nettoprofilen: indkøbt energi minus dokumenteret genindvinding/frikilder, dernæst reduktion for certificeret vedvarende andel. Enhed: kWh; output i ton CO2e.
- UI-moduler må forvente negative tal for reduktioner og skal forklare brugeren hvorfor.

## Arbejdsgang for nye features
1. Generér schema og formel-map: `pnpm --filter @org/tooling run schema:generate`.
2. Udvikl beregninger i `packages/shared/calculations`, udvid `runModule` og tilhørende tests/fixtures.
3. Udbyg wizard-felter i `apps/web` baseret på schemaet. Brug Zod-validering og bracket notation til modulnøgler (`state['B7']`).
4. Kør testpyramiden: `pnpm -w run lint && pnpm -w run typecheck && pnpm -w run test`.
5. Valider web-appen med `pnpm --filter @org/web build`. Brug `pnpm --filter @org/web test` til komponent/UI-tests.

## Designsystem og UI
- `apps/web/styles/design-system.css` indeholder fælles `ds-*` util-klasser. Genbrug dem og `PrimaryButton`-varianten for konsistens.
- Wizard-trin B1–B6 er reference for valideringsmønster, hjælpetekster og autosave (`useWizard.ts`). Udvid `TouchedMap`-mønstret ved behov.
- Når der laves nye UI-moduler, sørg for Playwright-scenarier til at dække ændringer.

## Kvalitetskrav
- Hvert nyt modul kræver mindst én enhedstest, ét fixturesæt og én linje i `CHANGELOG.md`.
- Ingen lint-fejl, ingen TypeScript-`any`, ingen build-advarsler.
- PDF-tests bør hashe buffer-output for determinisme.

## CI og publicering
- npm-pakker udgives via GitHub Packages. Tjek `.npmrc` og `publishConfig` i relevante pakker.
- Ingen tokens i koden; brug miljøvariabler i CI.
- Sørg for at GitHub Actions har adgang til private pakker.

## Kendte fejl og løsninger
- SSR-konflikter med `@react-pdf/renderer`: brug `dynamic` import eller isoleret route handler.
- Forkert npm-registry ved publish: dobbelttjek `publishConfig` og `.npmrc`.
- NPM-auth issues: brug `GITHUB_TOKEN` i CI, ikke `.env`-filer.
- Merge-konflikter: fjern altid `<<<<<<<`/`=======`/`>>>>>>>`. Tjek med `rg '<<<<<<<'` før commit.

## Sidst men ikke mindst
- Dokumentér større ændringer i `CHANGELOG.md` og opdater `README`/`docs` ved behov.
- Hvis du er i tvivl om modulreference, peg på `docs/modules` fremfor en ufuldstændig liste.
- Dette er den eneste `AGENTS.md` i repoet. Opret en lokal fil hvis du tilføjer katalogspecifikke krav.
