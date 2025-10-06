/**
 * Landing page der leder brugeren ind i beregningsflowet.
 */
'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { PrimaryButton } from '../components/ui/PrimaryButton'
import { ProfileSwitcher } from '../features/wizard/ProfileSwitcher'
import { WizardProvider, useWizardContext } from '../features/wizard/useWizard'

export default function HomePage(): JSX.Element {
  return (
    <WizardProvider>
      <LandingContent />
    </WizardProvider>
  )
}

function LandingContent(): JSX.Element {
  const router = useRouter()
  const { createProfile, switchProfile, profiles, activeProfileId } = useWizardContext()

  const latestProfile = useMemo(() => {
    const entries = Object.values(profiles)
    if (entries.length === 0) {
      return undefined
    }
    return entries.reduce((latest, entry) => (entry.updatedAt > latest.updatedAt ? entry : latest), entries[0])
  }, [profiles])

  const handleCreateProfile = () => {
    createProfile()
    router.push('/wizard')
  }

  const handleOpenLatestProfile = () => {
    if (!latestProfile) {
      return
    }
    if (latestProfile.id !== activeProfileId) {
      switchProfile(latestProfile.id)
    }
    router.push('/wizard')
  }

  return (
    <main className="ds-hero">
      <div className="ds-stack ds-constrain">
        <section className="ds-stack-sm">
          <p className="ds-text-subtle">Version 4 · Ny UI-oplevelse</p>
          <h1 className="ds-heading-lg">ESG-rapportering</h1>
          <p className="ds-text-muted">
            Opret eller genåbn en virksomhedsprofil for at afgrænse Scope 1-, Scope 2- og Scope 3-modulerne samt governance
            flowet. Dine valg gemmes automatisk og kan altid justeres i wizardens venstre kolonne.
          </p>
          <div className="ds-cluster">
            <PrimaryButton onClick={handleCreateProfile}>Ny profil</PrimaryButton>
            <PrimaryButton onClick={handleOpenLatestProfile} disabled={!latestProfile}>
              Åbn seneste profil
            </PrimaryButton>
          </div>
          <p className="ds-text-subtle">
            {latestProfile ? `Seneste profil: ${latestProfile.name}` : 'Ingen profiler oprettet endnu.'}
          </p>
        </section>

        <section className="ds-card ds-stack">
          <h2 className="ds-heading-sm">Sådan fungerer det</h2>
          <ol className="ds-list">
            <li>Start med at udfylde virksomhedsprofilen for at aktivere relevante scope-moduler.</li>
            <li>Gå trin-for-trin gennem modulerne og udfyld datafelter med jeres tal og beskrivelser.</li>
            <li>Afslut med review-siden, hvor du kan downloade rapporten eller justere profilvalg.</li>
          </ol>
        </section>

        <ProfileSwitcher
          heading="Administrer profiler"
          description="Få overblik over gemte profiler, dupliker opsætninger eller skift aktiv profil."
          showCreateButton={false}
        />
      </div>
    </main>
  )
}
