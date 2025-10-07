/**
 * Wizardtrin for modul S2 – værdikædearbejdere og arbejdsforhold.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'

import {
  incidentSeverityLevelOptions,
  remediationStatusOptions,
  runS2,
  s2IssueTypeOptions,
  type ModuleInput,
  type ModuleResult,
  type S2Input
} from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

const EMPTY_S2: S2Input = {
  valueChainWorkersCount: null,
  workersAtRiskCount: null,
  valueChainCoveragePercent: null,
  highRiskSupplierSharePercent: null,
  livingWageCoveragePercent: null,
  collectiveBargainingCoveragePercent: null,
  socialAuditsCompletedPercent: null,
  grievancesOpenCount: null,
  grievanceMechanismForWorkers: null,
  incidents: [],
  socialDialogueNarrative: null,
  remediationNarrative: null
}

type IncidentRow = NonNullable<S2Input['incidents']>[number]

type NumericField =
  | 'valueChainWorkersCount'
  | 'workersAtRiskCount'
  | 'valueChainCoveragePercent'
  | 'highRiskSupplierSharePercent'
  | 'livingWageCoveragePercent'
  | 'collectiveBargainingCoveragePercent'
  | 'socialAuditsCompletedPercent'
  | 'grievancesOpenCount'

const MAX_NARRATIVE_LENGTH = 2000

function createEmptyIncident(): IncidentRow {
  return {
    supplier: '',
    country: '',
    issueType: null,
    workersAffected: null,
    severityLevel: 'medium',
    remediationStatus: null,
    description: null
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
  const incidents = current.incidents ?? []

  const preview = useMemo<ModuleResult>(() => runS2({ S2: current } as ModuleInput), [current])

  const updateRoot = (partial: Partial<S2Input>) => {
    onChange('S2', { ...current, ...partial })
  }

  const handleNumericChange = (field: NumericField) => (event: ChangeEvent<HTMLInputElement>) => {
    updateRoot({ [field]: parseNumber(event.target.value) } as Partial<S2Input>)
  }

  const handleMechanismChange = (value: boolean | null) => () => {
    updateRoot({ grievanceMechanismForWorkers: value })
  }

  const handleNarrativeChange = (field: 'socialDialogueNarrative' | 'remediationNarrative') => (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const text = event.target.value.slice(0, MAX_NARRATIVE_LENGTH)
    updateRoot({ [field]: text.trim() === '' ? null : text } as Partial<S2Input>)
  }

  const handleAddIncident = () => {
    updateRoot({ incidents: [...incidents, createEmptyIncident()] })
  }

  const handleRemoveIncident = (index: number) => () => {
    updateRoot({ incidents: incidents.filter((_, rowIndex) => rowIndex !== index) })
  }

  const handleIncidentTextChange = (index: number, field: 'supplier' | 'country') => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const limit = field === 'supplier' ? 160 : 120
    const value = event.target.value.slice(0, limit)
    const next = incidents.map((incident, rowIndex) =>
      rowIndex === index
        ? {
            ...incident,
            [field]: value.trim() === '' ? '' : value
          }
        : incident
    )
    updateRoot({ incidents: next })
  }

  const handleIncidentNumericChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseNumber(event.target.value)
    const next = incidents.map((incident, rowIndex) =>
      rowIndex === index
        ? {
            ...incident,
            workersAffected: parsed
          }
        : incident
    )
    updateRoot({ incidents: next })
  }

  const handleIncidentSelectChange = (index: number, field: 'issueType' | 'severityLevel' | 'remediationStatus') => (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value
    const next = incidents.map((incident, rowIndex) =>
      rowIndex === index
        ? {
            ...incident,
            [field]: value === '' ? null : (value as IncidentRow[typeof field])
          }
        : incident
    )
    updateRoot({ incidents: next })
  }

  const handleIncidentDescriptionChange = (index: number) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value.slice(0, 500)
    const next = incidents.map((incident, rowIndex) =>
      rowIndex === index
        ? {
            ...incident,
            description: text.trim() === '' ? null : text
          }
        : incident
    )
    updateRoot({ incidents: next })
  }

  const hasIncidents = incidents.length > 0
  const hasInput =
    hasIncidents ||
    current.valueChainWorkersCount != null ||
    current.valueChainCoveragePercent != null ||
    current.grievanceMechanismForWorkers != null ||
    (current.socialDialogueNarrative ?? '').length > 0 ||
    (current.remediationNarrative ?? '').length > 0

  return (
    <form className="ds-form ds-stack" noValidate>
      <header className="ds-stack-sm">
        <h2 className="ds-heading-sm">S2 – Værdikædearbejdere</h2>
        <p className="ds-text-muted">
          Kortlæg antal arbejdstagere i værdikæden, dækning af sociale audits og klagemekanismer. Registrér alvorlige hændelser,
          så ESRS S2-kravene kan dokumenteres og følges op.
        </p>
      </header>

      <section className="ds-card ds-stack" aria-label="Nøgletal for værdikædearbejdere">
        <div className="ds-stack-sm ds-stack--responsive">
          <label className="ds-field">
            <span>Arbejdstagere i værdikæden</span>
            <input
              type="number"
              value={current.valueChainWorkersCount ?? ''}
              onChange={handleNumericChange('valueChainWorkersCount')}
              className="ds-input"
              min={0}
              placeholder="2500"
            />
          </label>
          <label className="ds-field">
            <span>Særligt udsatte arbejdstagere</span>
            <input
              type="number"
              value={current.workersAtRiskCount ?? ''}
              onChange={handleNumericChange('workersAtRiskCount')}
              className="ds-input"
              min={0}
              placeholder="120"
            />
          </label>
          <label className="ds-field">
            <span>Risikodækning (%)</span>
            <input
              type="number"
              value={current.valueChainCoveragePercent ?? ''}
              onChange={handleNumericChange('valueChainCoveragePercent')}
              className="ds-input"
              min={0}
              max={100}
              placeholder="75"
            />
          </label>
          <label className="ds-field">
            <span>Højrisiko-leverandører (%)</span>
            <input
              type="number"
              value={current.highRiskSupplierSharePercent ?? ''}
              onChange={handleNumericChange('highRiskSupplierSharePercent')}
              className="ds-input"
              min={0}
              max={100}
              placeholder="18"
            />
          </label>
        </div>

        <div className="ds-stack-sm ds-stack--responsive">
          <label className="ds-field">
            <span>Dækning med leve-/mindsteløn (%)</span>
            <input
              type="number"
              value={current.livingWageCoveragePercent ?? ''}
              onChange={handleNumericChange('livingWageCoveragePercent')}
              className="ds-input"
              min={0}
              max={100}
              placeholder="82"
            />
          </label>
          <label className="ds-field">
            <span>Kollektive aftaler (%)</span>
            <input
              type="number"
              value={current.collectiveBargainingCoveragePercent ?? ''}
              onChange={handleNumericChange('collectiveBargainingCoveragePercent')}
              className="ds-input"
              min={0}
              max={100}
              placeholder="55"
            />
          </label>
          <label className="ds-field">
            <span>Sociale audits gennemført (%)</span>
            <input
              type="number"
              value={current.socialAuditsCompletedPercent ?? ''}
              onChange={handleNumericChange('socialAuditsCompletedPercent')}
              className="ds-input"
              min={0}
              max={100}
              placeholder="90"
            />
          </label>
          <label className="ds-field">
            <span>Åbne klager</span>
            <input
              type="number"
              value={current.grievancesOpenCount ?? ''}
              onChange={handleNumericChange('grievancesOpenCount')}
              className="ds-input"
              min={0}
              placeholder="2"
            />
          </label>
        </div>

        <fieldset className="ds-field" style={{ border: 'none', padding: 0 }}>
          <legend>Klagemekanisme for leverandørarbejdere</legend>
          <div className="ds-stack-xs ds-stack--horizontal">
            <button
              type="button"
              className="ds-button"
              data-variant={current.grievanceMechanismForWorkers === true ? 'primary' : 'ghost'}
              onClick={handleMechanismChange(true)}
            >
              Etableret
            </button>
            <button
              type="button"
              className="ds-button"
              data-variant={current.grievanceMechanismForWorkers === false ? 'primary' : 'ghost'}
              onClick={handleMechanismChange(false)}
            >
              Mangler
            </button>
            <button
              type="button"
              className="ds-button"
              data-variant={current.grievanceMechanismForWorkers == null ? 'primary' : 'ghost'}
              onClick={handleMechanismChange(null)}
            >
              Ikke angivet
            </button>
          </div>
        </fieldset>
      </section>

      <section className="ds-card ds-stack" aria-label="Registrerede hændelser">
        <header className="ds-stack-xs">
          <h3 className="ds-heading-xs">Alvorlige hændelser i værdikæden</h3>
          <p className="ds-text-subtle">
            Registrér leverandører eller sites med identificerede påvirkninger. Tilføj antal berørte arbejdstagere, alvorlighed
            og status for remediering.
          </p>
          <button type="button" className="ds-button" onClick={handleAddIncident}>
            Tilføj hændelse
          </button>
        </header>

        {hasIncidents ? (
          <div className="ds-stack" role="group" aria-label="Hændelsesliste">
            {incidents.map((incident, index) => (
              <div key={index} className="ds-card ds-stack-sm" data-variant="subtle">
                <div className="ds-stack-sm ds-stack--responsive">
                  <label className="ds-field">
                    <span>Leverandør/site</span>
                    <input
                      value={incident.supplier ?? ''}
                      onChange={handleIncidentTextChange(index, 'supplier')}
                      className="ds-input"
                      placeholder="Fx ABC Textiles"
                    />
                  </label>
                  <label className="ds-field">
                    <span>Land/område</span>
                    <input
                      value={incident.country ?? ''}
                      onChange={handleIncidentTextChange(index, 'country')}
                      className="ds-input"
                      placeholder="Bangladesh"
                    />
                  </label>
                  <label className="ds-field">
                    <span>Hændelsestype</span>
                    <select
                      className="ds-input"
                      value={incident.issueType ?? ''}
                      onChange={handleIncidentSelectChange(index, 'issueType')}
                    >
                      <option value="">Vælg</option>
                      {s2IssueTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {translateIssueType(option)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="ds-field">
                    <span>Berørte arbejdstagere</span>
                    <input
                      type="number"
                      value={incident.workersAffected ?? ''}
                      onChange={handleIncidentNumericChange(index)}
                      className="ds-input"
                      min={0}
                      placeholder="45"
                    />
                  </label>
                  <label className="ds-field">
                    <span>Alvorlighed</span>
                    <select
                      className="ds-input"
                      value={incident.severityLevel ?? ''}
                      onChange={handleIncidentSelectChange(index, 'severityLevel')}
                    >
                      <option value="">Vælg</option>
                      {incidentSeverityLevelOptions.map((option) => (
                        <option key={option} value={option}>
                          {translateSeverity(option)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="ds-field">
                    <span>Remediering</span>
                    <select
                      className="ds-input"
                      value={incident.remediationStatus ?? ''}
                      onChange={handleIncidentSelectChange(index, 'remediationStatus')}
                    >
                      <option value="">Vælg</option>
                      {remediationStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {translateRemediation(option)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="ds-field">
                  <span>Beskrivelse</span>
                  <textarea
                    value={incident.description ?? ''}
                    onChange={handleIncidentDescriptionChange(index)}
                    className="ds-textarea"
                    rows={3}
                    maxLength={500}
                    placeholder="Kort beskrivelse af fund og aftalte handlinger"
                  />
                </label>

                <div className="ds-stack-xs ds-stack--horizontal ds-justify-end">
                  <button type="button" className="ds-button" data-variant="danger" onClick={handleRemoveIncident(index)}>
                    Fjern
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="ds-text-subtle">Ingen hændelser registreret endnu.</p>
        )}
      </section>

      <section className="ds-card ds-stack" aria-label="Narrativer">
        <label className="ds-field">
          <span>Dialog og træning af leverandørarbejdere</span>
          <textarea
            value={current.socialDialogueNarrative ?? ''}
            onChange={handleNarrativeChange('socialDialogueNarrative')}
            className="ds-textarea"
            rows={4}
            maxLength={MAX_NARRATIVE_LENGTH}
            placeholder="Beskriv engagement, træningsprogrammer og samarbejde med fagforeninger."
          />
        </label>
        <label className="ds-field">
          <span>Afhjælpning og kompensation</span>
          <textarea
            value={current.remediationNarrative ?? ''}
            onChange={handleNarrativeChange('remediationNarrative')}
            className="ds-textarea"
            rows={4}
            maxLength={MAX_NARRATIVE_LENGTH}
            placeholder="Opsummer planer for kompensation, forbedringer og opfølgning med leverandører."
          />
        </label>
      </section>

      <section className="ds-summary ds-stack-sm">
        <h3 className="ds-heading-sm">Status</h3>
        {hasInput ? (
          <div className="ds-stack-sm">
            <p className="ds-value">
              {preview.value} {preview.unit}
            </p>
            <div className="ds-stack-sm">
              <strong>Antagelser</strong>
              <ul>
                {preview.assumptions.map((assumption, index) => (
                  <li key={index}>{assumption}</li>
                ))}
              </ul>
            </div>
            {preview.warnings.length > 0 && (
              <div className="ds-stack-sm">
                <strong>Advarsler</strong>
                <ul>
                  {preview.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            <details className="ds-summary">
              <summary>Teknisk trace</summary>
              <ul>
                {preview.trace.map((line, index) => (
                  <li key={index} className="ds-code">
                    {line}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        ) : (
          <p className="ds-text-muted">Udfyld felterne for at se beregnet social score og advarsler.</p>
        )}
      </section>
    </form>
  )
}

function translateIssueType(value: string): string {
  switch (value) {
    case 'healthAndSafety':
      return 'Sundhed og sikkerhed'
    case 'wagesAndBenefits':
      return 'Løn og benefits'
    case 'workingTime':
      return 'Arbejdstid'
    case 'freedomOfAssociation':
      return 'Organisationsfrihed'
    case 'childLabour':
      return 'Børnearbejde'
    case 'forcedLabour':
      return 'Tvangsarbejde'
    case 'discrimination':
      return 'Diskrimination'
    default:
      return 'Andet'
  }
}

function translateSeverity(value: string): string {
  switch (value) {
    case 'high':
      return 'Høj'
    case 'medium':
      return 'Middel'
    case 'low':
    default:
      return 'Lav'
  }
}

function translateRemediation(value: string): string {
  switch (value) {
    case 'completed':
      return 'Afsluttet'
    case 'inProgress':
      return 'I gang'
    case 'notStarted':
    default:
      return 'Ikke startet'
  }
}
