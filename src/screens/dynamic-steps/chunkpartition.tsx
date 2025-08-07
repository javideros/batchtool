import React from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { useStepDataUpdate } from "@/hooks/use-step-data-update";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Split, Settings, FileText, Map, Hash, Package, Search, Users, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
      partitionerClass: item.partitionerClass || (formData.packageName ? `${formData.packageName}.` : ""),
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
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Split className="h-8 w-8" />
          Chunk Partitioner
        </h1>
        <p className="text-muted-foreground">Configure your chunk partitioner implementation</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Partitioner Configuration
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Partitioner Class
                    </FormLabel>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enter the fully qualified Java class name for your chunk partitioner
                    </p>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={formData.packageName ? `${formData.packageName}.MyPartitioner` : "com.example.MyPartitioner"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Advanced Partition Configuration */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Advanced Partition Configuration
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure advanced partitioning components for complex parallel processing scenarios.
                </p>
                
                <FormField
                  control={form.control}
                  name="advancedPartitionConfig.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 mt-1 accent-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          Enable Advanced Partitioning
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Add mapper, collector, analyzer, and reducer components
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                {form.watch("advancedPartitionConfig.enabled") && (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="advancedPartitionConfig.mapperClass"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Map className="h-4 w-4" />
                              Partition Mapper (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="com.example.MyPartitionMapper"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Custom partition mapping logic
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="advancedPartitionConfig.partitionCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              Partition Count (Alternative to Mapper)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="1"
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  field.onChange(isNaN(val) ? 1 : Math.max(1, val));
                                }}
                                placeholder="4"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Number of parallel partitions
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="advancedPartitionConfig.collectorClass"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Partition Collector (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="com.example.MyPartitionCollector"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Collect data from partition executions
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="advancedPartitionConfig.analyzerClass"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Search className="h-4 w-4" />
                              Partition Analyzer (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="com.example.MyPartitionAnalyzer"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Analyze partition execution results
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="advancedPartitionConfig.reducerClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Partition Reducer (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="com.example.MyPartitionReducer"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Reduce/combine results from all partitions
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="p-3 bg-card rounded border">
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Advanced Partition Components:
                      </h4>
                      <div className="text-xs text-muted-foreground space-y-1">
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
                    <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Step Properties
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure partitioner-specific properties (can reference job parameters)
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => append({ key: "", value: "", type: "String" })}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Property
                  </Button>
                </div>
                
                {fields.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-2">No step properties defined</p>
                    <p className="text-sm text-muted-foreground">Properties can reference job parameters like: #&#123;jobParameters['chunkSize']&#125;</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
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
                              onClick={() => remove(index)}
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
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                <Button 
                  type="button" 
                  onClick={handlePrevious}
                  className="w-full sm:w-auto gap-2"
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button 
                  type="submit"
                  variant="outline"
                  className="w-full sm:w-auto gap-2"
                >
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
}

export default ChunkPartitionScreen;