import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import DynamicStepsScreen from '../main/dynamicsteps'
import { useFormStore } from '@/lib/jsr352batchjobstore'

vi.mock('@/lib/jsr352batchjobstore', () => ({
  useFormStore: vi.fn()
}))

vi.mock('@/hooks/use-dynamic-step-logic', () => ({
  useDynamicStepLogic: vi.fn(() => ({
    stepItems: [],
    addStepItem: vi.fn(),
    removeStepItem: vi.fn(),
    updateStepItem: vi.fn()
  }))
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children }: any) => <div>{children}</div>
}))

describe('DynamicStepsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useFormStore as any).mockReturnValue({
      stepItems: [],
      setCurrentStep: vi.fn(),
      addStepItem: vi.fn(),
      formData: {},
      steps: [],
      currentStep: 4,
      dynamicStepsData: {}
    })
  })

  it('should render dynamic steps title', () => {
    render(<DynamicStepsScreen stepNumber={4} />)
    expect(screen.getByText(/Step Definition/i)).toBeInTheDocument()
  })

  it('should have navigation buttons', () => {
    render(<DynamicStepsScreen stepNumber={4} />)
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })
})