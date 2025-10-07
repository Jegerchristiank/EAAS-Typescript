/**
 * Hjælpefunktioner til at opbygge et minimalt CSRD/XBRL-rapporteringspayload.
 */
import { esrsConceptList, esrsNamespace, type EsrsEmissionConceptKey } from './esrsTaxonomy'
import { moduleIds, type CalculatedModuleResult, type ModuleId, type ModuleResult } from '../types'

const scope1ModuleIds = moduleIds.filter((id) => id.startsWith('A'))
const scope2LocationBasedModuleIds = moduleIds.filter((id) => id.startsWith('B') && Number(id.slice(1)) <= 6)
const scope2MarketAdjustmentModuleIds = moduleIds.filter((id) => id.startsWith('B') && Number(id.slice(1)) > 6)
const scope3ModuleIds = moduleIds.filter((id) => id.startsWith('C'))

const emissionUnit = 't CO2e'

export type ReportingPeriod = {
  start: string
  end: string
}

export type EntityIdentifier = {
  scheme: string
  value: string
}

export type XbrlContext = {
  id: string
  entity: EntityIdentifier
  period: ReportingPeriod
}

export type XbrlUnit = {
  id: string
  measures: string[]
}

export type XbrlFact = {
  concept: string
  contextRef: string
  unitRef?: string
  decimals?: string
  value: string
}

export type BuildCsrdReportPackageInput = {
  results: CalculatedModuleResult[]
  reportingPeriod: ReportingPeriod
  entity: EntityIdentifier
  decimals?: number
}

export type CsrdReportPackage = {
  contexts: XbrlContext[]
  units: XbrlUnit[]
  facts: XbrlFact[]
  instance: string
}

type EmissionTotals = Record<EsrsEmissionConceptKey, number>

export function buildCsrdReportPackage({
  results,
  reportingPeriod,
  entity,
  decimals = 3
}: BuildCsrdReportPackageInput): CsrdReportPackage {
  validatePeriod(reportingPeriod)
  validateEntity(entity)

  const totals = calculateEmissionTotals(results)

  const contextId = 'ctx_reporting_period'
  const contexts: XbrlContext[] = [
    {
      id: contextId,
      entity,
      period: reportingPeriod
    }
  ]

  const units: XbrlUnit[] = []
  const unitRefs = new Map<string, string>()

  for (const { definition } of esrsConceptList) {
    if (!unitRefs.has(definition.unitId)) {
      const generatedId = `unit_${definition.unitId}`
      units.push({
        id: generatedId,
        measures: [`utr:${definition.unitId}`]
      })
      unitRefs.set(definition.unitId, generatedId)
    }
  }

  const facts: XbrlFact[] = esrsConceptList.map(({ key, definition }) => {
    const unitRef = unitRefs.get(definition.unitId)
    if (!unitRef) {
      throw new Error(`Mangler unitRef for ${definition.unitId}`)
    }

    return {
      concept: definition.qname,
      contextRef: contextId,
      unitRef,
      decimals: String(decimals),
      value: formatDecimal(totals[key], decimals)
    }
  })

  const instance = buildXbrlInstance({ contexts, units, facts })

  return { contexts, units, facts, instance }
}

export type BuildXbrlInstanceInput = {
  contexts: XbrlContext[]
  units: XbrlUnit[]
  facts: XbrlFact[]
}

export function buildXbrlInstance({ contexts, units, facts }: BuildXbrlInstanceInput): string {
  const schemaRefXml = [
    createSchemaRefXml('taxonomy/esrs/2023-12-22/esrs_all.xsd'),
    createSchemaRefXml('taxonomy/utr.xml')
  ].join('\n')
  const contextXml = contexts.map((context) => createContextXml(context)).join('\n')
  const unitXml = units.map((unit) => createUnitXml(unit)).join('\n')
  const factXml = facts.map((fact) => createFactXml(fact)).join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance"`,
    `            xmlns:link="http://www.xbrl.org/2003/linkbase"`,
    `            xmlns:xlink="http://www.w3.org/1999/xlink"`,
    `            xmlns:utr="http://www.xbrl.org/2009/utr"`,
    `            xmlns:dtr-types="http://www.xbrl.org/dtr/type/2024-01-31"`,
    `            xmlns:esrs="${esrsNamespace}">`,
    schemaRefXml,
    contextXml,
    unitXml,
    factXml,
    '</xbrli:xbrl>'
  ].join('\n')
}

function calculateEmissionTotals(results: CalculatedModuleResult[]): EmissionTotals {
  const resultMap = new Map<ModuleId, ModuleResult>()
  for (const entry of results) {
    resultMap.set(entry.moduleId, entry.result)
  }

  const scope1 = sumTonnes(resultMap, scope1ModuleIds)
  const scope2Location = sumTonnes(resultMap, scope2LocationBasedModuleIds)
  const scope2Adjustments = sumTonnes(resultMap, scope2MarketAdjustmentModuleIds)
  const scope2Market = scope2Location + scope2Adjustments
  const scope3 = sumTonnes(resultMap, scope3ModuleIds)

  return {
    scope1,
    scope2LocationBased: scope2Location,
    scope2MarketBased: scope2Market,
    scope3,
    totalLocationBased: scope1 + scope2Location + scope3,
    totalMarketBased: scope1 + scope2Market + scope3
  }
}

function sumTonnes(resultMap: Map<ModuleId, ModuleResult>, ids: ModuleId[]): number {
  let total = 0
  for (const moduleId of ids) {
    const result = resultMap.get(moduleId)
    if (!result || result.unit !== emissionUnit) {
      continue
    }
    const value = Number(result.value)
    if (Number.isFinite(value)) {
      total += value
    }
  }
  return total
}

function formatDecimal(value: number, decimals: number): string {
  if (!Number.isFinite(value)) {
    return '0'
  }
  const fixed = value.toFixed(decimals)
  const numeric = Number(fixed)
  if (Object.is(numeric, -0)) {
    return '0'
  }
  return numeric.toString()
}

function createContextXml(context: XbrlContext): string {
  return [
    `  <xbrli:context id="${escapeXml(context.id)}">`,
    '    <xbrli:entity>',
    `      <xbrli:identifier scheme="${escapeXml(context.entity.scheme)}">${escapeXml(context.entity.value)}</xbrli:identifier>`,
    '    </xbrli:entity>',
    '    <xbrli:period>',
    `      <xbrli:startDate>${escapeXml(context.period.start)}</xbrli:startDate>`,
    `      <xbrli:endDate>${escapeXml(context.period.end)}</xbrli:endDate>`,
    '    </xbrli:period>',
    '  </xbrli:context>'
  ].join('\n')
}

function createUnitXml(unit: XbrlUnit): string {
  const measures = unit.measures
    .map((measure) => `    <xbrli:measure>${escapeXml(measure)}</xbrli:measure>`)
    .join('\n')
  return [
    `  <xbrli:unit id="${escapeXml(unit.id)}">`,
    measures,
    '  </xbrli:unit>'
  ].join('\n')
}

function createSchemaRefXml(href: string): string {
  return `  <link:schemaRef xlink:type="simple" xlink:href="${escapeXml(href)}" />`
}

function createFactXml(fact: XbrlFact): string {
  const attributes = [
    `contextRef="${escapeXml(fact.contextRef)}"`,
    fact.unitRef ? `unitRef="${escapeXml(fact.unitRef)}"` : null,
    fact.decimals ? `decimals="${escapeXml(fact.decimals)}"` : null
  ]
    .filter((attribute): attribute is string => attribute != null)
    .join(' ')
  return `  <${fact.concept} ${attributes}>${escapeXml(fact.value)}</${fact.concept}>`
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function validatePeriod(period: ReportingPeriod): void {
  if (!period.start || !period.end) {
    throw new Error('Reporting period kræver både start- og slutdato')
  }
}

function validateEntity(entity: EntityIdentifier): void {
  if (!entity.scheme || !entity.value) {
    throw new Error('Entity-identifikator kræver både scheme og value')
  }
}

