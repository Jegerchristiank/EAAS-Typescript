/**
 * Wizardtrin for modul B3.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import type { B3Input, ModuleInput, ModuleResult } from '@org/shared'
import { runB3 } from '@org/shared'
import type { WizardStepProps } from './StepTemplate'

type FieldKey = keyof B3Input

type FieldConfig = {
  key: FieldKey
  label: string
  description: string
  unit: string
  placeholder?: string
}

const FIELD_CONFIG: FieldConfig[] = [
  {
    key: 'coolingConsumptionKwh',
    label: 'Årligt køleforbrug',
    description: 'Samlet køleenergi leveret fra forsyningen i kWh.',
    unit: 'kWh'
  },
  {
    key: 'recoveredCoolingKwh',
    label: 'Genindvundet eller frikøling',
    description: 'Køling fra genindvinding eller frikøling, der reducerer behovet.',
    unit: 'kWh'
  },
  {
    key: 'emissionFactorKgPerKwh',
    label: 'Emissionsfaktor',
    description: 'Kg CO2e pr. kWh i køleleverandørens miljødeklaration.',
    unit: 'kg CO2e/kWh',
    placeholder: '0.030'
  },
  {
    key: 'renewableSharePercent',
    label: 'Vedvarende andel',
    description: 'Andel af kølingen købt som certificeret vedvarende energi.',
    unit: '%',
    placeholder: '0-100'
  }
]

const EMPTY_B3: B3Input = {
  coolingConsumptionKwh: null,
  recoveredCoolingKwh: null,
  emissionFactorKgPerKwh: null,
  renewableSharePercent: null
}

export function B3Step({ state, onChange }: WizardStepProps): JSX.Element {
  const current = (state.B3 as B3Input | undefined) ?? EMPTY_B3

  const preview = useMemo<ModuleResult>(() => {
    return runB3({ B3: current } as ModuleInput)
  }, [current])

  const handleFieldChange = (field: FieldKey) => (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(',', '.')
    const parsed = rawValue === '' ? null : Number.parseFloat(rawValue)
    const next: B3Input = {
      ...current,
      [field]: Number.isFinite(parsed) ? parsed : null
    }
    onChange('B3', next)
  }

  const hasData =
    preview.trace.some((line) => line.includes('netCoolingConsumptionKwh')) &&
    (current.coolingConsumptionKwh != null ||
      current.recoveredCoolingKwh != null ||
      current.emissionFactorKgPerKwh != null ||
      current.renewableSharePercent != null)

  return (
    <form style={{ display: 'grid', gap: '1.5rem', maxWidth: '40rem' }}>
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <h2>B3 – Scope 2 køleforbrug</h2>
        <p>
          Indtast data for organisationens indkøbte køling. Beregningen korrigerer for frikøling/genindvinding og
          dokumenteret vedvarende leverancer.
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
      <section
        style={{ display: 'grid', gap: '0.75rem', background: '#f1f5f4', padding: '1rem', borderRadius: '0.75rem' }}
      >
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
