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

const moduleOverrides: Record<string, unknown> = {
  B1: b1Override
const typeMap: Record<string, unknown> = {
  string: { type: 'string' },
  number: { type: 'number' }
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
    if (moduleOverrides[module]) {
      acc[module] = moduleOverrides[module]
      return acc
    }
    acc[module] = typeMap[valueType] ?? { type: 'string' }
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
