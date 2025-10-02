/**
 * Wizardtrin for modul B1.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import type { B1Input, ModuleInput, ModuleResult } from '@org/shared'
import { b1CalculationMethodOptions, b1EmissionFactorOptions, runB1 } from '@org/shared'
import type { WizardStepProps } from './StepTemplate'

const EMPTY_B1: B1Input = {
  consumptionKwh: null,
  emissionFactorSource: 'landefaktor',
  emissionFactorKgPerKwh: b1EmissionFactorOptions[0].defaultEmissionFactorKgPerKwh,
  calculationMethod: 'locationBased',
  documentationQualityPercent: 100,
  documentationFileName: null
}

export function B1Step({ state, onChange }: WizardStepProps): JSX.Element {
  const current = (state.B1 as B1Input | undefined) ?? EMPTY_B1

  const preview = useMemo<ModuleResult>(() => {
    return runB1({ B1: current } as ModuleInput)
  }, [current])

  const handleNumberChange = (
    field: keyof Pick<B1Input, 'consumptionKwh' | 'emissionFactorKgPerKwh' | 'documentationQualityPercent'>
  ) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value.replace(',', '.')
      const parsed = rawValue === '' ? null : Number.parseFloat(rawValue)
      onChange('B1', {
        ...current,
        [field]: Number.isFinite(parsed) ? parsed : null
      })
    }

  const handleEmissionFactorSourceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const source = event.target.value as NonNullable<B1Input['emissionFactorSource']>
    const defaults =
      b1EmissionFactorOptions.find((option) => option.value === source)?.defaultEmissionFactorKgPerKwh ??
      current.emissionFactorKgPerKwh ??
      b1EmissionFactorOptions[0].defaultEmissionFactorKgPerKwh

    onChange('B1', {
      ...current,
      emissionFactorSource: source,
      emissionFactorKgPerKwh: defaults
    })
  }

  const handleMethodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as NonNullable<B1Input['calculationMethod']>
    onChange('B1', { ...current, calculationMethod: value })
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    onChange('B1', { ...current, documentationFileName: file?.name ?? null })
  }

  const hasData =
    preview.trace.some((line) => line.includes('emissionsKg=')) &&
    (current.consumptionKwh != null || current.emissionFactorKgPerKwh != null)

  return (
    <form style={{ display: 'grid', gap: '1.5rem', maxWidth: '40rem' }}>
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <h2>B1 – Scope 2 elforbrug</h2>
        <p>
          Indtast data for organisationens elforbrug. Resultatet beregnes ud fra kWh og valgt emissionsfaktor, og
          dokumentationsfeltet hjælper med at markere lav datakvalitet.
        </p>
      </header>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Elforbrug (kWh)</span>
          <span style={{ color: '#555', fontSize: '0.9rem' }}>Angiv samlet indkøbt elektricitet i perioden.</span>
          <input
            type="number"
            min={0}
            step="any"
            value={current.consumptionKwh ?? ''}
            onChange={handleNumberChange('consumptionKwh')}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Emissionsfaktorkilde</span>
          <span style={{ color: '#555', fontSize: '0.9rem' }}>
            Vælg om landefaktor eller residualmix skal anvendes som udgangspunkt.
          </span>
          <select
            value={current.emissionFactorSource ?? 'landefaktor'}
            onChange={handleEmissionFactorSourceChange}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
          >
            {b1EmissionFactorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small style={{ color: '#666' }}>
            {b1EmissionFactorOptions.find((option) => option.value === current.emissionFactorSource)?.description}
          </small>
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Emissionsfaktor (kg CO₂e/kWh)</span>
          <span style={{ color: '#555', fontSize: '0.9rem' }}>
            Juster ved behov hvis leverandøren oplyser en anden værdi.
          </span>
          <input
            type="number"
            min={0}
            step="any"
            value={current.emissionFactorKgPerKwh ?? ''}
            onChange={handleNumberChange('emissionFactorKgPerKwh')}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Beregningsmetode</span>
          <span style={{ color: '#555', fontSize: '0.9rem' }}>
            Angiv om resultatet skal rapporteres location- eller market-based.
          </span>
          <select
            value={current.calculationMethod ?? 'locationBased'}
            onChange={handleMethodChange}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
          >
            {b1CalculationMethodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Dokumentationskvalitet (%)</span>
          <span style={{ color: '#555', fontSize: '0.9rem' }}>
            Vurder kvaliteten af fakturaer eller måleraflæsninger.
          </span>
          <input
            type="number"
            min={0}
            max={100}
            step="any"
            value={current.documentationQualityPercent ?? ''}
            onChange={handleNumberChange('documentationQualityPercent')}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Dokumentation (fil)</span>
          <span style={{ color: '#555', fontSize: '0.9rem' }}>Upload elregning eller måleraflæsning.</span>
          <input type="file" onChange={handleFileChange} />
          {current.documentationFileName && (
            <span style={{ color: '#333', fontSize: '0.85rem' }}>{current.documentationFileName}</span>
          )}
        </label>
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
          <p style={{ margin: 0 }}>Udfyld felterne for at se beregnet emission.</p>
        )}
      </section>
    </form>
  )
}
