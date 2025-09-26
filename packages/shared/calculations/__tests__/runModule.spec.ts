/**
 * Snapshot-test og enhedstests for modulberegninger.
 */
import { describe, expect, it } from 'vitest'
import type { ModuleInput } from '../../types'
import { createDefaultResult } from '../runModule'
import { runB1 } from '../modules/runB1'
import { factors } from '../factors'

describe('createDefaultResult', () => {
  it('returnerer forventet basisstruktur for andre moduler', () => {
    const result = createDefaultResult('B2', { B2: 42 } as ModuleInput)
    expect(result).toMatchSnapshot()
  })
})

describe('runB1', () => {
  it('beregner nettoemission med vedvarende reduktion', () => {
    const input: ModuleInput = {
      B1: {
        electricityConsumptionKwh: 120_000,
        emissionFactorKgPerKwh: 0.233,
        renewableSharePercent: 40
      }
    }

    const result = runB1(input)

    expect(result.value).toBe(17.894)
    expect(result.unit).toBe(factors.b1.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('renewableReductionKg=10065.6')
  })

  it('håndterer negative og manglende værdier med advarsler', () => {
    const input: ModuleInput = {
      B1: {
        electricityConsumptionKwh: -10,
        emissionFactorKgPerKwh: null,
        renewableSharePercent: 140
      }
    }

    const result = runB1(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('renewableSharePercent=100')
    expect(result.warnings).toEqual([
      'Feltet electricityConsumptionKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet emissionFactorKgPerKwh mangler og behandles som 0.',
      'Andelen af vedvarende energi er begrænset til 100%.'
    ])
  })
})
