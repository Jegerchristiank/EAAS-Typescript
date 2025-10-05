/**
 * Hook der styrer wizardens tilstand og navigation.
 */
'use client'


import type { ModuleInput } from '@org/shared'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  loadWizardProfile,
  loadWizardState,
  persistWizardProfile,
  persistWizardState,
} from '../../lib/storage/localStorage'
import { wizardSteps } from './steps'
import type { WizardProfileKey } from '../../src/modules/wizard/profile'
import { type WizardProfile } from '../../src/modules/wizard/profile'

export type WizardState = ModuleInput

type WizardHook = {
  currentStep: number
  state: WizardState
  goToStep: (index: number) => void
  updateField: (key: string, value: unknown) => void
  profile: WizardProfile
  updateProfile: (key: WizardProfileKey, value: boolean | null) => void
}

const AUTOSAVE_DELAY = 800
const DEFAULT_STEP_INDEX = wizardSteps.findIndex((step) => step.status === 'ready')
const INITIAL_STEP = DEFAULT_STEP_INDEX === -1 ? 0 : DEFAULT_STEP_INDEX

export function useWizard(): WizardHook {
  const [currentStep, setCurrentStep] = useState(INITIAL_STEP)
  const [state, setState] = useState<WizardState>(() => loadWizardState())
  const [profile, setProfile] = useState<WizardProfile>(() => loadWizardProfile())
  const stateRef = useRef(state)
  const profileRef = useRef(profile)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      persistWizardState(state)
    }, AUTOSAVE_DELAY)
    return () => {
      window.clearTimeout(timer)
    }
  }, [state])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      persistWizardProfile(profile)
    }, AUTOSAVE_DELAY)
    return () => {
      window.clearTimeout(timer)
    }
  }, [profile])

  useEffect(() => {
    const handleBeforeUnload = () => {
      persistWizardState(stateRef.current)
      persistWizardProfile(profileRef.current)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const goToStep = useCallback((index: number) => {
    setCurrentStep(Math.max(0, Math.min(index, wizardSteps.length - 1)))
  }, [])

  const updateField = useCallback((key: string, value: unknown) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateProfile = useCallback((key: WizardProfileKey, value: boolean | null) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }, [])

  return useMemo(
    () => ({ currentStep, state, goToStep, updateField, profile, updateProfile }),
    [currentStep, state, goToStep, updateField, profile, updateProfile]
  )
}
