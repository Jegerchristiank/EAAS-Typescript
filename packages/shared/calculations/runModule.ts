/**
 * Koordinerer modulberegninger og aggregerede resultater.
 */
import {
  moduleIds,
  type CalculatedModuleResult,
  type ModuleCalculator,
  type ModuleId,
  type ModuleInput,
  type ModuleResult
} from '../types'
import { factors } from './factors'
import { withE1Insights } from './e1Insights'
import { runA1 } from './modules/runA1'
import { runA2 } from './modules/runA2'
import { runA3 } from './modules/runA3'
import { runA4 } from './modules/runA4'
import { runB1 } from './modules/runB1'
import { runB2 } from './modules/runB2'
import { runB3 } from './modules/runB3'
import { runB4 } from './modules/runB4'
import { runB5 } from './modules/runB5'
import { runB6 } from './modules/runB6'
import { runB7 } from './modules/runB7'
import { runB8 } from './modules/runB8'
import { runB9 } from './modules/runB9'
import { runB10 } from './modules/runB10'
import { runB11 } from './modules/runB11'
import { runC1 } from './modules/runC1'
import { runC2 } from './modules/runC2'
import { runC3 } from './modules/runC3'
import { runC4 } from './modules/runC4'
import { runC5 } from './modules/runC5'
import { runC6 } from './modules/runC6'
import { runC7 } from './modules/runC7'
import { runC8 } from './modules/runC8'
import { runC9 } from './modules/runC9'
import { runC10 } from './modules/runC10'
import { runC11 } from './modules/runC11'
import { runC12 } from './modules/runC12'
import { runC13 } from './modules/runC13'
import { runC14 } from './modules/runC14'
import { runC15 } from './modules/runC15'
import { runE1Targets } from './modules/runE1Targets'
import { runE2Water } from './modules/runE2Water'
import { runE3Pollution } from './modules/runE3Pollution'
import { runE4Biodiversity } from './modules/runE4Biodiversity'
import { runE5Resources } from './modules/runE5Resources'
import { runD1 } from './modules/runD1'
import { runD2 } from './modules/runD2'

const moduleTitles: Record<ModuleId, string> = {
  A1: 'A1 – Scope 1 stationære forbrændingskilder',
  A2: 'A2 – Scope 1 mobile forbrændingskilder',
  A3: 'A3 – Scope 1 procesemissioner',
  A4: 'A4 – Scope 1 flugtige emissioner',
  B1: 'B1 – Scope 2 elforbrug',
  B2: 'B2 – Scope 2 varmeforbrug',
  B3: 'B3 – Scope 2 køleforbrug',
  B4: 'B4 – Scope 2 dampforbrug',
  B5: 'B5 – Scope 2 øvrige energileverancer',
  B6: 'B6 – Scope 2 nettab i elnettet',
  B7: 'B7 – Dokumenteret vedvarende el',
  B8: 'B8 – Egenproduceret vedvarende el',
  B9: 'B9 – Fysisk PPA for vedvarende el',
  B10: 'B10 – Virtuel PPA for vedvarende el',
  B11: 'B11 – Time-matchede certifikater for vedvarende el',
  C1: 'C1 – Medarbejderpendling',
  C2: 'C2 – Forretningsrejser',
  C3: 'C3 – Brændstof- og energirelaterede aktiviteter',
  C4: 'C4 – Transport og distribution (upstream)',
  C5: 'C5 – Affald fra drift (upstream)',
  C6: 'C6 – Udlejede aktiver (upstream)',
  C7: 'C7 – Transport og distribution (downstream)',
  C8: 'C8 – Udlejede aktiver (downstream)',
  C9: 'C9 – Forarbejdning af solgte produkter',
  C10: 'C10 – Upstream leasede aktiver',
  C11: 'C11 – Downstream leasede aktiver',
  C12: 'C12 – Franchising og downstream services',
  C13: 'C13 – Investeringer og finansielle aktiviteter',
  C14: 'C14 – Behandling af solgte produkter',
  C15: 'C15 – Øvrige kategorioplysninger',
  E1Targets: 'E1 – Klimamål og handlinger',
  E2Water: 'E2 – Vandforbrug og vandstress',
  E3Pollution: 'E3 – Emissioner til luft, vand og jord',
  E4Biodiversity: 'E4 – Påvirkning af biodiversitet',
  E5Resources: 'E5 – Ressourcer og materialeforbrug',
  D1: 'D1 – Metode & governance',
  D2: 'D2 – Dobbelt væsentlighed & CSRD-gaps'
}

export const moduleCalculators: Record<ModuleId, ModuleCalculator> = {
  A1: runA1,
  A2: runA2,
  A3: runA3,
  A4: runA4,
  B1: runB1,
  B2: runB2,
  B3: runB3,
  B4: runB4,
  B5: runB5,
  B6: runB6,
  B7: runB7,
  B8: runB8,
  B9: runB9,
  B10: runB10,
  B11: runB11,
  C1: runC1,
  C2: runC2,
  C3: runC3,
  C4: runC4,
  C5: runC5,
  C6: runC6,
  C7: runC7,
  C8: runC8,
  C9: runC9,
  C10: runC10,
  C11: runC11,
  C12: runC12,
  C13: runC13,
  C14: runC14,
  C15: runC15,
  E1Targets: runE1Targets,
  E2Water: runE2Water,
  E3Pollution: runE3Pollution,
  E4Biodiversity: runE4Biodiversity,
  E5Resources: runE5Resources,
  D1: runD1,
  D2: runD2
}

export function createDefaultResult(moduleId: ModuleId, input: ModuleInput): ModuleResult {
  const rawValue = input[moduleId]
  const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue ?? 0)

  return {
    value: Number.isFinite(numericValue) ? numericValue * factors.defaultFactor : 0,
    unit: 'point',
    assumptions: [`Standardfaktor: ${factors.defaultFactor}`],
    trace: [`Input(${moduleId})=${String(rawValue ?? '')}`],
    warnings: []
  }
}

export function runModule(moduleId: ModuleId, input: ModuleInput): ModuleResult {
  const calculator = moduleCalculators[moduleId]
  const baseResult = calculator(input)
  if (
    baseResult.intensities != null ||
    baseResult.trend != null ||
    baseResult.targetProgress != null ||
    baseResult.energyMix != null
  ) {
    return baseResult
  }
  return withE1Insights(moduleId, input, baseResult)
}

export function aggregateResults(input: ModuleInput): CalculatedModuleResult[] {
  return moduleIds.map((moduleId) => ({
    moduleId,
    title: moduleTitles[moduleId],
    result: runModule(moduleId, input)
  }))
}
