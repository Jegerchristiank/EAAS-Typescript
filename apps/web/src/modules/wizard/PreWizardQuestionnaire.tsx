'use client'

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type SyntheticEvent,
} from 'react'

import {
  ALL_PROFILE_KEYS,
  countAnsweredQuestions,
  countPositiveAnswers,
  findFirstRelevantStepIndex,
  isModuleRelevant,
  isProfileComplete,
  type WizardProfile,
  type WizardProfileKey,
  wizardProfileSections,
} from './profile'
import { PrimaryButton } from '../../../components/ui/PrimaryButton'
import { wizardSteps, type WizardScope } from '../../../features/wizard/steps'

type PreWizardQuestionnaireProps = {
  profile: WizardProfile
  onChange: (key: WizardProfileKey, value: boolean | null) => void
  onContinue: () => void
}

type SectionRefs = MutableRefObject<Record<string, HTMLDetailsElement | null>>

const scopeOrder: WizardScope[] = ['Scope 1', 'Scope 2', 'Scope 3', 'Governance']

export function PreWizardQuestionnaire({ profile, onChange, onContinue }: PreWizardQuestionnaireProps): JSX.Element {
  const totalQuestions = ALL_PROFILE_KEYS.length
  const positiveAnswers = countPositiveAnswers(profile)
  const answeredQuestions = countAnsweredQuestions(profile)
  const progressPercent = Math.round((positiveAnswers / totalQuestions) * 100)
  const initialSectionId = wizardProfileSections[0]?.id ?? null
  const [openSectionId, setOpenSectionId] = useState<string | null>(initialSectionId)
  const sectionRefs = useRef<Record<string, HTMLDetailsElement | null>>({}) as SectionRefs

  const profileComplete = useMemo(() => isProfileComplete(profile), [profile])
  const currentSectionIndex = useMemo(() => {
    if (!openSectionId) {
      return -1
    }
    return wizardProfileSections.findIndex((section) => section.id === openSectionId)
  }, [openSectionId])
  const isLastSectionOpen = currentSectionIndex === wizardProfileSections.length - 1

  const firstRelevantStepIndex = useMemo(
    () => findFirstRelevantStepIndex(wizardSteps, profile),
    [profile]
  )
  const recommendedStep = useMemo(() => {
    const candidate = wizardSteps[firstRelevantStepIndex]
    if (!candidate) {
      return undefined
    }
    return isModuleRelevant(profile, candidate.id) ? candidate : undefined
  }, [firstRelevantStepIndex, profile])

  const moduleFeedback = useMemo(() => {
    const firstRelevantStep = wizardSteps[firstRelevantStepIndex]?.id
    return scopeOrder
      .map((scope) => ({
        scope,
        modules: wizardSteps
          .filter((step) => step.scope === scope)
          .map((step) => ({
            id: step.id,
            label: step.label,
            relevant: isModuleRelevant(profile, step.id),
            isFirstRelevant: step.id === firstRelevantStep,
          })),
      }))
      .filter((group) => group.modules.length > 0)
  }, [firstRelevantStepIndex, profile])

  const hasRelevantModules = useMemo(
    () => moduleFeedback.some((group) => group.modules.some((module) => module.relevant)),
    [moduleFeedback]
  )

  const scrollToSection = useCallback(
    (sectionId: string | null) => {
      if (!sectionId) {
        return
      }
      const element = sectionRefs.current[sectionId]
      if (element) {
        window.requestAnimationFrame(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          element.focus({ preventScroll: true })
        })
      }
    },
    []
  )

  const handleSectionToggle = useCallback(
    (sectionId: string) => (event: SyntheticEvent<HTMLDetailsElement>) => {
      const isOpen = event.currentTarget.open
      setOpenSectionId(isOpen ? sectionId : null)
    },
    []
  )

  const handleContinue = useCallback(() => {
    if (currentSectionIndex === -1 && initialSectionId) {
      setOpenSectionId(initialSectionId)
      scrollToSection(initialSectionId)
      return
    }

    if (currentSectionIndex < wizardProfileSections.length - 1) {
      const nextSection = wizardProfileSections[currentSectionIndex + 1]
      if (nextSection) {
        setOpenSectionId(nextSection.id)
        scrollToSection(nextSection.id)
      }
      return
    }

    if (!profileComplete) {
      const nextIncomplete = wizardProfileSections.find((section) =>
        section.questions.some((question) => profile[question.id] === null)
      )
      if (nextIncomplete) {
        setOpenSectionId(nextIncomplete.id)
        scrollToSection(nextIncomplete.id)
      }
      return
    }

    onContinue()
  }, [
    currentSectionIndex,
    initialSectionId,
    onContinue,
    profile,
    profileComplete,
    scrollToSection,
  ])

  const continueLabel = isLastSectionOpen ? 'Fortsæt til moduler' : 'Næste sektion'

  return (
    <section className="ds-stack" aria-labelledby="wizard-profile-heading">
      <header className="ds-stack-sm">
        <p className="ds-text-subtle">Trin 0 · Virksomhedsprofil</p>
        <h1 id="wizard-profile-heading" className="ds-heading-lg">
          Afgræns ESG-modulerne til din virksomheds aktiviteter
        </h1>
        <p className="ds-text-muted">
          Besvar spørgsmålene nedenfor for hurtigt at vælge de områder, der er relevante for jeres ESG-beregninger.
          Svar kan altid justeres senere via “Rediger profil”.
        </p>
      </header>

      <div className="ds-questionnaire" role="presentation">
        <div className="ds-stack-lg" role="list">
          {wizardProfileSections.map((section) => {
            const isOpen = openSectionId === section.id
            return (
              <details
                key={section.id}
                className="ds-accordion"
                role="listitem"
                open={isOpen}
                onToggle={handleSectionToggle(section.id)}
                ref={(node) => {
                  sectionRefs.current[section.id] = node
                }}
                tabIndex={-1}
                data-active={isOpen ? 'true' : undefined}
              >
                <summary className="ds-accordion__summary">
                  <div className="ds-stack-sm">
                    <h2 className="ds-section-heading">{section.heading}</h2>
                    <p className="ds-text-subtle">{section.description}</p>
                  </div>
                  <span aria-hidden>▾</span>
                </summary>
                <div className="ds-stack">
                  {section.questions.map((question) => {
                    const value = profile[question.id]
                    const yesId = `${section.id}-${question.id}-yes`
                    const noId = `${section.id}-${question.id}-no`

                    return (
                      <article key={question.id} className="ds-card ds-question-card">
                        <div className="ds-stack-sm">
                          <div className="ds-question-card__header">
                            <h3 className="ds-heading-sm">{question.label}</h3>
                            <PrimaryButton
                              variant="ghost"
                              className="ds-button--sm"
                              onClick={() => onChange(question.id, null)}
                              disabled={value === null}
                            >
                              Spring over
                            </PrimaryButton>
                          </div>
                          <p className="ds-text-subtle">{question.helpText}</p>
                        </div>
                        <fieldset className="ds-choice-group">
                          <legend className="sr-only">{question.label}</legend>
                          <label className="ds-choice" data-selected={value === true ? 'true' : undefined} htmlFor={yesId}>
                            <input
                              type="radio"
                              id={yesId}
                              name={question.id}
                              checked={value === true}
                              onChange={() => onChange(question.id, true)}
                            />
                            <span>Ja</span>
                          </label>
                          <label className="ds-choice" data-selected={value === false ? 'true' : undefined} htmlFor={noId}>
                            <input
                              type="radio"
                              id={noId}
                              name={question.id}
                              checked={value === false}
                              onChange={() => onChange(question.id, false)}
                            />
                            <span>Nej</span>
                          </label>
                        </fieldset>
                      </article>
                    )
                  })}
                </div>
              </details>
            )
          })}
        </div>

        <aside className="ds-questionnaire__summary" aria-label="Profilstatus og modulfeedback">
          <div className="ds-card ds-stack">
            <div className="ds-stack-sm">
              <h2 className="ds-heading-sm">Status</h2>
              <p className="ds-text-muted">
                {positiveAnswers} ud af {totalQuestions} aktiviteter markeret som relevante.
              </p>
            </div>
            <div
              className="ds-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
              aria-valuetext={`${positiveAnswers} relevante ud af ${totalQuestions}`}
            >
              <span className="ds-progress__bar" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="ds-text-subtle">
              {answeredQuestions} / {totalQuestions} spørgsmål er besvaret.
            </p>
          </div>

          <div className="ds-card ds-stack">
            <div className="ds-stack-sm">
              <h2 className="ds-heading-sm">Modulfeedback</h2>
              {recommendedStep ? (
                <p className="ds-text-muted">
                  Start beregningerne med <strong>{recommendedStep.label}</strong>.
                </p>
              ) : (
                <p className="ds-text-muted">Besvar flere spørgsmål for at få anbefalede moduler.</p>
              )}
            </div>

            {moduleFeedback.map((group) => (
              <section key={group.scope} className="ds-stack-sm">
                <h3 className="ds-text-subtle">{group.scope}</h3>
                <div className="ds-pill-group">
                  {group.modules.map((module) => (
                    <span
                      key={module.id}
                      className="ds-pill"
                      data-active={module.isFirstRelevant ? 'true' : undefined}
                      data-relevant={module.relevant ? 'true' : 'false'}
                    >
                      {module.label}
                    </span>
                  ))}
                </div>
              </section>
            ))}

            {!hasRelevantModules && (
              <p className="ds-text-subtle">Ingen moduler markeret som relevante endnu.</p>
            )}

            <PrimaryButton onClick={handleContinue}>{continueLabel}</PrimaryButton>
            {!profileComplete && isLastSectionOpen && (
              <p className="ds-text-subtle" role="status">
                Besvar de resterende spørgsmål for at fortsætte til modulerne.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
