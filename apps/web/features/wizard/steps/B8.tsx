/**
 * Wizardtrin for modul B8 – egenproduceret vedvarende el.
 */
'use client'

import type { B8Input } from '@org/shared'
import { runB8 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

export type B8FormState = B8Input & {
  residualFactorSource?: string | null
  selfConsumedKwh?: number | null
  documentationFileName?: string | null
}

const EMPTY_B8: B8FormState = {
  onSiteRenewableKwh: null,
  exportedRenewableKwh: null,
  residualEmissionFactorKgPerKwh: null,
  documentationQualityPercent: null,
  residualFactorSource: null,
  selfConsumedKwh: null,
  documentationFileName: null
}

export const B8Step = createConfiguredModuleStep<'B8', B8FormState>({
  moduleId: 'B8',
  title: 'B8 – Egenproduceret vedvarende el',
  description:
    'Registrér egenproduktion, hvor meget der anvendes internt og hvor meget der eksporteres til nettet.',
  emptyState: EMPTY_B8,
  fields: [
    {
      type: 'number',
      key: 'onSiteRenewableKwh',
      label: 'Produceret vedvarende el',
      unit: 'kWh',
      description: 'Samlet produktion på matriklen i perioden.'
    },
    {
      type: 'number',
      key: 'selfConsumedKwh',
      label: 'Egenanvendt vedvarende el',
      unit: 'kWh',
      description: 'Hvor meget af produktionen forbruges internt (information til dokumentation).'
    },
    {
      type: 'number',
      key: 'exportedRenewableKwh',
      label: 'Eksporteret vedvarende el',
      unit: 'kWh',
      description: 'Mængde der sendes ud på nettet.'
    },
    {
      type: 'select',
      key: 'residualFactorSource',
      label: 'Residualfaktor',
      description: 'Vælg referencefaktor der anvendes til beregning af reduktion.',
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
      description: 'Kan erstattes hvis anden faktor benyttes.'
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af kvaliteten af dokumentation eller målerdata.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload målerdata eller inverterlog.'
    }
  ],
  runModule: runB8
})
