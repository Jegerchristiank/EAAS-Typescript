/**
 * Beregning for modul D1 – governance-score baseret på metodevalg og beskrivelser.
 */
import type { D1Input, ModuleInput, ModuleResult } from '../../types'
import { factors } from '../factors'

type ImpactsDetails = NonNullable<D1Input['impactsRisksOpportunities']>
type TargetsDetails = NonNullable<D1Input['targetsAndKpis']>
type TargetLine = TargetsDetails['kpis'] extends Array<infer Item> ? Item : never
type ValueChainCoverage = NonNullable<ImpactsDetails['valueChainCoverage']>
type TimeHorizonValue = NonNullable<ImpactsDetails['timeHorizons']>[number]

const boundaryScores: Record<NonNullable<D1Input['organizationalBoundary']>, number> = {
  equityShare: 0.6,
  financialControl: 0.8,
  operationalControl: 1
}

const scope2MethodScores: Record<NonNullable<D1Input['scope2Method']>, number> = {
  locationBased: 0.7,
  marketBased: 1
}

const dataQualityScores: Record<NonNullable<D1Input['dataQuality']>, number> = {
  primary: 1,
  secondary: 0.75,
  proxy: 0.5
}

const valueChainCoverageScores: Record<ValueChainCoverage, number> = {
  ownOperations: 0.5,
  upstreamOnly: 0.7,
  downstreamOnly: 0.7,
  upstreamAndDownstream: 0.9,
  fullValueChain: 1
}

const timeHorizonLabels: Record<TimeHorizonValue, string> = {
  shortTerm: 'kort sigt',
  mediumTerm: 'mellemsigt',
  longTerm: 'lang sigt'
}

const allTimeHorizons: TimeHorizonValue[] = ['shortTerm', 'mediumTerm', 'longTerm']

export function runD1(input: ModuleInput): ModuleResult {
  const raw = (input.D1 ?? null) as D1Input | null

  const boundary = raw?.organizationalBoundary ?? null
  const scope2Method = raw?.scope2Method ?? null
  const screeningCompleted = raw?.scope3ScreeningCompleted ?? null
  const dataQuality = raw?.dataQuality ?? null
  const strategy = raw?.strategy ?? null
  const governance = raw?.governance ?? null
  const impacts = raw?.impactsRisksOpportunities ?? null
  const targets = raw?.targetsAndKpis ?? null

  const materiality = normaliseText(raw?.materialityAssessmentDescription)
  const strategySummary = normaliseText(raw?.strategyDescription)

  const strategyEntries = [
    {
      key: 'businessModelSummary',
      value: normaliseText(strategy?.businessModelSummary),
      emptyWarning: 'Beskriv forretningsmodellen og væsentlige bæredygtighedsafhængigheder.',
      shortWarning: 'Uddyb forretningsmodellen, så sammenhængen til bæredygtighed bliver tydelig.'
    },
    {
      key: 'sustainabilityIntegration',
      value: normaliseText(strategy?.sustainabilityIntegration),
      emptyWarning: 'Forklar hvordan bæredygtighed indgår i strategien og beslutningerne.',
      shortWarning: 'Uddyb hvordan bæredygtighed integreres i strategi og mål.'
    },
    {
      key: 'resilienceDescription',
      value: normaliseText(strategy?.resilienceDescription),
      emptyWarning: 'Dokumentér robusthed og scenariearbejde for forretningsmodellen.',
      shortWarning: 'Beskriv scenarier eller stresstests mere detaljeret.'
    },
    {
      key: 'stakeholderEngagement',
      value: normaliseText(strategy?.stakeholderEngagement),
      emptyWarning: 'Angiv hvordan interessenter inddrages i strategiudviklingen.',
      shortWarning: 'Beskriv stakeholderprocessen mere detaljeret.'
    }
  ]

  const governanceEntries = [
    {
      key: 'oversight',
      value: normaliseText(governance?.oversight),
      emptyWarning: 'Beskriv bestyrelsens tilsyn med ESG-rapporteringen.',
      shortWarning: 'Uddyb hvordan bestyrelsen følger op og træffer beslutninger.'
    },
    {
      key: 'managementRoles',
      value: normaliseText(governance?.managementRoles),
      emptyWarning: 'Angiv direktionens roller og ansvar for bæredygtighed.',
      shortWarning: 'Beskriv direktionens fora, KPI’er og ansvar mere konkret.'
    },
    {
      key: 'esgExpertise',
      value: normaliseText(governance?.esgExpertise),
      emptyWarning: 'Dokumentér kompetencer og træning inden for bæredygtighed.',
      shortWarning: 'Uddyb hvordan kompetenceudvikling sikres.'
    },
    {
      key: 'incentives',
      value: normaliseText(governance?.incentives),
      emptyWarning: 'Beskriv incitamenter der knytter sig til bæredygtighedsmål.',
      shortWarning: 'Uddyb koblingen mellem incitamenter og ESG-resultater.'
    },
    {
      key: 'policies',
      value: normaliseText(governance?.policies),
      emptyWarning: 'Angiv centrale politikker og kontroller for rapporteringen.',
      shortWarning: 'Beskriv politikker og kontroller mere detaljeret.'
    }
  ]

  const impactsEntries = [
    {
      key: 'processDescription',
      value: normaliseText(impacts?.processDescription),
      emptyWarning: 'Dokumentér processen for analyse af impacts, risici og muligheder.',
      shortWarning: 'Uddyb procesbeskrivelsen med frekvens og ansvar.'
    },
    {
      key: 'prioritisationCriteria',
      value: normaliseText(impacts?.prioritisationCriteria),
      emptyWarning: 'Angiv kriterierne for prioritering og væsentlighed.',
      shortWarning: 'Beskriv prioriteringskriterierne mere detaljeret.'
    },
    {
      key: 'integrationIntoManagement',
      value: normaliseText(impacts?.integrationIntoManagement),
      emptyWarning: 'Forklar hvordan resultaterne integreres i styring og beslutninger.',
      shortWarning: 'Uddyb hvordan resultaterne påvirker strategi, risikostyring og investeringer.'
    },
    {
      key: 'mitigationActions',
      value: normaliseText(impacts?.mitigationActions),
      emptyWarning: 'Beskriv konkrete tiltag og handlingsplaner for væsentlige impacts.',
      shortWarning: 'Uddyb de planlagte tiltag og tidsplaner.'
    }
  ]

  const targetEntries = [
    {
      key: 'governanceIntegration',
      value: normaliseText(targets?.governanceIntegration),
      emptyWarning: 'Forklar hvordan mål og KPI’er er forankret i governance-processer.',
      shortWarning: 'Uddyb opfølgningsrutiner og fora for mål og KPI’er.'
    },
    {
      key: 'progressDescription',
      value: normaliseText(targets?.progressDescription),
      emptyWarning: 'Beskriv status og fremdrift på mål og KPI’er.',
      shortWarning: 'Uddyb resultater, delmål og afvigelser.'
    }
  ]

  const valueChainCoverage = impacts?.valueChainCoverage ?? null
  const timeHorizons = impacts?.timeHorizons ?? []
  const quantitativeTargets = targets?.hasQuantitativeTargets ?? null
  const rawKpis = targets?.kpis ?? []
  const meaningfulKpis = rawKpis.filter(hasAnyKpiData)

  const hasAnyInput =
    boundary !== null ||
    scope2Method !== null ||
    screeningCompleted !== null ||
    dataQuality !== null ||
    materiality.length > 0 ||
    strategySummary.length > 0 ||
    strategyEntries.some((entry) => entry.value.length > 0) ||
    governanceEntries.some((entry) => entry.value.length > 0) ||
    (governance?.hasEsgCommittee ?? null) !== null ||
    impactsEntries.some((entry) => entry.value.length > 0) ||
    valueChainCoverage !== null ||
    timeHorizons.length > 0 ||
    targetEntries.some((entry) => entry.value.length > 0) ||
    quantitativeTargets !== null ||
    meaningfulKpis.length > 0

  const trace = [
    `organizationalBoundary=${boundary ?? 'null'}`,
    `scope2Method=${scope2Method ?? 'null'}`,
    `scope3ScreeningCompleted=${screeningCompleted ?? 'null'}`,
    `dataQuality=${dataQuality ?? 'null'}`,
    `materialityLength=${materiality.length}`,
    `strategySummaryLength=${strategySummary.length}`,
    `strategyDetailLengths=${strategyEntries.map((entry) => `${entry.key}:${entry.value.length}`).join(',')}`,
    `governanceDetailLengths=${governanceEntries.map((entry) => `${entry.key}:${entry.value.length}`).join(',')}`,
    `impactsDetailLengths=${impactsEntries.map((entry) => `${entry.key}:${entry.value.length}`).join(',')}`,
    `valueChainCoverage=${valueChainCoverage ?? 'null'}`,
    `timeHorizons=${timeHorizons.length > 0 ? timeHorizons.join('|') : 'none'}`,
    `quantitativeTargets=${quantitativeTargets ?? 'null'}`,
    `kpiCount=${meaningfulKpis.length}`
  ]

  if (!hasAnyInput) {
    return {
      value: 0,
      unit: factors.d1.unit,
      assumptions: ['Udfyld governance-felterne for at beregne en D1-score.'],
      trace,
      warnings: []
    }
  }

  const warnings: string[] = []
  const metrics: Array<{ label: string; score: number; warning?: string }> = [
    {
      label: 'organizationalBoundary',
      score: boundary == null ? 0 : boundaryScores[boundary] ?? 0,
      warning:
        boundary == null
          ? 'Vælg et konsolideringsprincip for at dokumentere organisatorisk afgrænsning.'
          : undefined
    },
    {
      label: 'scope2Method',
      score: scope2Method == null ? 0 : scope2MethodScores[scope2Method] ?? 0,
      warning:
        scope2Method == null
          ? 'Vælg primær Scope 2 metode (location- eller market-based).'
          : undefined
    },
    {
      label: 'scope3ScreeningCompleted',
      score: screeningCompleted === true ? 1 : screeningCompleted === false ? 0.4 : 0,
      warning:
        screeningCompleted === true
          ? undefined
          : screeningCompleted === false
            ? 'Markér screening som gennemført, når scope 3 kategorier er vurderet.'
            : 'Angiv om Scope 3 screening er gennemført.'
    },
    {
      label: 'dataQuality',
      score: dataQuality == null ? 0 : dataQualityScores[dataQuality] ?? 0,
      warning:
        dataQuality == null
          ? 'Vælg dominerende datakvalitet for rapporteringen.'
          : dataQuality === 'proxy'
            ? 'Proxy-data giver lav governance-score – prioriter primære eller sekundære datakilder.'
            : undefined
    }
  ]

  const materialityMetric = evaluateTextDimension('materialityAssessment', materiality, {
    emptyWarning: 'Tilføj en kort beskrivelse af væsentlighedsvurderingen.',
    shortWarning: 'Uddyb væsentlighedsvurderingen med centrale risici og muligheder.'
  })
  metrics.push(materialityMetric)

  const strategySummaryMetric = evaluateTextDimension('strategySummary', strategySummary, {
    emptyWarning: 'Beskriv strategi, målsætninger og politikker for ESG-governance.',
    shortWarning: 'Uddyb strategi og politikker, så governance-planen fremstår tydelig.'
  })
  metrics.push(strategySummaryMetric)

  const strategyGroup = evaluateTextGroup('strategyDetails', strategyEntries)
  metrics.push({ label: 'strategyDetails', score: strategyGroup.score })
  warnings.push(...strategyGroup.warnings)
  trace.push(...strategyGroup.traceEntries)

  const governanceGroup = evaluateTextGroup('governanceDetails', governanceEntries)
  metrics.push({ label: 'governanceDetails', score: governanceGroup.score })
  warnings.push(...governanceGroup.warnings)
  trace.push(...governanceGroup.traceEntries)

  const hasCommittee = governance?.hasEsgCommittee ?? null
  metrics.push({
    label: 'esgCommittee',
    score: hasCommittee === true ? 1 : hasCommittee === false ? 0.6 : 0,
    warning:
      hasCommittee === true
        ? undefined
        : hasCommittee === false
          ? 'Dokumentér mandatet for ESG-/bæredygtighedsudvalget for at styrke governance.'
          : 'Angiv om der er et dedikeret ESG-/bæredygtighedsudvalg.'
  })

  const impactsGroup = evaluateTextGroup('impactsProcess', impactsEntries)
  metrics.push({ label: 'impactsProcess', score: impactsGroup.score })
  warnings.push(...impactsGroup.warnings)
  trace.push(...impactsGroup.traceEntries)

  metrics.push({
    label: 'valueChainCoverage',
    score: valueChainCoverage == null ? 0 : valueChainCoverageScores[valueChainCoverage] ?? 0,
    warning:
      valueChainCoverage == null
        ? 'Angiv hvor stor en del af værdikæden analysen dækker.'
        : valueChainCoverage === 'ownOperations'
          ? 'Udvid analysen til upstream og downstream for at dokumentere hele værdikæden.'
          : valueChainCoverage === 'upstreamOnly' || valueChainCoverage === 'downstreamOnly'
            ? 'Dæk både upstream og downstream for at opnå fuld score.'
            : valueChainCoverage === 'upstreamAndDownstream'
              ? 'Dokumentér fuld værdikædedækning for at opnå 100 % score.'
              : undefined
  })

  const uniqueHorizons = Array.from(new Set(timeHorizons))
  let timeHorizonScore = 0
  let timeHorizonWarning: string | undefined
  if (uniqueHorizons.length === 0) {
    timeHorizonWarning = 'Markér hvilke tidshorisonter der er analyseret (kort, mellem og lang sigt).'
  } else if (uniqueHorizons.length === 1) {
    timeHorizonScore = 0.6
    const missing = allTimeHorizons.filter((value) => !uniqueHorizons.includes(value))
    timeHorizonWarning = `Udvid analysen til også at dække ${missing.map((value) => timeHorizonLabels[value]).join(' og ')}.`
  } else if (uniqueHorizons.length === 2) {
    timeHorizonScore = 0.85
    const missing = allTimeHorizons.filter((value) => !uniqueHorizons.includes(value))
    timeHorizonWarning = `Tilføj også ${missing.map((value) => timeHorizonLabels[value]).join(' og ')} for fuld robusthed.`
  } else {
    timeHorizonScore = 1
  }

  metrics.push({
    label: 'timeHorizons',
    score: timeHorizonScore,
    warning: timeHorizonWarning
  })

  const targetGroup = evaluateTextGroup('targetsNarrative', targetEntries)
  metrics.push({ label: 'targetsNarrative', score: targetGroup.score })
  warnings.push(...targetGroup.warnings)
  trace.push(...targetGroup.traceEntries)

  metrics.push({
    label: 'quantitativeTargets',
    score: quantitativeTargets === true ? 1 : quantitativeTargets === false ? 0.6 : 0,
    warning:
      quantitativeTargets === true
        ? undefined
        : quantitativeTargets === false
          ? 'Overvej at opstille kvantitative mål for væsentlige impacts og risici.'
          : 'Angiv om organisationen har kvantitative mål.'
  })

  const kpiScore =
    meaningfulKpis.length === 0
      ? 0
      : meaningfulKpis.length === 1
        ? 0.6
        : meaningfulKpis.length === 2
          ? 0.85
          : 1

  const kpiWarning =
    meaningfulKpis.length === 0
      ? 'Tilføj mindst én KPI for at demonstrere opfølgning på målene.'
      : meaningfulKpis.length === 1
        ? 'Tilføj flere KPI’er for at dække alle væsentlige mål.'
        : undefined

  metrics.push({ label: 'kpiCoverage', score: kpiScore, warning: kpiWarning })

  const totalScore = metrics.reduce((sum, metric) => sum + metric.score, 0)
  const averageScore = totalScore / metrics.length
  const value = Number((averageScore * factors.d1.maxScore).toFixed(factors.d1.resultPrecision))

  const assumptions = [
    `Governance-scoren er gennemsnittet af ${metrics.length} deldimensioner (0-100).`,
    'Operational control, market-based Scope 2, fuld Scope 3 screening og primære data giver fuld score på metode-dimensionerne.',
    `Detaljerede beskrivelser vurderes ud fra ${factors.d1.partialTextLength} og ${factors.d1.detailedTextLength} tegn.`,
    'Strategi, governance, impacts og mål vurderes på både kvalitative beskrivelser og strukturelle datapunkter (værdikæde, tidshorisonter, KPI’er).'
  ]

  for (const metric of metrics) {
    if (metric.warning) {
      warnings.push(metric.warning)
    }
    trace.push(`${metric.label}Score=${metric.score}`)
  }

  return {
    value,
    unit: factors.d1.unit,
    assumptions,
    trace,
    warnings
  }
}

function normaliseText(value: string | null | undefined): string {
  if (!value) {
    return ''
  }
  return value.trim()
}

type TextDimensionConfig = {
  emptyWarning?: string
  shortWarning?: string
}

type TextDimensionResult = {
  label: string
  score: number
  warning?: string
}

function evaluateTextDimension(label: string, value: string, config?: TextDimensionConfig): TextDimensionResult {
  const emptyWarning =
    config?.emptyWarning ??
    (label === 'materialityAssessment'
      ? 'Tilføj en kort beskrivelse af væsentlighedsvurderingen.'
      : 'Beskriv strategi, målsætninger og politikker for ESG-governance.')

  const shortWarning =
    config?.shortWarning ??
    (label === 'materialityAssessment'
      ? 'Uddyb væsentlighedsvurderingen med centrale risici og muligheder.'
      : 'Uddyb strategi og politikker, så governance-planen fremstår tydelig.')

  if (value.length === 0) {
    return {
      label,
      score: 0,
      warning: emptyWarning
    }
  }

  if (value.length < factors.d1.partialTextLength) {
    return {
      label,
      score: 0.6,
      warning: shortWarning
    }
  }

  if (value.length < factors.d1.detailedTextLength) {
    return {
      label,
      score: 0.85
    }
  }

  return {
    label,
    score: 1
  }
}

type TextGroupEntry = {
  key: string
  value: string
  emptyWarning: string
  shortWarning: string
}

type TextGroupResult = {
  label: string
  score: number
  warnings: string[]
  traceEntries: string[]
}

function evaluateTextGroup(label: string, entries: TextGroupEntry[]): TextGroupResult {
  if (entries.length === 0) {
    return {
      label,
      score: 0,
      warnings: [],
      traceEntries: []
    }
  }

  let total = 0
  const warnings: string[] = []
  const traceEntries: string[] = []

  for (const entry of entries) {
    const result = evaluateTextDimension(`${label}.${entry.key}`, entry.value, {
      emptyWarning: entry.emptyWarning,
      shortWarning: entry.shortWarning
    })
    total += result.score
    traceEntries.push(`${result.label}Score=${result.score}`)
    if (result.warning) {
      warnings.push(result.warning)
    }
  }

  return {
    label,
    score: total / entries.length,
    warnings,
    traceEntries
  }
}

function hasAnyKpiData(line: TargetLine | null | undefined): boolean {
  if (!line) {
    return false
  }

  return (
    normaliseText(line.name).length > 0 ||
    normaliseText(line.kpi).length > 0 ||
    normaliseText(line.unit).length > 0 ||
    normaliseText(line.comments).length > 0 ||
    line.baselineYear !== null && line.baselineYear !== undefined ||
    line.baselineValue !== null && line.baselineValue !== undefined ||
    line.targetYear !== null && line.targetYear !== undefined ||
    line.targetValue !== null && line.targetValue !== undefined
  )
}
