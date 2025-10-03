/**
 * Wizardtrin for modul B5 – øvrige energileverancer.
 */
'use client'

import type { B5Input } from '@org/shared'
import { runB5 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

export type B5FormState = B5Input & {
  energyType?: string | null
  emissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const EMPTY_B5: B5FormState = {
  otherEnergyConsumptionKwh: null,
  recoveredEnergyKwh: null,
  emissionFactorKgPerKwh: null,
  renewableSharePercent: null,
  energyType: null,
  emissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const B5Step = createConfiguredModuleStep<'B5', B5FormState>({
  moduleId: 'B5',
  title: 'B5 – Øvrige indkøbte energiformer',
  description: 'Indtast andre energileverancer såsom fjern damp, trykluft eller lignende.',
  emptyState: EMPTY_B5,
  fields: [
    {
      type: 'select',
      key: 'energyType',
      label: 'Energitype',
      description: 'Vælg den type energi der er købt ind.',
      options: [
        {
          value: 'trykluft',
          label: 'Trykluft',
          derived: { emissionFactorKgPerKwh: 0.12 }
        },
        {
          value: 'procesvarme',
          label: 'Procesvarme',
          derived: { emissionFactorKgPerKwh: 0.18 }
        },
        {
          value: 'andet',
          label: 'Andet'
        }
      ]
    },
    {
      type: 'number',
      key: 'otherEnergyConsumptionKwh',
      label: 'Mængde',
      unit: 'kWh',
      description: 'Angiv mængde i kWh eller konverter til kWh fra anden enhed.'
    },
    {
      type: 'select',
      key: 'emissionFactorSource',
      label: 'Emissionsfaktor',
      description: 'Vælg eller juster emissionsfaktor for den valgte energitype.',
      options: [
        {
          value: 'standard-0.12',
          label: 'Standard (0,120 kg CO₂e/kWh)',
          derived: { emissionFactorKgPerKwh: 0.12 }
        },
        {
          value: 'standard-0.18',
          label: 'Standard (0,180 kg CO₂e/kWh)',
          derived: { emissionFactorKgPerKwh: 0.18 }
        },
        {
          value: 'custom',
          label: 'Anden faktor'
        }
      ],
      helperText: 'Feltet nedenfor opdateres automatisk og kan manuelt justeres.'
    },
    {
      type: 'number',
      key: 'emissionFactorKgPerKwh',
      label: 'Valgt emissionsfaktor',
      unit: 'kg CO₂e/kWh',
      description: 'Angiv den faktiske emissionsfaktor hvis den afviger fra standard.'
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af dokumentationsgrundlaget for energidata.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload dokumentation for energileverancen.'
    }
  ],
  runModule: runB5
})
