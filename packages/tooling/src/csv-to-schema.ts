/**
 * Konverterer modul-CSV til JSON Schema objekt.
 */
import { readFile } from 'node:fs/promises'

export type CsvSchemaRow = {
  module: string
  value_type: string
}

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
