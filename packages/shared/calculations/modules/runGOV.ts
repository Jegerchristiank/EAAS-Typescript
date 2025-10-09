/**
 * Modul til ESRS 2 GOV – governance og organisation.
 */
import type {
  GovInput,
  ModuleInput,
  ModuleResult,
  ModuleNarrative,
  ModuleNote,
  ModuleResponsibility,
} from '../../types'

const MINIMUM_DETAIL_LENGTH = 100

const ASSUMPTIONS = [
  'ESRS 2 GOV kræver dokumentation af ledelsens tilsyn, roller og incitamenter.',
  'Scoren beregnes som forholdet mellem udfyldte beskrivelser og registrerede governance-elementer.',
]

type NarrativeField = {
  key: keyof GovInput
  label: string
  warning: string
}

const narrativeFields: NarrativeField[] = [
  {
    key: 'oversightNarrative',
    label: 'Bestyrelsens tilsyn',
    warning: 'Beskriv bestyrelsens rolle i ESG-styring for ESRS 2 GOV.',
  },
  {
    key: 'managementNarrative',
    label: 'Direktionens roller',
    warning: 'Forklar hvordan direktionen driver ESG-dagsordenen.',
  },
  {
    key: 'competenceNarrative',
    label: 'ESG-kompetencer',
    warning: 'Dokumentér træning og kompetenceopbygning for ledelsen.',
  },
  {
    key: 'reportingNarrative',
    label: 'Rapporteringsproces',
    warning: 'Beskriv kontrolmiljø og rapporteringscyklus for ESG-data.',
  },
  {
    key: 'assuranceNarrative',
    label: 'Sikkerhed og assurance',
    warning: 'Angiv omfang af intern/ekstern assurance på ESG-rapporteringen.',
  },
  {
    key: 'incentiveNarrative',
    label: 'Incitamenter',
    warning: 'Forklar hvordan incitamentsstruktur knyttes til ESG-mål.',
  },
]

export function runGOV(input: ModuleInput): ModuleResult {
  const raw = (input.GOV ?? null) as GovInput | null
  const trace: string[] = []
  const warnings: string[] = []

  const narratives: ModuleNarrative[] = []
  const notes: ModuleNote[] = []
  const responsibilities: ModuleResponsibility[] = []

  let totalElements = 0
  let completedCount = 0

  narrativeFields.forEach(({ key, label, warning }) => {
    totalElements += 1
    const value = normaliseText(raw?.[key])
    trace.push(`${String(key)}Length=${value?.length ?? 0}`)

    if (!value) {
      warnings.push(warning)
      return
    }

    narratives.push({ label, content: value })
    completedCount += 1

    if (value.length < MINIMUM_DETAIL_LENGTH) {
      warnings.push(`Uddyb sektionen "${label}" for at opfylde ESRS 2 GOV.`)
    }
  })

  const bodies = Array.isArray(raw?.oversightBodies) ? raw?.oversightBodies : []
  bodies.forEach((entry, index) => {
    const body = normaliseText(entry?.body)
    const mandate = normaliseText(entry?.mandate)
    const chair = normaliseText(entry?.chair)
    const frequency = normaliseText(entry?.meetingFrequency)

    if (!body && !mandate && !chair && !frequency) {
      return
    }

    totalElements += 1
    trace.push(`oversight[${index}]=${body ?? 'ukendt'}`)

    const details = [mandate, frequency ? `Mødefrekvens: ${frequency}` : null].filter(Boolean)
    const hasDetail = details.length > 0

    if (hasDetail) {
      completedCount += 1
    } else {
      warnings.push(`Tilføj mandat eller mødefrekvens for governance-organ ${index + 1}.`)
    }

    notes.push({
      label: body ?? `Governance-organ ${index + 1}`,
      detail: details.join(' · ') || 'Ingen detaljer angivet.',
    })

    if (chair) {
      responsibilities.push({ subject: body ?? `Governance-organ ${index + 1}`, owner: chair, role: 'Formand' })
    }
  })

  const controls = Array.isArray(raw?.controlProcesses) ? raw?.controlProcesses : []
  controls.forEach((entry, index) => {
    const process = normaliseText(entry?.process)
    const description = normaliseText(entry?.description)
    const owner = normaliseText(entry?.owner)

    if (!process && !description && !owner) {
      return
    }

    totalElements += 1
    trace.push(`control[${index}]=${process ?? 'ukendt'}`)

    if (description) {
      completedCount += 1
    } else {
      warnings.push(`Kontrolproces ${index + 1} mangler beskrivelse.`)
    }

    notes.push({ label: process ?? `Kontrol ${index + 1}`, detail: description ?? 'Ingen detaljer angivet.' })

    if (owner) {
      responsibilities.push({ subject: process ?? `Kontrol ${index + 1}`, owner, role: 'Procesansvarlig' })
    }
  })

  const incentives = Array.isArray(raw?.incentiveStructures) ? raw?.incentiveStructures : []
  incentives.forEach((entry, index) => {
    const role = normaliseText(entry?.role)
    const incentive = normaliseText(entry?.incentive)
    const metric = normaliseText(entry?.metric)

    if (!role && !incentive && !metric) {
      return
    }

    totalElements += 1
    trace.push(`incentive[${index}]=${role ?? 'ukendt'}`)

    if (incentive) {
      completedCount += 1
    } else {
      warnings.push(`Incitament ${index + 1} mangler beskrivelse af kobling til ESG.`)
    }

    notes.push({
      label: role ?? `Incitament ${index + 1}`,
      detail: [incentive, metric ? `KPI: ${metric}` : null].filter(Boolean).join(' · ') || 'Ingen detaljer angivet.',
    })

    if (role && incentive) {
      responsibilities.push({ subject: role, owner: role, role: 'Incitament' })
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
    responsibilities,
  }
}

function normaliseText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}
