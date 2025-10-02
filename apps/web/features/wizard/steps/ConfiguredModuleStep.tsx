/**
 * Helper til at bygge modultrin ud fra en feltkonfiguration.
 */
'use client'

import { useId, useMemo } from 'react'
import type { ChangeEvent } from 'react'
import type { ModuleCalculator, ModuleId, ModuleInput, ModuleResult } from '@org/shared'
import type { WizardStepComponent, WizardStepProps } from './StepTemplate'

export type SelectOption<State extends Record<string, unknown>> = {
  value: string
  label: string
  description?: string
  derived?: Partial<State>
}

export type BaseField<State extends Record<string, unknown>> = {
  key: keyof State & string
  label: string
  description?: string
  helperText?: string
  afterUpdate?: (context: { value: unknown; current: State }) => Partial<State> | void
}

export type NumberField<State extends Record<string, unknown>> = BaseField<State> & {
  type: 'number'
  unit?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number | 'any'
  readOnly?: boolean
}

export type PercentField<State extends Record<string, unknown>> = BaseField<State> & {
  type: 'percent'
  placeholder?: string
}

export type SelectField<State extends Record<string, unknown>> = BaseField<State> & {
  type: 'select'
  options: Array<SelectOption<State>>
  placeholder?: string
}

export type FileField<State extends Record<string, unknown>> = BaseField<State> & {
  type: 'file'
  accept?: string
}

export type FieldDefinition<State extends Record<string, unknown>> =
  | NumberField<State>
  | PercentField<State>
  | SelectField<State>
  | FileField<State>

export type ModuleStepConfig<Id extends ModuleId, State extends Record<string, unknown>> = {
  moduleId: Id
  title: string
  description?: string
  emptyState: State
  fields: Array<FieldDefinition<State>>
  runModule: ModuleCalculator
}

function normaliseNumber(rawValue: string): number | null {
  const trimmed = rawValue.trim()
  if (trimmed === '') {
    return null
  }
  const normalised = trimmed.replace(',', '.')
  const parsed = Number.parseFloat(normalised)
  return Number.isFinite(parsed) ? parsed : null
}

export function createConfiguredModuleStep<
  Id extends ModuleId,
  State extends Record<string, unknown>
>(config: ModuleStepConfig<Id, State>): WizardStepComponent {
  return function ConfiguredModuleStep({ state, onChange }: WizardStepProps): JSX.Element {
    const fieldIds = useId()

    const current = useMemo(() => {
      const stored = state[config.moduleId] as State | undefined
      return { ...config.emptyState, ...(stored ?? {}) }
    }, [state])

    const preview = useMemo<ModuleResult>(() => {
      return config.runModule({ [config.moduleId]: current } as ModuleInput)
    }, [current])

    const updateState = (patch: Partial<State>) => {
      const next = { ...current, ...patch }
      onChange(config.moduleId, next)
    }

    const renderField = (field: FieldDefinition<State>, index: number) => {
      const commonLabel = (
        <span style={{ fontWeight: 600 }}>
          {field.label}
          {'unit' in field && field.unit ? ` (${field.unit})` : null}
        </span>
      )

      const description = field.description ? (
        <span style={{ color: '#4a5c57', fontSize: '0.85rem' }}>{field.description}</span>
      ) : null

      const helper = field.helperText ? (
        <span style={{ color: '#6b7d77', fontSize: '0.8rem' }}>{field.helperText}</span>
      ) : null

      if (field.type === 'number') {
        const value = current[field.key] as number | null | undefined
        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
          const parsed = normaliseNumber(event.target.value)
          const patch: Partial<State> = { [field.key]: parsed } as Partial<State>
          const extra = field.afterUpdate?.({ value: parsed, current })
          if (extra) {
            Object.assign(patch, extra)
          }
          updateState(patch)
        }
        return (
          <label key={`${fieldIds}-${index}`} style={{ display: 'grid', gap: '0.35rem' }}>
            {commonLabel}
            {description}
            <input
              type="number"
              inputMode="decimal"
              value={value ?? ''}
              onChange={handleChange}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step ?? 'any'}
              readOnly={field.readOnly}
              style={{ padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #c3cec9' }}
            />
            {helper}
          </label>
        )
      }

      if (field.type === 'percent') {
        const value = current[field.key] as number | null | undefined
        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
          const parsed = normaliseNumber(event.target.value)
          const patch: Partial<State> = { [field.key]: parsed } as Partial<State>
          const extra = field.afterUpdate?.({ value: parsed, current })
          if (extra) {
            Object.assign(patch, extra)
          }
          updateState(patch)
        }
        return (
          <label key={`${fieldIds}-${index}`} style={{ display: 'grid', gap: '0.35rem' }}>
            {commonLabel}
            {description}
            <input
              type="number"
              inputMode="decimal"
              value={value ?? ''}
              onChange={handleChange}
              placeholder={field.placeholder}
              min={0}
              max={100}
              step="any"
              style={{ padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #c3cec9' }}
            />
            {helper}
          </label>
        )
      }

      if (field.type === 'select') {
        const value = (current[field.key] as string | null | undefined) ?? ''
        const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
          const selectedValue = event.target.value
          const option = field.options.find((candidate) => candidate.value === selectedValue)
          const patch: Partial<State> = {
            [field.key]: selectedValue === '' ? null : selectedValue
          } as Partial<State>
          if (option?.derived) {
            Object.assign(patch, option.derived)
          }
          const extra = field.afterUpdate?.({
            value: selectedValue === '' ? null : selectedValue,
            current
          })
          if (extra) {
            Object.assign(patch, extra)
          }
          updateState(patch)
        }
        return (
          <label key={`${fieldIds}-${index}`} style={{ display: 'grid', gap: '0.35rem' }}>
            {commonLabel}
            {description}
            <select
              value={value}
              onChange={handleChange}
              style={{ padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #c3cec9' }}
            >
              <option value="">{field.placeholder ?? 'Vælg mulighed'}</option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {helper}
          </label>
        )
      }

      // file
      const storedValue = (current[field.key] as string | null | undefined) ?? ''
      const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        updateState({ [field.key]: file ? file.name : null } as Partial<State>)
      }
      const handleClear = () => {
        updateState({ [field.key]: null } as Partial<State>)
      }
      return (
        <div key={`${fieldIds}-${index}`} style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontWeight: 600 }}>{field.label}</span>
          {description}
          <input
            type="file"
            onChange={handleChange}
            accept={field.accept}
            style={{
              padding: '0.45rem',
              borderRadius: '0.5rem',
              border: '1px solid #c3cec9',
              background: '#f6f9f8'
            }}
          />
          {storedValue ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span>{storedValue}</span>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#a23b32',
                  cursor: 'pointer'
                }}
              >
                Fjern
              </button>
            </div>
          ) : null}
          {helper}
        </div>
      )
    }

    const hasAnyInput = Object.values(current).some((value) => value !== null && value !== undefined && value !== '')
    const hasData = hasAnyInput && preview.trace.length > 0

    return (
      <form style={{ display: 'grid', gap: '1.5rem', maxWidth: '50rem' }}>
        <header style={{ display: 'grid', gap: '0.65rem' }}>
          <h2 style={{ margin: 0 }}>{config.title}</h2>
          {config.description ? <p style={{ margin: 0 }}>{config.description}</p> : null}
        </header>

        <section style={{ display: 'grid', gap: '1rem' }}>
          {config.fields.map((field, index) => renderField(field, index))}
        </section>

        <section
          style={{ display: 'grid', gap: '0.75rem', background: '#f1f5f4', padding: '1rem', borderRadius: '0.75rem' }}
        >
          <h3 style={{ margin: 0 }}>Estimat</h3>
          {hasData ? (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
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
                  <strong>Advarsler</strong>
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
                  {preview.trace.map((line, index) => (
                    <li key={`trace-${index}`} style={{ fontFamily: 'monospace' }}>
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
}
