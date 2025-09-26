/**
 * Beregning for modul B5 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runB5(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('B5', input)
  return {
    ...result,
    trace: [...result.trace, 'runB5'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
