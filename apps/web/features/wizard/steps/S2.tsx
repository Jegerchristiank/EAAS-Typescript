/**
 * Wizardtrin for modul S2 – diversitet, ligestilling og inklusion.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'

import { runS2, type ModuleInput, type ModuleResult, type S2Input } from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

const EMPTY_S2: S2Input = {
  genderBalance: [],
  dataCoveragePercent: null,
  equalityPolicyInPlace: null,
  inclusionInitiativesNarrative: null
}

type DiversityRow = NonNullable<S2Input['genderBalance']>[number]

type NumericField = 'dataCoveragePercent'

type RowNumericField = 'femalePercent' | 'malePercent' | 'otherPercent' | 'payGapPercent'

type RowTextField = 'level'

const MAX_INITIATIVE_TEXT = 2000

function createEmptyRow(): DiversityRow {
  return {
    level: '',
    femalePercent: null,
    malePercent: null,
    otherPercent: null,
    payGapPercent: null,
    targetNarrative: null
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

export function S2Step({ state, onChange }: WizardStepProps): JSX.Element {
  const current = (state.S2 as S2Input | undefined) ?? EMPTY_S2
  const rows = current.genderBalance ?? []

  const preview = useMemo<ModuleResult>(() => runS2({ S2: current } as ModuleInput), [current])

  const updateRoot = (partial: Partial<S2Input>) => {
    onChange('S2', { ...current, ...partial })
  }

  const handleCoverageChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateRoot({ dataCoveragePercent: parseNumber(event.target.value) })
  }

  const handlePolicyChange = (value: boolean | null) => () => {
    updateRoot({ equalityPolicyInPlace: value })
  }

  const handleNarrativeChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value.slice(0, MAX_INITIATIVE_TEXT)
    updateRoot({ inclusionInitiativesNarrative: text.trim() === '' ? null : text })
  }

  const handleAddRow = () => {
    updateRoot({ genderBalance: [...rows, createEmptyRow()] })
  }

  const handleRemoveRow = (index: number) => () => {
    updateRoot({ genderBalance: rows.filter((_, rowIndex) => rowIndex !== index) })
  }

  const handleRowTextChange = (index: number, field: RowTextField) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const next = rows.map((row, rowIndex) =>
      rowIndex === index
        ? {
            ...row,
            [field]: event.target.value.slice(0, 120)
          }
        : row
    )
    updateRoot({ genderBalance: next })
  }

  const handleRowNumericChange = (index: number, field: RowNumericField) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const parsed = parseNumber(event.target.value)
    const next = rows.map((row, rowIndex) =>
      rowIndex === index
        ? {
            ...row,
            [field]: parsed
          }
        : row
    )
    updateRoot({ genderBalance: next })
  }

  const handleRowNarrativeChange = (index: number) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value.slice(0, 500)
    const next = rows.map((row, rowIndex) =>
      rowIndex === index
        ? {
            ...row,
            targetNarrative: value.trim() === '' ? null : value
          }
        : row
    )
    updateRoot({ genderBalance: next })
  }

  const hasRows = rows.length > 0
  const hasInput =
    hasRows ||
    current.dataCoveragePercent != null ||
    current.equalityPolicyInPlace != null ||
    (current.inclusionInitiativesNarrative ?? '').length > 0

  return (
    <form className="ds-form ds-stack" noValidate>
      <header className="ds-stack-sm">
        <h2 className="ds-heading-sm">S2 – Diversitet og ligestilling</h2>
        <p className="ds-text-muted">
          Indtast kønsfordeling for centrale ledelsesniveauer samt løngab og initiativer. Modulet beregner automatisk score og
          flagger ubalancer.
        </p>
      </header>

      <section className="ds-card ds-stack" aria-label="Diversitetsdata">
        <div className="ds-stack-sm ds-stack--responsive">
          <label className="ds-field">
            <span>Datadækning (%)</span>
            <input
              type="number"
              value={current.dataCoveragePercent ?? ''}
              onChange={handleCoverageChange}
              className="ds-input"
              min={0}
              max={100}
              placeholder="95"
            />
          </label>

          <fieldset className="ds-field" style={{ border: 'none', padding: 0 }}>
            <legend>Formel ligestillingspolitik</legend>
            <div className="ds-stack-xs ds-stack--horizontal">
              <button
                type="button"
                className="ds-button"
                data-variant={current.equalityPolicyInPlace === true ? 'primary' : 'ghost'}
                onClick={handlePolicyChange(true)}
              >
                Ja
              </button>
              <button
                type="button"
                className="ds-button"
                data-variant={current.equalityPolicyInPlace === false ? 'primary' : 'ghost'}
                onClick={handlePolicyChange(false)}
              >
                Nej
              </button>
              <button
                type="button"
                className="ds-button"
                data-variant={current.equalityPolicyInPlace == null ? 'primary' : 'ghost'}
                onClick={handlePolicyChange(null)}
              >
                Ikke angivet
              </button>
            </div>
          </fieldset>
        </div>

        <div className="ds-stack">
          <header className="ds-stack-xs">
            <h3 className="ds-heading-xs">Kønsfordeling pr. niveau</h3>
            <p className="ds-text-subtle">
              Registrér de vigtigste niveauer fra bestyrelse til samlet medarbejdergruppe. Tilføj løngab og narrative noter for
              tiltag.
            </p>
            <button type="button" className="ds-button" onClick={handleAddRow}>
              Tilføj niveau
            </button>
          </header>

          {hasRows ? (
            <div className="ds-stack" role="group" aria-label="Ligestillingsdata">
              {rows.map((row, index) => (
                <div key={index} className="ds-card ds-stack-sm" data-variant="subtle">
                  <div className="ds-stack-sm ds-stack--responsive">
                    <label className="ds-field">
                      <span>Niveau</span>
                      <input
                        value={row.level ?? ''}
                        onChange={handleRowTextChange(index, 'level')}
                        className="ds-input"
                        placeholder="Ledelse"
                      />
                    </label>
                    <label className="ds-field">
                      <span>Kvinder (%)</span>
                      <input
                        type="number"
                        value={row.femalePercent ?? ''}
                        onChange={handleRowNumericChange(index, 'femalePercent')}
                        className="ds-input"
                        min={0}
                        max={100}
                        placeholder="45"
                      />
                    </label>
                    <label className="ds-field">
                      <span>Mænd (%)</span>
                      <input
                        type="number"
                        value={row.malePercent ?? ''}
                        onChange={handleRowNumericChange(index, 'malePercent')}
                        className="ds-input"
                        min={0}
                        max={100}
                        placeholder="55"
                      />
                    </label>
                    <label className="ds-field">
                      <span>Øvrige (%)</span>
                      <input
                        type="number"
                        value={row.otherPercent ?? ''}
                        onChange={handleRowNumericChange(index, 'otherPercent')}
                        className="ds-input"
                        min={0}
                        max={100}
                        placeholder="0"
                      />
                    </label>
                    <label className="ds-field">
                      <span>Løngab (%)</span>
                      <input
                        type="number"
                        value={row.payGapPercent ?? ''}
                        onChange={handleRowNumericChange(index, 'payGapPercent')}
                        className="ds-input"
                        min={-100}
                        max={100}
                        placeholder="2"
                      />
                    </label>
                  </div>

                  <label className="ds-field">
                    <span>Indsatser/targets</span>
                    <input
                      value={row.targetNarrative ?? ''}
                      onChange={handleRowNarrativeChange(index)}
                      className="ds-input"
                      placeholder="Mentorprogram, mål om 45% kvinder i 2026"
                    />
                  </label>

                  <div className="ds-stack-xs">
                    <button type="button" className="ds-button ds-button--ghost" onClick={handleRemoveRow(index)}>
                      Fjern niveau
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="ds-text-subtle">Ingen niveauer tilføjet endnu. Tilføj mindst ét for at beregne ligestillingsscore.</p>
          )}
        </div>
      </section>

      <section className="ds-card ds-stack">
        <h3 className="ds-heading-xs">Narrativ beskrivelse</h3>
        <p className="ds-text-subtle">
          Beskriv konkrete indsatser, pipeline-tiltag eller barrierer for ligestilling. Brug feltet til at dokumentere ESRS S1-krav
          om politikker og handlinger.
        </p>
        <textarea
          value={current.inclusionInitiativesNarrative ?? ''}
          onChange={handleNarrativeChange}
          maxLength={MAX_INITIATIVE_TEXT}
          className="ds-textarea"
          rows={4}
          placeholder="Eksempel: Udvidet barselsordning, anonym rekruttering og KPI’er for ligestilling i ledelsen."
        />
      </section>

      {hasInput && (
        <aside className="ds-card ds-stack-sm" aria-live="polite">
          <h3 className="ds-heading-xs">Forhåndsresultat</h3>
          <p className="ds-text-strong">
            {preview.value} {preview.unit}
          </p>
          <ul className="ds-stack-xs">
            {preview.warnings.length === 0 ? (
              <li className="ds-text-subtle">Ingen advarsler registreret.</li>
            ) : (
              preview.warnings.map((warning, index) => <li key={index}>{warning}</li>)
            )}
          </ul>
        </aside>
      )}
    </form>
  )
}
