import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useStepDataUpdate } from "@/hooks/use-step-data-update";

/**
 * Custom hook for step navigation with data persistence
 * Provides consistent back navigation that saves form data before navigating
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useStepNavigation = (stepNumber: number, targetStepId: string | undefined) => {
  const { setCurrentStep, steps } = useFormStore();
  const { updateStepData } = useStepDataUpdate();

  /**
   * Handles standard back navigation (goes to previous step)
   * @param form - React Hook Form instance
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBack = (form: any) => {
    // Save current form data before going back
    const currentData = form.getValues();
    updateStepData(targetStepId, currentData);
    setCurrentStep(stepNumber - 1);
  };

  /**
   * Handles back navigation to main Dynamic Steps screen
   * Used by step listeners to return to step configuration
   * @param form - React Hook Form instance
   * @param dataTransform - Optional function to transform form data before saving
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
  const handleBackToDynamicSteps = (form: any, dataTransform?: (_data: any) => any) => {
    // Save current form data before going back
    const currentData = form.getValues();
    const dataToSave = dataTransform ? dataTransform(currentData) : currentData;
    updateStepData(targetStepId, dataToSave);
    
    // Find the main Dynamic Steps screen
    const mainDynamicStepIndex = steps.findIndex(step => 
      step.name === "Dynamic Steps" && !step.insertedByDynamic
    );
    
    if (mainDynamicStepIndex !== -1) {
      setCurrentStep(mainDynamicStepIndex);
    } else {
      // Fallback to previous step
      setCurrentStep(stepNumber - 1);
    }
  };

  return {
    handleBack,
    handleBackToDynamicSteps
  };
};