/**
 * Beregning for modul C6 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runC6(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('C6', input)
  return {
    ...result,
    trace: [...result.trace, 'runC6'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
