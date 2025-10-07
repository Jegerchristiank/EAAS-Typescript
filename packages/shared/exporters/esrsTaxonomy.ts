export const ESRS_NAMESPACE = 'https://xbrl.efrag.org/taxonomy/esrs/2023-12-22'
export const ESRS_PREFIX = 'esrs'
export const UTR_NAMESPACE = 'http://www.xbrl.org/2009/utr'

export type EsrsUnitId = keyof typeof esrsUnits

export type EsrsUnitDefinition = {
  /** Fully qualified measure reference used inside `<xbrli:measure>` */
  measure: {
    namespace: string
    name: string
  }
  /** Optional human readable description of the unit. */
  label: string
}

export const esrsUnits = {
  u_tonnesCO2e: {
    measure: {
      namespace: UTR_NAMESPACE,
      name: 'tCO2e',
    },
    label: 'Tonnes of CO₂ equivalent',
  },
} as const satisfies Record<string, EsrsUnitDefinition>

export type EsrsConceptKey = keyof typeof esrsConcepts

export type PeriodType = 'duration' | 'instant'

export type EsrsConceptDefinition = {
  /** Fully qualified concept QName (including namespace prefix). */
  qname: `${typeof ESRS_PREFIX}:${string}`
  /** The unit that must be used when reporting the concept. */
  unitId: EsrsUnitId
  /** Period type from the official taxonomy (duration or instant). */
  periodType: PeriodType
  /** Default decimals attribute to use in the XBRL instance. */
  decimals: string
  /** Optional description of the datapoint. */
  label: string
}

export const esrsConcepts = {
  grossScope1Emissions: {
    qname: `${ESRS_PREFIX}:GrossScope1GreenhouseGasEmissions`,
    unitId: 'u_tonnesCO2e',
    periodType: 'duration',
    decimals: '0',
    label: 'Gross Scope 1 greenhouse gas emissions (ESRS E1-6.4)',
  },
  grossMarketBasedScope2Emissions: {
    qname: `${ESRS_PREFIX}:GrossMarketBasedScope2GreenhouseGasEmissions`,
    unitId: 'u_tonnesCO2e',
    periodType: 'duration',
    decimals: '0',
    label: 'Gross market-based Scope 2 greenhouse gas emissions (ESRS E1-6.4)',
  },
  grossLocationBasedScope2Emissions: {
    qname: `${ESRS_PREFIX}:GrossLocationBasedScope2GreenhouseGasEmissions`,
    unitId: 'u_tonnesCO2e',
    periodType: 'duration',
    decimals: '0',
    label: 'Gross location-based Scope 2 greenhouse gas emissions (ESRS E1-6.4)',
  },
  grossScope3Emissions: {
    qname: `${ESRS_PREFIX}:GrossScope3GreenhouseGasEmissions`,
    unitId: 'u_tonnesCO2e',
    periodType: 'duration',
    decimals: '0',
    label: 'Gross Scope 3 greenhouse gas emissions (ESRS E1-6.4)',
  },
  grossTotalEmissions: {
    qname: `${ESRS_PREFIX}:GrossGreenhouseGasEmissions`,
    unitId: 'u_tonnesCO2e',
    periodType: 'duration',
    decimals: '0',
    label: 'Gross total greenhouse gas emissions (ESRS E1-6.4)',
  },
  biogenicScope1Emissions: {
    qname: `${ESRS_PREFIX}:BiogenicEmissionsOfCO2FromCombustionOrBiodegradationOfBiomassNotIncludedInScope1GHGEmissions`,
    unitId: 'u_tonnesCO2e',
    periodType: 'duration',
    decimals: '0',
    label: 'Biogenic CO₂ emissions excluded from Scope 1 (ESRS E1-7.3)',
  },
  biogenicScope2Emissions: {
    qname: `${ESRS_PREFIX}:BiogenicEmissionsOfCO2FromCombustionOrBiodegradationOfBiomassNotIncludedInScope2GHGEmissions`,
    unitId: 'u_tonnesCO2e',
    periodType: 'duration',
    decimals: '0',
    label: 'Biogenic CO₂ emissions excluded from Scope 2 (ESRS E1-7.3)',
  },
  biogenicScope3Emissions: {
    qname: `${ESRS_PREFIX}:BiogenicEmissionsOfCO2FromCombustionOrBiodegradationOfBiomassThatOccurInUpstreamAndDownstreamValueChainNotIncludedInScope3GHGEmissions`,
    unitId: 'u_tonnesCO2e',
    periodType: 'duration',
    decimals: '0',
    label: 'Biogenic CO₂ emissions excluded from Scope 3 (ESRS E1-7.3)',
  },
} as const satisfies Record<string, EsrsConceptDefinition>

export type EsrsConcept = (typeof esrsConcepts)[EsrsConceptKey]
