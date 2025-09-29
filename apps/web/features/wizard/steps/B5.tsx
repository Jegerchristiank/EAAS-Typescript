/**
 * Wizardtrin for modul B5.
 */
'use client'

import { useMemo, type ChangeEvent } from 'react'

import type { B5Input, ModuleInput, ModuleResult } from '@org/shared'
import { runB5 } from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

type FieldKey = keyof B5Input

type FieldConfig = {
  key: FieldKey
  label: string
  description: string
  unit: string
  placeholder?: string
}

const FIELD_CONFIG: FieldConfig[] = [
  {
    key: 'otherEnergyConsumptionKwh',
    label: 'Årligt forbrug',
    description: 'Samlet mængde indkøbt energi for den valgte leverance i kWh.',
    unit: 'kWh'
  },
  {
    key: 'recoveredEnergyKwh',
    label: 'Genindvundet energi',
    description: 'Energi der udnyttes fra processer eller genanvendelse og reducerer behovet.',
    unit: 'kWh'
  },
  {
    key: 'emissionFactorKgPerKwh',
    label: 'Emissionsfaktor',
    description: 'Kg CO2e pr. kWh ifølge leverandørens miljødeklaration.',
    unit: 'kg CO2e/kWh',
    placeholder: '0.075'
  },
  {
    key: 'renewableSharePercent',
    label: 'Vedvarende andel',
    description: 'Andel dokumenteret som vedvarende energi for leverancen.',
    unit: '%',
    placeholder: '0-100'
  }
]

const EMPTY_B5: B5Input = {
  otherEnergyConsumptionKwh: null,
  recoveredEnergyKwh: null,
  emissionFactorKgPerKwh: null,
  renewableSharePercent: null
}

export function B5Step({ state, onChange }: WizardStepProps): JSX.Element {
  const current = (state.B5 as B5Input | undefined) ?? EMPTY_B5

  const preview = useMemo<ModuleResult>(() => {
    return runB5({ B5: current } as ModuleInput)
  }, [current])

  const handleFieldChange = (field: FieldKey) => (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(',', '.')
    const parsed = rawValue === '' ? null : Number.parseFloat(rawValue)
    const next: B5Input = {
      ...current,
      [field]: Number.isFinite(parsed) ? parsed : null
    }
    onChange('B5', next)
  }

  const hasData =
    preview.trace.some((line) => line.includes('netOtherEnergyConsumptionKwh')) &&
    (current.otherEnergyConsumptionKwh != null ||
      current.recoveredEnergyKwh != null ||
      current.emissionFactorKgPerKwh != null ||
      current.renewableSharePercent != null)

  return (
    <form style={{ display: 'grid', gap: '1.5rem', maxWidth: '40rem' }}>
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <h2>B5 – Scope 2 øvrige energileverancer</h2>
        <p>
          Indtast data for energileverancer som ikke dækkes af el, varme, køling eller damp. Beregningen korrigerer for
          genindvundet energi og dokumenteret vedvarende andel.
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
