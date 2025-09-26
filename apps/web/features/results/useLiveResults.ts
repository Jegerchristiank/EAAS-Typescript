/**
 * Hook der eksponerer de beregnede resultater for review-siden.
 */
'use client'

import { useMemo } from 'react'
import { aggregateResults } from '@org/shared'
import type { CalculatedModuleResult } from '@org/shared'
import { useWizard } from '../wizard/useWizard'

export function useLiveResults(): { results: CalculatedModuleResult[] } {
  const { state } = useWizard()

  return useMemo(() => {
    const aggregated = aggregateResults(state)
    const sorted = [...aggregated].sort((a, b) => {
      if (a.moduleId === 'B1' && b.moduleId !== 'B1') {
        return -1
      }
      if (b.moduleId === 'B1' && a.moduleId !== 'B1') {
        return 1
      }
      return a.moduleId.localeCompare(b.moduleId)
    })

    return { results: sorted }
  }, [state])
import type { ModuleResult } from '@org/shared'
import { useWizard } from '../wizard/useWizard'

export function useLiveResults(): { results: ModuleResult[] } {
  const { state } = useWizard()

  return useMemo(() => ({ results: aggregateResults(state) }), [state])
}
