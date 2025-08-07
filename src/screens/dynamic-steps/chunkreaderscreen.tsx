import React from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { useStepDataUpdate } from "@/hooks/use-step-data-update";
import { useStepNavigation } from "@/hooks/use-step-navigation";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Settings, Search, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { resolveTargetStepId, isAddingNewStep } from "@/utils/stepUtils";
import { createUniqueClassValidator, createUniqueClassErrorMessage } from "@/utils/validationUtils";
import { useFieldArray } from "react-hook-form";
import { useMemo } from "react";
import type { StepItem, DecisionStep, SplitStep, FlowElement } from "@/types/batch";
import z from "zod";

interface ChunkReaderScreenProps {
  stepNumber: number;
  stepItemId?: string;
}

const isValidStepItemId = (stepItemId?: string): stepItemId is string => {
  return !!stepItemId && typeof stepItemId === 'string' && stepItemId.trim() !== '';
};

const findStepItem = (stepItems: (StepItem | DecisionStep | SplitStep | FlowElement)[], stepItemId?: string) => {
  if (!isValidStepItemId(stepItemId) || !/^[a-zA-Z0-9-_]+$/.test(stepItemId)) {
    return {} as Partial<StepItem>;
  }
  const sanitizedId = stepItemId.trim();
  return stepItems.find((si: StepItem | DecisionStep | SplitStep | FlowElement) => si && typeof si.id === 'string' && si.id === sanitizedId) || {} as Partial<StepItem>;
};

const createReaderSchema = (stepItems: (StepItem | DecisionStep | SplitStep | FlowElement)[], targetStepId?: string) => z.object({
  readerClass: z.string()
    .trim()
    .min(1, "Reader class required")
    .regex(
      /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*Reader)$/,
      "Must be a valid Java package and class name ending with 'Reader', e.g. com.example.MyReader"
    )
    .refine(
      createUniqueClassValidator('readerClass', stepItems, targetStepId),
      { message: createUniqueClassErrorMessage('Reader') }
    ),
  dataSource: z.enum(["file", "database", "rest"], { message: "Please select a data source" }),
  pageSize: z.number().min(1, "Page size must be at least 1").max(10000, "Page size cannot exceed 10,000"),
  stepProperties: z.array(
    z.object({
      key: z.string().trim().min(1, "Property key required"),
      value: z.string().trim().min(1, "Property value required"),
      type: z.enum(["String", "Number", "Boolean", "Date"]),
    })
  ).optional(),
  filenamePattern: z.string().optional(),
  readerTableName: z.string().optional(),
  serviceUrl: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "Must be a valid URL"
  }),
  criteria: z.array(
    z.object({
      field: z.string().trim().min(1, "Field name required"),
      operator: z.enum(["=", "!=", ">", "<", ">=", "<=", "LIKE", "IN"], { message: "Please select an operator" }),
      value: z.string().trim().min(1, "Value required")
    })
  ).optional()
});

const ChunkReaderScreen: React.FC<ChunkReaderScreenProps> = ({ stepNumber, stepItemId }) => {
  const { formData, setCurrentStep, steps } = useFormStore();
  const { stepItems, updateStepData } = useStepDataUpdate();
  
  const { dynamicStepsData } = useFormStore();
  const currentStepData = dynamicStepsData?.currentStep;
  const targetStepId = currentStepData?.id || resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps));
  const { handleBack } = useStepNavigation(stepNumber, targetStepId);
  
  const item = useMemo(() => findStepItem(stepItems, targetStepId), [stepItems, targetStepId]);
  const readerSchema = useMemo(() => createReaderSchema(stepItems, targetStepId), [stepItems, targetStepId]);

  const { form } = useFormStep({
    schema: readerSchema,
    currentStep: stepNumber,
    defaultValues: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readerClass: (item as any).readerClass || (formData.packageName ? `${formData.packageName}.` : ""),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dataSource: (item as any).dataSource || "file",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pageSize: (item as any).pageSize || 100,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filenamePattern: (item as any).filenamePattern || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readerTableName: (item as any).readerTableName || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      serviceUrl: (item as any).serviceUrl || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      criteria: (item as any).criteria || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stepProperties: (item as any).stepProperties || []
    },
  });

  const { fields, append, remove } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "criteria",
  });

  const { fields: propFields, append: appendProp, remove: removeProp } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "stepProperties",
  });

  const dataSourceValue = form.watch("dataSource");

  const handleSubmit = (data: z.infer<typeof readerSchema>) => {
    updateStepData(targetStepId, data);
    
    // Check if processor is needed for chunk steps
    const { dynamicStepsData, setDynamicStepData } = useFormStore.getState();
    const currentStep = dynamicStepsData?.currentStep;
    
    if (currentStep?.addProcessor) {
      // Go to processor phase
      setDynamicStepData('chunkPhase', 'processor');
      // Stay on same step number to show processor screen
    } else {
      // Skip processor, go to writer phase
      setDynamicStepData('chunkPhase', 'writer');
    }
  };
  


  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8" />
          Chunk Reader
        </h1>
        <p className="text-muted-foreground">Configure your chunk reader implementation</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Reader Configuration
          </CardTitle>
          <CardDescription>
            Configure your chunk reader implementation details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="readerClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reader Class</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder={formData.packageName ? `${formData.packageName}.MyReader` : "com.example.MyReader"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dataSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select data source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="file">File</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="rest">REST Service</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="pageSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Size</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="1"
                        max="10000"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        placeholder="100"
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Number of records to process per batch (1-10,000)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {dataSourceValue === "file" && (
                <FormField
                  control={form.control}
                  name="filenamePattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filename Pattern</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="*.csv" />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        File pattern to match (e.g., *.csv, data_*.txt, report_2024*.xlsx)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {dataSourceValue === "database" && (
                <FormField
                  control={form.control}
                  name="readerTableName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Table Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="table_name" />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Database table name to read from (e.g., users, orders, products)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {dataSourceValue === "rest" && (
                <FormField
                  control={form.control}
                  name="serviceUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service URL</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://api.example.com/data" />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        REST API endpoint URL (e.g., https://api.example.com/data)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(dataSourceValue === "database" || dataSourceValue === "rest") && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Query Criteria
                    </h4>
                    <Button
                      type="button"
                      onClick={() => append({ field: "", operator: "=", value: "" })}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Criteria
                    </Button>
                  </div>
                  
                  {fields.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                      <p className="text-muted-foreground mb-2">No criteria defined</p>
                      <p className="text-sm text-muted-foreground">Click Add Criteria to add query conditions</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fields.map((criteriaField, index) => (
                        <div key={criteriaField.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-muted/50 rounded-lg border">
                          <FormField
                            control={form.control}
                            name={`criteria.${index}.field`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Field</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="field_name" className="h-8" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`criteria.${index}.operator`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Operator</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="=">=</SelectItem>
                                    <SelectItem value="!=">!=</SelectItem>
                                    <SelectItem value=">">&gt;</SelectItem>
                                    <SelectItem value="<">&lt;</SelectItem>
                                    <SelectItem value=">=">&gt;=</SelectItem>
                                    <SelectItem value="<=">&lt;=</SelectItem>
                                    <SelectItem value="LIKE">LIKE</SelectItem>
                                    <SelectItem value="IN">IN</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`criteria.${index}.value`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Value</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="value" className="h-8" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => remove(index)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step Properties Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Step Properties
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure reader-specific properties (can reference job parameters)
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => appendProp({ key: "", value: "", type: "String" })}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Property
                  </Button>
                </div>
                
                {propFields.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-2">No step properties defined</p>
                    <p className="text-sm text-muted-foreground">Properties can reference job parameters like: #&#123;jobParameters['dataSource']&#125;</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {propFields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-muted/50 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <FormField
                            control={form.control}
                            name={`stepProperties.${index}.key`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Property Key</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="propertyName" className="h-8" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`stepProperties.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-xs">Property Value</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="value or #{jobParameters['paramName']}" className="h-8" />
                                </FormControl>
                                <FormMessage className="text-xs" />
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
                                <FormLabel className="text-xs">Property Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="String">String</SelectItem>
                                    <SelectItem value="Number">Number</SelectItem>
                                    <SelectItem value="Boolean">Boolean</SelectItem>
                                    <SelectItem value="Date">Date</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
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
                  onClick={() => handleBack(form)}
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
};

export default ChunkReaderScreen;