/**
 * Wizardtrin for modul D1 – metode og governance.
 */
'use client'

import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import type { D1Input, ModuleInput, ModuleResult } from '@org/shared'
import { runD1 } from '@org/shared'
import type { WizardStepProps } from './StepTemplate'

const EMPTY_D1: D1Input = {
  organizationalBoundary: null,
  scope2Method: null,
  scope3ScreeningCompleted: null,
  dataQuality: null,
  materialityAssessmentDescription: null,
  strategyDescription: null
}

const boundaryOptions: Array<{
  value: NonNullable<D1Input['organizationalBoundary']>
  label: string
  description: string
}> = [
  {
    value: 'equityShare',
    label: 'Equity share',
    description: 'Rapporterer efter ejerandel – relevant når joint ventures udgør hovedparten.'
  },
  {
    value: 'financialControl',
    label: 'Financial control',
    description: 'Medtager enheder med bestemmende økonomisk kontrol.'
  },
  {
    value: 'operationalControl',
    label: 'Operational control',
    description: 'Anbefalet for ESG – organisationen styrer daglig drift og kan implementere politikker.'
  }
]

const scope2MethodOptions: Array<{
  value: NonNullable<D1Input['scope2Method']>
  label: string
  description: string
}> = [
  {
    value: 'locationBased',
    label: 'Location-based',
    description: 'Nettoemission baseret på netleverandørens gennemsnitsfaktorer.'
  },
  {
    value: 'marketBased',
    label: 'Market-based',
    description: 'Nettoemission baseret på kontrakter, certifikater og residualfaktorer.'
  }
]

const dataQualityOptions: Array<{
  value: NonNullable<D1Input['dataQuality']>
  label: string
  description: string
}> = [
  {
    value: 'primary',
    label: 'Primær',
    description: 'Direkte målinger eller systemudtræk med revisionsspor.'
  },
  {
    value: 'secondary',
    label: 'Sekundær',
    description: 'Leverandørdata eller branchefaktorer med dokumentation.'
  },
  {
    value: 'proxy',
    label: 'Proxy',
    description: 'Skøn eller estimater uden fuld dokumentation.'
  }
]

const scope3ScreeningOptions: Array<{
  value: 'true' | 'false'
  label: string
  description: string
}> = [
  {
    value: 'true',
    label: 'Ja – screening er afsluttet',
    description: 'Alle 15 Scope 3 kategorier er vurderet for væsentlighed.'
  },
  {
    value: 'false',
    label: 'Nej – screening pågår',
    description: 'Marker når vurderingen er fuldført for at opnå højeste governance-score.'
  }
]

const TEXT_LIMIT = 2000

type SelectFieldKey = 'organizationalBoundary' | 'scope2Method' | 'dataQuality'
type TextFieldKey = 'materialityAssessmentDescription' | 'strategyDescription'

type SelectOption = {
  value: NonNullable<D1Input[SelectFieldKey]>
  label: string
  description: string
}

type GovernanceSelectConfig = {
  title: string
  description: string
  options: SelectOption[]
  field: SelectFieldKey
}

const governanceSelects: GovernanceSelectConfig[] = [
  {
    title: 'Organisatorisk afgrænsning',
    description: 'Vælg konsolideringsprincip for rapporteringen.',
    options: boundaryOptions,
    field: 'organizationalBoundary'
  },
  {
    title: 'Scope 2 metode',
    description: 'Definér primær metode til Scope 2-rapportering.',
    options: scope2MethodOptions,
    field: 'scope2Method'
  },
  {
    title: 'Datakvalitet',
    description: 'Angiv den dominerende kvalitet for ESG-data.',
    options: dataQualityOptions,
    field: 'dataQuality'
  }
]

export function D1Step({ state, onChange }: WizardStepProps): JSX.Element {
  const current = useMemo(() => {
    const stored = (state.D1 as D1Input | undefined) ?? null
    return { ...EMPTY_D1, ...(stored ?? {}) }
  }, [state])

  const preview = useMemo<ModuleResult>(() => {
    return runD1({ D1: current } as ModuleInput)
  }, [current])

  const updateState = (patch: Partial<D1Input>) => {
    onChange('D1', { ...current, ...patch })
  }

  const handleSelectChange = (field: SelectFieldKey) => (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value === '' ? null : (event.target.value as D1Input[SelectFieldKey])
    updateState({ [field]: value } as Partial<D1Input>)
  }

  const handleScope3Change = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    updateState({ scope3ScreeningCompleted: value === '' ? null : value === 'true' })
  }

  const handleTextChange = (field: TextFieldKey) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    const limited = event.target.value.slice(0, TEXT_LIMIT)
    const trimmed = limited.trim()
    updateState({ [field]: trimmed === '' ? null : limited } as Partial<D1Input>)
  }

  const materialityValue = current.materialityAssessmentDescription ?? ''
  const strategyValue = current.strategyDescription ?? ''
  const scope3Value =
    current.scope3ScreeningCompleted === null || current.scope3ScreeningCompleted === undefined
      ? ''
      : current.scope3ScreeningCompleted
      ? 'true'
      : 'false'

  const hasAnyInput =
    current.organizationalBoundary !== null ||
    current.scope2Method !== null ||
    current.scope3ScreeningCompleted !== null ||
    current.dataQuality !== null ||
    (current.materialityAssessmentDescription ?? '').length > 0 ||
    (current.strategyDescription ?? '').length > 0

  const selectedScope3 = scope3ScreeningOptions.find((option) => option.value === scope3Value)

  return (
    <form style={{ display: 'grid', gap: '1.5rem', maxWidth: '50rem' }}>
      <header style={{ display: 'grid', gap: '0.65rem' }}>
        <h2 style={{ margin: 0 }}>D1 – Metode &amp; governance</h2>
        <p style={{ margin: 0 }}>
          Dokumentér governance-opsætningen for CSRD/ESRS: konsolideringsprincip, Scope 2 metode, Scope 3 screening,
          datakvalitet og de centrale analyser og politikker.
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gap: '1rem',
          background: '#f1f5f4',
          padding: '1rem',
          borderRadius: '0.75rem'
        }}
      >
        <h3 style={{ margin: 0 }}>Metodevalg</h3>
        <p style={{ margin: 0, color: '#43524c', fontSize: '0.9rem' }}>
          Operational control, market-based Scope 2 og en fuldført Scope 3 screening giver højeste governance-score.
        </p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {governanceSelects.map((section) => {
            const value = (current[section.field] ?? '') as string
            const selected =
              value === ''
                ? undefined
                : section.options.find((option) => option.value === value)
            return (
              <label key={section.field} style={{ display: 'grid', gap: '0.4rem' }}>
                <span style={{ fontWeight: 600 }}>{section.title}</span>
                <span style={{ color: '#4d5c56', fontSize: '0.85rem' }}>{section.description}</span>
                <select
                  value={value}
                  onChange={handleSelectChange(section.field)}
                  style={{ padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #c3cec9' }}
                >
                  <option value="">Vælg mulighed</option>
                  {section.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span style={{ color: '#5f6c66', fontSize: '0.8rem' }}>
                  {selected
                    ? `${selected.label}: ${selected.description}`
                    : 'Vælg en mulighed for at se beskrivelsen.'}
                </span>
              </label>
            )
          })}

          <label style={{ display: 'grid', gap: '0.4rem' }}>
            <span style={{ fontWeight: 600 }}>Scope 3 screening</span>
            <span style={{ color: '#4d5c56', fontSize: '0.85rem' }}>
              Angiv status for den seneste screening af alle 15 Scope 3 kategorier.
            </span>
            <select
              value={scope3Value}
              onChange={handleScope3Change}
              style={{ padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #c3cec9' }}
            >
              <option value="">Vælg status</option>
              {scope3ScreeningOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span style={{ color: '#5f6c66', fontSize: '0.8rem' }}>
              {selectedScope3 ? selectedScope3.description : 'Status bruges til governance-scoren og kan opdateres senere.'}
            </span>
          </label>
        </div>
      </section>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: '0.4rem' }}>
          <span style={{ fontWeight: 600 }}>Beskrivelse af væsentlighedsanalyse</span>
          <span style={{ color: '#4d5c56', fontSize: '0.85rem' }}>
            Opsummer risici, muligheder og stakeholderinput. Indholdet indgår i governance-scoren.
          </span>
          <textarea
            rows={6}
            value={materialityValue}
            onChange={handleTextChange('materialityAssessmentDescription')}
            maxLength={TEXT_LIMIT}
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #c3cec9', fontFamily: 'inherit' }}
          />
          <span style={{ fontSize: '0.8rem', color: '#5f6c66' }}>
            {materialityValue.length}/{TEXT_LIMIT} tegn
          </span>
        </label>

        <label style={{ display: 'grid', gap: '0.4rem' }}>
          <span style={{ fontWeight: 600 }}>Beskrivelse af strategi, målsætninger og politikker</span>
          <span style={{ color: '#4d5c56', fontSize: '0.85rem' }}>
            Beskriv governance-setup, ansvar og politikker for at indfri ESG-målene.
          </span>
          <textarea
            rows={6}
            value={strategyValue}
            onChange={handleTextChange('strategyDescription')}
            maxLength={TEXT_LIMIT}
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #c3cec9', fontFamily: 'inherit' }}
          />
          <span style={{ fontSize: '0.8rem', color: '#5f6c66' }}>
            {strategyValue.length}/{TEXT_LIMIT} tegn
          </span>
        </label>
      </section>

      <section
        style={{ display: 'grid', gap: '0.75rem', background: '#f9fbfa', border: '1px solid #d5e1dc', borderRadius: '0.75rem', padding: '1rem' }}
      >
        <h3 style={{ margin: 0 }}>Governance-score</h3>
        {hasAnyInput ? (
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 600 }}>
              {preview.value} {preview.unit}
            </p>
            {preview.assumptions.length > 0 ? (
              <div>
                <strong>Antagelser</strong>
                <ul>
                  {preview.assumptions.map((assumption, index) => (
                    <li key={`assumption-${index}`}>{assumption}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {preview.warnings.length > 0 ? (
              <div>
                <strong>Forslag til opfølgning</strong>
                <ul>
                  {preview.warnings.map((warning, index) => (
                    <li key={`warning-${index}`}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <details>
              <summary>Teknisk trace</summary>
              <ul>
                {preview.trace.map((traceEntry, index) => (
                  <li key={`trace-${index}`} style={{ fontFamily: 'monospace' }}>
                    {traceEntry}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        ) : (
          <p style={{ margin: 0 }}>Udfyld felterne for at beregne governance-scoren.</p>
        )}
      </section>
    </form>
  )
}
