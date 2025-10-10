# AGENT INSTRUKTIONER

## Formål
Denne fil opsummerer de vigtigste arbejdsgange og faldgruber for dette monorepo. Læs den før du skriver kode og tjek om underkataloger har deres egne `AGENTS.md`-filer.

> **Meta-instruktion:** Gem ALTID nye erfaringer, faldgruber og rettelser i dette dokument (eller i mere specifikke `AGENTS.md`-filer). Brug sektionen _"Erfaringslog"_ til at logge læringer fra tidligere prompts, reviews og fejl.

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
- GitHub CI-testene må ikke brydes; kør altid hele pipelinesættet (`pnpm -w run lint && pnpm -w run typecheck && pnpm -w run test && pnpm -w run build`) lokalt inden aflevering.
- Efter hver prompt-udførelse skal der tages et skærmbillede af den kørende webapplikation til dokumentation.

## CI og publicering
- npm-pakker udgives via GitHub Packages. Tjek `.npmrc` og `publishConfig` i relevante pakker.
- Ingen tokens i koden; brug miljøvariabler i CI.
- Sørg for at GitHub Actions har adgang til private pakker.

## Kendte fejl og løsninger
- SSR-konflikter med `@react-pdf/renderer`: brug `dynamic` import eller isoleret route handler.
- Forkert npm-registry ved publish: dobbelttjek `publishConfig` og `.npmrc`.
- NPM-auth issues: brug `GITHUB_TOKEN` i CI, ikke `.env`-filer.
- Merge-konflikter: fjern altid `<<<<<<<`/`=======`/`>>>>>>>`. Tjek med `rg '<<<<<<<'` før commit.

## Erfaringslog & før-du-koder-tjekliste
- **Læs dokumentation først:** Start med `README.md`, `AI_GUIDE.md`, `docs/` og denne fil for at forstå domæne og eksisterende mønstre.
- **Søg efter nested `AGENTS.md`:** Kør `rg --files -g 'AGENTS.md'` før større ændringer for at fange katalogspecifikke regler.
- **Opdater dette dokument:** Efter hver opgave, log nye faldgruber, teststrategier eller reviewer-feedback her.
- **Hold styr på arbejdskontekst:** Notér hvis en opgave kræver koordinering på tværs af apps/packages – brug sektionen ovenfor til at linke til relevante filer eller scripts.
- **Dokumentér partial work:** Hvis du må afbryde arbejdet, beskriv status, TODOs og kendte problemer i PR-beskrivelsen og herunder.
- **Testdisciplin:** Når du finder en test der fejler pga. flaky setup, beskriv root cause og workaround i denne log.
- **Respekter globale prompts:** Følg altid seneste system-/brugerkrav (fx citations, PR-format, commit-regler) og skriv dem her, hvis de er relevante for fremtidige agenter.

_Seneste læringer:_
- 2024-XX-XX: Husk altid at inkludere meta-instruktion ovenfor og udvide denne log med ny viden fra prompts eller reviewer-kommentarer.
- 2025-XX-XX: CSRD/XBRL-eksporten kræver separate `duration`- og `instant`-kontekster når taksonomien markerer lager-tal (fx S1 headcount). Sørg for at testsne dækker begge konteksttyper efter ændringer i ESRS-mapningen.
- 2025-02-14: TypeScript kører med `exactOptionalPropertyTypes`; undgå at sætte `undefined` på optionelle felter, eller udvid deres typer eksplicit når eksportere/taksonomiobjekter skal håndtere manglende `unitId`/`decimals` værdier.
- 2025-03-10: Next.js dev-server skal startes med `pnpm --filter @org/web dev --hostname 0.0.0.0 --port 3000` – ekstra `--` før flagene tolkes som stiargument og fejler.
- 2025-10-10: React-PDF `View`-stile kan ikke modtage `null` i array-sammensætning; brug conditionelle spreads eller dedikerede stilklasser til specialtilfælde som sidste række uden border for at undgå TypeScript-fejl.
- 2025-03-20: TypeScript infererer `Set`-typer snævert i tests; instantiér med `<string>` når ESRS-qnames matches dynamisk, ellers fejler `pnpm -w run typecheck` i CI.
- 2025-03-22: Når nye workspaces tilføjes (fx `apps/backend`), kør `pnpm install` inden lint/typecheck, ellers mangler de lokale `node_modules`-symlinks og ESLint finder ikke konfig-exporterne (`@org/eslint-config/base`).
- 2025-03-24: Hvis CI-lint/typecheck fejler med "ESLint couldn't find an eslint.config" i et workspace, kør `pnpm install` for at rehydrere pnpm-symlinks før du genkører `pnpm -w run lint && pnpm -w run typecheck && pnpm -w run test`.

## Sidst men ikke mindst
- Dokumentér større ændringer i `CHANGELOG.md` og opdater `README`/`docs` ved behov.
- Hvis du er i tvivl om modulreference, peg på `docs/modules` fremfor en ufuldstændig liste.
- Dette er den eneste `AGENTS.md` i repoet. Opret en lokal fil hvis du tilføjer katalogspecifikke krav.
