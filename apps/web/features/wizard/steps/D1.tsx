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

const TEXT_LIMIT = 2000

type SelectFieldKey = 'organizationalBoundary' | 'scope2Method' | 'dataQuality'
type TextFieldKey = 'materialityAssessmentDescription' | 'strategyDescription'

type SelectOption = {
  value: NonNullable<D1Input[SelectFieldKey]>
  label: string
  description: string
}

type GovernanceSectionConfig = {
  title: string
  description: string
  options: SelectOption[]
  field: SelectFieldKey
}

const governanceSections: GovernanceSectionConfig[] = [
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
  const current = (state.D1 as D1Input | undefined) ?? EMPTY_D1

  const preview = useMemo<ModuleResult>(() => {
    return runD1({ D1: current } as ModuleInput)
  }, [current])

  const handleSelectChange = (field: SelectFieldKey) => (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value === '' ? null : (event.target.value as D1Input[SelectFieldKey])
    onChange('D1', {
      ...current,
      [field]: value
    })
  }

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked
    onChange('D1', {
      ...current,
      scope3ScreeningCompleted: value
    })
  }

  const handleTextChange = (field: TextFieldKey) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    const limited = event.target.value.slice(0, TEXT_LIMIT)
    onChange('D1', {
      ...current,
      [field]: limited.trim() === '' ? null : limited
    })
  }

  const scope3Checked = current.scope3ScreeningCompleted ?? false
  const materialityValue = current.materialityAssessmentDescription ?? ''
  const strategyValue = current.strategyDescription ?? ''

  return (
    <form style={{ display: 'grid', gap: '1.5rem', maxWidth: '56rem' }}>
      <header style={{ display: 'grid', gap: '0.75rem' }}>
        <h2>D1 – Metode &amp; governance</h2>
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
          padding: '1.25rem',
          borderRadius: '0.75rem'
        }}
      >
        <h3 style={{ margin: 0 }}>Metodevalg</h3>
        <p style={{ margin: 0, color: '#445048' }}>
          Disse valg vægtes direkte i governance-scoren. Operational control, market-based Scope 2 og fuldført Scope 3
          screening giver højeste score.
        </p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {governanceSections.map((section) => {
            const value = current[section.field] ?? ''
            const selected =
              value === ''
                ? undefined
                : section.options.find((option) => option.value === value)
            return (
              <label key={section.field} style={{ display: 'grid', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{section.title}</span>
                <span style={{ color: '#4d5c56', fontSize: '0.9rem' }}>{section.description}</span>
                <select
                  value={value}
                  onChange={handleSelectChange(section.field)}
                  style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5d0' }}
                >
                  <option value="">Vælg...</option>
                  {section.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span style={{ color: '#5f6c66', fontSize: '0.85rem' }}>
                  {selected
                    ? `${selected.label}: ${selected.description}`
                    : 'Vælg en mulighed for at se beskrivelse.'}
                </span>
              </label>
            )
          })}

          <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input type="checkbox" checked={scope3Checked} onChange={handleCheckboxChange} />
            <span>
              <span style={{ display: 'block', fontWeight: 600 }}>Scope 3 screening udført</span>
              <span style={{ display: 'block', color: '#4d5c56', fontSize: '0.9rem' }}>
                Markér når alle 15 kategorier er vurderet for væsentlighed.
              </span>
            </span>
          </label>
        </div>
      </section>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Beskrivelse af væsentlighedsanalyse</span>
          <span style={{ color: '#4d5c56', fontSize: '0.9rem' }}>
            Opsummer risici, muligheder og stakeholderinput. Indholdet indgår i governance-scoren.
          </span>
          <textarea
            rows={6}
            value={materialityValue}
            onChange={handleTextChange('materialityAssessmentDescription')}
            maxLength={TEXT_LIMIT}
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5d0', fontFamily: 'inherit' }}
          />
          <span style={{ fontSize: '0.8rem', color: '#5f6c66' }}>
            {materialityValue.length}/{TEXT_LIMIT} tegn
          </span>
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Beskrivelse af strategi, målsætninger og politikker</span>
          <span style={{ color: '#4d5c56', fontSize: '0.9rem' }}>
            Beskriv governance-setup, ansvar og politikker for at indfri ESG-målene.
          </span>
          <textarea
            rows={6}
            value={strategyValue}
            onChange={handleTextChange('strategyDescription')}
            maxLength={TEXT_LIMIT}
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5d0', fontFamily: 'inherit' }}
          />
          <span style={{ fontSize: '0.8rem', color: '#5f6c66' }}>
            {strategyValue.length}/{TEXT_LIMIT} tegn
          </span>
        </label>
      </section>

      <section
        style={{
          display: 'grid',
          gap: '0.75rem',
          background: '#f9fbfa',
          border: '1px solid #d5e1dc',
          borderRadius: '0.75rem',
          padding: '1.25rem'
        }}
      >
        <h3 style={{ margin: 0 }}>Governance-score</h3>
        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>
          {preview.value} {preview.unit}
        </p>
        <div>
          <strong>Antagelser</strong>
          <ul>
            {preview.assumptions.map((assumption, index) => (
              <li key={`assumption-${index}`}>{assumption}</li>
            ))}
          </ul>
        </div>
        {preview.warnings.length > 0 && (
          <div>
            <strong>Forslag til opfølgning</strong>
            <ul>
              {preview.warnings.map((warning, index) => (
                <li key={`warning-${index}`}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
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
      </section>
    </form>
  )
}
