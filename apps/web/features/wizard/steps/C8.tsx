/**
 * Wizardtrin for modul C8 – udlejede aktiver (downstream).
 */
'use client'

import type { C8Input } from '@org/shared'
import { runC8 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

type EmissionFactorOption = {
  value: string
  label: string
  factor: number
}

type C8FormState = C8Input & {
  electricityEmissionFactorSource?: string | null
  heatEmissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const ELECTRICITY_OPTIONS: EmissionFactorOption[] = [
  { value: 'dkResidual', label: 'Danmark – residualfaktor (0,318 kg CO₂e/kWh)', factor: 0.318 },
  { value: 'dkLocation', label: 'Danmark – location-based (0,233 kg CO₂e/kWh)', factor: 0.233 },
  { value: 'greenContract', label: 'Kontraktbaseret grøn el (0,050 kg CO₂e/kWh)', factor: 0.05 }
]

const HEAT_OPTIONS: EmissionFactorOption[] = [
  { value: 'districtHeat', label: 'Standard fjernvarme (0,080 kg CO₂e/kWh)', factor: 0.08 },
  { value: 'renewableHeat', label: 'Grøn varmeaftale (0,040 kg CO₂e/kWh)', factor: 0.04 },
  { value: 'onsiteHeat', label: 'Egen varmeproduktion (0,030 kg CO₂e/kWh)', factor: 0.03 }
]

const EMPTY_C8: C8FormState = {
  leasedFloorAreaSqm: null,
  electricityIntensityKwhPerSqm: null,
  heatIntensityKwhPerSqm: null,
  occupancySharePercent: null,
  landlordEnergySharePercent: null,
  energyEfficiencyImprovementPercent: null,
  electricityEmissionFactorKgPerKwh: null,
  heatEmissionFactorKgPerKwh: null,
  renewableElectricitySharePercent: null,
  renewableHeatSharePercent: null,
  electricityEmissionFactorSource: null,
  heatEmissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const C8Step = createConfiguredModuleStep<'C8', C8FormState>({
  moduleId: 'C8',
  title: 'C8 – Udlejede aktiver (downstream)',
  description:
    'Registrér energiintensiteter og fordelingsnøgler for downstream-lejemål. Vælg emissionsfaktorer for el og varme og vurder dokumentationskvaliteten.',
  emptyState: EMPTY_C8,
  fields: [
    {
      type: 'number',
      key: 'leasedFloorAreaSqm',
      label: 'Udlejet areal',
      unit: 'm²',
      description: 'Samlet areal for downstream-lejemål.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'electricityIntensityKwhPerSqm',
      label: 'El-intensitet',
      unit: 'kWh/m²',
      description: 'Årlig elintensitet for lejemålene.',
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
      label: 'Udnyttelsesgrad',
      description: 'Hvor stor en del af arealet er udlejet til kunderne.',
      max: 100
    },
    {
      type: 'percent',
      key: 'landlordEnergySharePercent',
      label: 'Udlejers energidækning',
      description: 'Andel af energien der afholdes af udlejeren (maks 100%).',
      max: 100
    },
    {
      type: 'percent',
      key: 'energyEfficiencyImprovementPercent',
      label: 'Energieffektivisering',
      description: 'Planlagt forbedring der reducerer energiforbrug (maks 70%).',
      max: 70
    },
    {
      type: 'select',
      key: 'electricityEmissionFactorSource',
      label: 'Emissionsfaktor – el',
      description: 'Vælg residual, location eller grøn kontrakt.',
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
      description: 'Kan overskrives med egne kontraktdata.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'heatEmissionFactorSource',
      label: 'Emissionsfaktor – varme',
      description: 'Vælg standard eller grøn varmeleverance.',
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
      description: 'Indtast leverandørdata hvis tilgængeligt.',
      min: 0,
      step: 'any'
    },
    {
      type: 'percent',
      key: 'renewableElectricitySharePercent',
      label: 'Grøn elandel',
      description: 'Dokumenteret vedvarende el for lejemålene.',
      max: 100
    },
    {
      type: 'percent',
      key: 'renewableHeatSharePercent',
      label: 'Grøn varmeandel',
      description: 'Dokumenteret vedvarende varme.',
      max: 100
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af kontrakter, fordelingsnøgler og målerdata.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload kontrakter, målerdata eller fordelingsbilag.'
    }
  ],
  runModule: runC8
})
