/**
 * Beregning for modul B3 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runB3(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('B3', input)
  return {
    ...result,
    trace: [...result.trace, 'runB3'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
