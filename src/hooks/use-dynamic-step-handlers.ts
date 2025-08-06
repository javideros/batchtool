import { useFormStore } from '@/lib/jsr352batchjobstore';

export const useDynamicStepHandlers = () => {
  const { steps, setCurrentStep, resetForm } = useFormStore();

  const handleUpdateExistingStep = (data: any) => {
    // Update existing step and proceed to next screen
    const { setCurrentStep, currentStep } = useFormStore.getState();
    setCurrentStep(currentStep + 1);
  };

  const handleAddNewStep = (data: any) => {
    const { setDynamicStepData, setFormData, formData } = useFormStore.getState();
    
    // Create the new step
    const newStep = {
      id: crypto.randomUUID(),
      stepName: data.stepName,
      type: data.type,
      addProcessor: data.addProcessor || false
    };
    
    // Add to formData.stepItems for XML generation
    const currentStepItems = formData.stepItems || [];
    setFormData({
      ...formData,
      stepItems: [...currentStepItems, newStep]
    });
    
    // Store current step data for configuration
    setDynamicStepData('currentStep', newStep);
    setDynamicStepData('chunkPhase', 'reader');
    
    // Navigate to configuration screen
    const { setCurrentStep } = useFormStore.getState();
    setCurrentStep(5);
  };

  const handleFinish = () => {
    // Clear dynamic step data and go to Summary
    const { setDynamicStepData } = useFormStore.getState();
    setDynamicStepData('currentStep', null);
    setCurrentStep(6);
  };

  return {
    handleUpdateExistingStep,
    handleAddNewStep,
    handleFinish
  };
};