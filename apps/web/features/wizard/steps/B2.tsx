/**
 * Wizardtrin for modul B2 – varmeforbrug.
 */
'use client'

import type { B2Input } from '@org/shared'
import { runB2 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

export type B2FormState = B2Input & {
  emissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const EMPTY_B2: B2FormState = {
  heatConsumptionKwh: null,
  recoveredHeatKwh: null,
  emissionFactorKgPerKwh: null,
  renewableSharePercent: null,
  emissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const B2Step = createConfiguredModuleStep<'B2', B2FormState>({
  moduleId: 'B2',
  title: 'B2 – Scope 2 varmeforbrug',
  description:
    'Registrér indkøbt fjernvarme og vælg hvilken emissionsfaktor der gælder for leverancen.',
  emptyState: EMPTY_B2,
  fields: [
    {
      type: 'number',
      key: 'heatConsumptionKwh',
      label: 'Forbrug',
      unit: 'kWh',
      description: 'Målt eller faktureret varmeforbrug i den relevante periode.'
    },
    {
      type: 'select',
      key: 'emissionFactorSource',
      label: 'Emissionsfaktor',
      description: 'Vælg standard- eller leverandørfaktor. Feltet nedenfor udfyldes automatisk.',
      options: [
        {
          value: 'dk-fjernvarme-standard',
          label: 'Standard fjernvarme (0,080 kg CO₂e/kWh)',
          derived: { emissionFactorKgPerKwh: 0.08 }
        },
        {
          value: 'leverandor',
          label: 'Leverandørdata'
        }
      ]
    },
    {
      type: 'number',
      key: 'emissionFactorKgPerKwh',
      label: 'Valgt emissionsfaktor',
      unit: 'kg CO₂e/kWh',
      description: 'Kan justeres hvis leverandøren har oplyst anden faktor.'
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af kvaliteten af dokumentation og måledata.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload varmefaktura eller leverandørdata.'
    }
  ],
  runModule: runB2
})
