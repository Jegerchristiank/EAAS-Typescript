/**
 * Next.js konfiguration for webappen med streng typed import.
 */
import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  transpilePackages: ['@org/shared']
}

export default config
