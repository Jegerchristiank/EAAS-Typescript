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
  },
  c10: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    defaultElectricityIntensityKwhPerSqm: 95,
    defaultHeatIntensityKwhPerSqm: 80,
    defaultElectricityEmissionFactorKgPerKwh: 0.18,
    defaultHeatEmissionFactorKgPerKwh: 0.07,
    defaultDocumentationQualityPercent: 100,
    lowDocumentationQualityThresholdPercent: 60,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c11: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    defaultElectricityIntensityKwhPerSqm: 95,
    defaultHeatIntensityKwhPerSqm: 80,
    defaultElectricityEmissionFactorKgPerKwh: 0.18,
    defaultHeatEmissionFactorKgPerKwh: 0.07,
    defaultDocumentationQualityPercent: 100,
    lowDocumentationQualityThresholdPercent: 60,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c12: {
    kgToTonnes: 0.001,
    percentToRatio: 0.01,
    defaultDocumentationQualityPercent: 100,
    lowDocumentationQualityThresholdPercent: 60,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c13: {
    kgToTonnes: 0.001,
    defaultDocumentationQualityPercent: 100,
    lowDocumentationQualityThresholdPercent: 60,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c14: {
    kgToTonnes: 0.001,
    defaultDocumentationQualityPercent: 100,
    lowDocumentationQualityThresholdPercent: 60,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  c15: {
    kgToTonnes: 0.001,
    defaultDocumentationQualityPercent: 100,
    lowDocumentationQualityThresholdPercent: 60,
    resultPrecision: 3,
    unit: 't CO2e'
  },
  e2Water: {
    unit: 'vandstressindeks',
    resultPrecision: 1,
    stressWeight: 0.5,
    reuseWeight: 0.3,
    dischargeWeight: 0.2,
    stressWarningThreshold: 0.4,
    defaultReusePercent: 0,
    lowDataQualityThresholdPercent: 70,
    minimumReportableWithdrawalM3: 10,
  },
  e3Pollution: {
    unit: 'compliance-score',
    resultPrecision: 1,
    baseScore: 100,
    exceedPenaltyPerPercent: 0.9,
    incidentPenalty: 7,
    defaultLimitsTonnes: {
      air: 50,
      water: 20,
      soil: 5,
    },
    documentationWarningThresholdPercent: 70,
  },
  e4Biodiversity: {
    unit: 'biodiversitetsrisiko',
    resultPrecision: 1,
    siteWeight: 0.3,
    areaWeight: 0.4,
    incidentWeight: 0.3,
    siteNormalizationCount: 5,
    areaNormalizationHectares: 50,
    incidentNormalizationCount: 5,
    restorationMitigationRate: 0.6,
    riskAttentionThreshold: 60,
    dataQualityWarningPercent: 70,
  },
  e5Resources: {
    unit: 'ressourceindeks',
    resultPrecision: 1,
    primaryWeight: 0.35,
    criticalWeight: 0.2,
    recycledWeight: 0.2,
    renewableWeight: 0.15,
    targetWeight: 0.1,
    primaryNormalizationTonnes: 1000,
    circularityAttentionThreshold: 55,
    documentationWarningThresholdPercent: 70,
  },
  d1: {
    unit: 'governance score',
    maxScore: 100,
    resultPrecision: 1,
    partialTextLength: 120,
    detailedTextLength: 240
  },
  d2: {
    unit: 'prioritets-score (0-100)',
    maxScore: 5,
    resultPrecision: 1,
    impactWeight: 0.6,
    financialWeight: 0.4,
    priorityThreshold: 4,
    attentionThreshold: 3,
    summaryLimit: 3,
    gapWarningStatuses: ['missing'] as ReadonlyArray<'aligned' | 'partial' | 'missing'>,
    timelineWarningForPriority: true,
    responsibleWarningForPriority: true
  },
  s1: {
    unit: 'social score',
    resultPrecision: 1,
    totalHeadcountWeight: 0.35,
    breakdownWeight: 0.35,
    coverageWeight: 0.2,
    labourRightsWeight: 0.1,
    minSegmentsForFullScore: 4,
    coverageWarningThresholdPercent: 70,
    labourRightsWarningThresholdPercent: 60
  },
  s2: {
    unit: 'social score',
    resultPrecision: 1,
    parityWeight: 0.6,
    coverageWeight: 0.2,
    policyWeight: 0.2,
    fullParityPercent: 50,
    severeGapPercent: 20,
    narrativeLimit: 2000
  },
  s3: {
    unit: 'social score',
    resultPrecision: 1,
    fatalityPenalty: 45,
    lostTimePenalty: 18,
    recordablePenalty: 8,
    nearMissCredit: 2,
    baselineHoursDivisor: 1_000_000,
    baselineTargetRate: 3,
    ratePenaltyMultiplier: 12,
    certificationBonus: 10
  },
  s4: {
    unit: 'social score',
    resultPrecision: 1,
    coverageWeight: 0.6,
    severityWeight: 0.2,
    grievanceWeight: 0.2,
    highRiskPenalty: 0.6,
    mediumRiskPenalty: 0.3
  },
  g1: {
    unit: 'governance score',
    resultPrecision: 1,
    policyWeight: 0.4,
    targetWeight: 0.4,
    oversightWeight: 0.2,
    policyStatusScores: {
      approved: 1,
      inReview: 0.7,
      draft: 0.4,
      missing: 0,
      retired: 0.2
    } as const,
    targetStatusScores: {
      onTrack: 1,
      lagging: 0.6,
      offTrack: 0.2,
      notStarted: 0.1
    } as const,
    minPoliciesForFullScore: 5,
    minTargetsForFullScore: 5
  }
} as const
