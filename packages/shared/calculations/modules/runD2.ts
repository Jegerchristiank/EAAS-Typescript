/**
 * Beregning for modul D2 – dobbelt væsentlighed og CSRD-gapstatus.
 */
import type { D2Input, ModuleInput, ModuleResult } from '../../types'
import { factors } from '../factors'

const { d2 } = factors

type MaterialityTopic = NonNullable<D2Input['materialTopics']>[number]

type NormalisedTopic = {
  index: number
  name: string
  impactScore: number
  financialScore: number
  combinedScore: number
  riskType: MaterialityTopic['riskType']
  timeline: MaterialityTopic['timeline']
  responsible: MaterialityTopic['responsible']
  csrdGapStatus: MaterialityTopic['csrdGapStatus']
  missingImpact: boolean
  missingFinancial: boolean
}

export function runD2(input: ModuleInput): ModuleResult {
  const raw = (input.D2 ?? null) as D2Input | null
  const topics = Array.isArray(raw?.materialTopics) ? raw!.materialTopics! : []

  const assumptions = [
    'Impact-score vægtes 60 % og finansiel score 40 % på en 0-5 skala.',
    'Resultatet er gennemsnittet af vægtede scorer på tværs af registrerede emner og skaleres til 0-100.',
    'Emner uden gyldige scorer indgår ikke i resultatet, men fremgår i warnings for opfølgning.'
  ]

  const trace: string[] = [`inputTopics=${topics.length}`]
  const warnings: string[] = []

  if (topics.length === 0) {
    warnings.push('Ingen væsentlige emner registreret. Tilføj materialitetsemner for at beregne prioritet.')
    return {
      value: 0,
      unit: d2.unit,
      assumptions,
      trace,
      warnings
    }
  }

  const normalisedTopics: NormalisedTopic[] = []

  topics.forEach((topic, index) => {
    const name = (topic?.title ?? '').trim()
    if (name.length === 0) {
      warnings.push(`Emne ${index + 1} mangler titel og indgår ikke i beregningen.`)
      trace.push(`topic[${index}]=skipped|reason=no-title`)
      return
    }

    const impactScore = clampScore(topic?.impactScore)
    const financialScore = clampScore(topic?.financialScore)

    if (impactScore === null && financialScore === null) {
      warnings.push(`Emnet "${name}" mangler både impact- og finansiel score og indgår ikke i beregningen.`)
      trace.push(`topic[${index}]=skipped|reason=no-scores|name=${encodeTrace(name)}`)
      return
    }

    const missingImpact = impactScore === null
    const missingFinancial = financialScore === null

    const resolvedImpact = impactScore ?? 0
    const resolvedFinancial = financialScore ?? 0

    if (missingImpact) {
      warnings.push(`Impact-score mangler for "${name}" – behandles som 0.`)
    }

    if (missingFinancial) {
      warnings.push(`Finansiel score mangler for "${name}" – behandles som 0.`)
    }

    const combinedScore =
      resolvedImpact * d2.impactWeight + resolvedFinancial * d2.financialWeight

    normalisedTopics.push({
      index,
      name,
      impactScore: resolvedImpact,
      financialScore: resolvedFinancial,
      combinedScore,
      riskType: topic?.riskType ?? null,
      timeline: topic?.timeline ?? null,
      responsible: topic?.responsible ?? null,
      csrdGapStatus: topic?.csrdGapStatus ?? null,
      missingImpact,
      missingFinancial
    })

    trace.push(
      `topic[${index}]=${encodeTrace(name)}|impact=${formatScore(impactScore)}|financial=${formatScore(
        financialScore
      )}|combined=${combinedScore.toFixed(2)}|riskType=${topic?.riskType ?? 'null'}|timeline=${
        topic?.timeline ?? 'null'
      }|gap=${topic?.csrdGapStatus ?? 'null'}`
    )
  })

  if (normalisedTopics.length === 0) {
    warnings.push('Ingen gyldige emner med scorer kunne beregnes. Kontrollér inputtene.')
    trace.push('validTopics=0')
    return {
      value: 0,
      unit: d2.unit,
      assumptions,
      trace,
      warnings
    }
  }

  const totalScore = normalisedTopics.reduce((sum, topic) => sum + topic.combinedScore, 0)
  const averageScore = totalScore / normalisedTopics.length
  const value = Number(((averageScore / d2.maxScore) * 100).toFixed(d2.resultPrecision))

  const prioritisedTopics = normalisedTopics
    .filter((topic) => topic.combinedScore >= d2.priorityThreshold)
    .sort((a, b) => b.combinedScore - a.combinedScore)
  const attentionTopics = normalisedTopics
    .filter(
      (topic) =>
        topic.combinedScore >= d2.attentionThreshold && topic.combinedScore < d2.priorityThreshold
    )
    .sort((a, b) => b.combinedScore - a.combinedScore)

  const topSummary = prioritisedTopics
    .slice(0, d2.summaryLimit)
    .map((topic) => `${topic.name} (${topic.combinedScore.toFixed(1)})`)

  if (topSummary.length > 0) {
    assumptions.push(`Top prioriterede emner: ${topSummary.join(', ')}.`)
  } else {
    assumptions.push('Ingen emner overstiger prioritetstærsklen på 4,0.')
  }

  if (attentionTopics.length > 0) {
    const list = attentionTopics
      .slice(0, d2.summaryLimit)
      .map((topic) => `${topic.name} (${topic.combinedScore.toFixed(1)})`)
    assumptions.push(`Emner tæt på prioritet: ${list.join(', ')}.`)
  }

  prioritisedTopics.forEach((topic) => {
    const priorityLabel =
      topic.riskType === 'opportunity'
        ? 'Udnyt mulighed'
        : topic.riskType === 'both'
        ? 'Håndtér risiko/mulighed'
        : 'Håndtér risiko'

    warnings.push(
      `Prioriteret emne: ${topic.name} (score ${topic.combinedScore.toFixed(1)}) – ${priorityLabel}.`
    )

    if (d2.gapWarningStatuses.includes(topic.csrdGapStatus ?? '')) {
      warnings.push(`CSRD-gap mangler for ${topic.name}. Fastlæg dokumentation og kontroller krav.`)
    }

    if (d2.timelineWarningForPriority && !topic.timeline) {
      warnings.push(`Angiv tidslinje for ${topic.name}, så handling kan planlægges.`)
    }

    if (d2.responsibleWarningForPriority && !topic.responsible) {
      warnings.push(`Tildel ansvarlig for ${topic.name} for at sikre opfølgning.`)
    }
  })

  trace.push(`validTopics=${normalisedTopics.length}`)
  trace.push(`averageWeightedScore=${averageScore.toFixed(2)}`)
  trace.push(`prioritised=${prioritisedTopics.length}`)
  trace.push(`attention=${attentionTopics.length}`)

  return {
    value,
    unit: d2.unit,
    assumptions,
    trace,
    warnings
  }
}

function clampScore(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) {
    return null
  }
  const clamped = Math.min(Math.max(value, 0), d2.maxScore)
  return Number.isFinite(clamped) ? clamped : null
}

function formatScore(value: number | null): string {
  if (value == null) {
    return 'null'
  }
  return value.toFixed(2)
}

function encodeTrace(value: string): string {
  return value.replace(/\s+/g, '_')
}
