/**
 * Beregning for modul C4 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runC4(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('C4', input)
  return {
    ...result,
    trace: [...result.trace, 'runC4'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
