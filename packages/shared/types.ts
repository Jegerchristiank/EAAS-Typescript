/**
 * Fælles typer for ESG-input, moduler og beregningsresultater.
 */

import type {
  B1Input,
  B2Input,
  B3Input,
  B4Input,
  B5Input,
  B6Input,
  B7Input,
  B8Input,
  B9Input,
  B10Input,
  B11Input,
  C1Input,
  C2Input,
  C3Input,
  C4Input,
  C5Input,
  C6Input
} from './schema'


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
  B8?: B8Input | null | undefined
  B9?: B9Input | null | undefined
  B10?: B10Input | null | undefined
  B11?: B11Input | null | undefined
  C1?: C1Input | null | undefined
  C2?: C2Input | null | undefined
  C3?: C3Input | null | undefined
  C4?: C4Input | null | undefined
  C5?: C5Input | null | undefined
  C6?: C6Input | null | undefined
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

export type {
  B1Input,
  B2Input,
  B3Input,
  B4Input,
  B5Input,
  B6Input,
  B7Input,
  B8Input,
  B9Input,
  B10Input,
  B11Input,
  C1Input,
  C2Input,
  C3Input,
  C4Input,
  C5Input,
  C6Input
}

