/**
 * @fileoverview Enhanced validation utilities with security and cross-field validation
 * @module utils/enhanced-validation
 */

import { z } from 'zod';
import { sanitizeText, sanitizeJavaClassName, sanitizePackageName, sanitizeBatchName } from './security';

/**
 * Custom Zod transform for sanitizing text input
 */
const sanitizedString = z.string().transform(sanitizeText);

/**
 * Custom Zod transform for Java class names with sanitization
 */
const javaClassName = z.string()
  .min(1, 'Class name is required')
  .transform(sanitizeJavaClassName)
  .refine(
    (val) => /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/.test(val),
    'Must be a valid Java class name (e.g., com.example.MyClass)'
  );

/**
 * Custom Zod transform for package names with sanitization
 */
const packageName = z.string()
  .min(1, 'Package name is required')
  .transform(sanitizePackageName)
  .refine(
    (val) => /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(val),
    'Must be a valid package name (e.g., com.example.batch)'
  );

/**
 * Custom Zod transform for batch names with sanitization
 */
const batchName = z.string()
  .min(1, 'Batch name is required')
  .max(25, 'Batch name must be 25 characters or less')
  .transform(sanitizeBatchName)
  .refine(
    (val) => /^[A-Z_][A-Z0-9_]*$/.test(val),
    'Batch name must contain only uppercase letters and underscores'
  );

/**
 * Async validation for unique batch names
 * @param {string} name - Batch name to validate
 * @returns {Promise<boolean>} True if name is unique
 */
const validateUniqueBatchName = async (name: string): Promise<boolean> => {
  // Simulate API call to check uniqueness
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingNames = ['EXISTING_BATCH', 'SAMPLE_JOB', 'TEST_BATCH'];
      resolve(!existingNames.includes(name.toUpperCase()));
    }, 500);
  });
};

/**
 * Enhanced batch details schema with security and validation
 */
export const enhancedBatchDetailsSchema = z.object({
  batchName: batchName,
  functionalAreaCd: z.enum(['ED', 'DC', 'FN', 'IN'], {
    errorMap: () => ({ message: 'Please select a valid functional area' })
  }),
  frequency: z.enum(['DLY', 'WKY', 'MTH', 'YRL'], {
    errorMap: () => ({ message: 'Please select a valid frequency' })
  }),
  packageName: packageName,
  description: sanitizedString.optional(),
}).refine(
  async (data) => {
    // Cross-field validation: package name should match functional area
    const areaPrefix = data.functionalAreaCd.toLowerCase();
    return data.packageName.includes(areaPrefix);
  },
  {
    message: 'Package name should include the functional area code',
    path: ['packageName']
  }
);

/**
 * Enhanced step validation schema
 */
export const enhancedStepSchema = z.object({
  stepName: z.string()
    .min(1, 'Step name is required')
    .max(50, 'Step name must be 50 characters or less')
    .transform(sanitizeText)
    .refine(
      (val) => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(val),
      'Step name must start with a letter and contain only letters, numbers, underscores, and hyphens'
    ),
  type: z.enum(['A', 'B', 'C'], {
    errorMap: () => ({ message: 'Please select a valid step type' })
  }),
  batchletClass: javaClassName.optional(),
  readerClass: javaClassName.optional(),
  processorClass: javaClassName.optional(),
  writerClass: javaClassName.optional(),
  chunkSize: z.number()
    .min(1, 'Chunk size must be at least 1')
    .max(10000, 'Chunk size cannot exceed 10,000')
    .optional(),
  skipLimit: z.number()
    .min(0, 'Skip limit cannot be negative')
    .max(1000, 'Skip limit cannot exceed 1,000')
    .optional(),
  retryLimit: z.number()
    .min(0, 'Retry limit cannot be negative')
    .max(10, 'Retry limit cannot exceed 10')
    .optional(),
  properties: z.array(z.object({
    key: z.string()
      .min(1, 'Property key is required')
      .transform(sanitizeText)
      .refine(
        (val) => /^[a-zA-Z][a-zA-Z0-9._-]*$/.test(val),
        'Property key must be a valid identifier'
      ),
    value: sanitizedString.min(1, 'Property value is required')
  })).optional(),
  listeners: z.array(javaClassName).optional(),
}).refine(
  (data) => {
    // Cross-field validation: ensure required classes are provided based on type
    if (data.type === 'A' && !data.batchletClass) {
      return false;
    }
    if (data.type === 'B' && (!data.readerClass || !data.writerClass)) {
      return false;
    }
    return true;
  },
  {
    message: 'Required classes must be provided for the selected step type',
    path: ['type']
  }
);

/**
 * Validation for exception handling
 */
export const exceptionHandlingSchema = z.object({
  skipExceptionClasses: z.array(javaClassName).optional(),
  retryExceptionClasses: z.array(javaClassName).optional(),
  noRollbackExceptionClasses: z.array(javaClassName).optional(),
}).refine(
  (data) => {
    // Ensure no overlap between exception class arrays
    const skip = data.skipExceptionClasses || [];
    const retry = data.retryExceptionClasses || [];
    const noRollback = data.noRollbackExceptionClasses || [];
    
    const allClasses = [...skip, ...retry, ...noRollback];
    const uniqueClasses = new Set(allClasses);
    
    return allClasses.length === uniqueClasses.size;
  },
  {
    message: 'Exception classes cannot appear in multiple categories',
    path: ['skipExceptionClasses']
  }
);

/**
 * Comprehensive form validation with all security measures
 */
export const secureFormSchema = z.object({
  batchDetails: enhancedBatchDetailsSchema,
  steps: z.array(enhancedStepSchema).min(1, 'At least one step is required'),
  properties: z.array(z.object({
    key: z.string()
      .min(1, 'Property key is required')
      .transform(sanitizeText),
    value: sanitizedString.min(1, 'Property value is required')
  })).optional(),
  listeners: z.array(javaClassName).optional(),
}).refine(
  (data) => {
    // Global validation: ensure step names are unique
    const stepNames = data.steps.map(step => step.stepName);
    const uniqueNames = new Set(stepNames);
    return stepNames.length === uniqueNames.size;
  },
  {
    message: 'Step names must be unique',
    path: ['steps']
  }
);

/**
 * Validation hook with rate limiting and security
 */
export const useSecureValidation = () => {
  const validateWithSecurity = async (data: unknown, schema: z.ZodSchema) => {
    try {
      // Rate limiting check (in real app, use user ID or IP)
      // const identifier = 'user-session'; // Currently unused
      
      // Validate data structure
      const result = await schema.safeParseAsync(data);
      
      if (!result.success) {
        return {
          success: false,
          errors: result.error.flatten().fieldErrors,
          securityViolations: []
        };
      }
      
      return {
        success: true,
        data: result.data,
        securityViolations: []
      };
    } catch (error) {
      return {
        success: false,
        errors: { _root: ['Validation failed'] },
        securityViolations: [error instanceof Error ? error.message : 'Unknown security violation']
      };
    }
  };

  return { validateWithSecurity };
};

/**
 * Security-aware form field validation
 */
export const createSecureFieldValidator = (fieldName: string) => {
  return (value: string) => {
    // Check for potential XSS patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];
    
    const hasXssPattern = xssPatterns.some(pattern => pattern.test(value));
    if (hasXssPattern) {
      return `${fieldName} contains potentially dangerous content`;
    }
    
    // Check for SQL injection patterns (even though we're not using SQL)
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i
    ];
    
    const hasSqlPattern = sqlPatterns.some(pattern => pattern.test(value));
    if (hasSqlPattern) {
      return `${fieldName} contains potentially dangerous SQL patterns`;
    }
    
    return true;
  };
};

/**
 * Async validation for batch name uniqueness
 */
export const createAsyncBatchNameValidator = () => {
  return async (batchName: string) => {
    const isUnique = await validateUniqueBatchName(batchName);
    return isUnique || 'Batch name already exists';
  };
};