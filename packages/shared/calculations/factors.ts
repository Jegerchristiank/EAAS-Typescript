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
  },
  b2: {
    kgToTonnes: 0.001,
    renewableMitigationRate: 0.85,
    percentToRatio: 0.01,
    maximumRenewableSharePercent: 100,
    recoveryCreditRate: 1,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  b3: {
    kgToTonnes: 0.001,
    renewableMitigationRate: 0.9,
    percentToRatio: 0.01,
    maximumRenewableSharePercent: 100,
    recoveryCreditRate: 1,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  b4: {
    kgToTonnes: 0.001,
    renewableMitigationRate: 0.85,
    percentToRatio: 0.01,
    maximumRenewableSharePercent: 100,
    recoveryCreditRate: 1,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  b5: {
    kgToTonnes: 0.001,
    renewableMitigationRate: 0.8,
    percentToRatio: 0.01,
    maximumRenewableSharePercent: 100,
    recoveryCreditRate: 1,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  b6: {
    kgToTonnes: 0.001,
    renewableMitigationRate: 0.9,
    percentToRatio: 0.01,
    maximumRenewableSharePercent: 100,
    maximumGridLossPercent: 20,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  b7: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    qualityMitigationRate: 0.95,
    maximumDocumentationPercent: 100,
    minimumEffectiveQualityPercent: 10,
    resultPrecision: 3,
    unit: 't CO2e'
  }
} as const
