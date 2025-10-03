/**
 * Wizardtrin for modul C3 – brændstof- og energirelaterede aktiviteter.
 */
'use client'

import type { C3Input } from '@org/shared'
import { runC3 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

type EmissionFactorOption = {
  value: string
  label: string
  factor: number
}

type C3FormState = C3Input & {
  electricityEmissionFactorSource?: string | null
  fuelEmissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const ELECTRICITY_OPTIONS: EmissionFactorOption[] = [
  {
    value: 'energinetUpstream',
    label: 'Energinet – upstream el (0,045 kg CO₂e/kWh)',
    factor: 0.045
  },
  {
    value: 'nordicMixUpstream',
    label: 'Nordisk elmix – upstream (0,052 kg CO₂e/kWh)',
    factor: 0.052
  },
  {
    value: 'europeAverageUpstream',
    label: 'EU-gennemsnit – upstream (0,060 kg CO₂e/kWh)',
    factor: 0.06
  }
]

const FUEL_OPTIONS: EmissionFactorOption[] = [
  { value: 'diesel', label: 'Diesel – well-to-tank (0,073 kg CO₂e/kWh)', factor: 0.073 },
  { value: 'petrol', label: 'Benzin – well-to-tank (0,069 kg CO₂e/kWh)', factor: 0.069 },
  { value: 'naturalGas', label: 'Naturgas – upstream (0,055 kg CO₂e/kWh)', factor: 0.055 },
  { value: 'biogas', label: 'Biogas – upstream (0,020 kg CO₂e/kWh)', factor: 0.02 }
]

const EMPTY_C3: C3FormState = {
  purchasedElectricityKwh: null,
  electricityUpstreamEmissionFactorKgPerKwh: null,
  transmissionLossPercent: null,
  renewableSharePercent: null,
  fuelConsumptionKwh: null,
  fuelUpstreamEmissionFactorKgPerKwh: null,
  electricityEmissionFactorSource: null,
  fuelEmissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const C3Step = createConfiguredModuleStep<'C3', C3FormState>({
  moduleId: 'C3',
  title: 'C3 – Brændstof- og energirelaterede aktiviteter',
  description:
    'Indtast upstream energiforbrug og vælg passende emissionsfaktorer for el og brændstoffer. Der kan angives nettab og dokumenteret vedvarende andel.',
  emptyState: EMPTY_C3,
  fields: [
    {
      type: 'number',
      key: 'purchasedElectricityKwh',
      label: 'Indkøbt elektricitet til upstream-beregning',
      unit: 'kWh',
      description: 'Elforbrug hvor upstream emissioner skal beregnes.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'electricityEmissionFactorSource',
      label: 'Emissionsfaktor – upstream el',
      description: 'Vælg standardfaktor eller angiv egen værdi.',
      options: ELECTRICITY_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        derived: { electricityUpstreamEmissionFactorKgPerKwh: option.factor }
      })).concat([{ value: 'custom', label: 'Tilpasset emissionsfaktor', derived: {} }])
    },
    {
      type: 'number',
      key: 'electricityUpstreamEmissionFactorKgPerKwh',
      label: 'Valgt emissionsfaktor – el',
      unit: 'kg CO₂e/kWh',
      description: 'Automatisk udfyldt men kan justeres manuelt.',
      min: 0,
      step: 'any'
    },
    {
      type: 'percent',
      key: 'transmissionLossPercent',
      label: 'Nettab',
      description: 'Tab i transmissions- og distributionsnettet (maks 20%).',
      max: 20
    },
    {
      type: 'percent',
      key: 'renewableSharePercent',
      label: 'Dokumenteret vedvarende el',
      description: 'Andel med garantier eller certificeret oprindelse.',
      max: 100
    },
    {
      type: 'number',
      key: 'fuelConsumptionKwh',
      label: 'Brændstofforbrug (omregnet til kWh)',
      unit: 'kWh',
      description: 'Omregnet brændstofforbrug der indgår i upstream emissionerne.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'fuelEmissionFactorSource',
      label: 'Emissionsfaktor – brændstof',
      description: 'Vælg standardfaktor for brændstoftypen.',
      options: FUEL_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        derived: { fuelUpstreamEmissionFactorKgPerKwh: option.factor }
      })).concat([{ value: 'custom', label: 'Tilpasset emissionsfaktor', derived: {} }])
    },
    {
      type: 'number',
      key: 'fuelUpstreamEmissionFactorKgPerKwh',
      label: 'Valgt emissionsfaktor – brændstof',
      unit: 'kg CO₂e/kWh',
      description: 'Mulighed for at indtaste leverandørdata.',
      min: 0,
      step: 'any'
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurder kvaliteten af energidata og leverandørfaktorer.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload fakturaer, kontrakter eller energirapporter.'
    }
  ],
  runModule: runC3
})
