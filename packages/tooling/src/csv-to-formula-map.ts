/**
 * Konverterer modul-CSV til simpelt formelopslagsmap.
 */
import { readFile } from 'node:fs/promises'

const formulaOverrides: Record<string, string> = {
  B1:
    'B1 = (electricityConsumptionKwh * emissionFactorKgPerKwh) - (electricityConsumptionKwh * emissionFactorKgPerKwh * renewableSharePercent/100 * 0.9)',
  B2:
    'B2 = ((heatConsumptionKwh - recoveredHeatKwh) * emissionFactorKgPerKwh) - ((heatConsumptionKwh - recoveredHeatKwh) * emissionFactorKgPerKwh * renewableSharePercent/100 * 0.85)',
  B3:
    'B3 = ((coolingConsumptionKwh - recoveredCoolingKwh) * emissionFactorKgPerKwh) - ((coolingConsumptionKwh - recoveredCoolingKwh) * emissionFactorKgPerKwh * renewableSharePercent/100 * 0.9)',
  B4:
    'B4 = ((steamConsumptionKwh - recoveredSteamKwh) * emissionFactorKgPerKwh) - ((steamConsumptionKwh - recoveredSteamKwh) * emissionFactorKgPerKwh * renewableSharePercent/100 * 0.85)',
  B5:
    'B5 = ((otherEnergyConsumptionKwh - recoveredEnergyKwh) * emissionFactorKgPerKwh) - ((otherEnergyConsumptionKwh - recoveredEnergyKwh) * emissionFactorKgPerKwh * renewableSharePercent/100 * 0.8)',
  B6:
    'B6 = (electricitySuppliedKwh * gridLossPercent/100 * emissionFactorKgPerKwh) - (electricitySuppliedKwh * gridLossPercent/100 * emissionFactorKgPerKwh * renewableSharePercent/100 * 0.9)'
    'B5 = ((otherEnergyConsumptionKwh - recoveredEnergyKwh) * emissionFactorKgPerKwh) - ((otherEnergyConsumptionKwh - recoveredEnergyKwh) * emissionFactorKgPerKwh * renewableSharePercent/100 * 0.8)'
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
