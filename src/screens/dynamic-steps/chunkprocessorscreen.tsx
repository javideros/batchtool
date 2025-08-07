import React, { useMemo, useCallback } from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { useStepDataUpdate } from "@/hooks/use-step-data-update";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveTargetStepId, isAddingNewStep } from "@/utils/stepUtils";
import { createUniqueClassValidator, createUniqueClassErrorMessage } from "@/utils/validationUtils";
import { useFieldArray } from "react-hook-form";
import { Settings, Code, AlertTriangle, RotateCcw, Ban, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import z from "zod";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findStepItem = (stepItems: any[], stepItemId?: string) => {
  if (!stepItemId || typeof stepItemId !== 'string' || stepItemId.trim() === '' || 
      !/^[a-zA-Z0-9-_]+$/.test(stepItemId)) {
    return {};
  }
  const sanitizedId = stepItemId.trim();
  return stepItems.find(si => si && typeof si.id === 'string' && si.id === sanitizedId) || {};
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createProcessorSchema = (stepItems: any[], targetStepId?: string) => z.object({
  processorClass: z.string()
    .trim()
    .min(1, "Processor class required")
    .regex(
      /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*Processor)$/,
      "Must be a valid Java package and class name ending with 'Processor', e.g. com.example.MyProcessor"
    )
    .refine(
      createUniqueClassValidator('processorClass', stepItems, targetStepId),
      { message: createUniqueClassErrorMessage('Processor') }
    ),
  skipExceptionClasses: z.array(
    z.string()
      .trim()
      .min(1, "Exception class name required")
      .regex(
        /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*)$/,
        "Must be a valid Java package and class name, e.g. com.example.MyException"
      )
  ).optional(),
  skipExcludeClasses: z.array(
    z.string()
      .trim()
      .min(1, "Exception class name required")
      .regex(
        /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*)$/,
        "Must be a valid Java package and class name, e.g. com.example.MyException"
      )
  ).optional(),
  retryExceptionClasses: z.array(
    z.string()
      .trim()
      .min(1, "Exception class name required")
      .regex(
        /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*)$/,
        "Must be a valid Java package and class name, e.g. com.example.MyException"
      )
  ).optional(),
  retryExcludeClasses: z.array(
    z.string()
      .trim()
      .min(1, "Exception class name required")
      .regex(
        /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*)$/,
        "Must be a valid Java package and class name, e.g. com.example.MyException"
      )
  ).optional(),
  noRollbackExceptionClasses: z.array(
    z.string()
      .trim()
      .min(1, "Exception class name required")
      .regex(
        /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*)$/,
        "Must be a valid Java package and class name, e.g. com.example.MyException"
      )
  ).optional(),
  retryLimit: z.number().min(1, "Retry limit must be at least 1").max(10, "Retry limit cannot exceed 10").optional(),
  skipLimit: z.number().min(1, "Skip limit must be at least 1").max(100, "Skip limit cannot exceed 100").optional(),
  stepProperties: z.array(
    z.object({
      key: z.string().trim().min(1, "Property key required"),
      value: z.string().trim().min(1, "Property value required"),
      type: z.enum(["String", "Number", "Boolean", "Date"]),
    })
  ).optional()
});

interface ChunkProcessorScreenProps {
  stepNumber: number;
  stepItemId?: string;
}

const ChunkProcessorScreen: React.FC<ChunkProcessorScreenProps> = React.memo(({ stepNumber, stepItemId }) => {
  const { formData, setCurrentStep, steps } = useFormStore();
  const { stepItems, updateStepData } = useStepDataUpdate();
  const { dynamicStepsData } = useFormStore();
  const currentStepData = dynamicStepsData?.currentStep;
  const targetStepId = useMemo(() => currentStepData?.id || resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps)), [currentStepData, stepItemId, stepItems, steps]);
  
  const item = useMemo(() => findStepItem(stepItems, targetStepId), [stepItems, targetStepId]);
  const processorSchema = useMemo(() => createProcessorSchema(stepItems, targetStepId), [stepItems, targetStepId]);

  const { form } = useFormStep({
    schema: processorSchema,
    currentStep: stepNumber,
    defaultValues: {
      processorClass: item.processorClass || (formData.packageName ? `${formData.packageName}.` : ""),
      skipExceptionClasses: item.skipExceptionClasses || [],
      skipExcludeClasses: item.skipExcludeClasses || [],
      retryExceptionClasses: item.retryExceptionClasses || [],
      retryExcludeClasses: item.retryExcludeClasses || [],
      noRollbackExceptionClasses: item.noRollbackExceptionClasses || [],
      retryLimit: item.retryLimit || 3,
      skipLimit: item.skipLimit || 10,
      stepProperties: item.stepProperties || []
    },
  });

  const { fields: skipFields, append: appendSkip, remove: removeSkip } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "skipExceptionClasses",
  });

  const { fields: retryFields, append: appendRetry, remove: removeRetry } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "retryExceptionClasses",
  });

  const { fields: skipExcludeFields, append: appendSkipExclude, remove: removeSkipExclude } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "skipExcludeClasses",
  });

  const { fields: retryExcludeFields, append: appendRetryExclude, remove: removeRetryExclude } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "retryExcludeClasses",
  });

  const { fields: noRollbackFields, append: appendNoRollback, remove: removeNoRollback } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "noRollbackExceptionClasses",
  });

  const { fields: propFields, append: appendProp, remove: removeProp } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "stepProperties",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = useCallback((data: any) => {
    updateStepData(targetStepId, data);
    
    // Go to writer phase
    const { setDynamicStepData } = useFormStore.getState();
    setDynamicStepData('chunkPhase', 'writer');
  }, [targetStepId, updateStepData]);

  // Memoized handlers for better performance
  const handleAppendSkip = useCallback(() => appendSkip(""), [appendSkip]);
  const handleAppendRetry = useCallback(() => appendRetry(""), [appendRetry]);
  const handleAppendProp = useCallback(() => appendProp({ key: "", value: "", type: "String" }), [appendProp]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Chunk Processor
        </h1>
        <p className="text-muted-foreground">Configure your chunk processor implementation</p>
      </div>
      
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Processor Configuration
          </CardTitle>
          <CardDescription>
            Configure your chunk processor implementation details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="processorClass"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Processor Class
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={formData.packageName ? `${formData.packageName}.MyProcessor` : "com.example.MyProcessor"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Skip Exception Classes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Skip Exception Classes
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Exception classes that should be skipped during processing
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAppendSkip}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Skip Exception
                  </Button>
                </div>
                
                {skipFields.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-2">No skip exceptions defined</p>
                    <p className="text-sm text-muted-foreground">Click Add Skip Exception to add exception classes to skip</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {skipFields.map((exceptionField, index) => (
                      <div key={exceptionField.id} className="p-4 bg-muted/50 rounded-lg border">
                        <FormField
                          control={form.control}
                          name={`skipExceptionClasses.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Skip Exception Class {index + 1}
                              </FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder={formData.packageName ? `${formData.packageName}.MyException` : "com.example.MyException"}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeSkip(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skip Exclude Classes */}
              {skipFields.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        ❌ Skip Exclude Classes
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Exception classes to exclude from skipping (will cause job failure)
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => appendSkipExclude("")}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all"
                    >
                      ➕ Add Skip Exclude
                    </Button>
                  </div>
                  
                  {skipExcludeFields.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                      No skip exclude exceptions defined.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {skipExcludeFields.map((exceptionField, index) => (
                        <div key={exceptionField.id} className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex-1">
                            <FormField
                              control={form.control}
                              name={`skipExcludeClasses.${index}`}
                              render={({ field, fieldState }) => (
                                <div>
                                  <label className="block text-xs font-medium text-red-700 mb-1">
                                    Skip Exclude Exception {index + 1}
                                  </label>
                                  <input
                                    {...field}
                                    className="w-full p-2 border border-red-300 rounded focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all"
                                    placeholder="java.lang.RuntimeException"
                                  />
                                  {fieldState.error && (
                                    <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeSkipExclude(index)}
                            className="px-3 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            🗑️ Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Retry Exception Classes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <RotateCcw className="h-5 w-5" />
                      Retry Exception Classes
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Exception classes that should trigger a retry during processing
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAppendRetry}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Retry Exception
                  </Button>
                </div>
                
                {retryFields.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                    No retry exceptions defined. Click Add Retry Exception to add exception classes to retry.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {retryFields.map((exceptionField, index) => (
                      <div key={exceptionField.id} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`retryExceptionClasses.${index}`}
                            render={({ field, fieldState }) => (
                              <div>
                                <label className="block text-xs font-medium text-blue-700 mb-1">
                                  Retry Exception Class {index + 1}
                                </label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
                                  placeholder={formData.packageName ? `${formData.packageName}.RetryableException` : "com.example.RetryableException"}
                                />
                                {fieldState.error && (
                                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeRetry(index)}
                          className="px-3 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          🗑️ Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Retry Exclude Classes */}
              {retryFields.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        ❌ Retry Exclude Classes
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Exception classes to exclude from retrying (will cause job failure)
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => appendRetryExclude("")}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all"
                    >
                      ➕ Add Retry Exclude
                    </Button>
                  </div>
                  
                  {retryExcludeFields.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                      No retry exclude exceptions defined.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {retryExcludeFields.map((exceptionField, index) => (
                        <div key={exceptionField.id} className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex-1">
                            <FormField
                              control={form.control}
                              name={`retryExcludeClasses.${index}`}
                              render={({ field, fieldState }) => (
                                <div>
                                  <label className="block text-xs font-medium text-red-700 mb-1">
                                    Retry Exclude Exception {index + 1}
                                  </label>
                                  <input
                                    {...field}
                                    className="w-full p-2 border border-red-300 rounded focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all"
                                    placeholder="java.lang.OutOfMemoryError"
                                  />
                                  {fieldState.error && (
                                    <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeRetryExclude(index)}
                            className="px-3 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            🗑️ Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* No-Rollback Exception Classes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Ban className="h-5 w-5" />
                      No-Rollback Exception Classes
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Exception classes that should not trigger transaction rollback
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => appendNoRollback("")}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add No-Rollback Exception
                  </Button>
                </div>
                
                {noRollbackFields.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-2">No no-rollback exceptions defined</p>
                    <p className="text-sm text-muted-foreground">Click Add No-Rollback Exception to add exception classes that won't trigger rollback</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {noRollbackFields.map((exceptionField, index) => (
                      <div key={exceptionField.id} className="p-4 bg-muted/50 rounded-lg border">
                        <FormField
                          control={form.control}
                          name={`noRollbackExceptionClasses.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                No-Rollback Exception Class {index + 1}
                              </FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="com.example.NonTransactionalException"
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeNoRollback(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Limits Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skip Limit */}
                {skipFields.length > 0 && (
                  <FormField
                    control={form.control}
                    name="skipLimit"
                    render={({ field, fieldState }) => (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          ⚡ Skip Limit
                        </label>
                        <p className="text-sm text-gray-500 mb-3">
                          Maximum number of items to skip (1-100)
                        </p>
                        <input 
                          {...field} 
                          type="number"
                          min="1"
                          max="100"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all" 
                          placeholder="10"
                        />
                        {fieldState.error && (
                          <p className="text-red-500 text-sm mt-2">
                            ⚠️ {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                )}

                {/* Retry Limit */}
                {retryFields.length > 0 && (
                  <FormField
                    control={form.control}
                    name="retryLimit"
                    render={({ field, fieldState }) => (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          🔄 Retry Limit
                        </label>
                        <p className="text-sm text-gray-500 mb-3">
                          Maximum number of retry attempts (1-10)
                        </p>
                        <input 
                          {...field} 
                          type="number"
                          min="1"
                          max="10"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                          placeholder="3"
                        />
                        {fieldState.error && (
                          <p className="text-red-500 text-sm mt-2">
                            ⚠️ {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                )}
              </div>

              {/* Step Properties Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Step Properties
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure processor-specific properties (can reference job parameters)
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAppendProp}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Property
                  </Button>
                </div>
                
                {propFields.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-2">No step properties defined</p>
                    <p className="text-sm text-muted-foreground">Properties can reference job parameters like: #&#123;jobParameters['asOfDate']&#125;</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {propFields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-muted/50 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name={`stepProperties.${index}.key`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Property Key
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="propertyName"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`stepProperties.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-xs">
                                  Property Value
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="value or #&#123;jobParameters['paramName']&#125;"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => removeProp(index)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <FormField
                            control={form.control}
                            name={`stepProperties.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Property Type
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="String">String</SelectItem>
                                    <SelectItem value="Number">Number</SelectItem>
                                    <SelectItem value="Boolean">Boolean</SelectItem>
                                    <SelectItem value="Date">Date</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                <Button 
                  type="button" 
                  onClick={() => {
                    const { setDynamicStepData } = useFormStore.getState();
                    setDynamicStepData('chunkPhase', 'reader');
                  }}
                  className="w-full sm:w-auto gap-2"
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" variant="outline" className="w-full sm:w-auto gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
});

ChunkProcessorScreen.displayName = 'ChunkProcessorScreen';

export default ChunkProcessorScreen;