/**
 * Wrapper-komponent for wizard-flowet med simpel navigation.
 */
'use client'

import { wizardSteps, type WizardScope } from './steps'
import { useWizard } from './useWizard'
import { PrimaryButton } from '../../components/ui/PrimaryButton'

export function WizardShell(): JSX.Element {
  const { currentStep, goToStep, state, updateField } = useWizard()
  const StepComponent = wizardSteps[currentStep]?.component
  const stepIndexById = new Map(wizardSteps.map((step, index) => [step.id, index]))

  const scopeOrder: WizardScope[] = ['Scope 1', 'Scope 2', 'Scope 3', 'Governance']
  const stepsByScope = scopeOrder
    .map((scope) => ({ scope, steps: wizardSteps.filter((step) => step.scope === scope) }))
    .filter((entry) => entry.steps.length > 0)

  return (
    <section style={{ padding: '2rem' }}>
      <h1>ESG Wizard</h1>
      <nav style={{ display: 'grid', gap: '1.5rem' }}>
        {stepsByScope.map(({ scope, steps }) => (
          <section key={scope} style={{ display: 'grid', gap: '0.75rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{scope}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {steps.map((step) => {
                const index = stepIndexById.get(step.id) ?? 0
                const isActive = index === currentStep
                const isPlanned = step.status === 'planned'
                return (
                  <PrimaryButton
                    key={step.id}
                    onClick={() => goToStep(index)}
                    aria-pressed={isActive}
                    title={isPlanned ? 'Planlagt modul – beregningslogik følger.' : undefined}
                    style={{
                      backgroundColor: isActive ? '#0a7d55' : '#0a7d55',
                      opacity: isPlanned && !isActive ? 0.75 : 1,
                      border: isActive ? '2px solid #064f37' : 'none'
                    }}
                  >
                    <span style={{ display: 'block' }}>{step.label}</span>
                    {isPlanned && (
                      <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.85 }}>Planlagt</span>
                    )}
                  </PrimaryButton>
                )
              })}
            </div>
          </section>
        ))}
      </nav>
      <div style={{ marginTop: '2rem' }}>
        {StepComponent ? (
          <StepComponent state={state} onChange={updateField} />
        ) : (
          <p>Ingen trin fundet.</p>
        )}
      </div>
    </section>
  )
}
