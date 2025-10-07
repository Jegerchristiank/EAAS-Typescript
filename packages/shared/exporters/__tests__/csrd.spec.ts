import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'

import { buildCsrdReportPackage, buildXbrlInstance } from '../csrd'

const baseOptions = {
  entity: { identifier: '5493001KJTIIGC8Y1R12', scheme: 'urn:lei' },
  period: { start: '2023-01-01', end: '2023-12-31' },
}

describe('CSRD XBRL exporter', () => {
  it('builds an XBRL instance with contexts and units', () => {
    const xml = buildXbrlInstance({
      ...baseOptions,
      metrics: {
        grossScope1Emissions: 1234.56,
        grossScope3Emissions: 9876.54,
      },
    })

    expect(xml).toContain('<xbrli:identifier scheme="urn:lei">5493001KJTIIGC8Y1R12</xbrli:identifier>')
    expect(xml).toContain('<xbrli:startDate>2023-01-01</xbrli:startDate>')
    expect(xml).toContain('<xbrli:endDate>2023-12-31</xbrli:endDate>')
    expect(xml).toContain('<esrs:GrossScope1GreenhouseGasEmissions')
    expect(xml).toContain('<xbrli:unit id="unit_u_tonnesCO2e">')
    expect(xml).toContain('utr:tCO2e')
  })

  it('packages the instance together with a manifest', async () => {
    const { archive } = await buildCsrdReportPackage({
      ...baseOptions,
      metrics: {
        grossScope1Emissions: 120,
      },
      manifest: { generator: 'vitest' },
    })

    const zip = await JSZip.loadAsync(archive)
    const manifestContent = await zip.file('manifest.json')?.async('string')
    const instanceContent = await zip.file('reports/csrd-instance.xbrl')?.async('string')

    expect(manifestContent).toBeDefined()
    const manifest = JSON.parse(manifestContent ?? '{}')
    expect(manifest.entity.identifier).toBe('5493001KJTIIGC8Y1R12')
    expect(manifest.generator).toBe('vitest')
    expect(instanceContent).toContain('<esrs:GrossScope1GreenhouseGasEmissions')
  })
})
