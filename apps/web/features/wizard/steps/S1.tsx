/**
 * Wizardtrin for modul S1 – arbejdsstyrke og headcount.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'

import { runS1, type ModuleInput, type ModuleResult, type S1Input } from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

const EMPTY_S1: S1Input = {
  reportingYear: null,
  totalHeadcount: null,
  dataCoveragePercent: null,
  headcountBreakdown: [],
  workforceNarrative: null
}

type BreakdownRow = NonNullable<S1Input['headcountBreakdown']>[number]

type NumericField = 'totalHeadcount' | 'dataCoveragePercent' | 'reportingYear'

type RowNumericField = 'headcount' | 'femalePercent' | 'collectiveAgreementCoveragePercent'

type RowTextField = 'segment'

const MAX_NARRATIVE = 2000

function createEmptyRow(): BreakdownRow {
  return {
    segment: '',
    headcount: null,
    femalePercent: null,
    collectiveAgreementCoveragePercent: null
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

export function S1Step({ state, onChange }: WizardStepProps): JSX.Element {
  const current = (state.S1 as S1Input | undefined) ?? EMPTY_S1
  const rows = current.headcountBreakdown ?? []

  const preview = useMemo<ModuleResult>(() => runS1({ S1: current } as ModuleInput), [current])

  const updateRoot = (partial: Partial<S1Input>) => {
    onChange('S1', { ...current, ...partial })
  }

  const handleNumericChange = (field: NumericField) => (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseNumber(event.target.value)
    updateRoot({ [field]: parsed } as Partial<S1Input>)
  }

  const handleNarrativeChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value.slice(0, MAX_NARRATIVE)
    updateRoot({ workforceNarrative: text.trim() === '' ? null : text })
  }

  const handleAddRow = () => {
    updateRoot({ headcountBreakdown: [...rows, createEmptyRow()] })
  }

  const handleRemoveRow = (index: number) => () => {
    updateRoot({ headcountBreakdown: rows.filter((_, rowIndex) => rowIndex !== index) })
  }

  const handleRowNumericChange = (index: number, field: RowNumericField) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const parsed = parseNumber(event.target.value)
    const nextRows = rows.map((row, rowIndex) =>
      rowIndex === index
        ? {
            ...row,
            [field]: parsed
          }
        : row
    )
    updateRoot({ headcountBreakdown: nextRows })
  }

  const handleRowTextChange = (index: number, field: RowTextField) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value.slice(0, 120)
    const nextRows = rows.map((row, rowIndex) =>
      rowIndex === index
        ? {
            ...row,
            [field]: value
          }
        : row
    )
    updateRoot({ headcountBreakdown: nextRows })
  }

  const hasRows = rows.length > 0
  const hasInput =
    hasRows ||
    current.totalHeadcount != null ||
    current.dataCoveragePercent != null ||
    (current.workforceNarrative ?? '').length > 0

  return (
    <form className="ds-form ds-stack" noValidate>
      <header className="ds-stack-sm">
        <h2 className="ds-heading-sm">S1 – Arbejdsstyrke &amp; headcount</h2>
        <p className="ds-text-muted">
          Kortlæg arbejdsstyrkens størrelse og segmenter. Indtast kvantitative data og suppler med en kort narrativ kontekst for
          at opfylde ESRS S1.
        </p>
      </header>

      <section className="ds-card ds-stack" aria-label="Overblik over headcount">
        <div className="ds-stack-sm">
          <label className="ds-field">
            <span>Rapporteringsår</span>
            <input
              type="number"
              value={current.reportingYear ?? ''}
              onChange={handleNumericChange('reportingYear')}
              className="ds-input"
              min={1900}
              max={2100}
              placeholder="2024"
            />
          </label>
          <label className="ds-field">
            <span>Total headcount</span>
            <input
              type="number"
              value={current.totalHeadcount ?? ''}
              onChange={handleNumericChange('totalHeadcount')}
              className="ds-input"
              min={0}
              placeholder="520"
            />
          </label>
          <label className="ds-field">
            <span>Datadækning (%)</span>
            <input
              type="number"
              value={current.dataCoveragePercent ?? ''}
              onChange={handleNumericChange('dataCoveragePercent')}
              className="ds-input"
              min={0}
              max={100}
              placeholder="90"
            />
          </label>
        </div>

        <div className="ds-stack">
          <header className="ds-stack-xs">
            <h3 className="ds-heading-xs">Segmenteret headcount</h3>
            <p className="ds-text-subtle">
              Registrér centrale segmenter (lande, funktioner, sites) inkl. kønsfordeling og dækning af kollektive aftaler.
            </p>
            <button type="button" className="ds-button" onClick={handleAddRow}>
              Tilføj segment
            </button>
          </header>

          {hasRows ? (
            <div className="ds-stack" role="group" aria-label="Headcount segmenter">
              {rows.map((row, index) => (
                <div key={index} className="ds-card ds-stack-sm" data-variant="subtle">
                  <div className="ds-stack-sm ds-stack--responsive">
                    <label className="ds-field">
                      <span>Segmentnavn</span>
                      <input
                        value={row.segment ?? ''}
                        onChange={handleRowTextChange(index, 'segment')}
                        className="ds-input"
                        placeholder="Produktion DK"
                      />
                    </label>
                    <label className="ds-field">
                      <span>Headcount</span>
                      <input
                        type="number"
                        value={row.headcount ?? ''}
                        onChange={handleRowNumericChange(index, 'headcount')}
                        className="ds-input"
                        min={0}
                        placeholder="150"
                      />
                    </label>
                    <label className="ds-field">
                      <span>Andel kvinder (%)</span>
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
                      <span>Kollektiv dækning (%)</span>
                      <input
                        type="number"
                        value={row.collectiveAgreementCoveragePercent ?? ''}
                        onChange={handleRowNumericChange(index, 'collectiveAgreementCoveragePercent')}
                        className="ds-input"
                        min={0}
                        max={100}
                        placeholder="80"
                      />
                    </label>
                  </div>

                  <div className="ds-stack-xs">
                    <button type="button" className="ds-button ds-button--ghost" onClick={handleRemoveRow(index)}>
                      Fjern segment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="ds-text-subtle">Ingen segmenter endnu. Tilføj mindst ét for at dokumentere headcount-fordelingen.</p>
          )}
        </div>
      </section>

      <section className="ds-card ds-stack">
        <h3 className="ds-heading-xs">Narrativ kontekst</h3>
        <p className="ds-text-subtle">
          Brug feltet til at beskrive ændringer i arbejdsstyrken, fx vækst, outsourcing eller samarbejde med faglige organisationer.
        </p>
        <textarea
          value={current.workforceNarrative ?? ''}
          onChange={handleNarrativeChange}
          maxLength={MAX_NARRATIVE}
          className="ds-textarea"
          rows={4}
          placeholder="Beskriv fokus på rekruttering, fastholdelse og samarbejde med medarbejderrepræsentanter."
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
