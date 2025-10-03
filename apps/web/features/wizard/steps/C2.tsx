/**
 * Wizardtrin for modul C2 – forretningsrejser.
 */
'use client'

import type { C2Input } from '@org/shared'
import { runC2 } from '@org/shared'

import { createConfiguredModuleStep, type SelectOption } from './ConfiguredModuleStep'

type EmissionFactorOption = {
  value: string
  label: string
  factor: number
}

type C2FormState = C2Input & {
  airEmissionFactorSource?: string | null
  railEmissionFactorSource?: string | null
  roadEmissionFactorSource?: string | null
  hotelEmissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const AIR_TRAVEL_OPTIONS: EmissionFactorOption[] = [
  { value: 'shortHaul', label: 'Fly – kortdistance (0,158 kg CO₂e/km)', factor: 0.158 },
  { value: 'mediumHaul', label: 'Fly – mellemdistance (0,136 kg CO₂e/km)', factor: 0.136 },
  { value: 'longHaul', label: 'Fly – langdistance (0,118 kg CO₂e/km)', factor: 0.118 }
]

const RAIL_TRAVEL_OPTIONS: EmissionFactorOption[] = [
  { value: 'electric', label: 'Tog – elektrisk (0,028 kg CO₂e/km)', factor: 0.028 },
  { value: 'diesel', label: 'Tog – diesel (0,045 kg CO₂e/km)', factor: 0.045 },
  { value: 'metro', label: 'Metro/Lokalbane (0,020 kg CO₂e/km)', factor: 0.02 }
]

const ROAD_TRAVEL_OPTIONS: EmissionFactorOption[] = [
  { value: 'companyCarPetrol', label: 'Firmabil – benzin (0,182 kg CO₂e/km)', factor: 0.182 },
  { value: 'companyCarDiesel', label: 'Firmabil – diesel (0,165 kg CO₂e/km)', factor: 0.165 },
  { value: 'companyCarElectric', label: 'Firmabil – el (0,060 kg CO₂e/km)', factor: 0.06 },
  { value: 'rentalCar', label: 'Lejebiler/Taxi (0,190 kg CO₂e/km)', factor: 0.19 }
]

const HOTEL_OPTIONS: EmissionFactorOption[] = [
  { value: 'businessHotel', label: 'Forretningshotel (15 kg CO₂e/nat)', factor: 15 },
  { value: 'budgetHotel', label: 'Budgethotel (9 kg CO₂e/nat)', factor: 9 },
  { value: 'greenHotel', label: 'Certificeret grønt hotel (6 kg CO₂e/nat)', factor: 6 }
]

const AIR_EMISSION_FACTOR_OPTIONS: Array<SelectOption<C2FormState>> = [
  ...AIR_TRAVEL_OPTIONS.map<SelectOption<C2FormState>>((option) => ({
    value: option.value,
    label: option.label,
    derived: { airEmissionFactorKgPerKm: option.factor }
  })),
  { value: 'custom', label: 'Tilpasset emissionsfaktor' }
]

const RAIL_EMISSION_FACTOR_OPTIONS: Array<SelectOption<C2FormState>> = [
  ...RAIL_TRAVEL_OPTIONS.map<SelectOption<C2FormState>>((option) => ({
    value: option.value,
    label: option.label,
    derived: { railEmissionFactorKgPerKm: option.factor }
  })),
  { value: 'custom', label: 'Tilpasset emissionsfaktor' }
]

const ROAD_EMISSION_FACTOR_OPTIONS: Array<SelectOption<C2FormState>> = [
  ...ROAD_TRAVEL_OPTIONS.map<SelectOption<C2FormState>>((option) => ({
    value: option.value,
    label: option.label,
    derived: { roadEmissionFactorKgPerKm: option.factor }
  })),
  { value: 'custom', label: 'Tilpasset emissionsfaktor' }
]

const HOTEL_EMISSION_FACTOR_OPTIONS: Array<SelectOption<C2FormState>> = [
  ...HOTEL_OPTIONS.map<SelectOption<C2FormState>>((option) => ({
    value: option.value,
    label: option.label,
    derived: { hotelEmissionFactorKgPerNight: option.factor }
  })),
  { value: 'custom', label: 'Tilpasset emissionsfaktor' }
]

const EMPTY_C2: C2FormState = {
  airTravelDistanceKm: null,
  airEmissionFactorKgPerKm: null,
  railTravelDistanceKm: null,
  railEmissionFactorKgPerKm: null,
  roadTravelDistanceKm: null,
  roadEmissionFactorKgPerKm: null,
  hotelNights: null,
  hotelEmissionFactorKgPerNight: null,
  virtualMeetingSharePercent: null,
  airEmissionFactorSource: null,
  railEmissionFactorSource: null,
  roadEmissionFactorSource: null,
  hotelEmissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const C2Step = createConfiguredModuleStep<'C2', C2FormState>({
  moduleId: 'C2',
  title: 'C2 – Forretningsrejser',
  description:
    'Indtast kilometer for fly, tog og bil samt antal hotelovernatninger. Vælg emissionsfaktorer fra standarddatabasen eller brug egne værdier.',
  emptyState: EMPTY_C2,
  fields: [
    {
      type: 'number',
      key: 'airTravelDistanceKm',
      label: 'Flyrejser',
      unit: 'km',
      description: 'Samlede kilometer fløjet i perioden.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'airEmissionFactorSource',
      label: 'Emissionsfaktor for fly',
      description: 'Vælg en standardfaktor eller angiv en tilpasset værdi.',
      options: AIR_EMISSION_FACTOR_OPTIONS
    },
    {
      type: 'number',
      key: 'airEmissionFactorKgPerKm',
      label: 'Valgt emissionsfaktor – fly',
      unit: 'kg CO₂e/km',
      description: 'Kan overskrives manuelt ved egne leverandørdata.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'railTravelDistanceKm',
      label: 'Togrejser',
      unit: 'km',
      description: 'Kilometer kørt med tog.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'railEmissionFactorSource',
      label: 'Emissionsfaktor for tog',
      description: 'Vælg standardfaktor baseret på togtype.',
      options: RAIL_EMISSION_FACTOR_OPTIONS
    },
    {
      type: 'number',
      key: 'railEmissionFactorKgPerKm',
      label: 'Valgt emissionsfaktor – tog',
      unit: 'kg CO₂e/km',
      description: 'Automatisk udfyldt men kan ændres.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'roadTravelDistanceKm',
      label: 'Bil og taxi',
      unit: 'km',
      description: 'Kilometer kørt med bil, taxi eller lejebil.',
      min: 0,
      step: 'any'
    },
    {
      type: 'select',
      key: 'roadEmissionFactorSource',
      label: 'Emissionsfaktor for bil',
      description: 'Vælg køretøjstype. Faktor kan efterfølgende justeres.',
      options: ROAD_EMISSION_FACTOR_OPTIONS
    },
    {
      type: 'number',
      key: 'roadEmissionFactorKgPerKm',
      label: 'Valgt emissionsfaktor – bil',
      unit: 'kg CO₂e/km',
      description: 'Tilpas hvis der foreligger virksomhedsspecifikke data.',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'hotelNights',
      label: 'Hotelovernatninger',
      unit: 'nætter',
      description: 'Samlet antal nætter på hotel.',
      min: 0
    },
    {
      type: 'select',
      key: 'hotelEmissionFactorSource',
      label: 'Emissionsfaktor for hotel',
      description: 'Vælg niveau for hotelstandard. Faktoren kan overskrives.',
      options: HOTEL_EMISSION_FACTOR_OPTIONS
    },
    {
      type: 'number',
      key: 'hotelEmissionFactorKgPerNight',
      label: 'Valgt emissionsfaktor – hotel',
      unit: 'kg CO₂e/nat',
      description: 'Standardværdi fra dropdown eller egen beregning.',
      min: 0,
      step: 'any'
    },
    {
      type: 'percent',
      key: 'virtualMeetingSharePercent',
      label: 'Andel virtuelle møder',
      description: 'Angiv hvor stor en del af rejserne der er erstattet af virtuelle møder.'
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af kvaliteten af rejseafregninger og logfiler.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload rejseafregninger eller uddrag fra rejsebureau.'
    }
  ],
  runModule: runC2
})
