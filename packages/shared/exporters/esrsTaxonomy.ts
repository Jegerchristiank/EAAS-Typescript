
/**
 * Mapping af anvendte ESRS-konceptnavne til deres officielle taksonomidefinitioner.
 *
 * Navnene stammer fra EFRAGs officielle ESRS XBRL-taksonomi
 * (entry point: https://xbrl.efrag.org/taxonomy/esrs/2023-12-22/esrs_all.xsd).
 */

import type { ModuleId } from '../types'

export type EsrsPeriodType = 'duration' | 'instant'

export type EsrsConceptDefinition = {
  /** Fuldt kvalificeret navn inkl. namespace-præfiks. */
  qname: string
  /** Relevant unit-id fra Unit Type Registry. */
  unitId: string
  /** Periodetype angivet i taksonomien. */
  periodType: EsrsPeriodType
}

export const esrsNamespace = 'https://xbrl.efrag.org/taxonomy/esrs/2023-12-22'

export const esrsEmissionConcepts = {
  scope1: {
    qname: 'esrs:GrossScope1GreenhouseGasEmissions',
    unitId: 'tCO2e',
    periodType: 'duration',
  },
  scope2LocationBased: {
    qname: 'esrs:GrossLocationBasedScope2GreenhouseGasEmissions',
    unitId: 'tCO2e',
    periodType: 'duration',
  },
  scope2MarketBased: {
    qname: 'esrs:GrossMarketBasedScope2GreenhouseGasEmissions',
    unitId: 'tCO2e',
    periodType: 'duration',
  },
  scope3: {
    qname: 'esrs:GrossScope3GreenhouseGasEmissions',
    unitId: 'tCO2e',
    periodType: 'duration',
  },
  totalLocationBased: {
    qname: 'esrs:LocationBasedGreenhouseGasEmissions',
    unitId: 'tCO2e',
    periodType: 'duration',
  },
  totalMarketBased: {
    qname: 'esrs:MarketBasedGreenhouseGasEmissions',
    unitId: 'tCO2e',
    periodType: 'duration',
  },
} as const satisfies Record<string, EsrsConceptDefinition>

export type EsrsEmissionConceptKey = keyof typeof esrsEmissionConcepts

export type EsrsConcept = {
  key: EsrsEmissionConceptKey
  concept: string
  definition: EsrsConceptDefinition
}

export const esrsConceptList: readonly EsrsConcept[] = Object.entries(esrsEmissionConcepts).map(
  ([key, definition]) => ({
    key: key as EsrsEmissionConceptKey,
    concept: definition.qname,
    definition,
  }),
)

function resolveConceptKey(moduleId: ModuleId): EsrsEmissionConceptKey | undefined {
  if (moduleId.startsWith('A')) {
    return 'scope1'
  }

  if (moduleId.startsWith('B')) {
    const moduleNumber = Number.parseInt(moduleId.slice(1), 10)
    if (Number.isNaN(moduleNumber)) {
      return 'scope2LocationBased'
    }
    return moduleNumber <= 6 ? 'scope2LocationBased' : 'scope2MarketBased'
  }

  if (moduleId.startsWith('C')) {
    return 'scope3'
  }

  return undefined
}

export function getConceptForModule(moduleId: ModuleId): EsrsConcept | undefined {
  const key = resolveConceptKey(moduleId)
  if (!key) {
    return undefined
  }

  return esrsConceptList.find((entry) => entry.key === key)
}

export function listConcepts(): readonly EsrsConcept[] {
  return esrsConceptList
}