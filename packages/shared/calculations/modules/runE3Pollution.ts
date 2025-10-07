/**
 * Beregning for modul E3 – emissioner til luft, vand og jord.
 */
import type { E3PollutionInput, ModuleInput, ModuleResult } from '../../types'
import { factors } from '../factors'

const { e3Pollution } = factors

type MediumKey = 'air' | 'water' | 'soil'

type MediumConfig = {
  key: MediumKey
  label: string
  quantity: number
  limit: number
}

const mediumLabels: Record<MediumKey, string> = {
  air: 'Luft',
  water: 'Vand',
  soil: 'Jord',
}

export function runE3Pollution(input: ModuleInput): ModuleResult {
  const raw = (input.E3Pollution ?? null) as E3PollutionInput | null

  const warnings: string[] = []
  const assumptions = [
    'Overholdelsesscoren starter på 100 og reduceres med 0,9 point pr. procent overskridelse af myndighedsgrænser.',
    'Hver rapporterbar hændelse reducerer scoringen med 7 point.',
    'Standardgrænser anvendes, hvis ingen grænseværdi er angivet: luft 50 t, vand 20 t og jord 5 t.',
  ]
  const trace: string[] = []

  const mediums: MediumConfig[] = [
    {
      key: 'air',
      label: mediumLabels.air,
      quantity: normaliseMass(raw?.airEmissionsTonnes),
      limit: resolveLimit(raw?.airEmissionLimitTonnes, 'air', warnings),
    },
    {
      key: 'water',
      label: mediumLabels.water,
      quantity: normaliseMass(raw?.waterDischargesTonnes),
      limit: resolveLimit(raw?.waterDischargeLimitTonnes, 'water', warnings),
    },
    {
      key: 'soil',
      label: mediumLabels.soil,
      quantity: normaliseMass(raw?.soilEmissionsTonnes),
      limit: resolveLimit(raw?.soilEmissionLimitTonnes, 'soil', warnings),
    },
  ]

  const incidents = normaliseCount(raw?.reportableIncidents)
  const dataQualityPercent = clampPercent(raw?.documentationQualityPercent, 100)

  let totalExceedPercent = 0

  mediums.forEach((medium) => {
    const { key, label, quantity, limit } = medium

    const exceedPercent = limit === 0 ? 0 : Math.max(0, ((quantity - limit) / limit) * 100)
    const exceedPercentRounded = Number(exceedPercent.toFixed(2))
    totalExceedPercent += exceedPercent

    if (exceedPercent > 0) {
      warnings.push(
        `${label}: Udledningen på ${quantity.toFixed(2)} t overstiger grænsen på ${limit.toFixed(2)} t med ${exceedPercentRounded.toFixed(2)} %.`,
      )
    }

    if (quantity === 0) {
      warnings.push(`${label}: Ingen udledninger registreret. Bekræft at data dækker hele året.`)
    }

    trace.push(
      `${key}|quantityTonnes=${quantity.toFixed(3)}|limitTonnes=${limit.toFixed(3)}|exceedPercent=${exceedPercentRounded.toFixed(2)}`,
    )
  })

  if (incidents > 0) {
    warnings.push(`Der er registreret ${incidents} hændelse(r) med rapporteringspligt. Sikr opfølgning og root-cause analyse.`)
  }

  if (dataQualityPercent < e3Pollution.documentationWarningThresholdPercent) {
    warnings.push(
      `Dokumentationskvalitet på ${dataQualityPercent.toFixed(0)} % er under anbefalingen på ${e3Pollution.documentationWarningThresholdPercent} %. Opdater emissionstal med mere robuste kilder.`,
    )
  }

  const penaltyFromExceedance = totalExceedPercent * e3Pollution.exceedPenaltyPerPercent
  const penaltyFromIncidents = incidents * e3Pollution.incidentPenalty
  const totalPenalty = penaltyFromExceedance + penaltyFromIncidents
  const rawScore = e3Pollution.baseScore - totalPenalty
  const value = Number(Math.max(0, rawScore).toFixed(e3Pollution.resultPrecision))

  trace.push(`totalExceedPercent=${totalExceedPercent.toFixed(2)}`)
  trace.push(`penaltyExceedance=${penaltyFromExceedance.toFixed(2)}`)
  trace.push(`penaltyIncidents=${penaltyFromIncidents.toFixed(2)}`)
  trace.push(`totalPenalty=${totalPenalty.toFixed(2)}`)
  trace.push(`incidents=${incidents}`)
  trace.push(`dataQualityPercent=${dataQualityPercent.toFixed(2)}`)

  return {
    value,
    unit: e3Pollution.unit,
    assumptions,
    trace,
    warnings,
  }
}

function normaliseMass(value: number | null | undefined): number {
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) {
    return 0
  }
  return Math.max(0, value)
}

function normaliseCount(value: number | null | undefined): number {
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) {
    return 0
  }
  return Math.max(0, Math.round(value))
}

function clampPercent(value: number | null | undefined, fallback: number): number {
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) {
    return clampPercentValue(fallback)
  }
  return clampPercentValue(value)
}

function clampPercentValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(Math.max(value, 0), 100)
}

function resolveLimit(
  value: number | null | undefined,
  medium: MediumKey,
  warnings: string[],
): number {
  const fallback = e3Pollution.defaultLimitsTonnes[medium]
  if (value == null || Number.isNaN(value) || !Number.isFinite(value) || value <= 0) {
    warnings.push(
      `${mediumLabels[medium]}: Ingen gyldig grænse angivet. Standardgrænsen på ${fallback} t anvendes i beregningen.`,
    )
    return fallback
  }
  return Math.max(0, value)
}
