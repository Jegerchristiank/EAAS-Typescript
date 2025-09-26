/**
 * Koordinerer modulberegninger og aggregerede resultater.
 */
import type { ModuleCalculator, ModuleInput, ModuleResult } from '../types'
import { factors } from './factors'
import { runB1 } from './modules/runB1'
import { runB2 } from './modules/runB2'
import { runB3 } from './modules/runB3'
import { runB4 } from './modules/runB4'
import { runB5 } from './modules/runB5'
import { runB6 } from './modules/runB6'
import { runB7 } from './modules/runB7'
import { runB8 } from './modules/runB8'
import { runB9 } from './modules/runB9'
import { runB10 } from './modules/runB10'
import { runB11 } from './modules/runB11'
import { runC1 } from './modules/runC1'
import { runC2 } from './modules/runC2'
import { runC3 } from './modules/runC3'
import { runC4 } from './modules/runC4'
import { runC5 } from './modules/runC5'
import { runC6 } from './modules/runC6'
import { runC7 } from './modules/runC7'
import { runC8 } from './modules/runC8'
import { runC9 } from './modules/runC9'

export const moduleCalculators: Record<string, ModuleCalculator> = {
  B1: runB1,
  B2: runB2,
  B3: runB3,
  B4: runB4,
  B5: runB5,
  B6: runB6,
  B7: runB7,
  B8: runB8,
  B9: runB9,
  B10: runB10,
  B11: runB11,
  C1: runC1,
  C2: runC2,
  C3: runC3,
  C4: runC4,
  C5: runC5,
  C6: runC6,
  C7: runC7,
  C8: runC8,
  C9: runC9
}

export type ModuleId = keyof typeof moduleCalculators

export function createDefaultResult(moduleId: string, input: ModuleInput): ModuleResult {
  const rawValue = input[moduleId]
  const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue ?? 0)

  return {
    value: Number.isFinite(numericValue) ? numericValue * factors.defaultFactor : 0,
    unit: 'point',
    assumptions: [`Standardfaktor: ${factors.defaultFactor}`],
    trace: [`Input(${moduleId})=${String(rawValue ?? '')}`],
    warnings: []
  }
}

export function runModule(moduleId: ModuleId, input: ModuleInput): ModuleResult {
  const calculator = moduleCalculators[moduleId]
  return calculator(input)
}

export function aggregateResults(input: ModuleInput): ModuleResult[] {
  return (Object.keys(moduleCalculators) as ModuleId[]).map((moduleId) =>
    runModule(moduleId, input)
  )
}
