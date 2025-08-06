import { useFormStore } from "@/lib/jsr352batchjobstore";

/**
 * Custom hook for updating step data in formData.stepItems
 * Provides a consistent way to update step data across all step screens
 */
export const useStepDataUpdate = () => {
  const { formData, setFormData } = useFormStore();
  const stepItems = formData.stepItems || [];

  /**
   * Updates a specific step with new data
   * @param stepId - The ID of the step to update
   * @param data - The data to merge into the step
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateStepData = (stepId: string | undefined, data: any) => {
    if (!stepId) {
      // eslint-disable-next-line no-console
      console.error('Cannot update step data: stepId is undefined');
      return;
    }

    const updatedStepItems = stepItems.map(si =>
      si.id === stepId ? { ...si, ...data } : si
    );

    setFormData({
      ...formData,
      stepItems: updatedStepItems
    });
  };

  return {
    stepItems,
    updateStepData
  };
};