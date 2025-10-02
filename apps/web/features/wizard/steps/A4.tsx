/**
 * Wizardtrin for modul A4 – kølemidler og andre gasser.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import type { A4Input, ModuleInput, ModuleResult } from '@org/shared'
import {
  a4DefaultLeakagePercent,
  a4RefrigerantConfigurations,
  a4RefrigerantOptions,
  runA4
} from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

type BaseRefrigerantRow = NonNullable<A4Input['refrigerantLines']>[number]

type RefrigerantRow = BaseRefrigerantRow & {
  gwpSource?: string | null
  documentationFileName?: string | null
}

const EMPTY_A4: A4Input = {
  refrigerantLines: []
}

const GWP_SOURCE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'standard', label: 'GWP100 fra database' },
  { value: 'leverandor', label: 'Leverandørdata / laboratorie' }
]

type RefrigerantKey = keyof typeof a4RefrigerantConfigurations

function createDefaultRow(refrigerantType: RefrigerantKey = 'hfc134a'): RefrigerantRow {
  const config = a4RefrigerantConfigurations[refrigerantType]
  return {
    refrigerantType,
    systemChargeKg: null,
    leakagePercent: a4DefaultLeakagePercent,
    gwp100: config.defaultGwp100,
    documentationQualityPercent: 100,
    gwpSource: 'standard',
    documentationFileName: null
  }
}

function parseNumber(value: string): number | null {
  const normalised = value.replace(',', '.')
  if (normalised.trim() === '') {
    return null
  }
  const parsed = Number.parseFloat(normalised)
  return Number.isFinite(parsed) ? parsed : null
}

export function A4Step({ state, onChange }: WizardStepProps): JSX.Element {
  const stored = (state.A4 as { refrigerantLines?: RefrigerantRow[] } | undefined) ?? EMPTY_A4
  const rows = (stored.refrigerantLines ?? []) as RefrigerantRow[]

  const preview = useMemo<ModuleResult>(() => {
    const calculationRows: NonNullable<A4Input['refrigerantLines']> = rows.map(
      ({ refrigerantType, systemChargeKg, leakagePercent, gwp100, documentationQualityPercent }) => ({
        refrigerantType,
        systemChargeKg,
        leakagePercent,
        gwp100,
        documentationQualityPercent
      })
    )
    return runA4({ A4: { refrigerantLines: calculationRows } as A4Input } as ModuleInput)
  }, [rows])

  const updateRows = (nextRows: RefrigerantRow[]) => {
    onChange('A4', { refrigerantLines: nextRows as unknown as A4Input['refrigerantLines'] })
  }

  const handleAddRow = () => {
    updateRows([...rows, createDefaultRow()])
  }

  const handleRemoveRow = (index: number) => () => {
    updateRows(rows.filter((_, rowIndex) => rowIndex !== index))
  }

  const handleRefrigerantChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.target.value as RefrigerantRow['refrigerantType']
    const config = a4RefrigerantConfigurations[nextType]
    const existing = rows[index]
    const nextRow: RefrigerantRow = {
      refrigerantType: nextType,
      systemChargeKg: existing?.systemChargeKg ?? null,
      leakagePercent: existing?.leakagePercent ?? a4DefaultLeakagePercent,
      gwp100: config.defaultGwp100,
      documentationQualityPercent: existing?.documentationQualityPercent ?? 100,
      gwpSource: 'standard',
      documentationFileName: existing?.documentationFileName ?? null
    }
    updateRows(rows.map((row, rowIndex) => (rowIndex === index ? nextRow : row)))
  }

  const handleNumericFieldChange = (index: number, field: keyof BaseRefrigerantRow) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const parsed = parseNumber(event.target.value)
      updateRows(
        rows.map((row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                [field]: parsed
              }
            : row
        )
      )
    }

  const handleGwpSourceChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    const config = a4RefrigerantConfigurations[rows[index].refrigerantType]
    updateRows(
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              gwpSource: value,
              gwp100: value === 'standard' ? config.defaultGwp100 : row.gwp100
            }
          : row
      )
    )
  }

  const handleFileChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    updateRows(
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              documentationFileName: file ? file.name : null
            }
          : row
      )
    )
  }

  const handleClearFile = (index: number) => () => {
    updateRows(
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              documentationFileName: null
            }
          : row
      )
    )
  }

  const hasRows = rows.length > 0

  return (
    <form style={{ display: 'grid', gap: '1.5rem', maxWidth: '64rem' }}>
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <h2>A4 – Scope 1 flugtige emissioner</h2>
        <p style={{ margin: 0 }}>
          Indsaml data om fyldning af kølemidler og andre gasser. Angiv lækageandel, vælg GWP100-reference og upload
          relevant service- eller lækagerapport.
        </p>
      </header>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Kølemiddellinjer</h3>
          <button
            type="button"
            onClick={handleAddRow}
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
            Tilføj kølemiddel
          </button>
        </div>

        {hasRows ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {rows.map((row, index) => {
              const config = a4RefrigerantConfigurations[row.refrigerantType]
              return (
                <article
                  key={`refrigerant-row-${index}`}
                  style={{
                    border: '1px solid #d0d7d5',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    display: 'grid',
                    gap: '0.75rem',
                    background: '#f9fbfa'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Anlæg {index + 1}</strong>
                    <button
                      type="button"
                      onClick={handleRemoveRow(index)}
                      style={{ border: 'none', background: 'transparent', color: '#b4231f', cursor: 'pointer' }}
                    >
                      Fjern
                    </button>
                  </div>

                  <label style={{ display: 'grid', gap: '0.25rem' }}>
                    <span>Kølemiddeltype</span>
                    <select
                      value={row.refrigerantType}
                      onChange={handleRefrigerantChange(index)}
                      style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                    >
                      {a4RefrigerantOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Fyldning</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        value={row.systemChargeKg ?? ''}
                        placeholder="0 kg"
                        onChange={handleNumericFieldChange(index, 'systemChargeKg')}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#5f6f6a' }}>kg</span>
                    </label>

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Lækageandel</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={100}
                        step="any"
                        value={row.leakagePercent ?? ''}
                        placeholder="fx 10%"
                        onChange={handleNumericFieldChange(index, 'leakagePercent')}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#5f6f6a' }}>%</span>
                    </label>

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>GWP100 kilde</span>
                      <select
                        value={row.gwpSource ?? 'standard'}
                        onChange={handleGwpSourceChange(index)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      >
                        {GWP_SOURCE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        value={row.gwp100 ?? ''}
                        onChange={handleNumericFieldChange(index, 'gwp100')}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#5f6f6a' }}>kg CO₂e/kg</span>
                    </label>

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Dokumentationskvalitet (%)</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={100}
                        step="any"
                        value={row.documentationQualityPercent ?? ''}
                        onChange={handleNumericFieldChange(index, 'documentationQualityPercent')}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gap: '0.35rem' }}>
                    <label style={{ fontWeight: 600 }}>Dokumentation</label>
                    <input
                      type="file"
                      onChange={handleFileChange(index)}
                      style={{
                        padding: '0.45rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #c8d2cf',
                        background: '#f6f9f8'
                      }}
                    />
                    {row.documentationFileName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <span>{row.documentationFileName}</span>
                        <button
                          type="button"
                          onClick={handleClearFile(index)}
                          style={{ border: 'none', background: 'transparent', color: '#b4231f', cursor: 'pointer' }}
                        >
                          Fjern
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#5f6f6a' }}>Tilføj mindst ét anlæg for at beregne flugtige emissioner.</p>
        )}
      </section>

      <section style={{ display: 'grid', gap: '0.75rem', background: '#f1f5f4', padding: '1rem', borderRadius: '0.75rem' }}>
        <h3 style={{ margin: 0 }}>Estimat</h3>
        {rows.length > 0 && preview.trace.some((line) => line.startsWith('entry[')) ? (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
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
                <strong>Advarsler</strong>
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
                {preview.trace.map((line, index) => (
                  <li key={`trace-${index}`} style={{ fontFamily: 'monospace' }}>
                    {line}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        ) : (
          <p style={{ margin: 0 }}>Udfyld kølemiddellinjer for at få beregnet Scope 1-emissioner.</p>
        )}
      </section>
    </form>
  )
}
