/**
 * Wizardtrin for modul B3 – køleforbrug.
 */
'use client'

import type { B3Input } from '@org/shared'
import { runB3 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

export type B3FormState = B3Input & {
  emissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const EMPTY_B3: B3FormState = {
  coolingConsumptionKwh: null,
  recoveredCoolingKwh: null,
  emissionFactorKgPerKwh: null,
  renewableSharePercent: null,
  emissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const B3Step = createConfiguredModuleStep<'B3', B3FormState>({
  moduleId: 'B3',
  title: 'B3 – Scope 2 køleforbrug',
  description: 'Angiv købt fjernkøling og tilhørende emissionsfaktor.',
  emptyState: EMPTY_B3,
  fields: [
    {
      type: 'number',
      key: 'coolingConsumptionKwh',
      label: 'Forbrug',
      unit: 'kWh',
      description: 'Total indkøbt fjernkøling i perioden.'
    },
    {
      type: 'select',
      key: 'emissionFactorSource',
      label: 'Emissionsfaktor',
      description: 'Vælg reference fra database eller leverandør. Justér tallet nedenfor ved behov.',
      options: [
        {
          value: 'dk-kole-standard',
          label: 'Standard fjernkøling (0,050 kg CO₂e/kWh)',
          derived: { emissionFactorKgPerKwh: 0.05 }
        },
        {
          value: 'leverandor',
          label: 'Leverandørdata',
          derived: {}
        }
      ]
    },
    {
      type: 'number',
      key: 'emissionFactorKgPerKwh',
      label: 'Valgt emissionsfaktor',
      unit: 'kg CO₂e/kWh',
      description: 'Justér hvis leverandør har oplyst anden faktor.'
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af datakvalitet og usikkerhed.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload forbrugsopgørelse eller tilsvarende.'
    }
  ],
  runModule: runB3
})
