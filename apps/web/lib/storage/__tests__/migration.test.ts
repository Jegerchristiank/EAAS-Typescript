import { describe, expect, beforeEach, it } from 'vitest'

import {
  loadWizardProfile,
  loadWizardState,
  loadWizardStorage,
} from '../localStorage'

const LEGACY_STATE_KEY = 'esg-wizard-state'
const LEGACY_PROFILE_KEY = 'wizardProfile'

describe('wizard storage migration', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('migrates legacy keys into combined storage', () => {
    const legacyState = { moduleA: { answer: 42 } }
    const legacyProfile = { hasVehicles: true }

    window.localStorage.setItem(LEGACY_STATE_KEY, JSON.stringify(legacyState))
    window.localStorage.setItem(LEGACY_PROFILE_KEY, JSON.stringify(legacyProfile))

    const state = loadWizardState()
    const profile = loadWizardProfile()
    const storage = loadWizardStorage()

    expect(state).toStrictEqual(legacyState)
    expect(profile.hasVehicles).toBe(true)

    expect(storage.activeProfileId).toBeTruthy()
    const active = storage.profiles[storage.activeProfileId]
    expect(active).toBeDefined()
    if (!active) {
      throw new Error('Active profile was not created during migration')
    }
    expect(active.state).toStrictEqual(legacyState)
    expect(active.profile.hasVehicles).toBe(true)

    expect(window.localStorage.getItem(LEGACY_STATE_KEY)).toBeNull()
    expect(window.localStorage.getItem(LEGACY_PROFILE_KEY)).toBeNull()
  })

  it('normalises invalid profile values when loading combined storage', () => {
    const invalidStorage = {
      activeProfileId: 'invalid',
      profiles: {
        invalid: {
          id: 'invalid',
          name: 'Invalid profil',
          state: { nested: { value: 1 } },
          profile: {
            hasVehicles: 'ja tak',
            hasHeating: true,
            unknownKey: true,
          },
          createdAt: 1,
          updatedAt: 2,
        },
      },
    }

    window.localStorage.setItem('esg-wizard-profiles', JSON.stringify(invalidStorage))

    const storage = loadWizardStorage()

    const active = storage.profiles[storage.activeProfileId]
    expect(active).toBeDefined()
    if (!active) {
      throw new Error('Active profile blev ikke normaliseret korrekt')
    }

    expect(active.profile.hasHeating).toBe(true)
    expect(active.profile.hasVehicles).toBeNull()
    expect((active.profile as Record<string, unknown>)['unknownKey']).toBeUndefined()
  })
})
