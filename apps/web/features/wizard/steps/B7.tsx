/**
 * Wizardtrin for modul B7 – dokumenteret vedvarende el.
 */
'use client'

import type { B7Input } from '@org/shared'
import { runB7 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

export type B7FormState = B7Input & {
  residualFactorSource?: string | null
  certificateSharePercent?: number | null
  documentationFileName?: string | null
}

const EMPTY_B7: B7FormState = {
  documentedRenewableKwh: null,
  residualEmissionFactorKgPerKwh: null,
  documentationQualityPercent: null,
  residualFactorSource: null,
  certificateSharePercent: null,
  documentationFileName: null
}

export const B7Step = createConfiguredModuleStep<'B7', B7FormState>({
  moduleId: 'B7',
  title: 'B7 – Dokumenteret vedvarende el',
  description: 'Angiv hvor meget vedvarende el der dokumenteres via certifikater og hvilke residualfaktorer der anvendes.',
  emptyState: EMPTY_B7,
  fields: [
    {
      type: 'number',
      key: 'documentedRenewableKwh',
      label: 'Dokumenteret kWh',
      unit: 'kWh',
      description: 'Mængde el dækket af certifikater eller garantier.'
    },
    {
      type: 'percent',
      key: 'certificateSharePercent',
      label: 'Certifikatandel',
      description: 'Procentdel af elforbruget der er certifikatdækket.'
    },
    {
      type: 'select',
      key: 'residualFactorSource',
      label: 'Residualfaktor',
      description: 'Vælg hvilken residualfaktor der anvendes i beregningen.',
      options: [
        {
          value: 'dk-residual',
          label: 'Danmark residual (0,318 kg CO₂e/kWh)',
          derived: { residualEmissionFactorKgPerKwh: 0.318 }
        },
        {
          value: 'eu-average',
          label: 'EU gennemsnit (0,275 kg CO₂e/kWh)',
          derived: { residualEmissionFactorKgPerKwh: 0.275 }
        },
        { value: 'custom', label: 'Anden faktor', derived: {} }
      ]
    },
    {
      type: 'number',
      key: 'residualEmissionFactorKgPerKwh',
      label: 'Valgt residualfaktor',
      unit: 'kg CO₂e/kWh',
      description: 'Kan justeres manuelt hvis anden faktor benyttes.'
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af datakvalitet for certifikatdækningen.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload certifikater eller garantier for oprindelse.'
    }
  ],
  runModule: runB7
})
