/**
 * Modul til at opsamle klimamål (ESRS E1) og planlagte handlinger.
 */
import type {
  E1ActionStatus,
  E1ActionLine,
  E1TargetLine,
  E1TargetMilestone,
  E1TargetScope,
  E1TargetStatus,
  E1TargetsInput,
  ModuleActionItem,
  ModuleEsrsFact,
  ModuleEsrsTable,
  ModuleInput,
  ModuleResult,
  ModuleTargetSummary,
} from '../../types'

const VALID_TARGET_SCOPE: ReadonlyArray<E1TargetScope> = ['scope1', 'scope2', 'scope3', 'combined']
const VALID_TARGET_STATUS: ReadonlyArray<E1TargetStatus> = ['onTrack', 'lagging', 'atRisk']
const VALID_ACTION_STATUS: ReadonlyArray<E1ActionStatus> = ['planned', 'inProgress', 'delayed', 'completed']

export function runE1Targets(input: ModuleInput): ModuleResult {
  const raw = ((input.E1Targets ?? {}) as E1TargetsInput) || {}
  const assumptions = [
    'Målene anvendes til at vurdere ESRS E1-krav for reduktion og energistyring.',
    'Status beregnes ud fra angivet baseline, mål og subjektiv status, hvis tilgængelig.',
  ]
  const warnings: string[] = []
  const trace: string[] = []

  const targets = Array.isArray(raw.targets) ? raw.targets : []
  const actions = Array.isArray(raw.actions) ? raw.actions : []

  const sanitisedTargets = targets
    .map((target, index) => normaliseTarget(target, index, warnings, trace))
    .filter((target): target is ModuleTargetSummary => target !== null)

  const sanitisedActions = actions
    .map((action, index) => normaliseAction(action, index, warnings, trace))
    .filter((action): action is ModuleActionItem => action !== null)

  const value = sanitisedTargets.length
  const onTrackCount = sanitisedTargets.filter((target) => target.status === 'onTrack').length
  const laggingCount = sanitisedTargets.filter((target) => target.status === 'lagging').length
  const atRiskCount = sanitisedTargets.filter((target) => target.status === 'atRisk').length

  trace.push(`targets.count=${value}`)
  trace.push(`targets.onTrack=${onTrackCount}`)
  trace.push(`targets.lagging=${laggingCount}`)
  trace.push(`targets.atRisk=${atRiskCount}`)
  trace.push(`actions.count=${sanitisedActions.length}`)

  const narratives = [
    ...sanitisedTargets
      .map((target) => {
        if (!target.description) {
          return null
        }
        return {
          label: target.name,
          content: target.description,
        }
      })
      .filter((entry): entry is { label: string; content: string } => entry !== null),
    ...sanitisedActions
      .map((action) => {
        if (!action.description) {
          return null
        }
        return {
          label: action.title ?? 'Handling',
          content: action.description,
        }
      })
      .filter((entry): entry is { label: string; content: string } => entry !== null),
  ]

  const responsibilities = [
    ...sanitisedTargets
      .map((target) => {
        if (!target.owner) {
          return null
        }
        return {
          subject: target.name,
          owner: target.owner,
          role: `Mål (${target.scope})`,
        }
      })
      .filter((entry): entry is { subject: string; owner: string; role: string } => entry !== null),
    ...sanitisedActions
      .map((action) => {
        if (!action.owner) {
          return null
        }
        return {
          subject: action.title ?? 'Handling',
          owner: action.owner,
          role: 'Klimahandling',
        }
      })
      .filter((entry): entry is { subject: string; owner: string; role: string } => entry !== null),
  ]

  const notes = [
    ...sanitisedTargets.map((target) => ({
      label: `${target.name} (${target.scope})`,
      detail: `Baseline ${target.baselineYear ?? 'n/a'}: ${target.baselineValueTonnes ?? 'n/a'} t · Mål ${
        target.targetYear ?? 'n/a'
      }: ${target.targetValueTonnes ?? 'n/a'} t · Status: ${target.status ?? 'ukendt'}`,
    })),
    ...sanitisedActions.map((action, index) => ({
      label: action.title ?? `Handling ${index + 1}`,
      detail: `Deadline: ${action.dueQuarter ?? 'ukendt'} · Status: ${action.status ?? 'ukendt'}`,
    })),
  ]

  const esrsFacts: ModuleEsrsFact[] = [
    { conceptKey: 'E1TargetsPresent', value: sanitisedTargets.length > 0 },
  ]

  const targetNarrativeLines = [
    ...sanitisedTargets.map((target) => describeTarget(target)).filter((line): line is string => line !== null),
    ...sanitisedActions.map((action) => describeAction(action)).filter((line): line is string => line !== null),
  ]
  if (targetNarrativeLines.length > 0) {
    esrsFacts.push({ conceptKey: 'E1TargetsNarrative', value: targetNarrativeLines.join('\n') })
  }

  const esrsTables: ModuleEsrsTable[] = sanitisedTargets.length
    ? [
        {
          conceptKey: 'E1TargetsTable',
          rows: sanitisedTargets.map((target) => ({
            scope: target.scope,
            name: target.name,
            targetYear: target.targetYear ?? null,
            targetValueTonnes: target.targetValueTonnes ?? null,
            baselineYear: target.baselineYear ?? null,
            baselineValueTonnes: target.baselineValueTonnes ?? null,
            owner: target.owner ?? null,
            status: target.status ?? null,
            description: target.description ?? null,
            milestones: formatMilestoneSummary(target.milestones),
          })),
        },
      ]
    : []

  return {
    value,
    unit: 'mål',
    assumptions,
    trace,
    warnings,
    targetsOverview: sanitisedTargets,
    plannedActions: sanitisedActions,
    narratives,
    responsibilities,
    notes,
    ...(esrsFacts.length ? { esrsFacts } : {}),
    ...(esrsTables.length ? { esrsTables } : {}),
  }
}

function describeTarget(target: ModuleTargetSummary): string | null {
  const segments: string[] = []
  segments.push(`${target.name} (${target.scope})`)

  if (target.targetValueTonnes != null && target.targetYear != null) {
    segments.push(`mål ${target.targetValueTonnes} t i ${target.targetYear}`)
  }
  if (target.baselineValueTonnes != null && target.baselineYear != null) {
    segments.push(`baseline ${target.baselineValueTonnes} t i ${target.baselineYear}`)
  }
  if (target.status) {
    segments.push(`status: ${target.status}`)
  }
  if (target.description) {
    segments.push(target.description)
  }

  const line = segments.join(' – ').trim()
  return line.length > 0 ? line : null
}

function describeAction(action: ModuleActionItem): string | null {
  const segments: string[] = []
  const title = action.title ?? 'Handling'
  segments.push(title)

  if (action.status) {
    segments.push(`status: ${action.status}`)
  }
  if (action.dueQuarter) {
    segments.push(`deadline ${action.dueQuarter}`)
  }
  if (action.description) {
    segments.push(action.description)
  }

  const line = segments.join(' – ').trim()
  return line.length > 0 ? line : null
}

function formatMilestoneSummary(milestones: ModuleTargetSummary['milestones']): string | null {
  if (!Array.isArray(milestones) || milestones.length === 0) {
    return null
  }

  const parts = milestones
    .map((milestone) => {
      const label = milestone.label?.trim() ?? ''
      const year = milestone.dueYear != null ? String(milestone.dueYear) : ''

      if (!label && !year) {
        return null
      }

      if (label && year) {
        return `${label} (${year})`
      }

      return label || year
    })
    .filter((value): value is string => value != null && value.trim().length > 0)

  if (parts.length === 0) {
    return null
  }

  return parts.join('; ')
}

function normaliseTarget(
  target: E1TargetLine | undefined,
  index: number,
  warnings: string[],
  trace: string[],
): ModuleTargetSummary | null {
  if (!target) {
    return null
  }

  const fallbackScope: E1TargetScope = 'combined'
  const scope: E1TargetScope = isTargetScope(target.scope) ? target.scope : fallbackScope
  if (!isTargetScope(target.scope)) {
    warnings.push(`Ukendt scope på mål ${index + 1}. Standard (${fallbackScope}) anvendes.`)
  }

  const name = trimString(target.name) ?? `Mål ${index + 1}`
  const id = `${scope}-${index + 1}`
  const owner = trimString(target.owner)
  const description = trimString(target.description)
  const targetYear = toBoundedNumber(target.targetYear, 2000, 2100)
  const targetValueTonnes = toNonNegativeNumber(target.targetValueTonnes)
  const baselineYear = toBoundedNumber(target.baselineYear, 1990, 2100)
  const baselineValueTonnes = toNonNegativeNumber(target.baselineValueTonnes)

  const status: E1TargetStatus | null = isTargetStatus(target.status) ? target.status : null
  if (!status && target.status != null) {
    warnings.push(`Status på mål ${index + 1} er ugyldig og ignoreres.`)
  }

  const milestones = Array.isArray(target.milestones)
    ? target.milestones.map((milestone: E1TargetMilestone | null | undefined) => ({
        label: trimString(milestone?.label) ?? null,
        dueYear: toBoundedNumber(milestone?.dueYear, 2000, 2100),
      }))
    : []

  trace.push(`target[${index}].scope=${scope}`)
  trace.push(`target[${index}].id=${id}`)
  if (targetYear != null) {
    trace.push(`target[${index}].targetYear=${targetYear}`)
  }
  if (targetValueTonnes != null) {
    trace.push(`target[${index}].targetValueTonnes=${targetValueTonnes}`)
  }

  return {
    id,
    name,
    scope,
    targetYear,
    targetValueTonnes,
    baselineYear,
    baselineValueTonnes,
    owner,
    status,
    description,
    milestones,
  }
}

function normaliseAction(
  action: E1ActionLine | undefined,
  index: number,
  warnings: string[],
  trace: string[],
): ModuleActionItem | null {
  if (!action) {
    return null
  }

  const title = trimString(action.title)
  const description = trimString(action.description)
  const owner = trimString(action.owner)
  const dueQuarter = validateQuarter(action.dueQuarter)
  if (dueQuarter == null && action.dueQuarter) {
    warnings.push(`Due-date på handling ${index + 1} bruger ikke formatet ÅÅÅÅ-QX og ignoreres.`)
  }

  const status: E1ActionStatus | null = isActionStatus(action.status) ? action.status : null
  if (!status && action.status != null) {
    warnings.push(`Status på handling ${index + 1} er ugyldig og ignoreres.`)
  }

  if (!title && !description) {
    return null
  }

  trace.push(`action[${index}].status=${status ?? 'ukendt'}`)

  return {
    title,
    description,
    owner,
    dueQuarter,
    status,
  }
}

function isTargetScope(value: unknown): value is E1TargetScope {
  return typeof value === 'string' && VALID_TARGET_SCOPE.includes(value as E1TargetScope)
}

function isTargetStatus(value: unknown): value is E1TargetStatus {
  return typeof value === 'string' && VALID_TARGET_STATUS.includes(value as E1TargetStatus)
}

function isActionStatus(value: unknown): value is E1ActionStatus {
  return typeof value === 'string' && VALID_ACTION_STATUS.includes(value as E1ActionStatus)
}

function trimString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toNonNegativeNumber(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }
  if (value < 0) {
    return null
  }
  return value
}

function toBoundedNumber(value: unknown, min: number, max: number): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }
  if (value < min || value > max) {
    return null
  }
  return value
}

function validateQuarter(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  const match = value.trim().match(/^(\d{4})-Q([1-4])$/)
  if (!match) {
    return null
  }
  return `${match[1]}-Q${match[2]}`
}
