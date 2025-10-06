/**
 * Beregning for modul S3 – arbejdsmiljø og hændelser.
 */
import type { ModuleInput, ModuleResult, S3Input } from '../../types'
import { factors } from '../factors'

const { s3 } = factors

type IncidentRow = NonNullable<S3Input['incidents']>[number]

type NormalisedIncident = {
  index: number
  type: NonNullable<IncidentRow['incidentType']>
  count: number
  ratePerMillionHours: number | null
  description: string | null
  rootCauseClosed: boolean | null
}

const severityWeights: Record<NormalisedIncident['type'], number> = {
  fatality: s3.fatalityPenalty,
  lostTime: s3.lostTimePenalty,
  recordable: s3.recordablePenalty,
  nearMiss: -s3.nearMissCredit
}

export function runS3(input: ModuleInput): ModuleResult {
  const raw = (input.S3 ?? null) as S3Input | null
  const incidents = normaliseIncidents(raw?.incidents)
  const trace: string[] = []
  const warnings: string[] = []
  const assumptions = [
    'Scoren starter ved 100 og reduceres efter vægtede hændelser (fatalitet 45, lost time 18, recordable 8).',
    'Near-miss rapportering giver et mindre plus (2 point) da proaktiv rapportering understøtter forebyggelse.',
    'Baseline eksponering er millioner arbejdstimer; målet er max 3 vægtede hændelser pr. million timer.'
  ]

  const hoursWorked = resolveNumber(raw?.totalHoursWorked)
  if (hoursWorked != null) {
    trace.push(`hoursWorked=${hoursWorked}`)
  }

  if (raw?.safetyCertification === true) {
    assumptions.push('ISO 45001 eller tilsvarende certificering udløser +10 bonuspoint.')
  } else if (raw?.safetyCertification === false) {
    warnings.push('Ingen arbejdsmiljøcertificering markeret. Overvej ISO 45001 eller tilsvarende.')
  } else {
    warnings.push('Angiv om der er arbejdsmiljøcertificering – bruges som CSRD-kvalitetsindikator.')
  }

  if (incidents.length === 0) {
    warnings.push('Ingen hændelser registreret. Bekræft at nul hændelser er korrekt, og angiv observationer hvis muligt.')
    trace.push('incidents=0')
  }

  let weightedPenalty = 0

  incidents.forEach((incident) => {
    const weight = severityWeights[incident.type]
    const contribution = incident.count * weight
    weightedPenalty += contribution

    if (incident.type === 'fatality' && incident.count > 0) {
      warnings.push('Fataliteter registreret – CSRD kræver detaljeret redegørelse og handlingsplan.')
    }

    if (incident.type !== 'nearMiss' && incident.rootCauseClosed === false) {
      warnings.push(
        `Hændelsen "${incident.type}" (index ${incident.index + 1}) mangler lukket rodårsagsanalyser. Følg op med corrective actions.`
      )
    }

    if (incident.ratePerMillionHours != null) {
      trace.push(`rate[${incident.index}]=${incident.ratePerMillionHours}`)
      if (incident.ratePerMillionHours > s3.baselineTargetRate * 2) {
        warnings.push(
          `Hændelsesraten for ${incident.type} (${incident.ratePerMillionHours} pr. mio. timer) overstiger ESRS-retningslinjerne.`
        )
      }
    }

    trace.push(
      `incident[${incident.index}]=${incident.type}|count=${incident.count}|rootCause=${incident.rootCauseClosed}`
    )
  })

  const exposure = Math.max(
    1,
    hoursWorked == null || hoursWorked <= 0 ? 1 : hoursWorked / s3.baselineHoursDivisor
  )
  const severityIndex = weightedPenalty / exposure
  trace.push(`weightedPenalty=${weightedPenalty.toFixed(2)}`)
  trace.push(`severityIndex=${severityIndex.toFixed(2)}`)

  const severityScore = Math.max(0, 1 - severityIndex / s3.ratePenaltyMultiplier)
  let value = severityScore * 100

  if (raw?.safetyCertification === true) {
    value += s3.certificationBonus
  }

  value = Number(Math.max(0, Math.min(100, value)).toFixed(s3.resultPrecision))

  return {
    value,
    unit: s3.unit,
    assumptions,
    trace,
    warnings
  }
}

function normaliseIncidents(rows: S3Input['incidents']): NormalisedIncident[] {
  if (!Array.isArray(rows)) {
    return []
  }

  return rows
    .map((row, index) => {
      const type = row?.incidentType
      const count = resolveNumber(row?.count) ?? 0
      if (type == null || count < 0) {
        return null
      }
      return {
        index,
        type,
        count,
        ratePerMillionHours: resolveNumber(row?.ratePerMillionHours),
        description: row?.description == null ? null : row.description.trim() || null,
        rootCauseClosed: row?.rootCauseClosed ?? null
      }
    })
    .filter((row): row is NormalisedIncident => row != null)
}

function resolveNumber(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) {
    return null
  }
  return Number(value)
}
