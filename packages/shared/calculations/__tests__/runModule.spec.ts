/**
 * Snapshot-test der verificerer standardresultatet for modulberegninger.
 */
import { describe, expect, it } from 'vitest'
import { createDefaultResult } from '../runModule'

describe('createDefaultResult', () => {
  it('returnerer forventet stubstruktur', () => {
    const result = createDefaultResult('B1', { B1: 42 })
    expect(result).toMatchSnapshot()
  })
})
