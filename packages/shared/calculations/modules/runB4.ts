/**
 * Beregning for modul B4 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runB4(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('B4', input)
  return {
    ...result,
    trace: [...result.trace, 'runB4'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
