# Runbook – B1 Scope 2 elforbrug

Denne runbook beskriver, hvordan modul B1 understøtter indsamling af eldata og beregner nettoemissioner for Scope 2.

## Formål

- Dokumentere indkøbt elektricitet, valgt emissionsfaktor og rapporteringsmetode.
- Udregne ton CO₂e ud fra kWh × emissionsfaktor uden særskilt reduktionsled.
- Give produkt- og assurance-teams et fælles referencepunkt for datakvalitet og sporbarhed.

## Arbejdsgang i UI

1. Navigér til `/wizard` og vælg Scope 2-sektionen.
2. Udfyld felterne for **Elforbrug**, **Emissionsfaktorkilde**, **Emissionsfaktor**, **Beregningsmetode** og **Dokumentationskvalitet** i [B1-step-komponenten](../../apps/web/features/wizard/steps/B1.tsx).
3. Brugere kan indtaste decimaltal med komma eller punktum; værdier normaliseres automatisk.
4. Resultatkortet viser netto ton CO₂e, antagelser, advarsler og teknisk trace, så data kan valideres før eksport.

## Beregningslogik

- Beregningen implementeres i [runB1-funktionen](../../packages/shared/calculations/modules/runB1.ts).
- `emissionsKg = consumptionKwh × emissionFactorKgPerKwh`.
- Ton CO₂e = `emissionsKg × 0,001`, afrundet efter `factors.b1.resultPrecision`.
- Manglende, negative eller ugyldige felter normaliseres til sikre standarder (0 eller standardfaktor) og udløser advarsler.
- Formlen dokumenteres i [ESG-formula-mappet](../../packages/shared/schema/esg-formula-map.json) og valideres af `b1InputSchema` i [schemasamlingen](../../packages/shared/schema/index.ts).

## Kvalitetssikring

- Inputtyper og begrænsninger er defineret i [`B1Input`-schemaet](../../packages/shared/schema/esg-input-schema.json) og eksporteres fra [schemaindekset](../../packages/shared/schema/index.ts).
- Modulresultatet testes sammen med andre moduler i [`runModule.spec.ts`](../../packages/shared/calculations/__tests__/runModule.spec.ts).
- Wizardtrinnet genbruger layoutet fra [`StepTemplate`](../../apps/web/features/wizard/steps/StepTemplate.tsx), hvilket reducerer risikoen for UI-regressioner og gør manuelle QA-tjek fra [baseline-guiden](../quality/baseline.md) hurtigere.
- Advarsler for manglende felter og andele over 100 % sikrer, at support hurtigt kan identificere datafejl.

## Videreudvikling

- Overvej at tilføje felt til timekorrelerede certifikater med egen reduktionssats.
- Suppler datafeeds fra energileverandørers API'er, så elforbrug kan indlæses automatisk.
- Udvid runbooken med konkrete datakilder og dokumentationskrav, når flere organisationer er onboardet.
