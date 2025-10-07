# AI Guide

Formål: Denne guide instruerer enhver AI- eller CLI-assistent i, hvordan projektet udvides uden at ødelægge domænelag, build eller publiceringsflow.

Principper
• Stabilitet vejer tungere end “smarte” one-liners. Alt skal være deterministisk.
• Domænelaget i packages/shared må ikke kende til Next.js.
• Al IO og lagring er klientside. Ingen serverstat.
• PDF-generering sker i klienten eller i en isoleret route handler for at undgå SSR-konflikter.
• Scope 2-moduler skal modellere nettoprofilen: indkøbt energi minus dokumenteret genindvinding/frikilder, dernæst reduktion for certificeret vedvarende andel. Enhederne er konsekvent kWh og resultatet udtrykkes i ton CO2e.

Mappekompas
• apps/web: UI, routing, wizard, storage, PDF-download UI.
• packages/shared: schemaer, typer, beregninger, pdf-komponent.
• packages/tooling: csv→schema og csv→formel-map.
• tooling: repo-scripts til lint, typecheck, codegen.
• .github/workflows: CI-pipelines, evt. publish.

Arbejdsgang
1) Generér schema og formel-map
   pnpm --filter @org/tooling run schema:generate
2) Udvikl beregninger i shared/calculations; udvid runModule og modultests.
3) Udbyg wizard-felter ved at læse schemaet dynamisk; valider med zod.
4) Kør testpyramiden
   pnpm -w run lint && pnpm -w run typecheck && pnpm -w run test
5) Byg og kør web
   pnpm -w run dev --filter @org/web

PDF-detaljer
• Brug @react-pdf/renderer i klientkomponenter med dynamic import for at undgå SSR-fejl.
• Snapshot-test PDF buffer via vitest. Hash buffer for determinisme.

GitHub Packages (npm)
• Repository-root .npmrc:
  @org:registry=https://npm.pkg.github.com
  //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
• I pakker der skal publiceres:
  "publishConfig": { "registry": "https://npm.pkg.github.com" }
• CI-publish sker kun efter grøn test. Tokens injiceres via secrets. Ingen tokens i koden.
• Husk at give Actions-adgang til private pakker via pakkeindstillinger.

Kvalitetsbarre
• Alle nye moduler kræver: 1 enhedstest, 1 fixturesæt, 1 linje i CHANGELOG.
• UI-ændringer kræver 1 Playwright-scenarie.
• Ingen advarsler i build. 0 lint-fejl. 0 any.

Erfaringer
• ModuleInput er typet via et index signature. Brug bracket notation (`state['B7']`) fremfor dot-notation for modulnøgler i UI og beregninger for at undgå TypeScript-fejl.
• Scope 2-reduktioner som B7 må returnere negative værdier; UI bør formidle at negative tal repræsenterer reduktioner fremfor udledninger.
• B8 fratrækker eksporteret strøm fra egenproduktionen før kvalitetsjustering; informer brugeren hvis eksporten overstiger produktionen.
• README-links til modulreferencer skal enten dække alle aktive moduler eller pege på oversigtsmappen (`docs/modules`) for at undgå ufuldstændige lister.


Fejltyper vi kender
• SSR og @react-pdf/renderer: løses med dynamic import eller route handler.
• pnpm publish mod forkert registry: tjek publishConfig og .npmrc i pakke og root.
• NPM-auth: brug env-variabel i CI. Ingen .env indlæsning i npm.
• Merge-konflikter: GitHub accepterer ikke filer med `<<<<<<<`/`=======`/`>>>>>>>`. Ryd altid markørerne og bekræft med `rg '<<<<<<<'` før commit.

## 2024-UI-v4 opdatering

### Ændrede filer og formål
• `apps/web/styles/design-system.css`: fælles designsystem med spacing-, farve- og komponentklasser brugt på tværs af appen.
• `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/features/wizard/WizardShell.tsx`: opdateret layout til at bruge designsystemet samt forbedret navigation/landing.
• `apps/web/components/ui/PrimaryButton.tsx`: knappen er nu klasse-baseret med ghost-variant, så knapper deler styling.
• `apps/web/features/wizard/steps/B1.tsx` – `B6.tsx`: scope 2-formularer har inline-hjælp, validering, designsystem-klassser og opdaterede summaries.
• `apps/web/features/wizard/useWizard.ts`: autosave er debounced og persistensen sikres ved `beforeunload`.
• `apps/web/app/(review)/review/page.tsx` og `apps/web/features/pdf/ReportPreviewClient.tsx`: review-siden viser sekundære moduler, bruger designsystemet og indlejrer PDF-preview.
• `apps/web/src/modules/wizard/*.tsx`: virksomhedsprofilen styrer hvilke moduler der er aktive i wizard-navigationen.

### Sådan fortsætter du arbejdet
• Genbrug `ds-*`-klasserne og PrimaryButton-varianten i nye UI-komponenter for konsistens.
• Når andre modultrin skal redesignes, brug B1–B6 som reference for valideringsmønster og hjælpetekster.
• Overvej at udvide designsystemet med flere util-klasser i `design-system.css` frem for at bruge inline-styles.
• Hvis yderligere validering skal tilføjes, kan `TouchedMap`-mønstret fra B1–B6 genbruges og udvides til komplekse trin.

### Tests og builds
• Kør `pnpm --filter @org/web build` for at validere lint, typer og Next build.
• Kør `pnpm --filter @org/web test` for at køre UI- og komponenttests.

### Virksomhedsprofil (PreWizardQuestionnaire)
• Fil: `apps/web/src/modules/wizard/PreWizardQuestionnaire.tsx`  
• Formål: Identificere relevante ESG-moduler via ja/nej-spørgsmål  
• Output: `wizardProfile` (lagret i localStorage)  
• Bruges i: `WizardOverview.tsx` (filtrering af moduler)  
• Design: Bruger eksisterende komponenter fra `@org/shared` og `design-system.css`  
• Test: `pnpm --filter @org/web build && pnpm --filter @org/web test`

