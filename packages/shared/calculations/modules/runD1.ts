/**
 * Beregning for modul D1 – governance-score baseret på metodevalg og beskrivelser.
 */
import type { D1Input, ModuleInput, ModuleResult } from '../../types'
import { factors } from '../factors'

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

export function runD1(input: ModuleInput): ModuleResult {
  const raw = (input.D1 ?? null) as D1Input | null

  const boundary = raw?.organizationalBoundary ?? null
  const scope2Method = raw?.scope2Method ?? null
  const screeningCompleted = raw?.scope3ScreeningCompleted ?? null
  const dataQuality = raw?.dataQuality ?? null
  const materiality = normaliseText(raw?.materialityAssessmentDescription)
  const strategy = normaliseText(raw?.strategyDescription)

  const hasAnyInput =
    boundary !== null ||
    scope2Method !== null ||
    screeningCompleted !== null ||
    dataQuality !== null ||
    materiality.length > 0 ||
    strategy.length > 0

  const trace = [
    `organizationalBoundary=${boundary ?? 'null'}`,
    `scope2Method=${scope2Method ?? 'null'}`,
    `scope3ScreeningCompleted=${screeningCompleted ?? 'null'}`,
    `dataQuality=${dataQuality ?? 'null'}`,
    `materialityLength=${materiality.length}`,
    `strategyLength=${strategy.length}`
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
  const assumptions: string[] = [
    'Governance-scoren er gennemsnittet af seks dimensioner (0-100).',
    'Operational control, market-based Scope 2, fuld Scope 3 screening og primære data giver fuld score på deres dimensioner.',
    `Detaljerede beskrivelser vurderes ud fra ${factors.d1.partialTextLength} og ${factors.d1.detailedTextLength} tegn.`
  ]

  const metrics = [
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
    },
    evaluateTextDimension('materialityAssessment', materiality),
    evaluateTextDimension('strategy', strategy)
  ]

  const totalScore = metrics.reduce((sum, metric) => sum + metric.score, 0)
  const averageScore = totalScore / metrics.length
  const value = Number((averageScore * factors.d1.maxScore).toFixed(factors.d1.resultPrecision))

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

type TextDimensionResult = {
  label: string
  score: number
  warning?: string
}

function evaluateTextDimension(label: string, value: string): TextDimensionResult {
  if (value.length === 0) {
    return {
      label,
      score: 0,
      warning:
        label === 'materialityAssessment'
          ? 'Tilføj en kort beskrivelse af væsentlighedsvurderingen.'
          : 'Beskriv strategi, målsætninger og politikker for ESG-governance.'
    }
  }

  if (value.length < factors.d1.partialTextLength) {
    return {
      label,
      score: 0.6,
      warning:
        label === 'materialityAssessment'
          ? 'Uddyb væsentlighedsvurderingen med centrale risici og muligheder.'
          : 'Uddyb strategi og politikker, så governance-planen fremstår tydelig.'
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
