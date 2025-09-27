/**
 * Beregning for modul B11 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runB11(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('B11', input)
  return {
    ...result,
    trace: [...result.trace, 'runB11'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
