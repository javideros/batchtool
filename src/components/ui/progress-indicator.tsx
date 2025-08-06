/**
 * @fileoverview Progress indicator component for multi-step workflows
 * @module components/ui/progress-indicator
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFormStore } from "@/lib/jsr352batchjobstore";

interface ProgressStep {
  id: number;
  name: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isAccessible: boolean;
}

interface ProgressIndicatorProps {
  isVisible: boolean;
}

/**
 * Progress indicator component showing workflow completion status
 * @returns {JSX.Element} Progress indicator with steps
 */
export const MobileProgressIndicator = () => {
  const { steps, currentStep, stepItems, dynamicStepsData } = useFormStore();
  
  // Safety checks
  const safeSteps = steps || [];
  const safeStepItems = stepItems || [];
  const safeDynamicStepsData = dynamicStepsData || {};

  const progressSteps: ProgressStep[] = React.useMemo(() => {
    if (!safeSteps || !Array.isArray(safeSteps)) return [];
    const allSteps = [...safeSteps];
    
    if (stepItems.length > 0) {
      const dynamicStepIndex = steps.findIndex(step => step.name === 'Step Definition');
      if (dynamicStepIndex !== -1) {
        allSteps.splice(dynamicStepIndex, 1);
        
        stepItems.forEach((item, index) => {
          const stepName = item.stepName || `Step ${index + 1}`;
          allSteps.splice(dynamicStepIndex + index, 0, {
            id: parseInt(item.id || '0'),
            name: stepName,
            component: null,
            isDynamicStep: true
          });
        });
      }
    }
    
    return allSteps.map((step, index) => {
      let stepName = step.name;
      
      if (step.name.includes('Step') && stepItems.length > 0) {
        const stepItem = stepItems.find(item => item.id === step.id?.toString());
        if (stepItem?.stepName) {
          stepName = stepItem.stepName;
        } else if (dynamicStepsData[step.id?.toString() || '']?.stepName) {
          stepName = dynamicStepsData[step.id?.toString() || ''].stepName;
        }
      }

      return {
        id: step.id,
        name: stepName,
        isCompleted: index < currentStep,
        isCurrent: index === currentStep,
        isAccessible: index <= currentStep,
      };
    });
  }, [steps, currentStep, stepItems, dynamicStepsData]);

  const totalSteps = Math.max(progressSteps.length - 1, 1);
  const completionPercentage = Math.round((currentStep / totalSteps) * 100);

  const getMobileSteps = () => {
    const prevStep = currentStep > 0 ? progressSteps[currentStep - 1] : null;
    const currentStepData = progressSteps[currentStep];
    const nextStep = currentStep < progressSteps.length - 1 ? progressSteps[currentStep + 1] : null;
    
    return { prevStep, currentStepData, nextStep };
  };

  const { prevStep, currentStepData, nextStep } = getMobileSteps();

  return (
    <div className="w-full bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex flex-col items-center">
          {prevStep ? (
            <>
              <div className="w-8 h-8 rounded-full bg-primary border-2 border-primary text-primary-foreground flex items-center justify-center text-xs font-medium mb-2">
                <span aria-hidden="true">✓</span>
              </div>
              <div className="text-xs text-center text-muted-foreground truncate w-full">
                {prevStep.name.length > 12 ? `${prevStep.name.substring(0, 12)}...` : prevStep.name}
              </div>
            </>
          ) : (
            <div className="w-8 h-8 mb-2"></div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center mx-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary text-primary flex items-center justify-center text-sm font-medium mb-2 ring-2 ring-primary/20">
            <span>{currentStep + 1}</span>
          </div>
          <div className="text-sm text-center text-primary font-semibold truncate w-full">
            {currentStepData?.name || 'Loading...'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">In Progress</div>
        </div>

        <div className="flex-1 flex flex-col items-center">
          {nextStep ? (
            <>
              <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/30 text-muted-foreground flex items-center justify-center text-xs font-medium mb-2">
                <span>{currentStep + 2}</span>
              </div>
              <div className="text-xs text-center text-muted-foreground truncate w-full">
                {nextStep.name.length > 12 ? `${nextStep.name.substring(0, 12)}...` : nextStep.name}
              </div>
            </>
          ) : (
            <div className="w-8 h-8 mb-2"></div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="w-full bg-muted rounded-full h-1">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">
          {completionPercentage}% Complete
        </div>
      </div>
    </div>
  );
};

export const ProgressIndicator = ({ isVisible }: ProgressIndicatorProps) => {
  const { steps, currentStep, stepItems, dynamicStepsData } = useFormStore();

  const progressSteps: ProgressStep[] = React.useMemo(() => {
    if (!steps || !Array.isArray(steps)) return [];
    const allSteps = [...steps];
    
    if (stepItems.length > 0) {
      const dynamicStepIndex = steps.findIndex(step => step.name === 'Step Definition');
      if (dynamicStepIndex !== -1) {
        allSteps.splice(dynamicStepIndex, 1);
        
        stepItems.forEach((item, index) => {
          const stepName = item.stepName || `Step ${index + 1}`;
          allSteps.splice(dynamicStepIndex + index, 0, {
            id: parseInt(item.id || '0'),
            name: stepName,
            component: null,
            isDynamicStep: true
          });
        });
      }
    }
    
    return allSteps.map((step, index) => {
      let stepName = step.name;
      
      if (step.name.includes('Step') && stepItems.length > 0) {
        const stepItem = stepItems.find(item => item.id === step.id?.toString());
        if (stepItem?.stepName) {
          stepName = stepItem.stepName;
        } else if (dynamicStepsData[step.id?.toString() || '']?.stepName) {
          stepName = dynamicStepsData[step.id?.toString() || ''].stepName;
        }
      }

      return {
        id: step.id,
        name: stepName,
        isCompleted: index < currentStep,
        isCurrent: index === currentStep,
        isAccessible: index <= currentStep,
      };
    });
  }, [steps, currentStep, stepItems, dynamicStepsData]);

  const totalSteps = Math.max(progressSteps.length - 1, 1);
  const completionPercentage = Math.round((currentStep / totalSteps) * 100);

  if (!isVisible) return null;
  
  return (
    <div className="h-full flex flex-col p-4">
      {/* Progress Header */}
      <div className="flex-shrink-0 pb-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-2">Workflow Progress</h2>
        <div className="text-sm text-muted-foreground">{completionPercentage}% Complete</div>
      </div>

      {/* Scrollable Timeline */}
      <div className="flex-1 overflow-y-auto py-6">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted">
            <div
              className="w-full bg-primary transition-all duration-500 ease-out"
              style={{ height: `${(currentStep / Math.max(progressSteps.length - 1, 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {progressSteps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-3 relative">
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all duration-300 flex-shrink-0 bg-background z-10",
                    step.isCompleted && "bg-primary border-primary text-primary-foreground",
                    step.isCurrent && "bg-primary/10 border-primary text-primary ring-2 ring-primary/20",
                    !step.isCompleted && !step.isCurrent && "border-muted-foreground/30 text-muted-foreground"
                  )}
                  aria-label={`Step ${index + 1}: ${step.name}`}
                >
                  {step.isCompleted ? (
                    <span aria-hidden="true">✓</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0 pt-2">
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors duration-300 leading-tight",
                      step.isCurrent && "text-primary font-semibold",
                      step.isCompleted && "text-foreground",
                      !step.isCompleted && !step.isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.isCompleted && "Completed"}
                    {step.isCurrent && "In Progress"}
                    {!step.isCompleted && !step.isCurrent && "Pending"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};