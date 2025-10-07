import { describe, expect, it } from 'vitest'

import { buildCsrdReportPackage } from '../csrd'
import type { CalculatedModuleResult, ModuleId } from '../../types'

const baseResult = (moduleId: ModuleId, value: number, unit: string): CalculatedModuleResult => ({
  moduleId,
  title: moduleId,
  result: {
    value,
    unit,
    assumptions: [],
    trace: [],
    warnings: []
  }
})

describe('buildCsrdReportPackage', () => {
  it('aggregerer scopes og konstruerer en XBRL-instans med kontekst', () => {
    const results: CalculatedModuleResult[] = [
      baseResult('A1', 12.5, 't CO2e'),
      baseResult('A2', 7.25, 't CO2e'),
      baseResult('B1', 30.4, 't CO2e'),
      baseResult('B6', 4.6, 't CO2e'),
      baseResult('B7', -5.1, 't CO2e'),
      baseResult('C1', 3.2, 't CO2e'),
      baseResult('C5', 1.1, 't CO2e'),
      baseResult('D1', 75, 'governance score')
    ]

    const pkg = buildCsrdReportPackage({
      results,
      reportingPeriod: { start: '2024-01-01', end: '2024-12-31' },
      entity: {
        scheme: 'http://standards.iso.org/iso/17442',
        value: '5493001KJTIIGC8Y1R12'
      }
    })

    const scope1Fact = pkg.facts.find((fact) => fact.concept.endsWith('GrossScope1GreenhouseGasEmissions'))
    const scope2MarketFact = pkg.facts.find((fact) => fact.concept.endsWith('GrossMarketBasedScope2GreenhouseGasEmissions'))
    const totalMarketFact = pkg.facts.find((fact) => fact.concept.endsWith('MarketBasedGreenhouseGasEmissions'))

    expect(scope1Fact?.value).toBe('19.75')
    expect(scope2MarketFact?.value).toBe('29.9')
    expect(totalMarketFact?.value).toBe('53.95')

    expect(pkg.contexts).toHaveLength(1)
    expect(pkg.contexts[0]).toEqual({
      id: 'ctx_reporting_period',
      entity: {
        scheme: 'http://standards.iso.org/iso/17442',
        value: '5493001KJTIIGC8Y1R12'
      },
      period: { start: '2024-01-01', end: '2024-12-31' }
    })

    expect(pkg.units).toEqual([
      {
        id: 'unit_tCO2e',
        measures: ['utr:tCO2e']
      }
    ])

    expect(pkg.instance).toContain('<xbrli:startDate>2024-01-01</xbrli:startDate>')
    expect(pkg.instance).toContain('<xbrli:endDate>2024-12-31</xbrli:endDate>')
    expect(pkg.instance).toContain('<xbrli:identifier scheme="http://standards.iso.org/iso/17442">5493001KJTIIGC8Y1R12</xbrli:identifier>')
    expect(pkg.instance).toContain('<esrs:GrossScope1GreenhouseGasEmissions contextRef="ctx_reporting_period" unitRef="unit_tCO2e" decimals="3">19.75</esrs:GrossScope1GreenhouseGasEmissions>')
  })
})

