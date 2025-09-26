/**
 * Beregning for modul B8 med deterministisk stub.
 */
import type { ModuleInput, ModuleResult } from '../../types'
import { createDefaultResult } from '../runModule'

export function runB8(input: ModuleInput): ModuleResult {
  const result = createDefaultResult('B8', input)
  return {
    ...result,
    trace: [...result.trace, 'runB8'],
    assumptions: [...result.assumptions, 'Stubberegning'],
    warnings: result.warnings
  }
}
