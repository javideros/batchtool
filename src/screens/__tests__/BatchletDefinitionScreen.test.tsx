import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import BatchletDefinitionScreen from '../dynamic-steps/batchletdefinition'
import { useFormStore } from '@/lib/jsr352batchjobstore'
import { createMockForm } from '@/test/mockReactHookForm'

// Mock the store
vi.mock('@/lib/jsr352batchjobstore', () => ({
  useFormStore: vi.fn()
}))

// Mock hooks
vi.mock('@/hooks/use-form-step', () => ({
  useFormStep: vi.fn(() => ({
    form: createMockForm(),
    handleNext: vi.fn(),
    handlePrevious: vi.fn()
  }))
}))

vi.mock('@/hooks/use-step-data-update', () => ({
  useStepDataUpdate: vi.fn(() => ({
    stepItems: [],
    updateStepData: vi.fn()
  }))
}))

// Mock utility functions
vi.mock('@/utils/stepUtils', () => ({
  resolveTargetStepId: vi.fn(() => 'step1'),
  isAddingNewStep: vi.fn(() => false)
}))

vi.mock('@/utils/validationUtils', () => ({
  createUniqueClassValidator: vi.fn(() => () => true),
  createUniqueClassErrorMessage: vi.fn(() => 'Class name must be unique')
}))

// Mock zod
vi.mock('zod', () => {
  const mockChain = {
    trim: vi.fn(() => mockChain),
    min: vi.fn(() => mockChain),
    max: vi.fn(() => mockChain),
    regex: vi.fn(() => mockChain),
    refine: vi.fn(() => mockChain),
    optional: vi.fn(() => mockChain)
  }
  
  return {
    default: {
      object: vi.fn(() => mockChain),
      string: vi.fn(() => mockChain),
      array: vi.fn(() => mockChain),
      enum: vi.fn(() => mockChain),
      boolean: vi.fn(() => mockChain)
    }
  }
})

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FormProvider: ({ children }: any) => children,
    useFieldArray: vi.fn(() => ({
      fields: [],
      append: vi.fn(),
      remove: vi.fn()
    }))
  }
})

// Mock UI components
vi.mock('@/components/ui/form', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Form: ({ children }: any) => children,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FormField: ({ render }: any) => render({ field: { value: '', onChange: vi.fn() }, fieldState: {} }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FormItem: ({ children }: any) => children,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FormLabel: ({ children }: any) => children,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FormControl: ({ children }: any) => children,
  FormMessage: () => null
}))

vi.mock('@/components/ui/button', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))

vi.mock('@/components/ui/card', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Card: ({ children }: any) => <div>{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CardHeader: ({ children }: any) => <div>{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CardDescription: ({ children }: any) => <p>{children}</p>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CardContent: ({ children }: any) => <div>{children}</div>
}))

describe('BatchletDefinitionScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useFormStore as any).mockReturnValue({
      formData: {
        packageName: 'com.test'
      },
      setCurrentStep: vi.fn(),
      steps: []
    })
  })

  it('should render batchlet definition title', () => {
    render(<BatchletDefinitionScreen stepNumber={2} />)
    
    expect(screen.getByText(/Batchlet Definition/i)).toBeInTheDocument()
  })

  it('should render batchlet class field', () => {
    render(<BatchletDefinitionScreen stepNumber={2} />)
    
    expect(screen.getByText(/Batchlet Class/i)).toBeInTheDocument()
    expect(screen.getByText(/fully qualified Java class name/i)).toBeInTheDocument()
  })

  it('should show step execution context section', () => {
    render(<BatchletDefinitionScreen stepNumber={2} />)
    
    expect(screen.getByText(/Step Execution Context/i)).toBeInTheDocument()
    expect(screen.getByText(/JSL Name/i)).toBeInTheDocument()
    expect(screen.getByText(/Abstract Step/i)).toBeInTheDocument()
  })

  it('should show step properties section', () => {
    render(<BatchletDefinitionScreen stepNumber={2} />)
    
    expect(screen.getByRole('heading', { name: /Step Properties/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add property/i })).toBeInTheDocument()
  })

  it('should show empty properties message when no properties', () => {
    render(<BatchletDefinitionScreen stepNumber={2} />)
    
    expect(screen.getByText(/No step properties defined/i)).toBeInTheDocument()
    expect(screen.getByText(/Properties can reference job parameters like:/i)).toBeInTheDocument()
  })

  it('should have navigation buttons', () => {
    render(<BatchletDefinitionScreen stepNumber={2} />)
    
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('should show package name in placeholder', () => {
    render(<BatchletDefinitionScreen stepNumber={2} />)
    
    const input = screen.getByPlaceholderText(/com.test.MyBatchlet/i)
    expect(input).toBeInTheDocument()
  })

  it('should show JSL name field', () => {
    render(<BatchletDefinitionScreen stepNumber={2} />)
    
    expect(screen.getByPlaceholderText(/step-jsl-name/i)).toBeInTheDocument()
    expect(screen.getByText(/Job Specification Language name/i)).toBeInTheDocument()
  })

  it('should show abstract step checkbox', () => {
    render(<BatchletDefinitionScreen stepNumber={2} />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(screen.getByText(/Mark this step as abstract/i)).toBeInTheDocument()
  })
})