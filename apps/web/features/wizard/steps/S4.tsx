/**
 * Wizardtrin for modul S4 – due diligence og menneskerettigheder.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'

import { runS4, s4SeverityLevelOptions, type ModuleInput, type ModuleResult, type S4Input } from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

const EMPTY_S4: S4Input = {
  processes: [],
  grievanceMechanismInPlace: null,
  escalationTimeframeDays: null,
  dueDiligenceNarrative: null
}

type ProcessRow = NonNullable<S4Input['processes']>[number]

type NumericField = 'escalationTimeframeDays'

type RowNumericField = 'coveragePercent'

type RowTextField = 'area' | 'lastAssessmentDate' | 'remediationPlan'

const MAX_NARRATIVE = 2000

function createEmptyProcess(): ProcessRow {
  return {
    area: '',
    coveragePercent: null,
    lastAssessmentDate: null,
    severityLevel: 'medium',
    remediationPlan: null
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

export function S4Step({ state, onChange }: WizardStepProps): JSX.Element {
  const current = (state.S4 as S4Input | undefined) ?? EMPTY_S4
  const processes = current.processes ?? []

  const preview = useMemo<ModuleResult>(() => runS4({ S4: current } as ModuleInput), [current])

  const updateRoot = (partial: Partial<S4Input>) => {
    onChange('S4', { ...current, ...partial })
  }

  const handleGrievanceChange = (value: boolean | null) => () => {
    updateRoot({ grievanceMechanismInPlace: value })
  }

  const handleNumericChange = (field: NumericField) => (event: ChangeEvent<HTMLInputElement>) => {
    updateRoot({ [field]: parseNumber(event.target.value) } as Partial<S4Input>)
  }

  const handleNarrativeChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value.slice(0, MAX_NARRATIVE)
    updateRoot({ dueDiligenceNarrative: text.trim() === '' ? null : text })
  }

  const handleAddProcess = () => {
    updateRoot({ processes: [...processes, createEmptyProcess()] })
  }

  const handleRemoveProcess = (index: number) => () => {
    updateRoot({ processes: processes.filter((_, rowIndex) => rowIndex !== index) })
  }

  const handleProcessTextChange = (index: number, field: RowTextField) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value.slice(0, field === 'remediationPlan' ? 500 : 160)
    const next = processes.map((process, rowIndex) =>
      rowIndex === index
        ? {
            ...process,
            [field]: value.trim() === '' ? (field === 'area' ? '' : null) : value
          }
        : process
    )
    updateRoot({ processes: next })
  }

  const handleProcessNumericChange = (index: number, field: RowNumericField) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const parsed = parseNumber(event.target.value)
    const next = processes.map((process, rowIndex) =>
      rowIndex === index
        ? {
            ...process,
            [field]: parsed
          }
        : process
    )
    updateRoot({ processes: next })
  }

  const handleProcessSeverityChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as ProcessRow['severityLevel']
    const next = processes.map((process, rowIndex) =>
      rowIndex === index
        ? {
            ...process,
            severityLevel: value
          }
        : process
    )
    updateRoot({ processes: next })
  }

  const hasProcesses = processes.length > 0
  const hasInput =
    hasProcesses ||
    current.grievanceMechanismInPlace != null ||
    current.escalationTimeframeDays != null ||
    (current.dueDiligenceNarrative ?? '').length > 0

  return (
    <form className="ds-form ds-stack" noValidate>
      <header className="ds-stack-sm">
        <h2 className="ds-heading-sm">S4 – Due diligence &amp; menneskerettigheder</h2>
        <p className="ds-text-muted">
          Dokumentér processer for at identificere, forebygge og afhjælpe negative påvirkninger på menneskerettigheder. Inddrag
          klagemekanismer og narrativ opfølgning.
        </p>
      </header>

      <section className="ds-card ds-stack" aria-label="Klagemekanisme">
        <div className="ds-stack-sm ds-stack--responsive">
          <fieldset className="ds-field" style={{ border: 'none', padding: 0 }}>
            <legend>Klage- og whistleblower-mekanisme</legend>
            <div className="ds-stack-xs ds-stack--horizontal">
              <button
                type="button"
                className="ds-button"
                data-variant={current.grievanceMechanismInPlace === true ? 'primary' : 'ghost'}
                onClick={handleGrievanceChange(true)}
              >
                Etableret
              </button>
              <button
                type="button"
                className="ds-button"
                data-variant={current.grievanceMechanismInPlace === false ? 'primary' : 'ghost'}
                onClick={handleGrievanceChange(false)}
              >
                Mangler
              </button>
              <button
                type="button"
                className="ds-button"
                data-variant={current.grievanceMechanismInPlace == null ? 'primary' : 'ghost'}
                onClick={handleGrievanceChange(null)}
              >
                Ikke angivet
              </button>
            </div>
          </fieldset>

          <label className="ds-field">
            <span>Escalationstid (dage)</span>
            <input
              type="number"
              value={current.escalationTimeframeDays ?? ''}
              onChange={handleNumericChange('escalationTimeframeDays')}
              className="ds-input"
              min={0}
              placeholder="21"
            />
          </label>
        </div>
      </section>

      <section className="ds-card ds-stack" aria-label="Due diligence-processer">
        <header className="ds-stack-xs">
          <h3 className="ds-heading-xs">Kortlægning af processer</h3>
          <p className="ds-text-subtle">
            Registrér områder, dækning og risikoniveau. Tilføj remediationsplaner for højrisiko-områder.
          </p>
          <button type="button" className="ds-button" onClick={handleAddProcess}>
            Tilføj proces
          </button>
        </header>

        {hasProcesses ? (
          <div className="ds-stack" role="group" aria-label="Due diligence rækker">
            {processes.map((process, index) => (
              <div key={index} className="ds-card ds-stack-sm" data-variant="subtle">
                <div className="ds-stack-sm ds-stack--responsive">
                  <label className="ds-field">
                    <span>Procesområde</span>
                    <input
                      value={process.area ?? ''}
                      onChange={handleProcessTextChange(index, 'area')}
                      className="ds-input"
                      placeholder="Leverandører, HR, investeringer..."
                    />
                  </label>
                  <label className="ds-field">
                    <span>Dækning (%)</span>
                    <input
                      type="number"
                      value={process.coveragePercent ?? ''}
                      onChange={handleProcessNumericChange(index, 'coveragePercent')}
                      className="ds-input"
                      min={0}
                      max={100}
                      placeholder="75"
                    />
                  </label>
                  <label className="ds-field">
                    <span>Seneste vurdering</span>
                    <input
                      value={process.lastAssessmentDate ?? ''}
                      onChange={handleProcessTextChange(index, 'lastAssessmentDate')}
                      className="ds-input"
                      placeholder="2024-Q1"
                    />
                  </label>
                  <label className="ds-field">
                    <span>Risikoniveau</span>
                    <select
                      value={process.severityLevel ?? 'medium'}
                      onChange={handleProcessSeverityChange(index)}
                      className="ds-input"
                    >
                      {s4SeverityLevelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option === 'high' ? 'Høj' : option === 'medium' ? 'Medium' : 'Lav'}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="ds-field">
                  <span>Remediationsplan</span>
                  <input
                    value={process.remediationPlan ?? ''}
                    onChange={handleProcessTextChange(index, 'remediationPlan')}
                    className="ds-input"
                    placeholder="Fx auditprogram, træning, leverandørkapacitetsopbygning"
                  />
                </label>

                <div className="ds-stack-xs">
                  <button type="button" className="ds-button ds-button--ghost" onClick={handleRemoveProcess(index)}>
                    Fjern proces
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="ds-text-subtle">Ingen processer registreret endnu. Tilføj mindst ét område for at beskrive due diligence.</p>
        )}
      </section>

      <section className="ds-card ds-stack">
        <h3 className="ds-heading-xs">Narrativ due diligence</h3>
        <p className="ds-text-subtle">
          Opsummer governance, eskalationsveje og samarbejde med interessenter. Feltet bruges direkte i rapportens narrative
          disclosures.
        </p>
        <textarea
          value={current.dueDiligenceNarrative ?? ''}
          onChange={handleNarrativeChange}
          maxLength={MAX_NARRATIVE}
          className="ds-textarea"
          rows={4}
          placeholder="Fx: Årlige risikovurderinger af leverandører, fokus på højrisiko-lande og partnerskaber med NGO’er."
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
