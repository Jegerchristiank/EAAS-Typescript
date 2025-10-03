/**
 * Wizardtrin for modul C1 – medarbejderpendling.
 */
'use client'

import type { C1Input } from '@org/shared'
import { runC1 } from '@org/shared'

import { createConfiguredModuleStep } from './ConfiguredModuleStep'

type CommuteTransportOption = {
  value: string
  label: string
  description: string
  defaultEmissionFactor: number
}

type C1FormState = C1Input & {
  transportProfile?: string | null
  emissionFactorSource?: string | null
  documentationQualityPercent?: number | null
  documentationFileName?: string | null
}

const COMMUTE_TRANSPORT_OPTIONS: CommuteTransportOption[] = [
  {
    value: 'carPetrol',
    label: 'Personbil – benzin',
    description: 'Gennemsnitlig emissionsprofil for benzinbiler i Danmark.',
    defaultEmissionFactor: 0.182
  },
  {
    value: 'carDiesel',
    label: 'Personbil – diesel',
    description: 'Dieselbiler med nyere Euro 6-motorer.',
    defaultEmissionFactor: 0.165
  },
  {
    value: 'carHybrid',
    label: 'Plug-in hybridbil',
    description: 'Antager kombineret kørsel på el og brændstof.',
    defaultEmissionFactor: 0.11
  },
  {
    value: 'carElectric',
    label: 'Elbil',
    description: 'Elbil opladet på nordisk elmix.',
    defaultEmissionFactor: 0.05
  },
  {
    value: 'publicTransit',
    label: 'Bus/Metro',
    description: 'Offentlig transport baseret på mix af bus og metro.',
    defaultEmissionFactor: 0.081
  },
  {
    value: 'rail',
    label: 'Tog',
    description: 'Elektriske tog med nordisk elmix.',
    defaultEmissionFactor: 0.035
  }
]

const COMMUTE_EMISSION_FACTOR_OPTIONS = COMMUTE_TRANSPORT_OPTIONS.map((option) => ({
  value: option.value,
  label: `${option.label} (${option.defaultEmissionFactor.toFixed(3)} kg CO₂e/km)`,
  derived: { emissionFactorKgPerKm: option.defaultEmissionFactor }
})).concat([
  {
    value: 'custom',
    label: 'Tilpasset emissionsfaktor',
    derived: {}
  }
])

const EMPTY_C1: C1FormState = {
  employeesCovered: null,
  averageCommuteDistanceKm: null,
  commutingDaysPerWeek: null,
  weeksPerYear: null,
  remoteWorkSharePercent: null,
  emissionFactorKgPerKm: null,
  transportProfile: null,
  emissionFactorSource: null,
  documentationQualityPercent: null,
  documentationFileName: null
}

export const C1Step = createConfiguredModuleStep<'C1', C1FormState>({
  moduleId: 'C1',
  title: 'C1 – Medarbejderpendling',
  description:
    'Angiv antal medarbejdere, afstand og arbejdsdage for at estimere emissioner fra pendling. Vælg transportprofil og emissionsfaktor fra databasen eller indtast egne værdier.',
  emptyState: EMPTY_C1,
  fields: [
    {
      type: 'number',
      key: 'employeesCovered',
      label: 'Antal ansatte',
      unit: 'personer',
      description: 'Antal medarbejdere der indgår i pendlingen.',
      min: 0
    },
    {
      type: 'number',
      key: 'averageCommuteDistanceKm',
      label: 'Tur/retur-distance',
      unit: 'km',
      description: 'Gennemsnitlig distance for en pendlerdag (tur/retur).',
      min: 0,
      step: 'any'
    },
    {
      type: 'number',
      key: 'commutingDaysPerWeek',
      label: 'Pendlerdage pr. uge',
      unit: 'dage',
      description: 'Hvor mange dage om ugen pendler medarbejderne i gennemsnit.',
      min: 0,
      max: 7
    },
    {
      type: 'number',
      key: 'weeksPerYear',
      label: 'Arbejdsuger pr. år',
      unit: 'uger',
      description: 'Typisk 46 uger efter ferie og helligdage.',
      min: 0,
      max: 52
    },
    {
      type: 'percent',
      key: 'remoteWorkSharePercent',
      label: 'Andel hjemmearbejde',
      description: 'Reducerer pendlingen lineært i beregningen.'
    },
    {
      type: 'select',
      key: 'transportProfile',
      label: 'Transporttype',
      description: 'Vælg den primære transporttype for pendlingen. Valget kan tilpasses pr. emissionsfaktor nedenfor.',
      options: COMMUTE_TRANSPORT_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        description: option.description,
        derived: {
          emissionFactorSource: option.value,
          emissionFactorKgPerKm: option.defaultEmissionFactor
        }
      })),
      placeholder: 'Vælg transporttype'
    },
    {
      type: 'select',
      key: 'emissionFactorSource',
      label: 'Emissionsfaktor fra database',
      description: 'Vælg standardfaktor eller angiv en egen leverandørværdi.',
      options: COMMUTE_EMISSION_FACTOR_OPTIONS,
      placeholder: 'Vælg emissionsfaktor'
    },
    {
      type: 'number',
      key: 'emissionFactorKgPerKm',
      label: 'Valgt emissionsfaktor',
      unit: 'kg CO₂e/km',
      description: 'Forudfyldes af dropdowns, men kan overskrives manuelt.',
      min: 0,
      step: 'any'
    },
    {
      type: 'percent',
      key: 'documentationQualityPercent',
      label: 'Dokumentationskvalitet',
      description: 'Vurdering af hvor sikker dokumentationen er for inputdata.'
    },
    {
      type: 'file',
      key: 'documentationFileName',
      label: 'Dokumentation',
      description: 'Upload fx pendlerundersøgelse eller HR-data.'
    }
  ],
  runModule: runC1
})
