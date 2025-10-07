/**
 * Wizardtrin for modul D2 – dobbelt væsentlighed og CSRD-gapstatus.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import {
  materialityRiskOptions,
  materialityTimelineOptions,
  materialityGapStatusOptions,
  runD2,
  type D2Input,
  type ModuleInput,
  type ModuleResult
} from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

type MaterialityRow = NonNullable<D2Input['materialTopics']>[number]

type NumericFieldKey = 'impactScore' | 'financialScore'
type TextFieldKey = 'title' | 'description' | 'responsible'

const EMPTY_D2: D2Input = { materialTopics: [] }
const SCORE_MAX = 5
const TITLE_LIMIT = 120
const DESCRIPTION_LIMIT = 500
const RESPONSIBLE_LIMIT = 120

const riskOptions = materialityRiskOptions.map((value) => ({
  value,
  label:
    value === 'risk' ? 'Risiko' : value === 'opportunity' ? 'Mulighed' : 'Risiko & mulighed'
}))

const timelineOptions = materialityTimelineOptions.map((value) => ({
  value,
  label:
    value === 'shortTerm'
      ? '0-12 mdr.'
      : value === 'mediumTerm'
      ? '1-3 år'
      : value === 'longTerm'
      ? '3+ år'
      : 'Løbende'
}))

const gapStatusOptions = materialityGapStatusOptions.map((value) => ({
  value,
  label:
    value === 'aligned'
      ? 'Ingen gap'
      : value === 'partial'
      ? 'Delvist afdækket'
      : 'Gap mangler'
}))

function createDefaultTopic(): MaterialityRow {
  return {
    title: '',
    description: null,
    riskType: 'risk',
    impactScore: null,
    financialScore: null,
    timeline: 'shortTerm',
    responsible: null,
    csrdGapStatus: 'partial'
  }
}

export function D2Step({ state, onChange }: WizardStepProps): JSX.Element {
  const current = (state.D2 as D2Input | undefined) ?? EMPTY_D2
  const topics = current.materialTopics ?? []

  const preview = useMemo<ModuleResult>(() => runD2({ D2: current } as ModuleInput), [current])

  const updateTopics = (next: MaterialityRow[]) => {
    onChange('D2', { materialTopics: next })
  }

  const handleAddTopic = () => {
    updateTopics([...topics, createDefaultTopic()])
  }

  const handleRemoveTopic = (index: number) => () => {
    updateTopics(topics.filter((_, rowIndex) => rowIndex !== index))
  }

  const handleNumericFieldChange = (index: number, field: NumericFieldKey) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const raw = event.target.value.replace(',', '.')
    const parsed = raw === '' ? null : Number.parseFloat(raw)
    const clamped = parsed == null || Number.isNaN(parsed) ? null : Math.min(Math.max(parsed, 0), SCORE_MAX)

    const next = topics.map((topic, rowIndex) =>
      rowIndex === index
        ? {
            ...topic,
            [field]: clamped
          }
        : topic
    )

    updateTopics(next as MaterialityRow[])
  }

  const handleTextFieldChange = (index: number, field: TextFieldKey, limit: number) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const raw = event.target.value.slice(0, limit)
    let nextValue: string | null = raw

    if (field === 'description') {
      nextValue = raw.trim() === '' ? null : raw
    } else if (field === 'responsible') {
      const trimmed = raw.trim()
      nextValue = trimmed === '' ? null : trimmed
    }

    const next = topics.map((topic, rowIndex) =>
      rowIndex === index
        ? {
            ...topic,
            [field]: nextValue
          }
        : topic
    )

    updateTopics(next as MaterialityRow[])
  }

  const handleRiskChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const value =
      event.target.value === '' ? null : (event.target.value as MaterialityRow['riskType'])
    const next = topics.map((topic, rowIndex) =>
      rowIndex === index
        ? {
            ...topic,
            riskType: value
          }
        : topic
    )

    updateTopics(next as MaterialityRow[])
  }

  const handleTimelineChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const value =
      event.target.value === '' ? null : (event.target.value as MaterialityRow['timeline'])
    const next = topics.map((topic, rowIndex) =>
      rowIndex === index
        ? {
            ...topic,
            timeline: value
          }
        : topic
    )

    updateTopics(next as MaterialityRow[])
  }

  const handleGapChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const value =
      event.target.value === '' ? null : (event.target.value as MaterialityRow['csrdGapStatus'])
    const next = topics.map((topic, rowIndex) =>
      rowIndex === index
        ? {
            ...topic,
            csrdGapStatus: value
          }
        : topic
    )

    updateTopics(next as MaterialityRow[])
  }

  const hasTopics = topics.length > 0

  return (
    <form style={{ display: 'grid', gap: '1.5rem', maxWidth: '68rem' }}>
      <header style={{ display: 'grid', gap: '0.75rem' }}>
        <h2>D2 – Dobbelt væsentlighed &amp; CSRD-gaps</h2>
        <p style={{ margin: 0 }}>
          Registrér væsentlige emner, risici og muligheder samt ansvarlige og tidslinjer. Modulet giver et samlet
          prioriteringsscore og fremhæver, hvor CSRD-gap-indsatsen mangler.
        </p>
      </header>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Materialitetsemner</h3>
          <button
            type="button"
            onClick={handleAddTopic}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #2f6f4f',
              background: '#2f6f4f',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Tilføj emne
          </button>
        </div>

        {hasTopics ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {topics.map((topic, index) => {
              const titleValue = topic.title
              const descriptionValue = topic.description ?? ''
              const responsibleValue = topic.responsible ?? ''
              const impactValue = topic.impactScore ?? ''
              const financialValue = topic.financialScore ?? ''
              const riskValue = topic.riskType ?? ''
              const timelineValue = topic.timeline ?? ''
              const gapValue = topic.csrdGapStatus ?? ''

              return (
                <article
                  key={`d2-topic-${index}`}
                  style={{
                    border: '1px solid #d0d7d5',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    display: 'grid',
                    gap: '0.75rem',
                    background: '#f9fbfa'
                  }}
                >
                  <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'grid', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600 }}>Titel på væsentligt emne</span>
                        <input
                          value={titleValue}
                          maxLength={TITLE_LIMIT}
                          onChange={handleTextFieldChange(index, 'title', TITLE_LIMIT)}
                          placeholder="Fx Klimarisiko i forsyningskæden"
                          style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #cbd5d0' }}
                        />
                        <span style={{ fontSize: '0.8rem', color: '#5f6c66' }}>
                          {titleValue.length}/{TITLE_LIMIT} tegn
                        </span>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveTopic(index)}
                      style={{
                        alignSelf: 'flex-start',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #c8d1cc',
                        background: '#fff',
                        color: '#2f3c36',
                        cursor: 'pointer'
                      }}
                      aria-label={`Fjern emne ${index + 1}`}
                    >
                      Fjern
                    </button>
                  </header>

                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ display: 'grid', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 600 }}>Beskrivelse / notat</span>
                      <textarea
                        rows={3}
                        value={descriptionValue}
                        maxLength={DESCRIPTION_LIMIT}
                        onChange={handleTextFieldChange(index, 'description', DESCRIPTION_LIMIT)}
                        style={{
                          padding: '0.65rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #cbd5d0',
                          fontFamily: 'inherit'
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#5f6c66' }}>
                        {descriptionValue.length}/{DESCRIPTION_LIMIT} tegn
                      </span>
                    </label>

                    <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))' }}>
                      <label style={{ display: 'grid', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600 }}>Risiko eller mulighed</span>
                        <select
                          value={riskValue}
                          onChange={handleRiskChange(index)}
                          style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5d0' }}
                        >
                          <option value="">Vælg...</option>
                          {riskOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label style={{ display: 'grid', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600 }}>Impact-score (0-5)</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={SCORE_MAX}
                          step={0.1}
                          value={impactValue}
                          onChange={handleNumericFieldChange(index, 'impactScore')}
                          placeholder="0-5"
                          style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5d0' }}
                        />
                      </label>

                      <label style={{ display: 'grid', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600 }}>Finansiel score (0-5)</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={SCORE_MAX}
                          step={0.1}
                          value={financialValue}
                          onChange={handleNumericFieldChange(index, 'financialScore')}
                          placeholder="0-5"
                          style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5d0' }}
                        />
                      </label>

                      <label style={{ display: 'grid', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600 }}>Tidslinje</span>
                        <select
                          value={timelineValue}
                          onChange={handleTimelineChange(index)}
                          style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5d0' }}
                        >
                          <option value="">Vælg...</option>
                          {timelineOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label style={{ display: 'grid', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600 }}>Ansvarlig</span>
                        <input
                          value={responsibleValue}
                          maxLength={RESPONSIBLE_LIMIT}
                          onChange={handleTextFieldChange(index, 'responsible', RESPONSIBLE_LIMIT)}
                          placeholder="Fx ESG-ansvarlig eller CFO"
                          style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5d0' }}
                        />
                      </label>

                      <label style={{ display: 'grid', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600 }}>CSRD-gap status</span>
                        <select
                          value={gapValue}
                          onChange={handleGapChange(index)}
                          style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5d0' }}
                        >
                          <option value="">Vælg...</option>
                          {gapStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#5f6c66' }}>
            Tilføj jeres væsentlige emner for at beregne samlet prioritet og identificere gap-handlinger.
          </p>
        )}
      </section>

      <section
        style={{
          display: 'grid',
          gap: '0.75rem',
          background: '#f9fbfa',
          border: '1px solid #d5e1dc',
          borderRadius: '0.75rem',
          padding: '1.25rem'
        }}
      >
        <h3 style={{ margin: 0 }}>Materialitetsanalyse</h3>
        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>
          {preview.value} {preview.unit}
        </p>
        <div>
          <strong>Antagelser</strong>
          <ul>
            {preview.assumptions.map((assumption, index) => (
              <li key={`assumption-${index}`}>{assumption}</li>
            ))}
          </ul>
        </div>
        {preview.warnings.length > 0 && (
          <div>
            <strong>Forslag til opfølgning</strong>
            <ul>
              {preview.warnings.map((warning, index) => (
                <li key={`warning-${index}`}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
        <details>
          <summary>Teknisk trace</summary>
          <ul>
            {preview.trace.map((traceEntry, index) => (
              <li key={`trace-${index}`} style={{ fontFamily: 'monospace' }}>
                {traceEntry}
              </li>
            ))}
          </ul>
        </details>
      </section>
    </form>
  )
}
