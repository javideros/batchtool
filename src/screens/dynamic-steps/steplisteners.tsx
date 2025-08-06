import React from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { useStepDataUpdate } from "@/hooks/use-step-data-update";
import { useStepNavigation } from "@/hooks/use-step-navigation";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveTargetStepId, isAddingNewStep } from "@/utils/stepUtils";
import type { StepItem, DecisionStep, SplitStep, FlowElement } from "@/types/batch";
import z from "zod";
import { useFieldArray } from "react-hook-form";
import { useCallback } from "react";
import { Headphones, Volume2, VolumeX, FileText, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

// Schema: listeners are optional, but if provided must be valid java classes and unique
const stepListenersSchema = z.object({
  listeners: z
    .array(
      z.string()
        .trim()
        .min(1, "Listener name required")
        .regex(/^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*Listener)$/, "Must be a valid Java package and class name ending with 'Listener', e.g. com.example.MyListener")
    )
    .default([])
    .refine(
      (arr) => new Set(arr).size === arr.length,
      { message: "Listener names must be unique" }
    ),
});

interface StepListenersScreenProps {
  stepNumber: number;
  stepItemId?: string;
}

const StepListenersScreen: React.FC<StepListenersScreenProps> = ({ stepNumber, stepItemId }) => {
  const { formData, setCurrentStep, steps } = useFormStore();
  const { stepItems, updateStepData } = useStepDataUpdate();
  
  const targetStepId = resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps));
  const { handleBackToDynamicSteps } = useStepNavigation(stepNumber, targetStepId);
  const item = stepItems.find((si: StepItem | DecisionStep | SplitStep | FlowElement) => si.id === targetStepId);
  const stepItem = item && 'listeners' in item ? item as StepItem : null;

  const { form } = useFormStep({
    schema: stepListenersSchema,
    currentStep: stepNumber,
    defaultValues: {
      listeners: stepItem?.listeners || [],
    },
  });
  


  // Use react-hook-form's useFieldArray for dynamic fields
  const { fields, append, remove } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "listeners",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = useCallback((data: any) => {
    try {
      if (!data) {
        // eslint-disable-next-line no-console
        console.error('Invalid form data provided to handleSubmit: [DATA_REDACTED]');
        throw new Error('Form data is required');
      }
      
      if (!Array.isArray(stepItems)) {
        // eslint-disable-next-line no-console
        console.error('Invalid stepItems data structure:', stepItems);
        throw new Error('Failed to update step items');
      }
      
      const resolvedStepId = resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps));
      
      // Find the step index
      const stepIndex = stepItems.findIndex((si: StepItem | DecisionStep | SplitStep | FlowElement) => si.id === resolvedStepId);
      
      if (stepIndex === -1) {
        // eslint-disable-next-line no-console
        console.error('Step not found with ID:', resolvedStepId);
        return;
      }
      
      // Update the step data
      updateStepData(resolvedStepId, { listeners: data.listeners || [] });
      
      setTimeout(() => {
        setCurrentStep(stepNumber + 1);
      }, 100);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to submit step listeners:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        dataType: typeof data,
        stepItemId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }, [stepItems, stepItemId, setCurrentStep, stepNumber, updateStepData, steps]);

  return (
    <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto">
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Headphones className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          Step Listeners
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">Configure step event listeners</p>
      </div>
      
      <Card className="transition-colors duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Listener Configuration
          </CardTitle>
          <CardDescription>
            Configure event listeners for your step
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {fields.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <div className="space-y-4">
                      <VolumeX className="h-16 w-16 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No listeners configured</h3>
                        <p className="text-muted-foreground text-sm mb-6">Add event listeners to monitor step execution</p>
                      </div>
                      <Button 
                        type="button" 
                        onClick={() => append("")} 
                        variant="outline"
                        className="px-8 py-3 text-base"
                      >
                        <Plus className="h-4 w-4" />
                        Add First Listener
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center py-6">
                      <h3 className="text-lg font-medium text-foreground mb-2">Configured Listeners</h3>
                      <p className="text-muted-foreground text-sm">Manage your step event listeners</p>
                    </div>
                    
                    <div className="space-y-4">
                      {fields.map((field, idx) => (
                        <div key={field.id} className="border border-border rounded-lg p-6 transition-all duration-200">
                          <FormField
                            control={form.control}
                            name={`listeners.${idx}`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between">
                                  <FormLabel className="text-base font-medium flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Listener {idx + 1}
                                  </FormLabel>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => remove(idx)} 
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Remove
                                  </Button>
                                </div>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder={formData.packageName ? `${formData.packageName}.Listener${idx + 1}` : `com.example.Listener${idx + 1}`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center pt-4">
                      <Button 
                        type="button" 
                        onClick={() => append("")} 
                        variant="outline"
                        className="px-8 py-3 text-base"
                      >
                        <Plus className="h-4 w-4" />
                        Add Another Listener
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col xs:flex-row justify-between items-stretch xs:items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-border">
                <Button 
                  type="button" 
                  onClick={() => handleBackToDynamicSteps(form, (data) => ({ listeners: data.listeners || [] }))}
                  className="w-full xs:w-auto min-w-0 xs:min-w-[120px]"
                  variant="outline"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  type="submit" 
                  variant="outline" 
                  className="w-full xs:w-auto min-w-0 xs:min-w-[120px]"
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
};

export default StepListenersScreen;