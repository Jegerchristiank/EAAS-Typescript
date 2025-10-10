import { describe, expect, it } from 'vitest'

import { buildCsrdReportPackage } from '../csrd'
import type { CalculatedModuleResult, ModuleId, ModuleResult } from '../../types'

const baseResult = (
  moduleId: ModuleId,
  value: number,
  unit: string,
  extra?: Partial<ModuleResult>
): CalculatedModuleResult => ({
  moduleId,
  title: moduleId,
  result: {
    value,
    unit,
    assumptions: [],
    trace: [],
    warnings: [],
    ...extra
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
      baseResult('D1', 75, 'governance score'),
      baseResult('E1Targets', 2, 'mål', {
        esrsFacts: [
          {
            conceptKey: 'E1TargetsPresent',
            value: true,
          },
          {
            conceptKey: 'E1TargetsNarrative',
            value: 'Scope 1 reduktion – mål 45 t i 2027',
          },
        ],
        esrsTables: [
          {
            conceptKey: 'E1TargetsTable',
            rows: [
              {
                scope: 'scope1',
                name: 'Scope 1 reduktion',
                baselineYear: 2022,
                baselineValueTonnes: 70,
                targetYear: 2027,
                targetValueTonnes: 45,
                status: 'lagging',
                owner: 'Operations',
              },
            ],
          },
        ],
      }),
      baseResult('S1', 62, 'social score', {
        esrsFacts: [
          { conceptKey: 'S1TotalHeadcount', value: 125, unitId: 'pure', decimals: 0 },
          { conceptKey: 'S1DataCoveragePercent', value: 90, unitId: 'percent', decimals: 1 }
        ],
        esrsTables: [
          {
            conceptKey: 'S1HeadcountBreakdownTable',
            rows: [
              { segment: 'HQ', headcount: 50, femalePercent: 48 },
              { segment: 'Production', headcount: 75, femalePercent: 35 }
            ]
          }
        ]
      })
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

    const headcountFact = pkg.facts.find((fact) => fact.concept.endsWith('S1TotalEmployees'))
    expect(headcountFact?.value).toBe('125')
    expect(headcountFact?.contextRef).toBe('ctx_reporting_period_instant')
    const coverageFact = pkg.facts.find((fact) => fact.concept.endsWith('S1DataCoveragePercent'))
    expect(coverageFact?.value).toBe('90')
    expect(coverageFact?.decimals).toBe('1')
    const tableFact = pkg.facts.find((fact) => fact.concept.endsWith('S1HeadcountBreakdownTable'))
    expect(tableFact?.value).toContain('"segment":"HQ"')

    const targetsFlagFact = pkg.facts.find((fact) =>
      fact.concept.endsWith(
        'GHGEmissionsReductionTargetsAndOrAnyOtherTargetsHaveBeenSetToManageMaterialClimaterelatedImpactsRisksAndOpportunities',
      ),
    )
    expect(targetsFlagFact?.value).toBe('true')
    expect(targetsFlagFact?.contextRef).toBe('ctx_reporting_period')

    const targetsNarrativeFact = pkg.facts.find((fact) =>
      fact.concept.endsWith(
        'DisclosureOfHowGHGEmissionsReductionTargetsAndOrAnyOtherTargetsHaveBeenSetToManageMaterialClimaterelatedImpactsRisksAndOpportunitiesExplanatory',
      ),
    )
    expect(targetsNarrativeFact?.value).toContain('Scope 1 reduktion')

    const targetsTableFact = pkg.facts.find((fact) =>
      fact.concept.endsWith('TargetsRelatedToClimateChangeMitigationAndAdaptationGHGEmissionsReductionTargetsTable'),
    )
    expect(targetsTableFact?.value).toContain('"scope":"scope1"')

    expect(pkg.contexts).toEqual(
      expect.arrayContaining([
        {
          id: 'ctx_reporting_period',
          entity: {
            scheme: 'http://standards.iso.org/iso/17442',
            value: '5493001KJTIIGC8Y1R12'
          },
          period: {
            type: 'duration',
            start: '2024-01-01',
            end: '2024-12-31'
          }
        },
        {
          id: 'ctx_reporting_period_instant',
          entity: {
            scheme: 'http://standards.iso.org/iso/17442',
            value: '5493001KJTIIGC8Y1R12'
          },
          period: {
            type: 'instant',
            instant: '2024-12-31'
          }
        }
      ])
    )

    expect(pkg.units).toEqual(
      expect.arrayContaining([
        {
          id: 'unit_tCO2e',
          measures: ['utr:tCO2e']
        },
        {
          id: 'unit_percent',
          measures: ['utr:percent']
        },
        {
          id: 'unit_pure',
          measures: ['xbrli:pure']
        }
      ])
    )

    expect(pkg.instance).toContain('<xbrli:startDate>2024-01-01</xbrli:startDate>')
    expect(pkg.instance).toContain('<xbrli:endDate>2024-12-31</xbrli:endDate>')
    expect(pkg.instance).toContain('<xbrli:instant>2024-12-31</xbrli:instant>')
    expect(pkg.instance).toContain('<xbrli:identifier scheme="http://standards.iso.org/iso/17442">5493001KJTIIGC8Y1R12</xbrli:identifier>')
    expect(pkg.instance).toContain('<esrs:GrossScope1GreenhouseGasEmissions contextRef="ctx_reporting_period" unitRef="unit_tCO2e" decimals="3">19.75</esrs:GrossScope1GreenhouseGasEmissions>')
    expect(pkg.instance).toContain('<esrs:S1TotalEmployees contextRef="ctx_reporting_period_instant" unitRef="unit_pure" decimals="0">125</esrs:S1TotalEmployees>')
    expect(pkg.instance).toContain(
      '<esrs:GHGEmissionsReductionTargetsAndOrAnyOtherTargetsHaveBeenSetToManageMaterialClimaterelatedImpactsRisksAndOpportunities contextRef="ctx_reporting_period">true</esrs:GHGEmissionsReductionTargetsAndOrAnyOtherTargetsHaveBeenSetToManageMaterialClimaterelatedImpactsRisksAndOpportunities>',
    )
  })
})

