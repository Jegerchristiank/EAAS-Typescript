'use client'

import type { ModuleId } from '@org/shared'

export type WizardProfileKey =
  | 'hasVehicles'
  | 'hasHeating'
  | 'hasIndustrialProcesses'
  | 'usesRefrigerants'
  | 'hasBackupPower'
  | 'hasOpenFlames'
  | 'hasLabGas'
  | 'usesElectricity'
  | 'usesDistrictHeating'
  | 'hasPpaContracts'
  | 'hasGuaranteesOfOrigin'
  | 'leasesWithOwnMeter'
  | 'exportsEnergy'
  | 'purchasesMaterials'
  | 'hasTransportSuppliers'
  | 'generatesWaste'
  | 'leasesEquipment'
  | 'shipsGoodsUpstream'
  | 'usesGlobalFreight'
  | 'hasConsultantsTravel'
  | 'purchasesElectronics'
  | 'producesProducts'
  | 'leasesProducts'
  | 'hasFranchisePartners'
  | 'providesCustomerServices'
  | 'hasProductRecycling'
  | 'shipsFinishedGoods'
  | 'usesLargeWaterVolumes'
  | 'hasIndustrialEmissions'
  | 'impactsNatureAreas'
  | 'managesCriticalMaterials'
  | 'hasInvestments'
  | 'ownsSubsidiaries'
  | 'operatesInternationalOffices'
  | 'hasEsgPolicy'
  | 'hasSupplierCode'
  | 'doesEsgReporting'
  | 'hasBoardOversight'
  | 'isIso14001Certified'
  | 'hasNetZeroTarget'
  | 'hasDataInfrastructure'
  | 'hasMaterialTopics'
  | 'hasMaterialRisks'
  | 'hasMaterialOpportunities'
  | 'hasCsrdGapAssessment'
  | 'hasTransitionPlan'
  | 'assessesClimateResilience'
  | 'tracksFinancialEffects'
  | 'hasRemovalProjects'

export type WizardProfile = Record<WizardProfileKey, boolean | null>

export const ALL_PROFILE_KEYS: WizardProfileKey[] = [
  'hasVehicles',
  'hasHeating',
  'hasIndustrialProcesses',
  'usesRefrigerants',
  'hasBackupPower',
  'hasOpenFlames',
  'hasLabGas',
  'usesElectricity',
  'usesDistrictHeating',
  'hasPpaContracts',
  'hasGuaranteesOfOrigin',
  'leasesWithOwnMeter',
  'exportsEnergy',
  'purchasesMaterials',
  'hasTransportSuppliers',
  'generatesWaste',
  'leasesEquipment',
  'shipsGoodsUpstream',
  'usesGlobalFreight',
  'hasConsultantsTravel',
  'purchasesElectronics',
  'producesProducts',
  'leasesProducts',
  'hasFranchisePartners',
  'providesCustomerServices',
  'hasProductRecycling',
  'shipsFinishedGoods',
  'usesLargeWaterVolumes',
  'hasIndustrialEmissions',
  'impactsNatureAreas',
  'managesCriticalMaterials',
  'hasInvestments',
  'ownsSubsidiaries',
  'operatesInternationalOffices',
  'hasEsgPolicy',
  'hasSupplierCode',
  'doesEsgReporting',
  'hasBoardOversight',
  'isIso14001Certified',
  'hasNetZeroTarget',
  'hasDataInfrastructure',
  'hasMaterialTopics',
  'hasMaterialRisks',
  'hasMaterialOpportunities',
  'hasCsrdGapAssessment',
  'hasTransitionPlan',
  'assessesClimateResilience',
  'tracksFinancialEffects',
  'hasRemovalProjects'
]

export function createInitialWizardProfile(): WizardProfile {
  return ALL_PROFILE_KEYS.reduce<WizardProfile>((profile, key) => {
    profile[key] = null
    return profile
  }, {} as WizardProfile)
}

export type WizardProfileQuestion = {
  id: WizardProfileKey
  label: string
  helpText: string
}

export type WizardProfileSection = {
  id: string
  heading: string
  description: string
  questions: WizardProfileQuestion[]
}

export const wizardProfileSections: WizardProfileSection[] = [
  {
    id: 'scope-1',
    heading: 'Scope 1 – Direkte emissioner',
    description: 'Identificer aktiviteter med direkte udledninger fra egne køretøjer og anlæg.',
    questions: [
      {
        id: 'hasVehicles',
        label: 'Har virksomheden egne køretøjer (firmabiler, varevogne, lastbiler, maskiner)?',
        helpText: 'Omfatter alle motordrevne køretøjer der ejes eller leases af virksomheden.',
      },
      {
        id: 'hasHeating',
        label: 'Har virksomheden eget varme- eller kedelanlæg (fx naturgas, olie, biogas)?',
        helpText: 'Stationære forbrændingskilder som fyr, kedler og ovne til opvarmning af bygninger.',
      },
      {
        id: 'hasIndustrialProcesses',
        label: 'Udfører virksomheden industrielle processer, der udleder gasser (cement, metal, kemi, fødevareproduktion)?',
        helpText: 'Processer med kemiske reaktioner eller høje temperaturer som frigiver CO₂ eller andre gasser.',
      },
      {
        id: 'usesRefrigerants',
        label: 'Anvendes der kølemidler eller andre flygtige emissioner (fx køleanlæg, aircondition, varmevekslere)?',
        helpText: 'Gælder også mindre anlæg som aircondition og kølediske med potentielle lækager.',
      },
      {
        id: 'hasBackupPower',
        label: 'Har virksomheden nødgeneratorer eller backupstrøm (diesel eller benzin)?',
        helpText: 'Reservedieselanlæg eller generatorer til nødstrøm ved strømafbrydelse.',
      },
      {
        id: 'hasOpenFlames',
        label: 'Har virksomheden produktion med åbne flammer, brændere eller svejsning?',
        helpText: 'Fx glas- og metalbearbejdning, svejseværksteder og andre højtemperaturprocesser.',
      },
      {
        id: 'hasLabGas',
        label: 'Har virksomheden laboratorieudstyr med gasforbrug?',
        helpText: 'Laboratorier og testfaciliteter med gasbrændere eller specialgasudstyr.',
      },
    ],
  },
  {
    id: 'scope-2',
    heading: 'Scope 2 – Indirekte energiforbrug',
    description: 'Kortlæg energiforbrug og dokumentationsmuligheder for indkøbt energi.',
    questions: [
      {
        id: 'usesElectricity',
        label: 'Forbruger virksomheden elektricitet i egne lokaler?',
        helpText: 'Fx kontorer, butikker, produktion eller datacentre med eget elforbrug.',
      },
      {
        id: 'usesDistrictHeating',
        label: 'Forbruger virksomheden fjernvarme, damp eller køling?',
        helpText: 'Indkøbt varme- og køleleverancer fra energiselskaber eller ejendomsforvaltning.',
      },
      {
        id: 'hasPpaContracts',
        label: 'Har virksomheden kontrakter på vedvarende energi (PPA’er – fysisk, virtuel eller time-matched)?',
        helpText: 'Power Purchase Agreements for direkte eller virtuel levering af grøn strøm.',
      },
      {
        id: 'hasGuaranteesOfOrigin',
        label: 'Har virksomheden dokumenteret vedvarende energi via oprindelsesgarantier?',
        helpText: 'Inkluderer køb af certifikater til at dokumentere grøn strøm.',
      },
      {
        id: 'leasesWithOwnMeter',
        label: 'Lejer virksomheden lokaler med eget elforbrug (separat elmåler)?',
        helpText: 'Fx kontorer i lejemål hvor virksomheden selv afregner elforbrug.',
      },
      {
        id: 'exportsEnergy',
        label: 'Eksporterer virksomheden selv energi (fx solceller, elproduktion)?',
        helpText: 'Salg af egenproduceret energi til nettet eller andre parter.',
      },
    ],
  },
  {
    id: 'scope-3-upstream',
    heading: 'Scope 3 – Upstream aktiviteter',
    description: 'Vurder emissioner i forsyningskæden før produkter eller ydelser forlader virksomheden.',
    questions: [
      {
        id: 'purchasesMaterials',
        label: 'Køber virksomheden råmaterialer eller halvfabrikata?',
        helpText: 'Inkluderer alt materialeindkøb til produktion, projekter eller salg.',
      },
      {
        id: 'hasTransportSuppliers',
        label: 'Har virksomheden leverandører med transportydelser?',
        helpText: 'Eksterne speditører, logistikpartnere eller transportleverandører.',
      },
      {
        id: 'generatesWaste',
        label: 'Genererer virksomheden affald fra produktion, kontor eller byggeprojekter?',
        helpText: 'Sorterede eller usorterede affaldsfraktioner fra den daglige drift.',
      },
      {
        id: 'leasesEquipment',
        label: 'Lejer virksomheden produktionsudstyr eller kontormaskiner?',
        helpText: 'Kort- eller langtidsleje af maskiner, køretøjer, kontorudstyr eller værktøj.',
      },
      {
        id: 'shipsGoodsUpstream',
        label: 'Transporterer virksomheden varer til kunder eller distributører?',
        helpText: 'Transport inden varerne når slutkunden, fx til distributionscentre.',
      },
      {
        id: 'usesGlobalFreight',
        label: 'Bruger virksomheden fragt, fly eller søtransport i forsyningskæden?',
        helpText: 'Internationale leverancer med fly, skib eller langdistance transport.',
      },
      {
        id: 'hasConsultantsTravel',
        label: 'Har virksomheden konsulenter eller underleverandører med arbejdsrejser?',
        helpText: 'Eksterne samarbejdspartnere der rejser på vegne af virksomheden.',
      },
      {
        id: 'purchasesElectronics',
        label: 'Køber virksomheden IT-udstyr eller elektronik regelmæssigt?',
        helpText: 'Computere, telefoner, netværksudstyr og andet elektronikindkøb.',
      },
    ],
  },
  {
    id: 'scope-3-downstream',
    heading: 'Scope 3 – Downstream aktiviteter',
    description: 'Forstå emissioner efter produktet forlader virksomheden, inkl. kunder og investeringer.',
    questions: [
      {
        id: 'producesProducts',
        label: 'Producerer eller sælger virksomheden fysiske produkter?',
        helpText: 'Produktion eller salg af varer med efterfølgende brug hos kunder.',
      },
      {
        id: 'leasesProducts',
        label: 'Lejer virksomheden produkter ud (leasing, udlejning, deleordninger)?',
        helpText: 'Produktudlejning hvor virksomheden beholder ejerskabet.',
      },
      {
        id: 'hasFranchisePartners',
        label: 'Har virksomheden franchisetagere eller partnere, der videresælger?',
        helpText: 'Franchise- eller partnernetværk med egen drift under virksomhedens brand.',
      },
      {
        id: 'providesCustomerServices',
        label: 'Tilbyder virksomheden service eller support til kundernes drift?',
        helpText: 'Serviceaftaler, vedligehold eller konsulentydelser efter salg.',
      },
      {
        id: 'hasProductRecycling',
        label: 'Har virksomheden genbrugs- eller affaldsaktiviteter relateret til produkter?',
        helpText: 'Tilbagekaldelse, take-back-ordninger eller produktgenanvendelse.',
      },
      {
        id: 'shipsFinishedGoods',
        label: 'Transporterer virksomheden færdige varer til kunder (downstream logistik)?',
        helpText: 'Distribution af færdige produkter til slutkunder eller forhandlere.',
      },
      {
        id: 'hasInvestments',
        label: 'Har virksomheden langsigtede investeringer, fonde eller finansielle aktiver?',
        helpText: 'Kapitalplaceringer med væsentlige klimarelaterede effekter.',
      },
      {
        id: 'ownsSubsidiaries',
        label: 'Er virksomheden medejer af datterselskaber med udledninger?',
        helpText: 'Delvist ejede selskaber eller joint ventures med driftsaktiviteter.',
      },
      {
        id: 'operatesInternationalOffices',
        label: 'Driver virksomheden kontorer i andre lande (rejser, transport, strøm)?',
        helpText: 'Udenlandske aktiviteter med rejser og faciliteter uden for hjemlandet.',
      },
    ],
  },
  {
    id: 'environment',
    heading: 'Miljø – Vand, forurening og ressourcer',
    description: 'Vurder om vand, emissioner, biodiversitet og materialeforbrug skal indgå i ESG-arbejdet.',
    questions: [
      {
        id: 'usesLargeWaterVolumes',
        label: 'Har virksomheden vandintensive processer eller anlæg i vandstressede områder?',
        helpText: 'Fx fødevareproduktion, kemi, elektronik eller aktiviteter i regioner med høj vandstress.',
      },
      {
        id: 'hasIndustrialEmissions',
        label: 'Har virksomheden væsentlige udledninger til luft, vand eller jord med myndighedskrav?',
        helpText: 'Gælder anlæg med miljøtilladelser, renseanlæg eller procesudledninger.',
      },
      {
        id: 'impactsNatureAreas',
        label: 'Påvirker aktiviteter naturbeskyttede områder eller kræver biodiversitetstiltag?',
        helpText: 'Fx infrastrukturprojekter, råstofudvinding eller landbrug tæt på Natura 2000-områder.',
      },
      {
        id: 'managesCriticalMaterials',
        label: 'Anvender virksomheden større mængder kritiske materialer eller metaller?',
        helpText: 'Fx elektronik, batterier, magneter eller andre materialer fra EU’s liste over kritiske råstoffer.',
      },
    ],
  },
  {
    id: 'double-materiality',
    heading: 'Dobbelt væsentlighed og CSRD-gap',
    description:
      'Kortlæg om virksomheden har identificeret væsentlige emner, risici/muligheder og status på CSRD-gaps.',
    questions: [
      {
        id: 'hasMaterialTopics',
        label: 'Har virksomheden en dokumenteret liste over væsentlige ESG-emner?',
        helpText:
          'Fx resultat af dobbelt væsentlighedsvurdering eller lignende prioriteringsøvelser.',
      },
      {
        id: 'hasMaterialRisks',
        label: 'Har virksomheden kortlagt de væsentligste risici (impact & finansielle)?',
        helpText:
          'Identificerede risici med scorer, sandsynlighed/påvirkning eller kvalitative vurderinger.',
      },
      {
        id: 'hasMaterialOpportunities',
        label: 'Har virksomheden kortlagt væsentlige muligheder og forretningspotentialer?',
        helpText:
          'Innovationsspor eller investeringer relateret til bæredygtighed, der kræver prioritering.',
      },
      {
        id: 'hasCsrdGapAssessment',
        label: 'Er der gennemført en CSRD-gap analyse med status på efterlevelse?',
        helpText:
          'Fx oversigt over krav, status (align/partial/gap) og planlagt opfølgning.',
      },
    ],
  },
  {
    id: 'governance',
    heading: 'Governance og rapportering',
    description: 'Vurdér modenhed i styring, målsætninger og rapporteringspraksis.',
    questions: [
      {
        id: 'hasEsgPolicy',
        label: 'Har virksomheden en skriftlig ESG- eller bæredygtighedspolitik?',
        helpText: 'Overordnede politikker eller strategier for ESG-indsatsen.',
      },
      {
        id: 'hasSupplierCode',
        label: 'Har virksomheden retningslinjer for leverandørstyring (Code of Conduct)?',
        helpText: 'Dokumenterede krav eller aftaler med leverandører om ansvarlig drift.',
      },
      {
        id: 'doesEsgReporting',
        label: 'Udfører virksomheden ESG-rapportering allerede (fx CSRD, GHG)?',
        helpText: 'Formelle rapporter eller offentliggørelser af ESG-nøgletal.',
      },
      {
        id: 'hasBoardOversight',
        label: 'Har virksomheden bestyrelse, CSR-ansvarlig eller ESG-udvalg?',
        helpText: 'Organisatorisk forankring af ESG-arbejdet i ledelsen.',
      },
      {
        id: 'isIso14001Certified',
        label: 'Er virksomheden ISO 14001- eller EMAS-certificeret?',
        helpText: 'Certificeringer for miljøledelsessystemer og løbende forbedringer.',
      },
      {
        id: 'hasNetZeroTarget',
        label: 'Har virksomheden et mål for CO₂-neutralitet eller energireduktion?',
        helpText: 'Officielle målsætninger for emissioner eller energiforbrug.',
      },
      {
        id: 'hasDataInfrastructure',
        label: 'Har virksomheden datainfrastruktur til rapportering (IT-systemer, API’er)?',
        helpText: 'Systemer og processer til indsamling af ESG-data på tværs af organisationen.',
      },
      {
        id: 'hasTransitionPlan',
        label: 'Har virksomheden en formaliseret klimatransitionsplan?',
        helpText: 'Planer med milepæle, investeringer og ansvarlige for at nå klimamål.',
      },
      {
        id: 'assessesClimateResilience',
        label: 'Arbejder virksomheden med scenarieanalyser eller klimamodstandsdygtighed?',
        helpText: 'Fx stresstest af forretningsmodel, klimatilpasning eller scenarievurderinger.',
      },
      {
        id: 'tracksFinancialEffects',
        label: 'Sporer virksomheden finansielle effekter af klimaindsatsen (CapEx/OpEx)?',
        helpText: 'Opfølgning på investeringer, omkostninger og indtægter relateret til klima.',
      },
      {
        id: 'hasRemovalProjects',
        label: 'Investerer virksomheden i removal-projekter eller klimakreditter?',
        helpText: 'Egne projekter, værdikædeinitiativer eller købte credits til udligning.',
      },
    ],
  },
]

const moduleDependencies: Partial<Record<ModuleId, WizardProfileKey[]>> = {
  A1: ['hasHeating', 'hasIndustrialProcesses', 'hasBackupPower', 'hasOpenFlames', 'hasLabGas'],
  A2: ['hasVehicles'],
  A3: ['hasIndustrialProcesses'],
  A4: ['usesRefrigerants'],
  B1: ['usesElectricity', 'leasesWithOwnMeter'],
  B2: ['hasHeating', 'usesDistrictHeating'],
  B3: ['usesDistrictHeating'],
  B4: ['usesDistrictHeating'],
  B5: ['usesElectricity', 'usesDistrictHeating', 'exportsEnergy'],
  B6: ['usesElectricity'],
  B7: ['hasGuaranteesOfOrigin'],
  B8: ['exportsEnergy'],
  B9: ['hasPpaContracts'],
  B10: ['hasPpaContracts'],
  B11: ['hasPpaContracts', 'hasGuaranteesOfOrigin'],
  C1: ['operatesInternationalOffices'],
  C2: ['hasConsultantsTravel', 'operatesInternationalOffices'],
  C3: ['usesElectricity', 'usesDistrictHeating', 'hasBackupPower'],
  C4: ['hasTransportSuppliers', 'shipsGoodsUpstream'],
  C5: ['generatesWaste'],
  C6: ['leasesEquipment'],
  C7: ['shipsFinishedGoods'],
  C8: ['leasesProducts'],
  C9: ['producesProducts'],
  C10: ['leasesEquipment', 'leasesProducts'],
  C11: ['leasesProducts'],
  C12: ['hasFranchisePartners', 'providesCustomerServices'],
  C13: ['hasInvestments'],
  C14: ['hasProductRecycling'],
  C15: ['producesProducts', 'hasInvestments'],
  E1Targets: ['hasNetZeroTarget'],
  E2Water: ['usesLargeWaterVolumes'],
  E3Pollution: ['hasIndustrialEmissions'],
  E4Biodiversity: ['impactsNatureAreas'],
  E5Resources: ['managesCriticalMaterials', 'purchasesMaterials'],
  SBM: ['doesEsgReporting', 'hasTransitionPlan', 'assessesClimateResilience'],
  GOV: ['hasBoardOversight', 'hasEsgPolicy', 'doesEsgReporting'],
  IRO: ['hasMaterialTopics', 'hasMaterialRisks', 'hasMaterialOpportunities'],
  MR: ['hasTransitionPlan', 'tracksFinancialEffects', 'hasNetZeroTarget', 'hasRemovalProjects'],
  D1: ['hasEsgPolicy', 'doesEsgReporting', 'hasBoardOversight', 'hasNetZeroTarget'],
  D2: ['hasMaterialTopics', 'hasMaterialRisks', 'hasMaterialOpportunities', 'hasCsrdGapAssessment'],
}

export function isModuleRelevant(profile: WizardProfile, moduleId: ModuleId): boolean {
  const dependencies = moduleDependencies[moduleId]
  if (!dependencies || dependencies.length === 0) {
    return true
  }
  return dependencies.some((key) => profile[key] === true)
}

export function countPositiveAnswers(profile: WizardProfile): number {
  return ALL_PROFILE_KEYS.reduce((count, key) => (profile[key] ? count + 1 : count), 0)
}

export function countAnsweredQuestions(profile: WizardProfile): number {
  return ALL_PROFILE_KEYS.reduce((count, key) => (profile[key] !== null ? count + 1 : count), 0)
}

export function isProfileComplete(profile: WizardProfile): boolean {
  return countAnsweredQuestions(profile) === ALL_PROFILE_KEYS.length
}

export function hasAnyAnswer(profile: WizardProfile): boolean {
  return ALL_PROFILE_KEYS.some((key) => profile[key] !== null)
}

export function findFirstRelevantStepIndex(steps: { id: ModuleId }[], profile: WizardProfile): number {
  const index = steps.findIndex((step) => isModuleRelevant(profile, step.id))
  return index === -1 ? 0 : index
}
