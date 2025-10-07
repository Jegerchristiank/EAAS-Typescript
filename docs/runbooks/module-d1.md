# Runbook – D1 Metode & governance

Denne runbook beskriver, hvordan governance-modulet (D1) anvendes til at dokumentere CSRD/ESRS-metoder og udlede en samlet governance-score.

## Formål

- Dokumentere hvilket konsolideringsprincip og Scope 2-metode organisationen rapporterer efter.
- Vise status på Scope 3-screening og datakvalitet i én samlet governance-score.
- Indsamle kvalitative beskrivelser af væsentlighedsanalyse, strategi, governance, impacts/risici/muligheder og mål/KPI’er, så compliance- og ESG-teams arbejder ud fra samme beslutningsgrundlag.

## ESRS 2 datapunkter og felttyper

| Tema | Datapunkter | Felttype |
| --- | --- | --- |
| Metodevalg | Konsolideringsprincip, Scope 2 metode, Scope 3 screening, datakvalitet | Select/checkbox |
| Strategi | Forretningsmodel, integration af bæredygtighed, robusthed/scenarier, stakeholderinddragelse, overordnet governance-sammendrag | Fritekst (2000 tegn) |
| Governance | Bestyrelsens tilsyn, direktionens ansvar, kompetencer & træning, incitamenter, politikker & kontroller, ESG-komité | Fritekst + checkbox |
| Impacts/risici/muligheder | Proces, prioriteringskriterier, integration i styring, handlingsplaner, værdikædedækning, analyserede tidshorisonter | Fritekst, select, flere checkboxe |
| Mål & KPI’er | Forankring af mål, status/fremdrift, om der findes kvantitative mål, liste over KPI’er (navn, KPI, enhed, baseline-år/-værdi, mål-år/-værdi, kommentarer) | Fritekst, checkbox, gentagelig sektion med tekst- og talfelter |

## Arbejdsgang i UI

1. Navigér til `/wizard` og vælg governance-sektionen.
2. Udfyld metodefelterne:
   - **Organisatorisk afgrænsning** – equity share, financial control eller operational control.
   - **Scope 2 metode** – location-based eller market-based.
   - **Scope 3 screening udført** – markér når alle 15 kategorier er vurderet.
   - **Datakvalitet** – primær, sekundær eller proxy.
3. Udfyld strategisektionen med beskrivelser af forretningsmodel, integration, robusthed og stakeholderinddragelse. Brug det samlede governance-felt til overblik over beslutningsprocesser.
4. Dokumentér governance-rollerne: bestyrelsens tilsyn, direktionens ansvar, kompetencer, incitamenter, politikker og om der findes et dedikeret ESG-udvalg.
5. Beskriv processen for impacts/risici/muligheder, angiv værdikædedækning og markér analyserede tidshorisonter.
6. Angiv om der findes kvantitative mål, beskriv forankring og status, og registrér relevante KPI’er (min. én række for at få delscore).
7. Preview-panelet viser governance-scoren (0-100), antagelser og forslag til forbedringer baseret på de indtastede oplysninger. Trace-listen viser delscorer for tekstfelter, værdikædedækning, tidshorisonter og KPI-setup.
8. Resultatet indgår i review-siden og PDF-rapporten på linje med Scope 1 og Scope 3-modulerne.

## Beregningslogik

- Metodevalgene (afgrænsning, Scope 2, Scope 3 screening, datakvalitet) scorer mellem 0 og 1.
- Strategi-, governance-, impact- og målsektionerne giver en gennemsnitlig tekstscore baseret på længde og detaljeringsgrad.
- Værdikædedækning, tidshorisonter, ESG-komité, kvantitative mål og antal meningsfulde KPI’er bidrager som separate deldimensioner.
- Scoren er gennemsnittet af alle deldimensioner multipliceret med 100 og afrundet til én decimal.
- Detaljerede tekstbeskrivelser (over 240 tegn) giver fuld score, kortere beskrivelser giver delscore og en anbefaling.
- Proxy-data, manglende Scope 3 screening, begrænset værdikædedækning, få tidshorisonter eller få KPI’er udløser målrettede advarsler.

## Kvalitetssikring

- `packages/shared/calculations/modules/runD1.ts` indeholder den fulde logik og spores i `runModule.spec.ts` med tre tests (neutral, delvis og fuld score).
- Schemaet i `packages/shared/schema` og UI-komponenten i `apps/web/features/wizard/steps/D1.tsx` sikrer konsistent validering.
- Vitest, lint, typecheck og build skal være grønne før release.

## Videreudvikling

- Governance-scoren kan eksporteres via `@org/shared` og anvendes i dashboards eller rapporter.
- Fremtidige iterationer kan udvide modulet med dokumentupload eller kobling til revisionsplaner.
