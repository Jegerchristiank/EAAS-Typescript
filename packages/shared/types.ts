/**
 * Fælles typer for ESG-input, moduler og beregningsresultater.
 */

import type { B1Input, B2Input, B3Input, B4Input, B5Input, B6Input, B7Input } from './schema'


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

type ModuleInputBase = Partial<Record<ModuleId, unknown>> & {
  B1?: B1Input | null | undefined
  B2?: B2Input | null | undefined
  B3?: B3Input | null | undefined
  B4?: B4Input | null | undefined
  B5?: B5Input | null | undefined
  B6?: B6Input | null | undefined
  B7?: B7Input | null | undefined

}

export type ModuleInput = ModuleInputBase & Record<string, unknown>

export type ModuleResult = {
  value: number
  unit: string
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

export type { B1Input, B2Input, B3Input, B4Input, B5Input, B6Input, B7Input }

