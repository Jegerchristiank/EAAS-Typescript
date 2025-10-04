/**
 * Wizardtrin for modul B10 – virtuel PPA.
 */
'use client'

import type { B10Input } from '@org/shared'
import { runB10 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

export type B10FormState = B10Input & {
  residualFactorSource?: string | null
  documentationFileName?: string | null
}

const EMPTY_B10: B10FormState = {
  ppaSettledKwh: null,
  matchedConsumptionKwh: null,
  marketSettlementPercent: null,
  residualEmissionFactorKgPerKwh: null,
  documentationQualityPercent: null,
  residualFactorSource: null,
  documentationFileName: null
}

export const B10Step = createConfiguredModuleStep<'B10', B10FormState>({
  moduleId: 'B10',
  title: 'B10 – Virtuel PPA',
  description: 'Registrér leverede mængder fra finansielle PPA-aftaler og tilhørende residualfaktor.',
  emptyState: EMPTY_B10,
  fields: [
    {
      type: 'number',
      key: 'ppaSettledKwh',
      label: 'PPA leveret kWh',
      unit: 'kWh',
      description: 'KWh omfattet af den finansielle afregning.'
    },
    {
      type: 'number',
      key: 'matchedConsumptionKwh',
      label: 'Matchet kWh',
      unit: 'kWh',
      description: 'Elforbrug der matches mod PPA-leverancen.'
    },
    {
      type: 'percent',
      key: 'marketSettlementPercent',
      label: 'Afregnet andel',
      description: 'Angiv hvor stor en procentdel af den matchede mængde der er markedsafregnet.'
    },
    {
      type: 'select',
      key: 'residualFactorSource',
      label: 'Residualfaktor',
      description: 'Vælg hvilken residualfaktor der anvendes.',
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
      description: 'Kan justeres hvis anden faktor benyttes.'
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af kvaliteten af PPA-aftaler og afregninger.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload PPA-aftale og afregninger.'
    }
  ],
  runModule: runB10
})
