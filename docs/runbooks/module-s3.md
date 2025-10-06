# Runbook – S3 arbejdsmiljø & hændelser

Modulet aggregerer arbejdsmiljøhændelser, arbejdstimer og certificering for at producere en social sikkerhedsscore (0-100).

## Inputfelter

- **Total arbejdstimer** – arbejdstimer i rapporteringsåret.
- **Arbejdsmiljøcertificering** – ISO 45001 eller tilsvarende.
- **Hændelsesliste** – type (fatalitet, lost time, recordable, near miss), antal, rate pr. million timer og root cause status.
- **Narrativ opfølgning** – tekst om læring og forebyggelse.

## Beregningsoverblik

1. Hver hændelse vægtes: fatalitet (45), lost time (18), recordable (8). Near miss giver -2 (incitament for rapportering).
2. Total penalty normaliseres pr. million timer (baseline 3 hændelser/mio. timer) og konverteres til score 0-100.
3. ISO 45001 giver +10 bonuspoint, uden at overstige 100.
4. Warnings udsendes ved fataliteter, manglende rodårsagslukning eller høje hændelsesrater.

## QA og test

- Unit-testen `runS3` i `runModule.spec.ts` dækker certificeret scenarie og kontrollerer trace/warnings.
- `S3Step` UI stiller input for både kvantitative tal og narrativer.
- Nye hændelsestyper kræver opdatering af `s3IncidentTypeOptions`, schema og run-modulet.
