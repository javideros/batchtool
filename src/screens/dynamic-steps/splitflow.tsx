import React from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { useStepDataUpdate } from "@/hooks/use-step-data-update";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveTargetStepId, isAddingNewStep } from "@/utils/stepUtils";
import { useFieldArray } from "react-hook-form";
import { useMemo, useEffect } from "react";
import type { StepItem, DecisionStep, SplitStep, FlowElement } from "@/types/batch";
import z from "zod";

const splitFlowSchema = z.object({
  stepName: z.string()
    .trim()
    .min(1, "Step name required")
    .max(25, "Step name must be 25 characters or less")
    .regex(/^[a-z_]+$/, "Step name must contain only lowercase letters and underscores"),
  flows: z.array(
    z.object({
      flowName: z.string()
        .trim()
        .min(1, "Flow name required")
        .regex(/^[a-z_]+$/, "Flow name must contain only lowercase letters and underscores"),
      description: z.string().min(1, "Flow description required"),
    })
  ).min(2, "At least 2 parallel flows are required"),
  nextStep: z.string().optional(),
});

interface SplitFlowScreenProps {
  stepNumber: number;
  stepItemId?: string;
}

const SplitFlowScreen: React.FC<SplitFlowScreenProps> = ({ stepNumber, stepItemId }) => {
  const { setCurrentStep, steps } = useFormStore();
  const { stepItems, updateStepData } = useStepDataUpdate();
  
  const targetStepId = resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps));
  
  const item = useMemo(() => {
    return stepItems.find((si: StepItem | DecisionStep | SplitStep | FlowElement) => si.id === targetStepId) || {} as Partial<SplitStep>;
  }, [stepItems, targetStepId]);

  // Get previous step names for next step reference
  const previousStepNames = useMemo(() => {
    return stepItems
      .filter((step: StepItem | DecisionStep | SplitStep | FlowElement) => step.id !== targetStepId && 'stepName' in step && step.stepName)
      .map((step: StepItem | DecisionStep | SplitStep | FlowElement) => 'stepName' in step ? step.stepName : '')
      .filter((stepName: string) => Boolean(stepName));
  }, [stepItems, targetStepId]);

  const { form, handlePrevious } = useFormStep({
    schema: splitFlowSchema,
    currentStep: stepNumber,
    defaultValues: {
      stepName: item.stepName || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      flows: item.flows && item.flows.length > 0 ? item.flows.map((flow: any) => ({
        flowName: flow.flowName,
        description: flow.description || ""
      })) : [
        { flowName: "customer_flow", description: "Process customer data" },
        { flowName: "order_flow", description: "Process order data" }
      ],
      nextStep: item.nextStep || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "flows",
  });

  // Reset form when step changes to ensure data isolation
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultFlows = item.flows && item.flows.length > 0 ? item.flows.map((flow: any) => ({
      flowName: flow.flowName,
      description: flow.description || ""
    })) : [
      { flowName: "customer_flow", description: "Process customer data" },
      { flowName: "order_flow", description: "Process order data" }
    ];
    
    form.reset({
      stepName: item.stepName || "",
      flows: defaultFlows,
      nextStep: item.nextStep || "",
    });
  }, [targetStepId, item, form]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (data: any) => {
    updateStepData(targetStepId, {
      ...item,
      type: 'SPLIT',
      stepName: data.stepName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      flows: data.flows.map((flow: any) => ({
        id: crypto.randomUUID(),
        flowName: flow.flowName,
        description: flow.description,
        steps: [] // Will be populated when configuring individual flows
      })),
      nextStep: data.nextStep,
    });
    
    setCurrentStep(stepNumber + 1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🔄 Split/Parallel Flows
        </h1>
        <p className="text-muted-foreground">Configure parallel processing flows for your batch job</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Split Configuration
          </CardTitle>
          <CardDescription>
            Split steps enable parallel execution of multiple flows. Each flow runs independently and can contain multiple steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              
              {/* What is a Split Step Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 What is a Split Step?</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>A <strong>Split Step</strong> enables parallel execution of multiple flows:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Parallel Processing:</strong> Multiple flows execute simultaneously</li>
                    <li><strong>Independent Flows:</strong> Each flow can have different steps and logic</li>
                    <li><strong>Performance:</strong> Reduces total execution time for large jobs</li>
                    <li><strong>Synchronization:</strong> Job waits for all flows to complete</li>
                  </ul>
                </div>
              </div>

              {/* Step Name */}
              <FormField
                control={form.control}
                name="stepName"
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📝 Split Step Name
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Unique identifier for this split step
                    </p>
                    <input 
                      {...field} 
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all" 
                      placeholder="parallel_processing"
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-2">
                        ⚠️ {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Parallel Flows */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      🌊 Parallel Flows
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Define the flows that will execute in parallel
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => append({ flowName: "", description: "" })}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-medium rounded-lg transition-all"
                  >
                    ➕ Add Flow
                  </Button>
                </div>
                
                <div className="mb-4 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="text-sm text-cyan-700">
                    📝 <strong>Note:</strong> Each flow will execute in parallel. You'll configure the individual steps for each flow in the next screens.
                  </p>
                </div>
                
                {fields.length > 0 && (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`flows.${index}.flowName`}
                            render={({ field, fieldState }) => (
                              <div>
                                <label className="block text-xs font-medium text-cyan-700 mb-1">
                                  Flow Name
                                </label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-cyan-300 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 transition-all"
                                  placeholder="customer_flow"
                                />
                                {fieldState.error && (
                                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                                )}
                              </div>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`flows.${index}.description`}
                            render={({ field, fieldState }) => (
                              <div>
                                <label className="block text-xs font-medium text-cyan-700 mb-1">
                                  Description
                                </label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-cyan-300 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 transition-all"
                                  placeholder="Process customer data"
                                />
                                {fieldState.error && (
                                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                                )}
                              </div>
                            )}
                          />
                          
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => remove(index)}
                              disabled={fields.length <= 2}
                              className="w-full px-3 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {fields.length <= 2 ? "🔒 Min 2" : "🗑️ Remove"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Form validation errors */}
                {form.formState.errors.flows && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-700 text-sm flex items-center">
                      ⚠️ {form.formState.errors.flows.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Next Step After Split */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  ➡️ After Split Completion
                </h4>
                
                {previousStepNames.length > 0 ? (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <h5 className="text-sm font-semibold text-green-800 mb-2">📝 Available Steps:</h5>
                    <div className="flex flex-wrap gap-2">
                      {previousStepNames.map((stepName: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                          {stepName}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-700">
                      No previous steps available. The split will end the job when all flows complete.
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="nextStep"
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Next Step (Optional)
                      </label>
                      <p className="text-sm text-gray-500 mb-3">
                        Step to execute after all parallel flows complete
                      </p>
                      <input
                        {...field}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                        placeholder="Leave empty to end job"
                      />
                    </div>
                  )}
                />
              </div>
              
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
                  type="submit"
                  variant="outline"
                  className="w-full sm:w-auto "
                >
                  Next →
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SplitFlowScreen;