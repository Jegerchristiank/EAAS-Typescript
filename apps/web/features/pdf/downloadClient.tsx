/**
 * Klientutility til at downloade PDF-rapporten uden SSR-konflikt.
 */
'use client'

import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { aggregateResults, EsgReportPdf, type ModuleInput } from '@org/shared'

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
