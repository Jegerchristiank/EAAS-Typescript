/**
 * Beregning for modul C5 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runC5(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('C5', input)
  return {
    ...result,
    trace: [...result.trace, 'runC5'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
