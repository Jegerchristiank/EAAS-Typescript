'use client'

import type {
  PersistedWizardProfile,
  PersistedWizardStorage,
  WizardPersistenceSnapshot,
} from '@org/shared'
import { createInitialWizardProfile } from '../../src/modules/wizard/profile'

export type PersistMetadata = {
  userId: string
  reason?: string
}

const API_BASE_URL = process.env['NEXT_PUBLIC_PERSISTENCE_BASE_URL'] ?? 'http://localhost:4010'
const API_TOKEN = process.env['NEXT_PUBLIC_PERSISTENCE_TOKEN'] ?? 'local-dev-token'

const DEFAULT_PROFILE_ID = 'default'
const DEFAULT_PROFILE_NAME = 'Profil 1'

export function createProfileEntry(
  id: string,
  name: string,
  state: Record<string, unknown> = {},
): PersistedWizardProfile {
  const now = Date.now()
  return {
    id,
    name,
    state,
    profile: createInitialWizardProfile(),
    createdAt: now,
    updatedAt: now,
    history: {},
    responsibilities: {},
    version: 1,
  }
}

export function createFallbackStorage(): PersistedWizardStorage {
  const profile = createProfileEntry(DEFAULT_PROFILE_ID, DEFAULT_PROFILE_NAME)
  return {
    activeProfileId: profile.id,
    profiles: { [profile.id]: profile },
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Persistence request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

export async function fetchWizardSnapshot(): Promise<WizardPersistenceSnapshot> {
  return request<WizardPersistenceSnapshot>('/wizard/snapshot')
}

export async function persistWizardStorage(
  storage: PersistedWizardStorage,
  metadata: PersistMetadata,
): Promise<WizardPersistenceSnapshot> {
  return request<WizardPersistenceSnapshot>('/wizard/snapshot', {
    method: 'PUT',
    body: JSON.stringify({ storage, metadata }),
  })
}
