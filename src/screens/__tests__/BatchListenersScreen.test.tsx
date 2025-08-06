import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import BatchListenersScreen from '../main/batchlisteners'
import { useFormStore } from '@/lib/jsr352batchjobstore'
import { createMockForm } from '@/test/mockReactHookForm'

vi.mock('@/lib/jsr352batchjobstore', () => ({
  useFormStore: vi.fn()
}))

vi.mock('@/hooks/use-form-step', () => ({
  useFormStep: vi.fn(() => ({
    form: createMockForm(),
    handleNext: vi.fn(),
    handlePrevious: vi.fn()
  }))
}))

vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => children,
  FormField: ({ render }: any) => render({ field: { value: '', onChange: vi.fn() }, fieldState: {} }),
  FormItem: ({ children }: any) => children,
  FormLabel: ({ children }: any) => children,
  FormControl: ({ children }: any) => children,
  FormMessage: () => null
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

vi.mock('react-hook-form', () => ({
  useFieldArray: vi.fn(() => ({
    fields: [],
    append: vi.fn(),
    remove: vi.fn()
  }))
}))

describe('BatchListenersScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useFormStore as any).mockReturnValue({
      formData: { batchListeners: [] },
      setFormData: vi.fn(),
      setCurrentStep: vi.fn()
    })
  })

  it('should render batch listeners title', () => {
    render(<BatchListenersScreen stepNumber={3} />)
    expect(screen.getByText(/Batch Listeners/i)).toBeInTheDocument()
  })

  it('should have navigation buttons', () => {
    render(<BatchListenersScreen stepNumber={3} />)
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })
})