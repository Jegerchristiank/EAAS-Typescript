/**
 * Wizardtrin for modul B4 – dampforbrug.
 */
'use client'

import type { B4Input } from '@org/shared'
import { runB4 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

const STEAM_UNIT_TO_KWH: Record<'kWh' | 'ton', number> = {
  kWh: 1,
  ton: 657
}

export type B4FormState = B4Input & {
  quantity?: number | null
  quantityUnit?: 'kWh' | 'ton' | null
  emissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const EMPTY_B4: B4FormState = {
  steamConsumptionKwh: null,
  recoveredSteamKwh: null,
  emissionFactorKgPerKwh: null,
  renewableSharePercent: null,
  quantity: null,
  quantityUnit: 'kWh',
  emissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

function toKwh(quantity: number | null, unit: 'kWh' | 'ton' | null | undefined): number | null {
  if (quantity == null || Number.isNaN(quantity)) {
    return null
  }
  const safeUnit: 'kWh' | 'ton' = unit === 'ton' ? 'ton' : 'kWh'
  return quantity * STEAM_UNIT_TO_KWH[safeUnit]
}

export const B4Step = createConfiguredModuleStep<'B4', B4FormState>({
  moduleId: 'B4',
  title: 'B4 – Scope 2 dampforbrug',
  description:
    'Registrér indkøbt damp. Angiv mængden i ton eller kWh og vælg relevant emissionsfaktor.',
  emptyState: EMPTY_B4,
  fields: [
    {
      type: 'select',
      key: 'quantityUnit',
      label: 'Enhed',
      description: 'Vælg om mængden angives i ton eller kWh. Omregning sker automatisk.',
      options: [
        { value: 'kWh', label: 'kWh', derived: {} },
        { value: 'ton', label: 'Ton damp', derived: {} }
      ],
      afterUpdate: ({ value, current }) => {
        const unit = (value as 'kWh' | 'ton' | null) ?? 'kWh'
        const amount = current.quantity ?? null
        return { steamConsumptionKwh: toKwh(amount, unit) }
      }
    },
    {
      type: 'number',
      key: 'quantity',
      label: 'Mængde',
      description: 'Angiv indkøbt damp i valgt enhed.',
      helperText: '1 ton damp omregnes til ca. 657 kWh i beregningen.',
      afterUpdate: ({ value, current }) => {
        const amount = typeof value === 'number' ? value : null
        const unit = (current.quantityUnit as 'kWh' | 'ton' | null) ?? 'kWh'
        return { steamConsumptionKwh: toKwh(amount, unit) }
      }
    },
    {
      type: 'select',
      key: 'emissionFactorSource',
      label: 'Emissionsfaktor',
      description: 'Vælg standardfaktor eller leverandørdata.',
      options: [
        {
          value: 'standard',
          label: 'Standard damp (0,180 kg CO₂e/kWh)',
          derived: { emissionFactorKgPerKwh: 0.18 }
        },
        { value: 'leverandor', label: 'Leverandørdata', derived: {} }
      ]
    },
    {
      type: 'number',
      key: 'emissionFactorKgPerKwh',
      label: 'Valgt emissionsfaktor',
      unit: 'kg CO₂e/kWh',
      description: 'Kan tilpasses ved alternative deklarationer.'
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af kvaliteten af dokumentation.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload leverandørdata eller måleraflæsning.'
    }
  ],
  runModule: runB4
})
