/**
 * Wizardtrin for modul B6 – nettab i elnettet.
 */
'use client'

import type { B6Input } from '@org/shared'
import { runB6 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

export type B6FormState = B6Input & {
  emissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const EMPTY_B6: B6FormState = {
  electricitySuppliedKwh: null,
  gridLossPercent: null,
  emissionFactorKgPerKwh: null,
  renewableSharePercent: null,
  emissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const B6Step = createConfiguredModuleStep<'B6', B6FormState>({
  moduleId: 'B6',
  title: 'B6 – Nettab i elnettet',
  description: 'Indtast elforbrug der påvirkes af nettab og vælg passende emissionsfaktor.',
  emptyState: EMPTY_B6,
  fields: [
    {
      type: 'number',
      key: 'electricitySuppliedKwh',
      label: 'Indkøbt elektricitet',
      unit: 'kWh',
      description: 'Købte kWh som transporteres gennem eget net.'
    },
    {
      type: 'percent',
      key: 'gridLossPercent',
      label: 'Nettab',
      description: 'Angiv tab i nettet i procent.'
    },
    {
      type: 'select',
      key: 'emissionFactorSource',
      label: 'Emissionsfaktor',
      description: 'Vælg relevant faktor for transmissions- og distributionstab.',
      options: [
        {
          value: 'dk-standard',
          label: 'Danmark – standard (0,233 kg CO₂e/kWh)',
          derived: { emissionFactorKgPerKwh: 0.233 }
        },
        {
          value: 'residual',
          label: 'Residualfaktor (0,318 kg CO₂e/kWh)',
          derived: { emissionFactorKgPerKwh: 0.318 }
        },
        { value: 'custom', label: 'Anden faktor', derived: {} }
      ]
    },
    {
      type: 'number',
      key: 'emissionFactorKgPerKwh',
      label: 'Valgt emissionsfaktor',
      unit: 'kg CO₂e/kWh',
      description: 'Kan justeres manuelt hvis anden faktor anvendes.'
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af kvaliteten af data for nettab.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload net- og leverandørdokumentation.'
    }
  ],
  runModule: runB6
})
