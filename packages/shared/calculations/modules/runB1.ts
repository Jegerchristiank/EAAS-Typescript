/**
 * Beregning for modul B1 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runB1(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('B1', input)
  return {
    ...result,
    trace: [...result.trace, 'runB1'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
