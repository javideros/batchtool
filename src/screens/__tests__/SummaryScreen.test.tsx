import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SummaryScreen from '../main/summaryscreen'
import { useFormStore } from '@/lib/jsr352batchjobstore'

// Mock the store
vi.mock('@/lib/jsr352batchjobstore', () => ({
  useFormStore: vi.fn()
}))

// Mock XML generator
vi.mock('@/utils/xmlGenerator', () => ({
  generateJSR352XML: vi.fn(() => `<?xml version="1.0" encoding="UTF-8"?>
<job id="test_job" xmlns="http://xmlns.jcp.org/xml/ns/javaee" version="1.0">
  <step id="test_step">
    <batchlet ref="com.test.TestBatchlet" />
  </step>
</job>`),
  downloadXML: vi.fn(),
  copyToClipboard: vi.fn(() => Promise.resolve(true))
}))

// Mock XML validator
vi.mock('@/utils/xmlValidator', () => ({
  validateJSR352XML: vi.fn(() => ({
    isValid: true,
    errors: [],
    warnings: []
  })),
  formatValidationResults: vi.fn(() => '✅ XML is valid JSR-352 format')
}))

// Mock step navigation hook
vi.mock('@/hooks/use-step-navigation', () => ({
  useStepNavigation: vi.fn(() => ({
    handleBack: vi.fn()
  }))
}))

// Mock UI components
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

describe('SummaryScreen', () => {
  const mockFormData = {
    batchName: 'test_job',
    functionalAreaCd: 'ED' as const,
    frequency: 'DLY' as const,
    packageName: 'com.test',
    batchProperties: [],
    batchListeners: [],
    stepItems: [{
      id: 'step1',
      type: 'A' as const,
      stepName: 'test_step',
      addProcessor: false,
      batchletClass: 'com.test.TestBatchlet'
    }]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useFormStore as any).mockReturnValue({
      formData: mockFormData,
      setCurrentStep: vi.fn(),
      resetForm: vi.fn()
    })
  })

  it('should render summary title', () => {
    render(<SummaryScreen stepNumber={5} />)
    
    expect(screen.getByText(/Configuration Summary/i)).toBeInTheDocument()
  })

  it('should display job details', () => {
    render(<SummaryScreen stepNumber={5} />)
    
    expect(screen.getByText(/test_job/)).toBeInTheDocument()
    expect(screen.getByText(/Eligibility/)).toBeInTheDocument()
    expect(screen.getByText(/Daily/)).toBeInTheDocument()
    expect(screen.getAllByText(/com.test/)[0]).toBeInTheDocument()
  })

  it('should show XML validation status', () => {
    render(<SummaryScreen stepNumber={5} />)
    
    expect(screen.getByText(/Valid JSR-352 XML/i)).toBeInTheDocument()
  })

  it('should have XML preview toggle button', () => {
    render(<SummaryScreen stepNumber={5} />)
    
    expect(screen.getByRole('button', { name: /👁️ preview xml/i })).toBeInTheDocument()
  })

  it('should have download XML button', () => {
    render(<SummaryScreen stepNumber={5} />)
    
    expect(screen.getByRole('button', { name: /💾 download xml/i })).toBeInTheDocument()
  })

  it('should have copy XML button', () => {
    render(<SummaryScreen stepNumber={5} />)
    
    expect(screen.getByRole('button', { name: /📋 copy xml/i })).toBeInTheDocument()
  })

  it('should toggle XML preview when button clicked', async () => {
    render(<SummaryScreen stepNumber={5} />)
    
    const previewButton = screen.getByRole('button', { name: /👁️ preview xml/i })
    fireEvent.click(previewButton)
    
    expect(screen.getByRole('button', { name: /🙈 hide xml/i })).toBeInTheDocument()
  })

  it('should display step information', () => {
    render(<SummaryScreen stepNumber={5} />)
    
    expect(screen.getByText(/test_step/)).toBeInTheDocument()
    expect(screen.getAllByText(/Batchlet/)[0]).toBeInTheDocument()
    expect(screen.getByText(/com.test.TestBatchlet/)).toBeInTheDocument()
  })

  it('should have complete setup button', () => {
    render(<SummaryScreen stepNumber={5} />)
    
    expect(screen.getByRole('button', { name: /🎉 complete setup/i })).toBeInTheDocument()
  })

  it('should show validation info section', () => {
    render(<SummaryScreen stepNumber={5} />)
    
    expect(screen.getByText(/About Your JSR-352 XML/i)).toBeInTheDocument()
    expect(screen.getByText(/Production Ready/i)).toBeInTheDocument()
  })
})