/**
 * Wizardtrin for modul B1.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import type { B1Input, ModuleInput, ModuleResult } from '@org/shared'
import { runB1 } from '@org/shared'
import type { WizardStepProps } from './StepTemplate'

type FieldKey = keyof B1Input

type FieldConfig = {
  key: FieldKey
  label: string
  description: string
  unit: string
  placeholder?: string
}

const FIELD_CONFIG: FieldConfig[] = [
  {
    key: 'electricityConsumptionKwh',
    label: 'Årligt elforbrug',
    description: 'Samlet forbrug for organisationen i kWh.',
    unit: 'kWh'
  },
  {
    key: 'emissionFactorKgPerKwh',
    label: 'Emissionsfaktor',
    description: 'Kg CO2e pr. kWh i leverandørens deklaration.',
    unit: 'kg CO2e/kWh',
    placeholder: '0.233'
  },
  {
    key: 'renewableSharePercent',
    label: 'Vedvarende andel',
    description: 'Andel af strøm indkøbt som certificeret vedvarende energi.',
    unit: '%',
    placeholder: '0-100'
  }
]

const EMPTY_B1: B1Input = {
  electricityConsumptionKwh: null,
  emissionFactorKgPerKwh: null,
  renewableSharePercent: null
}

export function B1Step({ state, onChange }: WizardStepProps): JSX.Element {
  const current = (state.B1 as B1Input | undefined) ?? EMPTY_B1

  const preview = useMemo<ModuleResult>(() => {
    return runB1({ B1: current } as ModuleInput)
  }, [current])

  const handleFieldChange = (field: FieldKey) => (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(',', '.')
    const parsed = rawValue === '' ? null : Number.parseFloat(rawValue)
    const next: B1Input = {
      ...current,
      [field]: Number.isFinite(parsed) ? parsed : null
    }
    onChange('B1', next)
  }

  const hasData = preview.trace.some((line) => line.includes('grossEmissionsKg')) &&
    (current.electricityConsumptionKwh != null ||
      current.emissionFactorKgPerKwh != null ||
      current.renewableSharePercent != null)

  return (
    <form style={{ display: 'grid', gap: '1.5rem', maxWidth: '40rem' }}>
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <h2>B1 – Scope 2 elforbrug</h2>
        <p>
          Indtast data for organisationens elforbrug. Resultatet beregner nettoemissionen efter
          fradrag for vedvarende indkøb.
        </p>
      </header>
      <section style={{ display: 'grid', gap: '1rem' }}>
        {FIELD_CONFIG.map((field) => {
          const value = current[field.key]
          return (
            <label key={field.key} style={{ display: 'grid', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>
                {field.label} ({field.unit})
              </span>
              <span style={{ color: '#555', fontSize: '0.9rem' }}>{field.description}</span>
              <input
                type="number"
                step="any"
                value={value ?? ''}
                placeholder={field.placeholder}
                onChange={handleFieldChange(field.key)}
                style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
                min={0}
              />
            </label>
          )
        })}
      </section>
      <section style={{ display: 'grid', gap: '0.75rem', background: '#f1f5f4', padding: '1rem', borderRadius: '0.75rem' }}>
        <h3 style={{ margin: 0 }}>Estimat</h3>
        {hasData ? (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              {preview.value} {preview.unit}
            </p>
            <div>
              <strong>Antagelser</strong>
              <ul>
                {preview.assumptions.map((assumption, index) => (
                  <li key={index}>{assumption}</li>
                ))}
              </ul>
            </div>
            {preview.warnings.length > 0 && (
              <div>
                <strong>Advarsler</strong>
                <ul>
                  {preview.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            <details>
              <summary>Teknisk trace</summary>
              <ul>
                {preview.trace.map((line, index) => (
                  <li key={index} style={{ fontFamily: 'monospace' }}>
                    {line}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        ) : (
          <p style={{ margin: 0 }}>Udfyld felterne for at se beregnet nettoemission.</p>
        )}
      </section>
    </form>
  )
}
import { createWizardStep } from './StepTemplate'

export const B1Step = createWizardStep('B1', 'Modul B1')
