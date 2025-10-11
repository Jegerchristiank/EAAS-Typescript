'use client'

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type SyntheticEvent,
} from 'react'

import { isProfileComplete, type WizardProfile, type WizardProfileKey, wizardProfileSections } from './profile'
import { PrimaryButton } from '../../../components/ui/PrimaryButton'

type PreWizardQuestionnaireProps = {
  profile: WizardProfile
  onChange: (key: WizardProfileKey, value: boolean | null) => void
  onContinue: () => void
}

type SectionRefs = MutableRefObject<Record<string, HTMLDetailsElement | null>>

export function PreWizardQuestionnaire({ profile, onChange, onContinue }: PreWizardQuestionnaireProps): JSX.Element {
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

      <footer className="ds-stack" aria-label="Navigationskontrol for virksomhedsprofilen">
        <PrimaryButton onClick={handleContinue}>{continueLabel}</PrimaryButton>
        {!profileComplete && isLastSectionOpen && (
          <p className="ds-text-subtle" role="status">
            Besvar de resterende spørgsmål for at fortsætte til modulerne.
          </p>
        )}
      </footer>
    </section>
  )
}
