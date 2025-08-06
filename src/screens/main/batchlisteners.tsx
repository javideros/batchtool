import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormStep } from "@/hooks/use-form-step";
import { useFieldArray } from "react-hook-form";
import { useMemo } from "react";
import { Headphones, Volume2, VolumeX, FileText, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import z from "zod";
import { useFormStore } from "@/lib/jsr352batchjobstore";

const batchListenersSchema = z
  .object({
    batchListeners: z.array(
      z.object({
        listenerName: z
          .string()
          .trim()
          .min(1, {
            message: "Please enter a listener java package and class name",
          })
          .regex(/^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*Listener)$/, {
            message:
              "Must be a valid Java package and class name ending with 'Listener', e.g. com.example.MyListener",
          }),
      })
    ),
  })
  .refine(
    (data) => {
      const classNames = data.batchListeners
        .map((l) => l.listenerName.split(".").pop()?.trim())
        .filter(Boolean);

      return new Set(classNames).size === classNames.length;
    },
    {
      message: "Listener class names must be unique",
      path: ["batchListeners"],
    }
  );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkEmptyListeners = (listeners: any[]) => 
  listeners.some(listener => !listener?.listenerName?.trim());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getErrorMessage = (errors: any) => 
  errors?.batchListeners?.message || errors?.batchListeners?.root?.message;

const BatchListenersScreen: React.FC<{ stepNumber: number }> = ({
  stepNumber,
}) => {
  const { formData, setFormData } = useFormStore(); // <-- get formData from store

  const { form, handleNext, handlePrevious } = useFormStep({
    schema: batchListenersSchema,
    currentStep: stepNumber,
    defaultValues: {
      batchListeners: formData?.batchListeners ?? [], // <-- use saved data if present
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "batchListeners",
  });

  const watchedListeners = form.watch("batchListeners");
  
  const hasEmptyListener = useMemo(() => 
    checkEmptyListeners(watchedListeners ?? []), [watchedListeners]
  );

  const hasListenerError = useMemo(() => 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.formState.errors.batchListeners?.some?.(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any) => err && err.listenerName
    ), [form.formState.errors.batchListeners]
  );

  const errorMessage = useMemo(() => 
    getErrorMessage(form.formState.errors), [form.formState.errors]
  );
  const disableAdd = hasEmptyListener || hasListenerError;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (data: any) => {
    // Save batch listeners to the correct formData property
    setFormData({ batchListeners: data.batchListeners || [] });
    handleNext(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Headphones className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          Batch Listeners
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">Configure batch job event listeners</p>
      </div>
      
      <Card className="transition-colors duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Listener Configuration
          </CardTitle>
          <CardDescription>
            Configure event listeners for your batch job
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Show array-level error */}
          {errorMessage && (
            <div className="text-red-500 text-sm mb-2 text-center">
              {errorMessage}
            </div>
          )}
              <div className="space-y-6">
                {fields.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <div className="space-y-4">
                      <VolumeX className="h-16 w-16 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No listeners configured</h3>
                        <p className="text-muted-foreground text-sm mb-6">Add event listeners to monitor batch job execution</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() =>
                          append({
                            listenerName: formData.packageName
                              ? `${formData.packageName}.MyListener`
                              : "com.example.MyListener",
                          })
                        }
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
                      <p className="text-muted-foreground text-sm">Manage your batch job event listeners</p>
                    </div>
                    
                    <div className="space-y-4">
                      {fields.map((field, idx) => (
                        <div key={field.id} className="border border-border rounded-lg p-6 transition-all duration-200">
                          <FormField
                            control={form.control}
                            name={`batchListeners.${idx}.listenerName`}
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
                                    placeholder={formData.packageName
                                        ? `${formData.packageName}.MyListener${idx + 1}`
                                        : `com.example.MyListener${idx + 1}`}
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
                        onClick={() =>
                          append({
                            listenerName: formData.packageName
                              ? `${formData.packageName}.MyListener`
                              : "com.example.MyListener",
                          })
                        }
                        variant="outline"
                        className="px-8 py-3 text-base"
                        disabled={disableAdd}
                      >
                        <Plus className="h-4 w-4" />
                        Add Another Listener
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              
              <div className="flex justify-between items-center pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  type="submit" 
                  variant="outline"
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

export default BatchListenersScreen;
