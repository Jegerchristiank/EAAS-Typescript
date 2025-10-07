/**
 * Beregning for modul S2 – værdikædearbejdere og arbejdsforhold.
 */
import type { ModuleInput, ModuleResult, S2Input } from '../../types'
import { factors } from '../factors'

const { s2 } = factors

type IncidentRow = NonNullable<S2Input['incidents']>[number]

type NormalisedIssueType = NonNullable<IncidentRow['issueType']> | null
type NormalisedIncident = {
  index: number
  supplier: string | null
  country: string | null
  issueType: NormalisedIssueType
  workersAffected: number | null
  severityLevel: NormalisedSeverity
  remediationStatus: NormalisedStatus
  description: string | null
}

type NormalisedSeverity = NonNullable<IncidentRow['severityLevel']> | null
type NormalisedStatus = NonNullable<IncidentRow['remediationStatus']> | null

type PercentLike = number | null | undefined

export function runS2(input: ModuleInput): ModuleResult {
  const raw = (input.S2 ?? null) as S2Input | null
  const incidents = normaliseIncidents(raw?.incidents)
  const trace: string[] = []
  const warnings: string[] = []
  const assumptions = [
    'Scoren vægter værdikædedækning (35 %), arbejdstagerbeskyttelse (25 %), audits (15 %) og klagemekanismer (15 %).',
    'Alvorlige hændelser reducerer score afhængigt af antal berørte arbejdstagere og status på remediering.'
  ]

  const coverageScore = resolveCoverageScore(raw, trace, warnings)
  const protectionScore = resolveProtectionScore(raw, warnings, trace)
  const auditScore = resolveAuditScore(raw, warnings, trace)
  const mechanismScore = resolveMechanismScore(raw, warnings)
  const incidentPenalty = computeIncidentPenalty(raw, incidents, trace, warnings)
  const grievancePenalty = computeGrievancePenalty(raw, trace, warnings)

  const baseScore =
    s2.coverageWeight * coverageScore +
    s2.protectionWeight * protectionScore +
    s2.auditWeight * auditScore +
    s2.grievanceWeight * mechanismScore

  const penalty = s2.incidentWeight * Math.min(1, incidentPenalty + grievancePenalty)
  const value = Number((Math.max(0, Math.min(1, baseScore - penalty)) * 100).toFixed(s2.resultPrecision))

  if (incidents.length === 0) {
    trace.push('incidents=0')
    if ((raw?.workersAtRiskCount ?? 0) > 0) {
      warnings.push('Ingen hændelser registreret, men der er angivet risikofyldte arbejdstagere. Verificér screeningen.')
    }
  }

  if (raw?.socialDialogueNarrative == null || raw.socialDialogueNarrative.trim().length < 40) {
    warnings.push('Tilføj narrativ om dialog og træning af leverandørarbejdere (ESRS S2 §21-23).')
  }

  if (raw?.remediationNarrative == null || raw.remediationNarrative.trim().length < 40) {
    warnings.push('Tilføj narrativ om afhjælpning og kompensation til leverandørarbejdere (ESRS S2 §28).')
  }

  return {
    value,
    unit: s2.unit,
    assumptions,
    trace,
    warnings
  }
}

function resolveCoverageScore(raw: S2Input | null, trace: string[], warnings: string[]): number {
  const percent = clampPercent(raw?.valueChainCoveragePercent)
  if (percent == null) {
    warnings.push('Angiv værdikædedækning i procent – feltet er nødvendigt for ESRS S2 datapunkt S2-2.2.')
    return 0
  }

  trace.push(`valueChainCoveragePercent=${percent}`)
  if (percent < s2.coverageWarningThresholdPercent) {
    warnings.push(
      `Værdikædedækningen er ${percent}% – gennemfør flere risikovurderinger for højere compliance (mål ≥ ${s2.coverageWarningThresholdPercent}%).`
    )
  }
  return normalisePercent(percent)
}

function resolveProtectionScore(raw: S2Input | null, warnings: string[], trace: string[]): number {
  const livingWage = clampPercent(raw?.livingWageCoveragePercent)
  const bargaining = clampPercent(raw?.collectiveBargainingCoveragePercent)
  const values: number[] = []

  if (livingWage != null) {
    trace.push(`livingWageCoveragePercent=${livingWage}`)
    if (livingWage < s2.livingWageWarningThresholdPercent) {
      warnings.push(
        `Kun ${livingWage}% af værdikædearbejderne er dækket af leve-/mindsteløn. Forbedr lønkrav i kontrakter (ESRS S2 datapunkt S2-5).`
      )
    }
    values.push(normalisePercent(livingWage))
  } else {
    warnings.push('Angiv andelen af værdikædearbejdere med leve- eller mindsteløn.')
  }

  if (bargaining != null) {
    trace.push(`collectiveBargainingCoveragePercent=${bargaining}`)
    if (bargaining < s2.bargainingWarningThresholdPercent) {
      warnings.push(
        `Andelen med kollektive aftaler eller repræsentation er ${bargaining}% – styrk organisationsfriheden (ESRS S2 datapunkt S2-5).`
      )
    }
    values.push(normalisePercent(bargaining))
  } else {
    warnings.push('Angiv dækning af kollektive aftaler og organisationsfrihed for leverandørarbejdere.')
  }

  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function resolveAuditScore(raw: S2Input | null, warnings: string[], trace: string[]): number {
  const percent = clampPercent(raw?.socialAuditsCompletedPercent)
  if (percent == null) {
    warnings.push('Angiv hvor stor en andel af planlagte sociale audits der er gennemført (ESRS S2 datapunkt S2-2.3).')
    return 0
  }

  trace.push(`socialAuditsCompletedPercent=${percent}`)
  if (percent < s2.auditWarningThresholdPercent) {
    warnings.push(`Kun ${percent}% af sociale audits er gennemført. Øg auditfrekvensen for højrisikoleverandører.`)
  }

  return normalisePercent(percent)
}

function resolveMechanismScore(raw: S2Input | null, warnings: string[]): number {
  if (raw?.grievanceMechanismForWorkers == null) {
    warnings.push('Angiv om leverandørarbejdere har adgang til klagemekanismer (ESRS S2 datapunkt S2-5).')
    return s2.mechanismUnknownScore
  }

  if (raw.grievanceMechanismForWorkers === false) {
    warnings.push('Ingen klagemekanisme for leverandørarbejdere. Etabler hotline eller samarbejde med fagforeninger.')
    return 0
  }

  return 1
}

function computeIncidentPenalty(
  raw: S2Input | null,
  incidents: NormalisedIncident[],
  trace: string[],
  warnings: string[]
): number {
  const totalWorkers = raw?.valueChainWorkersCount ?? null
  let penalty = 0

  incidents.forEach((incident) => {
    const severity = incident.severityLevel ?? 'medium'
    const severityWeight = s2.severityWeights[severity]
    const statusMultiplier = resolveStatusMultiplier(incident.remediationStatus)
    const ratio = resolveIncidentScale(incident.workersAffected, totalWorkers, s2.defaultIncidentScale)

    penalty += severityWeight * statusMultiplier * ratio

    if (incident.severityLevel === 'high' && incident.remediationStatus !== 'completed') {
      warnings.push(
        `Højrisiko-hændelsen "${formatLabel(incident.supplier ?? incident.country ?? 'Ukendt')}" er ikke fuldt afhjulpet.`
      )
    }

    if (incident.remediationStatus == null) {
      warnings.push(`Angiv remedieringsstatus for hændelsen på ${formatLabel(incident.supplier ?? 'leverandør')}.`)
    }

    if (incident.workersAffected != null && totalWorkers != null && totalWorkers > 0) {
      const share = (incident.workersAffected / totalWorkers) * 100
      if (share >= 10) {
        warnings.push(
          `${incident.workersAffected} arbejdstagere påvirket hos ${formatLabel(incident.supplier ?? 'leverandør')} – dokumentér kompensation og opfølgning.`
        )
      }
      trace.push(`incidentShare[${incident.index}]=${share.toFixed(1)}`)
    }

    trace.push(
      `incident[${incident.index}]=${formatLabel(incident.supplier ?? incident.country ?? 'ukendt')}|type=${
        incident.issueType ?? 'null'
      }|severity=${incident.severityLevel ?? 'null'}|status=${incident.remediationStatus ?? 'null'}|workers=${
        incident.workersAffected ?? 'null'
      }`
    )
  })

  return penalty
}

function computeGrievancePenalty(raw: S2Input | null, trace: string[], warnings: string[]): number {
  const open = clampCount(raw?.grievancesOpenCount)
  if (open == null) {
    return 0
  }

  trace.push(`grievancesOpenCount=${open}`)
  if (open > 0) {
    warnings.push(`${open} klager fra leverandørarbejdere er åbne. Følg op og luk dem for at undgå ESRS S2 advarsler.`)
  }

  return open * s2.openGrievancePenaltyPerCase
}

function normaliseIncidents(rows: S2Input['incidents']): NormalisedIncident[] {
  if (!Array.isArray(rows)) {
    return []
  }

  return rows
    .map((row, index) => {
      if (row == null) {
        return null
      }

      return {
        index,
        supplier: row.supplier == null ? null : row.supplier.trim() || null,
        country: row.country == null ? null : row.country.trim() || null,
        issueType: row.issueType ?? null,
        workersAffected: clampCount(row.workersAffected),
        severityLevel: row.severityLevel ?? null,
        remediationStatus: row.remediationStatus ?? null,
        description: row.description == null ? null : row.description.trim() || null
      }
    })
    .filter((row): row is NormalisedIncident => row != null)
}

function resolveStatusMultiplier(status: NormalisedStatus): number {
  if (status === 'completed') {
    return s2.resolvedMitigation
  }
  if (status === 'inProgress') {
    return s2.inProgressMitigation
  }
  return 1
}

function resolveIncidentScale(
  workersAffected: number | null,
  totalWorkers: number | null,
  fallback: number
): number {
  if (workersAffected != null) {
    if (totalWorkers != null && totalWorkers > 0) {
      return Math.min(1, workersAffected / totalWorkers)
    }
    return Math.min(1, workersAffected / 500)
  }

  if (totalWorkers != null && totalWorkers > 0) {
    return Math.min(1, fallback * Math.max(1, totalWorkers / 500))
  }

  return fallback
}

function normalisePercent(value: PercentLike): number {
  if (value == null || Number.isNaN(Number(value))) {
    return 0
  }
  return Math.max(0, Math.min(1, Number(value) / 100))
}

function clampPercent(value: PercentLike): number | null {
  if (value == null || Number.isNaN(Number(value))) {
    return null
  }
  const numeric = Number(value)
  return Math.max(0, Math.min(100, numeric))
}

function clampCount(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(Number(value))) {
    return null
  }
  const numeric = Math.max(0, Math.floor(Number(value)))
  return Number.isFinite(numeric) ? numeric : null
}

function formatLabel(label: string): string {
  return label.replaceAll('|', '/').replaceAll('\n', ' ').trim()
}
