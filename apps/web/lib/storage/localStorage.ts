/**
 * Helper-funktioner til at gemme og hente wizard-state fra localStorage.
 */
'use client'

import { createInitialWizardProfile, type WizardProfile } from '../../src/modules/wizard/profile'

import type { ModuleInput } from '@org/shared'

const STORAGE_KEY = 'esg-wizard-state'
const PROFILE_STORAGE_KEY = 'wizardProfile'

export function loadWizardState(): ModuleInput {
  if (typeof window === 'undefined') {
    return {}
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ModuleInput) : {}
  } catch (error) {
    console.warn('Kunne ikke læse wizard-state', error)
    return {}
  }
}

export function persistWizardState(state: ModuleInput): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Kunne ikke gemme wizard-state', error)
  }
}

export function clearWizardState(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(STORAGE_KEY)
}

export function loadWizardProfile(): WizardProfile {
  if (typeof window === 'undefined') {
    return createInitialWizardProfile()
  }
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) {
      return createInitialWizardProfile()
    }
    const parsed = JSON.parse(raw) as Partial<WizardProfile>
    return { ...createInitialWizardProfile(), ...parsed }
  } catch (error) {
    console.warn('Kunne ikke læse wizardProfile', error)
    return createInitialWizardProfile()
  }
}

export function persistWizardProfile(profile: WizardProfile): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } catch (error) {
    console.warn('Kunne ikke gemme wizardProfile', error)
  }
}
