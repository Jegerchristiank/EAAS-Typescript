/**
 * Wizardtrin for modul C7 – transport og distribution (downstream).
 */
'use client'

import type { C7Input } from '@org/shared'
import { runC7 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

type EmissionFactorOption = {
  value: string
  label: string
  factor: number
}

type C7FormState = C7Input & {
  roadEmissionFactorSource?: string | null
  railEmissionFactorSource?: string | null
  seaEmissionFactorSource?: string | null
  airEmissionFactorSource?: string | null
  warehousingEmissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const ROAD_OPTIONS: EmissionFactorOption[] = [
  { value: 'parcelVans', label: 'Pakke-/kurerkørsel (0,22 kg CO₂e/t·km)', factor: 0.22 },
  { value: 'regionalTruck', label: 'Regional distribution (0,16 kg CO₂e/t·km)', factor: 0.16 },
  { value: 'electricTruck', label: 'Elektrisk distribution (0,07 kg CO₂e/t·km)', factor: 0.07 }
]

const RAIL_OPTIONS: EmissionFactorOption[] = [
  { value: 'electricRail', label: 'Elektrisk gods (0,028 kg CO₂e/t·km)', factor: 0.028 },
  { value: 'dieselRail', label: 'Diesel gods (0,045 kg CO₂e/t·km)', factor: 0.045 }
]

const SEA_OPTIONS: EmissionFactorOption[] = [
  { value: 'shortSea', label: 'Nærskibsfart (0,015 kg CO₂e/t·km)', factor: 0.015 },
  { value: 'deepSea', label: 'Dybhav/containerskib (0,010 kg CO₂e/t·km)', factor: 0.01 }
]

const AIR_OPTIONS: EmissionFactorOption[] = [
  { value: 'bellyCargo', label: 'Belly cargo (0,55 kg CO₂e/t·km)', factor: 0.55 },
  { value: 'expressAir', label: 'Express luftfragt (0,70 kg CO₂e/t·km)', factor: 0.7 }
]

const WAREHOUSING_OPTIONS: EmissionFactorOption[] = [
  { value: 'euWarehouse', label: 'EU-lager (0,12 kg CO₂e/kWh)', factor: 0.12 },
  { value: 'dkWarehouse', label: 'Dansk lager (0,09 kg CO₂e/kWh)', factor: 0.09 },
  { value: 'renewableWarehouse', label: 'Grønt lager (0,05 kg CO₂e/kWh)', factor: 0.05 }
]

const EMPTY_C7: C7FormState = {
  roadTonnesKm: null,
  roadEmissionFactorKgPerTonneKm: null,
  railTonnesKm: null,
  railEmissionFactorKgPerTonneKm: null,
  seaTonnesKm: null,
  seaEmissionFactorKgPerTonneKm: null,
  airTonnesKm: null,
  airEmissionFactorKgPerTonneKm: null,
  warehousingEnergyKwh: null,
  warehousingEmissionFactorKgPerKwh: null,
  lowEmissionVehicleSharePercent: null,
  renewableWarehousingSharePercent: null,
  roadEmissionFactorSource: null,
  railEmissionFactorSource: null,
  seaEmissionFactorSource: null,
  airEmissionFactorSource: null,
  warehousingEmissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const C7Step = createConfiguredModuleStep<'C7', C7FormState>({
  moduleId: 'C7',
  title: 'C7 – Transport og distribution (downstream)',
  description:
    'Registrér ton-kilometer for distribution til kunder samt energiforbrug i downstream-lagre. Vælg passende emissionsfaktorer og angiv dokumentation.',
  emptyState: EMPTY_C7,
  fields: [
    {
      type: 'number',
      key: 'roadTonnesKm',
      label: 'Vejtransport – ton-kilometer',
      unit: 't·km',
      description: 'Transportydelse for levering til kunder via vejtransport.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'roadEmissionFactorSource',
      label: 'Emissionsfaktor – vejtransport',
      description: 'Vælg passende logistikprofil for distribution.',
      options: ROAD_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        derived: { roadEmissionFactorKgPerTonneKm: option.factor }
      })).concat([{ value: 'custom', label: 'Tilpasset emissionsfaktor', derived: {} }])
    },
    {
      type: 'number',
      key: 'roadEmissionFactorKgPerTonneKm',
      label: 'Valgt emissionsfaktor – vej',
      unit: 'kg CO₂e/t·km',
      description: 'Justér ved særlige køretøjer eller data.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'railTonnesKm',
      label: 'Banetransport – ton-kilometer',
      unit: 't·km',
      description: 'Ton-km leveret via jernbane.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'railEmissionFactorSource',
      label: 'Emissionsfaktor – banetransport',
      description: 'Vælg togtype for distribution.',
      options: RAIL_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        derived: { railEmissionFactorKgPerTonneKm: option.factor }
      })).concat([{ value: 'custom', label: 'Tilpasset emissionsfaktor', derived: {} }])
    },
    {
      type: 'number',
      key: 'railEmissionFactorKgPerTonneKm',
      label: 'Valgt emissionsfaktor – bane',
      unit: 'kg CO₂e/t·km',
      description: 'Kan tilpasses med egne data.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'seaTonnesKm',
      label: 'Søtransport – ton-kilometer',
      unit: 't·km',
      description: 'Ton-km for downstream-søfragt.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'seaEmissionFactorSource',
      label: 'Emissionsfaktor – søtransport',
      description: 'Vælg passende skibstype for distribution.',
      options: SEA_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        derived: { seaEmissionFactorKgPerTonneKm: option.factor }
      })).concat([{ value: 'custom', label: 'Tilpasset emissionsfaktor', derived: {} }])
    },
    {
      type: 'number',
      key: 'seaEmissionFactorKgPerTonneKm',
      label: 'Valgt emissionsfaktor – sø',
      unit: 'kg CO₂e/t·km',
      description: 'Standard eller virksomhedsdata.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'airTonnesKm',
      label: 'Lufttransport – ton-kilometer',
      unit: 't·km',
      description: 'Ton-km for luftfragt til kunder.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'airEmissionFactorSource',
      label: 'Emissionsfaktor – lufttransport',
      description: 'Vælg flytype for distribution.',
      options: AIR_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        derived: { airEmissionFactorKgPerTonneKm: option.factor }
      })).concat([{ value: 'custom', label: 'Tilpasset emissionsfaktor', derived: {} }])
    },
    {
      type: 'number',
      key: 'airEmissionFactorKgPerTonneKm',
      label: 'Valgt emissionsfaktor – luft',
      unit: 'kg CO₂e/t·km',
      description: 'Tilpas ved specifikke ruter eller flytyper.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'warehousingEnergyKwh',
      label: 'Energiforbrug i downstream-lagre',
      unit: 'kWh',
      description: 'Energiforbrug til lager og distributionsterminaler.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'warehousingEmissionFactorSource',
      label: 'Emissionsfaktor – lagerenergi',
      description: 'Vælg emissionsfaktor for lagrenes energiforbrug.',
      options: WAREHOUSING_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        derived: { warehousingEmissionFactorKgPerKwh: option.factor }
      })).concat([{ value: 'custom', label: 'Tilpasset emissionsfaktor', derived: {} }])
    },
    {
      type: 'number',
      key: 'warehousingEmissionFactorKgPerKwh',
      label: 'Valgt emissionsfaktor – lagerenergi',
      unit: 'kg CO₂e/kWh',
      description: 'Mulighed for at indtaste egne værdier.',
      min: 0,
      step: 'any'
    },
    {
      type: 'percent',
      key: 'lowEmissionVehicleSharePercent',
      label: 'Lavemissionskøretøjer',
      description: 'Andel af distribution udført med lavemissionsflåde.',
      max: 100
    },
    {
      type: 'percent',
      key: 'renewableWarehousingSharePercent',
      label: 'Grøn lagerenergi',
      description: 'Andel af lagerenergi dækket af vedvarende kilder.',
      max: 100
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurder kvaliteten af distributionsdata og energirapporter.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload logistikrapporter, fragtdokumenter eller energidata.'
    }
  ],
  runModule: runC7
})
