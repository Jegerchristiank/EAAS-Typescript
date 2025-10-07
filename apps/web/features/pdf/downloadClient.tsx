/**
 * Klientutility til at downloade PDF-rapporten uden SSR-konflikt.
 */
'use client'

import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import {
  aggregateResults,
  buildCsrdReportPackage,
  buildSubmissionPayload,
  buildXbrlInstance,
  EsgReportPdf,
  type ModuleInput,
  type ReportPackageOptions,
} from '@org/shared'

export async function downloadReport(state: ModuleInput): Promise<void> {
  const aggregated = aggregateResults(state)
  const printable = aggregated.filter((entry) => !entry.result.assumptions.includes('Stubberegning'))
  if (!printable.length) {
    console.warn('Ingen beregninger til PDF-download endnu.')
    return
  }

  const blob = await pdf(<EsgReportPdf results={printable} />).toBlob()
  saveAs(blob, 'esg-rapport.pdf')
}

type ExtendedOptions = ReportPackageOptions & {
  endpoint?: string
  includeXbrl?: boolean
}

function filterPrintable(state: ModuleInput) {
  const aggregated = aggregateResults(state)
  return aggregated.filter((entry) => !entry.result.assumptions.includes('Stubberegning'))
}

export async function downloadCsrdPackage(state: ModuleInput, options: ReportPackageOptions): Promise<void> {
  const printable = filterPrintable(state)
  if (!printable.length) {
    console.warn('Ingen beregninger til CSRD-pakke.')
    return
  }

  if (!options.reportingPeriod || !options.entityIdentifier) {
    console.warn('CSRD-pakken kræver rapporteringsperiode og entity-identifikator.')
    return
  }

  const pkg = buildCsrdReportPackage({
    results: printable,
    reportingPeriod: options.reportingPeriod,
    entity: options.entityIdentifier,
    ...(typeof options.decimals === 'number' ? { decimals: options.decimals } : {}),
  })
  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' })
  const filename = `csrd-${options.profileId}.json`
  saveAs(blob, filename)
}

export async function downloadXbrl(state: ModuleInput, options: ReportPackageOptions): Promise<void> {
  const printable = filterPrintable(state)
  if (!printable.length) {
    console.warn('Ingen beregninger til XBRL-fil.')
    return
  }

  if (!options.reportingPeriod || !options.entityIdentifier) {
    console.warn('XBRL-eksport kræver rapporteringsperiode og entity-identifikator.')
    return
  }

  const instance = buildXbrlInstance(printable, {
    profileId: options.profileId,
    organisation: options.organisation ?? null,
    reportingPeriod: options.reportingPeriod,
    entityIdentifier: options.entityIdentifier,
    ...(typeof options.decimals === 'number' ? { decimals: options.decimals } : {}),
  })
  const blob = new Blob([instance], { type: 'application/xml' })
  const filename = `csrd-${options.profileId}.xbrl`
  saveAs(blob, filename)
}

export async function submitReportPackage(
  state: ModuleInput,
  options: ExtendedOptions,
): Promise<Response | void> {
  const printable = filterPrintable(state)
  if (!printable.length) {
    console.warn('Ingen beregninger at indsende.')
    return
  }

  const endpoint = options.endpoint ?? process.env['NEXT_PUBLIC_REPORT_API_ENDPOINT']
  if (!endpoint) {
    console.warn('Ingen endpoint defineret til indsendelse.')
    return
  }

  const payload = buildSubmissionPayload(printable, options)
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}
