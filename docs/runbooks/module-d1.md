# Runbook – D1 Metode & governance

Denne runbook beskriver, hvordan governance-modulet (D1) anvendes til at dokumentere CSRD/ESRS-metoder og udlede en samlet governance-score.

## Formål

- Dokumentere hvilket konsolideringsprincip og Scope 2-metode organisationen rapporterer efter.
- Vise status på Scope 3-screening og datakvalitet i én samlet governance-score.
- Indsamle kvalitative beskrivelser af væsentlighedsanalyse og strategi, så compliance- og ESG-teams arbejder ud fra samme beslutningsgrundlag.

## Arbejdsgang i UI

1. Navigér til `/wizard` og vælg governance-sektionen.
2. Udfyld metodefelterne:
   - **Organisatorisk afgrænsning** – equity share, financial control eller operational control.
   - **Scope 2 metode** – location-based eller market-based.
   - **Scope 3 screening udført** – markér når alle 15 kategorier er vurderet.
   - **Datakvalitet** – primær, sekundær eller proxy.
3. Beskriv den seneste **væsentlighedsanalyse** og den gældende **strategi, målsætninger og politikker**.
4. Preview-panelet viser governance-scoren (0-100), antagelser og forslag til forbedringer baseret på de indtastede oplysninger.
5. Resultatet indgår i review-siden og PDF-rapporten på linje med Scope 1 og Scope 3-modulerne.

## Beregningslogik

- Hver dimension (afgrænsning, Scope 2 metode, screening, datakvalitet, væsentlighed, strategi) scorer mellem 0 og 1.
- Scoren er gennemsnittet af de seks dimensioner multipliceret med 100 og afrundet til én decimal.
- Detaljerede tekstbeskrivelser (over 240 tegn) giver fuld score, kortere beskrivelser giver delscore og en anbefaling.
- Proxy-data og manglende Scope 3 screening udløser advarsler, så governance-planen kan prioriteres.

## Kvalitetssikring

- `packages/shared/calculations/modules/runD1.ts` indeholder den fulde logik og spores i `runModule.spec.ts` med tre tests (neutral, delvis og fuld score).
- Schemaet i `packages/shared/schema` og UI-komponenten i `apps/web/features/wizard/steps/D1.tsx` sikrer konsistent validering.
- Vitest, lint, typecheck og build skal være grønne før release.

## Videreudvikling

- Governance-scoren kan eksporteres via `@org/shared` og anvendes i dashboards eller rapporter.
- Fremtidige iterationer kan udvide modulet med dokumentupload eller kobling til revisionsplaner.
