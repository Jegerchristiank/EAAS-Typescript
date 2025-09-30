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
  { id: 'B5', label: 'B5 – Scope 2 øvrige energileverancer', component: B5Step },
  { id: 'B6', label: 'B6 – Scope 2 nettab i elnettet', component: B6Step },
  { id: 'B7', label: 'B7 – Dokumenteret vedvarende el', component: B7Step },
  { id: 'B8', label: 'B8 – Egenproduceret vedvarende el', component: B8Step },
  { id: 'B9', label: 'B9 – Fysisk PPA for vedvarende el', component: B9Step },
  { id: 'B10', label: 'B10 – Virtuel PPA for vedvarende el', component: B10Step },
  { id: 'B11', label: 'B11 – Time-matchede certifikater for vedvarende el', component: B11Step },
  { id: 'C1', label: 'C1 – Medarbejderpendling', component: C1Step },
  { id: 'C2', label: 'C2 – Forretningsrejser', component: C2Step },
  { id: 'C3', label: 'C3 – Brændstof- og energirelaterede aktiviteter', component: C3Step },
  { id: 'C4', label: 'C4 – Transport og distribution (upstream)', component: C4Step },
  { id: 'C5', label: 'C5 – Affald fra drift (upstream)', component: C5Step },
  { id: 'C6', label: 'C6 – Udlejede aktiver (upstream)', component: C6Step },
  { id: 'C7', label: 'C7 – Transport og distribution (downstream)', component: C7Step },
  { id: 'C8', label: 'C8 – Udlejede aktiver (downstream)', component: C8Step },
  { id: 'C9', label: 'C9 – Forarbejdning af solgte produkter', component: C9Step }
]
