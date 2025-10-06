/**
 * Hook der styrer wizardens tilstand og navigation.
 */
'use client'


import type { ModuleInput } from '@org/shared'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  loadWizardStorage,
  persistWizardStorage,
  type PersistedWizardProfile,
  type PersistedWizardStorage,
} from '../../lib/storage/localStorage'
import { wizardSteps } from './steps'
import type { WizardProfileKey } from '../../src/modules/wizard/profile'
import { createInitialWizardProfile, type WizardProfile } from '../../src/modules/wizard/profile'

export type WizardState = ModuleInput

export type WizardProfileId = string

export type WizardProfileEntry = PersistedWizardProfile

export type WizardProfileMap = Record<WizardProfileId, WizardProfileEntry>

export type ActiveProfileState = {
  id: WizardProfileId
  name: string
  state: WizardState
  profile: WizardProfile
}

export type WizardProfileSummary = {
  id: WizardProfileId
  name: string
  isActive: boolean
}

export type WizardHook = {
  currentStep: number
  state: WizardState
  activeState: WizardState
  profile: WizardProfile
  activeProfile: ActiveProfileState
  profiles: WizardProfileMap
  profileSummaries: WizardProfileSummary[]
  activeProfileId: WizardProfileId
  goToStep: (index: number) => void
  updateField: (key: string, value: unknown) => void
  updateProfile: (key: WizardProfileKey, value: boolean | null) => void
  createProfile: (name?: string) => void
  switchProfile: (profileId: WizardProfileId) => void
  renameProfile: (profileId: WizardProfileId, name: string) => void
  duplicateProfile: (profileId: WizardProfileId) => void
  deleteProfile: (profileId: WizardProfileId) => void
}

const AUTOSAVE_DELAY = 800
const DEFAULT_STEP_INDEX = wizardSteps.findIndex((step) => step.status === 'ready')
const INITIAL_STEP = DEFAULT_STEP_INDEX === -1 ? 0 : DEFAULT_STEP_INDEX

function generateProfileId(): WizardProfileId {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `profile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function cloneModuleInput(input: ModuleInput): ModuleInput {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(input)
    } catch (error) {
      console.warn('Kunne ikke structuredClone wizard-state, falder tilbage til JSON-clone', error)
    }
  }

  try {
    return JSON.parse(JSON.stringify(input)) as ModuleInput
  } catch (error) {
    console.warn('Kunne ikke JSON-clone wizard-state, genbruger eksisterende reference', error)
    return input
  }
}

export function useWizard(): WizardHook {
  const [currentStep, setCurrentStep] = useState(INITIAL_STEP)
  const [storage, setStorage] = useState<PersistedWizardStorage>(() => loadWizardStorage())
  const storageRef = useRef(storage)

  useEffect(() => {
    storageRef.current = storage
  }, [storage])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      persistWizardStorage(storageRef.current)
    }, AUTOSAVE_DELAY)
    return () => {
      window.clearTimeout(timer)
    }
  }, [storage])

  useEffect(() => {
    const handleBeforeUnload = () => {
      persistWizardStorage(storageRef.current)
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
    setStorage((prev) => {
      const active = prev.profiles[prev.activeProfileId]
      if (!active) {
        return prev
      }
      const nextStorage: PersistedWizardStorage = {
        ...prev,
        profiles: {
          ...prev.profiles,
          [prev.activeProfileId]: {
            ...active,
            state: { ...active.state, [key]: value },
            updatedAt: Date.now(),
          },
        },
      }
      storageRef.current = nextStorage
      return nextStorage
    })
  }, [])

  const updateProfile = useCallback((key: WizardProfileKey, value: boolean | null) => {
    setStorage((prev) => {
      const active = prev.profiles[prev.activeProfileId]
      if (!active) {
        return prev
      }
      const nextStorage: PersistedWizardStorage = {
        ...prev,
        profiles: {
          ...prev.profiles,
          [prev.activeProfileId]: {
            ...active,
            profile: { ...active.profile, [key]: value },
            updatedAt: Date.now(),
          },
        },
      }
      storageRef.current = nextStorage
      return nextStorage
    })
  }, [])

  const createProfile = useCallback((name?: string) => {
    setCurrentStep(0)
    setStorage((prev) => {
      const id = generateProfileId()
      const profileName = name?.trim() || `Profil ${Object.keys(prev.profiles).length + 1}`
      const now = Date.now()
      const newProfile: PersistedWizardProfile = {
        id,
        name: profileName,
        state: {},
        profile: createInitialWizardProfile(),
        createdAt: now,
        updatedAt: now,
      }

      const nextStorage: PersistedWizardStorage = {
        activeProfileId: id,
        profiles: { ...prev.profiles, [id]: newProfile },
      }
      storageRef.current = nextStorage
      return nextStorage
    })
  }, [])

  const switchProfile = useCallback((profileId: WizardProfileId) => {
    setStorage((prev) => {
      if (!prev.profiles[profileId] || prev.activeProfileId === profileId) {
        return prev
      }
      const nextStorage: PersistedWizardStorage = {
        ...prev,
        activeProfileId: profileId,
      }
      storageRef.current = nextStorage
      return nextStorage
    })
  }, [])

  const renameProfile = useCallback((profileId: WizardProfileId, name: string) => {
    setStorage((prev) => {
      const target = prev.profiles[profileId]
      if (!target) {
        return prev
      }
      const trimmed = name.trim()
      if (trimmed.length === 0 || trimmed === target.name) {
        return prev
      }
      const nextStorage: PersistedWizardStorage = {
        ...prev,
        profiles: {
          ...prev.profiles,
          [profileId]: { ...target, name: trimmed, updatedAt: Date.now() },
        },
      }
      storageRef.current = nextStorage
      return nextStorage
    })
  }, [])

  const duplicateProfile = useCallback((profileId: WizardProfileId) => {
    setStorage((prev) => {
      const target = prev.profiles[profileId]
      if (!target) {
        return prev
      }
      const id = generateProfileId()
      const now = Date.now()
      const clone: PersistedWizardProfile = {
        id,
        name: `${target.name} (kopi)`,
        state: cloneModuleInput(target.state),
        profile: { ...target.profile },
        createdAt: now,
        updatedAt: now,
      }
      const nextStorage: PersistedWizardStorage = {
        activeProfileId: id,
        profiles: { ...prev.profiles, [id]: clone },
      }
      storageRef.current = nextStorage
      return nextStorage
    })
  }, [])

  const deleteProfile = useCallback((profileId: WizardProfileId) => {
    setStorage((prev) => {
      if (!prev.profiles[profileId]) {
        return prev
      }

      const nextProfiles = { ...prev.profiles }
      delete nextProfiles[profileId]

      if (Object.keys(nextProfiles).length === 0) {
        const id = generateProfileId()
        const now = Date.now()
        nextProfiles[id] = {
          id,
          name: 'Profil 1',
          state: {},
          profile: createInitialWizardProfile(),
          createdAt: now,
          updatedAt: now,
        }
        const nextStorage: PersistedWizardStorage = {
          activeProfileId: id,
          profiles: nextProfiles,
        }
        storageRef.current = nextStorage
        return nextStorage
      }

      const fallbackId = Object.keys(nextProfiles)[0] ?? prev.activeProfileId
      const nextActiveId = profileId === prev.activeProfileId ? fallbackId : prev.activeProfileId

      const nextStorage: PersistedWizardStorage = {
        activeProfileId: nextActiveId,
        profiles: nextProfiles,
      }
      storageRef.current = nextStorage
      return nextStorage
    })
  }, [])

  const activeProfile = storage.profiles[storage.activeProfileId]

  const value = useMemo(() => {
    const fallbackProfile: PersistedWizardProfile =
      activeProfile ?? {
        id: storage.activeProfileId,
        name: 'Profil 1',
        state: {},
        profile: createInitialWizardProfile(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

    const active: ActiveProfileState = {
      id: fallbackProfile.id,
      name: fallbackProfile.name,
      state: fallbackProfile.state,
      profile: fallbackProfile.profile,
    }

    const summaries: WizardProfileSummary[] = Object.values(storage.profiles).map((entry) => ({
      id: entry.id,
      name: entry.name,
      isActive: entry.id === fallbackProfile.id,
    }))

    return {
      currentStep,
      state: active.state,
      activeState: active.state,
      goToStep,
      updateField,
      profile: active.profile,
      updateProfile,
      activeProfile: active,
      profiles: storage.profiles,
      profileSummaries: summaries,
      activeProfileId: active.id,
      createProfile,
      switchProfile,
      renameProfile,
      duplicateProfile,
      deleteProfile,
    }
  }, [
    activeProfile,
    createProfile,
    currentStep,
    deleteProfile,
    duplicateProfile,
    goToStep,
    renameProfile,
    storage.profiles,
    storage.activeProfileId,
    switchProfile,
    updateField,
    updateProfile,
  ])

  useEffect(() => {
    return () => {
      persistWizardStorage(storageRef.current)
    }
  }, [])

  return value
}

const WizardContext = createContext<WizardHook | undefined>(undefined)

type WizardProviderProps = {
  children: ReactNode
}

export function WizardProvider({ children }: WizardProviderProps): JSX.Element {
  const value = useWizard()
  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}

export function useWizardContext(): WizardHook {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizardContext skal anvendes inden for en WizardProvider')
  }
  return context
}
