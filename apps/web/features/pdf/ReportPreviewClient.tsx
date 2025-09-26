/**
 * Klientkomponent der viser PDF-preview via dynamic import.
 */
'use client'

import dynamic from 'next/dynamic'
import type { ModuleResult } from '@org/shared'

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.PDFViewer), {
  ssr: false
})
const DocumentComponent = dynamic(() => import('@org/shared').then((mod) => mod.EsgReportPdf), {
  ssr: false
})

export default function ReportPreviewClient({ results }: { results: ModuleResult[] }): JSX.Element {
  if (!results.length) {
    return <p>Ingen resultater at vise endnu.</p>
  }

  return (
    <PDFViewer style={{ width: '100%', height: '80vh' }}>
      <DocumentComponent results={results} />
    </PDFViewer>
  )
}
