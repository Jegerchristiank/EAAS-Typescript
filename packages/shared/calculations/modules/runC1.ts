/**
 * Beregning for modul C1 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runC1(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('C1', input)
  return {
    ...result,
    trace: [...result.trace, 'runC1'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
