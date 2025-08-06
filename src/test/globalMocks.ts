/**
 * Global mocks for simplified functionality
 */
import { vi } from 'vitest';

// Mock simplified hooks globally
vi.mock('@/hooks/use-step-handlers', () => ({
  useStepHandlers: () => ({
    handleUpdateExistingStep: vi.fn(),
    handleAddNewStep: vi.fn(),
    handleFinish: vi.fn()
  })
}));

vi.mock('@/hooks/use-dynamic-step-handlers', () => ({
  useDynamicStepHandlers: () => ({
    handleUpdateExistingStep: vi.fn(),
    handleAddNewStep: vi.fn(),
    handleFinish: vi.fn()
  })
}));

vi.mock('@/hooks/use-performance', () => ({
  usePerformance: () => ({
    measureTime: vi.fn(),
    getMetrics: vi.fn(() => ({}))
  }),
  useLazyComponent: vi.fn((importFn) => importFn)
}));

// Mock secure form without customSanitizer
vi.mock('@/hooks/use-secure-form', () => ({
  useSecureForm: () => ({
    handleSecureSubmit: vi.fn(),
    securityViolations: [],
    isRateLimited: false,
    clearSecurityViolations: vi.fn(),
    getRemainingAttempts: vi.fn(() => 5),
    validateFieldSecurity: vi.fn(() => Promise.resolve(true)),
    recordSecurityViolation: vi.fn()
  })
}));