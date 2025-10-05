'use client'

import { useCallback, useState, type SyntheticEvent } from 'react'

import {
  ALL_PROFILE_KEYS,
  countPositiveAnswers,
  type WizardProfile,
  type WizardProfileKey,
  wizardProfileSections,
} from './profile'
import { PrimaryButton } from '../../../components/ui/PrimaryButton'

type PreWizardQuestionnaireProps = {
  profile: WizardProfile
  onChange: (key: WizardProfileKey, value: boolean | null) => void
  onContinue: () => void
}

export function PreWizardQuestionnaire({ profile, onChange, onContinue }: PreWizardQuestionnaireProps): JSX.Element {
  const totalQuestions = ALL_PROFILE_KEYS.length
  const positiveAnswers = countPositiveAnswers(profile)
  const initialOpenSections = wizardProfileSections[0]?.id ? [wizardProfileSections[0].id] : []
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(initialOpenSections))

  const handleSectionToggle = useCallback(
    (sectionId: string) => (event: SyntheticEvent<HTMLDetailsElement>) => {
      const isOpen = event.currentTarget.open
      setOpenSections((prev) => {
        const next = new Set(prev)
        if (isOpen) {
          next.add(sectionId)
        } else {
          next.delete(sectionId)
        }
        return next
      })
    },
    []
  )

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
          const isOpen = openSections.has(section.id)
          return (
            <details
              key={section.id}
              className="ds-accordion"
              role="listitem"
              open={isOpen}
              onToggle={handleSectionToggle(section.id)}
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

      <footer className="ds-questionnaire-footer ds-card">
        <div className="ds-stack-sm">
          <h2 className="ds-heading-sm">Opsummering</h2>
          <p className="ds-text-muted">
            Du har valgt {positiveAnswers} ud af {totalQuestions} områder som relevante.
          </p>
        </div>
        <PrimaryButton onClick={onContinue}>Fortsæt til moduler</PrimaryButton>
      </footer>
    </section>
  )
}
