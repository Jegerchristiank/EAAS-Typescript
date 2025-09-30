/**
 * Fælles typer for ESG-input, moduler og beregningsresultater.
 */

import type {
  A1Input,
  A2Input,
  A3Input,
  A4Input,
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
  C6Input,
  C7Input,
  C8Input,
  C9Input,
  C10Input,
  C11Input,
  C12Input,
  C13Input,
  C14Input,
  C15Input,
  D1Input,
  PlanningModuleInput
} from './schema'


export const moduleIds = [
  'A1',
  'A2',
  'A3',
  'A4',
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
  'C9',
  'C10',
  'C11',
  'C12',
  'C13',
  'C14',
  'C15',
  'D1'
] as const

export type ModuleId = (typeof moduleIds)[number]

type ModuleInputBase = Partial<Record<ModuleId, unknown>> & {
  A1?: A1Input | null | undefined
  A2?: A2Input | null | undefined
  A3?: A3Input | null | undefined
  A4?: A4Input | null | undefined
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
  C7?: C7Input | null | undefined
  C8?: C8Input | null | undefined
  C9?: C9Input | null | undefined
  C10?: C10Input | null | undefined
  C11?: C11Input | null | undefined
  C12?: C12Input | null | undefined
  C13?: C13Input | null | undefined
  C14?: C14Input | null | undefined
  C15?: C15Input | null | undefined
  D1?: D1Input | null | undefined
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
  PlanningModuleInput,
  A1Input,
  A2Input,
  A3Input,
  A4Input,
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
  C6Input,
  C7Input,
  C8Input,
  C9Input,
  C10Input,
  C11Input,
  C12Input,
  C13Input,
  C14Input,
  C15Input,
  D1Input
}

