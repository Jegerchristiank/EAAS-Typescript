/**
 * Beregning for modul C9 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runC9(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('C9', input)
  return {
    ...result,
    trace: [...result.trace, 'runC9'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
