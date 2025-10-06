/**
 * Beregning for modul S2 – diversitet, ligestilling og inklusion.
 */
import type { ModuleInput, ModuleResult, S2Input } from '../../types'
import { factors } from '../factors'

const { s2 } = factors

type NormalisedRow = {
  index: number
  level: string
  femalePercent: number | null
  malePercent: number | null
  otherPercent: number | null
  payGapPercent: number | null
  narrative: string | null
}

export function runS2(input: ModuleInput): ModuleResult {
  const raw = (input.S2 ?? null) as S2Input | null
  const rows = normaliseRows(raw?.genderBalance)
  const trace: string[] = []
  const warnings: string[] = []
  const assumptions = [
    'Scoren vægter ligestilling (60 %), datadækning (20 %) og politik/indsats (20 %).',
    'Kønsbalancen vurderes mod paritet (50/50) med fuld score ved ±5 procentpoint og nul score ved ±20 procentpoint.'
  ]

  const coveragePercent = resolveCoverage(raw, rows)
  const policyScore = raw?.equalityPolicyInPlace === true ? 1 : raw?.equalityPolicyInPlace === false ? 0 : 0.2

  if (coveragePercent == null) {
    warnings.push('Datadækning for diversitet er ikke angivet. Udfyld dækning eller flere rækker.')
  } else {
    trace.push(`dataCoveragePercent=${coveragePercent}`)
    if (coveragePercent < 80) {
      warnings.push(`Diversitetsdata dækker kun ${coveragePercent}% af arbejdsstyrken – CSRD kræver fuld repræsentation.`)
    }
  }

  if (raw?.equalityPolicyInPlace == null) {
    warnings.push('Angiv om virksomheden har en ligestillingspolitik – feltet er påkrævet i ESRS S1/S4.')
  } else if (raw.equalityPolicyInPlace === false) {
    warnings.push('Ingen ligestillingspolitik markeret. Overvej at etablere politik og targets.')
  }

  const parityScores: number[] = []

  rows.forEach((row) => {
    const gap = computeParityGap(row)
    const rowScore = gap == null ? null : Math.max(0, 1 - gap / s2.severeGapPercent)
    if (rowScore != null) {
      parityScores.push(rowScore)
    }

    if (gap != null) {
      trace.push(`parityGap[${row.index}]=${gap.toFixed(1)}`)
      if (gap >= s2.severeGapPercent) {
        warnings.push(
          `Kønsbalancen for "${row.level}" afviger ${gap.toFixed(1)} procentpoint fra paritet. Udarbejd plan for forbedring.`
        )
      }
      if (gap >= 10 && raw?.inclusionInitiativesNarrative == null) {
        warnings.push(
          `Tilføj narrative indsatser i S2 for "${row.level}" – større afvigelser kræver dokumenterede initiativer.`
        )
      }
    }

    if (row.payGapPercent != null) {
      trace.push(`payGap[${row.index}]=${row.payGapPercent}`)
      if (Math.abs(row.payGapPercent) > 5) {
        warnings.push(
          `Løngabet for "${row.level}" er ${row.payGapPercent}% – dokumentér plan for at lukke gap'et.`
        )
      }
    }

    trace.push(
      `row[${row.index}]=${encodeTrace(row.level)}|female=${row.femalePercent ?? 'null'}|male=${
        row.malePercent ?? 'null'
      }|other=${row.otherPercent ?? 'null'}`
    )
  })

  if (rows.length === 0) {
    warnings.push('Ingen diversitetsrækker registreret. Tilføj mindst én ledelses-/medarbejdergruppe.')
    trace.push('rows=0')
  }

  const parityScore = parityScores.length === 0 ? 0 : parityScores.reduce((sum, value) => sum + value, 0) / parityScores.length
  const coverageScore = normalisePercent(coveragePercent)

  const totalScore = s2.parityWeight * parityScore + s2.coverageWeight * coverageScore + s2.policyWeight * policyScore
  const value = Number((Math.max(0, Math.min(totalScore, 1)) * 100).toFixed(s2.resultPrecision))

  return {
    value,
    unit: s2.unit,
    assumptions,
    trace,
    warnings
  }
}

function normaliseRows(rows: S2Input['genderBalance']): NormalisedRow[] {
  if (!Array.isArray(rows)) {
    return []
  }

  return rows
    .map((row, index) => {
      const level = (row?.level ?? '').trim()
      const femalePercent = clampPercent(row?.femalePercent)
      const malePercent = clampPercent(row?.malePercent)
      const otherPercent = clampPercent(row?.otherPercent)
      const payGapPercent = clampNumber(row?.payGapPercent, -100, 100)
      const narrative = row?.targetNarrative == null ? null : row.targetNarrative.trim() || null

      if (level.length === 0) {
        return null
      }

      return {
        index,
        level,
        femalePercent,
        malePercent,
        otherPercent,
        payGapPercent,
        narrative
      }
    })
    .filter((row): row is NormalisedRow => row != null)
}

function resolveCoverage(raw: S2Input | null, rows: NormalisedRow[]): number | null {
  const explicit = clampPercent(raw?.dataCoveragePercent)
  if (explicit != null) {
    return explicit
  }

  const ratio = rows.filter((row) => row.femalePercent != null || row.malePercent != null).length / (rows.length || 1)
  const percent = Math.round(ratio * 100)
  return rows.length === 0 ? null : percent
}

function computeParityGap(row: NormalisedRow): number | null {
  if (row.femalePercent == null && row.malePercent == null) {
    return null
  }
  const female = row.femalePercent ?? (row.malePercent != null ? 100 - row.malePercent : null)
  if (female == null) {
    return null
  }
  return Math.abs(female - s2.fullParityPercent)
}

function clampPercent(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) {
    return null
  }
  return Math.max(0, Math.min(100, Number(value)))
}

function clampNumber(value: number | null | undefined, min: number, max: number): number | null {
  if (value == null || Number.isNaN(value)) {
    return null
  }
  return Math.max(min, Math.min(max, Number(value)))
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
