/**
 * Modul til ESRS 2 SBM – strategi og forretningsmodel.
 */
import type {
  ModuleInput,
  ModuleResult,
  SbmInput,
  ModuleNarrative,
  ModuleResponsibility,
  ModuleNote,
  ModuleTransitionMeasure,
} from '../../types'

const MINIMUM_DETAIL_LENGTH = 120

const ASSUMPTIONS = [
  'ESRS 2 SBM kræver beskrivelser af forretningsmodellen, værdikæden og klimaresiliens.',
  'Scoren beregnes som udfyldte tekstfelter og overgangstiltag i forhold til samlede felter.',
]

type NarrativeField = {
  key: keyof SbmInput
  label: string
  warning: string
}

const narrativeFields: NarrativeField[] = [
  {
    key: 'businessModelNarrative',
    label: 'Forretningsmodel',
    warning: 'Beskriv forretningsmodellen og centrale aktiviteter for ESRS 2 SBM.',
  },
  {
    key: 'valueChainNarrative',
    label: 'Værdikæde og afhængigheder',
    warning: 'Angiv hvordan væsentlige ressourcer og partnere påvirker bæredygtighedsprofilen.',
  },
  {
    key: 'sustainabilityStrategyNarrative',
    label: 'Strategisk integration af bæredygtighed',
    warning: 'Forklar hvordan bæredygtighed indgår i strategi og governance.',
  },
  {
    key: 'resilienceNarrative',
    label: 'Robusthed og scenarier',
    warning: 'Uddyb analyser af modstandsdygtighed over for klima- og overgangsrisici.',
  },
  {
    key: 'transitionPlanNarrative',
    label: 'Overgangsplan',
    warning: 'Angiv hvordan virksomheden planlægger at nå klimamål og overholde ESRS E1.',
  },
  {
    key: 'stakeholderNarrative',
    label: 'Interessentdialog',
    warning: 'Beskriv hvordan væsentlige interessenter inddrages i strategien.',
  },
]

export function runSBM(input: ModuleInput): ModuleResult {
  const raw = (input.SBM ?? null) as SbmInput | null
  const trace: string[] = []
  const warnings: string[] = []

  const narratives: ModuleNarrative[] = []
  const notes: ModuleNote[] = []
  const responsibilities: ModuleResponsibility[] = []

  let completedCount = 0
  let totalElements = 0

  narrativeFields.forEach(({ key, label, warning }) => {
    const value = normaliseText(raw?.[key])
    trace.push(`${String(key)}Length=${value?.length ?? 0}`)

    totalElements += 1

    if (!value) {
      warnings.push(warning)
      return
    }

    narratives.push({ label, content: value })
    completedCount += 1

    if (value.length < MINIMUM_DETAIL_LENGTH) {
      warnings.push(`Overvej at uddybe sektionen "${label}" for at opfylde ESRS-kravene.`)
    }
  })

  const dependencies = Array.isArray(raw?.dependencies) ? raw?.dependencies : []
  dependencies.forEach((entry, index) => {
    const dependency = normaliseText(entry?.dependency)
    const impact = normaliseText(entry?.impact)
    const mitigation = normaliseText(entry?.mitigation)
    const responsible = normaliseText(entry?.responsible)

    if (!dependency && !impact && !mitigation && !responsible) {
      return
    }

    totalElements += 1
    trace.push(`dependency[${index}]=${dependency ?? 'ukendt'}`)

    const detailParts = [impact, mitigation].filter(Boolean)
    const hasDetail = detailParts.length > 0

    if (hasDetail) {
      completedCount += 1
    } else {
      warnings.push(`Uddyb påvirkning eller afbødning for afhængighed ${index + 1}.`)
    }

    notes.push({
      label: dependency ?? `Afhængighed ${index + 1}`,
      detail: hasDetail ? detailParts.join(' · ') : 'Ingen detaljer angivet.',
    })

    if (responsible) {
      responsibilities.push({
        subject: dependency ?? `Afhængighed ${index + 1}`,
        owner: responsible,
        role: 'Ansvarlig for opfølgning',
      })
    }
  })

  const opportunities = Array.isArray(raw?.opportunities) ? raw?.opportunities : []
  opportunities.forEach((entry, index) => {
    const title = normaliseText(entry?.title) ?? `Mulighed ${index + 1}`
    const description = normaliseText(entry?.description)
    const timeframe = normaliseText(entry?.timeframe)
    const owner = normaliseText(entry?.owner)

    if (!description) {
      if (!title) {
        return
      }
      warnings.push(`Tilføj beskrivelse af mulighed "${title}" for at dokumentere vurderingen.`)
      totalElements += 1
      return
    }

    totalElements += 1
    narratives.push({ label: title, content: timeframe ? `${description} (Tidsramme: ${timeframe})` : description })
    completedCount += 1

    if (owner) {
      responsibilities.push({ subject: title, owner, role: 'Mulighedsansvarlig' })
    }
  })

  const transitionMeasures = Array.isArray(raw?.transitionPlanMeasures)
    ? raw!.transitionPlanMeasures
        .map((measure, index): ModuleTransitionMeasure | null => {
          const initiative = normaliseText(measure?.initiative)
          const description = normaliseText(measure?.description)
          const status = normaliseStatus(measure?.status)
          const milestoneYear = normaliseYear(measure?.milestoneYear)
          const investmentNeed = normaliseNumber(measure?.investmentNeedDkk)
          const responsible = normaliseText(measure?.responsible)

          if (!initiative && !description && status == null && milestoneYear == null && investmentNeed == null && !responsible) {
            return null
          }

          trace.push(`transition[${index}]=${initiative ?? 'ukendt'}`)
          totalElements += 1
          completedCount += 1

          if (responsible) {
            responsibilities.push({ subject: initiative ?? `Tiltag ${index + 1}`, owner: responsible, role: 'Overgangstiltag' })
          }

          notes.push({
            label: initiative ?? `Tiltag ${index + 1}`,
            detail: [
              status ? `Status: ${status}` : null,
              milestoneYear != null ? `Milepæl: ${milestoneYear}` : null,
              investmentNeed != null ? `Investering: ${investmentNeed} DKK` : null,
            ]
              .filter(Boolean)
              .join(' · '),
          })

          return {
            initiative,
            status,
            milestoneYear,
            investmentNeedDkk: investmentNeed,
            responsible,
            description,
          }
        })
        .filter((entry): entry is ModuleTransitionMeasure => entry !== null)
    : []

  const score = totalElements > 0 ? Math.round((completedCount / totalElements) * 100) : 0

  return {
    value: score,
    unit: 'score',
    assumptions: ASSUMPTIONS,
    trace,
    warnings,
    narratives,
    notes,
    responsibilities,
    transitionMeasures,
  }
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

function normaliseStatus(value: unknown): ModuleTransitionMeasure['status'] {
  if (value === 'planned' || value === 'inProgress' || value === 'lagging' || value === 'completed' || value === 'notStarted') {
    return value
  }
  return null
}
