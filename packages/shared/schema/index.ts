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

export type B1Input = z.infer<typeof b1InputSchema>

export const esgInputSchema = z
  .object({
    B1: b1InputSchema.optional(),
    B2: z.string().optional()
  })
  .passthrough()
export const esgInputSchema = z.object({
  B1: z.string().optional(),
  B2: z.string().optional()
}).passthrough()

export type EsgInput = z.infer<typeof esgInputSchema>

export function getRawSchema(): unknown {
  return schema
}
