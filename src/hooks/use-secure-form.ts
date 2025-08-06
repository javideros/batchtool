/**
 * @fileoverview Secure form hook with enhanced validation and security features
 * @module hooks/use-secure-form
 */

import { useForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useCallback } from 'react';
import { RateLimiter } from '@/utils/security';
import { useSecureValidation } from '@/utils/enhanced-validation';

interface SecurityViolation {
  field: string;
  violation: string;
  timestamp: Date;
}

interface SecureFormOptions<T extends z.ZodType> extends UseFormProps {
  schema: T;
  enableRateLimit?: boolean;
  maxSubmissions?: number;
  rateLimitWindow?: number;
  onSecurityViolation?: () => void;
}

/**
 * Enhanced form hook with security features and validation
 * @template T - Zod schema type
 * @param {SecureFormOptions<T>} options - Form configuration options
 * @returns {Object} Form utilities with security features
 */
export const useSecureForm = <T extends z.ZodType>({
  schema,
  enableRateLimit = true,
  maxSubmissions = 5,
  rateLimitWindow = 60000,
  onSecurityViolation,
  ...formOptions
}: SecureFormOptions<T>) => {
  const [securityViolations, setSecurityViolations] = useState<SecurityViolation[]>([]);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimiter] = useState(() => new RateLimiter(maxSubmissions, rateLimitWindow));
  const { validateWithSecurity } = useSecureValidation();

  const form = useForm({
    resolver: zodResolver(schema),
    ...formOptions,
  });

  /**
   * Records a security violation
   * @param {string} field - Field name where violation occurred
   * @param {string} violation - Description of the violation
   */
  const recordSecurityViolation = useCallback((field: string, violationMsg: string) => {
    const securityViolation: SecurityViolation = {
      field,
      violation: violationMsg,
      timestamp: new Date(),
    };

    setSecurityViolations(prev => [...prev, securityViolation]);
    
    if (onSecurityViolation) {
      onSecurityViolation();
    }
  }, [onSecurityViolation]);

  /**
   * Secure form submission with rate limiting and validation
   * @param {Function} onSubmit - Form submission handler
   * @returns {Function} Enhanced submit handler
   */
  const handleSecureSubmit = useCallback((onSubmit: () => void | Promise<void>) => {
    return form.handleSubmit(async (data) => {
      // Check rate limiting
      if (enableRateLimit) {
        const identifier = 'form-submission'; // In real app, use user ID or session
        if (!rateLimiter.isAllowed(identifier)) {
          setIsRateLimited(true);
          recordSecurityViolation('_form', 'Rate limit exceeded');
          return;
        }
      }

      try {
        // Additional security validation
        const validationResult = await validateWithSecurity(data, schema);
        
        if (!validationResult.success) {
          // Handle validation errors
          Object.entries(validationResult.errors).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach(error => {
                form.setError(field as never, { message: error });
              });
            }
          });
          
          // Record security violations
          validationResult.securityViolations.forEach(violationMsg => {
            recordSecurityViolation('_form', violationMsg);
          });
          
          return;
        }

        // Clear rate limit flag on successful validation
        setIsRateLimited(false);
        
        // Call the original submit handler
        await onSubmit();
        
      } catch (error) {
        recordSecurityViolation('_form', `Submission error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    });
  }, [form, enableRateLimit, rateLimiter, validateWithSecurity, schema, recordSecurityViolation]);

  /**
   * Clears all security violations
   */
  const clearSecurityViolations = useCallback(() => {
    setSecurityViolations([]);
    setIsRateLimited(false);
  }, []);

  /**
   * Gets remaining submission attempts
   * @returns {number} Number of remaining attempts
   */
  const getRemainingAttempts = useCallback(() => {
    if (!enableRateLimit) return Infinity;
    return rateLimiter.getRemainingAttempts('form-submission');
  }, [enableRateLimit, rateLimiter]);

  /**
   * Validates a specific field with security checks
   * @param {string} fieldName - Name of the field to validate
   * @param {unknown} value - Value to validate
   * @returns {Promise<boolean>} True if field is valid and secure
   */
  const validateFieldSecurity = useCallback(async (fieldName: string, value: unknown) => {
    try {
      // Create a partial schema for the specific field
      const fieldSchema = schema.pick({ [fieldName]: true } as never);
      const result = await validateWithSecurity({ [fieldName]: value }, fieldSchema);
      
      if (!result.success) {
        result.securityViolations.forEach(violationMsg => {
          recordSecurityViolation(fieldName, violationMsg);
        });
        return false;
      }
      
      return true;
    } catch (error) {
      recordSecurityViolation(fieldName, `Field validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [schema, validateWithSecurity, recordSecurityViolation]);

  return {
    ...form,
    handleSecureSubmit,
    securityViolations,
    isRateLimited,
    clearSecurityViolations,
    getRemainingAttempts,
    validateFieldSecurity,
    recordSecurityViolation,
  };
};