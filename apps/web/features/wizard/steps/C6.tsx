/**
 * Wizardtrin for modul C6 – udlejede aktiver (upstream).
 */
'use client'

import type { C6Input } from '@org/shared'
import { runC6 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

type EmissionFactorOption = {
  value: string
  label: string
  factor: number
}

type C6FormState = C6Input & {
  electricityEmissionFactorSource?: string | null
  heatEmissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const ELECTRICITY_OPTIONS: EmissionFactorOption[] = [
  { value: 'dkResidual', label: 'Danmark – residualfaktor (0,318 kg CO₂e/kWh)', factor: 0.318 },
  { value: 'dkLocation', label: 'Danmark – location-based (0,233 kg CO₂e/kWh)', factor: 0.233 },
  { value: 'nordicMix', label: 'Nordisk elmix (0,200 kg CO₂e/kWh)', factor: 0.2 }
]

const HEAT_OPTIONS: EmissionFactorOption[] = [
  { value: 'districtHeatDK', label: 'Dansk fjernvarme (0,080 kg CO₂e/kWh)', factor: 0.08 },
  { value: 'districtHeatCertified', label: 'Fjernvarme med certifikat (0,045 kg CO₂e/kWh)', factor: 0.045 },
  { value: 'heatPump', label: 'Varme via varmepumpe (0,035 kg CO₂e/kWh)', factor: 0.035 }
]

const EMPTY_C6: C6FormState = {
  leasedFloorAreaSqm: null,
  electricityIntensityKwhPerSqm: null,
  heatIntensityKwhPerSqm: null,
  occupancySharePercent: null,
  sharedServicesAllocationPercent: null,
  electricityEmissionFactorKgPerKwh: null,
  heatEmissionFactorKgPerKwh: null,
  renewableElectricitySharePercent: null,
  renewableHeatSharePercent: null,
  electricityEmissionFactorSource: null,
  heatEmissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const C6Step = createConfiguredModuleStep<'C6', C6FormState>({
  moduleId: 'C6',
  title: 'C6 – Udlejede aktiver (upstream)',
  description:
    'Indtast areal, energiintensiteter og andele for upstream-lejemål. Vælg passende emissionsfaktorer for el og varme og angiv dokumentationskvalitet.',
  emptyState: EMPTY_C6,
  fields: [
    {
      type: 'number',
      key: 'leasedFloorAreaSqm',
      label: 'Lejet areal',
      unit: 'm²',
      description: 'Samlet areal for upstream-lejemål hvor energiforbrug rapporteres.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'electricityIntensityKwhPerSqm',
      label: 'El-intensitet',
      unit: 'kWh/m²',
      description: 'Årlig elintensitet baseret på regninger eller benchmarks.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'heatIntensityKwhPerSqm',
      label: 'Varme-intensitet',
      unit: 'kWh/m²',
      description: 'Årlig varmeintensitet for lejemålene.',
      min: 0,
      step: 'any'
    },
    {
      type: 'percent',
      key: 'occupancySharePercent',
      label: 'Lejerandel',
      description: 'Andel af bygningen virksomheden råder over.',
      max: 100
    },
    {
      type: 'percent',
      key: 'sharedServicesAllocationPercent',
      label: 'Fælles services',
      description: 'Andel dækket af udlejers fællesfaciliteter (maks 50%).',
      max: 50
    },
    {
      type: 'select',
      key: 'electricityEmissionFactorSource',
      label: 'Emissionsfaktor – el',
      description: 'Vælg location- eller residualbaseret faktor for el.',
      options: ELECTRICITY_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        derived: { electricityEmissionFactorKgPerKwh: option.factor }
      })).concat([{ value: 'custom', label: 'Tilpasset emissionsfaktor', derived: {} }])
    },
    {
      type: 'number',
      key: 'electricityEmissionFactorKgPerKwh',
      label: 'Valgt emissionsfaktor – el',
      unit: 'kg CO₂e/kWh',
      description: 'Kan overskrives hvis der foreligger leverandørdata.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'heatEmissionFactorSource',
      label: 'Emissionsfaktor – varme',
      description: 'Vælg relevant emissionsfaktor for varmeleverancen.',
      options: HEAT_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        derived: { heatEmissionFactorKgPerKwh: option.factor }
      })).concat([{ value: 'custom', label: 'Tilpasset emissionsfaktor', derived: {} }])
    },
    {
      type: 'number',
      key: 'heatEmissionFactorKgPerKwh',
      label: 'Valgt emissionsfaktor – varme',
      unit: 'kg CO₂e/kWh',
      description: 'Indtast evt. virksomheds- eller leverandørspecifik faktor.',
      min: 0,
      step: 'any'
    },
    {
      type: 'percent',
      key: 'renewableElectricitySharePercent',
      label: 'Vedvarende el',
      description: 'Dokumenteret grøn andel af elforbruget.',
      max: 100
    },
    {
      type: 'percent',
      key: 'renewableHeatSharePercent',
      label: 'Vedvarende varme',
      description: 'Dokumenteret grøn andel af varmeforbruget.',
      max: 100
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurder kvaliteten af kontrakter, fordelingsnøgler og målerdata.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload kontrakter, fordelingsnøgler eller målerdata.'
    }
  ],
  runModule: runC6
})
