# Scope 1 modulreference

Denne reference beskriver inputfelter, standardantagelser og beregningslogik for Scope 1-modulerne i EAAS-platformen. Oversigten kan bruges af både produkt- og dataejere, når krav til dokumentation, validering og test skal afklares.

## A1 – Stationær forbrænding

### Inputfelter
- **Brændstoftype**: Naturgas, diesel, fyringsolie eller biogas med forudfyldte standardfaktorer og enheder.
- **Mængde**: Forbrug i liter, Nm³ eller kg afhængigt af valgt brændstof.
- **Emissionsfaktor**: Kilo CO₂e pr. enhed. Hvis feltet udelades, benyttes standardfaktoren for brændstoftypen.
- **Dokumentationskvalitet**: Procentværdi der angiver revisionssikkerheden for linjen.

### Beregning
- Hver linje normaliseres, så ukendte brændsler erstattes af naturgas og ugyldige enheder falder tilbage til standarden for brændstoftypen.
- Mængde og emissionsfaktor renses for negative værdier; manglende tal behandles som 0 og udløser advarsler.
- Emissioner beregnes som `mængde × emissionsfaktor`, summeres på tværs af linjer og konverteres til ton CO₂e med faktoren 0,001.
- Linjer med dokumentationskvalitet under 60 % får en eksplicit advarsel for at fremhæve behovet for bedre data.

### Output og sporbarhed
- Resultatfeltet er totalen i ton CO₂e afrundet til tre decimaler, og trace-listen dokumenterer input, beregnede kilo/ton samt aggregerede summer.

## A2 – Mobile kilder

### Inputfelter
- **Brændstoftype**: Benzin, diesel, biodiesel (B100) eller CNG med standardenheder og emissionsfaktorer.
- **Mængde**: Forbrug i liter eller kg i henhold til brændstoftypen.
- **Emissionsfaktor**: Kilo CO₂e pr. enhed, valgfri hvis standardfaktoren ønskes anvendt.
- **Distance**: Kilometer for intensitetstracking. Påvirker ikke selve emissionen.
- **Dokumentationskvalitet**: Procentværdi for revisionssikkerhed.

### Beregning
- Ukendte brændstoffer falder tilbage til diesel, og ugyldige enheder erstattes med brændstofspecifik standard.
- Mængde, emissionsfaktor, distance og dokumentationskvalitet renses for negative eller manglende værdier, og manglende indtastninger udløser advarsler når der er forsøg på input.
- Emissioner pr. linje beregnes som `mængde × emissionsfaktor` og konverteres til ton via 0,001. Distance summeres separat for intensitetsopfølgning.
- Hvis distance er oplyst, logges også kilo CO₂e pr. km i trace-listen, og dokumentationskvalitet under 60 % giver en advarsel.

### Output og sporbarhed
- Resultatet er samlede ton CO₂e afrundet til tre decimaler. Trace-listen inkluderer summer, kilometertal og eventuel flådeintensitet til videre analyser.

## A3 – Procesemissioner

### Inputfelter
- **Proces/kemisk aktivitet**: Cementklinker, kalkudbrænding, ammoniakproduktion eller primær aluminium.
- **Outputmængde**: Produceret ton materiale pr. linje.
- **Emissionsfaktor**: Kilo CO₂e pr. ton, valgfri hvis standardfaktoren ønskes anvendt.
- **Dokumentationskvalitet**: Procentværdi for revisionssikkerhed.

### Beregning
- Ukendte procesvalg falder tilbage til cementklinker, og mængder/faktorer valideres for at sikre ikke-negative værdier. Manglende tal registreres som 0 og udløser advarsler når der forsøges input.
- Emissioner pr. linje beregnes som `output × emissionsfaktor`, summeres og konverteres til ton CO₂e med faktoren 0,001.
- Dokumentationskvalitet under 60 % genererer en advarsel for den relevante proceslinje.

### Output og sporbarhed
- Modulet leverer total ton CO₂e afrundet til tre decimaler og sporer hver linjes inputs samt kilo- og tonresultater i trace-listen.

## A4 – Kølemidler og andre gasser (oversigt)

A4 er dokumenteret i forbindelse med den oprindelige implementering, men for fuldstændighedens skyld indgår her en kort opsummering:

- Input inkluderer kølemiddeltype, fyldning (kg), lækageprocent, GWP100 og dokumentationskvalitet.
- Lækageprocenten antager 10 % hvis feltet står tomt, og GWP-værdier hentes fra dropdown'en eller anvender brugerinput.
- Emissionen beregnes som `fyldning × lækageandel × GWP100` og konverteres til ton CO₂e via faktoren 0,001.
- Dokumentationskvalitet under 60 % resulterer i en advarsel ligesom i A1–A3.

Brugere kan krydstjekke de beskrevne antagelser med `runModule.spec.ts`, der dækker glade scenarier, fallback-advarsler og datavalidering for modulerne.
