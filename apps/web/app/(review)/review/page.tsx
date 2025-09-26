/**
 * Review-side med overblik og PDF-download entrypoint.
*/
'use client'
import Link from 'next/link'
import { useLiveResults } from '../../../features/results/useLiveResults'
import { downloadReport } from '../../../features/pdf/downloadClient'
import { PrimaryButton } from '../../../components/ui/PrimaryButton'

export default function ReviewPage(): JSX.Element {
  const { results } = useLiveResults()

  const handleDownload = async (): Promise<void> => {
    await downloadReport(results)
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Review og download</h1>
      <pre>{JSON.stringify(results, null, 2)}</pre>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <PrimaryButton onClick={handleDownload}>Download PDF</PrimaryButton>
        <PrimaryButton as={Link} href="/wizard">
          Tilbage til wizard
        </PrimaryButton>
      </div>
    </main>
  )
}
