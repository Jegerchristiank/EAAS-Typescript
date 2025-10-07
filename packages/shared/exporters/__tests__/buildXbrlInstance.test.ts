import { XMLParser } from 'fast-xml-parser'
import { describe, expect, it, vi } from 'vitest'

import {
  buildSubmissionPayload,
  buildXbrlInstance,
  type ReportPackageOptions,
} from '../csrd'
import * as taxonomy from '../esrsTaxonomy'
import type { CalculatedModuleResult, ModuleResult } from '../../types'

function makeResult(
  moduleId: Parameters<typeof taxonomy.getConceptForModule>[0],
  overrides: Partial<ModuleResult> = {},
): CalculatedModuleResult {
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

const baseOptions: ReportPackageOptions = {
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
}

describe('buildXbrlInstance', () => {
  it('serialises module results as ESRS facts with taxonomy validation', () => {
    const results: CalculatedModuleResult[] = [
      makeResult('C1', { value: 1200, unit: 't CO2e' }),
      makeResult('S1', { value: 87.5, unit: 'social score' }),
    ]

    const instance = buildXbrlInstance(results, baseOptions)
    const parser = new XMLParser({ ignoreAttributes: false })
    const parsed = parser.parse(instance)

    const xbrl = parsed['xbrli:xbrl']
    expect(xbrl).toBeDefined()

    const schemaRef = xbrl['link:schemaRef']
    expect(schemaRef).toBeDefined()
    expect(schemaRef['@_xlink:href']).toContain('esrs')

    const contexts = ensureArray(xbrl['xbrli:context'])
    expect(contexts.length).toBeGreaterThanOrEqual(1)

    const units = ensureArray(xbrl['xbrli:unit'])
    expect(units.length).toBeGreaterThanOrEqual(1)

    for (const concept of taxonomy.listConcepts()) {
      const factNode = xbrl[concept.concept]
      if (!factNode) continue
      const facts = ensureArray(factNode)
      for (const fact of facts) {
        expect(fact['@_contextRef']).toBeDefined()
        expect(fact['@_unitRef']).toBeDefined()
        expect(fact['@_decimals']).toBeDefined()
        const numericValue = Number.parseFloat(String(fact['#text']))
        expect(Number.isNaN(numericValue)).toBe(false)
      }
    }

    const scope1Concept = taxonomy.getConceptForModule('C1')
    expect(scope1Concept).toBeDefined()
    const scope1Facts = ensureArray(xbrl[scope1Concept!.concept])
    expect(String(scope1Facts[0]['#text'])).toBe('1200')
    expect(scope1Facts[0]['@_unitRef']).toMatch(/^u_/)
    expect(scope1Facts[0]['@_contextRef']).toBe('CurrentReportingPeriod')
  })

  it('is included in submission payloads when requested', () => {
    const payload = buildSubmissionPayload(
      [makeResult('A1', { value: 15 })],
      { ...baseOptions, includeXbrl: true },
    )

    expect(payload.xbrl).toBeDefined()
    expect(payload.xbrl).toContain('<xbrli:xbrl')
  })

  it('throws when taxonomy mapping is missing', () => {
    const spy = vi
      .spyOn(taxonomy, 'getConceptForModule')
      .mockReturnValueOnce(undefined as never)

    expect(() => buildXbrlInstance([makeResult('A1')], baseOptions)).toThrow(
      /No ESRS concept mapping found/,
    )

    spy.mockRestore()
  })
})

function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

