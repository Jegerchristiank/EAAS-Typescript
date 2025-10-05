/**
 * Review-side med overblik og PDF-download entrypoint.
 */
'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import { PrimaryButton } from '../../../components/ui/PrimaryButton'
import { downloadReport } from '../../../features/pdf/downloadClient'
import ReportPreviewClient from '../../../features/pdf/ReportPreviewClient'
import { useLiveResults } from '../../../features/results/useLiveResults'

import type { CalculatedModuleResult } from '@org/shared'

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
    <main className="ds-page ds-stack">
      <header className="ds-stack-sm">
        <p className="ds-text-subtle">Version 4 · Resultatoversigt og rapport</p>
        <h1 className="ds-heading-lg">Review og download</h1>
        <p className="ds-text-muted">
          Få et samlet overblik over beregnede Scope 1-, Scope 3- og governance-resultater. D1-modulet leverer en samlet score,
          som indgår direkte i PDF-rapporten.
        </p>
      </header>

      {primaryResults.length > 0 ? (
        <section className="ds-stack">
          <h2 className="ds-section-heading">Primære Scope 2-moduler</h2>
          <div className="ds-stack">
            {primaryResults.map((entry) => (
              <ResultCard key={entry.moduleId} entry={entry} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyCard />
      )}

      {secondaryResults.length > 0 && (
        <section className="ds-stack">
          <div className="ds-stack-sm">
            <h2 className="ds-section-heading">Andre moduler</h2>
            <p className="ds-text-subtle">
              Omfatter Scope 1-, Scope 3- og governance-resultater, som supplerer Scope 2-beregningerne.
            </p>
          </div>
          <div className="ds-stack">
            {secondaryResults.map((entry) => (
              <ResultCard key={entry.moduleId} entry={entry} />
            ))}
          </div>
        </section>
      )}

      {printable.length > 0 && (
        <section className="ds-stack">
          <div className="ds-stack-sm">
            <h2 className="ds-section-heading">PDF-preview</h2>
            <p className="ds-text-subtle">
              Forhåndsvis rapporten direkte i browseren. Download-knappen genererer den samme rapport lokalt.
            </p>
          </div>
          <div className="ds-scroll-panel" data-size="tall">
            <ReportPreviewClient results={printable} />
          </div>
        </section>
      )}

      <section className="ds-toolbar">
        <PrimaryButton onClick={handleDownload} disabled={!printable.length}>
          Download PDF
        </PrimaryButton>
        <PrimaryButton as={Link} href="/wizard" variant="ghost">
          Tilbage til wizard
        </PrimaryButton>
      </section>

      <details className="ds-card">
        <summary>Se rå data</summary>
        <pre className="ds-summary ds-code">{JSON.stringify(printable, null, 2)}</pre>
      </details>
    </main>
  )
}

function ResultCard({ entry }: { entry: CalculatedModuleResult }): JSX.Element {
  const { result } = entry
  return (
    <section className="ds-card">
      <header className="ds-stack-sm">
        <h3 className="ds-heading-sm">{entry.title}</h3>
        <p className="ds-value">
          {result.value} {result.unit}
        </p>
      </header>
      <div className="ds-stack-sm">
        <strong>Antagelser</strong>
        <ul>
          {result.assumptions.map((assumption, index) => (
            <li key={`${entry.moduleId}-assumption-${index}`}>{assumption}</li>
          ))}
        </ul>
      </div>
      {result.warnings.length > 0 && (
        <div className="ds-stack-sm">
          <strong>Advarsler</strong>
          <ul>
            {result.warnings.map((warning, index) => (
              <li key={`${entry.moduleId}-warning-${index}`}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      <details className="ds-summary">
        <summary>Trace</summary>
        <ul>
          {result.trace.map((traceEntry, index) => (
            <li key={`${entry.moduleId}-trace-${index}`} className="ds-code">
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
    <section className="ds-card ds-card--muted">
      <h2 className="ds-heading-sm">Ingen data endnu</h2>
      <p>
        Når du udfylder de beregningsklare moduler vises resultaterne her. Governance-modulet D1 beregner en samlet score for
        metode, screening og politikker.
      </p>
    </section>
  )
}
