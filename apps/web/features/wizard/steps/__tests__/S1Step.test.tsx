import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { S1Step } from '../S1'

import type { WizardStepProps } from '../StepTemplate'

describe('S1Step', () => {
  const renderWithState = (state: WizardStepProps['state'] = {}, onChange = vi.fn()) => {
    const props: WizardStepProps = {
      state,
      onChange,
      onNext: vi.fn(),
      onBack: vi.fn(),
      isActive: true,
      isLast: false
    }
    render(<S1Step {...props} />)
    return onChange
  }

  it('viser valideringsfejl for ansættelsesformer og status ved negative værdier', () => {
    renderWithState({
      S1: {
        employmentContractBreakdown: [
          { contractType: 'permanentEmployees', headcount: -5, fte: -2, femalePercent: 150 }
        ],
        employmentStatusBreakdown: [{ status: 'fullTime', headcount: -3, fte: -1 }],
        fteCoveragePercent: 150,
        trainingCoveragePercent: 140
      }
    })

    expect(screen.getAllByText('Headcount skal være 0 eller højere.')).toHaveLength(2)
    expect(screen.getAllByText('FTE skal være 0 eller højere.')).toHaveLength(2)
    expect(screen.getAllByText('Angiv en procent mellem 0 og 100.')).toHaveLength(2)
  })

  it('kalder onChange når felter opdateres', () => {
    const onChange = renderWithState({}, vi.fn())

    const trainingInput = screen.getByLabelText('Træningsdækning (%)') as HTMLInputElement
    fireEvent.change(trainingInput, { target: { value: '75' } })

    expect(onChange).toHaveBeenLastCalledWith(
      'S1',
      expect.objectContaining({ trainingCoveragePercent: 75 })
    )

    const collectiveSelects = screen.getAllByRole('combobox', {
      name: /Kollektive overenskomster/
    }) as HTMLSelectElement[]
    const collectiveSelect = collectiveSelects[collectiveSelects.length - 1]
    fireEvent.change(collectiveSelect, { target: { value: 'true' } })

    expect(onChange).toHaveBeenLastCalledWith(
      'S1',
      expect.objectContaining({ hasCollectiveBargainingAgreements: true })
    )
  })
})
