// Enhanced type definitions for form components and validation
import type { ComponentType, BaseSyntheticEvent } from 'react'

export interface FormValidationContext {
  hasFieldContext: boolean;
  hasItemContext: boolean;
  hasFormContext: boolean;
  fieldName?: string;
  timestamp: string;
}

export interface FormError {
  message?: string;
}

export interface FormFieldContextValue<T = string> {
  name: T;
}

export interface FormItemContextValue {
  id: string;
}

// Step-related types
export interface StepItem {
  id?: string;
  stepName?: string;
  type?: string;
  batchletClass?: string;
  readerClass?: string;
  processorClass?: string;
  writerClass?: string;
  listeners?: string[];
  addProcessor?: boolean;
  [key: string]: unknown;
}

export interface StepWithName {
  name: string;
  [key: string]: unknown;
}

export interface ValidationStepItem {
  id?: string;
  [key: string]: unknown;
}

// Dynamic step data
export interface DynamicStepData {
  [key: string]: unknown;
}

// Enhanced Step interface
export interface EnhancedStep {
  id: number;
  name: string;
  component: ComponentType<{ stepNumber: number }>;
  insertedByDynamic?: boolean;
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// Hook form types
export interface UseFormStepOptions<T> {
  schema: unknown;
  currentStep: number;
  defaultValues: T;
}

export interface FormStepReturn<T> {
  form: {
    control: unknown;
    // eslint-disable-next-line no-unused-vars
    handleSubmit: (callback: (data: T) => void) => (e?: BaseSyntheticEvent) => Promise<void>;
    formState: {
      errors: Record<string, unknown>;
    };
    // eslint-disable-next-line no-unused-vars
    watch: (name?: string) => unknown;
    getValues: () => T;
  };
  // eslint-disable-next-line no-unused-vars
  handleNext: (data: T) => void;
  handlePrevious: () => void;
}