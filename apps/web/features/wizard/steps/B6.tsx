/**
 * Wizardtrin for modul B6 – nettab i elnettet.
 */
'use client'

import { useMemo, type ChangeEvent } from 'react'

import type { B6Input, ModuleInput, ModuleResult } from '@org/shared'
import { runB6 } from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

type FieldKey = keyof B6Input

type FieldConfig = {
  key: FieldKey
  label: string
  description: string
  unit: string
  placeholder?: string
}

const FIELD_CONFIG: FieldConfig[] = [
  {
    key: 'electricitySuppliedKwh',
    label: 'Årligt elforbrug (basis)',
    description: 'Den leverede mængde elektricitet som nettabbet beregnes ud fra (kWh).',
    unit: 'kWh'
  },
  {
    key: 'gridLossPercent',
    label: 'Nettab',
    description: 'Forventet transmissions- og distributionstab angivet i procent af forbruget.',
    unit: '%',
    placeholder: '0-20'
  },
  {
    key: 'emissionFactorKgPerKwh',
    label: 'Emissionsfaktor',
    description: 'Kg CO2e pr. tabt kWh elektricitet. Typisk samme faktor som for elforbrug.',
    unit: 'kg CO2e/kWh',
    placeholder: '0.233'
  },
  {
    key: 'renewableSharePercent',
    label: 'Vedvarende dækning',
    description: 'Andel af tabet der dokumenteres dækket af vedvarende energi gennem garantier eller certifikater.',
    unit: '%',
    placeholder: '0-100'
  }
]

const EMPTY_B6: B6Input = {
  electricitySuppliedKwh: null,
  gridLossPercent: null,
  emissionFactorKgPerKwh: null,
  renewableSharePercent: null
}

export function B6Step({ state, onChange }: WizardStepProps): JSX.Element {
  const current = (state.B6 as B6Input | undefined) ?? EMPTY_B6

  const preview = useMemo<ModuleResult>(() => {
    return runB6({ B6: current } as ModuleInput)
  }, [current])

  const handleFieldChange = (field: FieldKey) => (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(',', '.')
    const parsed = rawValue === '' ? null : Number.parseFloat(rawValue)
    const next: B6Input = {
      ...current,
      [field]: Number.isFinite(parsed) ? parsed : null
    }
    onChange('B6', next)
  }

  const hasData =
    preview.trace.some((line) => line.includes('lossEnergyKwh')) &&
    (current.electricitySuppliedKwh != null ||
      current.gridLossPercent != null ||
      current.emissionFactorKgPerKwh != null ||
      current.renewableSharePercent != null)

  return (
    <form style={{ display: 'grid', gap: '1.5rem', maxWidth: '40rem' }}>
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <h2>B6 – Scope 2 nettab i elnettet</h2>
        <p>
          Indtast data for transmission- og distributionstab for elektricitet. Resultatet estimerer emissionerne fra tabet og
          reducerer for dokumenteret vedvarende dækning.
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
                max={field.unit === '%' ? 100 : undefined}
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
          <p style={{ margin: 0 }}>Udfyld felterne for at se beregnet emission fra nettab.</p>
        )}
      </section>
    </form>
  )
}
