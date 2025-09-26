/**
 * Beregning for modul C8 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runC8(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('C8', input)
  return {
    ...result,
    trace: [...result.trace, 'runC8'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
