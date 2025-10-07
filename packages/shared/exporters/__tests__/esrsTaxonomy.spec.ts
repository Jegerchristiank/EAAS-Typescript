import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  ESRS_NAMESPACE,
  UTR_NAMESPACE,
  esrsConcepts,
  esrsUnits,
} from '../esrsTaxonomy'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const taxonomyRoot = join(__dirname, '..', 'taxonomy')

const conceptSchemaPath = join(taxonomyRoot, 'common', 'esrs_cor.xsd')
const unitsFormulaPath = join(taxonomyRoot, 'all', 'formula', 'for_esrs_validation_units.xml')

describe('ESRS taxonomy alignment', () => {
  it('contains all referenced concept QNames in the official schema', async () => {
    const schemaContent = await readFile(conceptSchemaPath, 'utf8')

    for (const concept of Object.values(esrsConcepts)) {
      const [, localName] = concept.qname.split(':')
      expect(localName).toBeDefined()
      expect(schemaContent).toContain(`name="${localName}`)
    }
  })

  it('uses unit measures that are explicitly validated by the official taxonomy', async () => {
    const unitsFormulaContent = await readFile(unitsFormulaPath, 'utf8')

    for (const unit of Object.values(esrsUnits)) {
      const { namespace, name } = unit.measure

      if (namespace === UTR_NAMESPACE) {
        expect(unitsFormulaContent).toContain(`QName('${namespace}', '${name}')`)
      } else if (namespace === ESRS_NAMESPACE) {
        expect(unitsFormulaContent).toContain(`QName('${namespace}', '${name}')`)
      } else {
        throw new Error(`Unexpected unit namespace: ${namespace}`)
      }
    }
  })
})
