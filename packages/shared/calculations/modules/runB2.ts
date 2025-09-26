/**
 * Beregning for modul B2 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runB2(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('B2', input)
  return {
    ...result,
    trace: [...result.trace, 'runB2'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
