/**
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
