# Social moduler – S1, S2, S3, S4

Denne guide beskriver inputfelter og UI-flow for de sociale moduler i wizard-trinnene.

<a id="s1-headcount"></a>

## S1 – Arbejdsstyrke & headcount

- Formularen i `S1Step` indsamler årstal, total headcount og segmenterede rækker.
- Segmentkortene giver felt for segmentnavn, headcount, andel kvinder og kollektiv dækning.
- Narrative feltet bruges til kontekst og samarbejde med medarbejderrepræsentanter.

<a id="esrs-mapping"></a>

## ESRS S2–S4 datapunkter og felter

| ESRS datapunkt | Felter i formularen |
| -------------- | ------------------- |
| **S2-2.2** – Dækning af risikovurderinger | `valueChainCoveragePercent`, `highRiskSupplierSharePercent` |
| **S2-2.3** – Sociale audits | `socialAuditsCompletedPercent`, hændelseslisten `incidents` |
| **S2-5** – Arbejdsvilkår og klagemekanismer | `livingWageCoveragePercent`, `collectiveBargainingCoveragePercent`, `grievancesOpenCount`, `grievanceMechanismForWorkers` |
| **S3-2** – Konsekvensanalyser | `impactAssessmentsCoveragePercent`, `communitiesIdentifiedCount` |
| **S3-3** – Negative impacts og klager | `incidents` (lokalsamfund), `grievancesOpenCount` |
| **S3-5** – Afhjælpning | `remedyNarrative`, remedieringsstatus i `incidents` |
| **S4-2** – Risikovurdering af produkter | `productsAssessedPercent`, `issues` |
| **S4-3** – Klagehåndtering | `complaintsResolvedPercent`, `grievanceMechanismInPlace`, `escalationTimeframeDays` |
| **S4-4** – Datasikkerhedsbrud | `dataBreachesCount`, hændelser med `issueType = dataPrivacy` |
| **S4-5** – Alvorlige hændelser | `severeIncidentsCount`, `recallsCount`, `issues` |

> Øvrige datapunkter om mål og KPI’er (fx S2-6 og S4-6) håndteres via G1/E1-modulerne og er ikke en del af S2–S4-formularerne.

<a id="s2-vaerdikaede"></a>

## S2 – Værdikædearbejdere

- `S2Step` indsamler antal arbejdstagere, dækning af risikovurderinger og sociale audits.
- Incident-tabellen registrerer leverandører, hændelsestyper og remedieringsstatus for ESRS S2-kravene.
- To narrative felter dækker dialogprogrammer og kompensation/afhjælpning.

<a id="s3-lokalsamfund"></a>

## S3 – Lokalsamfund og påvirkninger

- Formularen giver tal for identificerede lokalsamfund, dækningsgrad af analyser og antal åbne klager.
- Hver påvirkning dokumenterer community, type, antal husholdninger og remediering.
- Narrativerne beskriver engagement (FPIC, dialog) og samarbejde om afhjælpning.

<a id="s4-forbrugere"></a>

## S4 – Forbrugere og slutbrugere

- `S4Step` samler risikovurderingsdækning, klagehåndtering, datasikkerhedsbrud og tilbagekald.
- Hændelseslisten håndterer produktsikkerhed, data-privacy m.m. med antal berørte brugere og status.
- Narrativerne fokuserer på støtte til udsatte brugergrupper og proaktivt engagement.
