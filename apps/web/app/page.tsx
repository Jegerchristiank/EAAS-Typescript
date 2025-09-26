/**
 * Landing page der leder brugeren ind i beregningsflowet.
 */
import Link from 'next/link'
import { PrimaryButton } from '../components/ui/PrimaryButton'

export default function HomePage(): JSX.Element {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <section style={{ textAlign: 'center' }}>
        <h1>ESG-rapportering</h1>
        <p>Start beregning for at udfylde de nødvendige ESG-moduler.</p>
        <PrimaryButton as={Link} href="/wizard">
          Start beregning
        </PrimaryButton>
      </section>
    </main>
  )
}
