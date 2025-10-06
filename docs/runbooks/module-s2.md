# Runbook – S2 diversitet & ligestilling

Modulet samler kønsbalancer, løngab og narrative indsatser. Resultatet viser en social score (0-100), hvor paritet, datadækning
og politikker vægtes.

## Inputfelter

- **Datadækning (%)** – andel af arbejdsstyrken med registreret diversitetsdata.
- **Formel ligestillingspolitik** – ja/nej/ikke angivet.
- **Kønsfordeling pr. niveau** – liste over niveauer med procentfordeling, løngab og optional narrativ.
- **Narrativ beskrivelse** – tekst om initiativer, pipeline og barrierer.

## Beregningsoverblik

1. Paritetsscore (60 %) beregnes som gennemsnit af niveauers afvigelse fra 50/50 (nul score ved ±20 procentpoint).
2. Datadækning (20 %) normaliseres 0-100 %.
3. Politikscore (20 %) belønner formaliseret ligestillingspolitik og giver baseline-score for "ikke angivet".
4. Warnings udsendes ved lave datadækninger, store afvigelser (>10 procentpoint) eller løngab over 5 %.

## QA og test

- Unit-testen `runS2` i `runModule.spec.ts` dækker et scenarie med høj score og kontrollerer warnings.
- `S2Step` i webappen understøtter tabelformular med flere niveauer, pay gap og narrativer.
- Schema-validering ligger i `s2InputSchema` og JSON schema, så nye felter skal opdateres begge steder.
