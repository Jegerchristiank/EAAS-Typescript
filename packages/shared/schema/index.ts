/**
 * Eksporterer inputskema og zod-validering for ESG-data.
 */
import { z } from 'zod'
import schema from './esg-input-schema.json'

const d1BoundaryOptions = ['equityShare', 'financialControl', 'operationalControl'] as const
const d1Scope2MethodOptions = ['locationBased', 'marketBased'] as const
const d1DataQualityOptions = ['primary', 'secondary', 'proxy'] as const
export const materialityRiskOptions = ['risk', 'opportunity', 'both'] as const
export const materialityTimelineOptions = ['shortTerm', 'mediumTerm', 'longTerm', 'ongoing'] as const
export const materialityGapStatusOptions = ['aligned', 'partial', 'missing'] as const
export const e1EnergyMixOptions = ['electricity', 'districtHeat', 'steam', 'cooling', 'biogas', 'diesel', 'other'] as const
export const e1TargetScopeOptions = ['scope1', 'scope2', 'scope3', 'combined'] as const
export const e1TargetStatusOptions = ['onTrack', 'lagging', 'atRisk'] as const
export const e1ActionStatusOptions = ['planned', 'inProgress', 'delayed', 'completed'] as const
export const s3IncidentTypeOptions = ['fatality', 'lostTime', 'recordable', 'nearMiss'] as const
export const s4SeverityLevelOptions = ['low', 'medium', 'high'] as const
export const g1PolicyStatusOptions = ['approved', 'inReview', 'draft', 'retired', 'missing'] as const
export const g1TargetStatusOptions = ['onTrack', 'lagging', 'offTrack', 'notStarted'] as const

const a1FuelConsumptionSchema = z
  .object({
    fuelType: z.enum(['naturgas', 'diesel', 'fyringsolie', 'biogas']),
    unit: z.enum(['liter', 'Nm³', 'kg']),
    quantity: z.number().min(0).nullable(),
    emissionFactorKgPerUnit: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const a1InputSchema = z
  .object({
    fuelConsumptions: z.array(a1FuelConsumptionSchema).max(12).optional()
  })
  .strict()
const a2FuelConsumptionSchema = z
  .object({
    fuelType: z.enum(['benzin', 'diesel', 'biodiesel', 'cng']),
    unit: z.enum(['liter', 'kg']),
    quantity: z.number().min(0).nullable(),
    emissionFactorKgPerUnit: z.number().min(0).nullable(),
    distanceKm: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const a2InputSchema = z
  .object({
    vehicleConsumptions: z.array(a2FuelConsumptionSchema).max(20).optional()
  })
  .strict()
const a3ProcessLineSchema = z
  .object({
    processType: z.enum(['cementClinker', 'limeCalcination', 'ammoniaProduction', 'aluminiumSmelting']),
    outputQuantityTon: z.number().min(0).nullable(),
    emissionFactorKgPerTon: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const a3InputSchema = z
  .object({
    processLines: z.array(a3ProcessLineSchema).max(20).optional()
  })
  .strict()

const a4RefrigerantLineSchema = z
  .object({
    refrigerantType: z.enum(['hfc134a', 'hfc125', 'hfc32', 'r410a', 'r407c', 'sf6']),
    systemChargeKg: z.number().min(0).nullable(),
    leakagePercent: z.number().min(0).max(100).nullable(),
    gwp100: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const a4InputSchema = z
  .object({
    refrigerantLines: z.array(a4RefrigerantLineSchema).max(20).optional()
  })
  .strict()

export const b1InputSchema = z
  .object({
    electricityConsumptionKwh: z.number().min(0).nullable(),
    emissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b2InputSchema = z
  .object({
    heatConsumptionKwh: z.number().min(0).nullable(),
    recoveredHeatKwh: z.number().min(0).nullable(),
    emissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b3InputSchema = z
  .object({
    coolingConsumptionKwh: z.number().min(0).nullable(),
    recoveredCoolingKwh: z.number().min(0).nullable(),
    emissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b4InputSchema = z
  .object({
    steamConsumptionKwh: z.number().min(0).nullable(),
    recoveredSteamKwh: z.number().min(0).nullable(),
    emissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b5InputSchema = z
  .object({
    otherEnergyConsumptionKwh: z.number().min(0).nullable(),
    recoveredEnergyKwh: z.number().min(0).nullable(),
    emissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()


export const b6InputSchema = z
  .object({
    electricitySuppliedKwh: z.number().min(0).nullable(),
    gridLossPercent: z.number().min(0).max(100).nullable(),
    emissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b7InputSchema = z
  .object({
    documentedRenewableKwh: z.number().min(0).nullable(),
    residualEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b8InputSchema = z
  .object({
    onSiteRenewableKwh: z.number().min(0).nullable(),
    exportedRenewableKwh: z.number().min(0).nullable(),
    residualEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b9InputSchema = z
  .object({
    ppaDeliveredKwh: z.number().min(0).nullable(),
    matchedConsumptionKwh: z.number().min(0).nullable(),
    gridLossPercent: z.number().min(0).max(100).nullable(),
    residualEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b10InputSchema = z
  .object({
    ppaSettledKwh: z.number().min(0).nullable(),
    matchedConsumptionKwh: z.number().min(0).nullable(),
    marketSettlementPercent: z.number().min(0).max(100).nullable(),
    residualEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b11InputSchema = z
  .object({
    certificatesRetiredKwh: z.number().min(0).nullable(),
    matchedConsumptionKwh: z.number().min(0).nullable(),
    timeCorrelationPercent: z.number().min(0).max(100).nullable(),
    residualEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c1InputSchema = z
  .object({
    employeesCovered: z.number().min(0).nullable(),
    averageCommuteDistanceKm: z.number().min(0).nullable(),
    commutingDaysPerWeek: z.number().min(0).max(7).nullable(),
    weeksPerYear: z.number().min(0).max(52).nullable(),
    remoteWorkSharePercent: z.number().min(0).max(100).nullable(),
    emissionFactorKgPerKm: z.number().min(0).nullable()
  })
  .strict()

export const c2InputSchema = z
  .object({
    airTravelDistanceKm: z.number().min(0).nullable(),
    airEmissionFactorKgPerKm: z.number().min(0).nullable(),
    railTravelDistanceKm: z.number().min(0).nullable(),
    railEmissionFactorKgPerKm: z.number().min(0).nullable(),
    roadTravelDistanceKm: z.number().min(0).nullable(),
    roadEmissionFactorKgPerKm: z.number().min(0).nullable(),
    hotelNights: z.number().min(0).nullable(),
    hotelEmissionFactorKgPerNight: z.number().min(0).nullable(),
    virtualMeetingSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c3InputSchema = z
  .object({
    purchasedElectricityKwh: z.number().min(0).nullable(),
    electricityUpstreamEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    transmissionLossPercent: z.number().min(0).max(20).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable(),
    fuelConsumptionKwh: z.number().min(0).nullable(),
    fuelUpstreamEmissionFactorKgPerKwh: z.number().min(0).nullable()
  })
  .strict()

export const c4InputSchema = z
  .object({
    roadTonnesKm: z.number().min(0).nullable(),
    roadEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    railTonnesKm: z.number().min(0).nullable(),
    railEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    seaTonnesKm: z.number().min(0).nullable(),
    seaEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    airTonnesKm: z.number().min(0).nullable(),
    airEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    consolidationEfficiencyPercent: z.number().min(0).max(50).nullable(),
    lowCarbonSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c5InputSchema = z
  .object({
    landfillWasteTonnes: z.number().min(0).nullable(),
    landfillEmissionFactorKgPerTonne: z.number().min(0).nullable(),
    incinerationWasteTonnes: z.number().min(0).nullable(),
    incinerationEmissionFactorKgPerTonne: z.number().min(0).nullable(),
    recyclingWasteTonnes: z.number().min(0).nullable(),
    recyclingEmissionFactorKgPerTonne: z.number().min(0).nullable(),
    compostingWasteTonnes: z.number().min(0).nullable(),
    compostingEmissionFactorKgPerTonne: z.number().min(0).nullable(),
    recyclingRecoveryPercent: z.number().min(0).max(90).nullable(),
    reuseSharePercent: z.number().min(0).max(60).nullable()
  })
  .strict()

export const c6InputSchema = z
  .object({
    leasedFloorAreaSqm: z.number().min(0).nullable(),
    electricityIntensityKwhPerSqm: z.number().min(0).nullable(),
    heatIntensityKwhPerSqm: z.number().min(0).nullable(),
    occupancySharePercent: z.number().min(0).max(100).nullable(),
    sharedServicesAllocationPercent: z.number().min(0).max(50).nullable(),
    electricityEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    heatEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableElectricitySharePercent: z.number().min(0).max(100).nullable(),
    renewableHeatSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c7InputSchema = z
  .object({
    roadTonnesKm: z.number().min(0).nullable(),
    roadEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    railTonnesKm: z.number().min(0).nullable(),
    railEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    seaTonnesKm: z.number().min(0).nullable(),
    seaEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    airTonnesKm: z.number().min(0).nullable(),
    airEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    warehousingEnergyKwh: z.number().min(0).nullable(),
    warehousingEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    lowEmissionVehicleSharePercent: z.number().min(0).max(100).nullable(),
    renewableWarehousingSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c8InputSchema = z
  .object({
    leasedFloorAreaSqm: z.number().min(0).nullable(),
    electricityIntensityKwhPerSqm: z.number().min(0).nullable(),
    heatIntensityKwhPerSqm: z.number().min(0).nullable(),
    occupancySharePercent: z.number().min(0).max(100).nullable(),
    landlordEnergySharePercent: z.number().min(0).max(100).nullable(),
    energyEfficiencyImprovementPercent: z.number().min(0).max(70).nullable(),
    electricityEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    heatEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableElectricitySharePercent: z.number().min(0).max(100).nullable(),
    renewableHeatSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c9InputSchema = z
  .object({
    processedOutputTonnes: z.number().min(0).nullable(),
    processingEnergyIntensityKwhPerTonne: z.number().min(0).nullable(),
    processingEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    processEfficiencyImprovementPercent: z.number().min(0).max(60).nullable(),
    secondaryMaterialSharePercent: z.number().min(0).max(80).nullable(),
    renewableEnergySharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

const leasedEnergyLineSchema = z
  .object({
    floorAreaSqm: z.number().min(0).nullable(),
    energyConsumptionKwh: z.number().min(0).nullable(),
    energyType: z.enum(['electricity', 'heat']),
    emissionFactorKgPerKwh: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

const franchiseLineSchema = z
  .object({
    activityBasis: z.enum(['revenue', 'energy']),
    revenueDkk: z.number().min(0).nullable(),
    energyConsumptionKwh: z.number().min(0).nullable(),
    emissionFactorKey: z
      .enum([
        'retailRevenue',
        'foodServiceRevenue',
        'hospitalityRevenue',
        'genericRevenue',
        'electricityEnergy',
        'districtHeatEnergy',
        'mixedEnergy'
      ])
      .nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c10InputSchema = z
  .object({
    leasedAssetLines: z.array(leasedEnergyLineSchema).max(20).optional()
  })
  .strict()
export const c11InputSchema = z
  .object({
    leasedAssetLines: z.array(leasedEnergyLineSchema).max(20).optional()
  })
  .strict()
export const c12InputSchema = z
  .object({
    franchiseLines: z.array(franchiseLineSchema).max(20).optional()
  })
  .strict()
const c13EmissionFactorKeys = [
  'listedEquity',
  'corporateBonds',
  'sovereignBonds',
  'privateEquity',
  'realEstate',
  'infrastructure',
  'diversifiedPortfolio'
] as const

const c13InvestmentLineSchema = z
  .object({
    investedAmountDkk: z.number().min(0).nullable(),
    emissionFactorKey: z.enum(c13EmissionFactorKeys).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c13InputSchema = z
  .object({
    investmentLines: z.array(c13InvestmentLineSchema).max(30).optional()
  })
  .strict()
const c14TreatmentTypes = ['recycling', 'incineration', 'landfill'] as const

const c14EmissionFactorKeys = [
  'recyclingConservative',
  'recyclingOptimised',
  'incinerationEnergyRecovery',
  'incinerationNoRecovery',
  'landfillManaged',
  'landfillUnmanaged'
] as const

const c14TreatmentLineSchema = z
  .object({
    treatmentType: z.enum(c14TreatmentTypes).nullable(),
    tonnesTreated: z.number().min(0).nullable(),
    emissionFactorKey: z.enum(c14EmissionFactorKeys).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c14InputSchema = z
  .object({
    treatmentLines: z.array(c14TreatmentLineSchema).max(30).optional()
  })
  .strict()
const c15Categories = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15'
] as const

const c15EmissionFactorKeys = [
  'category1Spend',
  'category2Spend',
  'category3Energy',
  'category4Logistics',
  'category5Waste',
  'category6Travel',
  'category7Commuting',
  'category8LeasedAssets',
  'category9DownstreamTransport',
  'category10Processing',
  'category11UsePhase',
  'category12EndOfLife',
  'category13LeasedAssetsDownstream',
  'category14Franchises',
  'category15Investments'
] as const

const c15ScreeningLineSchema = z
  .object({
    category: z.enum(c15Categories).nullable(),
    description: z.string().max(240).nullable(),
    quantityUnit: z.string().max(32).nullable(),
    estimatedQuantity: z.number().min(0).nullable(),
    emissionFactorKey: z.enum(c15EmissionFactorKeys).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c15InputSchema = z
  .object({
    screeningLines: z.array(c15ScreeningLineSchema).max(40).optional()
  })
  .strict()

const d2MaterialTopicSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().max(500).nullable(),
    riskType: z.enum(materialityRiskOptions).nullable(),
    impactScore: z.number().min(0).max(5).nullable(),
    financialScore: z.number().min(0).max(5).nullable(),
    timeline: z.enum(materialityTimelineOptions).nullable(),
    responsible: z.string().max(120).nullable(),
    csrdGapStatus: z.enum(materialityGapStatusOptions).nullable()
  })
  .strict()

export const d2InputSchema = z
  .object({
    materialTopics: z.array(d2MaterialTopicSchema).max(50).optional()
  })
  .strict()

export const d1InputSchema = z
  .object({
    organizationalBoundary: z.enum(d1BoundaryOptions).nullable(),
    scope2Method: z.enum(d1Scope2MethodOptions).nullable(),
    scope3ScreeningCompleted: z.boolean().nullable(),
    dataQuality: z.enum(d1DataQualityOptions).nullable(),
    materialityAssessmentDescription: z.string().max(2000).nullable(),
    strategyDescription: z.string().max(2000).nullable()
  })
  .strict()

const s1HeadcountLineSchema = z
  .object({
    segment: z.string().max(120).nullable(),
    headcount: z.number().min(0).nullable(),
    femalePercent: z.number().min(0).max(100).nullable(),
    collectiveAgreementCoveragePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const s1InputSchema = z
  .object({
    reportingYear: z.number().min(1900).max(2100).nullable(),
    totalHeadcount: z.number().min(0).nullable(),
    dataCoveragePercent: z.number().min(0).max(100).nullable(),
    headcountBreakdown: z.array(s1HeadcountLineSchema).max(20).optional(),
    workforceNarrative: z.string().max(2000).nullable()
  })
  .strict()

const s2DiversityRowSchema = z
  .object({
    level: z.string().max(120).nullable(),
    femalePercent: z.number().min(0).max(100).nullable(),
    malePercent: z.number().min(0).max(100).nullable(),
    otherPercent: z.number().min(0).max(100).nullable(),
    payGapPercent: z.number().min(-100).max(100).nullable(),
    targetNarrative: z.string().max(500).nullable()
  })
  .strict()

export const s2InputSchema = z
  .object({
    genderBalance: z.array(s2DiversityRowSchema).max(30).optional(),
    dataCoveragePercent: z.number().min(0).max(100).nullable(),
    equalityPolicyInPlace: z.boolean().nullable(),
    inclusionInitiativesNarrative: z.string().max(2000).nullable()
  })
  .strict()

const s3IncidentSchema = z
  .object({
    incidentType: z.enum(s3IncidentTypeOptions),
    count: z.number().min(0).nullable(),
    ratePerMillionHours: z.number().min(0).nullable(),
    description: z.string().max(240).nullable(),
    rootCauseClosed: z.boolean().nullable()
  })
  .strict()

export const s3InputSchema = z
  .object({
    incidents: z.array(s3IncidentSchema).max(40).optional(),
    totalHoursWorked: z.number().min(0).nullable(),
    safetyCertification: z.boolean().nullable(),
    safetyNarrative: z.string().max(2000).nullable()
  })
  .strict()

const s4ProcessSchema = z
  .object({
    area: z.string().max(160).nullable(),
    coveragePercent: z.number().min(0).max(100).nullable(),
    lastAssessmentDate: z.string().max(120).nullable(),
    severityLevel: z.enum(s4SeverityLevelOptions).nullable(),
    remediationPlan: z.string().max(500).nullable()
  })
  .strict()

export const s4InputSchema = z
  .object({
    processes: z.array(s4ProcessSchema).max(40).optional(),
    grievanceMechanismInPlace: z.boolean().nullable(),
    escalationTimeframeDays: z.number().min(0).nullable(),
    dueDiligenceNarrative: z.string().max(2000).nullable()
  })
  .strict()

const g1PolicySchema = z
  .object({
    topic: z.string().max(160).nullable(),
    status: z.enum(g1PolicyStatusOptions).nullable(),
    owner: z.string().max(160).nullable(),
    lastReviewed: z.string().max(120).nullable()
  })
  .strict()

const g1TargetSchema = z
  .object({
    topic: z.string().max(160).nullable(),
    baselineYear: z.number().min(1990).max(2100).nullable(),
    targetYear: z.number().min(1990).max(2100).nullable(),
    targetValue: z.number().nullable(),
    unit: z.string().max(40).nullable(),
    status: z.enum(g1TargetStatusOptions).nullable(),
    narrative: z.string().max(500).nullable()
  })
  .strict()

export const g1InputSchema = z
  .object({
    policies: z.array(g1PolicySchema).max(40).optional(),
    targets: z.array(g1TargetSchema).max(40).optional(),
    boardOversight: z.boolean().nullable(),
    governanceNarrative: z.string().max(2000).nullable()
  })
  .strict()

const e1EnergyMixLineSchema = z
  .object({
    energyType: z.enum(e1EnergyMixOptions),
    consumptionKwh: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const e1ContextInputSchema = z
  .object({
    netRevenueDkk: z.number().min(0).nullable(),
    productionVolume: z.number().min(0).nullable(),
    productionUnit: z.string().max(32).nullable(),
    employeesFte: z.number().min(0).nullable(),
    totalEnergyConsumptionKwh: z.number().min(0).nullable(),
    energyProductionKwh: z.number().min(0).nullable(),
    renewableEnergyProductionKwh: z.number().min(0).nullable(),
    energyMixLines: z.array(e1EnergyMixLineSchema).max(10).optional(),
    previousYearScope1Tonnes: z.number().min(0).nullable(),
    previousYearScope2Tonnes: z.number().min(0).nullable(),
    previousYearScope3Tonnes: z.number().min(0).nullable()
  })
  .strict()

const e1TargetMilestoneSchema = z
  .object({
    label: z.string().max(160).nullable(),
    dueYear: z.number().min(2000).max(2100).nullable()
  })
  .strict()

const e1TargetLineSchema = z
  .object({
    id: z.string().max(24).nullable(),
    name: z.string().max(120).nullable(),
    scope: z.enum(e1TargetScopeOptions),
    targetYear: z.number().min(2000).max(2100).nullable(),
    targetValueTonnes: z.number().min(0).nullable(),
    baselineYear: z.number().min(1990).max(2100).nullable(),
    baselineValueTonnes: z.number().min(0).nullable(),
    owner: z.string().max(120).nullable(),
    status: z.enum(e1TargetStatusOptions).nullable(),
    description: z.string().max(500).nullable(),
    milestones: z.array(e1TargetMilestoneSchema).max(6).optional()
  })
  .strict()

const e1ActionLineSchema = z
  .object({
    title: z.string().max(120).nullable(),
    description: z.string().max(500).nullable(),
    owner: z.string().max(120).nullable(),
    dueQuarter: z
      .string()
      .regex(/^\d{4}-Q[1-4]$/)
      .nullable(),
    status: z.enum(e1ActionStatusOptions).nullable()
  })
  .strict()

export const e1TargetsInputSchema = z
  .object({
    targets: z.array(e1TargetLineSchema).max(12).optional(),
    actions: z.array(e1ActionLineSchema).max(20).optional()
  })
  .strict()

export const e2WaterInputSchema = z
  .object({
    totalWithdrawalM3: z.number().min(0).nullable(),
    withdrawalInStressRegionsM3: z.number().min(0).nullable(),
    dischargeM3: z.number().min(0).nullable(),
    reusePercent: z.number().min(0).max(100).nullable(),
    dataQualityPercent: z.number().min(0).max(100).nullable(),
  })
  .strict()

export const e3PollutionInputSchema = z
  .object({
    airEmissionsTonnes: z.number().min(0).nullable(),
    airEmissionLimitTonnes: z.number().min(0).nullable(),
    waterDischargesTonnes: z.number().min(0).nullable(),
    waterDischargeLimitTonnes: z.number().min(0).nullable(),
    soilEmissionsTonnes: z.number().min(0).nullable(),
    soilEmissionLimitTonnes: z.number().min(0).nullable(),
    reportableIncidents: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable(),
  })
  .strict()

export const e4BiodiversityInputSchema = z
  .object({
    sitesInOrNearProtectedAreas: z.number().min(0).nullable(),
    protectedAreaHectares: z.number().min(0).nullable(),
    restorationHectares: z.number().min(0).nullable(),
    significantIncidents: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable(),
  })
  .strict()

export const e5ResourcesInputSchema = z
  .object({
    primaryMaterialConsumptionTonnes: z.number().min(0).nullable(),
    secondaryMaterialConsumptionTonnes: z.number().min(0).nullable(),
    recycledContentPercent: z.number().min(0).max(100).nullable(),
    renewableMaterialSharePercent: z.number().min(0).max(100).nullable(),
    criticalMaterialsSharePercent: z.number().min(0).max(100).nullable(),
    circularityTargetPercent: z.number().min(0).max(100).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable(),
  })
  .strict()
export type A1Input = z.infer<typeof a1InputSchema>
export type A2Input = z.infer<typeof a2InputSchema>
export type A3Input = z.infer<typeof a3InputSchema>
export type A4Input = z.infer<typeof a4InputSchema>
export type B1Input = z.infer<typeof b1InputSchema>
export type B2Input = z.infer<typeof b2InputSchema>
export type B3Input = z.infer<typeof b3InputSchema>
export type B4Input = z.infer<typeof b4InputSchema>
export type B5Input = z.infer<typeof b5InputSchema>
export type B6Input = z.infer<typeof b6InputSchema>
export type B7Input = z.infer<typeof b7InputSchema>
export type B8Input = z.infer<typeof b8InputSchema>
export type B9Input = z.infer<typeof b9InputSchema>
export type B10Input = z.infer<typeof b10InputSchema>
export type B11Input = z.infer<typeof b11InputSchema>
export type C1Input = z.infer<typeof c1InputSchema>
export type C2Input = z.infer<typeof c2InputSchema>
export type C3Input = z.infer<typeof c3InputSchema>
export type C4Input = z.infer<typeof c4InputSchema>
export type C5Input = z.infer<typeof c5InputSchema>
export type C6Input = z.infer<typeof c6InputSchema>
export type C7Input = z.infer<typeof c7InputSchema>
export type C8Input = z.infer<typeof c8InputSchema>
export type C9Input = z.infer<typeof c9InputSchema>
export type C10Input = z.infer<typeof c10InputSchema>
export type C11Input = z.infer<typeof c11InputSchema>
export type C12Input = z.infer<typeof c12InputSchema>
export type C13Input = z.infer<typeof c13InputSchema>
export type C14Input = z.infer<typeof c14InputSchema>
export type C15Input = z.infer<typeof c15InputSchema>
export type D2MaterialTopic = z.infer<typeof d2MaterialTopicSchema>
export type D2Input = z.infer<typeof d2InputSchema>

export type D1Input = z.infer<typeof d1InputSchema>
export type S1Input = z.infer<typeof s1InputSchema>
export type S2Input = z.infer<typeof s2InputSchema>
export type S3Input = z.infer<typeof s3InputSchema>
export type S4Input = z.infer<typeof s4InputSchema>
export type G1Input = z.infer<typeof g1InputSchema>

export type S3IncidentType = (typeof s3IncidentTypeOptions)[number]
export type S4SeverityLevel = (typeof s4SeverityLevelOptions)[number]
export type G1PolicyStatus = (typeof g1PolicyStatusOptions)[number]
export type G1TargetStatus = (typeof g1TargetStatusOptions)[number]

export type E1EnergyMixType = (typeof e1EnergyMixOptions)[number]
export type E1TargetScope = (typeof e1TargetScopeOptions)[number]
export type E1TargetStatus = (typeof e1TargetStatusOptions)[number]
export type E1ActionStatus = (typeof e1ActionStatusOptions)[number]
export type E1ContextInput = z.infer<typeof e1ContextInputSchema>
export type E1TargetMilestone = z.infer<typeof e1TargetMilestoneSchema>
export type E1TargetLine = z.infer<typeof e1TargetLineSchema>
export type E1ActionLine = z.infer<typeof e1ActionLineSchema>
export type E1TargetsInput = z.infer<typeof e1TargetsInputSchema>
export type E2WaterInput = z.infer<typeof e2WaterInputSchema>
export type E3PollutionInput = z.infer<typeof e3PollutionInputSchema>
export type E4BiodiversityInput = z.infer<typeof e4BiodiversityInputSchema>
export type E5ResourcesInput = z.infer<typeof e5ResourcesInputSchema>


export const esgInputSchema = z
  .object({
    A1: a1InputSchema.optional(),
    A2: a2InputSchema.optional(),
    A3: a3InputSchema.optional(),
    A4: a4InputSchema.optional(),
    B1: b1InputSchema.optional(),
    B2: b2InputSchema.optional(),
    B3: b3InputSchema.optional(),
    B4: b4InputSchema.optional(),
    B5: b5InputSchema.optional(),
    B6: b6InputSchema.optional(),
    B7: b7InputSchema.optional(),
    B8: b8InputSchema.optional(),
    B9: b9InputSchema.optional(),
    B10: b10InputSchema.optional(),
    B11: b11InputSchema.optional(),
    C1: c1InputSchema.optional(),
    C2: c2InputSchema.optional(),
    C3: c3InputSchema.optional(),
    C4: c4InputSchema.optional(),
    C5: c5InputSchema.optional(),
    C6: c6InputSchema.optional(),
    C7: c7InputSchema.optional(),
    C8: c8InputSchema.optional(),
    C9: c9InputSchema.optional(),
    C10: c10InputSchema.optional(),
    C11: c11InputSchema.optional(),
    C12: c12InputSchema.optional(),
    C13: c13InputSchema.optional(),
    C14: c14InputSchema.optional(),
    C15: c15InputSchema.optional(),
    E1Context: e1ContextInputSchema.optional(),
    E1Targets: e1TargetsInputSchema.optional(),
    E2Water: e2WaterInputSchema.optional(),
    E3Pollution: e3PollutionInputSchema.optional(),
    E4Biodiversity: e4BiodiversityInputSchema.optional(),
    E5Resources: e5ResourcesInputSchema.optional(),
    S1: s1InputSchema.optional(),
    S2: s2InputSchema.optional(),
    S3: s3InputSchema.optional(),
    S4: s4InputSchema.optional(),
    G1: g1InputSchema.optional(),
    D1: d1InputSchema.optional(),
    D2: d2InputSchema.optional()
  })
  .passthrough()

export type EsgInput = z.infer<typeof esgInputSchema>

export function getRawSchema(): unknown {
  return schema
}
