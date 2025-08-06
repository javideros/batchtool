/**
 * Mock implementations for simplified hooks
 */
import { vi } from 'vitest';

// Mock simplified step handlers
export const mockStepHandlers = {
  handleUpdateExistingStep: vi.fn(),
  handleAddNewStep: vi.fn(),
  handleFinish: vi.fn()
};

// Mock simplified dynamic step handlers  
export const mockDynamicStepHandlers = {
  handleUpdateExistingStep: vi.fn(),
  handleAddNewStep: vi.fn(),
  handleFinish: vi.fn()
};

// Mock simplified performance hook
export const mockPerformance = {
  measureTime: vi.fn(),
  getMetrics: vi.fn(() => ({}))
};

// Mock secure form without customSanitizer
export const mockSecureForm = {
  handleSecureSubmit: vi.fn(),
  securityViolations: [],
  isRateLimited: false,
  clearSecurityViolations: vi.fn(),
  getRemainingAttempts: vi.fn(() => 5),
  validateFieldSecurity: vi.fn(() => Promise.resolve(true)),
  recordSecurityViolation: vi.fn()
};