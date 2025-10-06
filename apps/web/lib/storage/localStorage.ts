/**
 * Helper-funktioner til at gemme og hente wizard-state fra localStorage.
 */
'use client'

import { ALL_PROFILE_KEYS, createInitialWizardProfile, type WizardProfile } from '../../src/modules/wizard/profile'

import type { ModuleInput } from '@org/shared'

type UnknownRecord = Record<string, unknown>

export type PersistedWizardProfile = {
  id: string
  name: string
  state: ModuleInput
  profile: WizardProfile
  createdAt: number
  updatedAt: number
}

export type PersistedWizardStorage = {
  activeProfileId: string
  profiles: Record<string, PersistedWizardProfile>
}

const STORAGE_KEY = 'esg-wizard-profiles'
const LEGACY_STATE_KEY = 'esg-wizard-state'
const LEGACY_PROFILE_KEY = 'wizardProfile'

const DEFAULT_PROFILE_ID = 'default'
const DEFAULT_PROFILE_NAME = 'Profil 1'

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function safeParse<T>(raw: string | null): T | undefined {
  if (!raw) {
    return undefined
  }

  try {
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn('Kunne ikke parse localStorage-indhold', error)
    return undefined
  }
}

function sanitiseWizardProfile(value: unknown): WizardProfile {
  const base = createInitialWizardProfile()

  if (!isRecord(value)) {
    return base
  }

  const record = value as UnknownRecord

  for (const key of ALL_PROFILE_KEYS) {
    const raw = record[key]
    if (raw === true || raw === false || raw === null) {
      base[key] = raw
    }
  }

  return base
}

function createProfileEntry(id: string, name: string, state: ModuleInput = {} as ModuleInput): PersistedWizardProfile {
  const now = Date.now()
  return {
    id,
    name,
    state,
    profile: createInitialWizardProfile(),
    createdAt: now,
    updatedAt: now,
  }
}

function normaliseProfile(id: string, value: unknown, fallbackName: string): PersistedWizardProfile {
  const base = createProfileEntry(id, fallbackName)

  if (!isRecord(value)) {
    return base
  }

  const record = value as UnknownRecord
  const profileName =
    typeof record['name'] === 'string' && record['name'].trim().length > 0 ? (record['name'] as string) : base.name
  const state = isRecord(record['state']) ? (record['state'] as ModuleInput) : base.state
  const parsedProfile = sanitiseWizardProfile(record['profile'])
  const createdAt = typeof record['createdAt'] === 'number' ? (record['createdAt'] as number) : base.createdAt
  const updatedAt = typeof record['updatedAt'] === 'number' ? (record['updatedAt'] as number) : createdAt

  return {
    id,
    name: profileName,
    state,
    profile: parsedProfile,
    createdAt,
    updatedAt,
  }
}

function normaliseStorage(raw: unknown): PersistedWizardStorage | undefined {
  if (!isRecord(raw)) {
    return undefined
  }

  const storageRecord = raw as UnknownRecord
  const profilesRaw = storageRecord['profiles']
  if (!isRecord(profilesRaw)) {
    return undefined
  }

  const entries = Object.entries(profilesRaw)
  if (entries.length === 0) {
    return undefined
  }

  const profiles = entries.reduce<Record<string, PersistedWizardProfile>>((acc, [id, value], index) => {
    acc[id] = normaliseProfile(id, value, `Profil ${index + 1}`)
    return acc
  }, {})

  const fallbackActiveId = Object.keys(profiles)[0]!
  const rawActiveId = storageRecord['activeProfileId']
  const activeProfileId =
    typeof rawActiveId === 'string' && profiles[rawActiveId]
      ? rawActiveId
      : fallbackActiveId

  return { activeProfileId, profiles }
}

function migrateLegacyStorage(): PersistedWizardStorage {
  const state = safeParse<ModuleInput>(window.localStorage.getItem(LEGACY_STATE_KEY)) ?? {}
  const profileOverrides = safeParse<Partial<WizardProfile>>(window.localStorage.getItem(LEGACY_PROFILE_KEY)) ?? {}

  const entry = createProfileEntry(DEFAULT_PROFILE_ID, DEFAULT_PROFILE_NAME, state)
  entry.profile = sanitiseWizardProfile(profileOverrides)

  const storage: PersistedWizardStorage = {
    activeProfileId: entry.id,
    profiles: { [entry.id]: entry },
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
    window.localStorage.removeItem(LEGACY_STATE_KEY)
    window.localStorage.removeItem(LEGACY_PROFILE_KEY)
  } catch (error) {
    console.warn('Kunne ikke migrere wizard-data', error)
  }

  return storage
}

function ensureStorage(): PersistedWizardStorage {
  if (typeof window === 'undefined') {
    return {
      activeProfileId: DEFAULT_PROFILE_ID,
      profiles: { [DEFAULT_PROFILE_ID]: createProfileEntry(DEFAULT_PROFILE_ID, DEFAULT_PROFILE_NAME) },
    }
  }

  const parsed = safeParse<unknown>(window.localStorage.getItem(STORAGE_KEY))
  const storage = normaliseStorage(parsed ?? {})

  if (storage) {
    return storage
  }

  if (window.localStorage.getItem(LEGACY_STATE_KEY) || window.localStorage.getItem(LEGACY_PROFILE_KEY)) {
    return migrateLegacyStorage()
  }

  const fallbackProfile = createProfileEntry(DEFAULT_PROFILE_ID, DEFAULT_PROFILE_NAME)
  const fallbackStorage: PersistedWizardStorage = {
    activeProfileId: fallbackProfile.id,
    profiles: { [fallbackProfile.id]: fallbackProfile },
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackStorage))
  } catch (error) {
    console.warn('Kunne ikke initialisere wizard-storage', error)
  }

  return fallbackStorage
}

export function loadWizardStorage(): PersistedWizardStorage {
  return ensureStorage()
}

export function persistWizardStorage(storage: PersistedWizardStorage): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
  } catch (error) {
    console.warn('Kunne ikke gemme wizard-storage', error)
  }
}

export function loadWizardState(): ModuleInput {
  const storage = ensureStorage()
  const active = storage.profiles[storage.activeProfileId]
  return active?.state ?? {}
}

export function persistWizardState(state: ModuleInput): void {
  if (typeof window === 'undefined') {
    return
  }

  const storage = ensureStorage()
  const active = storage.profiles[storage.activeProfileId] ?? createProfileEntry(storage.activeProfileId, DEFAULT_PROFILE_NAME)
  storage.profiles[storage.activeProfileId] = {
    ...active,
    state,
    updatedAt: Date.now(),
  }

  persistWizardStorage(storage)
}

export function clearWizardState(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem(LEGACY_STATE_KEY)
  window.localStorage.removeItem(LEGACY_PROFILE_KEY)
}

export function loadWizardProfile(): WizardProfile {
  const storage = ensureStorage()
  const active = storage.profiles[storage.activeProfileId]
  return active?.profile ?? createInitialWizardProfile()
}

export function persistWizardProfile(profile: WizardProfile): void {
  if (typeof window === 'undefined') {
    return
  }

  const storage = ensureStorage()
  const active = storage.profiles[storage.activeProfileId] ?? createProfileEntry(storage.activeProfileId, DEFAULT_PROFILE_NAME)
  storage.profiles[storage.activeProfileId] = {
    ...active,
    profile: { ...createInitialWizardProfile(), ...profile },
    updatedAt: Date.now(),
  }

  persistWizardStorage(storage)
}
