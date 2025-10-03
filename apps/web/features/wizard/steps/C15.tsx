/**
 * Wizardtrin for modul C15 – screening af øvrige Scope 3-kategorier.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import type { C15Input, ModuleInput, ModuleResult } from '@org/shared'
import {
  c15Categories,
  c15CategoryLabels,
  c15EmissionFactorConfigurations,
  defaultC15EmissionFactorKeyByCategory,
  runC15,
  type C15Category,
  type C15EmissionFactorKey
} from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

type BaseC15Row = NonNullable<C15Input['screeningLines']>[number]

type C15Row = BaseC15Row & {
  documentationFileName?: string | null
}

type NumericFieldKey = 'estimatedQuantity' | 'documentationQualityPercent'

type TextFieldKey = 'description' | 'quantityUnit'

const EMPTY_C15: { screeningLines: C15Row[] } = { screeningLines: [] }

const CATEGORY_OPTIONS: Array<{ value: C15Category; label: string }> = c15Categories.map((category) => ({
  value: category,
  label: c15CategoryLabels[category]
}))

const EMISSION_FACTOR_OPTIONS_BY_CATEGORY: Record<C15Category, Array<{ value: C15EmissionFactorKey; label: string }>> =
  c15Categories.reduce((acc, category) => {
    const options = Object.entries(c15EmissionFactorConfigurations)
      .filter(([, config]) => config.category === category)
      .map(([key, config]) => {
        const formattedFactor = new Intl.NumberFormat('da-DK', {
          minimumFractionDigits: config.factor < 1 ? 3 : 0,
          maximumFractionDigits: config.factor < 1 ? 3 : 0
        }).format(config.factor)

        return {
          value: key as C15EmissionFactorKey,
          label: `${config.label} (${formattedFactor} ${config.unit})`
        }
      })

    acc[category] = options
    return acc
  }, {} as Record<C15Category, Array<{ value: C15EmissionFactorKey; label: string }>>)

function createDefaultRow(): C15Row {
  const defaultCategory: C15Category = '1'
  const defaultFactorKey = defaultC15EmissionFactorKeyByCategory[defaultCategory]

  return {
    category: defaultCategory,
    description: null,
    quantityUnit: 'DKK',
    estimatedQuantity: null,
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

export function C15Step({ state, onChange }: WizardStepProps): JSX.Element {
  const stored = (state.C15 as { screeningLines?: C15Row[] } | undefined) ?? EMPTY_C15
  const rows = (stored.screeningLines ?? []) as C15Row[]

  const preview = useMemo<ModuleResult>(() => {
    const screeningLines: NonNullable<C15Input['screeningLines']> = rows.map(
      ({
        category,
        description,
        quantityUnit,
        estimatedQuantity,
        emissionFactorKey,
        documentationQualityPercent
      }) => ({
        category,
        description,
        quantityUnit,
        estimatedQuantity,
        emissionFactorKey,
        documentationQualityPercent
      })
    )

    return runC15({ C15: { screeningLines } as C15Input } as ModuleInput)
  }, [rows])

  const updateRows = (nextRows: C15Row[]) => {
    onChange('C15', {
      screeningLines: nextRows as unknown as NonNullable<C15Input['screeningLines']>
    })
  }

  const handleAddRow = () => {
    updateRows([...rows, createDefaultRow()])
  }

  const handleRemoveRow = (index: number) => () => {
    updateRows(rows.filter((_, rowIndex) => rowIndex !== index))
  }

  const handleCategoryChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const nextCategory = event.target.value as C15Category
    const defaultFactorKey = defaultC15EmissionFactorKeyByCategory[nextCategory]

    updateRows(
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              category: nextCategory,
              emissionFactorKey: defaultFactorKey
            }
          : row
      )
    )
  }

  const handleEmissionFactorChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const nextKey = event.target.value as C15EmissionFactorKey

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

  const handleTextFieldChange = (index: number, field: TextFieldKey) => (event: ChangeEvent<HTMLInputElement>) => {
    const trimmed = event.target.value.trim()

    updateRows(
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: trimmed === '' ? null : trimmed
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
        <h2>C15 – Øvrige kategorioplysninger</h2>
        <p style={{ margin: 0 }}>
          Registrér screening for de Scope 3-kategorier, der endnu ikke har dedikerede moduler. Kombinér beskrivelser, enheder og
          estimerede mængder med passende emissionsfaktorer for at få et hurtigt Scope 3-overblik. Modulet markerer lav
          dokumentationskvalitet under 60&nbsp;%, og du kan vedhæfte noter eller bilag til hver kategori.
        </p>
      </header>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Screeninglinjer</h3>
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
            Tilføj screeninglinje
          </button>
        </div>

        {hasRows ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {rows.map((row, index) => {
              const category = (row.category as C15Category | null) ?? '1'
              const factorOptions = EMISSION_FACTOR_OPTIONS_BY_CATEGORY[category]
              return (
                <article
                  key={`c15-row-${index}`}
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
                      <span>Kategori</span>
                      <select
                        value={row.category ?? '1'}
                        onChange={handleCategoryChange(index)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      >
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Beskrivelse</span>
                      <input
                        type="text"
                        value={row.description ?? ''}
                        onChange={handleTextFieldChange(index, 'description')}
                        placeholder="fx Transport og distribution"
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Enhed</span>
                      <input
                        type="text"
                        value={row.quantityUnit ?? ''}
                        onChange={handleTextFieldChange(index, 'quantityUnit')}
                        placeholder="fx DKK, ton, km"
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Estimeret mængde</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        value={row.estimatedQuantity ?? ''}
                        placeholder="fx 450 000"
                        onChange={handleNumericFieldChange(index, 'estimatedQuantity')}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Emissionsfaktor</span>
                      <select
                        value={row.emissionFactorKey ?? defaultC15EmissionFactorKeyByCategory[category]}
                        onChange={handleEmissionFactorChange(index)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      >
                        {factorOptions.map((option) => (
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
                </article>
              )
            })}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#555' }}>
            Tilføj mindst én linje for at dokumentere de resterende Scope 3-kategorier.
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
