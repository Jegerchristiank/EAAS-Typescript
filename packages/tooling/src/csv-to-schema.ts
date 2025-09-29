/**
 * Konverterer modul-CSV til JSON Schema objekt.
 */
import { readFile } from 'node:fs/promises'

export type CsvSchemaRow = {
  module: string
  value_type: string
}

const b1Override = {
  type: 'object',
  title: 'B1Input',
  description: 'Scope 2 elforbrug',
  properties: {
    electricityConsumptionKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Årligt elforbrug (kWh)'
    },
    emissionFactorKgPerKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Emissionsfaktor (kg CO2e pr. kWh)'
    },
    renewableSharePercent: {
      type: ['number', 'null'],
      minimum: 0,
      maximum: 100,
      description: 'Andel af strøm indkøbt som vedvarende energi (%)'
    }
  },
  additionalProperties: false
} as const

const typeMap: Record<string, unknown> = {
  string: { type: 'string' },
  number: { type: 'number' },
  object: { type: 'object' }
}

const b2Override = {
  type: 'object',
  title: 'B2Input',
  description: 'Scope 2 varmeforbrug',
  properties: {
    heatConsumptionKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Årligt varmeforbrug fra leverandør (kWh)'
    },
    recoveredHeatKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Genindvundet eller egenproduceret varme trukket fra (kWh)'
    },
    emissionFactorKgPerKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Emissionsfaktor for varmeleverancen (kg CO2e pr. kWh)'
    },
    renewableSharePercent: {
      type: ['number', 'null'],
      minimum: 0,
      maximum: 100,
      description: 'Andel af certificeret vedvarende varme (%)'
    }
  },
  additionalProperties: false
} as const

const b3Override = {
  type: 'object',
  title: 'B3Input',
  description: 'Scope 2 køleforbrug',
  properties: {
    coolingConsumptionKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Årligt køleforbrug fra leverandør (kWh)'
    },
    recoveredCoolingKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Genindvundet eller frikøling trukket fra (kWh)'
    },
    emissionFactorKgPerKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Emissionsfaktor for køleleverancen (kg CO2e pr. kWh)'
    },
    renewableSharePercent: {
      type: ['number', 'null'],
      minimum: 0,
      maximum: 100,
      description: 'Andel af certificeret vedvarende køling (%)'
    }
  },
  additionalProperties: false
} as const

const moduleOverrides: Record<string, unknown> = {
  B1: b1Override,
  B2: b2Override,
  B3: b3Override
}

export async function convertCsvToSchema(csvPath: string): Promise<Record<string, unknown>> {
  const raw = await readFile(csvPath, 'utf-8')
  const lines = raw.trim().split(/\r?\n/)
  const [, ...rows] = lines

  const properties = rows.reduce<Record<string, unknown>>((acc, line) => {
    const [module, valueType] = line.split(',').map((cell) => cell.trim())
    if (!module) {
      return acc
    }
    const override = moduleOverrides[module]
    if (override) {
      acc[module] = override
      return acc
    }
    const mappedType = typeMap[valueType ?? '']
    acc[module] = mappedType ?? { type: 'string' }
    return acc
  }, {})

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'ESGInput',
    type: 'object',
    properties,
    additionalProperties: true
  }
}
