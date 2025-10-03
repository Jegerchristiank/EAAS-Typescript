/**
 * Wizardtrin for modul C10 – upstream leasede aktiver.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import type { C10Input, ModuleInput, ModuleResult } from '@org/shared'
import { c10EnergyConfigurations, runC10 } from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

type BaseC10Row = NonNullable<C10Input['leasedAssetLines']>[number]

type EmissionFactorSource = 'standard' | 'supplier' | 'custom'

type C10Row = BaseC10Row & {
  emissionFactorSource?: EmissionFactorSource | null
  documentationFileName?: string | null
}

type NumericFieldKey =
  | 'floorAreaSqm'
  | 'energyConsumptionKwh'
  | 'emissionFactorKgPerKwh'
  | 'documentationQualityPercent'

type EnergyTypeOption = { value: C10Row['energyType']; label: string }

const ENERGY_TYPE_OPTIONS: EnergyTypeOption[] = [
  { value: 'electricity', label: 'Elektricitet' },
  { value: 'heat', label: 'Varme' }
]

const EMISSION_FACTOR_SOURCE_OPTIONS: Array<{ value: EmissionFactorSource; label: string }> = [
  { value: 'standard', label: 'Standardfaktor fra database' },
  { value: 'supplier', label: 'Leverandør-/kontraktsdata' },
  { value: 'custom', label: 'Manuelt angivet faktor' }
]

const EMPTY_C10: { leasedAssetLines: C10Row[] } = {
  leasedAssetLines: []
}

function createDefaultRow(energyType: C10Row['energyType'] = 'electricity'): C10Row {
  return {
    energyType,
    floorAreaSqm: null,
    energyConsumptionKwh: null,
    emissionFactorKgPerKwh: c10EnergyConfigurations[energyType].defaultEmissionFactorKgPerKwh,
    documentationQualityPercent: 100,
    emissionFactorSource: 'standard',
    documentationFileName: null
  }
}

function parseNumber(value: string): number | null {
  const normalised = value.replace(',', '.').trim()
  if (normalised === '') {
    return null
  }

  const parsed = Number.parseFloat(normalised)
  return Number.isFinite(parsed) ? parsed : null
}

export function C10Step({ state, onChange }: WizardStepProps): JSX.Element {
  const stored = (state.C10 as { leasedAssetLines?: C10Row[] } | undefined) ?? EMPTY_C10
  const rows = (stored.leasedAssetLines ?? []) as C10Row[]

  const preview = useMemo<ModuleResult>(() => {
    const leasedAssetLines: NonNullable<C10Input['leasedAssetLines']> = rows.map(
      ({ energyType, floorAreaSqm, energyConsumptionKwh, emissionFactorKgPerKwh, documentationQualityPercent }) => ({
        energyType,
        floorAreaSqm,
        energyConsumptionKwh,
        emissionFactorKgPerKwh,
        documentationQualityPercent
      })
    )

    return runC10({ C10: { leasedAssetLines } as C10Input } as ModuleInput)
  }, [rows])

  const updateRows = (nextRows: C10Row[]) => {
    onChange('C10', {
      leasedAssetLines: nextRows as unknown as NonNullable<C10Input['leasedAssetLines']>
    })
  }

  const handleAddRow = () => {
    updateRows([...rows, createDefaultRow()])
  }

  const handleRemoveRow = (index: number) => () => {
    updateRows(rows.filter((_, rowIndex) => rowIndex !== index))
  }

  const handleEnergyTypeChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.target.value as C10Row['energyType']

    updateRows(
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              energyType: nextType,
              emissionFactorKgPerKwh: c10EnergyConfigurations[nextType].defaultEmissionFactorKgPerKwh ?? null,
              emissionFactorSource: 'standard'
            }
          : row
      )
    )
  }

  const handleNumericFieldChange = (index: number, field: NumericFieldKey) => (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleEmissionFactorSourceChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const nextSource = event.target.value as EmissionFactorSource

    updateRows(
      rows.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row
        }

        const config = c10EnergyConfigurations[row.energyType]
        return {
          ...row,
          emissionFactorSource: nextSource,
          emissionFactorKgPerKwh:
            nextSource === 'standard'
              ? config.defaultEmissionFactorKgPerKwh ?? row.emissionFactorKgPerKwh
              : row.emissionFactorKgPerKwh
        }
      })
    )
  }

  const handleFileChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

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

  const handleFileClear = (index: number) => () => {
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
        <h2>C10 – Upstream leasede aktiver</h2>
        <p style={{ margin: 0 }}>
          Registrér energi for leasede bygninger/aktiver hvor virksomheden stadig har ansvar for forbruget. Indtast enten målt
          energiforbrug eller areal – så anvender modulet standardintensiteter for at estimere kWh og beregner emissioner ud fra
          den valgte energitype.
        </p>
      </header>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Lejede aktiver</h3>
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
            Tilføj linje
          </button>
        </div>

        {hasRows ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {rows.map((row, index) => {
              const energyConfig = c10EnergyConfigurations[row.energyType]
              return (
                <article
                  key={`c10-row-${index}`}
                  style={{
                    border: '1px solid #d0d7d5',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    display: 'grid',
                    gap: '0.9rem',
                    background: '#f9fbfa'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Linje {index + 1}</strong>
                    <button
                      type="button"
                      onClick={handleRemoveRow(index)}
                      style={{ border: 'none', background: 'transparent', color: '#b4231f', cursor: 'pointer' }}
                    >
                      Fjern
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Energitype</span>
                      <select
                        value={row.energyType}
                        onChange={handleEnergyTypeChange(index)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      >
                        {ENERGY_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Areal (m²)</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        value={row.floorAreaSqm ?? ''}
                        placeholder="fx 1 200"
                        onChange={handleNumericFieldChange(index, 'floorAreaSqm')}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Energiforbrug (kWh)</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        value={row.energyConsumptionKwh ?? ''}
                        placeholder="fx 45 000"
                        onChange={handleNumericFieldChange(index, 'energyConsumptionKwh')}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Kilde til emissionsfaktor</span>
                      <select
                        value={row.emissionFactorSource ?? 'standard'}
                        onChange={handleEmissionFactorSourceChange(index)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      >
                        {EMISSION_FACTOR_SOURCE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Emissionsfaktor (kg CO₂e/kWh)</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        value={row.emissionFactorKgPerKwh ?? ''}
                        placeholder={`Standard ${energyConfig.defaultEmissionFactorKgPerKwh}`}
                        onChange={handleNumericFieldChange(index, 'emissionFactorKgPerKwh')}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      />
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
                        placeholder="0-100"
                        onChange={handleNumericFieldChange(index, 'documentationQualityPercent')}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gap: '0.45rem' }}>
                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Dokumentation</span>
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
                    </label>
                    {row.documentationFileName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <span>{row.documentationFileName}</span>
                        <button
                          type="button"
                          onClick={handleFileClear(index)}
                          style={{ border: 'none', background: 'transparent', color: '#b4231f', cursor: 'pointer' }}
                        >
                          Fjern
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#4f5d59' }}>
                    Hvis energiforbruget mangler, estimeres det ud fra arealet og standardintensiteten for den valgte energitype.
                  </p>
                </article>
              )
            })}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#555' }}>
            Tilføj mindst én linje for at beregne emissionerne fra upstream leasede aktiver.
          </p>
        )}
      </section>

      <section
        style={{ display: 'grid', gap: '0.75rem', background: '#f1f5f4', padding: '1rem', borderRadius: '0.75rem' }}
      >
        <h3 style={{ margin: 0 }}>Estimat</h3>
        {hasRows ? (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              {preview.value} {preview.unit}
            </p>
            {preview.assumptions.length > 0 ? (
              <div>
                <strong>Antagelser</strong>
                <ul>
                  {preview.assumptions.map((assumption, assumptionIndex) => (
                    <li key={`assumption-${assumptionIndex}`}>{assumption}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {preview.warnings.length > 0 ? (
              <div>
                <strong>Advarsler</strong>
                <ul>
                  {preview.warnings.map((warning, warningIndex) => (
                    <li key={`warning-${warningIndex}`}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <details>
              <summary>Teknisk trace</summary>
              <ul>
                {preview.trace.map((line, traceIndex) => (
                  <li key={`trace-${traceIndex}`} style={{ fontFamily: 'monospace' }}>
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
