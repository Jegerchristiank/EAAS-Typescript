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

const moduleTitles: Record<ModuleId, string> = {
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
  C7: 'Modul C7',
  C8: 'Modul C8',
  C9: 'Modul C9'
}

export const moduleCalculators: Record<ModuleId, ModuleCalculator> = {
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
  C9: runC9
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
  return calculator(input)
}

export function aggregateResults(input: ModuleInput): CalculatedModuleResult[] {
  return moduleIds.map((moduleId) => ({
    moduleId,
    title: moduleTitles[moduleId],
    result: runModule(moduleId, input)
  }))
}
