/**
 * Beregning for modul B1 der vurderer emissioner fra indkøbt elektricitet.
 */
import type { B1Input, ModuleInput, ModuleResult } from '../../types'
import { factors } from '../factors'

export type B1EmissionFactorSource = 'landefaktor' | 'residualMix'

export const b1EmissionFactorOptions: Array<{
  value: B1EmissionFactorSource
  label: string
  description: string
  defaultEmissionFactorKgPerKwh: number
}> = [
  {
    value: 'landefaktor',
    label: 'Landefaktor',
    description: 'National gennemsnitsfaktor for el (location-based).',
    defaultEmissionFactorKgPerKwh: 0.233
  },
  {
    value: 'residualMix',
    label: 'Residualmix',
    description: 'Residualmix til brug ved markedsbaseret opgørelse.',
    defaultEmissionFactorKgPerKwh: 0.377
  }
]

export const b1CalculationMethodOptions = [
  { value: 'locationBased', label: 'Location-based' },
  { value: 'marketBased', label: 'Market-based' }
] as const

type SanitisedB1 = {
  consumptionKwh: number
  emissionFactorKgPerKwh: number
  emissionFactorSource: B1EmissionFactorSource
  calculationMethod: (typeof b1CalculationMethodOptions)[number]['value']
  documentationQualityPercent: number
}

export function runB1(input: ModuleInput): ModuleResult {
  const warnings: string[] = []
  const assumptions = [
    'Emissioner beregnes som kWh × emissionsfaktor.',
    `Konvertering fra kg til ton: ${factors.b1.kgToTonnes}.`
  ]

  const raw = (input.B1 ?? {}) as B1Input
  const sanitised = normaliseInput(raw, warnings)

  const emissionsKg = sanitised.consumptionKwh * sanitised.emissionFactorKgPerKwh
  const emissionsTonnes = emissionsKg * factors.b1.kgToTonnes
  const value = Number(emissionsTonnes.toFixed(factors.b1.resultPrecision))

  if (sanitised.documentationQualityPercent < 60) {
    warnings.push(
      'Dokumentationskvaliteten er under 60%. Overvej at forbedre data eller anvende konservativ tilgang.'
    )
  }

  return {
    value,
    unit: factors.b1.unit,
    assumptions,
    trace: [
      `consumptionKwh=${sanitised.consumptionKwh}`,
      `emissionFactorSource=${sanitised.emissionFactorSource}`,
      `emissionFactorKgPerKwh=${sanitised.emissionFactorKgPerKwh}`,
      `calculationMethod=${sanitised.calculationMethod}`,
      `documentationQualityPercent=${sanitised.documentationQualityPercent}`,
      `emissionsKg=${emissionsKg}`,
      `emissionsTonnes=${emissionsTonnes}`
    ],
    warnings
  }
}

function normaliseInput(raw: B1Input, warnings: string[]): SanitisedB1 {
  const hasAnyValue =
    raw != null &&
    Object.values(raw).some((value) => value != null && value !== '' && !Number.isNaN(Number(value)))

  const consumption = toNonNegativeNumber(raw?.consumptionKwh, 'consumptionKwh', warnings, hasAnyValue)
  const source = toEmissionFactorSource(raw?.emissionFactorSource, warnings)
  const emissionFactor = toEmissionFactor(
    raw?.emissionFactorKgPerKwh,
    source,
    warnings,
    hasAnyValue
  )
  const method = toCalculationMethod(raw?.calculationMethod, warnings)
  const documentationQuality = toDocumentationQuality(
    raw?.documentationQualityPercent,
    warnings,
    hasAnyValue
  )

  return {
    consumptionKwh: consumption,
    emissionFactorSource: source,
    emissionFactorKgPerKwh: emissionFactor,
    calculationMethod: method,
    documentationQualityPercent: documentationQuality
  }
}

function toNonNegativeNumber(
  value: number | null | undefined,
  field: keyof B1Input,
  warnings: string[],
  emitMissingWarning: boolean
): number {
  if (value == null || Number.isNaN(value)) {
    if (emitMissingWarning) {
      warnings.push(`Feltet ${String(field)} mangler og behandles som 0.`)
    }
    return 0
  }
  if (value < 0) {
    warnings.push(`Feltet ${String(field)} kan ikke være negativt. 0 anvendes i stedet.`)
    return 0
  }
  return value
}

function toEmissionFactor(
  value: number | null | undefined,
  source: B1EmissionFactorSource,
  warnings: string[],
  emitMissingWarning: boolean
): number {
  if (value == null || Number.isNaN(value)) {
    if (emitMissingWarning) {
      const option = b1EmissionFactorOptions.find((item) => item.value === source)
      warnings.push(
        `Emissionsfaktor mangler. Standard for ${option?.label ?? source} anvendes: ${option?.defaultEmissionFactorKgPerKwh} kg CO2e/kWh.`
      )
    }
    return (
      b1EmissionFactorOptions.find((item) => item.value === source)?.defaultEmissionFactorKgPerKwh ??
      b1EmissionFactorOptions[0].defaultEmissionFactorKgPerKwh
    )
  }
  if (value < 0) {
    warnings.push(`Feltet emissionFactorKgPerKwh kan ikke være negativt. 0 anvendes i stedet.`)
    return 0
  }
  return value
}

function toEmissionFactorSource(
  value: B1Input['emissionFactorSource'],
  warnings: string[]
): B1EmissionFactorSource {
  if (value === 'landefaktor' || value === 'residualMix') {
    return value
  }
  if (value != null) {
    warnings.push('Ukendt emissionsfaktorkilde. Landefaktor anvendes som standard.')
  }
  return 'landefaktor'
}

function toCalculationMethod(
  value: B1Input['calculationMethod'],
  warnings: string[]
): (typeof b1CalculationMethodOptions)[number]['value'] {
  if (value === 'locationBased' || value === 'marketBased') {
    return value
  }
  if (value != null) {
    warnings.push('Ukendt beregningsmetode. Location-based anvendes som standard.')
  }
  return 'locationBased'
}

function toDocumentationQuality(
  value: number | null | undefined,
  warnings: string[],
  emitMissingWarning: boolean
): number {
  if (value == null || Number.isNaN(value)) {
    if (emitMissingWarning) {
      warnings.push('Dokumentationskvalitet mangler og behandles som 100%.')
    }
    return 100
  }
  if (value < 0) {
    warnings.push('Dokumentationskvalitet kan ikke være negativ. 0% anvendes i stedet.')
    return 0
  }
  if (value > 100) {
    warnings.push('Dokumentationskvalitet er begrænset til 100%.')
    return 100
  }
  return value
}
