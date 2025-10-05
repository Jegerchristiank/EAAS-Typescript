/**
 * Landing page der leder brugeren ind i beregningsflowet.
 */
import Link from 'next/link'

import { PrimaryButton } from '../components/ui/PrimaryButton'

export default function HomePage(): JSX.Element {
  return (
    <main className="ds-hero">
      <section className="ds-stack-sm ds-constrain">
        <p className="ds-text-subtle">Version 4 · Ny UI-oplevelse</p>
        <h1 className="ds-heading-lg">ESG-rapportering</h1>
        <p className="ds-text-muted">
          Start beregning for at udfylde Scope 1- og Scope 2-modulerne, Scope 3-udvidelserne og governance-scoren for D1 –
          Metode &amp; governance. Alle indtastninger kan redigeres senere i wizard-flowet.
        </p>
        <PrimaryButton as={Link} href="/wizard">
          Start beregning
        </PrimaryButton>
      </section>
    </main>
  )
}
