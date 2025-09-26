/**
 * Fælles typer for ESG-input, moduler og beregningsresultater.
 */
import type { B1Input } from './schema'

export const moduleIds = [
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'B6',
  'B7',
  'B8',
  'B9',
  'B10',
  'B11',
  'C1',
  'C2',
  'C3',
  'C4',
  'C5',
  'C6',
  'C7',
  'C8',
  'C9'
] as const

export type ModuleId = (typeof moduleIds)[number]

export type ModuleInput = {
  B1?: B1Input
  [key: string]: unknown
}

 * Fælles typer for input, moduler og PDF.
 */
export type ModuleInput = Record<string, unknown>

export type ModuleResult = {
  value: number | string
  unit?: string
  assumptions: string[]
  trace: string[]
  warnings: string[]
}

export type ModuleCalculator = (input: ModuleInput) => ModuleResult

export type CalculatedModuleResult = {
  moduleId: ModuleId
  title: string
  result: ModuleResult
}

export type { B1Input }
