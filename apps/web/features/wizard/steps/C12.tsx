/**
 * Wizardtrin for modul C12 – franchising og downstream services.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import type { C12Input, ModuleInput, ModuleResult } from '@org/shared'
import {
  c12EmissionFactorConfigurations,
  defaultC12EmissionFactorKeyByBasis,
  runC12,
  type C12ActivityBasis,
  type C12EmissionFactorKey
} from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

type BaseC12Row = NonNullable<C12Input['franchiseLines']>[number]

type C12Row = BaseC12Row & {
  documentationFileName?: string | null
}

type NumericFieldKey = 'revenueDkk' | 'energyConsumptionKwh' | 'documentationQualityPercent'

const EMPTY_C12: { franchiseLines: C12Row[] } = {
  franchiseLines: []
}

const ACTIVITY_OPTIONS: Array<{ value: C12ActivityBasis; label: string; description: string }> = [
  {
    value: 'revenue',
    label: 'Omsætning (DKK)',
    description: 'Anvend regnskabsdata eller rapporteret franchiseomsætning.'
  },
  {
    value: 'energy',
    label: 'Energiforbrug (kWh)',
    description: 'Målt eller estimeret kWh-forbrug for franchiserede enheder.'
  }
]

const EMISSION_FACTOR_OPTIONS: Record<C12ActivityBasis, Array<{ value: C12EmissionFactorKey; label: string }>> = ((): Record<
  C12ActivityBasis,
  Array<{ value: C12EmissionFactorKey; label: string }>
> => {
  const bases: C12ActivityBasis[] = ['revenue', 'energy']

  return bases.reduce((acc, basis) => {
    acc[basis] = Object.entries(c12EmissionFactorConfigurations)
      .filter(([, config]) => config.basis === basis)
      .map(([key, config]) => {
        const decimals = config.basis === 'revenue' ? 5 : 3
        const formattedFactor = new Intl.NumberFormat('da-DK', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(config.factor)

        return {
          value: key as C12EmissionFactorKey,
          label: `${config.label} (${formattedFactor} ${config.unit})`
        }
      })

    return acc
  }, {} as Record<C12ActivityBasis, Array<{ value: C12EmissionFactorKey; label: string }>>)
})()

function createDefaultRow(activityBasis: C12ActivityBasis = 'revenue'): C12Row {
  return {
    activityBasis,
    revenueDkk: null,
    energyConsumptionKwh: null,
    emissionFactorKey: defaultC12EmissionFactorKeyByBasis[activityBasis],
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

export function C12Step({ state, onChange }: WizardStepProps): JSX.Element {
  const stored = (state.C12 as { franchiseLines?: C12Row[] } | undefined) ?? EMPTY_C12
  const rows = (stored.franchiseLines ?? []) as C12Row[]

  const preview = useMemo<ModuleResult>(() => {
    const franchiseLines: NonNullable<C12Input['franchiseLines']> = rows.map(
      ({ activityBasis, revenueDkk, energyConsumptionKwh, emissionFactorKey, documentationQualityPercent }) => ({
        activityBasis,
        revenueDkk,
        energyConsumptionKwh,
        emissionFactorKey,
        documentationQualityPercent
      })
    )

    return runC12({ C12: { franchiseLines } as C12Input } as ModuleInput)
  }, [rows])

  const updateRows = (nextRows: C12Row[]) => {
    onChange('C12', {
      franchiseLines: nextRows as unknown as NonNullable<C12Input['franchiseLines']>
    })
  }

  const handleAddRow = () => {
    updateRows([...rows, createDefaultRow()])
  }

  const handleRemoveRow = (index: number) => () => {
    updateRows(rows.filter((_, rowIndex) => rowIndex !== index))
  }

  const handleActivityBasisChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const nextBasis = event.target.value as C12ActivityBasis
    const defaultKey = defaultC12EmissionFactorKeyByBasis[nextBasis]

    updateRows(
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              activityBasis: nextBasis,
              emissionFactorKey: defaultKey,
              revenueDkk: nextBasis === 'revenue' ? row.revenueDkk : null,
              energyConsumptionKwh: nextBasis === 'energy' ? row.energyConsumptionKwh : null
            }
          : row
      )
    )
  }

  const handleEmissionFactorChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const nextKey = event.target.value as C12EmissionFactorKey

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
        <h2>C12 – Franchising og downstream services</h2>
        <p style={{ margin: 0 }}>
          Registrér franchiseomsætning eller energiforbrug for aktiviteter, som virksomheden har kontrol over downstream. Vælg
          basis, anvend branchespecifikke emissionsfaktorer og vedhæft dokumentation for at beregne Scope 3-emissioner fra
          franchiserede enheder.
        </p>
      </header>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Franchiselinjer</h3>
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
              const basis = row.activityBasis ?? 'revenue'
              const factorOptions = EMISSION_FACTOR_OPTIONS[basis]
              return (
                <article
                  key={`c12-row-${index}`}
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
                      <span>Aktivitetsbasis</span>
                      <select
                        value={row.activityBasis ?? 'revenue'}
                        onChange={handleActivityBasisChange(index)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                      >
                        {ACTIVITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <span style={{ color: '#5a6b66', fontSize: '0.8rem' }}>
                        {ACTIVITY_OPTIONS.find((option) => option.value === basis)?.description}
                      </span>
                    </label>

                    {basis === 'revenue' ? (
                      <label style={{ display: 'grid', gap: '0.25rem' }}>
                        <span>Omsætning (DKK)</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="any"
                          value={row.revenueDkk ?? ''}
                          placeholder="fx 12 500 000"
                          onChange={handleNumericFieldChange(index, 'revenueDkk')}
                          style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                        />
                      </label>
                    ) : (
                      <label style={{ display: 'grid', gap: '0.25rem' }}>
                        <span>Energiforbrug (kWh)</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="any"
                          value={row.energyConsumptionKwh ?? ''}
                          placeholder="fx 240 000"
                          onChange={handleNumericFieldChange(index, 'energyConsumptionKwh')}
                          style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #c8d2cf' }}
                        />
                      </label>
                    )}

                    <label style={{ display: 'grid', gap: '0.25rem' }}>
                      <span>Emissionsfaktor</span>
                      <select
                        value={row.emissionFactorKey ?? defaultC12EmissionFactorKeyByBasis[basis]}
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

                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#4f5d59' }}>
                    Omsætning multipliceres med branchefaktorer (kg CO₂e/DKK), og energiforbrug multipliceres med valgte kWh-faktorer.
                  </p>
                </article>
              )
            })}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#555' }}>
            Tilføj mindst én linje for at beregne emissionerne fra franchising og downstream services.
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
