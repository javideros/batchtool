import React, { useMemo, useCallback } from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { useStepDataUpdate } from "@/hooks/use-step-data-update";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveTargetStepId, isAddingNewStep } from "@/utils/stepUtils";
import { createUniqueClassValidator, createUniqueClassErrorMessage } from "@/utils/validationUtils";
import { useFieldArray } from "react-hook-form";
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
  const currentStepData = dynamicStepsData.currentStep;
  const targetStepId = useMemo(() => currentStepData?.id || resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps)), [currentStepData, stepItemId, stepItems, steps]);
  
  const item = useMemo(() => findStepItem(stepItems, targetStepId), [stepItems, targetStepId]);
  const processorSchema = useMemo(() => createProcessorSchema(stepItems, targetStepId), [stepItems, targetStepId]);

  const { form, handlePrevious } = useFormStep({
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
        <h1 className="text-3xl font-bold text-foreground mb-2">
          ⚙️ Chunk Processor
        </h1>
        <p className="text-muted-foreground">Configure your chunk processor implementation</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔄 Processor Configuration
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
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📝 Processor Class
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Enter the fully qualified Java class name for your chunk processor
                    </p>
                    <input 
                      {...field} 
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all" 
                      placeholder={formData.packageName ? `${formData.packageName}.MyProcessor` : "com.example.MyProcessor"}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-2">
                        ⚠️ {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              
              {/* Skip Exception Classes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      ⚡ Skip Exception Classes
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Exception classes that should be skipped during processing
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAppendSkip}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-lg transition-all"
                  >
                    ➕ Add Skip Exception
                  </Button>
                </div>
                
                {skipFields.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                    No skip exceptions defined. Click Add Skip Exception to add exception classes to skip.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {skipFields.map((exceptionField, index) => (
                      <div key={exceptionField.id} className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`skipExceptionClasses.${index}`}
                            render={({ field, fieldState }) => (
                              <div>
                                <label className="block text-xs font-medium text-yellow-700 mb-1">
                                  Skip Exception Class {index + 1}
                                </label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-yellow-300 rounded focus:border-yellow-500 focus:ring-1 focus:ring-yellow-200 transition-all"
                                  placeholder={formData.packageName ? `${formData.packageName}.MyException` : "com.example.MyException"}
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
                          onClick={() => removeSkip(index)}
                          className="px-3 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          🗑️ Remove
                        </Button>
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
                    <h4 className="text-lg font-semibold text-gray-800">
                      🔄 Retry Exception Classes
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Exception classes that should trigger a retry during processing
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAppendRetry}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all"
                  >
                    ➕ Add Retry Exception
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
                    <h4 className="text-lg font-semibold text-gray-800">
                      🚫 No-Rollback Exception Classes
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Exception classes that should not trigger transaction rollback
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => appendNoRollback("")}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
                  >
                    ➕ Add No-Rollback Exception
                  </Button>
                </div>
                
                {noRollbackFields.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                    No no-rollback exceptions defined. Click Add No-Rollback Exception to add exception classes that won't trigger rollback.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {noRollbackFields.map((exceptionField, index) => (
                      <div key={exceptionField.id} className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`noRollbackExceptionClasses.${index}`}
                            render={({ field, fieldState }) => (
                              <div>
                                <label className="block text-xs font-medium text-purple-700 mb-1">
                                  No-Rollback Exception Class {index + 1}
                                </label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-purple-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                                  placeholder="com.example.NonTransactionalException"
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
                          onClick={() => removeNoRollback(index)}
                          className="px-3 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          🗑️ Remove
                        </Button>
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
                    <h4 className="text-lg font-semibold text-gray-800">
                      ⚙️ Step Properties
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure processor-specific properties (can reference job parameters)
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAppendProp}
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
                <Button type="submit" variant="outline" className="w-full sm:w-auto ">
                  Next →
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