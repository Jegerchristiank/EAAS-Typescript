/**
 * Grundlayout for Next.js appen og globale wrappers.
 */
import './globals.css'
import '../styles/design-system.css'
import AnalyticsProvider from './analytics-provider'
import { FeatureFlagProvider } from '../lib/feature-flags/FeatureFlagProvider'
import { readFeatureFlagCookies } from '../lib/feature-flags/server'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ESG-rapportering',
  description: 'Start ESG-beregninger direkte i browseren'
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const initialFlags = readFeatureFlagCookies()

  return (
    <html lang="da">
      <body>
        <FeatureFlagProvider initialFlags={initialFlags}>{children}</FeatureFlagProvider>
        <AnalyticsProvider />
      </body>
    </html>
  )
}
