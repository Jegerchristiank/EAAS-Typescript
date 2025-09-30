/**
 * Planlægningssteps for kommende moduler.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import type { ModuleId, ModuleInput, PlanningModuleInput } from '@org/shared'
import { runModule } from '@org/shared'
import type { WizardStepComponent, WizardStepProps } from './StepTemplate'

const EMPTY_PLANNING: PlanningModuleInput = {
  dataOwner: null,
  dataSource: null,
  targetGoLiveQuarter: null,
  notes: null
}

type PlanningFieldKey = keyof PlanningModuleInput

type PlanningFieldConfig = {
  key: PlanningFieldKey
  label: string
  description: string
  placeholder?: string
  maxLength: number
  multiline?: boolean
}

const FIELD_CONFIG: PlanningFieldConfig[] = [
  {
    key: 'dataOwner',
    label: 'Dataansvarlig',
    description: 'Navn eller rolle på den person/enhed der ejer data og governance.',
    placeholder: 'fx Energi- & miljøteamet',
    maxLength: 120
  },
  {
    key: 'dataSource',
    label: 'Primære datakilder',
    description: 'Systemer, rapporter eller processer hvor data forventes indsamlet.',
    placeholder: 'fx Energi BMS, ERP, telematik',
    maxLength: 240
  },
  {
    key: 'targetGoLiveQuarter',
    label: 'Planlagt go-live kvartal',
    description: 'Hvornår forventes modulet at levere fuld beregning?',
    placeholder: 'fx Q1 2026',
    maxLength: 32
  },
  {
    key: 'notes',
    label: 'Noter',
    description: 'Supplerende oplysninger, blokeringer eller beslutningsbehov.',
    placeholder: 'F.eks. afhængig af kølemiddel-inventar eller aftalt revisorreview.',
    maxLength: 2000,
    multiline: true
  }
]

type PlanningModuleId = 'D1'

type PlanningStepConfig = {
  moduleId: Extract<ModuleId, PlanningModuleId>
  title: string
  intro: string
  focusPoints: string[]
}

export function createPlanningStep(config: PlanningStepConfig): WizardStepComponent {
  return function PlanningStep({ state, onChange }: WizardStepProps): JSX.Element {
    const current = (state[config.moduleId] as PlanningModuleInput | undefined) ?? EMPTY_PLANNING

    const preview = useMemo(
      () => runModule(config.moduleId, { [config.moduleId]: current } as ModuleInput),
      [config.moduleId, current]
    )

    const handleFieldChange = (field: PlanningFieldConfig) => (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const rawValue = event.target.value.slice(0, field.maxLength)
      const next: PlanningModuleInput = {
        ...current,
        [field.key]: rawValue.trim() === '' ? null : rawValue
      }
      onChange(config.moduleId, next)
    }

    return (
      <form style={{ display: 'grid', gap: '1.5rem', maxWidth: '48rem' }}>
        <header style={{ display: 'grid', gap: '0.75rem' }}>
          <h2>{config.title}</h2>
          <p>{config.intro}</p>
          <aside
            style={{
              background: '#f0f7f4',
              border: '1px solid #b5d7ca',
              borderRadius: '0.75rem',
              padding: '1rem',
              display: 'grid',
              gap: '0.5rem'
            }}
          >
            <strong style={{ color: '#0a7d55' }}>Planlagt modul</strong>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {config.focusPoints.map((point, index) => (
                <li key={`${config.moduleId}-focus-${index}`}>{point}</li>
              ))}
            </ul>
          </aside>
        </header>

        <section style={{ display: 'grid', gap: '1rem' }}>
          {FIELD_CONFIG.map((field) => {
            const value = (current[field.key] ?? '') as string
            const commonProps = {
              id: `${config.moduleId}-${field.key}`,
              value,
              placeholder: field.placeholder,
              onChange: handleFieldChange(field),
              maxLength: field.maxLength,
              style: {
                padding: '0.65rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5d0',
                fontFamily: 'inherit'
              } as const
            }

            return (
              <label key={field.key} htmlFor={`${config.moduleId}-${field.key}`} style={{ display: 'grid', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{field.label}</span>
                <span style={{ color: '#555', fontSize: '0.9rem' }}>{field.description}</span>
                {field.multiline ? (
                  <textarea rows={5} {...commonProps} />
                ) : (
                  <input type="text" {...commonProps} />
                )}
                <span style={{ fontSize: '0.75rem', color: '#6b7f78' }}>
                  {value.length}/{field.maxLength}
                </span>
              </label>
            )
          })}
        </section>

        <section style={{ display: 'grid', gap: '0.5rem', background: '#f9fbfa', padding: '1rem', borderRadius: '0.75rem' }}>
          <h3 style={{ margin: 0 }}>Planlægningsopsummering</h3>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            {preview.assumptions[1] ?? preview.assumptions[0] ?? 'Dette modul er markeret som planlagt.'}
          </p>
          <details>
            <summary>Teknisk status</summary>
            <ul>
              {preview.trace.map((entry, index) => (
                <li key={`${config.moduleId}-trace-${index}`} style={{ fontFamily: 'monospace' }}>
                  {entry}
                </li>
              ))}
            </ul>
          </details>
          {preview.warnings[0] && (
            <p style={{ margin: 0, color: '#a15500' }}>{preview.warnings[0]}</p>
          )}
        </section>
      </form>
    )
  }
}

type PlanningModuleConfigMap = Record<PlanningModuleId, PlanningStepConfig>

const PLANNING_CONFIGS: PlanningModuleConfigMap = {
  D1: {
    moduleId: 'D1',
    title: 'D1 – CSRD/ESRS governance-krav',
    intro:
      'Forbered governance- og kontrolkrav fra CSRD/ESRS. Dette modul vil koble politikker med ESG-beregninger.',
    focusPoints: [
      'Angiv ansvarlige for ESG-governance og compliance.',
      'Notér status på politikker og kontroller.',
      'Beskriv hvordan governance kobles til datakilder og rapportering.'
    ]
  }
}

export const D1Step = createPlanningStep(PLANNING_CONFIGS.D1)
