import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { esrsConceptList } from '../esrsTaxonomy'

function loadFile(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf-8')
}

const esrsXsd = loadFile('../taxonomy/esrs/2023-12-22/common/esrs_cor.xsd')
const utrXml = loadFile('../taxonomy/utr.xml')

const elementDeclarations = buildElementMap(esrsXsd)
const unitIds = buildUnitIdSet(utrXml)

describe('ESRS taksonomi reference', () => {
  it('indeholder alle koncepter og de korrekte periodetyper', () => {
    for (const { definition } of esrsConceptList) {
      const localName = definition.qname.split(':')[1] ?? definition.qname
      const declaration = elementDeclarations.get(localName)
      expect(declaration, `Konceptet ${definition.qname} findes ikke i esrs_cor.xsd`).toBeTruthy()

      if (declaration) {
        expect(declaration).toContain(`xbrli:periodType="${definition.periodType}"`)
      }

      expect(unitIds.has(definition.unitId)).toBe(true)
    }
  })
})

function buildElementMap(xml: string): Map<string, string> {
  const map = new Map<string, string>()
  const elementRegex = /<xsd:element\b[^>]*name="([^"]+)"[^>]*>/g
  let match: RegExpExecArray | null
  while ((match = elementRegex.exec(xml)) !== null) {
    const [fullMatch, name] = match
    if (!name || !fullMatch) {
      continue
    }
    map.set(name, fullMatch)
  }
  return map
}

function buildUnitIdSet(xml: string): Set<string> {
  const set = new Set<string>()
  const unitRegex = /<unitId>([^<]+)<\/unitId>/g
  let match: RegExpExecArray | null
  while ((match = unitRegex.exec(xml)) !== null) {
    const [, unitId] = match
    if (unitId) {
      set.add(unitId)
    }
  }
  return set
}

