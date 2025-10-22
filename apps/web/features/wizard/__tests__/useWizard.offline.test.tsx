import { act, render, screen, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createFallbackStorage,
  type PersistMetadata,
} from '../../../lib/storage/localStorage'
import type {
  PersistedWizardStorage,
  WizardPersistenceSnapshot,
} from '@org/shared'
import { WizardOfflineIndicator } from '../components/WizardOfflineIndicator'
import { WizardProvider, useWizardContext, type WizardHook } from '../useWizard'

function WizardObserver({ wizardRef }: { wizardRef: { current: WizardHook | null } }): JSX.Element {
  const wizard = useWizardContext()

  useEffect(() => {
    wizardRef.current = wizard
  }, [wizard, wizardRef])

  return <></>
}

describe('useWizard offline handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.clearAllTimers()
  })

  it('keeps local edits and surfaces the offline indicator when persistence fails', async () => {
    const storage = createFallbackStorage()
    const snapshot: WizardPersistenceSnapshot = {
      storage,
      auditLog: [],
      permissions: { canEdit: true, canPublish: false },
      user: { id: 'tester', roles: ['editor'] },
    }

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      if (!url.endsWith('/wizard/snapshot')) {
        return new Response('Not Found', { status: 404 })
      }

      if (!init || !init.method || init.method.toUpperCase() === 'GET') {
        return new Response('Service unavailable', { status: 503 })
      }

      const body = init.body
      if (typeof body === 'string') {
        const parsed = JSON.parse(body) as { storage: PersistedWizardStorage; metadata: PersistMetadata }
        snapshot.storage = parsed.storage
      }

      return new Response('Service unavailable', { status: 503 })
    })

    vi.stubGlobal('fetch', fetchMock)

    const wizardRef: { current: WizardHook | null } = { current: null }

    render(
      <WizardProvider>
        <WizardObserver wizardRef={wizardRef} />
        <WizardOfflineIndicator />
      </WizardProvider>,
    )

    await waitFor(() => {
      expect(wizardRef.current?.isReady).toBe(true)
    })

    const updateValue = { note: 'Gemmes lokalt' }

    await act(async () => {
      wizardRef.current?.updateField('B1', updateValue)
    })

    expect(wizardRef.current?.state['B1']).toEqual(updateValue)

    await waitFor(() => {
      expect(screen.getByTestId('wizard-offline-indicator')).toBeInTheDocument()
    })

    expect(wizardRef.current?.isOffline).toBe(true)
    expect(fetchMock).toHaveBeenCalled()
  })
})
