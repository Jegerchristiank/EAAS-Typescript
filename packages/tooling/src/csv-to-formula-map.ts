/**
 * Konverterer modul-CSV til simpelt formelopslagsmap.
 */
import { readFile } from 'node:fs/promises'

const formulaOverrides: Record<string, string> = {
  B1:
    'B1 = (electricityConsumptionKwh * emissionFactorKgPerKwh) - (electricityConsumptionKwh * emissionFactorKgPerKwh * renewableSharePercent/100 * 0.9)'
}

export async function convertCsvToFormulaMap(csvPath: string): Promise<Record<string, string>> {
  const raw = await readFile(csvPath, 'utf-8')
  const lines = raw.trim().split(/\r?\n/)
  const [, ...rows] = lines

  return rows.reduce<Record<string, string>>((acc, line) => {
    const [module] = line.split(',')
    if (module) {
      const trimmed = module.trim()
      acc[trimmed] = formulaOverrides[trimmed] ?? `${trimmed} = input`
      acc[module.trim()] = `${module.trim()} = input`
    }
    return acc
  }, {})
}
