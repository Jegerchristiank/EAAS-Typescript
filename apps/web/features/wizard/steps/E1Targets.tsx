/**
 * Wizardtrin til opsamling af klimamål (ESRS E1) og planlagte handlinger.
 */
'use client'

import { Fragment, useCallback, useMemo } from 'react'
import type { ChangeEvent } from 'react'

import type {
  E1ActionStatus,
  E1ContextInput,
  E1TargetScope,
  E1TargetStatus,
  E1TargetsInput,
  ModuleInput,
  ModuleResult,
} from '@org/shared'
import { runE1Targets } from '@org/shared'

import type { WizardStepProps } from './StepTemplate'

const EMPTY_INPUT: E1TargetsInput = { targets: [], actions: [] }
const EMPTY_CONTEXT: E1ContextInput = {
  netRevenueDkk: null,
  productionVolume: null,
  productionUnit: null,
  employeesFte: null,
  totalEnergyConsumptionKwh: null,
  energyProductionKwh: null,
  renewableEnergyProductionKwh: null,
  energyMixLines: [],
  previousYearScope1Tonnes: null,
  previousYearScope2Tonnes: null,
  previousYearScope3Tonnes: null,
}

const TARGET_SCOPE_OPTIONS: Array<{ value: E1TargetScope; label: string }> = [
  { value: 'scope1', label: 'Scope 1' },
  { value: 'scope2', label: 'Scope 2' },
  { value: 'scope3', label: 'Scope 3' },
  { value: 'combined', label: 'Samlet (scope 1-3)' },
]

const TARGET_STATUS_OPTIONS: Array<{ value: E1TargetStatus; label: string }> = [
  { value: 'onTrack', label: 'On track' },
  { value: 'lagging', label: 'Halter' },
  { value: 'atRisk', label: 'Risiko' },
]

const ACTION_STATUS_OPTIONS: Array<{ value: E1ActionStatus; label: string }> = [
  { value: 'planned', label: 'Planlagt' },
  { value: 'inProgress', label: 'I gang' },
  { value: 'delayed', label: 'Forsinket' },
  { value: 'completed', label: 'Afsluttet' },
]

type TargetList = NonNullable<E1TargetsInput['targets']>
type TargetField =
  | 'name'
  | 'scope'
  | 'targetYear'
  | 'targetValueTonnes'
  | 'baselineYear'
  | 'baselineValueTonnes'
  | 'owner'
  | 'status'
  | 'description'
type ActionList = NonNullable<E1TargetsInput['actions']>
type ActionField = keyof ActionList[number]

type Milestone = NonNullable<TargetList[number]['milestones']>[number]
type MilestoneField = keyof Milestone
type ContextNumberField =
  | 'netRevenueDkk'
  | 'productionVolume'
  | 'employeesFte'
  | 'totalEnergyConsumptionKwh'
  | 'energyProductionKwh'
  | 'renewableEnergyProductionKwh'
  | 'previousYearScope1Tonnes'
  | 'previousYearScope2Tonnes'
  | 'previousYearScope3Tonnes'

const ENERGY_MIX_OPTIONS = [
  { value: 'electricity', label: 'Elektricitet' },
  { value: 'districtHeat', label: 'Fjernvarme' },
  { value: 'steam', label: 'Damp' },
  { value: 'cooling', label: 'Køling' },
  { value: 'biogas', label: 'Biogas' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'other', label: 'Andet' },
] as const

type EnergyMixValue = (typeof ENERGY_MIX_OPTIONS)[number]['value']
type TargetStatusValue = E1TargetStatus
type EnergyMixLine = NonNullable<E1ContextInput['energyMixLines']>[number]

const createEmptyTarget = (): NonNullable<E1TargetsInput['targets']>[number] => ({
  id: null,
  name: null,
  scope: 'scope1',
  targetYear: null,
  targetValueTonnes: null,
  baselineYear: null,
  baselineValueTonnes: null,
  owner: null,
  status: null,
  description: null,
  milestones: [],
})

const createEmptyAction = (): NonNullable<E1TargetsInput['actions']>[number] => ({
  title: null,
  description: null,
  owner: null,
  dueQuarter: null,
  status: 'planned',
})

const createEmptyMilestone = (): Milestone => ({
  label: null,
  dueYear: null,
})

const createEmptyEnergyMixLine = (): EnergyMixLine => ({
  energyType: 'electricity',
  consumptionKwh: null,
  documentationQualityPercent: null,
})

const ensureTarget = (
  target?: NonNullable<E1TargetsInput['targets']>[number],
): NonNullable<E1TargetsInput['targets']>[number] => ({
  ...createEmptyTarget(),
  ...(target ?? {}),
})

const ensureAction = (
  action?: NonNullable<E1TargetsInput['actions']>[number],
): NonNullable<E1TargetsInput['actions']>[number] => ({
  ...createEmptyAction(),
  ...(action ?? {}),
})

export function E1TargetsStep({ state, onChange }: WizardStepProps): JSX.Element {
  const currentTargets = (state.E1Targets as E1TargetsInput | undefined) ?? EMPTY_INPUT
  const currentContext = (state.E1Context as E1ContextInput | undefined) ?? EMPTY_CONTEXT

  const setTargets = useCallback(
    (updater: (targets: TargetList) => TargetList) => {
      const previousTargets: TargetList = [...(currentTargets.targets ?? [])]
      const nextTargets = updater(previousTargets)
      onChange('E1Targets', { ...currentTargets, targets: nextTargets })
    },
    [currentTargets, onChange],
  )

  const setActions = useCallback(
    (updater: (actions: ActionList) => ActionList) => {
      const previousActions: ActionList = [...(currentTargets.actions ?? [])]
      const nextActions = updater(previousActions)
      onChange('E1Targets', { ...currentTargets, actions: nextActions })
    },
    [currentTargets, onChange],
  )

  const setContext = useCallback(
    (updater: (context: E1ContextInput) => E1ContextInput) => {
      const cloned: E1ContextInput = {
        ...currentContext,
        energyMixLines: [...(currentContext.energyMixLines ?? [])],
      }
      const next = updater(cloned)
      onChange('E1Context', next)
    },
    [currentContext, onChange],
  )

  const preview = useMemo<ModuleResult>(() => {
    const input: ModuleInput = {
      E1Targets: currentTargets,
      E1Context: currentContext,
    } as ModuleInput
    return runE1Targets(input)
  }, [currentContext, currentTargets])

  const handleTargetFieldChange = (
    index: number,
    field: TargetField,
  ) =>
  (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = event.target.value
    const trimmed = value.trim()
    setTargets((prev) => {
      const next = [...prev]
      const existing = ensureTarget(next[index])

      switch (field) {
        case 'targetYear':
          existing.targetYear = trimmed === '' ? null : parseInteger(trimmed)
          break
        case 'baselineYear':
          existing.baselineYear = trimmed === '' ? null : parseInteger(trimmed)
          break
        case 'targetValueTonnes':
          existing.targetValueTonnes = trimmed === '' ? null : parseNumber(trimmed)
          break
        case 'baselineValueTonnes':
          existing.baselineValueTonnes = trimmed === '' ? null : parseNumber(trimmed)
          break
        case 'scope':
          existing.scope = (value as E1TargetScope) ?? 'combined'
          break
        case 'status':
          existing.status = trimmed === '' ? null : (trimmed as TargetStatusValue)
          break
        case 'name':
          existing.name = trimmed === '' ? null : trimmed
          break
        case 'owner':
          existing.owner = trimmed === '' ? null : trimmed
          break
        case 'description':
          existing.description = trimmed === '' ? null : trimmed
          break
      }

      next[index] = existing
      return next
    })
  }

  const handleMilestoneChange = (targetIndex: number, milestoneIndex: number, field: MilestoneField) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const trimmed = event.target.value.trim()
      setTargets((prev) => {
        const next = [...prev]
        const existing = ensureTarget(next[targetIndex])
        const milestones = Array.isArray(existing.milestones) ? [...existing.milestones] : []
        const milestone = { ...(milestones[milestoneIndex] ?? createEmptyMilestone()) }
        if (field === 'dueYear') {
          milestone.dueYear = trimmed === '' ? null : Number.parseInt(trimmed, 10)
        } else {
          milestone.label = trimmed === '' ? null : trimmed
        }
        milestones[milestoneIndex] = milestone
        existing.milestones = milestones
        next[targetIndex] = existing
        return next
      })
    }

  const handleActionFieldChange = (
    index: number,
    field: ActionField,
  ) =>
  (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = event.target.value
    const trimmed = value.trim()
    setActions((prev) => {
      const next = [...prev]
      const existing = ensureAction(next[index])
      if (field === 'status') {
        existing[field] = trimmed === '' ? null : (trimmed as E1ActionStatus)
      } else {
        existing[field] = trimmed === '' ? null : trimmed
      }
      next[index] = existing
      return next
    })
  }

  const handleAddTarget = () => {
    setTargets((prev) => [...prev, createEmptyTarget()])
  }

  const handleRemoveTarget = (index: number) => () => {
    setTargets((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleAddMilestone = (index: number) => () => {
    setTargets((prev) => {
      const next = [...prev]
      const existing = ensureTarget(next[index])
      const milestones = Array.isArray(existing.milestones) ? [...existing.milestones] : []
      milestones.push(createEmptyMilestone())
      existing.milestones = milestones
      next[index] = existing
      return next
    })
  }

  const handleRemoveMilestone = (targetIndex: number, milestoneIndex: number) => () => {
    setTargets((prev) => {
      const next = [...prev]
      const existing = ensureTarget(next[targetIndex])
      const milestones = Array.isArray(existing.milestones) ? [...existing.milestones] : []
      milestones.splice(milestoneIndex, 1)
      existing.milestones = milestones
      next[targetIndex] = existing
      return next
    })
  }

  const handleAddAction = () => {
    setActions((prev) => [...prev, createEmptyAction()])
  }

  const handleRemoveAction = (index: number) => () => {
    setActions((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleContextNumberChange = (field: ContextNumberField) => (event: ChangeEvent<HTMLInputElement>) => {
    const trimmed = event.target.value.trim()
    const parsed = trimmed === '' ? null : parseNonNegativeNumber(trimmed)
    setContext((prev) => ({ ...prev, [field]: parsed }))
  }

  const handleContextStringChange = (field: keyof Pick<E1ContextInput, 'productionUnit'>) =>
  (event: ChangeEvent<HTMLInputElement>) => {
    const trimmed = event.target.value.trim()
    setContext((prev) => ({ ...prev, [field]: trimmed === '' ? null : trimmed }))
  }

  const handleEnergyMixFieldChange = (
    index: number,
    field: 'energyType' | 'consumptionKwh' | 'documentationQualityPercent',
  ) =>
  (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const trimmed = event.target.value.trim()
    setContext((prev) => {
      const energyMixLines: EnergyMixLine[] = [...(prev.energyMixLines ?? [])]
      const line: EnergyMixLine = {
        ...createEmptyEnergyMixLine(),
        ...(energyMixLines[index] ?? {}),
      }
      if (field === 'energyType') {
        line.energyType = (trimmed || 'electricity') as EnergyMixValue
      } else if (field === 'consumptionKwh') {
        line.consumptionKwh = trimmed === '' ? null : parseNonNegativeNumber(trimmed)
      } else {
        const parsed = trimmed === '' ? null : parseNonNegativeNumber(trimmed)
        line.documentationQualityPercent = clampPercent(parsed)
      }
      energyMixLines[index] = line
      return { ...prev, energyMixLines }
    })
  }

  const handleAddEnergyMix = () => {
    setContext((prev) => ({
      ...prev,
      energyMixLines: [...(prev.energyMixLines ?? []), createEmptyEnergyMixLine()],
    }))
  }

  const handleRemoveEnergyMix = (index: number) => () => {
    setContext((prev) => {
      const lines = [...(prev.energyMixLines ?? [])]
      lines.splice(index, 1)
      return { ...prev, energyMixLines: lines }
    })
  }

  return (
    <form className="ds-form ds-stack" noValidate>
      <header className="ds-stack-sm">
        <h2 className="ds-heading-sm">E1 – Klimamål og handlinger</h2>
        <p className="ds-text-muted">
          Registrér klimamål på tværs af scope 1-3, ansvarlige samt planlagte handlinger. Data anvendes til at beregne
          intensiteter og målopfølgning på review- og PDF-siderne.
        </p>
      </header>

      <section className="ds-stack">
        <div className="ds-stack-sm">
          <h3 className="ds-heading-sm">ESRS E1 kontekst</h3>
          <p className="ds-text-subtle">Indtast nøgledata til intensiteter, energimix og trendberegninger.</p>
        </div>
        <div className="ds-grid ds-grid-2">
          <label className="ds-field">
            <span>Nettoomsætning (DKK)</span>
            <input
              className="ds-input"
              type="number"
              step="any"
              value={currentContext.netRevenueDkk ?? ''}
              onChange={handleContextNumberChange('netRevenueDkk')}
              placeholder="25000000"
            />
          </label>
          <label className="ds-field">
            <span>Produktionsvolumen</span>
            <input
              className="ds-input"
              type="number"
              step="any"
              value={currentContext.productionVolume ?? ''}
              onChange={handleContextNumberChange('productionVolume')}
              placeholder="10000"
            />
          </label>
        </div>
        <div className="ds-grid ds-grid-2">
          <label className="ds-field">
            <span>Produktionsenhed</span>
            <input
              className="ds-input"
              value={currentContext.productionUnit ?? ''}
              onChange={handleContextStringChange('productionUnit')}
              placeholder="stk., ton, MWh"
            />
          </label>
          <label className="ds-field">
            <span>Gennemsnitlige FTE</span>
            <input
              className="ds-input"
              type="number"
              step="any"
              value={currentContext.employeesFte ?? ''}
              onChange={handleContextNumberChange('employeesFte')}
              placeholder="200"
            />
          </label>
        </div>
        <div className="ds-grid ds-grid-3">
          <label className="ds-field">
            <span>Total energiforbrug (kWh)</span>
            <input
              className="ds-input"
              type="number"
              step="any"
              value={currentContext.totalEnergyConsumptionKwh ?? ''}
              onChange={handleContextNumberChange('totalEnergyConsumptionKwh')}
              placeholder="180000"
            />
          </label>
          <label className="ds-field">
            <span>Egenproduktion (kWh)</span>
            <input
              className="ds-input"
              type="number"
              step="any"
              value={currentContext.energyProductionKwh ?? ''}
              onChange={handleContextNumberChange('energyProductionKwh')}
              placeholder="12000"
            />
          </label>
          <label className="ds-field">
            <span>Vedvarende egenproduktion (kWh)</span>
            <input
              className="ds-input"
              type="number"
              step="any"
              value={currentContext.renewableEnergyProductionKwh ?? ''}
              onChange={handleContextNumberChange('renewableEnergyProductionKwh')}
              placeholder="12000"
            />
          </label>
        </div>
        <div className="ds-grid ds-grid-3">
          <label className="ds-field">
            <span>Scope 1 sidste år (tCO₂e)</span>
            <input
              className="ds-input"
              type="number"
              step="any"
              value={currentContext.previousYearScope1Tonnes ?? ''}
              onChange={handleContextNumberChange('previousYearScope1Tonnes')}
              placeholder="50"
            />
          </label>
          <label className="ds-field">
            <span>Scope 2 sidste år (tCO₂e)</span>
            <input
              className="ds-input"
              type="number"
              step="any"
              value={currentContext.previousYearScope2Tonnes ?? ''}
              onChange={handleContextNumberChange('previousYearScope2Tonnes')}
              placeholder="35"
            />
          </label>
          <label className="ds-field">
            <span>Scope 3 sidste år (tCO₂e)</span>
            <input
              className="ds-input"
              type="number"
              step="any"
              value={currentContext.previousYearScope3Tonnes ?? ''}
              onChange={handleContextNumberChange('previousYearScope3Tonnes')}
              placeholder="120"
            />
          </label>
        </div>
        <div className="ds-stack-sm">
          <strong>Energimix</strong>
          <p className="ds-text-subtle">Fordel energiforbruget efter type for at vise ESRS E1 energimix.</p>
          <button type="button" className="ds-button ds-button--ghost" onClick={handleAddEnergyMix}>
            Tilføj energilinje
          </button>
          {(currentContext.energyMixLines ?? []).length === 0 && (
            <p className="ds-text-muted">Ingen energilinjer tilføjet.</p>
          )}
          {(currentContext.energyMixLines ?? []).map((line, index) => (
            <div key={`energy-mix-${index}`} className="ds-grid ds-grid-3 ds-card ds-card--subtle">
              <label className="ds-field">
                <span>Energitype</span>
                <select
                  className="ds-input"
                  value={line?.energyType ?? 'electricity'}
                  onChange={handleEnergyMixFieldChange(index, 'energyType')}
                >
                  {ENERGY_MIX_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ds-field">
                <span>Forbrug (kWh)</span>
                <input
                  className="ds-input"
                  type="number"
                  step="any"
                  value={line?.consumptionKwh ?? ''}
                  onChange={handleEnergyMixFieldChange(index, 'consumptionKwh')}
                />
              </label>
              <label className="ds-field">
                <span>Dokumentationskvalitet (%)</span>
                <input
                  className="ds-input"
                  type="number"
                  step="any"
                  min={0}
                  max={100}
                  value={line?.documentationQualityPercent ?? ''}
                  onChange={handleEnergyMixFieldChange(index, 'documentationQualityPercent')}
                />
              </label>
              <button type="button" className="ds-button ds-button--ghost" onClick={handleRemoveEnergyMix(index)}>
                Fjern energilinje
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="ds-stack">
        <div className="ds-stack-sm">
          <h3 className="ds-heading-sm">Klimamål</h3>
          <p className="ds-text-subtle">Tilføj ét mål pr. scope eller kombinér i et samlet mål.</p>
          <button type="button" className="ds-button" onClick={handleAddTarget}>
            Tilføj mål
          </button>
        </div>

        {(currentTargets.targets ?? []).length === 0 && <p className="ds-text-muted">Ingen mål registreret endnu.</p>}

        {(currentTargets.targets ?? []).map((target, index) => {
          const normalizedTarget = ensureTarget(target)
          return (
            <section key={`target-${index}`} className="ds-card ds-stack">
              <header className="ds-stack-sm">
                <h4 className="ds-heading-xs">Mål #{index + 1}</h4>
                <button type="button" className="ds-button ds-button--ghost" onClick={handleRemoveTarget(index)}>
                  Fjern mål
                </button>
              </header>

            <label className="ds-field">
              <span>Navn</span>
              <input
                className="ds-input"
                value={normalizedTarget.name ?? ''}
                onChange={handleTargetFieldChange(index, 'name')}
                placeholder="Fx Net zero for scope 2"
              />
            </label>

            <label className="ds-field">
              <span>Scope</span>
              <select
                className="ds-input"
                value={normalizedTarget.scope ?? 'combined'}
                onChange={handleTargetFieldChange(index, 'scope')}
              >
                {TARGET_SCOPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="ds-grid ds-grid-2">
              <label className="ds-field">
                <span>Målår</span>
                <input
                  className="ds-input"
                  type="number"
                  value={normalizedTarget.targetYear ?? ''}
                  onChange={handleTargetFieldChange(index, 'targetYear')}
                  placeholder="2026"
                />
              </label>
              <label className="ds-field">
                <span>Mål (tCO2e)</span>
                <input
                  className="ds-input"
                  type="number"
                  value={normalizedTarget.targetValueTonnes ?? ''}
                  onChange={handleTargetFieldChange(index, 'targetValueTonnes')}
                  placeholder="25"
                />
              </label>
              <label className="ds-field">
                <span>Baseline-år</span>
                <input
                  className="ds-input"
                  type="number"
                  value={normalizedTarget.baselineYear ?? ''}
                  onChange={handleTargetFieldChange(index, 'baselineYear')}
                  placeholder="2023"
                />
              </label>
              <label className="ds-field">
                <span>Baseline (tCO2e)</span>
                <input
                  className="ds-input"
                  type="number"
                  value={normalizedTarget.baselineValueTonnes ?? ''}
                  onChange={handleTargetFieldChange(index, 'baselineValueTonnes')}
                  placeholder="40"
                />
              </label>
            </div>

            <label className="ds-field">
              <span>Status</span>
              <select
                className="ds-input"
                value={normalizedTarget.status ?? ''}
                onChange={handleTargetFieldChange(index, 'status')}
              >
                <option value="">Ikke vurderet</option>
                {TARGET_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="ds-field">
              <span>Ansvarlig</span>
              <input
                className="ds-input"
                value={normalizedTarget.owner ?? ''}
                onChange={handleTargetFieldChange(index, 'owner')}
                placeholder="Fx ESG-team"
              />
            </label>

            <label className="ds-field">
              <span>Beskrivelse</span>
              <textarea
                className="ds-textarea"
                value={normalizedTarget.description ?? ''}
                onChange={handleTargetFieldChange(index, 'description')}
                rows={3}
              />
            </label>

            <div className="ds-stack-sm">
              <strong>Milepæle</strong>
              <button type="button" className="ds-button ds-button--ghost" onClick={handleAddMilestone(index)}>
                Tilføj milepæl
              </button>
              {(normalizedTarget.milestones ?? []).length === 0 && (
                <p className="ds-text-muted">Ingen milepæle tilføjet.</p>
              )}
              {(normalizedTarget.milestones ?? []).map((milestone, milestoneIndex) => (
                <Fragment key={`target-${index}-milestone-${milestoneIndex}`}>
                  <div className="ds-grid ds-grid-2">
                    <label className="ds-field">
                      <span>Label</span>
                      <input
                        className="ds-input"
                        value={milestone?.label ?? ''}
                        onChange={handleMilestoneChange(index, milestoneIndex, 'label')}
                      />
                    </label>
                    <label className="ds-field">
                      <span>År</span>
                      <input
                        className="ds-input"
                        type="number"
                        value={milestone?.dueYear ?? ''}
                        onChange={handleMilestoneChange(index, milestoneIndex, 'dueYear')}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="ds-button ds-button--ghost"
                    onClick={handleRemoveMilestone(index, milestoneIndex)}
                  >
                    Fjern milepæl
                  </button>
                </Fragment>
              ))}
            </div>
          </section>
        )})}
      </section>

      <section className="ds-stack">
        <div className="ds-stack-sm">
          <h3 className="ds-heading-sm">Planlagte handlinger</h3>
          <p className="ds-text-subtle">Registrér projekter og ansvarlige for at understøtte målopfyldelse.</p>
          <button type="button" className="ds-button" onClick={handleAddAction}>
            Tilføj handling
          </button>
        </div>
        {(currentTargets.actions ?? []).length === 0 && <p className="ds-text-muted">Ingen handlinger registreret.</p>}
        {(currentTargets.actions ?? []).map((action, index) => {
          const normalizedAction = ensureAction(action)
          return (
            <section key={`action-${index}`} className="ds-card ds-stack">
            <header className="ds-stack-sm">
              <h4 className="ds-heading-xs">Handling #{index + 1}</h4>
              <button type="button" className="ds-button ds-button--ghost" onClick={handleRemoveAction(index)}>
                Fjern handling
              </button>
            </header>
            <label className="ds-field">
              <span>Titel</span>
              <input
                className="ds-input"
                value={normalizedAction.title ?? ''}
                onChange={handleActionFieldChange(index, 'title')}
                placeholder="Fx Konvertering til varmepumpe"
              />
            </label>
            <label className="ds-field">
              <span>Beskrivelse</span>
              <textarea
                className="ds-textarea"
                value={normalizedAction.description ?? ''}
                onChange={handleActionFieldChange(index, 'description')}
                rows={2}
              />
            </label>
            <div className="ds-grid ds-grid-2">
              <label className="ds-field">
                <span>Ansvarlig</span>
                <input
                  className="ds-input"
                  value={normalizedAction.owner ?? ''}
                  onChange={handleActionFieldChange(index, 'owner')}
                  placeholder="Fx Facility manager"
                />
              </label>
              <label className="ds-field">
                <span>Deadline (ÅÅÅÅ-QX)</span>
                <input
                  className="ds-input"
                  value={normalizedAction.dueQuarter ?? ''}
                  onChange={handleActionFieldChange(index, 'dueQuarter')}
                  placeholder="2025-Q2"
                />
              </label>
            </div>
            <label className="ds-field">
              <span>Status</span>
              <select
                className="ds-input"
                value={normalizedAction.status ?? 'planned'}
                onChange={handleActionFieldChange(index, 'status')}
              >
                {ACTION_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </section>
        )})}
      </section>

      <section className="ds-summary ds-stack-sm">
        <h3 className="ds-heading-sm">Estimat</h3>
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
        {preview.plannedActions && preview.plannedActions.length > 0 && (
          <div className="ds-stack-sm">
            <strong>Planlagte handlinger</strong>
            <ul>
              {preview.plannedActions.map((action, index) => (
                <li key={index}>
                  {action.title ?? 'Handling'} – {action.status ?? 'ukendt'} ({action.dueQuarter ?? 'ukendt'})
                </li>
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
      </section>
    </form>
  )
}

function parseNumber(raw: string): number | null {
  const normalised = raw.replace(',', '.')
  const parsed = Number.parseFloat(normalised)
  return Number.isFinite(parsed) ? parsed : null
}

function parseInteger(raw: string): number | null {
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function parseNonNegativeNumber(raw: string): number | null {
  const parsed = parseNumber(raw)
  if (parsed == null) {
    return null
  }
  return parsed < 0 ? null : parsed
}

function clampPercent(value: number | null): number | null {
  if (value == null) {
    return null
  }
  if (value < 0) {
    return 0
  }
  if (value > 100) {
    return 100
  }
  return value
}
