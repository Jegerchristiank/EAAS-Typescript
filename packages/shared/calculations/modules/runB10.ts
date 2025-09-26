/**
 * Beregning for modul B10 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runB10(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('B10', input)
  return {
    ...result,
    trace: [...result.trace, 'runB10'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
