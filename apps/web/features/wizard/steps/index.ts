/**
 * Samling af wizardtrinene og metadata til navigation.
 */
'use client'

import type { WizardStepComponent } from './StepTemplate'
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

export type WizardStep = {
  id: string
  label: string
  component: WizardStepComponent
}

export const wizardSteps: WizardStep[] = [
  { id: 'B1', label: 'B1 – Scope 2 elforbrug', component: B1Step },
  { id: 'B2', label: 'B2 – Scope 2 varmeforbrug', component: B2Step },
  { id: 'B3', label: 'B3 – Scope 2 køleforbrug', component: B3Step },
  { id: 'B4', label: 'B4 – Scope 2 dampforbrug', component: B4Step },
  { id: 'B5', label: 'Modul B5', component: B5Step },
  { id: 'B6', label: 'Modul B6', component: B6Step },
  { id: 'B7', label: 'Modul B7', component: B7Step },
  { id: 'B8', label: 'Modul B8', component: B8Step },
  { id: 'B9', label: 'Modul B9', component: B9Step },
  { id: 'B10', label: 'Modul B10', component: B10Step },
  { id: 'B11', label: 'Modul B11', component: B11Step },
  { id: 'C1', label: 'Modul C1', component: C1Step },
  { id: 'C2', label: 'Modul C2', component: C2Step },
  { id: 'C3', label: 'Modul C3', component: C3Step },
  { id: 'C4', label: 'Modul C4', component: C4Step },
  { id: 'C5', label: 'Modul C5', component: C5Step },
  { id: 'C6', label: 'Modul C6', component: C6Step },
  { id: 'C7', label: 'Modul C7', component: C7Step },
  { id: 'C8', label: 'Modul C8', component: C8Step },
  { id: 'C9', label: 'Modul C9', component: C9Step }
]
