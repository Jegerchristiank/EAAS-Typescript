# Social moduler – S1, S2, S3, S4

Denne guide beskriver inputfelter og UI-flow for de sociale moduler i wizard-trinnene.

<a id="s1-headcount"></a>

## S1 – Arbejdsstyrke & headcount

- Formularen i `S1Step` indsamler årstal, total headcount og segmenterede rækker.
- Segmentkortene giver felt for segmentnavn, headcount, andel kvinder og kollektiv dækning.
- Narrative feltet bruges til kontekst og samarbejde med medarbejderrepræsentanter.

<a id="s2-diversitet"></a>

## S2 – Diversitet & ligestilling

- `S2Step` understøtter toggle for ligestillingspolitik og datadækning.
- Hvert niveau har felter for kønsfordeling, løngab og narrative noter.
- Preview-kortet viser score og warnings i realtid.

<a id="s3-haendelser"></a>

## S3 – Arbejdsmiljø & hændelser

- Formularen giver input for arbejdstimer, certificering samt hændelsesliste.
- Hændelsestyper vælges fra `s3IncidentTypeOptions`; near miss giver kredit.
- Tekstfeltet bruges til at dokumentere læring og forebyggelse.

<a id="s4-due-diligence"></a>

## S4 – Due diligence & menneskerettigheder

- `S4Step` indsamler klagemekanisme, behandlingstid og processer.
- Hver proces har felter for område, dækning, vurdering, risikoniveau og remediationsplan.
- Narrativt felt beskriver governance, samarbejde og næste skridt.
