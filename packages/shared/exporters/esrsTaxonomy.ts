import type { ModuleId } from '../types'

export const ESRS_TAXONOMY_NAMESPACE = 'https://www.efrag.org/esrs/2023-12-01'
export const ESRS_TAXONOMY_SCHEMA_REF =
  'https://www.efrag.org/esrs/2023-12-01/esrs-full.xsd'

export const ESRS_NAMESPACES = {
  xbrli: 'http://www.xbrl.org/2003/instance',
  link: 'http://www.xbrl.org/2003/linkbase',
  xlink: 'http://www.w3.org/1999/xlink',
  iso4217: 'http://www.xbrl.org/2003/iso4217',
  esrs: ESRS_TAXONOMY_NAMESPACE,
} as const

type UnitMeasureDefinition =
  | { type: 'measure'; measure: string }
  | { type: 'divide'; numerator: string; denominator: string }

export type UnitDefinition = { id: string } & UnitMeasureDefinition

export const unitDefinitions = {
  pure: { id: 'u_pure', type: 'measure', measure: 'xbrli:pure' },
  eur: { id: 'u_eur', type: 'measure', measure: 'iso4217:EUR' },
  tonnesCo2e: {
    id: 'u_tonnes_co2e',
    type: 'measure',
    measure: 'esrs:TonnesCO2e',
  },
} satisfies Record<string, UnitDefinition>

export type UnitSelection = keyof typeof unitDefinitions | 'derived'

export type EsrsConceptDefinition = {
  concept: string
  label: string
  periodType: 'duration' | 'instant'
  unitId: UnitSelection
  decimals: number | 'INF'
}

const conceptMap: Record<ModuleId, EsrsConceptDefinition> = {
  A1: {
    concept: 'esrs:A1GovernanceIntegrationMetric',
    label: 'Governance integration score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  A2: {
    concept: 'esrs:A2StrategyResilienceMetric',
    label: 'Strategy resilience score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  A3: {
    concept: 'esrs:A3ImpactRiskOpportunityMetric',
    label: 'Impact, risk and opportunity score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  A4: {
    concept: 'esrs:A4BusinessModelResilienceMetric',
    label: 'Business model resilience index',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  B1: {
    concept: 'esrs:B1GovernanceStructureMetric',
    label: 'Governance structure maturity index',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  B2: {
    concept: 'esrs:B2GovernanceProcessMetric',
    label: 'Governance processes score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  B3: {
    concept: 'esrs:B3GovernanceControlMetric',
    label: 'Control and oversight score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  B4: {
    concept: 'esrs:B4GovernanceInformationMetric',
    label: 'Sustainability information quality score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  B5: {
    concept: 'esrs:B5GovernanceExpertiseMetric',
    label: 'Expertise and training score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  B6: {
    concept: 'esrs:B6RemunerationLinkMetric',
    label: 'Remuneration linkage score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  B7: {
    concept: 'esrs:B7RiskManagementMetric',
    label: 'Risk management maturity score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  B8: {
    concept: 'esrs:B8InternalControlMetric',
    label: 'Internal control maturity score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  B9: {
    concept: 'esrs:B9SupplyChainGovernanceMetric',
    label: 'Supply chain governance score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  B10: {
    concept: 'esrs:B10StakeholderEngagementMetric',
    label: 'Stakeholder engagement score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  B11: {
    concept: 'esrs:B11AntiCorruptionMetric',
    label: 'Anti-corruption programme score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C1: {
    concept: 'esrs:C1Scope1EmissionsMetric',
    label: 'Scope 1 greenhouse gas emissions',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C2: {
    concept: 'esrs:C2Scope2EmissionsMarketMetric',
    label: 'Scope 2 greenhouse gas emissions (market-based)',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C3: {
    concept: 'esrs:C3Scope2EmissionsLocationMetric',
    label: 'Scope 2 greenhouse gas emissions (location-based)',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C4: {
    concept: 'esrs:C4Scope3EmissionsCategoryMetric',
    label: 'Scope 3 upstream category emissions',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C5: {
    concept: 'esrs:C5Scope3DownstreamMetric',
    label: 'Scope 3 downstream category emissions',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C6: {
    concept: 'esrs:C6AvoidedEmissionsMetric',
    label: 'Avoided emissions intensity',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C7: {
    concept: 'esrs:C7EnergyConsumptionMetric',
    label: 'Energy consumption intensity',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C8: {
    concept: 'esrs:C8EnergyMixMetric',
    label: 'Energy mix index',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C9: {
    concept: 'esrs:C9RenewableShareMetric',
    label: 'Renewable energy share',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C10: {
    concept: 'esrs:C10CarbonRemovalsMetric',
    label: 'Carbon removals intensity',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C11: {
    concept: 'esrs:C11CarbonStorageMetric',
    label: 'Carbon storage capacity score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C12: {
    concept: 'esrs:C12CarbonCreditsMetric',
    label: 'Carbon credit reliance index',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C13: {
    concept: 'esrs:C13EmissionIntensityMetric',
    label: 'Emission intensity score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C14: {
    concept: 'esrs:C14TransportIntensityMetric',
    label: 'Transport emission intensity score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  C15: {
    concept: 'esrs:C15ValueChainIntensityMetric',
    label: 'Value chain emission intensity score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  E1Targets: {
    concept: 'esrs:E1TargetProgressMetric',
    label: 'Climate target progress',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  E2Water: {
    concept: 'esrs:E2WaterIntensityMetric',
    label: 'Water intensity index',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  E3Pollution: {
    concept: 'esrs:E3PollutionIntensityMetric',
    label: 'Pollution intensity score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  E4Biodiversity: {
    concept: 'esrs:E4BiodiversityImpactMetric',
    label: 'Biodiversity impact score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  E5Resources: {
    concept: 'esrs:E5ResourceUseMetric',
    label: 'Resource use intensity',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  S1: {
    concept: 'esrs:S1OwnWorkforceMetric',
    label: 'Own workforce impact score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  S2: {
    concept: 'esrs:S2WorkersValueChainMetric',
    label: 'Workers in the value chain impact score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  S3: {
    concept: 'esrs:S3AffectedCommunitiesMetric',
    label: 'Affected communities impact score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  S4: {
    concept: 'esrs:S4ConsumersEndUsersMetric',
    label: 'Consumers and end-users impact score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  G1: {
    concept: 'esrs:G1BusinessConductMetric',
    label: 'Business conduct score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  D1: {
    concept: 'esrs:D1StrategyBenchmarkingMetric',
    label: 'Strategy benchmarking score',
    periodType: 'duration',
    unitId: 'derived',
    decimals: 2,
  },
  D2: {
    concept: 'esrs:D2DoubleMaterialityMetric',
    label: 'Double materiality heatmap score',
    periodType: 'instant',
    unitId: 'derived',
    decimals: 2,
  },
}

export function getConceptForModule(
  moduleId: ModuleId,
): EsrsConceptDefinition | undefined {
  return conceptMap[moduleId]
}

const derivedUnitLookup = new Map<string, keyof typeof unitDefinitions>([
  ['t co2e', 'tonnesCo2e'],
  ['tco2e', 'tonnesCo2e'],
  ['tco2e/mio. dkk', 'pure'],
  ['tco2e/fte', 'pure'],
  ['tco2e/kwh', 'pure'],
  ['kg co2e/dkk', 'pure'],
  ['kg co2e/kwh', 'pure'],
  ['kg co2e/tonkm', 'pure'],
  ['kg co2e/ton', 'pure'],
  ['kg co2e/km', 'pure'],
  ['kg co2e/enhed', 'pure'],
  ['liter', 'pure'],
  ['litre', 'pure'],
  ['gallon', 'pure'],
  ['nm³', 'pure'],
  ['kg/kr', 'pure'],
  ['%', 'pure'],
  ['procent', 'pure'],
  ['antal', 'pure'],
  ['point', 'pure'],
  ['mål', 'pure'],
  ['vandstressindeks', 'pure'],
  ['compliance-score', 'pure'],
  ['biodiversitetsrisiko', 'pure'],
  ['ressourceindeks', 'pure'],
  ['governance score', 'pure'],
  ['prioritets-score (0-100)', 'pure'],
  ['social score', 'pure'],
  ['governance score', 'pure'],
])

type NormalizeUnit = string | null | undefined

export function resolveUnit(
  selection: UnitSelection,
  moduleUnit: NormalizeUnit,
): UnitDefinition {
  if (selection !== 'derived') {
    const predefined = unitDefinitions[selection]
    if (!predefined) {
      throw new Error(`Unknown predefined unit selection: ${selection}`)
    }
    return predefined
  }

  if (!moduleUnit) {
    return unitDefinitions.pure
  }

  const normalized = moduleUnit.trim().toLowerCase()
  const mapped = derivedUnitLookup.get(normalized)
  if (mapped) {
    return unitDefinitions[mapped]
  }
  return unitDefinitions.pure
}

export function listConcepts(): EsrsConceptDefinition[] {
  return Object.values(conceptMap)
}

