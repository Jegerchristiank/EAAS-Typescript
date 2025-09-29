/**
 * Snapshot-test og enhedstests for modulberegninger.
 */
import { describe, expect, it } from 'vitest'
import type { ModuleInput } from '../../types'
import { createDefaultResult } from '../runModule'
import { runB1 } from '../modules/runB1'
import { runB2 } from '../modules/runB2'
import { runB3 } from '../modules/runB3'
import { runB4 } from '../modules/runB4'
import { runB5 } from '../modules/runB5'
import { runB6 } from '../modules/runB6'
import { runB7 } from '../modules/runB7'
import { runB8 } from '../modules/runB8'
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

describe('runB2', () => {
  it('beregner nettoemission med fradrag for genindvinding og vedvarende andel', () => {
    const input: ModuleInput = {
      B2: {
        heatConsumptionKwh: 80_000,
        recoveredHeatKwh: 5_000,
        emissionFactorKgPerKwh: 0.12,
        renewableSharePercent: 30
      }
    }

    const result = runB2(input)

    expect(result.value).toBe(6.705)
    expect(result.unit).toBe(factors.b2.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('netHeatConsumptionKwh=75000')
  })

  it('håndterer ugyldige værdier og advarer om for højt fradrag', () => {
    const input: ModuleInput = {
      B2: {
        heatConsumptionKwh: 10_000,
        recoveredHeatKwh: 12_500,
        emissionFactorKgPerKwh: -0.1,
        renewableSharePercent: 150
      }
    }

    const result = runB2(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('emissionFactorKgPerKwh=0')
    expect(result.warnings).toEqual([
      'Feltet emissionFactorKgPerKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Andelen af vedvarende energi er begrænset til 100%.',
      'Genindvundet varme overstiger det registrerede forbrug. Nettoforbruget sættes til 0.'
    ])
  })
})

describe('runB3', () => {
  it('beregner nettoemission med fradrag for frikøling og vedvarende andel', () => {
    const input: ModuleInput = {
      B3: {
        coolingConsumptionKwh: 50_000,
        recoveredCoolingKwh: 4_000,
        emissionFactorKgPerKwh: 0.05,
        renewableSharePercent: 20
      }
    }

    const result = runB3(input)

    expect(result.value).toBe(1.886)
    expect(result.unit).toBe(factors.b3.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('netCoolingConsumptionKwh=46000')
  })

  it('håndterer ugyldige værdier og advarer om for højt fradrag', () => {
    const input: ModuleInput = {
      B3: {
        coolingConsumptionKwh: 5_000,
        recoveredCoolingKwh: 7_500,
        emissionFactorKgPerKwh: -0.03,
        renewableSharePercent: 130
      }
    }

    const result = runB3(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('emissionFactorKgPerKwh=0')
    expect(result.warnings).toEqual([
      'Feltet emissionFactorKgPerKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Andelen af vedvarende energi er begrænset til 100%.',
      'Genindvundet køling overstiger det registrerede forbrug. Nettoforbruget sættes til 0.'
    ])
  })
})

describe('runB4', () => {
  it('beregner nettoemission med fradrag for genanvendt damp og vedvarende andel', () => {
    const input: ModuleInput = {
      B4: {
        steamConsumptionKwh: 40_000,
        recoveredSteamKwh: 3_000,
        emissionFactorKgPerKwh: 0.09,
        renewableSharePercent: 25
      }
    }

    const result = runB4(input)

    expect(result.value).toBe(2.622)
    expect(result.unit).toBe(factors.b4.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('netSteamConsumptionKwh=37000')
  })

  it('håndterer ugyldige værdier og advarer om for højt fradrag', () => {
    const input: ModuleInput = {
      B4: {
        steamConsumptionKwh: 1_000,
        recoveredSteamKwh: 1_500,
        emissionFactorKgPerKwh: -0.1,
        renewableSharePercent: 120
      }
    }

    const result = runB4(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('emissionFactorKgPerKwh=0')
    expect(result.warnings).toEqual([
      'Feltet emissionFactorKgPerKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Andelen af vedvarende energi er begrænset til 100%.',
      'Genindvundet damp overstiger det registrerede forbrug. Nettoforbruget sættes til 0.'
    ])
  })
})

describe('runB5', () => {
  it('beregner nettoemission for øvrige energileverancer', () => {
    const input: ModuleInput = {
      B5: {
        otherEnergyConsumptionKwh: 25_000,
        recoveredEnergyKwh: 2_000,
        emissionFactorKgPerKwh: 0.07,
        renewableSharePercent: 35
      }
    }

    const result = runB5(input)

    expect(result.value).toBe(1.159)
    expect(result.unit).toBe(factors.b5.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('netOtherEnergyConsumptionKwh=23000')
  })

  it('håndterer ugyldige værdier og capper vedvarende andel', () => {
    const input: ModuleInput = {
      B5: {
        otherEnergyConsumptionKwh: 1_000,
        recoveredEnergyKwh: 1_500,
        emissionFactorKgPerKwh: -0.2,
        renewableSharePercent: 140
      }
    }

    const result = runB5(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('emissionFactorKgPerKwh=0')
    expect(result.warnings).toEqual([
      'Feltet emissionFactorKgPerKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Andelen af vedvarende energi er begrænset til 100%.',
      'Genindvundet energi overstiger det registrerede forbrug. Nettoforbruget sættes til 0.'
    ])
  })
})

describe('runB6', () => {
  it('beregner emission fra nettab med vedvarende reduktion', () => {
    const input: ModuleInput = {
      B6: {
        electricitySuppliedKwh: 120_000,
        gridLossPercent: 6,
        emissionFactorKgPerKwh: 0.233,
        renewableSharePercent: 30
      }
    }

    const result = runB6(input)

    expect(result.value).toBe(1.225)
    expect(result.unit).toBe(factors.b6.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('lossEnergyKwh=7200')
  })

  it('cappper nettab og vedvarende andel samt håndterer manglende værdier', () => {
    const input: ModuleInput = {
      B6: {
        electricitySuppliedKwh: -100,
        gridLossPercent: 45,
        emissionFactorKgPerKwh: null,
        renewableSharePercent: 130
      }
    }

    const result = runB6(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain(`gridLossPercent=${factors.b6.maximumGridLossPercent}`)
    expect(result.trace).toContain('emissionFactorKgPerKwh=0')
    expect(result.warnings).toEqual([
      'Feltet electricitySuppliedKwh kan ikke være negativt. 0 anvendes i stedet.',
      `Nettab i elnettet er begrænset til ${factors.b6.maximumGridLossPercent}%.`,
      'Feltet emissionFactorKgPerKwh mangler og behandles som 0.',
      'Andelen af vedvarende energi er begrænset til 100%.'
    ])
  })
})

describe('runB7', () => {
  it('beregner revisionsrobust reduktion baseret på dokumenteret vedvarende el', () => {
    const input: ModuleInput = {
      B7: {
        documentedRenewableKwh: 12_000,
        residualEmissionFactorKgPerKwh: 0.233,
        documentationQualityPercent: 90
      }
    }

    const result = runB7(input)

    expect(result.value).toBe(-2.391)
    expect(result.unit).toBe(factors.b7.unit)
    expect(result.trace).toContain('qualityAdjustedKwh=10260')
    expect(result.warnings).toEqual([])
  })

  it('håndterer ugyldig dokumentation og emissionfaktor med passende advarsler', () => {
    const input: ModuleInput = {
      B7: {
        documentedRenewableKwh: -100,
        residualEmissionFactorKgPerKwh: null,
        documentationQualityPercent: 150
      }
    }

    const result = runB7(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('documentationQualityPercent=100')
    expect(result.warnings).toEqual([
      'Feltet documentedRenewableKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet residualEmissionFactorKgPerKwh mangler og behandles som 0.',
      'Dokumentationskvalitet er begrænset til 100%.'
    ])
  })

  it('advarer når dokumentationskvalitet er lav eller nul', () => {
    const input: ModuleInput = {
      B7: {
        documentedRenewableKwh: 5_000,
        residualEmissionFactorKgPerKwh: 0.2,
        documentationQualityPercent: 5
      }
    }

    const result = runB7(input)

    expect(result.value).toBe(-0.048)
    expect(result.trace).toContain('documentationQualityPercent=5')
    expect(result.warnings).toEqual([
      'Dokumentationskvalitet under 10% kan blive udfordret i revision.'
    ])
  })
})

describe('runB8', () => {
  it('beregner reduktion baseret på egenproduceret og selvforbrugt vedvarende el', () => {
    const input: ModuleInput = {
      B8: {
        onSiteRenewableKwh: 15_000,
        exportedRenewableKwh: 2_000,
        residualEmissionFactorKgPerKwh: 0.233,
        documentationQualityPercent: 95
      }
    }

    const result = runB8(input)

    expect(result.value).toBe(-2.59)
    expect(result.unit).toBe(factors.b8.unit)
    expect(result.trace).toContain('netSelfConsumptionKwh=13000')
    expect(result.warnings).toEqual([])
  })

  it('håndterer negative værdier og høj eksport med advarsler', () => {
    const input: ModuleInput = {
      B8: {
        onSiteRenewableKwh: -100,
        exportedRenewableKwh: 500,
        residualEmissionFactorKgPerKwh: null,
        documentationQualityPercent: 5
      }
    }

    const result = runB8(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('exportedRenewableKwh=500')
    expect(result.warnings).toEqual([
      'Feltet onSiteRenewableKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet residualEmissionFactorKgPerKwh mangler og behandles som 0.',
      'Eksporteret vedvarende el overstiger produktionen. Nettoreduktionen sættes til 0.',
      'Dokumentationskvalitet under 15% kan blive udfordret i revision.'
    ])
  })
})
