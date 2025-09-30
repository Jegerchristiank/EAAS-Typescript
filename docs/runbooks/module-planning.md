# Planlægningsrunbook – kommende ESG-moduler

Denne runbook beskriver, hvordan planlægningsmodulerne (Scope 3 C10–C15 samt governance-modulet D1) bruges frem til de fulde
beregninger leveres.

## Formål

- Skab transparens om dataejere, datakilder og forventet go-live for kommende moduler.
- Sikr at governance-krav fra CSRD/ESRS dokumenteres parallelt med Scope 1- og Scope 3-udvidelserne.
- Udeluk planlægningsdata fra rapporter, indtil beregningerne er implementeret.

## UI-arbejdsgang

1. Navigér til `/wizard` og vælg det relevante planlægningsmodul i Scope 3- eller Governance-sektionerne.
2. Udfyld felterne:
   - **Dataansvarlig** – navn eller rolle på det team, der ejer data og governance.
   - **Primære datakilder** – hvilke systemer eller processer der skal integreres.
   - **Planlagt go-live kvartal** – forventet kvartal for fuld beregning (fx Q2 2026).
   - **Noter** – supplerende kontekst, blokeringer eller afhængigheder.
3. Oplysningerne autosaves til lokal storage og indgår i review-siden som stubberegninger (markeret med "Planlagt").

## Rapportering

- Planlægningsmoduler returnerer værdien `0` med enheden `n/a` og antagelsen "Stubberegning".
- PDF-downloaden filtrerer automatisk planlægningsmoduler væk, så de ikke påvirker eksisterende rapporter.
- Review-siden markerer tydeligt, at C10–C15 og D1 endnu ikke har beregningslogik.

## Dataudtræk og videreudvikling

- Shared-pakken eksponerer `PlanningModuleInput`-typen, som kan bruges til at etablere backend- eller rapportintegrationer, hvis
  planlægningsdata skal eksporteres.
- Når beregningslogikken er klar, erstattes stubberegningen i `runModule` for det pågældende modul med den faktiske
  beregningsfunktion. UI-komponenten kan genbruges og udbygges med kvantitative felter.
- Formel- og schema-map er opdateret med de nye modulnøgler, så `@org/tooling` kan generere opdaterede artefakter uden manuel
  opdatering.

## Governance for D1

- Brug D1-planlægningsmodulet til at registrere ansvarlige for ESG-governance, status på politikker og næste revision.
- Kombinér felterne med organisationens compliance-planer for at sikre, at CSRD/ESRS-krav er forankret inden beregningslogik
  implementeres.

## Kvalitetssikring

- Vitest indeholder enhedstest, der sikrer, at planlægningsmodulerne markeres som stubberegninger og ikke påvirker aggregater.
- Playwright-scenariet `wizard.spec.ts` dækker navigationen til både planlagte og aktive moduler.
- Lint, typecheck og build skal fortsat være grønne før release af beregningslogikken.
