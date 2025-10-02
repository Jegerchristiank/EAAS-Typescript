/**
 * Wizardtrin for modul B11 – time-matchede certifikater.
 */
'use client'

import type { B11Input } from '@org/shared'
import { runB11 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

export type B11FormState = B11Input & {
  residualFactorSource?: string | null
  documentationFileName?: string | null
}

const EMPTY_B11: B11FormState = {
  certificatesRetiredKwh: null,
  matchedConsumptionKwh: null,
  timeCorrelationPercent: null,
  residualEmissionFactorKgPerKwh: null,
  documentationQualityPercent: null,
  residualFactorSource: null,
  documentationFileName: null
}

export const B11Step = createConfiguredModuleStep<'B11', B11FormState>({
  moduleId: 'B11',
  title: 'B11 – Time-matchede certifikater',
  description: 'Indtast data for certifikater der er matchet time for time med elforbruget.',
  emptyState: EMPTY_B11,
  fields: [
    {
      type: 'number',
      key: 'certificatesRetiredKwh',
      label: 'Forbrug dækket af certifikater',
      unit: 'kWh',
      description: 'Angiv kWh som dækkes af time-matchede certifikater.'
    },
    {
      type: 'percent',
      key: 'timeCorrelationPercent',
      label: 'Time match andel',
      description: 'Angiv hvor stor en andel af forbruget der er time-matchet.'
    },
    {
      type: 'select',
      key: 'residualFactorSource',
      label: 'Residualfaktor',
      description: 'Vælg residualfaktor anvendt ved beregningen.',
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
      description: 'Kan ændres hvis anden faktor anvendes.'
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af kvaliteten af certifikatlog og dokumentation.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload certifikatlog eller timeoversigt.'
    }
  ],
  runModule: runB11
})
