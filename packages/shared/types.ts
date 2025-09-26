/**
 * Fælles typer for input, moduler og PDF.
 */
import type { B1Input } from './schema'

export type ModuleInput = {
  B1?: B1Input
  [key: string]: unknown
}

export type ModuleResult = {
  moduleId: string
  title?: string
  value: number | string
  unit?: string
  assumptions: string[]
  trace: string[]
  warnings: string[]
}

export type ModuleCalculator = (input: ModuleInput) => ModuleResult

export type { B1Input }
