import React from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { useStepDataUpdate } from "@/hooks/use-step-data-update";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveTargetStepId, isAddingNewStep } from "@/utils/stepUtils";
import { createUniqueClassValidator, createUniqueClassErrorMessage } from "@/utils/validationUtils";
import { useFieldArray } from "react-hook-form";
import { Hammer, Settings, Plus, Trash2, FileCode, MapPin, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import type { StepItem } from "@/types/batch";
import z from "zod";

const BATCHLET_REGEX = /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*Batchlet)$/;
const BATCHLET_ERROR_MSG = "Must be a valid Java package and class name ending with 'Batchlet', e.g. com.example.MyBatchlet";

interface BatchletDefinitionScreenProps {
  stepNumber: number;
  stepItemId?: string;
}

const BatchletDefinitionScreen: React.FC<BatchletDefinitionScreenProps> = ({ stepNumber, stepItemId }) => {
  const { formData, setCurrentStep, steps } = useFormStore();
  const { stepItems, updateStepData } = useStepDataUpdate();
  
  const { dynamicStepsData } = useFormStore();
  const currentStepData = dynamicStepsData.currentStep;
  const targetStepId = currentStepData?.id || resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps));
  const item = stepItems.find((si: StepItem) => si.id === targetStepId) || {} as Partial<StepItem>;

  // Create dynamic schema with uniqueness validation
  const createBatchletSchema = () => z.object({
    batchletClass: z.string()
      .trim()
      .min(1, "Batchlet class required")
      .regex(BATCHLET_REGEX, BATCHLET_ERROR_MSG)
      .refine(
        createUniqueClassValidator('batchletClass', stepItems, targetStepId),
        { message: createUniqueClassErrorMessage('Batchlet') }
      ),
    stepProperties: z.array(
      z.object({
        key: z.string().trim().min(1, "Property key required"),
        value: z.string().trim().min(1, "Property value required"),
        type: z.enum(["String", "Number", "Boolean", "Date"]),
      })
    ).optional(),
    executionContext: z.object({
      jslName: z.string().optional(),
      abstract: z.boolean().optional()
    }).optional()
  });

  const { form, handlePrevious } = useFormStep({
    schema: createBatchletSchema(),
    currentStep: stepNumber,
    defaultValues: {
      batchletClass: item.batchletClass || (formData.packageName ? `${formData.packageName}.` : ""),
      stepProperties: item.stepProperties || [],
      executionContext: item.executionContext || {}
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stepProperties",
  });





  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (data: any) => {
    updateStepData(targetStepId, {
      batchletClass: data.batchletClass,
      stepProperties: data.stepProperties || [],
      executionContext: data.executionContext || {},
    });
    
    // Clear current step data and go back to add more steps
    const { setDynamicStepData } = useFormStore.getState();
    setDynamicStepData('currentStep', null);
    setCurrentStep(4);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Context Breadcrumb */}
      {stepItemId && (
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400">Context:</span>
            <span className="font-medium text-blue-800 dark:text-blue-200">
              Configuring step within Flow "{item.parentFlowName || 'Flow Element'}"
            </span>
          </div>
        </div>
      )}
      
      <div className="text-center mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Hammer className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          Batchlet Definition
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {stepItemId ? 'Define batchlet for flow step' : 'Define your batchlet implementation class'}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Class Configuration
          </CardTitle>
          <CardDescription>
            Configure your batchlet implementation details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="batchletClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Batchlet Class
                    </FormLabel>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enter the fully qualified Java class name (e.g. com.example.MyBatchlet)
                    </p>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={formData.packageName ? `${formData.packageName}.MyBatchlet` : "com.example.MyBatchlet"} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Step Execution Context */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Step Execution Context
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Advanced step execution properties for JSR-352 compliance
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="executionContext.jslName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          JSL Name (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="step-jsl-name"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Job Specification Language name for this step
                        </p>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="executionContext.abstract"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Abstract Step
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Mark this step as abstract (template for inheritance)
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
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
                      Configure step-specific properties (can reference job parameters)
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => append({ key: "", value: "", type: "String" })}
                  >
                    <Plus className="h-4 w-4" />
                    Add Property
                  </Button>
                </div>
                
                {fields.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-2">No step properties defined</p>
                    <p className="text-sm text-muted-foreground">Properties can reference job parameters like: #&#123;jobParameters['asOfDate']&#125;</p>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                  className="w-full sm:w-auto"
                  variant="outline"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  type="submit"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default BatchletDefinitionScreen;