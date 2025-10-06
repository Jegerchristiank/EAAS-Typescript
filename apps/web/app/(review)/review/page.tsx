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
import { ProfileSwitcher } from '../../../features/wizard/ProfileSwitcher'
import { WizardProvider, useWizardContext } from '../../../features/wizard/useWizard'
import { wizardSteps } from '../../../features/wizard/steps'
import { isModuleRelevant, type WizardProfile } from '../../../src/modules/wizard/profile'

import type { CalculatedModuleResult, ModuleInput } from '@org/shared'

export default function ReviewPage(): JSX.Element {
  return (
    <WizardProvider>
      <ReviewContent />
    </WizardProvider>
  )
}

function ReviewContent(): JSX.Element {
  const { results, activeProfileId } = useLiveResults()
  const { activeProfile, activeState } = useWizardContext()

  const printable = useMemo(
    () => results.filter((entry) => !entry.result.assumptions.includes('Stubberegning')),
    [results]
  )

  const hasInputs = useMemo(() => hasAnyModuleInput(activeState), [activeState])
  const hasPrintableResults = hasInputs && printable.length > 0

  const primaryModuleIds = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'] as const
  type PrimaryModuleId = (typeof primaryModuleIds)[number]
  const primaryResults = primaryModuleIds
    .map((moduleId) => printable.find((entry) => entry.moduleId === moduleId) ?? null)
    .filter((entry): entry is CalculatedModuleResult => entry !== null)
  const secondaryResults = printable.filter(
    (entry) => !primaryModuleIds.includes(entry.moduleId as PrimaryModuleId)
  )

  const recommendedStep = useMemo(() => resolveRecommendedStep(activeProfile.profile), [activeProfile.profile])

  const handleDownload = async (): Promise<void> => {
    await downloadReport(activeState)
  }

  return (
    <main className="ds-page ds-stack">
      <header className="ds-stack-sm">
        <p className="ds-text-subtle">Version 4 · Resultatoversigt og rapport</p>
        <h1 className="ds-heading-lg">Review og download</h1>
        <p className="ds-text-subtle">Aktiv profil: {activeProfile.name}</p>
        <p className="ds-text-subtle">Profil-ID: {activeProfileId}</p>
        <p className="ds-text-muted">
          Få et samlet overblik over beregnede Scope 1-, Scope 3- og governance-resultater. D1-modulet leverer en samlet score,
          som indgår direkte i PDF-rapporten.
        </p>
      </header>

      <ProfileSwitcher
        heading="Skift profil"
        description="Resultaterne opdateres automatisk, når du vælger en anden profil."
        className="ds-stack"
      />

      {hasPrintableResults ? (
        <>
          <ResultsOverview primaryResults={primaryResults} secondaryResults={secondaryResults} />

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
        </>
      ) : (
        <EmptyStateCard profileName={activeProfile.name} recommendedStepLabel={recommendedStep?.label ?? null} />
      )}

      <section className="ds-toolbar">
        <PrimaryButton onClick={handleDownload} disabled={!hasPrintableResults}>
          Download PDF
        </PrimaryButton>
        <PrimaryButton as={Link} href="/wizard" variant="ghost">
          Tilbage til wizard
        </PrimaryButton>
      </section>

      <details className="ds-card">
        <summary>Se rå data</summary>
        <pre className="ds-summary ds-code">
{JSON.stringify({ activeProfileId, results: printable }, null, 2)}
        </pre>
      </details>
    </main>
  )
}

function ResultsOverview({
  primaryResults,
  secondaryResults,
}: {
  primaryResults: CalculatedModuleResult[]
  secondaryResults: CalculatedModuleResult[]
}): JSX.Element {
  const hasPrimary = primaryResults.length > 0
  const hasSecondary = secondaryResults.length > 0

  return (
    <>
      {hasPrimary ? (
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

      {hasSecondary && (
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
    </>
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

function EmptyStateCard({
  profileName,
  recommendedStepLabel,
}: {
  profileName: string
  recommendedStepLabel: string | null
}): JSX.Element {
  return (
    <section className="ds-card ds-stack">
      <h2 className="ds-heading-sm">Ingen beregninger for {profileName} endnu</h2>
      <p className="ds-text-muted">
        Start med at udfylde {recommendedStepLabel ?? 'det næste relevante modul'} i wizard-flowet. Når du har gennemført
        mindst ét modul, viser review-siden resultater og PDF-preview for profilen.
      </p>
      <PrimaryButton as={Link} href="/wizard">
        Gå til wizard
      </PrimaryButton>
    </section>
  )
}

function hasAnyModuleInput(state: ModuleInput): boolean {
  return Object.values(state).some((value) => hasValueRecursive(value))
}

function hasValueRecursive(value: unknown): boolean {
  if (value == null) {
    return false
  }
  if (typeof value === 'number') {
    return !Number.isNaN(value)
  }
  if (typeof value === 'boolean') {
    return true
  }
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  if (Array.isArray(value)) {
    return value.some((entry) => hasValueRecursive(entry))
  }
  if (typeof value === 'object') {
    return Object.values(value).some((entry) => hasValueRecursive(entry))
  }
  return false
}

function resolveRecommendedStep(profile: WizardProfile) {
  const readySteps = wizardSteps.filter((step) => step.status === 'ready')
  const relevant = readySteps.find((step) => isModuleRelevant(profile, step.id))
  return relevant ?? readySteps[0] ?? null
}
