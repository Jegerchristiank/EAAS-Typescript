/**
 * Opsamling af konfigurerbare faktorer for modulberegninger.
 */
export const factors = {
  defaultFactor: 1,
  b1: {
    kgToTonnes: 0.001,
    renewableMitigationRate: 0.9,
    percentToRatio: 0.01,
    maximumRenewableSharePercent: 100,
    resultPrecision: 3,
    unit: 't CO2e'
  }
} as const
