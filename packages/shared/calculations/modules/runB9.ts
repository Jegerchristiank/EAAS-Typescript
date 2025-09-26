/**
 * Beregning for modul B9 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runB9(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('B9', input)
  return {
    ...result,
    trace: [...result.trace, 'runB9'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
