/**
 * Eksporterer inputskema og zod-validering for ESG-data.
 */
import { z } from 'zod'
import schema from './esg-input-schema.json'

export const b1InputSchema = z
  .object({
    electricityConsumptionKwh: z.number().min(0).nullable(),
    emissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b2InputSchema = z
  .object({
    heatConsumptionKwh: z.number().min(0).nullable(),
    recoveredHeatKwh: z.number().min(0).nullable(),
    emissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b3InputSchema = z
  .object({
    coolingConsumptionKwh: z.number().min(0).nullable(),
    recoveredCoolingKwh: z.number().min(0).nullable(),
    emissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b4InputSchema = z
  .object({
    steamConsumptionKwh: z.number().min(0).nullable(),
    recoveredSteamKwh: z.number().min(0).nullable(),
    emissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b5InputSchema = z
  .object({
    otherEnergyConsumptionKwh: z.number().min(0).nullable(),
    recoveredEnergyKwh: z.number().min(0).nullable(),
    emissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()


export const b6InputSchema = z
  .object({
    electricitySuppliedKwh: z.number().min(0).nullable(),
    gridLossPercent: z.number().min(0).max(100).nullable(),
    emissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b7InputSchema = z
  .object({
    documentedRenewableKwh: z.number().min(0).nullable(),
    residualEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b8InputSchema = z
  .object({
    onSiteRenewableKwh: z.number().min(0).nullable(),
    exportedRenewableKwh: z.number().min(0).nullable(),
    residualEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b9InputSchema = z
  .object({
    ppaDeliveredKwh: z.number().min(0).nullable(),
    matchedConsumptionKwh: z.number().min(0).nullable(),
    gridLossPercent: z.number().min(0).max(100).nullable(),
    residualEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b10InputSchema = z
  .object({
    ppaSettledKwh: z.number().min(0).nullable(),
    matchedConsumptionKwh: z.number().min(0).nullable(),
    marketSettlementPercent: z.number().min(0).max(100).nullable(),
    residualEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const b11InputSchema = z
  .object({
    certificatesRetiredKwh: z.number().min(0).nullable(),
    matchedConsumptionKwh: z.number().min(0).nullable(),
    timeCorrelationPercent: z.number().min(0).max(100).nullable(),
    residualEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    documentationQualityPercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c1InputSchema = z
  .object({
    employeesCovered: z.number().min(0).nullable(),
    averageCommuteDistanceKm: z.number().min(0).nullable(),
    commutingDaysPerWeek: z.number().min(0).max(7).nullable(),
    weeksPerYear: z.number().min(0).max(52).nullable(),
    remoteWorkSharePercent: z.number().min(0).max(100).nullable(),
    emissionFactorKgPerKm: z.number().min(0).nullable()
  })
  .strict()

export const c2InputSchema = z
  .object({
    airTravelDistanceKm: z.number().min(0).nullable(),
    airEmissionFactorKgPerKm: z.number().min(0).nullable(),
    railTravelDistanceKm: z.number().min(0).nullable(),
    railEmissionFactorKgPerKm: z.number().min(0).nullable(),
    roadTravelDistanceKm: z.number().min(0).nullable(),
    roadEmissionFactorKgPerKm: z.number().min(0).nullable(),
    hotelNights: z.number().min(0).nullable(),
    hotelEmissionFactorKgPerNight: z.number().min(0).nullable(),
    virtualMeetingSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c3InputSchema = z
  .object({
    purchasedElectricityKwh: z.number().min(0).nullable(),
    electricityUpstreamEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    transmissionLossPercent: z.number().min(0).max(20).nullable(),
    renewableSharePercent: z.number().min(0).max(100).nullable(),
    fuelConsumptionKwh: z.number().min(0).nullable(),
    fuelUpstreamEmissionFactorKgPerKwh: z.number().min(0).nullable()
  })
  .strict()

export const c4InputSchema = z
  .object({
    roadTonnesKm: z.number().min(0).nullable(),
    roadEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    railTonnesKm: z.number().min(0).nullable(),
    railEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    seaTonnesKm: z.number().min(0).nullable(),
    seaEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    airTonnesKm: z.number().min(0).nullable(),
    airEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    consolidationEfficiencyPercent: z.number().min(0).max(50).nullable(),
    lowCarbonSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c5InputSchema = z
  .object({
    landfillWasteTonnes: z.number().min(0).nullable(),
    landfillEmissionFactorKgPerTonne: z.number().min(0).nullable(),
    incinerationWasteTonnes: z.number().min(0).nullable(),
    incinerationEmissionFactorKgPerTonne: z.number().min(0).nullable(),
    recyclingWasteTonnes: z.number().min(0).nullable(),
    recyclingEmissionFactorKgPerTonne: z.number().min(0).nullable(),
    compostingWasteTonnes: z.number().min(0).nullable(),
    compostingEmissionFactorKgPerTonne: z.number().min(0).nullable(),
    recyclingRecoveryPercent: z.number().min(0).max(90).nullable(),
    reuseSharePercent: z.number().min(0).max(60).nullable()
  })
  .strict()

export const c6InputSchema = z
  .object({
    leasedFloorAreaSqm: z.number().min(0).nullable(),
    electricityIntensityKwhPerSqm: z.number().min(0).nullable(),
    heatIntensityKwhPerSqm: z.number().min(0).nullable(),
    occupancySharePercent: z.number().min(0).max(100).nullable(),
    sharedServicesAllocationPercent: z.number().min(0).max(50).nullable(),
    electricityEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    heatEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableElectricitySharePercent: z.number().min(0).max(100).nullable(),
    renewableHeatSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c7InputSchema = z
  .object({
    roadTonnesKm: z.number().min(0).nullable(),
    roadEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    railTonnesKm: z.number().min(0).nullable(),
    railEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    seaTonnesKm: z.number().min(0).nullable(),
    seaEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    airTonnesKm: z.number().min(0).nullable(),
    airEmissionFactorKgPerTonneKm: z.number().min(0).nullable(),
    warehousingEnergyKwh: z.number().min(0).nullable(),
    warehousingEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    lowEmissionVehicleSharePercent: z.number().min(0).max(100).nullable(),
    renewableWarehousingSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c8InputSchema = z
  .object({
    leasedFloorAreaSqm: z.number().min(0).nullable(),
    electricityIntensityKwhPerSqm: z.number().min(0).nullable(),
    heatIntensityKwhPerSqm: z.number().min(0).nullable(),
    occupancySharePercent: z.number().min(0).max(100).nullable(),
    landlordEnergySharePercent: z.number().min(0).max(100).nullable(),
    energyEfficiencyImprovementPercent: z.number().min(0).max(70).nullable(),
    electricityEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    heatEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    renewableElectricitySharePercent: z.number().min(0).max(100).nullable(),
    renewableHeatSharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export const c9InputSchema = z
  .object({
    processedOutputTonnes: z.number().min(0).nullable(),
    processingEnergyIntensityKwhPerTonne: z.number().min(0).nullable(),
    processingEmissionFactorKgPerKwh: z.number().min(0).nullable(),
    processEfficiencyImprovementPercent: z.number().min(0).max(60).nullable(),
    secondaryMaterialSharePercent: z.number().min(0).max(80).nullable(),
    renewableEnergySharePercent: z.number().min(0).max(100).nullable()
  })
  .strict()

export type B1Input = z.infer<typeof b1InputSchema>
export type B2Input = z.infer<typeof b2InputSchema>
export type B3Input = z.infer<typeof b3InputSchema>
export type B4Input = z.infer<typeof b4InputSchema>
export type B5Input = z.infer<typeof b5InputSchema>
export type B6Input = z.infer<typeof b6InputSchema>
export type B7Input = z.infer<typeof b7InputSchema>
export type B8Input = z.infer<typeof b8InputSchema>
export type B9Input = z.infer<typeof b9InputSchema>
export type B10Input = z.infer<typeof b10InputSchema>
export type B11Input = z.infer<typeof b11InputSchema>
export type C1Input = z.infer<typeof c1InputSchema>
export type C2Input = z.infer<typeof c2InputSchema>
export type C3Input = z.infer<typeof c3InputSchema>
export type C4Input = z.infer<typeof c4InputSchema>
export type C5Input = z.infer<typeof c5InputSchema>
export type C6Input = z.infer<typeof c6InputSchema>
export type C7Input = z.infer<typeof c7InputSchema>
export type C8Input = z.infer<typeof c8InputSchema>
export type C9Input = z.infer<typeof c9InputSchema>


export const esgInputSchema = z
  .object({
    B1: b1InputSchema.optional(),
    B2: b2InputSchema.optional(),
    B3: b3InputSchema.optional(),
    B4: b4InputSchema.optional(),
    B5: b5InputSchema.optional(),
    B6: b6InputSchema.optional(),
    B7: b7InputSchema.optional(),
    B8: b8InputSchema.optional(),
    B9: b9InputSchema.optional(),
    B10: b10InputSchema.optional(),
    B11: b11InputSchema.optional(),
    C1: c1InputSchema.optional(),
    C2: c2InputSchema.optional(),
    C3: c3InputSchema.optional(),
    C4: c4InputSchema.optional(),
    C5: c5InputSchema.optional(),
    C6: c6InputSchema.optional(),
    C7: c7InputSchema.optional(),
    C8: c8InputSchema.optional(),
    C9: c9InputSchema.optional()
  })
  .passthrough()

export type EsgInput = z.infer<typeof esgInputSchema>

export function getRawSchema(): unknown {
  return schema
}
