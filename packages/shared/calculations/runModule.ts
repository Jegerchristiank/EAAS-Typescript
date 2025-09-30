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

type PlannedModuleId =
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A4'
  | 'C10'
  | 'C11'
  | 'C12'
  | 'C13'
  | 'C14'
  | 'C15'
  | 'D1'

const plannedModuleMessages: Record<PlannedModuleId, string> = {
  A1: 'Scope 1 stationære forbrændingskilder modelleres i næste bølge. Dokumentér ejerskab og datakilder her.',
  A2: 'Scope 1 mobile forbrændingskilder kortlægges snart. Indsaml ansvarlige teams og systemintegrationer.',
  A3: 'Scope 1 procesemissioner kræver yderligere metodevalg. Brug felterne til at planlægge datatilgængelighed.',
  A4: 'Scope 1 flugtige emissioner (fx kølemidler) tilføjes i næste release. Forbered governance og dataveje.',
  C10: 'Scope 3 brug af solgte produkter kræver downstream performance-data. Registrér plan for dataindsamling.',
  C11: 'Scope 3 slutbehandling af solgte produkter forberedes. Angiv ansvarlige og forventede kilder.',
  C12: 'Scope 3 franchising og downstream services kortlægges. Notér ejerskab og næste skridt.',
  C13: 'Scope 3 investeringer og finansielle aktiviteter tilføjes. Dokumentér governance og datastrømme.',
  C14: 'Scope 3 øvrige downstream aktiviteter samles her. Brug felterne til at beskrive dataplacering.',
  C15: 'Scope 3 øvrige kategorioplysninger dækker resterende krav. Forbered kontekst og kontaktpersoner.',
  D1: 'CSRD/ESRS governance-kravet afventer komplet metode. Indtast kontaktpunkter og status for policies.'
}

const moduleTitles: Record<ModuleId, string> = {
  A1: 'A1 – Scope 1 stationære forbrændingskilder (planlagt)',
  A2: 'A2 – Scope 1 mobile forbrændingskilder (planlagt)',
  A3: 'A3 – Scope 1 procesemissioner (planlagt)',
  A4: 'A4 – Scope 1 flugtige emissioner (planlagt)',
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
  C10: 'C10 – Brug af solgte produkter (planlagt)',
  C11: 'C11 – Slutbehandling af solgte produkter (planlagt)',
  C12: 'C12 – Franchising og downstream services (planlagt)',
  C13: 'C13 – Investeringer og finansielle aktiviteter (planlagt)',
  C14: 'C14 – Øvrige downstream aktiviteter (planlagt)',
  C15: 'C15 – Øvrige kategorioplysninger (planlagt)',
  D1: 'D1 – CSRD/ESRS governance-krav (planlagt)'
}

export const moduleCalculators: Record<ModuleId, ModuleCalculator> = {
  A1: (input) => createPlanningStubResult('A1', input),
  A2: (input) => createPlanningStubResult('A2', input),
  A3: (input) => createPlanningStubResult('A3', input),
  A4: (input) => createPlanningStubResult('A4', input),
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
  C10: (input) => createPlanningStubResult('C10', input),
  C11: (input) => createPlanningStubResult('C11', input),
  C12: (input) => createPlanningStubResult('C12', input),
  C13: (input) => createPlanningStubResult('C13', input),
  C14: (input) => createPlanningStubResult('C14', input),
  C15: (input) => createPlanningStubResult('C15', input),
  D1: (input) => createPlanningStubResult('D1', input)
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

function createPlanningStubResult(moduleId: PlannedModuleId, input: ModuleInput): ModuleResult {
  const payload = input[moduleId]
  const tracePayload =
    payload == null
      ? 'null'
      : typeof payload === 'object'
        ? JSON.stringify(payload)
        : String(payload)

  return {
    value: 0,
    unit: 'n/a',
    assumptions: [
      'Stubberegning',
      'Modul er planlagt og afventer fuld beregning.',
      plannedModuleMessages[moduleId]
    ],
    trace: [`Stub(${moduleId})=${tracePayload}`],
    warnings: ['Resultatet udelades fra rapporter, indtil beregningsmetoden er implementeret.']
  }
}

export function aggregateResults(input: ModuleInput): CalculatedModuleResult[] {
  return moduleIds.map((moduleId) => ({
    moduleId,
    title: moduleTitles[moduleId],
    result: runModule(moduleId, input)
  }))
}
