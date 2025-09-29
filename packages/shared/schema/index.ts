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
    B11: b11InputSchema.optional()
  })
  .passthrough()

export type EsgInput = z.infer<typeof esgInputSchema>

export function getRawSchema(): unknown {
  return schema
}
