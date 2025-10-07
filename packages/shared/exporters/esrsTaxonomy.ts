
/**
 * Mapping af anvendte ESRS-konceptnavne til deres officielle taksonomidefinitioner.
 *
 * Navnene stammer fra EFRAGs officielle ESRS XBRL-taksonomi
 * (entry point: https://xbrl.efrag.org/taxonomy/esrs/2023-12-22/esrs_all.xsd).
 */

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
    periodType: 'duration'
  },
  scope2LocationBased: {
    qname: 'esrs:GrossLocationBasedScope2GreenhouseGasEmissions',
    unitId: 'tCO2e',
    periodType: 'duration'
  },
  scope2MarketBased: {
    qname: 'esrs:GrossMarketBasedScope2GreenhouseGasEmissions',
    unitId: 'tCO2e',
    periodType: 'duration'
  },
  scope3: {
    qname: 'esrs:GrossScope3GreenhouseGasEmissions',
    unitId: 'tCO2e',
    periodType: 'duration'
  },
  totalLocationBased: {
    qname: 'esrs:LocationBasedGreenhouseGasEmissions',
    unitId: 'tCO2e',
    periodType: 'duration'
  },
  totalMarketBased: {
    qname: 'esrs:MarketBasedGreenhouseGasEmissions',
    unitId: 'tCO2e',
    periodType: 'duration'
  }
} as const satisfies Record<string, EsrsConceptDefinition>

export type EsrsEmissionConceptKey = keyof typeof esrsEmissionConcepts

export const esrsConceptList = Object.entries(esrsEmissionConcepts).map(([key, definition]) => ({
  key: key as EsrsEmissionConceptKey,
  definition
}))