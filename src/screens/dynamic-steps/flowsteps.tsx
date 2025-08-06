import React from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useStepDataUpdate } from "@/hooks/use-step-data-update";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveTargetStepId, isAddingNewStep } from "@/utils/stepUtils";
import { useMemo } from "react";
import type { StepItem, DecisionStep, SplitStep, FlowElement } from "@/types/batch";
import { SummaryScreen } from "../main";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createStepObject = (id: number, name: string, component: any, stepItemId?: string) => ({
  id,
  name,
  component,
  insertedByDynamic: true,
  stepItemId
});

interface FlowStepsScreenProps {
  stepNumber: number;
  stepItemId?: string;
}

const FlowStepsScreen: React.FC<FlowStepsScreenProps> = ({ stepNumber, stepItemId }) => {
  const { setCurrentStep, steps } = useFormStore();
  const { stepItems, updateStepData } = useStepDataUpdate();
  
  const targetStepId = resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps));
  
  const item = useMemo(() => {
    return stepItems.find((si: StepItem | DecisionStep | SplitStep | FlowElement) => si.id === targetStepId) || {} as Partial<FlowElement>;
  }, [stepItems, targetStepId]);

  const flowSteps = item.steps || [];
  
  const handleAddFlowStep = (stepType: string) => {
    const newStepId = crypto.randomUUID();
    const newStep = {
      id: newStepId,
      stepName: `flow_step_${flowSteps.length + 1}`,
      type: stepType === 'batchlet' ? 'A' : stepType === 'decision' ? 'DECISION' : 'B',
      addProcessor: stepType === 'chunk',
      stepProperties: [],
      transitions: [],
      parentFlowId: targetStepId,  // Track parent flow
      parentFlowName: item.flowName || 'Flow Element',  // Track parent flow name
      isFlowStep: true  // Mark as flow step
    };
    
    // Add the new step to the flow
    const updatedSteps = [...flowSteps, newStep];
    updateStepData(targetStepId, {
      ...item,
      steps: updatedSteps,
    });
    
    // Add the step to global stepItems for configuration
    // Note: Global step items will be updated when the dynamic step configuration runs
    
    // Launch dynamic step configuration for this new step
    const { setSteps, setCurrentStep: setGlobalCurrentStep } = useFormStore.getState();
    const currentSteps = useFormStore.getState().steps || [];
    
    // Import DynamicStepsScreen dynamically to avoid circular dependency
    import('../main/dynamicsteps').then(({ default: DynamicStepsScreen }) => {
      const newSteps = [
        ...currentSteps.slice(0, stepNumber + 1),
        createStepObject(stepNumber + 1, `Configure ${stepType} Step (Flow: ${item.flowName})`, DynamicStepsScreen, newStepId),
        createStepObject(stepNumber + 2, `Flow Steps (${item.flowName})`, FlowStepsScreen, targetStepId),
        createStepObject(stepNumber + 3, "Summary", SummaryScreen, targetStepId)
      ];
      
      setSteps(newSteps);
      setGlobalCurrentStep(stepNumber + 1);
    });
  };
  
  const handleRemoveFlowStep = (stepIndex: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedSteps = flowSteps.filter((_: any, index: number) => index !== stepIndex);
    updateStepData(targetStepId, {
      ...item,
      steps: updatedSteps,
    });
  };
  
  const handleContinue = () => {
    setCurrentStep(stepNumber + 1);
  };
  
  const handlePrevious = () => {
    setCurrentStep(stepNumber - 1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Flow Context */}
      <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
        <div className="flex items-center gap-2">
          <span className="text-teal-600">🌊 Configuring Flow:</span>
          <span className="font-bold text-teal-800 text-lg">{item.flowName || 'Flow Element'}</span>
        </div>
        <p className="text-sm text-teal-700 mt-1">
          Steps added here will execute sequentially within this flow
        </p>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🌊 Flow Steps Configuration
        </h1>
        <p className="text-muted-foreground">Configure the steps within "{item.flowName || 'this flow'}"</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Nested Flow Steps
          </CardTitle>
          <CardDescription>
            Define the individual steps that will execute within this flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
              
              {/* What are Nested Flow Steps Info */}
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <h3 className="text-lg font-semibold text-teal-800 mb-2">💡 Nested Flow Steps</h3>
                <div className="text-sm text-teal-700 space-y-2">
                  <p>Configure the individual steps that execute within this flow:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Sequential Execution:</strong> Steps run one after another</li>
                    <li><strong>Step Types:</strong> Batchlet, Chunk, or Decision steps</li>
                    <li><strong>Implementation Classes:</strong> Java classes for each step</li>
                    <li><strong>Flow Reusability:</strong> This flow can be used in multiple places</li>
                  </ul>
                </div>
              </div>

              {/* Add Flow Steps */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      ➕ Add Flow Steps
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Add steps to this flow - each will be fully configured
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Button
                    type="button"
                    onClick={() => handleAddFlowStep('batchlet')}
                    className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all"
                  >
                    🔨 Add Batchlet Step
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleAddFlowStep('chunk')}
                    className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all"
                  >
                    📊 Add Chunk Step
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleAddFlowStep('decision')}
                    className="p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-lg transition-all"
                  >
                    🤔 Add Decision Step
                  </Button>
                </div>
              </div>
              
              {/* Current Flow Steps */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  📋 Current Flow Steps ({flowSteps.length})
                </h4>
                
                {flowSteps.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">No steps configured in this flow</p>
                    <p className="text-sm text-gray-400">Click the buttons above to add and configure steps</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {flowSteps.map((step: any, index: number) => (
                      <div key={step.id} className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-sm font-medium">
                              Step {index + 1}
                            </span>
                            <span className="font-semibold">{step.stepName}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              step.type === 'A' ? 'bg-orange-100 text-orange-800' :
                              step.type === 'B' ? 'bg-blue-100 text-blue-800' :
                              step.type === 'DECISION' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {step.type === 'A' ? '🔨 Batchlet' : 
                               step.type === 'B' ? '📊 Chunk' : 
                               step.type === 'DECISION' ? '🤔 Decision' : step.type}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleRemoveFlowStep(index)}
                            className="px-3 py-1 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors text-sm"
                          >
                            🗑️ Remove
                          </Button>
                        </div>
                        
                        {/* Show configured classes */}
                        <div className="mt-2 text-sm text-gray-600">
                          {step.batchletClass && <div>Batchlet: {step.batchletClass}</div>}
                          {step.deciderClass && <div>Decider: {step.deciderClass}</div>}
                          {step.readerClass && <div>Reader: {step.readerClass}</div>}
                          {step.processorClass && <div>Processor: {step.processorClass}</div>}
                          {step.writerClass && <div>Writer: {step.writerClass}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Flow Execution Preview */}
              {flowSteps.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">🔍 Flow Execution Order:</h4>
                  <div className="text-sm text-gray-700">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {flowSteps.map((step: any, index: number) => (
                      <div key={step.id} className="flex items-center gap-2 mb-1">
                        <span className="text-gray-500">{index + 1}.</span>
                        <span className="font-medium">{step.stepName}</span>
                        <span className="text-gray-500">→</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {step.type === 'A' ? 'batchlet' : step.type === 'B' ? 'chunk' : 'decision'}
                        </span>
                        {index < flowSteps.length - 1 && <span className="text-gray-400 ml-2">then</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                <Button 
                  type="button" 
                  onClick={handlePrevious}
                  className="w-full sm:w-auto "
                  variant="outline"
                >
                  ← Back
                </Button>
                <Button 
                  type="button"
                  onClick={handleContinue}
                  variant="outline"
                  className="w-full sm:w-auto "
                >
                  Next →
                </Button>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlowStepsScreen;