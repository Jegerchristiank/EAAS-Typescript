/**
 * Opsamling af konfigurerbare faktorer for modulberegninger.
 */
export const factors = {
  defaultFactor: 1,
  a1: {
    kgToTonnes: 0.001,
    resultPrecision: 3,
    unit: 't CO2e',
    defaultDocumentationQualityPercent: 100,
    lowDocumentationQualityThresholdPercent: 60
  },
  a2: {
    kgToTonnes: 0.001,
    resultPrecision: 3,
    unit: 't CO2e',
    defaultDocumentationQualityPercent: 100,
    lowDocumentationQualityThresholdPercent: 60
  },
  a3: {
    kgToTonnes: 0.001,
    resultPrecision: 3,
    unit: 't CO2e',
    defaultDocumentationQualityPercent: 100,
    lowDocumentationQualityThresholdPercent: 60
  },
  a4: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    resultPrecision: 3,
    unit: 't CO2e',
    defaultLeakagePercent: 10,
    defaultDocumentationQualityPercent: 100,
    lowDocumentationQualityThresholdPercent: 60
  },
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
  },
  b8: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    qualityMitigationRate: 0.9,
    maximumDocumentationPercent: 100,
    minimumEffectiveQualityPercent: 15,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  b9: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    qualityMitigationRate: 0.92,
    maximumDocumentationPercent: 100,
    minimumEffectiveQualityPercent: 20,
    maximumGridLossPercent: 15,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  b10: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    qualityMitigationRate: 0.88,
    maximumDocumentationPercent: 100,
    minimumEffectiveQualityPercent: 25,
    maximumSettlementPercent: 100,
    minimumEffectiveSettlementPercent: 20,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  b11: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    qualityMitigationRate: 0.85,
    timeMatchingMitigationRate: 0.9,
    maximumDocumentationPercent: 100,
    minimumEffectiveQualityPercent: 30,
    maximumTimeCorrelationPercent: 100,
    minimumEffectiveTimeCorrelationPercent: 50,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c1: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    maximumDaysPerWeek: 7,
    maximumWeeksPerYear: 52,
    defaultWeeksPerYear: 46,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c2: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    defaultHotelEmissionFactorKgPerNight: 15,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c3: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    renewableMitigationRate: 0.8,
    maximumTransmissionLossPercent: 20,
    maximumRenewableSharePercent: 100,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c4: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    consolidationMitigationRate: 0.6,
    lowCarbonMitigationRate: 0.75,
    maximumConsolidationPercent: 50,
    maximumLowCarbonSharePercent: 100,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c5: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    recyclingMitigationRate: 0.7,
    reuseMitigationRate: 0.8,
    maximumRecyclingRecoveryPercent: 90,
    maximumReuseSharePercent: 60,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c6: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    electricityRenewableMitigationRate: 0.75,
    heatRenewableMitigationRate: 0.6,
    maximumOccupancyPercent: 100,
    maximumSharedServicesPercent: 50,
    maximumRenewableSharePercent: 100,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c7: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    lowEmissionVehicleMitigationRate: 0.7,
    renewableWarehousingMitigationRate: 0.85,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c8: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    efficiencyMitigationRate: 0.9,
    renewableMitigationRate: 0.85,
    defaultOccupancyPercent: 100,
    defaultLandlordSharePercent: 100,
    maximumEfficiencyPercent: 70,
    maximumRenewableSharePercent: 100,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c9: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    efficiencyMitigationRate: 0.85,
    secondaryMaterialMitigationRate: 0.6,
    renewableMitigationRate: 0.9,
    maximumEfficiencyPercent: 60,
    maximumSecondaryMaterialPercent: 80,
    maximumRenewableSharePercent: 100,
    resultPrecision: 3,
    unit: 't CO2e'
  }
} as const
