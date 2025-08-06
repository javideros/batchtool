import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Mock form store for testing
export const createMockFormStore = (initialState = {}) => ({
  formData: {
    batchName: 'test_job',
    functionalAreaCd: 'ED',
    frequency: 'DLY',
    packageName: 'com.test',
    batchProperties: [],
    batchListeners: [],
    stepItems: [],
    ...initialState
  },
  setCurrentStep: vi.fn(),
  updateStepItems: vi.fn(),
  resetForm: vi.fn(),
  steps: [],
  setSteps: vi.fn(),
  currentStep: 0
})

// Custom render function with providers
// eslint-disable-next-line react-refresh/only-export-components
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
// eslint-disable-next-line react-refresh/only-export-components
export { customRender as render }

// Helper to create mock step items
export const createMockStepItem = (overrides = {}) => ({
  id: 'test-step-1',
  type: 'A' as const,
  stepName: 'test_step',
  addProcessor: false,
  stepProperties: [],
  transitions: [],
  ...overrides
})

// Helper to create mock form data
export const createMockFormData = (overrides = {}) => ({
  batchName: 'test_job',
  functionalAreaCd: 'ED' as const,
  frequency: 'DLY' as const,
  packageName: 'com.test',
  batchProperties: [],
  batchListeners: [],
  stepItems: [],
  jobRestartConfig: {
    restartable: true,
    stepRestartConfig: {
      allowStartIfComplete: false,
      startLimit: 3,
      restartable: true
    }
  },
  ...overrides
})