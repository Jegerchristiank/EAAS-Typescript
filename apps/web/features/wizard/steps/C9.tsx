/**
 * Wizardtrin for modul C9 – forarbejdning af solgte produkter.
 */
'use client'

import type { C9Input } from '@org/shared'
import { runC9 } from '@org/shared'

import { createConfiguredModuleStep, type SelectOption } from './ConfiguredModuleStep'

type EmissionFactorOption = {
  value: string
  label: string
  factor: number
}

type C9FormState = C9Input & {
  processingEmissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const PROCESSING_FACTOR_OPTIONS: EmissionFactorOption[] = [
  { value: 'foodProcessing', label: 'Fødevareforarbejdning (0,18 kg CO₂e/kWh)', factor: 0.18 },
  { value: 'manufacturing', label: 'Let industri (0,22 kg CO₂e/kWh)', factor: 0.22 },
  { value: 'heavyIndustry', label: 'Tung industri (0,30 kg CO₂e/kWh)', factor: 0.3 },
  { value: 'renewablePowered', label: 'Vedvarende energi (0,08 kg CO₂e/kWh)', factor: 0.08 }
]

const PROCESSING_EMISSION_FACTOR_OPTIONS: Array<SelectOption<C9FormState>> = [
  ...PROCESSING_FACTOR_OPTIONS.map<SelectOption<C9FormState>>((option) => ({
    value: option.value,
    label: option.label,
    derived: { processingEmissionFactorKgPerKwh: option.factor }
  })),
  { value: 'custom', label: 'Tilpasset emissionsfaktor' }
]

const EMPTY_C9: C9FormState = {
  processedOutputTonnes: null,
  processingEnergyIntensityKwhPerTonne: null,
  processingEmissionFactorKgPerKwh: null,
  processEfficiencyImprovementPercent: null,
  secondaryMaterialSharePercent: null,
  renewableEnergySharePercent: null,
  processingEmissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const C9Step = createConfiguredModuleStep<'C9', C9FormState>({
  moduleId: 'C9',
  title: 'C9 – Forarbejdning af solgte produkter',
  description:
    'Indtast producerede mængder, energiforbrug og forbedringstiltag for kundernes forarbejdning af produkterne. Vælg emissionsfaktor for energiforbruget.',
  emptyState: EMPTY_C9,
  fields: [
    {
      type: 'number',
      key: 'processedOutputTonnes',
      label: 'Forarbejdet mængde',
      unit: 'ton',
      description: 'Ton solgte produkter der videreforarbejdes af kunder.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'processingEnergyIntensityKwhPerTonne',
      label: 'Energiforbrug pr. ton',
      unit: 'kWh/ton',
      description: 'Gennemsnitligt energiforbrug til forarbejdning.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'processingEmissionFactorSource',
      label: 'Emissionsfaktor – energi',
      description: 'Vælg en standardfaktor eller indtast egen værdi.',
      options: PROCESSING_EMISSION_FACTOR_OPTIONS
    },
    {
      type: 'number',
      key: 'processingEmissionFactorKgPerKwh',
      label: 'Valgt emissionsfaktor – energi',
      unit: 'kg CO₂e/kWh',
      description: 'Kan overskrives hvis specifikke data foreligger.',
      min: 0,
      step: 'any'
    },
    {
      type: 'percent',
      key: 'processEfficiencyImprovementPercent',
      label: 'Effektiviseringsforbedring',
      description: 'Forventet reduktion i energiforbrug (maks 60%).',
      max: 60
    },
    {
      type: 'percent',
      key: 'secondaryMaterialSharePercent',
      label: 'Sekundært materiale',
      description: 'Andel sekundære materialer der anvendes (maks 80%).',
      max: 80
    },
    {
      type: 'percent',
      key: 'renewableEnergySharePercent',
      label: 'Vedvarende energiandel',
      description: 'Andel af energiforbruget der er dokumenteret grønt.',
      max: 100
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurder kvaliteten af kundedata og energirapporter.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload aftaler, procesdata eller energirapporter.'
    }
  ],
  runModule: runC9
})
