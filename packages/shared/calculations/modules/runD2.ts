/**
 * Beregning for modul D2 – dobbelt væsentlighed og CSRD-gapstatus.
 */
import type {
  D2Input,
  ModuleEsrsFact,
  ModuleEsrsTable,
  ModuleInput,
  ModuleResult
} from '../../types'
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
  description: string | null
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

    const description = typeof topic?.description === 'string' ? topic.description.trim() : null

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
      description: description && description.length > 0 ? description : null,
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

    const gapStatus = topic.csrdGapStatus ?? null
    if (gapStatus && d2.gapWarningStatuses.includes(gapStatus)) {
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

  const narratives = normalisedTopics
    .map((topic) => {
      if (!topic.description) {
        return null
      }
      return {
        label: topic.name,
        content: topic.description,
      }
    })
    .filter((entry): entry is { label: string; content: string } => entry !== null)

  const responsibilities = normalisedTopics
    .map((topic) => {
      if (!topic.responsible) {
        return null
      }
      return {
        subject: topic.name,
        owner: topic.responsible,
        role: 'Materialitet',
      }
    })
    .filter((entry): entry is { subject: string; owner: string; role: string } => entry !== null)

  const notes = normalisedTopics.map((topic) => ({
    label: topic.name,
    detail: `Tidslinje: ${topic.timeline ?? 'ukendt'} · Risiko: ${topic.riskType ?? 'ukendt'} · CSRD-gap: ${
      topic.csrdGapStatus ?? 'ukendt'
    }`,
  }))

  const gapAlerts = normalisedTopics
    .filter((topic) => topic.csrdGapStatus === 'missing')
    .map((topic) => topic.name)

  const esrsFacts: ModuleEsrsFact[] = []
  const pushNumericFact = (key: string, value: number, unitId: string, decimals: number) => {
    if (!Number.isFinite(value)) {
      return
    }
    esrsFacts.push({ conceptKey: key, value: Number(value), unitId, decimals })
  }

  pushNumericFact('D2ValidTopicsCount', normalisedTopics.length, 'pure', 0)
  pushNumericFact('D2PrioritisedTopicsCount', prioritisedTopics.length, 'pure', 0)
  pushNumericFact('D2AttentionTopicsCount', attentionTopics.length, 'pure', 0)
  pushNumericFact('D2GapAlertsCount', gapAlerts.length, 'pure', 0)
  pushNumericFact('D2AverageWeightedScore', (averageScore / d2.maxScore) * 100, 'percent', 1)

  const esrsTables: ModuleEsrsTable[] = []

  if (normalisedTopics.length > 0) {
    esrsTables.push({
      conceptKey: 'D2MaterialTopicsTable',
      rows: normalisedTopics.map((topic) => ({
        name: topic.name,
        impactScore: topic.impactScore,
        financialScore: topic.financialScore,
        combinedScore: Number(topic.combinedScore.toFixed(2)),
        riskType: topic.riskType ?? null,
        timeline: topic.timeline ?? null,
        responsible: topic.responsible ?? null,
        csrdGapStatus: topic.csrdGapStatus ?? null,
        missingImpact: topic.missingImpact,
        missingFinancial: topic.missingFinancial
      }))
    })
  }

  if (gapAlerts.length > 0) {
    esrsTables.push({
      conceptKey: 'D2GapAlertsTable',
      rows: gapAlerts.map((topic) => ({ topic }))
    })
  }

  return {
    value,
    unit: d2.unit,
    assumptions,
    trace,
    warnings,
    narratives,
    responsibilities,
    notes,
    doubleMateriality: {
      summary: `Prioriterede emner: ${prioritisedTopics.length} · Observationer: ${normalisedTopics.length}`,
      topics: normalisedTopics.map((topic) => ({
        name: topic.name,
        impactScore: topic.impactScore,
        financialScore: topic.financialScore,
        combinedScore: Number(topic.combinedScore.toFixed(2)),
        riskType: topic.riskType ?? null,
        timeline: topic.timeline ?? null,
        responsible: topic.responsible ?? null,
        csrdGapStatus: topic.csrdGapStatus ?? null,
      })),
      gapAlerts,
    },
    ...(esrsFacts.length > 0 ? { esrsFacts } : {}),
    ...(esrsTables.length > 0 ? { esrsTables } : {})
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
