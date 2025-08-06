import { useMemo } from 'react';
import { useFormStore } from '@/lib/jsr352batchjobstore';

export const useDynamicStepLogic = (stepNumber: number, stepItemId?: string) => {
  const { steps, formData } = useFormStore();

  const stepLogic = useMemo(() => {
    const stepItems = formData.stepItems || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicStepScreens = steps.filter((step: any) => 
      step.name === "Dynamic Step Configuration" || step.component?.name === "DynamicStepsScreen"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentDynamicStepIndex = dynamicStepScreens.findIndex((step: any) => step.id === stepNumber);
    
    const isAddingNewStep = currentDynamicStepIndex > 0;
    
    const sanitizedStepItemId = stepItemId && typeof stepItemId === 'string' && 
      /^[a-zA-Z0-9-_]+$/.test(stepItemId) ? stepItemId : null;
    
    const existingStep = !isAddingNewStep && sanitizedStepItemId ? 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stepItems.find((si: any) => si.id === sanitizedStepItemId) : 
      (!isAddingNewStep && stepItems.length > 0 ? stepItems[stepItems.length - 1] : null);
    
    const isEditing = !isAddingNewStep && !!existingStep;
    const currentId = existingStep ? existingStep.id : crypto.randomUUID();

    return {
      isAddingNewStep,
      existingStep,
      isEditing,
      currentId,
      stepItems
    };
  }, [stepNumber, stepItemId, steps, formData.stepItems]);

  return stepLogic;
};