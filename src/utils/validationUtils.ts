import type { ValidationStepItem } from "@/types/forms"

/**
 * Creates a unique class validator for Zod schemas
 * @param classField - The field name to check for uniqueness (e.g., 'batchletClass', 'readerClass')
 * @param stepItems - Array of step items to check against
 * @param currentStepId - ID of the current step to exclude from uniqueness check
 * @returns Zod refine validator function
 */

export const createUniqueClassValidator = (
  classField: string,
  stepItems: ValidationStepItem[],
  currentStepId: string | undefined
) => {
  return (className: string): boolean => {
    const existingClasses = stepItems
      .filter(si => si.id !== currentStepId)
      .map(si => si[classField])
      .filter(Boolean);
    return !existingClasses.includes(className);
  };
};

/**
 * Creates the error message for unique class validation
 * @param classType - Type of class (e.g., 'Batchlet', 'Reader', 'Processor')
 * @returns Error message string
 */
export const createUniqueClassErrorMessage = (classType: string): string => {
  return `${classType} class name must be unique`;
};