/**
 * Hjælpere til at eksportere beregnede resultater som CSRD/XBRL-pakker.
 */
import { groupResultsByEsrs } from '../reporting/esrsLayout'
import type { CalculatedModuleResult } from '../types'

export type ReportPackageOptions = {
  profileId: string
  organisation?: string
  auditTrail?: Record<string, unknown>
  responsibilities?: Record<string, unknown>
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
  const facts = results
    .map(
      (entry) =>
        `    <fact moduleId="${entry.moduleId}" unit="${entry.result.unit}">${entry.result.value}</fact>`,
    )
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance">',
    `  <xbrli:context id="${options.profileId}">`,
    `    <xbrli:entity>${options.organisation ?? 'unknown-org'}</xbrli:entity>`,
    `    <xbrli:period>${generatedAt}</xbrli:period>`,
    '  </xbrli:context>',
    facts,
    '</xbrli:xbrl>',
  ].join('\n')
}

export function buildSubmissionPayload(
  results: CalculatedModuleResult[],
  options: ReportPackageOptions & { includeXbrl?: boolean },
): SubmissionPayload {
  const csrd = buildCsrdReportPackage(results, options)
  const payload: SubmissionPayload = { csrd }

  if (options.includeXbrl) {
    payload.xbrl = buildXbrlInstance(results, options)
  }

  return payload
}
