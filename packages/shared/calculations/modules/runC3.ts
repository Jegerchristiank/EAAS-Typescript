/**
 * Beregning for modul C3 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runC3(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('C3', input)
  return {
    ...result,
    trace: [...result.trace, 'runC3'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
