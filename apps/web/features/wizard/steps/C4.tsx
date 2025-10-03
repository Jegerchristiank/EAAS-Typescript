/**
 * Wizardtrin for modul C4 – transport og distribution (upstream).
 */
'use client'

import type { C4Input } from '@org/shared'
import { runC4 } from '@org/shared'

import { createConfiguredModuleStep, type SelectOption } from './ConfiguredModuleStep'

type EmissionFactorOption = {
  value: string
  label: string
  factor: number
}

type C4FormState = C4Input & {
  roadEmissionFactorSource?: string | null
  railEmissionFactorSource?: string | null
  seaEmissionFactorSource?: string | null
  airEmissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const ROAD_OPTIONS: EmissionFactorOption[] = [
  { value: 'vanMixed', label: 'Vej – varebiler/mix (0,12 kg CO₂e/t·km)', factor: 0.12 },
  { value: 'heavyTruck', label: 'Vej – tung lastbil (0,18 kg CO₂e/t·km)', factor: 0.18 },
  { value: 'electricTruck', label: 'Vej – el-lastbil (0,07 kg CO₂e/t·km)', factor: 0.07 }
]

const RAIL_OPTIONS: EmissionFactorOption[] = [
  { value: 'electricRail', label: 'Tog – elektrisk gods (0,028 kg CO₂e/t·km)', factor: 0.028 },
  { value: 'dieselRail', label: 'Tog – diesel (0,045 kg CO₂e/t·km)', factor: 0.045 }
]

const SEA_OPTIONS: EmissionFactorOption[] = [
  { value: 'shortSea', label: 'Sø – nærskibsfart (0,015 kg CO₂e/t·km)', factor: 0.015 },
  { value: 'containerVessel', label: 'Sø – containerskib (0,012 kg CO₂e/t·km)', factor: 0.012 },
  { value: 'roRo', label: 'Sø – Ro-Ro (0,018 kg CO₂e/t·km)', factor: 0.018 }
]

const AIR_OPTIONS: EmissionFactorOption[] = [
  { value: 'bellyFreight', label: 'Luft – belly cargo (0,55 kg CO₂e/t·km)', factor: 0.55 },
  { value: 'dedicatedCargo', label: 'Luft – dedikeret fragt (0,65 kg CO₂e/t·km)', factor: 0.65 }
]

const ROAD_EMISSION_FACTOR_OPTIONS: Array<SelectOption<C4FormState>> = [
  ...ROAD_OPTIONS.map<SelectOption<C4FormState>>((option) => ({
    value: option.value,
    label: option.label,
    derived: { roadEmissionFactorKgPerTonneKm: option.factor }
  })),
  { value: 'custom', label: 'Tilpasset emissionsfaktor' }
]

const RAIL_EMISSION_FACTOR_OPTIONS: Array<SelectOption<C4FormState>> = [
  ...RAIL_OPTIONS.map<SelectOption<C4FormState>>((option) => ({
    value: option.value,
    label: option.label,
    derived: { railEmissionFactorKgPerTonneKm: option.factor }
  })),
  { value: 'custom', label: 'Tilpasset emissionsfaktor' }
]

const SEA_EMISSION_FACTOR_OPTIONS: Array<SelectOption<C4FormState>> = [
  ...SEA_OPTIONS.map<SelectOption<C4FormState>>((option) => ({
    value: option.value,
    label: option.label,
    derived: { seaEmissionFactorKgPerTonneKm: option.factor }
  })),
  { value: 'custom', label: 'Tilpasset emissionsfaktor' }
]

const AIR_EMISSION_FACTOR_OPTIONS: Array<SelectOption<C4FormState>> = [
  ...AIR_OPTIONS.map<SelectOption<C4FormState>>((option) => ({
    value: option.value,
    label: option.label,
    derived: { airEmissionFactorKgPerTonneKm: option.factor }
  })),
  { value: 'custom', label: 'Tilpasset emissionsfaktor' }
]

const EMPTY_C4: C4FormState = {
  roadTonnesKm: null,
  roadEmissionFactorKgPerTonneKm: null,
  railTonnesKm: null,
  railEmissionFactorKgPerTonneKm: null,
  seaTonnesKm: null,
  seaEmissionFactorKgPerTonneKm: null,
  airTonnesKm: null,
  airEmissionFactorKgPerTonneKm: null,
  consolidationEfficiencyPercent: null,
  lowCarbonSharePercent: null,
  roadEmissionFactorSource: null,
  railEmissionFactorSource: null,
  seaEmissionFactorSource: null,
  airEmissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const C4Step = createConfiguredModuleStep<'C4', C4FormState>({
  moduleId: 'C4',
  title: 'C4 – Transport og distribution (upstream)',
  description:
    'Registrér ton-kilometer for upstream logistik på vej, bane, sø og luft. Vælg emissionsfaktorer fra databasen eller anvend egne værdier.',
  emptyState: EMPTY_C4,
  fields: [
    {
      type: 'number',
      key: 'roadTonnesKm',
      label: 'Vejtransport – ton-kilometer',
      unit: 't·km',
      description: 'Transportydelse for vejbaseret logistik.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'roadEmissionFactorSource',
      label: 'Emissionsfaktor for vejtransport',
      description: 'Vælg lastbiltype eller anvend tilpasset faktor.',
      options: ROAD_EMISSION_FACTOR_OPTIONS
    },
    {
      type: 'number',
      key: 'roadEmissionFactorKgPerTonneKm',
      label: 'Valgt emissionsfaktor – vej',
      unit: 'kg CO₂e/t·km',
      description: 'Kan overskrives hvis egne data foreligger.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'railTonnesKm',
      label: 'Banetransport – ton-kilometer',
      unit: 't·km',
      description: 'Ton-km for transport via tog.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'railEmissionFactorSource',
      label: 'Emissionsfaktor for banetransport',
      description: 'Vælg standardfaktor for elektrisk eller dieseltog.',
      options: RAIL_EMISSION_FACTOR_OPTIONS
    },
    {
      type: 'number',
      key: 'railEmissionFactorKgPerTonneKm',
      label: 'Valgt emissionsfaktor – bane',
      unit: 'kg CO₂e/t·km',
      description: 'Standard eller tilpasset faktor.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'seaTonnesKm',
      label: 'Søtransport – ton-kilometer',
      unit: 't·km',
      description: 'Ton-km for søfragt.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'seaEmissionFactorSource',
      label: 'Emissionsfaktor for søtransport',
      description: 'Vælg skibstype for søfragt.',
      options: SEA_EMISSION_FACTOR_OPTIONS
    },
    {
      type: 'number',
      key: 'seaEmissionFactorKgPerTonneKm',
      label: 'Valgt emissionsfaktor – sø',
      unit: 'kg CO₂e/t·km',
      description: 'Kan justeres manuelt efter leverandørdata.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'airTonnesKm',
      label: 'Lufttransport – ton-kilometer',
      unit: 't·km',
      description: 'Ton-km for luftfragt.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'airEmissionFactorSource',
      label: 'Emissionsfaktor for lufttransport',
      description: 'Vælg om fragten sendes som belly cargo eller dedikeret fragt.',
      options: AIR_EMISSION_FACTOR_OPTIONS
    },
    {
      type: 'number',
      key: 'airEmissionFactorKgPerTonneKm',
      label: 'Valgt emissionsfaktor – luft',
      unit: 'kg CO₂e/t·km',
      description: 'Standardværdi eller egen faktor.',
      min: 0,
      step: 'any'
    },
    {
      type: 'percent',
      key: 'consolidationEfficiencyPercent',
      label: 'Konsolideringsgevinst',
      description: 'Andel sparede emissioner via samlast eller optimering (maks 50%).',
      max: 50
    },
    {
      type: 'percent',
      key: 'lowCarbonSharePercent',
      label: 'Lavemissionslogistik',
      description: 'Andel af transporten der udføres med lavemissionsløsninger.',
      max: 100
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af logistikdata og transportdokumentation.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload fragtbreve, leverandørdata eller emissionsrapporter.'
    }
  ],
  runModule: runC4
})
