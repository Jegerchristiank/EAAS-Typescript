# Runbook – S4 due diligence & menneskerettigheder

Modulet hjælper rådgivere med at dokumentere due diligence-processer, klagemekanismer og narrativer. Outputtet er en social
score (0-100) med fokus på dækning, risikoniveau og remediationsplaner.

## Inputfelter

- **Klagemekanisme** – ja/nej/ikke angivet.
- **Escalationstid (dage)** – behandlingstid for klager.
- **Procesliste** – område, dækning (%), seneste vurdering, risikoniveau, remediationsplan.
- **Narrativ due diligence** – tekst om governance, samarbejde og opfølgning.

## Beregningsoverblik

1. Dækning vægter 60 % (gennemsnit af coverage%).
2. Risiko vægter 20 %. Højrisiko uden plan udløser fuldt fradrag, med plan halvt fradrag; medium risiko giver mindre fradrag.
3. Klagemekanisme vægter 20 % – bonus for etableret mekanisme, baselinescore for "ikke angivet".
4. Warnings udsendes ved manglende processer, højrisiko uden plan samt manglende narrativer.

## QA og test

- Unit-testen `runS4` i `runModule.spec.ts` verificerer score og warnings for processer med og uden remediation.
- `S4Step` UI understøtter både kvantitative felter og narrative tekstfelter.
- Schema og JSON-schema (`s4InputSchema`) skal udvides ved nye felter.
