/**
 * Beregning for modul B6 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runB6(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('B6', input)
  return {
    ...result,
    trace: [...result.trace, 'runB6'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
