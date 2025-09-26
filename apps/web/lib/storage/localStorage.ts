/**
 * Helper-funktioner til at gemme og hente wizard-state fra localStorage.
 */
'use client'

import type { ModuleInput } from '@org/shared'

const STORAGE_KEY = 'esg-wizard-state'

export function loadWizardState(): ModuleInput {

const STORAGE_KEY = 'esg-wizard-state'

export function loadWizardState(): Record<string, unknown> {
  if (typeof window === 'undefined') {
    return {}
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ModuleInput) : {}
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
  } catch (error) {
    console.warn('Kunne ikke læse wizard-state', error)
    return {}
  }
}

export function persistWizardState(state: ModuleInput): void {
export function persistWizardState(state: Record<string, unknown>): void {
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
