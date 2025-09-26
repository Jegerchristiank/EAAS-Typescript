/**
 * Klientutility til at downloade PDF-rapporten uden SSR-konflikt.
 */
'use client'

import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { EsgReportPdf } from '@org/shared'
import type { CalculatedModuleResult } from '@org/shared'

export async function downloadReport(results: CalculatedModuleResult[]): Promise<void> {
  const printable = results.filter((entry) => !entry.result.assumptions.includes('Stubberegning'))
  if (!printable.length) {
    console.warn('Ingen beregninger til PDF-download endnu.')
    return
  }
  const blob = await pdf(<EsgReportPdf results={printable} />).toBlob()
  saveAs(blob, 'esg-rapport.pdf')
}
