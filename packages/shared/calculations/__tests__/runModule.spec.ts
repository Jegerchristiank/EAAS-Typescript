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
import { runB9 } from '../modules/runB9'
import { runB10 } from '../modules/runB10'
import { factors } from '../factors'
import { runB11 } from '../modules/runB11'
import { runC1 } from '../modules/runC1'
import { runC2 } from '../modules/runC2'
import { runC3 } from '../modules/runC3'
import { runC4 } from '../modules/runC4'
import { runC5 } from '../modules/runC5'
import { runC6 } from '../modules/runC6'
import { runC7 } from '../modules/runC7'
import { runC8 } from '../modules/runC8'
import { runC9 } from '../modules/runC9'

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

describe('runB9', () => {
  it('beregner reduktion for en PPA-leverance efter nettab og kvalitet', () => {
    const input: ModuleInput = {
      B9: {
        ppaDeliveredKwh: 12_000,
        matchedConsumptionKwh: 11_000,
        gridLossPercent: 3,
        residualEmissionFactorKgPerKwh: 0.233,
        documentationQualityPercent: 90
      }
    }

    const result = runB9(input)

    expect(result.value).toBe(-2.058)
    expect(result.unit).toBe(factors.b9.unit)
    expect(result.trace).toContain('netMatchedKwh=10670')
    expect(result.warnings).toEqual([])
  })

  it('håndterer ugyldige værdier og matcher forbrug med leverance', () => {
    const input: ModuleInput = {
      B9: {
        ppaDeliveredKwh: -500,
        matchedConsumptionKwh: 800,
        gridLossPercent: 40,
        residualEmissionFactorKgPerKwh: null,
        documentationQualityPercent: 10
      }
    }

    const result = runB9(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('gridLossPercent=15')
    expect(result.warnings).toEqual([
      'Feltet ppaDeliveredKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Nettab er begrænset til 15%.',
      'Feltet residualEmissionFactorKgPerKwh mangler og behandles som 0.',
      'Dokumentationskvalitet under 20% kan blive udfordret i revision.',
      'Forbrugsdata overstiger PPA-leverancen. Overskydende mængde ignoreres.'
    ])
  })
})

describe('runB10', () => {
  it('beregner reduktion for en virtuel PPA efter settlement og kvalitet', () => {
    const input: ModuleInput = {
      B10: {
        ppaSettledKwh: 12_000,
        matchedConsumptionKwh: 11_000,
        marketSettlementPercent: 85,
        residualEmissionFactorKgPerKwh: 0.233,
        documentationQualityPercent: 80
      }
    }

    const result = runB10(input)

    expect(result.value).toBe(-1.534)
    expect(result.unit).toBe(factors.b10.unit)
    expect(result.trace).toContain('settlementAdjustedKwh=9350')
    expect(result.warnings).toEqual([])
  })

  it('håndterer ugyldige værdier og settlement med advarsler', () => {
    const input: ModuleInput = {
      B10: {
        ppaSettledKwh: 500,
        matchedConsumptionKwh: 800,
        marketSettlementPercent: -5,
        residualEmissionFactorKgPerKwh: null,
        documentationQualityPercent: 150
      }
    }

    const result = runB10(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('marketSettlementPercent=0')
    expect(result.warnings).toEqual([
      'Finansiel dækning kan ikke være negativ. 0% anvendes.',
      'Feltet residualEmissionFactorKgPerKwh mangler og behandles som 0.',
      'Dokumentationskvalitet er begrænset til 100%.',
      'Forbrugsdata overstiger PPA-leverancen. Overskydende mængde ignoreres.',
      'Finansiel dækning på 0% betyder, at ingen reduktion kan bogføres.'
    ])
  })
})

describe('runB11', () => {
  it('beregner reduktion med timekorrelation og dokumentationsjustering', () => {
    const input: ModuleInput = {
      B11: {
        certificatesRetiredKwh: 12_000,
        matchedConsumptionKwh: 11_000,
        timeCorrelationPercent: 85,
        residualEmissionFactorKgPerKwh: 0.233,
        documentationQualityPercent: 90
      }
    }

    const result = runB11(input)

    expect(result.value).toBe(-1.5)
    expect(result.unit).toBe(factors.b11.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('timeAdjustedKwh=8415')
  })

  it('håndterer ugyldige værdier og giver relevante advarsler', () => {
    const input: ModuleInput = {
      B11: {
        certificatesRetiredKwh: -100,
        matchedConsumptionKwh: 500,
        timeCorrelationPercent: 20,
        residualEmissionFactorKgPerKwh: -0.1,
        documentationQualityPercent: null
      }
    }

    const result = runB11(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('timeCorrelationPercent=20')
    expect(result.warnings).toHaveLength(5)
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        'Feltet certificatesRetiredKwh kan ikke være negativt. 0 anvendes i stedet.',
        'Forbrugsdata overstiger certificeret mængde. Overskydende energi ignoreres.',
        'Timekorrelation under 50% kan blive udfordret i revision.',
        'Feltet residualEmissionFactorKgPerKwh kan ikke være negativt. 0 anvendes i stedet.',
        'Dokumentationskvalitet mangler og behandles som 0%.'
      ])
    )
  })
})

describe('runC1', () => {
  it('beregner pendlingsemissioner med reduktion for fjernarbejde', () => {
    const input: ModuleInput = {
      C1: {
        employeesCovered: 120,
        averageCommuteDistanceKm: 18,
        commutingDaysPerWeek: 3,
        weeksPerYear: 44,
        remoteWorkSharePercent: 25,
        emissionFactorKgPerKm: 0.142
      }
    }

    const result = runC1(input)

    expect(result.value).toBe(30.365)
    expect(result.unit).toBe(factors.c1.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('totalDistanceKm=213840')
  })

  it('håndterer manglende og ugyldige værdier med advarsler', () => {
    const input: ModuleInput = {
      C1: {
        employeesCovered: -5,
        averageCommuteDistanceKm: null,
        commutingDaysPerWeek: 12,
        weeksPerYear: 70,
        remoteWorkSharePercent: 180,
        emissionFactorKgPerKm: -0.3
      }
    }

    const result = runC1(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('weeksPerYear=52')
    expect(result.warnings).toEqual([
      'Feltet employeesCovered kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet averageCommuteDistanceKm mangler og behandles som 0.',
      'Feltet commutingDaysPerWeek er begrænset til 7.',
      'Feltet weeksPerYear er begrænset til 52 uger.',
      'Feltet remoteWorkSharePercent er begrænset til 100%.',
      'Feltet emissionFactorKgPerKm kan ikke være negativt. 0 anvendes i stedet.'
    ])
  })
})

describe('runC2', () => {
  it('beregner emissioner for forretningsrejser med virtuelle reduktioner', () => {
    const input: ModuleInput = {
      C2: {
        airTravelDistanceKm: 12_000,
        airEmissionFactorKgPerKm: 0.158,
        railTravelDistanceKm: 3_000,
        railEmissionFactorKgPerKm: 0.014,
        roadTravelDistanceKm: 8_000,
        roadEmissionFactorKgPerKm: 0.192,
        hotelNights: 220,
        hotelEmissionFactorKgPerNight: 12,
        virtualMeetingSharePercent: 20
      }
    }

    const result = runC2(input)

    expect(result.value).toBe(5.419)
    expect(result.unit).toBe(factors.c2.unit)
    expect(result.warnings).toEqual([])
    const adjustedLine = result.trace.find((line) =>
      line.startsWith('adjustedTravelEmissionsKg=')
    )
    expect(adjustedLine).toBeDefined()
    expect(Number(adjustedLine?.split('=')[1])).toBeCloseTo(2779.2, 6)
  })

  it('håndterer manglende og ugyldige værdier med standardfaktor for hotel', () => {
    const input: ModuleInput = {
      C2: {
        airTravelDistanceKm: -100,
        airEmissionFactorKgPerKm: -0.3,
        railTravelDistanceKm: null,
        railEmissionFactorKgPerKm: null,
        roadTravelDistanceKm: 5_000,
        roadEmissionFactorKgPerKm: 0.2,
        hotelNights: 10,
        hotelEmissionFactorKgPerNight: null,
        virtualMeetingSharePercent: 160
      }
    }

    const result = runC2(input)

    expect(result.value).toBe(0.15)
    expect(result.trace).toContain('virtualReductionRatio=1')
    expect(result.warnings).toEqual([
      'Feltet airTravelDistanceKm kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet airEmissionFactorKgPerKm kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet railTravelDistanceKm mangler og behandles som 0.',
      'Feltet railEmissionFactorKgPerKm mangler og behandles som 0.',
      'Feltet hotelEmissionFactorKgPerNight mangler. Standardfaktoren 15 anvendes.',
      'Feltet virtualMeetingSharePercent er begrænset til 100%.'
    ])
  })
})

describe('runC3', () => {
  it('beregner upstream emissioner med nettab og vedvarende reduktion', () => {
    const input: ModuleInput = {
      C3: {
        purchasedElectricityKwh: 120_000,
        electricityUpstreamEmissionFactorKgPerKwh: 0.05,
        transmissionLossPercent: 8,
        renewableSharePercent: 35,
        fuelConsumptionKwh: 40_000,
        fuelUpstreamEmissionFactorKgPerKwh: 0.07
      }
    }

    const result = runC3(input)

    expect(result.value).toBe(7.466)
    expect(result.unit).toBe(factors.c3.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('lossMultiplier=1.08')
    expect(result.trace).toContain('renewableMitigationMultiplier=0.72')
  })

  it('håndterer ugyldige værdier og begrænser procenter', () => {
    const input: ModuleInput = {
      C3: {
        purchasedElectricityKwh: -20_000,
        electricityUpstreamEmissionFactorKgPerKwh: null,
        transmissionLossPercent: 50,
        renewableSharePercent: 180,
        fuelConsumptionKwh: -1_500,
        fuelUpstreamEmissionFactorKgPerKwh: -0.2
      }
    }

    const result = runC3(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('transmissionLossPercent=20')
    expect(result.warnings).toEqual([
      'Feltet purchasedElectricityKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet electricityUpstreamEmissionFactorKgPerKwh mangler og behandles som 0.',
      'Feltet transmissionLossPercent er begrænset til 20%.',
      'Feltet renewableSharePercent er begrænset til 100%.',
      'Feltet fuelConsumptionKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet fuelUpstreamEmissionFactorKgPerKwh kan ikke være negativt. 0 anvendes i stedet.'
    ])
  })
})

describe('runC4', () => {
  it('beregner transportemissioner med dokumenterede afbødninger', () => {
    const input: ModuleInput = {
      C4: {
        roadTonnesKm: 5_000,
        roadEmissionFactorKgPerTonneKm: 0.12,
        railTonnesKm: 2_000,
        railEmissionFactorKgPerTonneKm: 0.03,
        seaTonnesKm: 8_000,
        seaEmissionFactorKgPerTonneKm: 0.015,
        airTonnesKm: 500,
        airEmissionFactorKgPerTonneKm: 0.55,
        consolidationEfficiencyPercent: 20,
        lowCarbonSharePercent: 15
      }
    }

    const result = runC4(input)

    expect(result.value).toBe(0.81)
    expect(result.unit).toBe(factors.c4.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('totalModalEmissionsKg=1055')
    expect(result.trace).toContain('mitigationMultiplier=0.767500')
  })

  it('håndterer ugyldige værdier og begrænser procenter', () => {
    const input: ModuleInput = {
      C4: {
        roadTonnesKm: -100,
        roadEmissionFactorKgPerTonneKm: null,
        railTonnesKm: null,
        railEmissionFactorKgPerTonneKm: -0.02,
        seaTonnesKm: -50,
        seaEmissionFactorKgPerTonneKm: null,
        airTonnesKm: null,
        airEmissionFactorKgPerTonneKm: -0.5,
        consolidationEfficiencyPercent: 80,
        lowCarbonSharePercent: 140
      }
    }

    const result = runC4(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('consolidationMitigationRatio=0.300000')
    expect(result.warnings).toEqual([
      'Feltet roadTonnesKm kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet roadEmissionFactorKgPerTonneKm mangler og behandles som 0.',
      'Feltet railTonnesKm mangler og behandles som 0.',
      'Feltet railEmissionFactorKgPerTonneKm kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet seaTonnesKm kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet seaEmissionFactorKgPerTonneKm mangler og behandles som 0.',
      'Feltet airTonnesKm mangler og behandles som 0.',
      'Feltet airEmissionFactorKgPerTonneKm kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet consolidationEfficiencyPercent er begrænset til 50%.',
      'Feltet lowCarbonSharePercent er begrænset til 100%.'
    ])
  })
})

describe('runC5', () => {
  it('beregner emissioner for affaldshåndtering med genanvendelses- og genbrugskreditter', () => {
    const input: ModuleInput = {
      C5: {
        landfillWasteTonnes: 120,
        landfillEmissionFactorKgPerTonne: 480,
        incinerationWasteTonnes: 80,
        incinerationEmissionFactorKgPerTonne: 320,
        recyclingWasteTonnes: 60,
        recyclingEmissionFactorKgPerTonne: 50,
        compostingWasteTonnes: 40,
        compostingEmissionFactorKgPerTonne: 100,
        recyclingRecoveryPercent: 70,
        reuseSharePercent: 30
      }
    }

    const result = runC5(input)

    expect(result.value).toBe(24.354)
    expect(result.unit).toBe(factors.c5.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('grossEmissionsKg=90200')
    expect(result.trace).toContain('mitigationMultiplier=0.270000')
  })

  it('normaliserer negative og manglende værdier og begrænser procenter', () => {
    const input: ModuleInput = {
      C5: {
        landfillWasteTonnes: -5,
        landfillEmissionFactorKgPerTonne: null,
        incinerationWasteTonnes: 10,
        incinerationEmissionFactorKgPerTonne: -25,
        recyclingWasteTonnes: null,
        recyclingEmissionFactorKgPerTonne: 40,
        compostingWasteTonnes: 2,
        compostingEmissionFactorKgPerTonne: -15,
        recyclingRecoveryPercent: 120,
        reuseSharePercent: -10
      }
    }

    const result = runC5(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('landfillEmissionFactorKgPerTonne=0')
    expect(result.trace).toContain('recyclingRecoveryPercent=90')
    expect(result.warnings).toEqual([
      'Feltet landfillWasteTonnes kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet landfillEmissionFactorKgPerTonne mangler og behandles som 0.',
      'Feltet incinerationEmissionFactorKgPerTonne kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet compostingEmissionFactorKgPerTonne kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet recyclingWasteTonnes mangler og behandles som 0.',
      'Feltet recyclingRecoveryPercent er begrænset til 90%.',
      'Feltet reuseSharePercent kan ikke være negativt. 0% anvendes i stedet.'
    ])
  })
})

describe('runC6', () => {
  it('beregner emissioner for udlejede aktiver med fordeling og vedvarende reduktioner', () => {
    const input: ModuleInput = {
      C6: {
        leasedFloorAreaSqm: 3200,
        electricityIntensityKwhPerSqm: 90,
        heatIntensityKwhPerSqm: 70,
        occupancySharePercent: 75,
        sharedServicesAllocationPercent: 10,
        electricityEmissionFactorKgPerKwh: 0.25,
        heatEmissionFactorKgPerKwh: 0.18,
        renewableElectricitySharePercent: 40,
        renewableHeatSharePercent: 20
      }
    }

    const result = runC6(input)

    expect(result.value).toBe(57.97)
    expect(result.unit).toBe(factors.c6.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('effectiveAllocationRatio=0.675000')
    expect(result.trace).toContain('electricityEmissionsKg=34020')
  })

  it('normaliserer negative og manglende værdier og begrænser procenter', () => {
    const input: ModuleInput = {
      C6: {
        leasedFloorAreaSqm: -100,
        electricityIntensityKwhPerSqm: 80,
        heatIntensityKwhPerSqm: null,
        occupancySharePercent: 140,
        sharedServicesAllocationPercent: -5,
        electricityEmissionFactorKgPerKwh: null,
        heatEmissionFactorKgPerKwh: -0.2,
        renewableElectricitySharePercent: 250,
        renewableHeatSharePercent: -10
      }
    }

    const result = runC6(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('leasedFloorAreaSqm=0')
    expect(result.trace).toContain('renewableElectricitySharePercent=100')
    expect(result.warnings).toEqual([
      'Feltet leasedFloorAreaSqm kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet heatIntensityKwhPerSqm mangler og behandles som 0.',
      'Feltet occupancySharePercent er begrænset til 100%.',
      'Feltet sharedServicesAllocationPercent kan ikke være negativt. 0% anvendes i stedet.',
      'Feltet electricityEmissionFactorKgPerKwh mangler og behandles som 0.',
      'Feltet heatEmissionFactorKgPerKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet renewableElectricitySharePercent er begrænset til 100%.',
      'Feltet renewableHeatSharePercent kan ikke være negativt. 0% anvendes i stedet.'
    ])
  })
})

describe('runC7', () => {
  it('beregner emissioner for downstream transport og lagre med reduktioner', () => {
    const input: ModuleInput = {
      C7: {
        roadTonnesKm: 15000,
        roadEmissionFactorKgPerTonneKm: 0.12,
        railTonnesKm: 5000,
        railEmissionFactorKgPerTonneKm: 0.03,
        seaTonnesKm: 0,
        seaEmissionFactorKgPerTonneKm: 0.015,
        airTonnesKm: 300,
        airEmissionFactorKgPerTonneKm: 0.45,
        warehousingEnergyKwh: 200000,
        warehousingEmissionFactorKgPerKwh: 0.07,
        lowEmissionVehicleSharePercent: 40,
        renewableWarehousingSharePercent: 60
      }
    }

    const result = runC7(input)

    expect(result.value).toBe(8.441)
    expect(result.unit).toBe(factors.c7.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('roadMitigationRatio=0.280000')
    expect(result.trace).toContain('renewableWarehousingMitigationRatio=0.510000')
  })

  it('normaliserer negative og manglende værdier og begrænser procenter', () => {
    const input: ModuleInput = {
      C7: {
        roadTonnesKm: -10,
        roadEmissionFactorKgPerTonneKm: null,
        railTonnesKm: null,
        railEmissionFactorKgPerTonneKm: -0.05,
        seaTonnesKm: 200,
        seaEmissionFactorKgPerTonneKm: null,
        airTonnesKm: null,
        airEmissionFactorKgPerTonneKm: 0.6,
        warehousingEnergyKwh: null,
        warehousingEmissionFactorKgPerKwh: -0.1,
        lowEmissionVehicleSharePercent: 180,
        renewableWarehousingSharePercent: -5
      }
    }

    const result = runC7(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('roadTonnesKm=0')
    expect(result.trace).toContain('lowEmissionVehicleSharePercent=100')
    expect(result.trace).toContain('renewableWarehousingSharePercent=0')
    expect(result.warnings).toEqual([
      'Feltet roadTonnesKm kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet roadEmissionFactorKgPerTonneKm mangler og behandles som 0.',
      'Feltet railTonnesKm mangler og behandles som 0.',
      'Feltet railEmissionFactorKgPerTonneKm kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet seaEmissionFactorKgPerTonneKm mangler og behandles som 0.',
      'Feltet airTonnesKm mangler og behandles som 0.',
      'Feltet warehousingEnergyKwh mangler og behandles som 0.',
      'Feltet warehousingEmissionFactorKgPerKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet lowEmissionVehicleSharePercent er begrænset til 100%.',
      'Feltet renewableWarehousingSharePercent kan ikke være negativt. 0% anvendes i stedet.'
    ])
  })
})

describe('runC8', () => {
  it('beregner emissioner for downstream udlejede aktiver med effektivisering og vedvarende energi', () => {
    const input: ModuleInput = {
      C8: {
        leasedFloorAreaSqm: 5000,
        electricityIntensityKwhPerSqm: 85,
        heatIntensityKwhPerSqm: 40,
        occupancySharePercent: 90,
        landlordEnergySharePercent: 75,
        energyEfficiencyImprovementPercent: 15,
        electricityEmissionFactorKgPerKwh: 0.18,
        heatEmissionFactorKgPerKwh: 0.075,
        renewableElectricitySharePercent: 60,
        renewableHeatSharePercent: 30
      }
    }

    const result = runC8(input)

    expect(result.value).toBe(28.411)
    expect(result.unit).toBe(factors.c8.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('efficiencyMitigation=0.135000')
    expect(result.trace).toContain('renewableElectricityMitigation=0.510000')
  })

  it('normaliserer negative, manglende og overdrevne værdier', () => {
    const input: ModuleInput = {
      C8: {
        leasedFloorAreaSqm: -100,
        electricityIntensityKwhPerSqm: null,
        heatIntensityKwhPerSqm: -10,
        occupancySharePercent: null,
        landlordEnergySharePercent: 140,
        energyEfficiencyImprovementPercent: 120,
        electricityEmissionFactorKgPerKwh: -0.1,
        heatEmissionFactorKgPerKwh: null,
        renewableElectricitySharePercent: -5,
        renewableHeatSharePercent: 250
      }
    }

    const result = runC8(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('leasedFloorAreaSqm=0')
    expect(result.trace).toContain('occupancySharePercent=100')
    expect(result.trace).toContain('landlordEnergySharePercent=100')
    expect(result.trace).toContain('energyEfficiencyImprovementPercent=70')
    expect(result.trace).toContain('renewableElectricitySharePercent=0')
    expect(result.trace).toContain('renewableHeatSharePercent=100')
    expect(result.warnings).toEqual([
      'Feltet leasedFloorAreaSqm kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet electricityIntensityKwhPerSqm mangler og behandles som 0.',
      'Feltet heatIntensityKwhPerSqm kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet occupancySharePercent mangler. Antager 100%.',
      'Feltet landlordEnergySharePercent er begrænset til 100%.',
      'Feltet energyEfficiencyImprovementPercent er begrænset til 70%.',
      'Feltet electricityEmissionFactorKgPerKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet heatEmissionFactorKgPerKwh mangler og behandles som 0.',
      'Feltet renewableElectricitySharePercent kan ikke være negativt. 0% anvendes i stedet.',
      'Feltet renewableHeatSharePercent er begrænset til 100%.'
    ])
  })
})

describe('runC9', () => {
  it('beregner emissioner med effektivisering, sekundært materiale og vedvarende energi', () => {
    const input: ModuleInput = {
      C9: {
        processedOutputTonnes: 1_200,
        processingEnergyIntensityKwhPerTonne: 500,
        processingEmissionFactorKgPerKwh: 0.2,
        processEfficiencyImprovementPercent: 30,
        secondaryMaterialSharePercent: 50,
        renewableEnergySharePercent: 40
      }
    }

    const result = runC9(input)

    expect(result.value).toBe(40.051)
    expect(result.unit).toBe(factors.c9.unit)
    expect(result.warnings).toEqual([])
    expect(result.trace).toContain('energyAfterSecondary=312900')
  })

  it('normaliserer ugyldige værdier og udsender advarsler', () => {
    const input: ModuleInput = {
      C9: {
        processedOutputTonnes: -5,
        processingEnergyIntensityKwhPerTonne: null,
        processingEmissionFactorKgPerKwh: -0.4,
        processEfficiencyImprovementPercent: 90,
        secondaryMaterialSharePercent: 120,
        renewableEnergySharePercent: null
      }
    }

    const result = runC9(input)

    expect(result.value).toBe(0)
    expect(result.trace).toContain('processedOutputTonnes=0')
    expect(result.warnings).toEqual([
      'Feltet processedOutputTonnes kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet processingEnergyIntensityKwhPerTonne mangler og behandles som 0.',
      'Feltet processingEmissionFactorKgPerKwh kan ikke være negativt. 0 anvendes i stedet.',
      'Feltet processEfficiencyImprovementPercent er begrænset til 60%.',
      'Feltet secondaryMaterialSharePercent er begrænset til 80%.',
      'Feltet renewableEnergySharePercent mangler og behandles som 0%.'
    ])
  })
})
