/**
 * Beregning for modul B7 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runB7(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('B7', input)
  return {
    ...result,
    trace: [...result.trace, 'runB7'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
