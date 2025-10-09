/**
 * Modul til ESRS 2 MR – metrics og targets.
 */
import type {
  ModuleInput,
  ModuleResult,
  MrInput,
  E1ContextInput,
  ModuleNarrative,
  ModuleNote,
  ModuleTransitionMeasure,
  ModuleFinancialEffect,
  ModuleRemovalProject,
} from '../../types'

const MINIMUM_DETAIL_LENGTH = 100

const ASSUMPTIONS = [
  'ESRS 2 MR opsamler nøgletal, finansielle effekter og overgangstiltag relateret til klimamål.',
  'Scoren beregnes ud fra udfyldte narrativer, metrics og tilknyttede planer.',
]

type NarrativeField = {
  key: keyof MrInput
  label: string
  warning: string
}

const narrativeFields: NarrativeField[] = [
  {
    key: 'intensityNarrative',
    label: 'Intensiteter og udvikling',
    warning: 'Beskriv udviklingen i intensiteter for ESRS 2 MR.',
  },
  {
    key: 'targetNarrative',
    label: 'Mål og status',
    warning: 'Forklar fremdrift på klimamål og væsentlige KPI’er.',
  },
  {
    key: 'dataQualityNarrative',
    label: 'Datakvalitet',
    warning: 'Dokumentér kvalitet og kontroller for nøgletal.',
  },
  {
    key: 'assuranceNarrative',
    label: 'Assurance',
    warning: 'Angiv scope for intern og ekstern assurance.',
  },
  {
    key: 'transitionPlanNarrative',
    label: 'Overgangsplan',
    warning: 'Beskriv hvordan overgangsplanen understøtter klimamål.',
  },
  {
    key: 'financialEffectNarrative',
    label: 'Finansielle effekter',
    warning: 'Opsummer finansielle konsekvenser af klimaindsatsen.',
  },
]

export function runMR(input: ModuleInput): ModuleResult {
  const mrRaw = (input.MR ?? null) as MrInput | null
  const context = (input.E1Context ?? null) as E1ContextInput | null

  const trace: string[] = []
  const warnings: string[] = []
  const narratives: ModuleNarrative[] = []
  const notes: ModuleNote[] = []

  let totalElements = 0
  let completedCount = 0

  narrativeFields.forEach(({ key, label, warning }) => {
    totalElements += 1
    const value = normaliseText(mrRaw?.[key])
    trace.push(`${String(key)}Length=${value?.length ?? 0}`)

    if (!value) {
      warnings.push(warning)
      return
    }

    narratives.push({ label, content: value })
    completedCount += 1

    if (value.length < MINIMUM_DETAIL_LENGTH) {
      warnings.push(`Uddyb beskrivelsen af "${label}" for at gøre rede for ESRS 2 MR.`)
    }
  })

  const extraNarratives = Array.isArray(mrRaw?.keyNarratives) ? mrRaw?.keyNarratives : []
  extraNarratives.forEach((entry, index) => {
    const title = normaliseText(entry?.title) ?? `Narrativ ${index + 1}`
    const content = normaliseText(entry?.content)
    if (!content) {
      warnings.push(`Narrativ ${index + 1} mangler indhold.`)
      return
    }
    narratives.push({ label: title, content })
    totalElements += 1
    completedCount += 1
  })

  const metrics = Array.isArray(mrRaw?.metrics) ? mrRaw?.metrics : []
  metrics.forEach((metric, index) => {
    const name = normaliseText(metric?.name) ?? `Metric ${index + 1}`
    const unit = normaliseText(metric?.unit)
    const baselineYear = normaliseYear(metric?.baselineYear)
    const baselineValue = normaliseNumber(metric?.baselineValue)
    const currentYear = normaliseYear(metric?.currentYear)
    const currentValue = normaliseNumber(metric?.currentValue)
    const targetYear = normaliseYear(metric?.targetYear)
    const targetValue = normaliseNumber(metric?.targetValue)
    const status = normaliseStatus(metric?.status)
    const owner = normaliseText(metric?.owner)
    const description = normaliseText(metric?.description)

    if (
      !name &&
      !unit &&
      baselineYear == null &&
      baselineValue == null &&
      currentYear == null &&
      currentValue == null &&
      targetYear == null &&
      targetValue == null &&
      status == null &&
      !owner &&
      !description
    ) {
      return
    }

    totalElements += 1
    trace.push(`metric[${index}]=${name}`)

    const hasData = currentValue != null || targetValue != null || description != null
    if (hasData) {
      completedCount += 1
    } else {
      warnings.push(`Tilføj aktuelle værdier eller mål for ${name}.`)
    }

    notes.push({
      label: name,
      detail: [
        baselineYear != null ? `Baseline ${baselineYear}: ${baselineValue ?? 'ukendt'} ${unit ?? ''}`.trim() : null,
        currentYear != null ? `Seneste ${currentYear}: ${currentValue ?? 'ukendt'} ${unit ?? ''}`.trim() : null,
        targetYear != null ? `Mål ${targetYear}: ${targetValue ?? 'ukendt'} ${unit ?? ''}`.trim() : null,
        status ? `Status: ${status}` : null,
        description,
      ]
        .filter(Boolean)
        .join(' · '),
    })

    if (owner) {
      notes.push({ label: `${name} – ansvarlig`, detail: owner })
    }
  })

  const transitionMeasures = combineTransitionMeasures(mrRaw, context, trace, warnings, (hasDetail) => {
    totalElements += 1
    if (hasDetail) {
      completedCount += 1
    }
  })

  const financialEffects = combineFinancialEffects(mrRaw, context, trace, warnings, (hasDetail) => {
    totalElements += 1
    if (hasDetail) {
      completedCount += 1
    }
  })

  const removalProjects = sanitiseRemovalProjects(context, trace, warnings, (hasDetail) => {
    totalElements += 1
    if (hasDetail) {
      completedCount += 1
    }
  })

  const score = totalElements > 0 ? Math.round((completedCount / totalElements) * 100) : 0

  return {
    value: score,
    unit: 'score',
    assumptions: ASSUMPTIONS,
    trace,
    warnings,
    narratives,
    notes,
    transitionMeasures,
    financialEffects,
    removalProjects,
  }
}

function combineTransitionMeasures(
  input: MrInput | null,
  context: E1ContextInput | null,
  trace: string[],
  warnings: string[],
  onItem: (hasDetail: boolean) => void,
): ModuleTransitionMeasure[] {
  const collected: ModuleTransitionMeasure[] = []

  const contextMeasures = Array.isArray(context?.transitionPlanMeasures) ? context!.transitionPlanMeasures : []
  contextMeasures.forEach((measure, index) => {
    const initiative = normaliseText(measure?.initiative)
    const description = normaliseText(measure?.description)
    const status = normaliseStatus(measure?.status)
    const milestoneYear = normaliseYear(measure?.milestoneYear)
    const investmentNeed = normaliseNumber(measure?.investmentNeedDkk)
    const responsible = normaliseText(measure?.responsible)

    if (!initiative && !description && status == null && milestoneYear == null && investmentNeed == null && !responsible) {
      return
    }

    trace.push(`transitionPlan[${index}]=${initiative ?? 'ukendt'}`)
    const hasDetail = description != null || status != null || milestoneYear != null || investmentNeed != null
    onItem(hasDetail)

    if (!hasDetail) {
      warnings.push(`Uddyb overgangstiltag ${index + 1} med status eller milepæl.`)
    }

    collected.push({
      initiative,
      description,
      status,
      milestoneYear,
      investmentNeedDkk: investmentNeed,
      responsible,
    })
  })

  if (collected.length === 0 && normaliseText(input?.transitionPlanNarrative)) {
    warnings.push('Overvej at registrere konkrete overgangstiltag under overgangsplanen.')
  }

  return collected
}

function combineFinancialEffects(
  input: MrInput | null,
  context: E1ContextInput | null,
  trace: string[],
  warnings: string[],
  onItem: (hasDetail: boolean) => void,
): ModuleFinancialEffect[] {
  const collected: ModuleFinancialEffect[] = []
  const sources = [
    ...(Array.isArray(context?.financialEffects) ? context!.financialEffects : []),
    ...(Array.isArray(input?.financialEffects) ? input!.financialEffects : []),
  ]

  sources.forEach((effect, index) => {
    const label = normaliseText(effect?.label) ?? `Finansiel effekt ${index + 1}`
    const type = normaliseFinancialType(effect?.type)
    const amount = normaliseNumber(effect?.amountDkk)
    const timeframe = normaliseText(effect?.timeframe)
    const description = normaliseText(effect?.description)

    if (!label && type == null && amount == null && !timeframe && !description) {
      return
    }

    trace.push(`financialEffect[${index}]=${label}`)
    const hasDetail = amount != null || description != null
    onItem(hasDetail)

    if (!hasDetail) {
      warnings.push(`Angiv beløb eller beskrivelse for ${label}.`)
    }

    collected.push({ label, type, amountDkk: amount, timeframe, description })
  })

  return collected
}

function sanitiseRemovalProjects(
  context: E1ContextInput | null,
  trace: string[],
  warnings: string[],
  onItem: (hasDetail: boolean) => void,
): ModuleRemovalProject[] {
  const projects = Array.isArray(context?.ghgRemovalProjects) ? context!.ghgRemovalProjects : []
  return projects
    .map((project, index) => {
      const rawName = normaliseText(project?.projectName)
      const projectName = rawName ?? `Removal projekt ${index + 1}`
      const removalType = normaliseRemovalType(project?.removalType)
      const annualRemovalTonnes = normaliseNumber(project?.annualRemovalTonnes)
      const storageDescription = normaliseText(project?.storageDescription)
      const qualityStandard = normaliseText(project?.qualityStandard)
      const permanenceYears = normaliseNumber(project?.permanenceYears)
      const financedThroughCredits = normaliseBoolean(project?.financedThroughCredits)
      const responsible = normaliseText(project?.responsible)

      if (
        !rawName &&
        removalType == null &&
        annualRemovalTonnes == null &&
        !storageDescription &&
        !qualityStandard &&
        permanenceYears == null &&
        financedThroughCredits == null &&
        !responsible
      ) {
        return null
      }

      trace.push(`removalProject[${index}]=${projectName}`)
      const hasDetail = annualRemovalTonnes != null || storageDescription != null || qualityStandard != null
      onItem(hasDetail)

      if (!hasDetail) {
        warnings.push(`Tilføj kvantificerede data for removal-projekt ${index + 1}.`)
      }

      return {
        projectName,
        removalType,
        annualRemovalTonnes,
        storageDescription,
        qualityStandard,
        permanenceYears,
        financedThroughCredits,
        responsible,
      } as ModuleRemovalProject
    })
    .filter((entry): entry is ModuleRemovalProject => entry !== null)
}

function normaliseText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normaliseYear(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }
  if (value < 1990 || value > 2100) {
    return null
  }
  return Math.trunc(value)
}

function normaliseNumber(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }
  return value
}

function normaliseBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value
  }
  return null
}

function normaliseStatus(value: unknown): ModuleTransitionMeasure['status'] {
  if (value === 'planned' || value === 'inProgress' || value === 'lagging' || value === 'completed' || value === 'notStarted') {
    return value
  }
  return null
}

function normaliseFinancialType(value: unknown): ModuleFinancialEffect['type'] {
  if (value === 'capex' || value === 'opex' || value === 'revenues' || value === 'costs' || value === 'impairments' || value === 'other') {
    return value
  }
  return null
}

function normaliseRemovalType(value: unknown): ModuleRemovalProject['removalType'] {
  if (value === 'inHouse' || value === 'valueChain' || value === 'carbonCredits' || value === 'other') {
    return value
  }
  return null
}
