/**
 * Review-side med overblik og PDF-download entrypoint.
 */
'use client'

import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import type { ModuleResult } from '@org/shared'
import { useLiveResults } from '../../../features/results/useLiveResults'
import { downloadReport } from '../../../features/pdf/downloadClient'
import { PrimaryButton } from '../../../components/ui/PrimaryButton'

const cardStyle: CSSProperties = {
  padding: '1.5rem',
  borderRadius: '0.75rem',
  border: '1px solid #d0d7d5',
  background: '#fff',
  display: 'grid',
  gap: '0.75rem'
}

export default function ReviewPage(): JSX.Element {
  const { results } = useLiveResults()

  const printable = useMemo(
    () => results.filter((result) => !result.assumptions.includes('Stubberegning')),
    [results]
  )

  const b1Result = printable.find((result) => result.moduleId === 'B1') ?? null
  const secondaryResults = printable.filter((result) => result.moduleId !== 'B1')

  const handleDownload = async (): Promise<void> => {
    await downloadReport(printable)
  }

  return (
    <main style={{ padding: '2rem', display: 'grid', gap: '2rem', alignContent: 'start' }}>
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <h1>Review og download</h1>
        <p style={{ maxWidth: '48rem' }}>
          Et overblik over beregningerne for modul B1. Eksporter rapporten som PDF for at dele den med
          resten af organisationen.
        </p>
      </header>

      {b1Result ? <ResultCard result={b1Result} /> : <EmptyCard />}

      {secondaryResults.length > 0 && (
        <section style={{ display: 'grid', gap: '1rem' }}>
          <h2>Andre moduler</h2>
          <p style={{ margin: 0, color: '#555' }}>
            De øvrige moduler er endnu ikke konfigureret. De vises her, når deres beregninger er klar.
          </p>
        </section>
      )}

      <section style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <PrimaryButton onClick={handleDownload} disabled={!printable.length}>
          Download PDF
        </PrimaryButton>
        <PrimaryButton as={Link} href="/wizard">
          Tilbage til wizard
        </PrimaryButton>
      </section>

      <details>
        <summary>Se rå data</summary>
        <pre style={{ background: '#f8faf9', padding: '1rem', borderRadius: '0.5rem' }}>
          {JSON.stringify(printable, null, 2)}
        </pre>
      </details>
    </main>
  )
}

function ResultCard({ result }: { result: ModuleResult }): JSX.Element {
  return (
    <section style={cardStyle}>
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <h2 style={{ margin: 0 }}>{result.title ?? `Modul ${result.moduleId}`}</h2>
        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
          {result.value} {result.unit ?? ''}
        </p>
      </header>
      <div>
        <strong>Antagelser</strong>
        <ul>
          {result.assumptions.map((assumption, index) => (
            <li key={`${result.moduleId}-assumption-${index}`}>{assumption}</li>
          ))}
        </ul>
      </div>
      {result.warnings.length > 0 && (
        <div>
          <strong>Advarsler</strong>
          <ul>
            {result.warnings.map((warning, index) => (
              <li key={`${result.moduleId}-warning-${index}`}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      <details>
        <summary>Trace</summary>
        <ul>
          {result.trace.map((entry, index) => (
            <li key={`${result.moduleId}-trace-${index}`} style={{ fontFamily: 'monospace' }}>
              {entry}
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}

function EmptyCard(): JSX.Element {
  return (
    <section style={{ ...cardStyle, background: '#f8faf9', borderStyle: 'dashed' }}>
      <h2 style={{ margin: 0 }}>Ingen data endnu</h2>
      <p style={{ margin: 0 }}>
        Når du udfylder modul B1 i wizardens første trin, vises resultatet her.
      </p>
    </section>
  )
}
