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

const stepTransitionsSchema = z.object({
  transitions: z.array(
    z.object({
      on: z.string().trim().min(1, "Exit status required"),
      action: z.enum(["next", "fail", "stop", "end"]),
      to: z.string().optional(),
      exitStatus: z.string().optional(),
    })
  ).min(1, "At least one transition is required"),
});

interface StepTransitionsScreenProps {
  stepNumber: number;
  stepItemId?: string;
}

const StepTransitionsScreen: React.FC<StepTransitionsScreenProps> = ({ stepNumber, stepItemId }) => {
  const { setCurrentStep, steps } = useFormStore();
  const { stepItems, updateStepData } = useStepDataUpdate();
  
  const targetStepId = resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps));
  
  const item = useMemo(() => {
    return stepItems.find((si: StepItem | DecisionStep | SplitStep | FlowElement) => si.id === targetStepId) || {} as Partial<StepItem>;
  }, [stepItems, targetStepId]);

  const { form, handlePrevious } = useFormStep({
    schema: stepTransitionsSchema,
    currentStep: stepNumber,
    defaultValues: {
      transitions: item.transitions && item.transitions.length > 0 ? item.transitions : [
        { on: "COMPLETED", action: "end", to: "", exitStatus: "" }
      ],
    },
  });

  // Reset form when step changes to ensure data isolation
  useEffect(() => {
    const stepTransitions = item.transitions && item.transitions.length > 0 ? item.transitions : [
      { on: "COMPLETED", action: "end", to: "", exitStatus: "" }
    ];
    
    form.reset({
      transitions: stepTransitions
    });
  }, [targetStepId, item.transitions, form]);

  const { fields, append, remove } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "transitions",
  });

  // Get previous step names for transitions (exclude current step)
  const previousStepNames = useMemo(() => {
    return stepItems
      .filter((step: StepItem | DecisionStep | SplitStep | FlowElement) => step.id !== targetStepId && 'stepName' in step && step.stepName) // Exclude current step
      .map((step: StepItem | DecisionStep | SplitStep | FlowElement) => 'stepName' in step ? step.stepName : '')
      .filter((stepName: string) => Boolean(stepName));
  }, [stepItems, targetStepId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (data: any) => {
    updateStepData(targetStepId, {
      ...item,
      transitions: data.transitions || [],
    });
    
    setCurrentStep(stepNumber + 1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🔄 Step Transitions
        </h1>
        <p className="text-muted-foreground">Define step flow control and conditional logic</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Transition Configuration
          </CardTitle>
          <CardDescription>
            Configure what happens when the step completes with different exit statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              {/* Current Step Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Current Step</h3>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-blue-700">Step Name:</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">{item.stepName || 'Unnamed Step'}</span>
                  <span className="text-sm text-blue-600">
                    ({item.type === 'A' ? 'Batchlet' : item.type === 'B' ? 'Chunk' : 'Chunk with Partition'})
                  </span>
                </div>
              </div>

              {/* Available Steps Info */}
              {previousStepNames.length > 0 ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-sm font-semibold text-green-800 mb-2">📝 Previous Steps Available for Transitions:</h3>
                  <div className="flex flex-wrap gap-2">
                    {previousStepNames.map((stepName: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                        {stepName}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="text-sm font-semibold text-orange-800 mb-2">📝 No Previous Steps Available</h3>
                  <p className="text-sm text-orange-700">
                    This is the first step in your job. You can only use "end", "fail", or "stop" actions.
                  </p>
                </div>
              )}

              {/* Step Transitions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      🔄 Step Transitions
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Define what happens when the step completes with different exit statuses
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => append({ on: "COMPLETED", action: "end", to: "", exitStatus: "" })}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
                  >
                    ➕ Add Transition
                  </Button>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    📝 <strong>Note:</strong> At least one transition is required. The default "COMPLETED → end" transition is recommended for most steps.
                  </p>
                </div>
                
                {fields.length > 0 && (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <FormField
                            control={form.control}
                            name={`transitions.${index}.on`}
                            render={({ field, fieldState }) => (
                              <div>
                                <label className="block text-xs font-medium text-purple-700 mb-1">
                                  Exit Status
                                </label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-purple-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                                  placeholder="COMPLETED"
                                />
                                {fieldState.error && (
                                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                                )}
                              </div>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`transitions.${index}.action`}
                            render={({ field }) => (
                              <div>
                                <label className="block text-xs font-medium text-purple-700 mb-1">
                                  Action
                                </label>
                                <select 
                                  {...field} 
                                  className="w-full p-2 border border-purple-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all bg-white"
                                >
                                  <option value="next">Next Step</option>
                                  <option value="end">End Job</option>
                                  <option value="fail">Fail Job</option>
                                  <option value="stop">Stop Job</option>
                                </select>
                              </div>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`transitions.${index}.to`}
                            render={({ field }) => (
                              <div>
                                <label className="block text-xs font-medium text-purple-700 mb-1">
                                  Target Step Name
                                </label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-purple-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                                  placeholder="nextStepName"
                                  disabled={form.watch(`transitions.${index}.action`) !== "next"}
                                />
                              </div>
                            )}
                          />
                          
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                              className="w-full px-3 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {fields.length === 1 ? "🔒 Required" : "🗑️ Remove"}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <FormField
                            control={form.control}
                            name={`transitions.${index}.exitStatus`}
                            render={({ field }) => (
                              <div>
                                <label className="block text-xs font-medium text-purple-700 mb-1">
                                  Custom Exit Status (Optional)
                                </label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-purple-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                                  placeholder="CUSTOM_STATUS"
                                />
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Form validation errors */}
                {form.formState.errors.transitions && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-700 text-sm flex items-center">
                      ⚠️ {form.formState.errors.transitions.message}
                    </p>
                  </div>
                )}
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

export default StepTransitionsScreen;