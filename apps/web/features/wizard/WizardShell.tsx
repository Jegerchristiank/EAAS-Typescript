/**
 * Wrapper-komponent for wizard-flowet med simpel navigation.
 */
'use client'

import { useEffect, useMemo, useState } from 'react'

import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { PreWizardQuestionnaire } from '../../src/modules/wizard/PreWizardQuestionnaire'
import { WizardOverview } from '../../src/modules/wizard/WizardOverview'
import {
  findFirstRelevantStepIndex,
  hasAnyAnswer,
  isModuleRelevant,
} from '../../src/modules/wizard/profile'
import { ProfileSwitcher } from './ProfileSwitcher'
import { wizardSteps } from './steps'
import { WizardProvider, useWizardContext } from './useWizard'

export function WizardShell(): JSX.Element {
  return (
    <WizardProvider>
      <WizardShellContent />
    </WizardProvider>
  )
}

function WizardShellContent(): JSX.Element {
  const { currentStep, goToStep, state, updateField, profile, updateProfile } = useWizardContext()
  const [isProfileOpen, setIsProfileOpen] = useState(() => !hasAnyAnswer(profile))
  const StepComponent = wizardSteps[currentStep]?.component
  const firstRelevantStepIndex = useMemo(
    () => findFirstRelevantStepIndex(wizardSteps, profile),
    [profile]
  )

  useEffect(() => {
    if (!hasAnyAnswer(profile)) {
      setIsProfileOpen(true)
    }
  }, [profile])

  useEffect(() => {
    if (isProfileOpen) {
      return
    }
    const current = wizardSteps[currentStep]
    if (!current) {
      return
    }
    if (!isModuleRelevant(profile, current.id) && currentStep !== firstRelevantStepIndex) {
      goToStep(firstRelevantStepIndex)
    }
  }, [currentStep, firstRelevantStepIndex, goToStep, isProfileOpen, profile])

  const handleOpenProfile = () => {
    setIsProfileOpen(true)
  }

  const handleCompleteProfile = () => {
    setIsProfileOpen(false)
    goToStep(firstRelevantStepIndex)
  }

  return (
    <section className="ds-page">
      <div className="ds-shell">
        <aside className="ds-shell__sidebar">
          <ProfileSwitcher heading="Profiler" description="Skift mellem gemte virksomhedsprofiler." />
        </aside>

        <div className="ds-shell__main ds-stack">
          <header className="ds-stack">
            <div className="ds-question-card__header">
              <div className="ds-stack-sm">
                <p className="ds-text-subtle">Version 4 · Opdateret wizard-oplevelse</p>
                <h1 className="ds-heading-lg">ESG-beregninger</h1>
                <p className="ds-text-muted">
                  Navigér mellem modulerne for Scope 1, Scope 3 og governance. Dine indtastninger bliver gemt løbende, og
                  hvert modul viser relevante hjælpetekster og validering.
                </p>
              </div>
              <PrimaryButton variant="ghost" onClick={handleOpenProfile} disabled={isProfileOpen}>
                Rediger profil
              </PrimaryButton>
            </div>
          </header>

          {isProfileOpen ? (
            <PreWizardQuestionnaire
              profile={profile}
              onChange={updateProfile}
              onContinue={handleCompleteProfile}
            />
          ) : (
            <>
              <WizardOverview
                steps={wizardSteps}
                currentStep={currentStep}
                onSelect={goToStep}
                profile={profile}
              />

              <div>
                {StepComponent ? (
                  <StepComponent state={state} onChange={updateField} />
                ) : (
                  <p className="ds-text-muted">Ingen trin fundet.</p>
                )}
              </div>

              <footer className="ds-toolbar">
                <PrimaryButton
                  onClick={() => goToStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  variant="ghost"
                >
                  Forrige trin
                </PrimaryButton>
                <PrimaryButton
                  onClick={() => goToStep(Math.min(wizardSteps.length - 1, currentStep + 1))}
                  disabled={currentStep === wizardSteps.length - 1}
                >
                  Næste trin
                </PrimaryButton>
              </footer>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
