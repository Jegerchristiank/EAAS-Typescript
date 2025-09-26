# AI Guide

Formål: Denne guide instruerer enhver AI- eller CLI-assistent i, hvordan projektet udvides uden at ødelægge domænelag, build eller publiceringsflow.

Principper
• Stabilitet vejer tungere end “smarte” one-liners. Alt skal være deterministisk.
• Domænelaget i packages/shared må ikke kende til Next.js.
• Al IO og lagring er klientside. Ingen serverstat.
• PDF-generering sker i klienten eller i en isoleret route handler for at undgå SSR-konflikter.

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

Fejltyper vi kender
• SSR og @react-pdf/renderer: løses med dynamic import eller route handler.
• pnpm publish mod forkert registry: tjek publishConfig og .npmrc i pakke og root.
• NPM-auth: brug env-variabel i CI. Ingen .env indlæsning i npm.

