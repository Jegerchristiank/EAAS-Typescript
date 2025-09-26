/**
 * Konverterer modul-CSV til simpelt formelopslagsmap.
 */
import { readFile } from 'node:fs/promises'

export async function convertCsvToFormulaMap(csvPath: string): Promise<Record<string, string>> {
  const raw = await readFile(csvPath, 'utf-8')
  const lines = raw.trim().split(/\r?\n/)
  const [, ...rows] = lines

  return rows.reduce<Record<string, string>>((acc, line) => {
    const [module] = line.split(',')
    if (module) {
      acc[module.trim()] = `${module.trim()} = input`
    }
    return acc
  }, {})
}
