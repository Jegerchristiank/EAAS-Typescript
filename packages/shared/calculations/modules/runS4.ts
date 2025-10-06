/**
 * Beregning for modul S4 – due diligence og menneskerettigheder.
 */
import type { ModuleInput, ModuleResult, S4Input } from '../../types'
import { factors } from '../factors'

const { s4 } = factors

type ProcessRow = NonNullable<S4Input['processes']>[number]

type NormalisedProcess = {
  index: number
  area: string
  coveragePercent: number | null
  lastAssessmentDate: string | null
  severityLevel: NonNullable<ProcessRow['severityLevel']> | null
  remediationPlan: string | null
}

const severityPenaltyMap: Record<NonNullable<ProcessRow['severityLevel']>, number> = {
  high: s4.highRiskPenalty,
  medium: s4.mediumRiskPenalty,
  low: 0
}

export function runS4(input: ModuleInput): ModuleResult {
  const raw = (input.S4 ?? null) as S4Input | null
  const processes = normaliseProcesses(raw?.processes)
  const trace: string[] = []
  const warnings: string[] = []
  const assumptions = [
    'Scoren kombinerer dækning af due diligence (60 %), håndtering af højrisiko-områder (20 %) og klage-/escalationsmekanisme (20 %).',
    'Højrisiko uden remediationsplan giver størst fradrag. Medium risiko giver mindre fradrag.'
  ]

  const coverageAverage = computeAverage(processes.map((process) => process.coveragePercent))
  if (coverageAverage == null) {
    warnings.push('Angiv dækningsgrad for due diligence-processer – CSRD kræver fuld oversigt over værdikæden.')
  } else {
    trace.push(`coverageAverage=${coverageAverage}`)
    if (coverageAverage < 70) {
      warnings.push('Due diligence dækker under 70 % af værdikæden. Dokumenter plan for fuld dækning.')
    }
  }

  const grievanceScore = resolveGrievanceScore(raw, warnings)

  const severityPenalty = processes.reduce((penalty, process) => {
    if (process.severityLevel == null) {
      warnings.push(`Vurder risikoniveau for "${process.area}" for at kunne dokumentere prioritering.`)
      return penalty
    }

    const basePenalty = severityPenaltyMap[process.severityLevel]
    const hasPlan = process.remediationPlan != null && process.remediationPlan.length > 0

    if (!hasPlan && basePenalty > 0) {
      warnings.push(`Højrisiko-området "${process.area}" mangler remediationsplan.`)
    }

    if (hasPlan && process.severityLevel === 'high') {
      trace.push(`remediation[${process.index}]=plan`)
    }

    return penalty + (hasPlan ? basePenalty / 2 : basePenalty)
  }, 0)

  trace.push(`severityPenalty=${severityPenalty.toFixed(2)}`)

  const coverageScore = normalisePercent(coverageAverage)
  const severityScore = Math.max(0, 1 - Math.min(1, severityPenalty))

  const totalScore = s4.coverageWeight * coverageScore + s4.severityWeight * severityScore + s4.grievanceWeight * grievanceScore
  const value = Number((Math.max(0, Math.min(totalScore, 1)) * 100).toFixed(s4.resultPrecision))

  if (processes.length === 0) {
    warnings.push('Ingen due diligence-processer registreret. Tilføj fx menneskerettigheder, leverandørstyring eller whistleblower.')
    trace.push('processes=0')
  }

  processes.forEach((process) => {
    trace.push(
      `process[${process.index}]=${encodeTrace(process.area)}|coverage=${process.coveragePercent ?? 'null'}|severity=${
        process.severityLevel ?? 'null'
      }`
    )
  })

  if (raw?.dueDiligenceNarrative == null || raw.dueDiligenceNarrative.trim().length < 40) {
    warnings.push('Tilføj en narrativ beskrivelse af due diligence-processerne for at opfylde ESRS S1/S4 disclosures.')
  }

  return {
    value,
    unit: s4.unit,
    assumptions,
    trace,
    warnings
  }
}

function normaliseProcesses(rows: S4Input['processes']): NormalisedProcess[] {
  if (!Array.isArray(rows)) {
    return []
  }

  return rows
    .map((row, index) => {
      const area = (row?.area ?? '').trim()
      if (area.length === 0) {
        return null
      }

      return {
        index,
        area,
        coveragePercent: clampPercent(row?.coveragePercent),
        lastAssessmentDate: row?.lastAssessmentDate == null ? null : row.lastAssessmentDate.trim() || null,
        severityLevel: row?.severityLevel ?? null,
        remediationPlan: row?.remediationPlan == null ? null : row.remediationPlan.trim() || null
      }
    })
    .filter((row): row is NormalisedProcess => row != null)
}

function computeAverage(values: Array<number | null>): number | null {
  const valid = values.filter((value): value is number => value != null && Number.isFinite(value))
  if (valid.length === 0) {
    return null
  }
  const sum = valid.reduce((acc, value) => acc + value, 0)
  return Number((sum / valid.length).toFixed(1))
}

function resolveGrievanceScore(raw: S4Input | null, warnings: string[]): number {
  if (raw?.grievanceMechanismInPlace == null) {
    warnings.push('Angiv om virksomheden har en klage- og henvendelsesmekanisme. ESRS kræver offentliggørelse.')
    return 0.3
  }

  if (raw.grievanceMechanismInPlace === false) {
    warnings.push('Ingen klage-/grievance-mekanisme markeret. Etabler en kanal for medarbejdere og leverandører.')
    return 0
  }

  if (raw.escalationTimeframeDays != null && raw.escalationTimeframeDays > 30) {
    warnings.push('Escalationstiden for klager er over 30 dage. Overvej hurtigere sagsbehandling.')
  }

  return 1
}

function clampPercent(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) {
    return null
  }
  return Math.max(0, Math.min(100, Number(value)))
}

function normalisePercent(value: number | null): number {
  if (value == null) {
    return 0
  }
  return Math.max(0, Math.min(1, value / 100))
}

function encodeTrace(value: string): string {
  return value.replaceAll('|', '/').replaceAll('\n', ' ')
}
