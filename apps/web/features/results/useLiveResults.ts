/**
 * Hook der eksponerer de beregnede resultater for review-siden.
 */
'use client'

import { useMemo } from 'react'
import { aggregateResults } from '@org/shared'
import type { ModuleResult } from '@org/shared'
import { useWizard } from '../wizard/useWizard'

export function useLiveResults(): { results: ModuleResult[] } {
  const { state } = useWizard()

  return useMemo(() => ({ results: aggregateResults(state) }), [state])
}
