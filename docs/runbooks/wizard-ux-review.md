# Wizard flow UX kortlægning og designgrundlag

## 1. Centrale flows og nuværende pain points

### Landing page (`apps/web/app/page.tsx`)
- **Primær CTA-struktur** – To ligevægtede primærknapper ("Ny profil" og "Åbn seneste profil") konkurrerer om opmærksomheden og mangler hierarki for førstegangsanvendere, hvilket kan skabe tøven omkring næste skridt.【F:apps/web/app/page.tsx†L33-L63】
- **Informationsdensitet** – Introduktionsteksten fremhæver Scope 1-3 og governance i ét afsnit uden visuel støtte, hvilket kan opleves som kognitivt tungt for brugere der forventer en kort pitch af værdien.【F:apps/web/app/page.tsx†L52-L57】
- **Overblik over profiler** – `ProfileSwitcher` indlejres direkte på landing-siden, hvilket blander onboarding med avanceret administrationsfunktionalitet og kan virke overvældende ved første besøg.【F:apps/web/app/page.tsx†L78-L82】

### Wizard shell (`apps/web/features/wizard/WizardShell.tsx`)
- **Profil-afhængighed** – Hele modulet gates af profilstatus; manglende afslutning tvinger brugeren tilbage til spørgeskemaet via `isProfileOpen`, hvilket kan skabe loops hvis brugeren ønsker at inspicere moduler før færdiggørelse.【F:apps/web/features/wizard/WizardShell.tsx†L98-L140】
- **Anbefalingslogik** – `resolveRecommendedStepIndex` vælger første "ready" relevante modul, men fallback kan springe til første "ready" selvom intet er relevant, hvilket kan opleves som arbitrær navigation uden forklaring i UI'et.【F:apps/web/features/wizard/WizardShell.tsx†L73-L88】
- **Sidebar-kompleksitet** – Tre sektioner (Relevante moduler, Status, Modulfeedback) kombinerer chips, progressbar og noter; indholdet ændres samtidigt og kræver forklaring for nye brugere.【F:apps/web/features/wizard/WizardShell.tsx†L255-L343】
- **Handlinger i footer** – Navigationen tilbyder både "Næste" og "Næste relevante" (`NextRelevantButton`) uden kontekstuel guidance, hvilket kan skabe usikkerhed om forskellen på lineær vs. anbefalet progression.【F:apps/web/features/wizard/WizardShell.tsx†L382-L406】

## 2. Workshop-plan med forretning og compliance

**Formål:** Fastlægge succeskriterier for onboarding-flowet, afstemt mod regulatoriske krav.

**Agenda (2 timer):**
1. **Problem framing (20 min)** – Præsentér observerede pain points og forretningsmål.
2. **Regulatorisk mapping (25 min)** – Compliance afdækker nødvendige gating-krav og dokumentationsbehov.
3. **KPI co-creation (45 min)** – Breakout-session hvor grupper definerer mål som:
   - Tid fra landing til første relevante modul (målt i klik/minutter).
   - Andel af brugere der forstår statuskortet (målt via spørgeskema efter flowet).
   - Fuldførelsesrate af profilspørgeskemaet ved første forsøg.
4. **Prioritering og alignment (20 min)** – Afstem KPI-liste og ejerskab.
5. **Næste skridt (10 min)** – Aftal målemetoder (telemetri, surveys) og ansvarlige.

**Outputs:** Sign-off på KPI-liste, beslutning om telemetri-events, ansvarsmatrix.

## 3. Heuristisk evaluering og brugerrejse

| Heuristik | Observation | Referencer |
| --- | --- | --- |
| System status | Progressbar og chip-markeringer kræver forklaring, ellers uklart hvad "Anbefalet start" betyder. | `RelevantModuleGroup` + sidebar rendering.【F:apps/web/features/wizard/WizardShell.tsx†L255-L343】 |
| Match mellem system og virkelighed | Tekster taler om "Scope 1" m.m. uden kontekst for mindre modne virksomheder; landing mangler value proposition. | Landing intro + hero copy.【F:apps/web/app/page.tsx†L52-L57】 |
| Bruger kontrol | Forced profile completion begrænser fri navigation, kan skabe frustration ved udforskning. | `isProfileOpen` gating logik.【F:apps/web/features/wizard/WizardShell.tsx†L98-L140】 |
| Konsistens | Flere "Rediger profil" knapper (sidebar + header) med samme label men forskellig placering kan skabe tvivl om effekt. | Header og sidebar handlinger.【F:apps/web/features/wizard/WizardShell.tsx†L232-L366】 |

**Brugerrejse (første gangs bruger):**
1. **Ankomst** – Landingsside med to ligevægtede primærknapper; vælger "Ny profil".【F:apps/web/app/page.tsx†L33-L63】
2. **Profilspørgeskema** – Wizard åbner med spørgeskema; progression låst til færdiggørelse for at aktivere navigation.【F:apps/web/features/wizard/WizardShell.tsx†L98-L188】
3. **Sidebar feedback** – Efter svar opdateres relevanschips og status, men brugeren mangler guidance om hvad "Anbefalet start" betyder.【F:apps/web/features/wizard/WizardShell.tsx†L255-L343】
4. **Modulnavigation** – Brugeren møder "Forrige/Næste" og "Næste relevante" samtidig, potentielt uklar hvilket valg er bedst.【F:apps/web/features/wizard/WizardShell.tsx†L382-L406】
5. **Review** – Ikke beskrevet i koden; antages at foregå via `WizardOverview`-trinnene. Behov for eksplorativ test for at validere forståelse.

## 4. Designprincipper og sign-off plan

1. **Klarhed** – Hvert trin kommunikerer ét primært mål og fremhæver anbefalede handlinger; landing prioriterer én primær CTA ad gangen. Implementeres ved at separere onboarding fra profiladministration og tilføje mikrokopi om anbefalinger.
2. **Progression** – Visualisering af fremdrift og næste skridt skal være selvforklarende; "Næste relevante" skal kontekstualiseres og kobles til KPI for tid til første relevante modul.
3. **Differentierede handlinger** – Primær vs. sekundær actions skal være tydeligt hierarkiske (fx ghost vs. solid knapper), og gating logik skal kommunikere hvorfor en handling er låst.

**Sign-off plan:**
- Del designprincipperne samt observerede pain points i workshop-opfølgning.
- Få skriftlig accept fra produktleder, compliance lead og customer success på principperne før visuel ideation igangsættes.
- Dokumentér accept (dato, ansvarlig) i dette runbook-dokument og i kommende design briefs.
