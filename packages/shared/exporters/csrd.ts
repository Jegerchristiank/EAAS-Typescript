/**
 * Hjælpere til at eksportere beregnede resultater som CSRD/XBRL-pakker.
 */
import { groupResultsByEsrs } from '../reporting/esrsLayout'
import type { CalculatedModuleResult } from '../types'
import {
  ESRS_NAMESPACES,
  ESRS_TAXONOMY_SCHEMA_REF,
  getConceptForModule,
  resolveUnit,
  type UnitDefinition,
} from './esrsTaxonomy'

export type ReportPackageOptions = {
  profileId: string
  organisation?: string
  auditTrail?: Record<string, unknown>
  responsibilities?: Record<string, unknown>
  reportingPeriod?: {
    start?: string
    end?: string
  }
  entityIdentifier?: {
    scheme: string
    value: string
  }
}

export type CsrdReportPackage = {
  format: 'csrd-json'
  generatedAt: string
  profileId: string
  organisation?: string
  sections: {
    general: Array<ReturnType<typeof mapModuleToPayload>>
    policies: Array<ReturnType<typeof mapModuleToPayload>>
    targets: Array<ReturnType<typeof mapModuleToPayload>>
    metrics: Array<{
      id: string
      title: string
      description: string
      modules: Array<ReturnType<typeof mapModuleToPayload>>
    }>
    doubleMateriality: ReturnType<typeof mapDoubleMateriality> | null
  }
  auditTrail?: Record<string, unknown>
  responsibilities?: Record<string, unknown>
}

export type XbrlInstanceOptions = {
  profileId: string
  organisation?: string
  reportingPeriod?: {
    start?: string
    end?: string
  }
  entityIdentifier?: {
    scheme: string
    value: string
  }
}

export type SubmissionPayload = {
  csrd: CsrdReportPackage
  xbrl?: string
}

function mapModuleToPayload(entry: CalculatedModuleResult) {
  return {
    moduleId: entry.moduleId,
    title: entry.title,
    value: entry.result.value,
    unit: entry.result.unit,
    warnings: entry.result.warnings,
    assumptions: entry.result.assumptions,
    narratives: entry.result.narratives ?? [],
    responsibilities: entry.result.responsibilities ?? [],
    notes: entry.result.notes ?? [],
    doubleMateriality: entry.result.doubleMateriality ?? null,
  }
}

function mapDoubleMateriality(entry: CalculatedModuleResult | null) {
  if (!entry?.result.doubleMateriality) {
    return null
  }
  return {
    moduleId: entry.moduleId,
    title: entry.title,
    ...entry.result.doubleMateriality,
  }
}

export function buildCsrdReportPackage(
  results: CalculatedModuleResult[],
  options: ReportPackageOptions,
): CsrdReportPackage {
  const layout = groupResultsByEsrs(results)
  const generatedAt = new Date().toISOString()

  const pkg: CsrdReportPackage = {
    format: 'csrd-json',
    generatedAt,
    profileId: options.profileId,
    sections: {
      general: layout.general.map(mapModuleToPayload),
      policies: layout.policies.map(mapModuleToPayload),
      targets: layout.targets.map(mapModuleToPayload),
      metrics: layout.metrics.map((section) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        modules: section.modules.map(mapModuleToPayload),
      })),
      doubleMateriality: mapDoubleMateriality(layout.doubleMateriality),
    },
  }

  if (options.organisation) {
    pkg.organisation = options.organisation
  }

  if (options.auditTrail) {
    pkg.auditTrail = options.auditTrail
  }

  if (options.responsibilities) {
    pkg.responsibilities = options.responsibilities
  }

  return pkg
}

export function buildXbrlInstance(
  results: CalculatedModuleResult[],
  options: XbrlInstanceOptions,
): string {
  const generatedAt = new Date().toISOString()
  const { durationContext, instantContext } = buildContexts(options, generatedAt)
  const entity = normaliseEntityIdentifier(options)
  const usedUnits = new Map<string, UnitDefinition>()

  const facts = results.map((entry) => {
    const concept = getConceptForModule(entry.moduleId)
    if (!concept) {
      throw new Error(`No ESRS concept mapping found for module ${entry.moduleId}`)
    }

    const unit = resolveUnit(concept.unitId, entry.result.unit)
    usedUnits.set(unit.id, unit)

    const contextRef = concept.periodType === 'instant' ? instantContext.id : durationContext.id
    const decimals = typeof concept.decimals === 'number' ? concept.decimals.toString() : concept.decimals

    return `  <${concept.concept} contextRef="${contextRef}" unitRef="${unit.id}" decimals="${decimals}">${formatNumber(entry.result.value)}</${concept.concept}>`
  })

  const contextXml = [
    renderDurationContext(durationContext, entity),
    renderInstantContext(instantContext, entity),
  ].join('\n')

  const unitXml = Array.from(usedUnits.values())
    .map(renderUnit)
    .join('\n')

  const namespaces = [
    `xmlns:xbrli="${ESRS_NAMESPACES.xbrli}"`,
    `xmlns:link="${ESRS_NAMESPACES.link}"`,
    `xmlns:xlink="${ESRS_NAMESPACES.xlink}"`,
    `xmlns:iso4217="${ESRS_NAMESPACES.iso4217}"`,
    `xmlns:esrs="${ESRS_NAMESPACES.esrs}"`,
  ].join(' ')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<xbrli:xbrl ${namespaces}>`,
    `  <link:schemaRef xlink:type="simple" xlink:href="${ESRS_TAXONOMY_SCHEMA_REF}" />`,
    contextXml,
    unitXml,
    facts.join('\n'),
    '</xbrli:xbrl>',
  ]
    .filter(Boolean)
    .join('\n')
}

type EntityIdentifier = { scheme: string; value: string }

type DurationContext = { id: string; startDate: string; endDate: string }
type InstantContext = { id: string; instant: string }

function buildContexts(options: XbrlInstanceOptions, generatedAt: string) {
  const generatedDate = new Date(generatedAt)
  const endDate = parseDate(options.reportingPeriod?.end, generatedDate)
  const startDate = options.reportingPeriod?.start
    ? parseDate(options.reportingPeriod.start, endDate)
    : defaultStartDate(endDate)

  if (startDate.getTime() > endDate.getTime()) {
    startDate.setTime(endDate.getTime())
  }

  const durationContext: DurationContext = {
    id: 'CurrentReportingPeriod',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  }

  const instantContext: InstantContext = {
    id: 'ReportingDate',
    instant: formatDate(endDate),
  }

  return { durationContext, instantContext }
}

function parseDate(value: string | undefined, fallback: Date): Date {
  if (!value) {
    return new Date(fallback)
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return new Date(fallback)
  }
  return parsed
}

function defaultStartDate(endDate: Date): Date {
  return new Date(Date.UTC(endDate.getUTCFullYear(), 0, 1))
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function formatNumber(value: number): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString()
  }
  throw new Error('XBRL facts must contain a finite numeric value')
}

function normaliseEntityIdentifier(options: XbrlInstanceOptions): EntityIdentifier {
  if (options.entityIdentifier) {
    return options.entityIdentifier
  }
  const rawValue = options.organisation ?? options.profileId
  const value = rawValue.trim().replace(/\s+/g, '_') || options.profileId
  return {
    scheme: 'https://example.com/esrs/profile',
    value,
  }
}

function renderDurationContext(
  context: DurationContext,
  entity: EntityIdentifier,
): string {
  return [
    `  <xbrli:context id="${context.id}">`,
    renderEntity(entity, '    '),
    '    <xbrli:period>',
    `      <xbrli:startDate>${context.startDate}</xbrli:startDate>`,
    `      <xbrli:endDate>${context.endDate}</xbrli:endDate>`,
    '    </xbrli:period>',
    '  </xbrli:context>',
  ].join('\n')
}

function renderInstantContext(
  context: InstantContext,
  entity: EntityIdentifier,
): string {
  return [
    `  <xbrli:context id="${context.id}">`,
    renderEntity(entity, '    '),
    '    <xbrli:period>',
    `      <xbrli:instant>${context.instant}</xbrli:instant>`,
    '    </xbrli:period>',
    '  </xbrli:context>',
  ].join('\n')
}

function renderEntity(entity: EntityIdentifier, indent: string): string {
  return [
    `${indent}<xbrli:entity>`,
    `${indent}  <xbrli:identifier scheme="${entity.scheme}">${entity.value}</xbrli:identifier>`,
    `${indent}</xbrli:entity>`,
  ].join('\n')
}

function renderUnit(unit: UnitDefinition): string {
  if (unit.type === 'divide') {
    return [
      `  <xbrli:unit id="${unit.id}">`,
      '    <xbrli:divide>',
      '      <xbrli:unitNumerator>',
      `        <xbrli:measure>${unit.numerator}</xbrli:measure>`,
      '      </xbrli:unitNumerator>',
      '      <xbrli:unitDenominator>',
      `        <xbrli:measure>${unit.denominator}</xbrli:measure>`,
      '      </xbrli:unitDenominator>',
      '    </xbrli:divide>',
      '  </xbrli:unit>',
    ].join('\n')
  }

  return [
    `  <xbrli:unit id="${unit.id}">`,
    `    <xbrli:measure>${unit.measure}</xbrli:measure>`,
    '  </xbrli:unit>',
  ].join('\n')
}

export function buildSubmissionPayload(
  results: CalculatedModuleResult[],
  options: ReportPackageOptions & { includeXbrl?: boolean },
): SubmissionPayload {
  const csrd = buildCsrdReportPackage(results, options)
  const payload: SubmissionPayload = { csrd }

  if (options.includeXbrl) {
    const xbrlOptions: XbrlInstanceOptions = {
      profileId: options.profileId,
    }

    if (options.organisation) {
      xbrlOptions.organisation = options.organisation
    }

    if (options.reportingPeriod) {
      xbrlOptions.reportingPeriod = options.reportingPeriod
    }

    if (options.entityIdentifier) {
      xbrlOptions.entityIdentifier = options.entityIdentifier
    }

    payload.xbrl = buildXbrlInstance(results, xbrlOptions)
  }

  return payload
}
