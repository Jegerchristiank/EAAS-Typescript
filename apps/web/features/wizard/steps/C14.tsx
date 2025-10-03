/**
 * Wizardtrin for modul C14 – behandling af solgte produkter.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import type { C14Input, ModuleInput, ModuleResult } from '@org/shared'
import {
  c14EmissionFactorConfigurations,
  c14TreatmentTypes,
  defaultC14EmissionFactorKeyByTreatment,
  runC14,
  type C14EmissionFactorKey,
  type C14TreatmentType
} from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

type BaseC14Row = NonNullable<C14Input['treatmentLines']>[number]

type C14Row = BaseC14Row & {
  documentationFileName?: string | null
}

type NumericFieldKey = 'tonnesTreated' | 'documentationQualityPercent'

const EMPTY_C14: { treatmentLines: C14Row[] } = { treatmentLines: [] }

const TREATMENT_OPTIONS: Array<{ value: C14TreatmentType; label: string }> = c14TreatmentTypes.map((type) => {
  const labelMap: Record<C14TreatmentType, string> = {
    recycling: 'Genanvendelse',
    incineration: 'Forbrænding',
    landfill: 'Deponi'
  }
  return { value: type, label: labelMap[type] }
})

const EMISSION_FACTOR_OPTIONS_BY_TREATMENT: Record<C14TreatmentType, Array<{ value: C14EmissionFactorKey; label: string }>> =
  c14TreatmentTypes.reduce((acc, treatmentType) => {
    const options = Object.entries(c14EmissionFactorConfigurations)
      .filter(([, config]) => config.treatmentType === treatmentType)
      .map(([key, config]) => {
        const formattedFactor = new Intl.NumberFormat('da-DK', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(config.factor)

        return {
          value: key as C14EmissionFactorKey,
          label: `${config.label} (${formattedFactor} ${config.unit})`
        }
      })

    acc[treatmentType] = options
    return acc
  }, {} as Record<C14TreatmentType, Array<{ value: C14EmissionFactorKey; label: string }>>)

function createDefaultRow(): C14Row {
  const defaultTreatment: C14TreatmentType = 'recycling'
  const defaultFactorKey = defaultC14EmissionFactorKeyByTreatment[defaultTreatment]

  return {
    treatmentType: defaultTreatment,
    tonnesTreated: null,
    emissionFactorKey: defaultFactorKey,
    documentationQualityPercent: 100,
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

export function C14Step({ state, onChange }: WizardStepProps): JSX.Element {
  const stored = (state.C14 as { treatmentLines?: C14Row[] } | undefined) ?? EMPTY_C14
  const rows = (stored.treatmentLines ?? []) as C14Row[]

  const preview = useMemo<ModuleResult>(() => {
    const treatmentLines: NonNullable<C14Input['treatmentLines']> = rows.map(
      ({ treatmentType, tonnesTreated, emissionFactorKey, documentationQualityPercent }) => ({
        treatmentType,
        tonnesTreated,
        emissionFactorKey,
        documentationQualityPercent
      })
    )

    return runC14({ C14: { treatmentLines } as C14Input } as ModuleInput)
  }, [rows])

  const updateRows = (nextRows: C14Row[]) => {
    onChange('C14', {
      treatmentLines: nextRows as unknown as NonNullable<C14Input['treatmentLines']>
    })
  }

  const handleAddRow = () => {
    updateRows([...rows, createDefaultRow()])
  }

  const handleRemoveRow = (index: number) => () => {
    updateRows(rows.filter((_, rowIndex) => rowIndex !== index))
  }

  const handleTreatmentChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const nextTreatment = event.target.value as C14TreatmentType
    const defaultFactorKey = defaultC14EmissionFactorKeyByTreatment[nextTreatment]

    updateRows(
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              treatmentType: nextTreatment,
              emissionFactorKey: defaultFactorKey
            }
          : row
      )
    )
  }

  const handleEmissionFactorChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const nextKey = event.target.value as C14EmissionFactorKey

    updateRows(
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              emissionFactorKey: nextKey
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
        <h2>C14 – Behandling af solgte produkter</h2>
        <p style={{ margin: 0 }}>
          Registrér tonnagen af solgte produkter, der efterfølgende behandles ved genanvendelse, forbrænding eller deponi. Modulet
          multiplicerer tonnage med valgte emissionsfaktorer (kg CO₂e/ton) og fremhæver lav dokumentationskvalitet under 60&nbsp;%. Vedhæft gerne
          serviceaftaler eller behandlingsrapporter som dokumentation.
        </p>
      </header>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Behandlingslinjer</h3>
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
            Tilføj behandlingslinje
          </button>
        </div>

        {hasRows ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {rows.map((row, index) => {
              const treatmentOptions = EMISSION_FACTOR_OPTIONS_BY_TREATMENT[row.treatmentType ?? 'recycling']
              return (
                <article
                  key={`c14-row-${index}`}
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
                      <span>Behandlingstype</span>
                      <select
                        value={row.treatmentType ?? 'recycling'}
                        onChange={handleTreatmentChange(index)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      >
                        {TREATMENT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Tonnage (ton)</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        value={row.tonnesTreated ?? ''}
                        placeholder="fx 1 250"
                        onChange={handleNumericFieldChange(index, 'tonnesTreated')}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Emissionsfaktor</span>
                      <select
                        value={row.emissionFactorKey ?? defaultC14EmissionFactorKeyByTreatment[row.treatmentType ?? 'recycling']}
                        onChange={handleEmissionFactorChange(index)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      >
                        {treatmentOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
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
                    Ton-mængder multipliceres med valgte faktorer for den angivne behandling. Lever dokumentation for afsætningen,
                    så emissionerne kan underbygges.
                  </p>
                </article>
              )
            })}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#555' }}>
            Tilføj mindst én linje for at beregne emissionerne fra behandling af solgte produkter.
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
