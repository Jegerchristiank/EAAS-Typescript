/**
 * Beregning for modul C2 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runC2(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('C2', input)
  return {
    ...result,
    trace: [...result.trace, 'runC2'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
