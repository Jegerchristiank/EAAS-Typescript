/**
 * Grundlayout for Next.js appen og globale wrappers.
 */
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ESG-rapportering',
  description: 'Start ESG-beregninger direkte i browseren'
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  )
}
