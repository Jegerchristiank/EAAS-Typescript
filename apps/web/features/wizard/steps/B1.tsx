/**
 * Wizardtrin for modul B1 – elforbrug.
 */
'use client'

import type { B1Input } from '@org/shared'
import { runB1 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

export type B1FormState = B1Input & {
  emissionFactorSource?: string | null
  calculationMethod?: 'locationBased' | 'marketBased' | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const EMPTY_B1: B1FormState = {
  electricityConsumptionKwh: null,
  emissionFactorKgPerKwh: null,
  renewableSharePercent: null,
  emissionFactorSource: null,
  calculationMethod: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const B1Step = createConfiguredModuleStep<'B1', B1FormState>({
  moduleId: 'B1',
  title: 'B1 – Scope 2 elforbrug',
  description:
    'Indtast organisationens indkøbte elforbrug og vælg hvilken emissionsfaktor der skal danne grundlag for beregningen.',
  emptyState: EMPTY_B1,
  fields: [
    {
      type: 'number',
      key: 'electricityConsumptionKwh',
      label: 'Forbrug',
      unit: 'kWh',
      description: 'Samlet indkøbt elektricitet i den valgte periode.'
    },
    {
      type: 'select',
      key: 'emissionFactorSource',
      label: 'Emissionsfaktor',
      description: 'Vælg landefaktor eller residualfaktor fra database eller leverandør.',
      helperText: 'Valget udfylder feltet for emissionsfaktor nedenfor, som altid kan justeres manuelt.',
      options: [
        {
          value: 'dk-standard',
          label: 'Danmark – standardfaktor (0,233 kg CO₂e/kWh)',
          derived: { emissionFactorKgPerKwh: 0.233 }
        },
        {
          value: 'dk-residual',
          label: 'Danmark – residualfaktor (0,318 kg CO₂e/kWh)',
          derived: { emissionFactorKgPerKwh: 0.318 }
        },
        {
          value: 'eu-average',
          label: 'EU-gennemsnit (0,275 kg CO₂e/kWh)',
          derived: { emissionFactorKgPerKwh: 0.275 }
        },
        {
          value: 'custom',
          label: 'Egen leverandørdata'
        }
      ]
    },
    {
      type: 'number',
      key: 'emissionFactorKgPerKwh',
      label: 'Valgt emissionsfaktor',
      unit: 'kg CO₂e/kWh',
      description: 'Automatisk udfyldt fra dropdown men kan erstattes med leverandørdata.'
    },
    {
      type: 'select',
      key: 'calculationMethod',
      label: 'Beregningsmetode',
      description: 'Angiv om rapporteringen sker efter location-based eller market-based metode.',
      options: [
        { value: 'locationBased', label: 'Location based' },
        { value: 'marketBased', label: 'Market based' }
      ]
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af hvor sikker dokumentationen er for indtastet data.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload elregning eller måleraflæsning som bilag.'
    }
  ],
  runModule: runB1
})
