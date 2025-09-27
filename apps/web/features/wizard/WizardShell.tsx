/**
 * Wrapper-komponent for wizard-flowet med simpel navigation.
 */
'use client'

import { wizardSteps } from './steps'
import { useWizard } from './useWizard'
import { PrimaryButton } from '../../components/ui/PrimaryButton'

export function WizardShell(): JSX.Element {
  const { currentStep, goToStep, state, updateField } = useWizard()
  const StepComponent = wizardSteps[currentStep]?.component

  return (
    <section style={{ padding: '2rem' }}>
      <h1>ESG Wizard</h1>
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {wizardSteps.map((step, index) => (
          <PrimaryButton key={step.id} onClick={() => goToStep(index)}>
            {step.label}
          </PrimaryButton>
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
