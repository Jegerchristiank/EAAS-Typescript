import { XMLParser } from 'fast-xml-parser'
import { describe, expect, it } from 'vitest'

import { buildCsrdReportPackage, buildSubmissionPayload, buildXbrlInstance } from '../csrd'
import { esrsEmissionConceptList } from '../esrsTaxonomy'
import type { CalculatedModuleResult, ModuleId, ModuleResult } from '../../types'

function makeResult(moduleId: ModuleId, overrides: Partial<ModuleResult> = {}): CalculatedModuleResult {
  const baseResult: ModuleResult = {
    value: 42,
    unit: 'point',
    assumptions: [],
    trace: [],
    warnings: [],
    ...overrides,
  }

  return {
    moduleId,
    title: `${moduleId} metric`,
    result: baseResult,
  }
}

const baseOptions = {
  profileId: 'test-profile',
  organisation: 'Example Industries',
  reportingPeriod: {
    start: '2023-01-01',
    end: '2023-12-31',
  },
  entityIdentifier: {
    scheme: 'urn:lei',
    value: '5493001KJTIIGC8Y1R12',
  },
} as const

describe('buildXbrlInstance', () => {
  it('serialises module results as ESRS facts with taxonomy validation', () => {
    const results: CalculatedModuleResult[] = [
      makeResult('A1', { value: 1200, unit: 't CO2e' }),
      makeResult('C1', { value: 87.5, unit: 't CO2e' }),
      makeResult('S1', { value: 42, unit: 'social score' }),
    ]

    const instance = buildXbrlInstance(results, baseOptions)
    const parser = new XMLParser({ ignoreAttributes: false })
    const parsed = parser.parse(instance)

    const xbrl = parsed['xbrli:xbrl']
    expect(xbrl).toBeDefined()

    const contexts = ensureArray(xbrl['xbrli:context'])
    expect(contexts.length).toBeGreaterThanOrEqual(1)

    const units = ensureArray(xbrl['xbrli:unit'])
    expect(units.length).toBeGreaterThanOrEqual(1)

    const csrdPackage = buildCsrdReportPackage(results, baseOptions)
    expect(csrdPackage.facts).toHaveLength(esrsEmissionConceptList.length)

    for (const fact of csrdPackage.facts) {
      expect(fact.contextRef).toBe('ctx_reporting_period')
      expect(fact.decimals).toBe('3')

      const factNode = xbrl[fact.concept]
      expect(factNode).toBeDefined()
      const nodes = ensureArray(factNode)
      const firstNode = nodes[0]
      expect(firstNode['@_contextRef']).toBe('ctx_reporting_period')
      expect(firstNode['@_decimals']).toBe('3')
      const numericValue = Number.parseFloat(String(firstNode['#text']))
      expect(Number.isNaN(numericValue)).toBe(false)
    }

    expect(csrdPackage.instance).toBe(instance)

    const scope1Fact = ensureArray(xbrl['esrs:GrossScope1GreenhouseGasEmissions'])
    expect(String(scope1Fact[0]['#text'])).toBe('1200')
    expect(scope1Fact[0]['@_contextRef']).toBe('ctx_reporting_period')

    const scope3Fact = ensureArray(xbrl['esrs:GrossScope3GreenhouseGasEmissions'])
    expect(String(scope3Fact[0]['#text'])).toBe('87.5')
  })

  it('generates instant contexts for stock metrics', () => {
    const results: CalculatedModuleResult[] = [
      makeResult('S1', {
        unit: 'social score',
        esrsFacts: [{ conceptKey: 'S1TotalHeadcount', value: 180, unitId: 'pure', decimals: 0 }],
        esrsTables: [
          {
            conceptKey: 'S1HeadcountBreakdownTable',
            rows: [{ segment: 'HQ', headcount: 180 }],
          },
        ],
      }),
    ]

    const pkg = buildCsrdReportPackage(results, baseOptions)
    const instantContext = pkg.contexts.find((ctx) => ctx.id === 'ctx_reporting_period_instant')
    expect(instantContext).toEqual({
      id: 'ctx_reporting_period_instant',
      entity: baseOptions.entityIdentifier,
      period: { type: 'instant', instant: '2023-12-31' },
    })

    const headcountFact = pkg.facts.find((fact) => fact.concept === 'esrs:S1TotalEmployees')
    expect(headcountFact?.contextRef).toBe('ctx_reporting_period_instant')

    const parser = new XMLParser({ ignoreAttributes: false })
    const parsed = parser.parse(pkg.instance)
    const contexts = ensureArray(parsed['xbrli:xbrl']['xbrli:context'])
    const instantNode = contexts.find((node) => node['@_id'] === 'ctx_reporting_period_instant')
    expect(instantNode?.['xbrli:period']['xbrli:instant']).toBe('2023-12-31')
  })

  it('is included in submission payloads when requested', () => {
    const payload = buildSubmissionPayload(
      [makeResult('A1', { value: 15, unit: 't CO2e' })],
      { ...baseOptions, includeXbrl: true },
    )

    expect(payload.xbrl).toBeDefined()
    expect(payload.xbrl).toContain('<xbrli:xbrl')
    expect(payload.csrd.instance).toBe(payload.xbrl)
    expect(payload.generatedAt).toMatch(/\d{4}-\d{2}-\d{2}T/)
  })
})

function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

