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

const DECIDER_REGEX = /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*Decider)$/;
const DECIDER_ERROR_MSG = "Must be a valid Java package and class name ending with 'Decider', e.g. com.example.MyDecider";

const decisionStepSchema = z.object({
  stepName: z.string()
    .trim()
    .min(1, "Step name required")
    .max(25, "Step name must be 25 characters or less")
    .regex(/^[a-z_]+$/, "Step name must contain only lowercase letters and underscores"),
  deciderClass: z.string()
    .trim()
    .min(1, "Decider class required")
    .regex(DECIDER_REGEX, DECIDER_ERROR_MSG),
  stepProperties: z.array(
    z.object({
      key: z.string().trim().min(1, "Property key required"),
      value: z.string().trim().min(1, "Property value required"),
      type: z.enum(["String", "Number", "Boolean", "Date"]),
    })
  ).optional(),
  transitions: z.array(
    z.object({
      on: z.string().trim().min(1, "Exit status required"),
      action: z.enum(["next", "fail", "stop", "end"]),
      to: z.string().optional(),
      exitStatus: z.string().optional(),
    })
  ).min(1, "At least one transition is required"),
});

interface DecisionStepScreenProps {
  stepNumber: number;
  stepItemId?: string;
}

const DecisionStepScreen: React.FC<DecisionStepScreenProps> = ({ stepNumber, stepItemId }) => {
  const { formData, setCurrentStep, steps } = useFormStore();
  const { stepItems, updateStepData } = useStepDataUpdate();
  
  const targetStepId = resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps));
  
  const item = useMemo(() => {
    return stepItems.find((si: StepItem | DecisionStep | SplitStep | FlowElement) => si.id === targetStepId) || {} as Partial<DecisionStep>;
  }, [stepItems, targetStepId]);

  // Get previous step names for transitions (exclude current step)
  const previousStepNames = useMemo(() => {
    return stepItems
      .filter((step: StepItem | DecisionStep | SplitStep | FlowElement) => step.id !== targetStepId && 'stepName' in step && step.stepName) // Exclude current step
      .map((step: StepItem | DecisionStep | SplitStep | FlowElement) => 'stepName' in step ? step.stepName : '')
      .filter((stepName: string) => Boolean(stepName));
  }, [stepItems, targetStepId]);

  const { form, handlePrevious } = useFormStep({
    schema: decisionStepSchema,
    currentStep: stepNumber,
    defaultValues: {
      stepName: item.stepName || "",
      deciderClass: item.deciderClass || (formData.packageName ? `${formData.packageName}.` : ""),
      stepProperties: item.stepProperties || [],
      transitions: item.transitions && item.transitions.length > 0 ? item.transitions : [
        { on: "TRUE", action: "next", to: "", exitStatus: "" },
        { on: "FALSE", action: "next", to: "", exitStatus: "" }
      ],
    },
  });

  // Reset form when step changes to ensure data isolation
  useEffect(() => {
    const stepTransitions = item.transitions && item.transitions.length > 0 ? item.transitions : [
      { on: "TRUE", action: "next", to: "", exitStatus: "" },
      { on: "FALSE", action: "next", to: "", exitStatus: "" }
    ];
    
    form.reset({
      stepName: item.stepName || "",
      deciderClass: item.deciderClass || (formData.packageName ? `${formData.packageName}.` : ""),
      stepProperties: item.stepProperties || [],
      transitions: stepTransitions
    });
  }, [targetStepId, item, form, formData.packageName]);

  const { fields: propFields, append: appendProp, remove: removeProp } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "stepProperties",
  });

  const { fields: transitionFields, append: appendTransition, remove: removeTransition } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "transitions",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (data: any) => {
    updateStepData(targetStepId, {
      ...item,
      type: 'DECISION',
      stepName: data.stepName,
      deciderClass: data.deciderClass,
      stepProperties: data.stepProperties || [],
      transitions: data.transitions || [],
    });
    
    setCurrentStep(stepNumber + 1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🤔 Decision Step
        </h1>
        <p className="text-muted-foreground">Configure conditional branching logic for your batch job</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Decision Configuration
          </CardTitle>
          <CardDescription>
            Decision steps evaluate conditions and route the job flow based on the result. They use transitions (like regular steps) to determine the next action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              
              {/* What is a Decision Step Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 What is a Decision Step?</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>A <strong>Decision Step</strong> is a special JSR-352 element that evaluates conditions and controls job flow:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Decider Class:</strong> Java class that implements decision logic</li>
                    <li><strong>Transitions:</strong> Routes based on decider's return value (TRUE/FALSE, VALID/INVALID, etc.)</li>
                    <li><strong>No Processing:</strong> Only makes decisions, doesn't process data</li>
                    <li><strong>Conditional Flow:</strong> Enables if/then logic in batch jobs</li>
                  </ul>
                </div>
              </div>

              {/* Step Name and Decider Class */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="stepName"
                  render={({ field, fieldState }) => (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📝 Step Name
                      </label>
                      <p className="text-sm text-gray-500 mb-3">
                        Unique identifier for this decision step
                      </p>
                      <input 
                        {...field} 
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all" 
                        placeholder="data_quality_check"
                      />
                      {fieldState.error && (
                        <p className="text-red-500 text-sm mt-2">
                          ⚠️ {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deciderClass"
                  render={({ field, fieldState }) => (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        🎯 Decider Class
                      </label>
                      <p className="text-sm text-gray-500 mb-3">
                        Java class that implements the decision logic
                      </p>
                      <input 
                        {...field} 
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all" 
                        placeholder={formData.packageName ? `${formData.packageName}.MyDecider` : "com.example.MyDecider"}
                      />
                      {fieldState.error && (
                        <p className="text-red-500 text-sm mt-2">
                          ⚠️ {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
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

              {/* Step Properties */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      ⚙️ Step Properties
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure decision-specific properties (can reference job parameters)
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => appendProp({ key: "", value: "", type: "String" })}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all"
                  >
                    ➕ Add Property
                  </Button>
                </div>
                
                {propFields.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">No step properties defined</p>
                    <p className="text-sm text-gray-400">Properties can reference job parameters like: #&#123;jobParameters['asOfDate']&#125;</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {propFields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <FormField
                            control={form.control}
                            name={`stepProperties.${index}.key`}
                            render={({ field, fieldState }) => (
                              <div>
                                <label className="block text-xs font-medium text-green-700 mb-1">
                                  Property Key
                                </label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-green-300 rounded focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                                  placeholder="propertyName"
                                />
                                {fieldState.error && (
                                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                                )}
                              </div>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`stepProperties.${index}.value`}
                            render={({ field, fieldState }) => (
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-green-700 mb-1">
                                  Property Value
                                </label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-green-300 rounded focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                                  placeholder="value or #&#123;jobParameters['paramName']&#125;"
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
                              onClick={() => removeProp(index)}
                              className="w-full px-3 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              🗑️ Remove
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <FormField
                            control={form.control}
                            name={`stepProperties.${index}.type`}
                            render={({ field }) => (
                              <div>
                                <label className="block text-xs font-medium text-green-700 mb-1">
                                  Property Type
                                </label>
                                <select 
                                  {...field} 
                                  className="w-full p-2 border border-green-300 rounded focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all bg-white"
                                >
                                  <option value="String">String</option>
                                  <option value="Number">Number</option>
                                  <option value="Boolean">Boolean</option>
                                  <option value="Date">Date</option>
                                </select>
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Decision Transitions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      🔄 Decision Transitions
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Define what happens based on the decider's return value (TRUE/FALSE, VALID/INVALID, etc.)
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => appendTransition({ on: "UNKNOWN", action: "fail", to: "", exitStatus: "" })}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
                  >
                    ➕ Add Transition
                  </Button>
                </div>
                
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    📝 <strong>Note:</strong> Decision steps require transitions to route the job flow. Common patterns: TRUE/FALSE, VALID/INVALID, HIGH/LOW.
                  </p>
                </div>
                
                {transitionFields.length > 0 && (
                  <div className="space-y-3">
                    {transitionFields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <FormField
                            control={form.control}
                            name={`transitions.${index}.on`}
                            render={({ field, fieldState }) => (
                              <div>
                                <label className="block text-xs font-medium text-purple-700 mb-1">
                                  Decision Result
                                </label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-purple-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                                  placeholder="TRUE"
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
                              onClick={() => removeTransition(index)}
                              disabled={transitionFields.length === 1}
                              className="w-full px-3 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {transitionFields.length === 1 ? "🔒 Required" : "🗑️ Remove"}
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

export default DecisionStepScreen;