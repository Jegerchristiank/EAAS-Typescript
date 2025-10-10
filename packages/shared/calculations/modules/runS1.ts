/**
 * Beregning for modul S1 – arbejdsstyrke og headcount.
 */
import type {
  ModuleEsrsFact,
  ModuleEsrsTable,
  ModuleInput,
  ModuleMetric,
  ModuleResult,
  ModuleTable,
  S1Input
} from '../../types'
import { factors } from '../factors'

const { s1 } = factors

type NormalisedRow = {
  index: number
  segment: string
  headcount: number
  femalePercent: number | null
  labourRightsCoverage: number | null
}

export function runS1(input: ModuleInput): ModuleResult {
  const raw = (input.S1 ?? null) as S1Input | null
  const breakdown = normaliseBreakdown(raw?.headcountBreakdown)
  const trace: string[] = []
  const warnings: string[] = []
  const assumptions = [
    'Scoren vægter total headcount (35 %), segmentfordeling (35 %), datadækning (20 %) og faglig repræsentation (10 %).',
    'Datadækning og arbejdsrettigheder vurderes proportionelt ud fra angivne procenttal (0-100%).'
  ]

  const totalHeadcount = resolveNumber(raw?.totalHeadcount)
  const coveragePercent = clampPercent(raw?.dataCoveragePercent)
  const averageWeeklyHours = clampHours(raw?.averageWeeklyHours)

  if (totalHeadcount == null || totalHeadcount <= 0) {
    warnings.push('Total headcount mangler. Udfyld samlet medarbejdertal for at forbedre scoringen.')
  } else {
    trace.push(`totalHeadcount=${totalHeadcount}`)
  }

  if (coveragePercent == null) {
    warnings.push('Datadækning i procent er ikke angivet. Feltet bruges til at validere CSRD-kravet om fuld arbejdsstyrkedækning.')
  } else {
    trace.push(`dataCoveragePercent=${coveragePercent}`)
    if (coveragePercent < s1.coverageWarningThresholdPercent) {
      warnings.push(
        `Datadækningen er kun ${coveragePercent}% – CSRD kræver dokumenteret dækning tæt på 100%.`
      )
    }
  }

  if (breakdown.length === 0) {
    warnings.push('Ingen segmentfordeling registreret. Tilføj segmenter (fx lande, funktioner) for at dokumentere headcount.')
    trace.push('segments=0')
  } else {
    trace.push(`segments=${breakdown.length}`)
  }

  const labourRightsCoverage = computeAverage(
    breakdown.map((row) => (row.labourRightsCoverage == null ? null : clampPercent(row.labourRightsCoverage)))
  )

  const averageFemalePercent = computeAverage(
    breakdown.map((row) => (row.femalePercent == null ? null : clampPercent(row.femalePercent)))
  )

  const totalSegmentHeadcount = breakdown.reduce((sum, row) => sum + row.headcount, 0)
  const totalFemaleHeadcount = breakdown.reduce((sum, row) => {
    if (row.femalePercent == null) {
      return sum
    }
    return sum + Number(((row.femalePercent / 100) * row.headcount).toFixed(1))
  }, 0)

  if (labourRightsCoverage != null) {
    trace.push(`avgLabourRightsCoverage=${labourRightsCoverage}`)
    if (labourRightsCoverage < s1.labourRightsWarningThresholdPercent) {
      warnings.push(
        `Faglig repræsentation/dækningsgrad er kun ${labourRightsCoverage}% – vurder behov for kollektive aftaler og arbejdsmiljøudvalg.`
      )
    }
  } else {
    warnings.push('Dækning af kollektive aftaler eller medarbejderrepræsentation er ikke angivet.')
  }

  breakdown.forEach((row) => {
    if (row.femalePercent != null && (row.femalePercent < 20 || row.femalePercent > 80)) {
      warnings.push(
        `Segmentet "${row.segment}" har en kønsfordeling på ${row.femalePercent}% kvinder – markér indsats i S2 for at adressere ubalancer.`
      )
    }
    trace.push(
      `segment[${row.index}]=${encodeTrace(row.segment)}|headcount=${row.headcount}|female=${
        row.femalePercent ?? 'null'
      }|labour=${row.labourRightsCoverage ?? 'null'}`
    )
  })

  const totalScore =
    (totalHeadcount != null && totalHeadcount > 0 ? s1.totalHeadcountWeight : 0) +
    s1.breakdownWeight * computeBreakdownScore(breakdown.length) +
    s1.coverageWeight * normalisePercent(coveragePercent) +
    s1.labourRightsWeight * normalisePercent(labourRightsCoverage)

  const value = Number((Math.max(0, Math.min(totalScore, 1)) * 100).toFixed(s1.resultPrecision))

  const esrsFacts: ModuleEsrsFact[] = []
  const pushNumericFact = (key: string, value: number | null | undefined, unitId: string, decimals: number) => {
    if (value == null || Number.isNaN(value) || !Number.isFinite(Number(value))) {
      return
    }
    esrsFacts.push({ conceptKey: key, value: Number(value), unitId, decimals })
  }

  pushNumericFact('S1TotalHeadcount', totalHeadcount, 'pure', 0)
  pushNumericFact('S1DataCoveragePercent', coveragePercent, 'percent', 1)
  pushNumericFact('S1CollectiveAgreementCoveragePercent', labourRightsCoverage, 'percent', 1)
  pushNumericFact('S1AverageFemalePercent', averageFemalePercent, 'percent', 1)

  const esrsTables: ModuleEsrsTable[] | undefined =
    breakdown.length === 0
      ? undefined
      : [
          {
            conceptKey: 'S1HeadcountBreakdownTable',
            rows: breakdown.map((row) => ({
              segment: row.segment,
              headcount: row.headcount,
              femalePercent: row.femalePercent,
              collectiveAgreementCoveragePercent: row.labourRightsCoverage
            }))
          }
        ]

  const metrics: ModuleMetric[] = []
  if (totalHeadcount != null) {
    metrics.push({ label: 'Total headcount', value: totalHeadcount, unit: 'personer' })
  }
  if (totalSegmentHeadcount > 0 && (totalHeadcount == null || Math.abs(totalHeadcount - totalSegmentHeadcount) > 1)) {
    metrics.push({
      label: 'Headcount i segmenter',
      value: totalSegmentHeadcount,
      unit: 'personer',
      context: 'Sum af registrerede segmenter'
    })
  }
  if (averageFemalePercent != null) {
    metrics.push({ label: 'Gennemsnitlig andel kvinder', value: averageFemalePercent, unit: '%' })
  }
  if (totalFemaleHeadcount > 0) {
    metrics.push({
      label: 'Estimeret antal kvinder',
      value: Number(totalFemaleHeadcount.toFixed(0)),
      unit: 'personer',
      context: 'Beregnet ud fra segmentfordeling'
    })
  }
  if (labourRightsCoverage != null) {
    metrics.push({
      label: 'Dækning af kollektive aftaler',
      value: labourRightsCoverage,
      unit: '%'
    })
  }
  if (coveragePercent != null) {
    metrics.push({ label: 'Datadækning', value: coveragePercent, unit: '%' })
  }
  if (averageWeeklyHours != null) {
    metrics.push({ label: 'Gns. ugentlige arbejdstimer', value: averageWeeklyHours, unit: 'timer' })
  }

  const tables: ModuleTable[] = []
  if (breakdown.length > 0) {
    tables.push({
      id: 's1-headcount-breakdown',
      title: 'Headcount pr. segment',
      summary: 'Segmenteret headcount med kønsfordeling og faglig repræsentation.',
      columns: [
        { key: 'segment', label: 'Segment' },
        { key: 'headcount', label: 'Headcount', align: 'end', format: 'number' },
        { key: 'femalePercent', label: 'Kvinder (%)', align: 'end', format: 'percent' },
        {
          key: 'collectiveAgreementCoveragePercent',
          label: 'Kollektive aftaler (%)',
          align: 'end',
          format: 'percent'
        }
      ],
      rows: breakdown.map((row) => ({
        segment: row.segment,
        headcount: row.headcount,
        femalePercent: row.femalePercent,
        collectiveAgreementCoveragePercent: row.labourRightsCoverage
      }))
    })
  }

  const narratives =
    raw?.workforceNarrative && raw.workforceNarrative.trim().length > 0
      ? [
          {
            label: 'Arbejdsstyrkens udvikling',
            content: raw.workforceNarrative.trim()
          },
        ]
      : undefined

  return {
    value,
    unit: s1.unit,
    assumptions,
    trace,
    warnings,
    ...(metrics.length > 0 ? { metrics } : {}),
    ...(narratives ? { narratives } : {}),
    ...(tables.length > 0 ? { tables } : {}),
    ...(esrsFacts.length > 0 ? { esrsFacts } : {}),
    ...(esrsTables ? { esrsTables } : {})
  }
}

function normaliseBreakdown(rows: S1Input['headcountBreakdown']): NormalisedRow[] {
  if (!Array.isArray(rows)) {
    return []
  }

  return rows
    .map((row, index) => {
      const segment = (row?.segment ?? '').trim()
      const headcount = resolveNumber(row?.headcount) ?? 0
      const femalePercent = row?.femalePercent == null ? null : clampPercent(row.femalePercent)
      const labourRightsCoverage =
        row?.collectiveAgreementCoveragePercent == null
          ? null
          : clampPercent(row.collectiveAgreementCoveragePercent)

      if (segment.length === 0 || headcount <= 0) {
        return null
      }

      return {
        index,
        segment,
        headcount,
        femalePercent,
        labourRightsCoverage
      }
    })
    .filter((row): row is NormalisedRow => row != null)
}

function computeBreakdownScore(segmentCount: number): number {
  if (segmentCount <= 0) {
    return 0
  }
  const ratio = segmentCount / s1.minSegmentsForFullScore
  return Math.min(1, ratio)
}

function computeAverage(values: Array<number | null>): number | null {
  const valid = values.filter((value): value is number => value != null && Number.isFinite(value))
  if (valid.length === 0) {
    return null
  }
  const sum = valid.reduce((acc, value) => acc + value, 0)
  return Number((sum / valid.length).toFixed(1))
}

function clampPercent(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) {
    return null
  }
  return Math.max(0, Math.min(100, Number(value)))
}

function clampHours(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) {
    return null
  }
  const normalised = Math.max(0, Math.min(80, Number(value)))
  return Number(normalised.toFixed(1))
}

function normalisePercent(value: number | null): number {
  if (value == null) {
    return 0
  }
  return Math.max(0, Math.min(1, value / 100))
}

function resolveNumber(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) {
    return null
  }
  return Number(value)
}

function encodeTrace(value: string): string {
  return value.replaceAll('|', '/').replaceAll('\n', ' ')
}
