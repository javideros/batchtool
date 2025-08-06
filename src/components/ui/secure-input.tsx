/**
 * @fileoverview Secure input component with built-in sanitization and validation
 * @module components/ui/secure-input
 */

import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { sanitizeText } from "@/utils/security";
import { createSecureFieldValidator } from "@/utils/enhanced-validation";

export interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field name for security validation */
  fieldName?: string;
  /** Enable automatic sanitization */
  autoSanitize?: boolean;
  /** Maximum length allowed */
  maxLength?: number;
  /** Callback for security violations */
  onSecurityViolation?: () => void;
}

/**
 * Secure input component with automatic sanitization and XSS prevention
 * @param {SecureInputProps} props - Component props
 * @returns {JSX.Element} Secure input element
 */
export const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  ({ 
    className, 
    type = "text",
    fieldName = "input",
    autoSanitize = true,
    maxLength,
    onSecurityViolation,
    onChange,
    onBlur,
    ...props 
  }, ref) => {
    const [hasSecurityViolation, setHasSecurityViolation] = React.useState(false);
    const validator = React.useMemo(() => createSecureFieldValidator(fieldName), [fieldName]);

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;
      
      // Apply length limit
      if (maxLength && inputValue.length > maxLength) {
        inputValue = inputValue.substring(0, maxLength);
      }
      
      // Validate for security violations
      const validationResult = validator(inputValue);
      const hasViolation = validationResult !== true;
      
      setHasSecurityViolation(hasViolation);
      
      if (hasViolation && onSecurityViolation) {
        onSecurityViolation();
      }
      
      // Apply sanitization if enabled and no violations
      if (autoSanitize && !hasViolation) {
        inputValue = sanitizeText(inputValue);
      }
      
      // Update the input value
      e.target.value = inputValue;
      
      if (onChange) {
        onChange(e);
      }
    }, [maxLength, validator, autoSanitize, onSecurityViolation, onChange]);

    const handleBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      // Final sanitization on blur
      if (autoSanitize) {
        const sanitized = sanitizeText(e.target.value);
        if (sanitized !== e.target.value) {
          e.target.value = sanitized;
          // Trigger change event to update form state
          const changeEvent = new Event('change', { bubbles: true });
          e.target.dispatchEvent(changeEvent);
        }
      }
      
      if (onBlur) {
        onBlur(e);
      }
    }, [autoSanitize, onBlur]);

    return (
      <Input
        type={type}
        className={cn(
          "transition-colors duration-200",
          hasSecurityViolation && "border-destructive focus-visible:ring-destructive/20 dark:border-destructive dark:focus-visible:ring-destructive/30",
          "dark:bg-input dark:border-input dark:text-foreground",
          "dark:placeholder:text-muted-foreground",
          "dark:focus-visible:ring-ring dark:focus-visible:ring-offset-background",
          className
        )}
        ref={ref}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={maxLength}
        data-security-violation={hasSecurityViolation}
        {...props}
      />
    );
  }
);

SecureInput.displayName = "SecureInput";