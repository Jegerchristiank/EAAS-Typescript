/**
 * Beregning for modul C7 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runC7(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('C7', input)
  return {
    ...result,
    trace: [...result.trace, 'runC7'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
