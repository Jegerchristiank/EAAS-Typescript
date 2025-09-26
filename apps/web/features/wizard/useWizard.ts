/**
 * Hook der styrer wizardens tilstand og navigation.
 */
'use client'

import type { ModuleInput } from '@org/shared'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadWizardState, persistWizardState } from '../../lib/storage/localStorage'
import { wizardSteps } from './steps'

export type WizardState = ModuleInput

type WizardHook = {
  currentStep: number
  state: WizardState
  goToStep: (index: number) => void
  updateField: (key: string, value: unknown) => void
}

const AUTOSAVE_INTERVAL = 500

export function useWizard(): WizardHook {
  const [currentStep, setCurrentStep] = useState(0)
  const [state, setState] = useState<WizardState>(() => loadWizardState())

  useEffect(() => {
    const timer = setInterval(() => {
      persistWizardState(state)
    }, AUTOSAVE_INTERVAL)
    return () => clearInterval(timer)
  }, [state])

  const goToStep = useCallback((index: number) => {
    setCurrentStep(Math.max(0, Math.min(index, wizardSteps.length - 1)))
  }, [])

  const updateField = useCallback((key: string, value: unknown) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }, [])

  return useMemo(
    () => ({ currentStep, state, goToStep, updateField }),
    [currentStep, state, goToStep, updateField]
  )
}
