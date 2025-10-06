'use client'

import { useMemo } from 'react'

import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { isModuleRelevant } from '../../src/modules/wizard/profile'
import { wizardSteps, type WizardScope } from './steps'
import { useWizardContext } from './useWizard'

const scopeOrder: WizardScope[] = ['Scope 1', 'Scope 2', 'Scope 3', 'Governance']

function parseTimestamp(timestamp: number | undefined): Date | null {
  if (typeof timestamp !== 'number') {
    return null
  }
  const parsed = new Date(timestamp)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatTimestamp(date: Date | null): string {
  if (!date) {
    return 'Ukendt tidspunkt'
  }

  try {
    return new Intl.DateTimeFormat('da-DK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  } catch (error) {
    console.warn('Kunne ikke formatere tidspunkt', error)
    return date.toLocaleString()
  }
}

type ProfileSwitcherProps = {
  heading?: string | null
  description?: string | null
  showCreateButton?: boolean
  className?: string
}

export function ProfileSwitcher({
  heading = 'Gemte profiler',
  description = 'Administrer virksomhedsprofiler og skift mellem forskellige scopes.',
  showCreateButton = true,
  className,
}: ProfileSwitcherProps): JSX.Element {
  const { activeProfileId, profiles, createProfile, switchProfile, renameProfile, duplicateProfile, deleteProfile } =
    useWizardContext()

  const sortedProfiles = useMemo(
    () =>
      Object.values(profiles).sort((a, b) => {
        if (a.id === activeProfileId) {
          return -1
        }
        if (b.id === activeProfileId) {
          return 1
        }
        const updatedA = parseTimestamp(a.updatedAt)?.getTime() ?? 0
        const updatedB = parseTimestamp(b.updatedAt)?.getTime() ?? 0
        if (updatedA === updatedB) {
          return a.name.localeCompare(b.name)
        }
        return updatedB - updatedA
      }),
    [activeProfileId, profiles]
  )

  const handleCreate = () => {
    createProfile()
  }

  const handleRename = (profileId: string) => {
    const current = profiles[profileId]
    if (!current) {
      return
    }
    const nextName = window.prompt('Nyt profilnavn', current.name)
    if (nextName) {
      renameProfile(profileId, nextName)
    }
  }

  const handleDuplicate = (profileId: string) => {
    duplicateProfile(profileId)
  }

  const handleDelete = (profileId: string) => {
    const target = profiles[profileId]
    if (!target) {
      return
    }
    const confirmation = window.confirm(`Slet "${target.name}"? Handling kan ikke fortrydes.`)
    if (confirmation) {
      deleteProfile(profileId)
    }
  }

  const computeScopeCoverage = (profileId: string) => {
    const entry = profiles[profileId]
    if (!entry) {
      return scopeOrder.map((scope) => ({ scope, isActive: false }))
    }
    const coverage = new Set<WizardScope>()
    for (const step of wizardSteps) {
      if (isModuleRelevant(entry.profile, step.id)) {
        coverage.add(step.scope)
      }
    }
    return scopeOrder.map((scope) => ({ scope, isActive: coverage.has(scope) }))
  }

  return (
    <section className={['ds-profile-switcher', 'ds-card', 'ds-stack', className].filter(Boolean).join(' ')}>
      {(heading || description || showCreateButton) && (
        <header className="ds-profile-switcher__header">
          <div className="ds-stack-sm">
            {heading && <h2 className="ds-heading-sm">{heading}</h2>}
            {description && <p className="ds-text-subtle">{description}</p>}
          </div>
          {showCreateButton && (
            <PrimaryButton className="ds-button--sm" onClick={handleCreate}>
              Ny profil
            </PrimaryButton>
          )}
        </header>
      )}

      <ul className="ds-profile-switcher__list" role="list">
        {sortedProfiles.map((profile) => {
          const scopes = computeScopeCoverage(profile.id)
          const lastUpdatedDate = parseTimestamp(profile.updatedAt)
          const lastUpdated = formatTimestamp(lastUpdatedDate)
          const isoUpdatedAt = lastUpdatedDate?.toISOString()
          const isActive = profile.id === activeProfileId

          return (
            <li
              key={profile.id}
              className="ds-profile-card ds-card ds-card--muted"
              data-active={isActive ? 'true' : undefined}
            >
              <div className="ds-stack-sm">
                <div className="ds-profile-card__heading">
                  <h3 className="ds-heading-sm">{profile.name}</h3>
                  {isActive && (
                    <span className="ds-status-badge" data-status="active">
                      Aktiv
                    </span>
                  )}
                </div>
                <div className="ds-profile-card__meta">
                  <time
                    className="ds-status-badge"
                    data-status="timestamp"
                    dateTime={isoUpdatedAt ?? undefined}
                  >
                    Sidst opdateret {lastUpdated}
                  </time>
                </div>
                <div className="ds-cluster">
                  {scopes.map((entry) => (
                    <span
                      key={`${profile.id}-${entry.scope}`}
                      className="ds-status-badge"
                      data-status={entry.isActive ? 'active' : 'inactive'}
                    >
                      {entry.scope}
                    </span>
                  ))}
                </div>
              </div>

              <div className="ds-profile-card__actions">
                <PrimaryButton className="ds-button--sm" onClick={() => switchProfile(profile.id)} disabled={isActive}>
                  Vælg profil
                </PrimaryButton>
                <PrimaryButton
                  className="ds-button--sm"
                  variant="ghost"
                  onClick={() => handleRename(profile.id)}
                >
                  Omdøb
                </PrimaryButton>
                <PrimaryButton
                  className="ds-button--sm"
                  variant="ghost"
                  onClick={() => handleDuplicate(profile.id)}
                >
                  Dupliker
                </PrimaryButton>
                <PrimaryButton
                  className="ds-button--sm"
                  variant="ghost"
                  onClick={() => handleDelete(profile.id)}
                  disabled={sortedProfiles.length === 1}
                >
                  Slet
                </PrimaryButton>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
