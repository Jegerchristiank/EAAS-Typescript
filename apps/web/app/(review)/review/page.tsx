/**
 * Review-side med overblik og PDF-download entrypoint.
 */
'use client'

import Link from 'next/link'
import { useMemo, type CSSProperties } from 'react'

import { PrimaryButton } from '../../../components/ui/PrimaryButton'
import { downloadReport } from '../../../features/pdf/downloadClient'
import { useLiveResults } from '../../../features/results/useLiveResults'

import type { CalculatedModuleResult } from '@org/shared'

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
    () => results.filter((entry) => !entry.result.assumptions.includes('Stubberegning')),
    [results]
  )

  const primaryModuleIds = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'] as const
  type PrimaryModuleId = (typeof primaryModuleIds)[number]
  const primaryResults = primaryModuleIds
    .map((moduleId) => printable.find((entry) => entry.moduleId === moduleId) ?? null)
    .filter((entry): entry is CalculatedModuleResult => entry !== null)
  const secondaryResults = printable.filter(
    (entry) => !primaryModuleIds.includes(entry.moduleId as PrimaryModuleId)
  )

  const handleDownload = async (): Promise<void> => {
    await downloadReport(printable)
  }

  return (
    <main style={{ padding: '2rem', display: 'grid', gap: '2rem', alignContent: 'start' }}>
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <h1>Review og download</h1>
        <p style={{ maxWidth: '48rem' }}>
          Et overblik over de vigtigste Scope 2-moduler. Eksporter rapporten som PDF for at dele den med resten af organisationen.
        </p>
      </header>

      {primaryResults.length > 0 ? (
        <section style={{ display: 'grid', gap: '1.5rem' }}>
          {primaryResults.map((entry) => (
            <ResultCard key={entry.moduleId} entry={entry} />
          ))}
        </section>
      ) : (
        <EmptyCard />
      )}

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

function ResultCard({ entry }: { entry: CalculatedModuleResult }): JSX.Element {
  const { result } = entry
  return (
    <section style={cardStyle}>
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <h2 style={{ margin: 0 }}>{entry.title}</h2>
        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
          {result.value} {result.unit}
        </p>
      </header>
      <div>
        <strong>Antagelser</strong>
        <ul>
          {result.assumptions.map((assumption, index) => (
            <li key={`${entry.moduleId}-assumption-${index}`}>{assumption}</li>
          ))}
        </ul>
      </div>
      {result.warnings.length > 0 && (
        <div>
          <strong>Advarsler</strong>
          <ul>
            {result.warnings.map((warning, index) => (
              <li key={`${entry.moduleId}-warning-${index}`}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      <details>
        <summary>Trace</summary>
        <ul>
          {result.trace.map((traceEntry, index) => (
            <li key={`${entry.moduleId}-trace-${index}`} style={{ fontFamily: 'monospace' }}>
              {traceEntry}
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
        Når du udfylder modulerne B1, B2, B3, B4, B5 eller B6 i wizardens første trin, vises resultaterne her.
      </p>
    </section>
  )
}
