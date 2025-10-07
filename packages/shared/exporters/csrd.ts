import JSZip from 'jszip'
import {
  ESRS_NAMESPACE,
  ESRS_PREFIX,
  EsrsConceptDefinition,
  EsrsConceptKey,
  UTR_NAMESPACE,
  esrsConcepts,
  esrsUnits,
  EsrsUnitId,
} from './esrsTaxonomy'

const XBRL_INSTANCE_NAMESPACE = 'http://www.xbrl.org/2003/instance'
const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink'
const LINK_NAMESPACE = 'http://www.xbrl.org/2003/linkbase'

export type ReportingPeriod = {
  start: string
  end: string
}

export type CsrdEntity = {
  identifier: string
  scheme: string
}

export type CsrdMetricValues = Partial<Record<EsrsConceptKey, number | null | undefined>>

export type CsrdDecimalsOverride = Partial<Record<EsrsConceptKey, string | null | undefined>>

export type BuildXbrlInstanceOptions = {
  /** Legal entity information used in the `<xbrli:entity>` block. */
  entity: CsrdEntity
  /** Reporting period boundaries used for all duration facts. */
  period: ReportingPeriod
  /** Optional instant date for instant concepts (defaults to period.end). */
  instantDate?: string
  /** Numeric datapoints mapped to ESRS taxonomy concepts. */
  metrics: CsrdMetricValues
  /** Allow callers to override the default decimals attribute per datapoint. */
  decimalsOverride?: CsrdDecimalsOverride
  /** Allow callers to opt out of schemaRef emission for custom entry points. */
  schemaRef?: string
}

export type BuildCsrdReportPackageOptions = BuildXbrlInstanceOptions & {
  /** Optional manifest payload that will be merged with the defaults. */
  manifest?: Record<string, unknown>
}

export type CsrdReportPackage = {
  /** Raw instance document (UTF-8). */
  instance: string
  /** Binary ZIP payload ready for download or upload. */
  archive: Uint8Array
}

const DEFAULT_SCHEMA_REF = 'https://xbrl.efrag.org/taxonomy/esrs/2023-12-22/esrs_all.xsd'

const DURATION_CONTEXT_ID = 'ctx_duration'
const INSTANT_CONTEXT_ID = 'ctx_instant'

const UNIT_ID_PREFIX = 'unit_'

function getUnitMeasure(unitId: EsrsUnitId): { namespace: string; name: string } {
  const unit = esrsUnits[unitId]
  if (!unit) {
    throw new Error(`Unknown ESRS unit: ${unitId}`)
  }

  return unit.measure
}

function formatNumber(value: number, decimals: string): string {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid numeric value for XBRL export: ${value}`)
  }

  if (decimals === 'INF') {
    return value.toString()
  }

  const decimalsNumber = Number.parseInt(decimals, 10)
  if (Number.isNaN(decimalsNumber)) {
    return value.toString()
  }

  return value.toFixed(decimalsNumber)
}

export function buildXbrlInstance(options: BuildXbrlInstanceOptions): string {
  const { entity, period, instantDate = period.end, metrics, decimalsOverride, schemaRef } = options
  const metricEntries: CsrdMetricValues = metrics ?? {}

  if (!entity.identifier) {
    throw new Error('Entity identifier is required to build an XBRL instance')
  }

  if (!entity.scheme) {
    throw new Error('Entity scheme is required to build an XBRL instance')
  }

  const durationFacts: Array<{
    conceptKey: EsrsConceptKey
    value: number
    unitId: EsrsUnitId
    decimals: string
  }> = []

  const instantFacts: Array<{
    conceptKey: EsrsConceptKey
    value: number
    unitId: EsrsUnitId
    decimals: string
  }> = []

  for (const conceptKey of Object.keys(metricEntries) as EsrsConceptKey[]) {
    const rawValue = metricEntries[conceptKey]
    if (rawValue === null || rawValue === undefined) {
      continue
    }

    const concept = esrsConcepts[conceptKey] as EsrsConceptDefinition
    if (!concept) {
      throw new Error(`Unknown ESRS concept key: ${conceptKey}`)
    }

    const decimals = decimalsOverride?.[conceptKey] ?? concept.decimals

    const fact = {
      conceptKey,
      value: rawValue,
      unitId: concept.unitId,
      decimals,
    }

    if (concept.periodType === 'instant') {
      instantFacts.push(fact)
    } else {
      durationFacts.push(fact)
    }
  }

  const usedFacts = [...durationFacts, ...instantFacts]
  if (usedFacts.length === 0) {
    throw new Error('At least one datapoint is required to build an XBRL instance')
  }

  const usedUnits = new Set<EsrsUnitId>(usedFacts.map((fact) => fact.unitId))

  const namespacePrefixes = new Map<string, string>([[UTR_NAMESPACE, 'utr']])
  usedUnits.forEach((unitId) => {
    const measure = getUnitMeasure(unitId)
    if (!namespacePrefixes.has(measure.namespace)) {
      namespacePrefixes.set(measure.namespace, `ns${namespacePrefixes.size}`)
    }
  })

  const namespaceAttributes = [
    `xmlns:xbrli="${XBRL_INSTANCE_NAMESPACE}"`,
    `xmlns:xlink="${XLINK_NAMESPACE}"`,
    `xmlns:link="${LINK_NAMESPACE}"`,
    `xmlns:${ESRS_PREFIX}="${ESRS_NAMESPACE}"`,
  ]

  namespacePrefixes.forEach((prefix, namespace) => {
    namespaceAttributes.push(`xmlns:${prefix}="${namespace}"`)
  })

  const xmlParts: string[] = []
  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>')
  xmlParts.push(`<xbrli:xbrl ${namespaceAttributes.join(' ')}>`)

  xmlParts.push(
    `  <link:schemaRef xlink:type="simple" xlink:href="${schemaRef ?? DEFAULT_SCHEMA_REF}"/>`,
  )

  if (durationFacts.length > 0) {
    xmlParts.push('  <xbrli:context id="' + DURATION_CONTEXT_ID + '">')
    xmlParts.push('    <xbrli:entity>')
    xmlParts.push(
      `      <xbrli:identifier scheme="${entity.scheme}">${entity.identifier}</xbrli:identifier>`,
    )
    xmlParts.push('    </xbrli:entity>')
    xmlParts.push('    <xbrli:period>')
    xmlParts.push(`      <xbrli:startDate>${period.start}</xbrli:startDate>`)
    xmlParts.push(`      <xbrli:endDate>${period.end}</xbrli:endDate>`)
    xmlParts.push('    </xbrli:period>')
    xmlParts.push('  </xbrli:context>')
  }

  if (instantFacts.length > 0) {
    xmlParts.push('  <xbrli:context id="' + INSTANT_CONTEXT_ID + '">')
    xmlParts.push('    <xbrli:entity>')
    xmlParts.push(
      `      <xbrli:identifier scheme="${entity.scheme}">${entity.identifier}</xbrli:identifier>`,
    )
    xmlParts.push('    </xbrli:entity>')
    xmlParts.push('    <xbrli:period>')
    xmlParts.push(`      <xbrli:instant>${instantDate}</xbrli:instant>`)
    xmlParts.push('    </xbrli:period>')
    xmlParts.push('  </xbrli:context>')
  }

  usedUnits.forEach((unitId) => {
    const measure = getUnitMeasure(unitId)
    const prefix = namespacePrefixes.get(measure.namespace)
    if (!prefix) {
      throw new Error(`Missing namespace prefix for unit namespace: ${measure.namespace}`)
    }

    xmlParts.push(`  <xbrli:unit id="${UNIT_ID_PREFIX}${unitId}">`)
    xmlParts.push(`    <xbrli:measure>${prefix}:${measure.name}</xbrli:measure>`)
    xmlParts.push('  </xbrli:unit>')
  })

  const appendFact = (
    fact:
      | (typeof durationFacts)[number]
      | (typeof instantFacts)[number],
    contextRef: string,
  ) => {
    const concept = esrsConcepts[fact.conceptKey]
    const conceptQName = concept.qname
    const factValue = formatNumber(fact.value, fact.decimals)
    xmlParts.push(
      `  <${conceptQName} contextRef="${contextRef}" unitRef="${UNIT_ID_PREFIX}${fact.unitId}" decimals="${fact.decimals}">${factValue}</${conceptQName}>`,
    )
  }

  durationFacts.forEach((fact) => appendFact(fact, DURATION_CONTEXT_ID))
  instantFacts.forEach((fact) => appendFact(fact, INSTANT_CONTEXT_ID))

  xmlParts.push('</xbrli:xbrl>')

  return xmlParts.join('\n')
}

export async function buildCsrdReportPackage(
  options: BuildCsrdReportPackageOptions,
): Promise<CsrdReportPackage> {
  const instance = buildXbrlInstance(options)

  const zip = new JSZip()
  zip.file('reports/csrd-instance.xbrl', instance)

  const manifestPayload = {
    entryPoint: options.schemaRef ?? DEFAULT_SCHEMA_REF,
    generatedAt: new Date().toISOString(),
    entity: options.entity,
    period: options.period,
    instantDate: options.instantDate ?? options.period.end,
    concepts: (Object.keys(options.metrics) as EsrsConceptKey[])
      .filter((key) => options.metrics[key] !== null && options.metrics[key] !== undefined)
      .map((key) => esrsConcepts[key]?.qname ?? key),
    ...options.manifest,
  }

  zip.file('manifest.json', JSON.stringify(manifestPayload, null, 2))

  const archive = await zip.generateAsync({ type: 'uint8array' })

  return {
    archive,
    instance,
  }
}
