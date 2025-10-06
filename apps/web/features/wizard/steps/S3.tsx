/**
 * Wizardtrin for modul S3 – arbejdsmiljø og hændelser.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'

import {
  runS3,
  s3IncidentTypeOptions,
  type ModuleInput,
  type ModuleResult,
  type S3Input
} from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

const EMPTY_S3: S3Input = {
  incidents: [],
  totalHoursWorked: null,
  safetyCertification: null,
  safetyNarrative: null
}

type IncidentRow = NonNullable<S3Input['incidents']>[number]

type NumericField = 'totalHoursWorked'

type RowNumericField = 'count' | 'ratePerMillionHours'

const MAX_SAFETY_TEXT = 2000

function createEmptyIncident(): IncidentRow {
  return {
    incidentType: 'recordable',
    count: null,
    ratePerMillionHours: null,
    description: null,
    rootCauseClosed: null
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

export function S3Step({ state, onChange }: WizardStepProps): JSX.Element {
  const current = (state.S3 as S3Input | undefined) ?? EMPTY_S3
  const incidents = current.incidents ?? []

  const preview = useMemo<ModuleResult>(() => runS3({ S3: current } as ModuleInput), [current])

  const updateRoot = (partial: Partial<S3Input>) => {
    onChange('S3', { ...current, ...partial })
  }

  const handleNumericChange = (field: NumericField) => (event: ChangeEvent<HTMLInputElement>) => {
    updateRoot({ [field]: parseNumber(event.target.value) } as Partial<S3Input>)
  }

  const handleCertificationChange = (value: boolean | null) => () => {
    updateRoot({ safetyCertification: value })
  }

  const handleNarrativeChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value.slice(0, MAX_SAFETY_TEXT)
    updateRoot({ safetyNarrative: text.trim() === '' ? null : text })
  }

  const handleAddIncident = () => {
    updateRoot({ incidents: [...incidents, createEmptyIncident()] })
  }

  const handleRemoveIncident = (index: number) => () => {
    updateRoot({ incidents: incidents.filter((_, rowIndex) => rowIndex !== index) })
  }

  const handleIncidentTypeChange = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as IncidentRow['incidentType']
    const next = incidents.map((incident, rowIndex) =>
      rowIndex === index
        ? {
            ...incident,
            incidentType: value
          }
        : incident
    )
    updateRoot({ incidents: next })
  }

  const handleIncidentNumericChange = (index: number, field: RowNumericField) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const parsed = parseNumber(event.target.value)
    const next = incidents.map((incident, rowIndex) =>
      rowIndex === index
        ? {
            ...incident,
            [field]: parsed
          }
        : incident
    )
    updateRoot({ incidents: next })
  }

  const handleIncidentDescriptionChange = (index: number) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value.slice(0, 240)
    const next = incidents.map((incident, rowIndex) =>
      rowIndex === index
        ? {
            ...incident,
            description: value.trim() === '' ? null : value
          }
        : incident
    )
    updateRoot({ incidents: next })
  }

  const handleIncidentRootCauseChange = (index: number) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked
    const next = incidents.map((incident, rowIndex) =>
      rowIndex === index
        ? {
            ...incident,
            rootCauseClosed: checked
          }
        : incident
    )
    updateRoot({ incidents: next })
  }

  const hasIncidents = incidents.length > 0
  const hasInput =
    hasIncidents ||
    current.totalHoursWorked != null ||
    current.safetyCertification != null ||
    (current.safetyNarrative ?? '').length > 0

  return (
    <form className="ds-form ds-stack" noValidate>
      <header className="ds-stack-sm">
        <h2 className="ds-heading-sm">S3 – Arbejdsmiljø og hændelser</h2>
        <p className="ds-text-muted">
          Registrér arbejdsmiljøhændelser, arbejdstimer og certificering for at dokumentere ESRS S1/S3 nøgletal og narrativer.
        </p>
      </header>

      <section className="ds-card ds-stack" aria-label="Arbejdstimer og certificering">
        <div className="ds-stack-sm ds-stack--responsive">
          <label className="ds-field">
            <span>Total arbejdstimer</span>
            <input
              type="number"
              value={current.totalHoursWorked ?? ''}
              onChange={handleNumericChange('totalHoursWorked')}
              className="ds-input"
              min={0}
              placeholder="2000000"
            />
          </label>

          <fieldset className="ds-field" style={{ border: 'none', padding: 0 }}>
            <legend>Arbejdsmiljøcertificering</legend>
            <div className="ds-stack-xs ds-stack--horizontal">
              <button
                type="button"
                className="ds-button"
                data-variant={current.safetyCertification === true ? 'primary' : 'ghost'}
                onClick={handleCertificationChange(true)}
              >
                Ja (ISO 45001)
              </button>
              <button
                type="button"
                className="ds-button"
                data-variant={current.safetyCertification === false ? 'primary' : 'ghost'}
                onClick={handleCertificationChange(false)}
              >
                Nej
              </button>
              <button
                type="button"
                className="ds-button"
                data-variant={current.safetyCertification == null ? 'primary' : 'ghost'}
                onClick={handleCertificationChange(null)}
              >
                Ikke angivet
              </button>
            </div>
          </fieldset>
        </div>
      </section>

      <section className="ds-card ds-stack" aria-label="Hændelser">
        <header className="ds-stack-xs">
          <h3 className="ds-heading-xs">Registrerede hændelser</h3>
          <p className="ds-text-subtle">
            Angiv type, antal og evt. rate pr. million timer. Markér også om rodårsagsanalyser er afsluttet.
          </p>
          <button type="button" className="ds-button" onClick={handleAddIncident}>
            Tilføj hændelse
          </button>
        </header>

        {hasIncidents ? (
          <div className="ds-stack" role="group" aria-label="Hændelsesrækker">
            {incidents.map((incident, index) => (
              <div key={index} className="ds-card ds-stack-sm" data-variant="subtle">
                <div className="ds-stack-sm ds-stack--responsive">
                  <label className="ds-field">
                    <span>Type</span>
                    <select
                      value={incident.incidentType}
                      onChange={handleIncidentTypeChange(index)}
                      className="ds-input"
                    >
                      {s3IncidentTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option === 'fatality'
                            ? 'Fatalitet'
                            : option === 'lostTime'
                            ? 'Lost time'
                            : option === 'recordable'
                            ? 'Registrerbar'
                            : 'Near miss'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="ds-field">
                    <span>Antal</span>
                    <input
                      type="number"
                      value={incident.count ?? ''}
                      onChange={handleIncidentNumericChange(index, 'count')}
                      className="ds-input"
                      min={0}
                      placeholder="1"
                    />
                  </label>
                  <label className="ds-field">
                    <span>Rate pr. mio. timer</span>
                    <input
                      type="number"
                      value={incident.ratePerMillionHours ?? ''}
                      onChange={handleIncidentNumericChange(index, 'ratePerMillionHours')}
                      className="ds-input"
                      min={0}
                      step="any"
                      placeholder="0.5"
                    />
                  </label>
                </div>

                <label className="ds-field">
                  <span>Beskrivelse</span>
                  <input
                    value={incident.description ?? ''}
                    onChange={handleIncidentDescriptionChange(index)}
                    className="ds-input"
                    placeholder="Kort note – fx lokation eller aktivitet"
                  />
                </label>

                <label className="ds-field ds-field--checkbox">
                  <input
                    type="checkbox"
                    checked={incident.rootCauseClosed ?? false}
                    onChange={handleIncidentRootCauseChange(index)}
                  />
                  <span>Rodårsagsanalyser afsluttet</span>
                </label>

                <div className="ds-stack-xs">
                  <button type="button" className="ds-button ds-button--ghost" onClick={handleRemoveIncident(index)}>
                    Fjern hændelse
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="ds-text-subtle">Ingen hændelser registreret endnu. Tilføj rækker for at dokumentere arbejdsmiljøindsatsen.</p>
        )}
      </section>

      <section className="ds-card ds-stack">
        <h3 className="ds-heading-xs">Narrativ opfølgning</h3>
        <p className="ds-text-subtle">
          Beskriv læring, forebyggende tiltag eller planlagte audits. Feltet bruges til ESRS-kravet om narrative disclosures.
        </p>
        <textarea
          value={current.safetyNarrative ?? ''}
          onChange={handleNarrativeChange}
          maxLength={MAX_SAFETY_TEXT}
          className="ds-textarea"
          rows={4}
          placeholder="Fx: Implementeret sikkerhedskampagne, tæt opfølgning på near misses og månedlige toolbox talks."
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
