import type { StepItem, StepWithName } from "@/types/forms"

/**
 * Resolves the target step ID for step operations
 * @param stepItemId - The provided step item ID (may be undefined)
 * @param stepItems - Array of step items from formData
 * @param isAddingNewStep - Whether we're adding a new step (optional, defaults to false)
 * @returns The resolved step ID or undefined if no valid step found
 */

export const resolveTargetStepId = (
  stepItemId: string | undefined,
  stepItems: StepItem[],
  isAddingNewStep: boolean = false
): string | undefined => {
  // If stepItemId is provided, use it directly
  if (stepItemId) {
    return stepItemId;
  }
  
  // If adding a new step, don't use fallback logic
  if (isAddingNewStep) {
    return undefined;
  }
  
  // Fallback to the last step (most recently created)
  if (stepItems.length > 0) {
    return stepItems[stepItems.length - 1].id;
  }
  
  return undefined;
};

/**
 * Determines if we're adding a new step based on the steps array
 * @param steps - Array of steps from the store
 * @returns True if adding a new step, false if editing existing
 */
export const isAddingNewStep = (steps: StepWithName[]): boolean => {
  const dynamicStepScreens = steps.filter(step => 
    step.name === "Dynamic Step Configuration"
  );
  return dynamicStepScreens.length > 1;
};