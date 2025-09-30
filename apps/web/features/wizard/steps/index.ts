/**
 * Samling af wizardtrinene og metadata til navigation.
 */
'use client'

import type { ModuleId } from '@org/shared'
import type { WizardStepComponent } from './StepTemplate'
import { A1Step } from './A1'
import { A2Step } from './A2'
import { A3Step } from './A3'
import { A4Step } from './A4'
import { D1Step } from './PlanningSteps'
import { B1Step } from './B1'
import { B2Step } from './B2'
import { B3Step } from './B3'
import { B4Step } from './B4'
import { B5Step } from './B5'
import { B6Step } from './B6'
import { B7Step } from './B7'
import { B8Step } from './B8'
import { B9Step } from './B9'
import { B10Step } from './B10'
import { B11Step } from './B11'
import { C1Step } from './C1'
import { C2Step } from './C2'
import { C3Step } from './C3'
import { C4Step } from './C4'
import { C5Step } from './C5'
import { C6Step } from './C6'
import { C7Step } from './C7'
import { C8Step } from './C8'
import { C9Step } from './C9'
import { C10Step } from './C10'
import { C11Step } from './C11'
import { C12Step } from './C12'
import { C13Step } from './C13'
import { C14Step } from './C14'
import { C15Step } from './C15'

export type WizardStep = {
  id: ModuleId
  label: string
  component: WizardStepComponent
  scope: WizardScope
  status: WizardStepStatus
}

export type WizardScope = 'Scope 1' | 'Scope 2' | 'Scope 3' | 'Governance'

export type WizardStepStatus = 'ready' | 'planned'

export const wizardSteps: WizardStep[] = [
  { id: 'B1', label: 'B1 – Scope 2 elforbrug', component: B1Step, scope: 'Scope 2', status: 'ready' },
  { id: 'B2', label: 'B2 – Scope 2 varmeforbrug', component: B2Step, scope: 'Scope 2', status: 'ready' },
  { id: 'B3', label: 'B3 – Scope 2 køleforbrug', component: B3Step, scope: 'Scope 2', status: 'ready' },
  { id: 'B4', label: 'B4 – Scope 2 dampforbrug', component: B4Step, scope: 'Scope 2', status: 'ready' },
  { id: 'B5', label: 'B5 – Scope 2 øvrige energileverancer', component: B5Step, scope: 'Scope 2', status: 'ready' },
  { id: 'B6', label: 'B6 – Scope 2 nettab i elnettet', component: B6Step, scope: 'Scope 2', status: 'ready' },
  { id: 'B7', label: 'B7 – Dokumenteret vedvarende el', component: B7Step, scope: 'Scope 2', status: 'ready' },
  { id: 'B8', label: 'B8 – Egenproduceret vedvarende el', component: B8Step, scope: 'Scope 2', status: 'ready' },
  { id: 'B9', label: 'B9 – Fysisk PPA for vedvarende el', component: B9Step, scope: 'Scope 2', status: 'ready' },
  { id: 'B10', label: 'B10 – Virtuel PPA for vedvarende el', component: B10Step, scope: 'Scope 2', status: 'ready' },
  { id: 'B11', label: 'B11 – Time-matchede certifikater for vedvarende el', component: B11Step, scope: 'Scope 2', status: 'ready' },
  { id: 'A1', label: 'A1 – Scope 1 stationære forbrændingskilder', component: A1Step, scope: 'Scope 1', status: 'ready' },
  { id: 'A2', label: 'A2 – Scope 1 mobile forbrændingskilder', component: A2Step, scope: 'Scope 1', status: 'ready' },
  { id: 'A3', label: 'A3 – Scope 1 procesemissioner', component: A3Step, scope: 'Scope 1', status: 'ready' },
  { id: 'A4', label: 'A4 – Scope 1 flugtige emissioner', component: A4Step, scope: 'Scope 1', status: 'ready' },
  { id: 'C1', label: 'C1 – Medarbejderpendling', component: C1Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C2', label: 'C2 – Forretningsrejser', component: C2Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C3', label: 'C3 – Brændstof- og energirelaterede aktiviteter', component: C3Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C4', label: 'C4 – Transport og distribution (upstream)', component: C4Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C5', label: 'C5 – Affald fra drift (upstream)', component: C5Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C6', label: 'C6 – Udlejede aktiver (upstream)', component: C6Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C7', label: 'C7 – Transport og distribution (downstream)', component: C7Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C8', label: 'C8 – Udlejede aktiver (downstream)', component: C8Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C9', label: 'C9 – Forarbejdning af solgte produkter', component: C9Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C10', label: 'C10 – Upstream leasede aktiver', component: C10Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C11', label: 'C11 – Downstream leasede aktiver', component: C11Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C12', label: 'C12 – Franchising og downstream services', component: C12Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C13', label: 'C13 – Investeringer og finansielle aktiviteter', component: C13Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C14', label: 'C14 – Behandling af solgte produkter', component: C14Step, scope: 'Scope 3', status: 'ready' },
  { id: 'C15', label: 'C15 – Øvrige kategorioplysninger', component: C15Step, scope: 'Scope 3', status: 'ready' },
  { id: 'D1', label: 'D1 – CSRD/ESRS governance-krav', component: D1Step, scope: 'Governance', status: 'planned' }
]
