'use client'

import { useMemo } from 'react'

import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { isModuleRelevant } from '../../src/modules/wizard/profile'
import { wizardSteps } from './steps'
import { useWizardContext } from './useWizard'

function findNextRelevantIndex(currentIndex: number, profile: Parameters<typeof isModuleRelevant>[0]): number {
  for (let index = currentIndex + 1; index < wizardSteps.length; index += 1) {
    const candidate = wizardSteps[index]
    if (candidate.status !== 'ready') {
      continue
    }
    if (isModuleRelevant(profile, candidate.id)) {
      return index
    }
  }
  return -1
}

type NextRelevantButtonProps = {
  className?: string
}

export function NextRelevantButton({ className }: NextRelevantButtonProps): JSX.Element | null {
  const { currentStep, goToStep, profile } = useWizardContext()

  const nextRelevant = useMemo(() => {
    if (currentStep < 0 || currentStep >= wizardSteps.length) {
      return null
    }
    const nextIndex = findNextRelevantIndex(currentStep, profile)
    if (nextIndex === -1) {
      return null
    }
    return { index: nextIndex, step: wizardSteps[nextIndex] }
  }, [currentStep, profile])

  if (!nextRelevant) {
    return null
  }

  const handleClick = () => {
    goToStep(nextRelevant.index)
  }

  return (
    <div className={['ds-next-relevant', className].filter(Boolean).join(' ')}>
      <PrimaryButton variant="ghost" onClick={handleClick}>
        Næste relevante modul: {nextRelevant.step.label}
      </PrimaryButton>
    </div>
  )
}
