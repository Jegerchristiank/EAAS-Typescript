/**
 * Wizardtrin for modul C5 – affald fra drift (upstream).
 */
'use client'

import type { C5Input } from '@org/shared'
import { runC5 } from '@org/shared'

import { createConfiguredModuleStep, type SelectOption } from './ConfiguredModuleStep'

type EmissionFactorOption = {
  value: string
  label: string
  factor: number
}

type C5FormState = C5Input & {
  landfillEmissionFactorSource?: string | null
  incinerationEmissionFactorSource?: string | null
  recyclingEmissionFactorSource?: string | null
  compostingEmissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const LANDFILL_OPTIONS: EmissionFactorOption[] = [
  { value: 'managedLandfill', label: 'Styret deponi (480 kg CO₂e/t)', factor: 480 },
  { value: 'unmanagedLandfill', label: 'Ustyret deponi (620 kg CO₂e/t)', factor: 620 }
]

const INCINERATION_OPTIONS: EmissionFactorOption[] = [
  { value: 'energyRecovery', label: 'Forbrænding m. energiudnyttelse (320 kg CO₂e/t)', factor: 320 },
  { value: 'withoutRecovery', label: 'Forbrænding uden energiudnyttelse (410 kg CO₂e/t)', factor: 410 }
]

const RECYCLING_OPTIONS: EmissionFactorOption[] = [
  { value: 'paper', label: 'Genanvendelse papir (45 kg CO₂e/t)', factor: 45 },
  { value: 'plastics', label: 'Genanvendelse plast (60 kg CO₂e/t)', factor: 60 },
  { value: 'metals', label: 'Genanvendelse metal (30 kg CO₂e/t)', factor: 30 }
]

const COMPOSTING_OPTIONS: EmissionFactorOption[] = [
  { value: 'aerobic', label: 'Kompostering (75 kg CO₂e/t)', factor: 75 },
  { value: 'anaerobic', label: 'Biogas/anaerob behandling (40 kg CO₂e/t)', factor: 40 }
]

const LANDFILL_EMISSION_FACTOR_OPTIONS: Array<SelectOption<C5FormState>> = [
  ...LANDFILL_OPTIONS.map<SelectOption<C5FormState>>((option) => ({
    value: option.value,
    label: option.label,
    derived: { landfillEmissionFactorKgPerTonne: option.factor }
  })),
  { value: 'custom', label: 'Tilpasset emissionsfaktor' }
]

const INCINERATION_EMISSION_FACTOR_OPTIONS: Array<SelectOption<C5FormState>> = [
  ...INCINERATION_OPTIONS.map<SelectOption<C5FormState>>((option) => ({
    value: option.value,
    label: option.label,
    derived: { incinerationEmissionFactorKgPerTonne: option.factor }
  })),
  { value: 'custom', label: 'Tilpasset emissionsfaktor' }
]

const RECYCLING_EMISSION_FACTOR_OPTIONS: Array<SelectOption<C5FormState>> = [
  ...RECYCLING_OPTIONS.map<SelectOption<C5FormState>>((option) => ({
    value: option.value,
    label: option.label,
    derived: { recyclingEmissionFactorKgPerTonne: option.factor }
  })),
  { value: 'custom', label: 'Tilpasset emissionsfaktor' }
]

const COMPOSTING_EMISSION_FACTOR_OPTIONS: Array<SelectOption<C5FormState>> = [
  ...COMPOSTING_OPTIONS.map<SelectOption<C5FormState>>((option) => ({
    value: option.value,
    label: option.label,
    derived: { compostingEmissionFactorKgPerTonne: option.factor }
  })),
  { value: 'custom', label: 'Tilpasset emissionsfaktor' }
]

const EMPTY_C5: C5FormState = {
  landfillWasteTonnes: null,
  landfillEmissionFactorKgPerTonne: null,
  incinerationWasteTonnes: null,
  incinerationEmissionFactorKgPerTonne: null,
  recyclingWasteTonnes: null,
  recyclingEmissionFactorKgPerTonne: null,
  compostingWasteTonnes: null,
  compostingEmissionFactorKgPerTonne: null,
  recyclingRecoveryPercent: null,
  reuseSharePercent: null,
  landfillEmissionFactorSource: null,
  incinerationEmissionFactorSource: null,
  recyclingEmissionFactorSource: null,
  compostingEmissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const C5Step = createConfiguredModuleStep<'C5', C5FormState>({
  moduleId: 'C5',
  title: 'C5 – Affald fra drift (upstream)',
  description:
    'Registrér tonnager for deponi, forbrænding, genanvendelse og biologisk behandling. Vælg emissionsfaktorer fra databasen eller indtast egne tal.',
  emptyState: EMPTY_C5,
  fields: [
    {
      type: 'number',
      key: 'landfillWasteTonnes',
      label: 'Deponi',
      unit: 'ton',
      description: 'Mængde affald sendt til deponi.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'landfillEmissionFactorSource',
      label: 'Emissionsfaktor – deponi',
      description: 'Vælg mellem styret eller ustyret deponi.',
      options: LANDFILL_EMISSION_FACTOR_OPTIONS
    },
    {
      type: 'number',
      key: 'landfillEmissionFactorKgPerTonne',
      label: 'Valgt emissionsfaktor – deponi',
      unit: 'kg CO₂e/t',
      description: 'Kan overskrives med specifikke data.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'incinerationWasteTonnes',
      label: 'Forbrænding',
      unit: 'ton',
      description: 'Affald sendt til forbrænding.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'incinerationEmissionFactorSource',
      label: 'Emissionsfaktor – forbrænding',
      description: 'Vælg om anlægget udnytter energien.',
      options: INCINERATION_EMISSION_FACTOR_OPTIONS
    },
    {
      type: 'number',
      key: 'incinerationEmissionFactorKgPerTonne',
      label: 'Valgt emissionsfaktor – forbrænding',
      unit: 'kg CO₂e/t',
      description: 'Tilpas efter leverandørdata.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'recyclingWasteTonnes',
      label: 'Genanvendelse',
      unit: 'ton',
      description: 'Affald sendt til materialegenanvendelse.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'recyclingEmissionFactorSource',
      label: 'Emissionsfaktor – genanvendelse',
      description: 'Vælg faktor baseret på fraktion.',
      options: RECYCLING_EMISSION_FACTOR_OPTIONS
    },
    {
      type: 'number',
      key: 'recyclingEmissionFactorKgPerTonne',
      label: 'Valgt emissionsfaktor – genanvendelse',
      unit: 'kg CO₂e/t',
      description: 'Kan udfyldes manuelt med mere præcise faktorer.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'compostingWasteTonnes',
      label: 'Biologisk behandling',
      unit: 'ton',
      description: 'Mængde organisk affald til kompostering/biogas.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'compostingEmissionFactorSource',
      label: 'Emissionsfaktor – biologisk behandling',
      description: 'Vælg passende metode.',
      options: COMPOSTING_EMISSION_FACTOR_OPTIONS
    },
    {
      type: 'number',
      key: 'compostingEmissionFactorKgPerTonne',
      label: 'Valgt emissionsfaktor – biologisk behandling',
      unit: 'kg CO₂e/t',
      description: 'Mulighed for at indtaste specifikke værdier.',
      min: 0,
      step: 'any'
    },
    {
      type: 'percent',
      key: 'recyclingRecoveryPercent',
      label: 'Genanvendelsesgrad',
      description: 'Andel af genanvendt materiale der reelt nyttiggøres (maks 90%).',
      max: 90
    },
    {
      type: 'percent',
      key: 'reuseSharePercent',
      label: 'Genbrug/genanvendelsesandel',
      description: 'Andel af affaldet der genbruges direkte (maks 60%).',
      max: 60
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurder kvaliteten af affaldsrapporter og vejninger.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload affaldsrapporter eller vejesedler.'
    }
  ],
  runModule: runC5
})
