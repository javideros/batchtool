import React from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { useStepDataUpdate } from "@/hooks/use-step-data-update";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveTargetStepId, isAddingNewStep } from "@/utils/stepUtils";
import { createUniqueClassValidator, createUniqueClassErrorMessage } from "@/utils/validationUtils";
import { useFieldArray } from "react-hook-form";
import { useMemo } from "react";
import type { StepItem, DecisionStep, SplitStep, FlowElement } from "@/types/batch";
import z from "zod";

const PARTITIONER_REGEX = /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*Partitioner)$/;
const PARTITIONER_ERROR_MSG = "Must be a valid Java package and class name ending with 'Partitioner', e.g. com.example.MyPartitioner";

const MAPPER_REGEX = /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*Mapper)$/;
const COLLECTOR_REGEX = /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*Collector)$/;
const ANALYZER_REGEX = /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*Analyzer)$/;
const REDUCER_REGEX = /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*Reducer)$/;

interface ChunkPartitionScreenProps {
  stepNumber: number;
  stepItemId?: string;
}

const ChunkPartitionScreen: React.FC<ChunkPartitionScreenProps> = ({ stepNumber, stepItemId }) => {
  const { formData, setCurrentStep, steps } = useFormStore();
  const { stepItems, updateStepData } = useStepDataUpdate();
  
  const targetStepId = resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps));
  
  const item = useMemo(() => {
    return stepItems.find((si: StepItem | DecisionStep | SplitStep | FlowElement) => si.id === targetStepId) || {} as Partial<StepItem>;
  }, [stepItems, targetStepId]);

  // Create dynamic schema with uniqueness validation
  const partitionerSchema = useMemo(() => z.object({
    partitionerClass: z.string()
      .trim()
      .min(1, "Partitioner class required")
      .regex(PARTITIONER_REGEX, PARTITIONER_ERROR_MSG)
      .refine(
        createUniqueClassValidator('partitionerClass', stepItems, targetStepId),
        { message: createUniqueClassErrorMessage('Partitioner') }
      ),
    stepProperties: z.array(
      z.object({
        key: z.string().trim().min(1, "Property key required"),
        value: z.string().trim().min(1, "Property value required"),
        type: z.enum(["String", "Number", "Boolean", "Date"]),
      })
    ).optional(),
    advancedPartitionConfig: z.object({
      enabled: z.boolean(),
      mapperClass: z.string().optional().refine((val) => !val || MAPPER_REGEX.test(val), {
        message: "Must be a valid Java class ending with 'Mapper'"
      }),
      collectorClass: z.string().optional().refine((val) => !val || COLLECTOR_REGEX.test(val), {
        message: "Must be a valid Java class ending with 'Collector'"
      }),
      analyzerClass: z.string().optional().refine((val) => !val || ANALYZER_REGEX.test(val), {
        message: "Must be a valid Java class ending with 'Analyzer'"
      }),
      reducerClass: z.string().optional().refine((val) => !val || REDUCER_REGEX.test(val), {
        message: "Must be a valid Java class ending with 'Reducer'"
      }),
      partitionCount: z.number().min(1, "Partition count must be at least 1").optional(),
    }).optional(),
  }), [stepItems, targetStepId]);

  const { form, handlePrevious } = useFormStep({
    schema: partitionerSchema,
    currentStep: stepNumber,
    defaultValues: {
      partitionerClass: item.partitionerClass || "",
      stepProperties: item.stepProperties || [],
      advancedPartitionConfig: item.advancedPartitionConfig || {
        enabled: false,
        mapperClass: "",
        collectorClass: "",
        analyzerClass: "",
        reducerClass: "",
        partitionCount: 4
      }
    },
  });

  const { fields, append, remove } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "stepProperties",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (data: any) => {
    try {
      updateStepData(targetStepId, {
        partitionerClass: data.partitionerClass,
        stepProperties: data.stepProperties || [],
        advancedPartitionConfig: data.advancedPartitionConfig,
      });
      setCurrentStep(stepNumber + 1);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting partition data:', { error, data, stepItemId });
      throw error;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🔄 Chunk Partitioner
        </h1>
        <p className="text-muted-foreground">Configure your chunk partitioner implementation</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Partitioner Configuration
          </CardTitle>
          <CardDescription>
            Configure your chunk partitioner implementation details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="partitionerClass"
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📝 Partitioner Class
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Enter the fully qualified Java class name for your chunk partitioner
                    </p>
                    <input 
                      {...field} 
                      className="w-full h-12 p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" 
                      placeholder={formData.packageName ? `${formData.packageName}.MyPartitioner` : "com.example.MyPartitioner"}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-2">
                        ⚠️ {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Advanced Partition Configuration */}
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-800 mb-4">
                  🎆 Advanced Partition Configuration
                </h3>
                <p className="text-sm text-indigo-700 mb-4">
                  Configure advanced partitioning components for complex parallel processing scenarios.
                </p>
                
                <FormField
                  control={form.control}
                  name="advancedPartitionConfig.enabled"
                  render={({ field }) => (
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <div>
                        <label className="font-medium text-indigo-800">
                          Enable Advanced Partitioning
                        </label>
                        <p className="text-sm text-indigo-600 mt-1">
                          Add mapper, collector, analyzer, and reducer components
                        </p>
                      </div>
                    </div>
                  )}
                />
                
                {form.watch("advancedPartitionConfig.enabled") && (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="advancedPartitionConfig.mapperClass"
                        render={({ field, fieldState }) => (
                          <div>
                            <label className="block text-sm font-medium text-indigo-700 mb-2">
                              🗺️ Partition Mapper (Optional)
                            </label>
                            <input
                              {...field}
                              className="w-full p-3 border border-indigo-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                              placeholder="com.example.MyPartitionMapper"
                            />
                            <p className="text-xs text-indigo-600 mt-1">
                              Custom partition mapping logic
                            </p>
                            {fieldState.error && (
                              <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                            )}
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="advancedPartitionConfig.partitionCount"
                        render={({ field, fieldState }) => (
                          <div>
                            <label className="block text-sm font-medium text-indigo-700 mb-2">
                              🔢 Partition Count (Alternative to Mapper)
                            </label>
                            <input
                              {...field}
                              type="number"
                              min="1"
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                field.onChange(isNaN(val) ? 1 : Math.max(1, val));
                              }}
                              className="w-full p-3 border border-indigo-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                              placeholder="4"
                            />
                            <p className="text-xs text-indigo-600 mt-1">
                              Number of parallel partitions
                            </p>
                            {fieldState.error && (
                              <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="advancedPartitionConfig.collectorClass"
                        render={({ field, fieldState }) => (
                          <div>
                            <label className="block text-sm font-medium text-indigo-700 mb-2">
                              📦 Partition Collector (Optional)
                            </label>
                            <input
                              {...field}
                              className="w-full p-3 border border-indigo-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                              placeholder="com.example.MyPartitionCollector"
                            />
                            <p className="text-xs text-indigo-600 mt-1">
                              Collect data from partition executions
                            </p>
                            {fieldState.error && (
                              <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                            )}
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="advancedPartitionConfig.analyzerClass"
                        render={({ field, fieldState }) => (
                          <div>
                            <label className="block text-sm font-medium text-indigo-700 mb-2">
                              🔍 Partition Analyzer (Optional)
                            </label>
                            <input
                              {...field}
                              className="w-full p-3 border border-indigo-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                              placeholder="com.example.MyPartitionAnalyzer"
                            />
                            <p className="text-xs text-indigo-600 mt-1">
                              Analyze partition execution results
                            </p>
                            {fieldState.error && (
                              <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="advancedPartitionConfig.reducerClass"
                      render={({ field, fieldState }) => (
                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-2">
                            🤝 Partition Reducer (Optional)
                          </label>
                          <input
                            {...field}
                            className="w-full p-3 border border-indigo-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            placeholder="com.example.MyPartitionReducer"
                          />
                          <p className="text-xs text-indigo-600 mt-1">
                            Reduce/combine results from all partitions
                          </p>
                          {fieldState.error && (
                            <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                          )}
                        </div>
                      )}
                    />
                    
                    <div className="p-3 bg-indigo-100 rounded border border-indigo-200">
                      <h4 className="text-sm font-semibold text-indigo-800 mb-2">💡 Advanced Partition Components:</h4>
                      <div className="text-xs text-indigo-700 space-y-1">
                        <div>• <strong>Mapper:</strong> Defines how data is split into partitions</div>
                        <div>• <strong>Collector:</strong> Gathers data from each partition during execution</div>
                        <div>• <strong>Analyzer:</strong> Analyzes partition results and decides next actions</div>
                        <div>• <strong>Reducer:</strong> Combines/reduces results from all partitions</div>
                      </div>
                    </div>
                  </div>
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
                      Configure partitioner-specific properties (can reference job parameters)
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => append({ key: "", value: "", type: "String" })}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all"
                  >
                    ➕ Add Property
                  </Button>
                </div>
                
                {fields.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">No step properties defined</p>
                    <p className="text-sm text-gray-400">Properties can reference job parameters like: #&#123;jobParameters['chunkSize']&#125;</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
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
                              onClick={() => remove(index)}
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
}

export default ChunkPartitionScreen;