'use client'

import { isModuleRelevant, type WizardProfile } from './profile'

import type { WizardStep, WizardScope } from '../../../features/wizard/steps'

type WizardOverviewProps = {
  steps: WizardStep[]
  currentStep: number
  onSelect: (index: number) => void
  profile: WizardProfile
  profileComplete: boolean
}

const scopeOrder: WizardScope[] = ['Scope 1', 'Scope 2', 'Scope 3', 'Governance']

export function WizardOverview({
  steps,
  currentStep,
  onSelect,
  profile,
  profileComplete,
}: WizardOverviewProps): JSX.Element {
  const relevantCount = steps.filter((step) => isModuleRelevant(profile, step.id)).length

  const stepsByScope = scopeOrder
    .map((scope) => ({ scope, steps: steps.filter((step) => step.scope === scope) }))
    .filter((entry) => entry.steps.length > 0)

  return (
    <nav className="ds-stack" aria-label="ESG-moduler">
      <div className="ds-summary">
        {!profileComplete ? (
          <p className="ds-text-subtle">
            Afslut virksomhedsprofilen for at låse op for modulnavigation.
          </p>
        ) : relevantCount > 0 ? (
          <p className="ds-text-subtle">{relevantCount} moduler markeret som relevante.</p>
        ) : (
          <p className="ds-text-subtle">Ingen moduler markeret som relevante endnu.</p>
        )}
      </div>
      {stepsByScope.map(({ scope, steps: scopedSteps }) => (
        <section key={scope} className="ds-section">
          <div className="ds-stack-sm">
            <h2 className="ds-section-heading">{scope}</h2>
            <p className="ds-text-subtle">
              {scope === 'Governance'
                ? 'Metode- og governance-scoren anvendes i rapportens konklusion.'
                : 'Modulerne nedenfor bidrager direkte til resultatberegningerne.'}
            </p>
          </div>
          <div className="ds-pill-group" role="tablist" aria-label={`Moduler i ${scope}`}>
            {scopedSteps.map((step) => {
              const index = steps.findIndex((candidate) => candidate.id === step.id)
              const isActive = index === currentStep
              const isPlanned = step.status === 'planned'
              const isRelevant = isModuleRelevant(profile, step.id)
              const isDisabled = !profileComplete || !isRelevant

              return (
                <button
                  key={step.id}
                  type="button"
                  className="ds-pill"
                  data-active={isActive ? 'true' : 'false'}
                  data-planned={isPlanned ? 'true' : 'false'}
                  onClick={() => onSelect(index)}
                  aria-pressed={isActive}
                  aria-label={`${step.label}${isPlanned ? ' (planlagt)' : ''}`}
                  title={
                    !profileComplete
                      ? 'Afslut virksomhedsprofilen for at aktivere modulet.'
                      : !isRelevant
                        ? 'Ikke relevant for virksomheden baseret på virksomhedsprofilen.'
                        : isPlanned
                          ? 'Planlagt modul – beregningslogik følger.'
                          : undefined
                  }
                  disabled={isDisabled}
                >
                  <span>{step.label}</span>
                  {isPlanned && <span className="ds-text-subtle">Planlagt</span>}
                  {!isRelevant && (
                    <span className="ds-pill__hint">Ikke relevant for virksomheden</span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </nav>
  )
}
