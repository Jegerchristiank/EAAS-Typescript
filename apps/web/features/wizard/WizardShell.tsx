/**
 * Wrapper-komponent for wizard-flowet med forbedret navigation og sidebar.
 */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { PrimaryButton } from '../../components/ui/PrimaryButton'
import {
  ProfileProgressStepper,
  type StepIdentifier,
} from '../../src/modules/wizard/ProfileProgressStepper'
import { PreWizardQuestionnaire } from '../../src/modules/wizard/PreWizardQuestionnaire'
import { WizardOverview } from '../../src/modules/wizard/WizardOverview'
import {
  findFirstRelevantStepIndex,
  isModuleRelevant,
  isProfileComplete,
  type WizardProfile,
} from '../../src/modules/wizard/profile'
import { ProfileSwitcher } from './ProfileSwitcher'
import { NextRelevantButton } from './NextRelevantButton'
import { wizardSteps, type WizardScope } from './steps'
import { WizardProvider, useWizardContext } from './useWizard'

const scopeOrder: WizardScope[] = ['Scope 1', 'Scope 2', 'Scope 3', 'Governance']

type RelevantModuleGroup = {
  scope: WizardScope
  modules: {
    id: string
    label: string
    isActive: boolean
    isRecommended: boolean
  }[]
}

function buildRelevantModuleGroups(
  profile: WizardProfile,
  activeModuleId: string | null,
  recommendedModuleId: string | null
): RelevantModuleGroup[] {
  return scopeOrder
    .map((scope) => {
      const modules = wizardSteps
        .filter((step) => step.scope === scope && step.status === 'ready')
        .filter((step) => isModuleRelevant(profile, step.id))
        .map((step) => ({
          id: step.id,
          label: step.label,
          isActive: step.id === activeModuleId,
          isRecommended: step.id === recommendedModuleId,
        }))

      return { scope, modules }
    })
    .filter((group) => group.modules.length > 0)
}

function resolveRecommendedStepIndex(profile: WizardProfile): number {
  const readyRelevantIndex = wizardSteps.findIndex(
    (step) => step.status === 'ready' && isModuleRelevant(profile, step.id)
  )
  if (readyRelevantIndex !== -1) {
    return readyRelevantIndex
  }

  const firstRelevantIndex = findFirstRelevantStepIndex(wizardSteps, profile)
  if (wizardSteps[firstRelevantIndex]?.status === 'ready') {
    return firstRelevantIndex
  }

  const firstReadyIndex = wizardSteps.findIndex((step) => step.status === 'ready')
  return firstReadyIndex === -1 ? 0 : firstReadyIndex
}

export function WizardShell(): JSX.Element {
  return (
    <WizardProvider>
      <WizardShellContent />
    </WizardProvider>
  )
}

function WizardShellContent(): JSX.Element {
  const { currentStep, goToStep, state, updateField, profile, updateProfile } = useWizardContext()
  const [isProfileOpen, setIsProfileOpen] = useState(() => !isProfileComplete(profile))
  const StepComponent = wizardSteps[currentStep]?.component
  const currentStepMeta = wizardSteps[currentStep]

  const recommendedStepIndex = useMemo(() => resolveRecommendedStepIndex(profile), [profile])
  const recommendedStepId = wizardSteps[recommendedStepIndex]?.id ?? null

  const profileComplete = useMemo(() => isProfileComplete(profile), [profile])
  const activeModuleId = !isProfileOpen && currentStepMeta ? currentStepMeta.id : null
  const activeStepperStep: StepIdentifier = isProfileOpen
    ? 'profile'
    : currentStepMeta?.scope ?? 'profile'

  const relevantModuleGroups = useMemo(
    () => buildRelevantModuleGroups(profile, activeModuleId, recommendedStepId),
    [profile, activeModuleId, recommendedStepId]
  )

  useEffect(() => {
    if (!isProfileComplete(profile)) {
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
    const targetIndex = recommendedStepIndex
    if (current.status !== 'ready' && targetIndex !== currentStep) {
      goToStep(targetIndex)
      return
    }
    if (!isModuleRelevant(profile, current.id) && targetIndex !== currentStep) {
      goToStep(targetIndex)
    }
  }, [currentStep, goToStep, isProfileOpen, profile, recommendedStepIndex])

  const handleOpenProfile = () => {
    setIsProfileOpen(true)
  }

  const handleCompleteProfile = () => {
    setIsProfileOpen(false)
    if (wizardSteps[recommendedStepIndex]) {
      goToStep(recommendedStepIndex)
    }
  }

  const handleSelectStep = useCallback(
    (index: number) => {
      if (!profileComplete) {
        setIsProfileOpen(true)
        return
      }
      setIsProfileOpen(false)
      goToStep(index)
    },
    [goToStep, profileComplete]
  )

  const handleSelectStepperStep = useCallback(
    (stepId: StepIdentifier) => {
      if (stepId === 'profile') {
        setIsProfileOpen(true)
        return
      }
      if (!profileComplete) {
        setIsProfileOpen(true)
        return
      }

      const scope = stepId as WizardScope
      const relevantIndex = wizardSteps.findIndex(
        (step) => step.scope === scope && step.status === 'ready' && isModuleRelevant(profile, step.id)
      )
      const fallbackIndex = wizardSteps.findIndex(
        (step) => step.scope === scope && step.status === 'ready'
      )
      const targetIndex = relevantIndex !== -1 ? relevantIndex : fallbackIndex

      if (targetIndex !== -1) {
        setIsProfileOpen(false)
        goToStep(targetIndex)
      }
    },
    [goToStep, profile, profileComplete]
  )

  return (
    <section className="ds-page">
      <div className="ds-shell ds-shell--wizard">
        <aside className="ds-shell__sidebar ds-stack">
          <section className="ds-card ds-stack" aria-label="Status for virksomhedsprofil">
            <header className="ds-stack-sm">
              <div className="ds-stack-xs">
                <p className="ds-text-subtle">Trin 0</p>
                <h2 className="ds-heading-sm">Virksomhedsprofil</h2>
              </div>
              <PrimaryButton variant="ghost" onClick={handleOpenProfile} disabled={isProfileOpen}>
                Rediger profil
              </PrimaryButton>
            </header>

            {!profileComplete && (
              <div className="ds-alert" data-variant="info" role="status">
                <p>
                  Afslut spørgsmålene i profilen for at aktivere modulnavigationen og få anbefalinger.
                </p>
              </div>
            )}

            <ProfileProgressStepper
              profile={profile}
              activeStep={activeStepperStep}
              onSelectStep={handleSelectStepperStep}
            />

            <div className="ds-stack-sm">
              <h3 className="ds-heading-xs">Relevante moduler</h3>
              {relevantModuleGroups.length > 0 ? (
                <div className="ds-stack-sm">
                  {relevantModuleGroups.map((group) => (
                    <section key={group.scope} className="ds-stack-xs">
                      <p className="ds-text-subtle">{group.scope}</p>
                      <div className="ds-pill-group">
                        {group.modules.map((module) => (
                          <span
                            key={module.id}
                            className="ds-pill"
                            data-active={module.isActive ? 'true' : undefined}
                          >
                            {module.label}
                            {module.isRecommended && (
                              <span className="ds-pill__hint">Anbefalet start</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <p className="ds-text-subtle">Ingen moduler markeret som relevante endnu.</p>
              )}
            </div>
          </section>

          <ProfileSwitcher
            heading="Profiler"
            description="Skift mellem gemte virksomhedsprofiler."
          />
        </aside>

        <div className="ds-shell__main ds-stack">
          <header className="ds-stack-sm">
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
            <ProfileProgressStepper
              profile={profile}
              activeStep={activeStepperStep}
              onSelectStep={handleSelectStepperStep}
            />
          </header>

          <WizardOverview
            steps={wizardSteps}
            currentStep={currentStep}
            onSelect={handleSelectStep}
            profile={profile}
            profileComplete={profileComplete}
          />

          <section className="ds-panel ds-stack" aria-live="polite">
            {isProfileOpen ? (
              <PreWizardQuestionnaire
                profile={profile}
                onChange={updateProfile}
                onContinue={handleCompleteProfile}
              />
            ) : StepComponent ? (
              <>
                <StepComponent state={state} onChange={updateField} />
                <NextRelevantButton />
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
            ) : (
              <p className="ds-text-muted">Ingen trin fundet.</p>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}
