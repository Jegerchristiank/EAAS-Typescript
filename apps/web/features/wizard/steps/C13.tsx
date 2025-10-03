/**
 * Wizardtrin for modul C13 – investeringer og finansielle aktiviteter.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import type { C13Input, ModuleInput, ModuleResult } from '@org/shared'
import {
  c13EmissionFactorConfigurations,
  defaultC13EmissionFactorKey,
  runC13,
  type C13EmissionFactorKey
} from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

type BaseC13Row = NonNullable<C13Input['investmentLines']>[number]

type C13Row = BaseC13Row & {
  documentationFileName?: string | null
}

type NumericFieldKey = 'investedAmountDkk' | 'documentationQualityPercent'

const EMPTY_C13: { investmentLines: C13Row[] } = {
  investmentLines: []
}

const EMISSION_FACTOR_OPTIONS: Array<{ value: C13EmissionFactorKey; label: string }> = Object.entries(
  c13EmissionFactorConfigurations
).map(([key, config]) => {
  const formattedFactor = new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
  }).format(config.factor)

  return {
    value: key as C13EmissionFactorKey,
    label: `${config.label} (${formattedFactor} ${config.unit})`
  }
})

function createDefaultRow(): C13Row {
  return {
    investedAmountDkk: null,
    emissionFactorKey: defaultC13EmissionFactorKey,
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

export function C13Step({ state, onChange }: WizardStepProps): JSX.Element {
  const stored = (state.C13 as { investmentLines?: C13Row[] } | undefined) ?? EMPTY_C13
  const rows = (stored.investmentLines ?? []) as C13Row[]

  const preview = useMemo<ModuleResult>(() => {
    const investmentLines: NonNullable<C13Input['investmentLines']> = rows.map(
      ({ investedAmountDkk, emissionFactorKey, documentationQualityPercent }) => ({
        investedAmountDkk,
        emissionFactorKey,
        documentationQualityPercent
      })
    )

    return runC13({ C13: { investmentLines } as C13Input } as ModuleInput)
  }, [rows])

  const updateRows = (nextRows: C13Row[]) => {
    onChange('C13', {
      investmentLines: nextRows as unknown as NonNullable<C13Input['investmentLines']>
    })
  }

  const handleAddRow = () => {
    updateRows([...rows, createDefaultRow()])
  }

  const handleRemoveRow = (index: number) => () => {
    updateRows(rows.filter((_, rowIndex) => rowIndex !== index))
  }

  const handleEmissionFactorChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const nextKey = event.target.value as C13EmissionFactorKey

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
        <h2>C13 – Investeringer og finansielle aktiviteter</h2>
        <p style={{ margin: 0 }}>
          Registrér investeringsbeløb og emissionsintensitet for porteføljer, fonde eller finansielle produkter. Modulet beregner
          Scope 3-emissioner ved at multiplicere investeret kapital med valgte faktorer og flagger lav dokumentationskvalitet under
          60&nbsp;%. Vedhæft dokumentation for porteføljer eller ESG-rapporter efter behov.
        </p>
      </header>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Investeringslinjer</h3>
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
            Tilføj investering
          </button>
        </div>

        {hasRows ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {rows.map((row, index) => (
              <article
                key={`c13-row-${index}`}
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
                  <strong>Investering {index + 1}</strong>
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
                    <span>Beløb investeret (DKK)</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      value={row.investedAmountDkk ?? ''}
                      placeholder="fx 2 500 000"
                      onChange={handleNumericFieldChange(index, 'investedAmountDkk')}
                      style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                    />
                  </label>

                  <label style={{ display: 'grid', gap: '0.25rem' }}>
                    <span>Emissionsfaktor</span>
                    <select
                      value={row.emissionFactorKey ?? defaultC13EmissionFactorKey}
                      onChange={handleEmissionFactorChange(index)}
                      style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                    >
                      {EMISSION_FACTOR_OPTIONS.map((option) => (
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
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#555' }}>
            Tilføj mindst én linje for at beregne emissionerne fra investeringer og finansielle aktiviteter.
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
