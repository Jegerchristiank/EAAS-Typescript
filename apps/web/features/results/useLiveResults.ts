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
    const priorityOrder: Record<string, number> = { B1: 0, B2: 1, B3: 2, B4: 3, B5: 4, B6: 5 }
    const priorityOrder: Record<string, number> = { B1: 0, B2: 1, B3: 2, B4: 3, B5: 4 }
    const sorted = [...aggregated].sort((a, b) => {
      const priorityA = priorityOrder[a.moduleId] ?? Number.POSITIVE_INFINITY
      const priorityB = priorityOrder[b.moduleId] ?? Number.POSITIVE_INFINITY
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }
      return a.moduleId.localeCompare(b.moduleId)
    })

    return { results: sorted }
  }, [state])
}
