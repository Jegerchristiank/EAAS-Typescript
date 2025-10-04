/**
 * Wizardtrin for modul B9 – kontraktbaseret vedvarende el.
 */
'use client'

import type { B9Input } from '@org/shared'
import { runB9 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

export type B9FormState = B9Input & {
  residualFactorSource?: string | null
  documentationFileName?: string | null
}

const EMPTY_B9: B9FormState = {
  ppaDeliveredKwh: null,
  matchedConsumptionKwh: null,
  gridLossPercent: null,
  residualEmissionFactorKgPerKwh: null,
  documentationQualityPercent: null,
  residualFactorSource: null,
  documentationFileName: null
}

export const B9Step = createConfiguredModuleStep<'B9', B9FormState>({
  moduleId: 'B9',
  title: 'B9 – Kontraktbaseret vedvarende el',
  description: 'Registrér mængder fra kontrakter uden fysisk match og vælg relevant residualfaktor.',
  emptyState: EMPTY_B9,
  fields: [
    {
      type: 'number',
      key: 'ppaDeliveredKwh',
      label: 'Kontrakteret kWh',
      unit: 'kWh',
      description: 'Mængde el der er aftalt i kontrakten.'
    },
    {
      type: 'number',
      key: 'matchedConsumptionKwh',
      label: 'Leveret kWh',
      unit: 'kWh',
      description: 'Reelt leveret el der matches mod forbruget.'
    },
    {
      type: 'percent',
      key: 'gridLossPercent',
      label: 'Nettab',
      description: 'Angiv forventet nettab i procent for at korrigere leverancen.'
    },
    {
      type: 'select',
      key: 'residualFactorSource',
      label: 'Residualfaktor',
      description: 'Vælg hvilken residualfaktor der anvendes til emissionsberegningen.',
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
        { value: 'custom', label: 'Anden faktor' }
      ]
    },
    {
      type: 'number',
      key: 'residualEmissionFactorKgPerKwh',
      label: 'Valgt residualfaktor',
      unit: 'kg CO₂e/kWh',
      description: 'Kan justeres hvis der anvendes en anden faktor.'
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af kvaliteten af kontrakt- og leverancedata.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload kontrakter og leveranceopgørelser.'
    }
  ],
  runModule: runB9
})
