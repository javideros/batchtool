import React from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Settings, Lightbulb } from "lucide-react";
import z from "zod";

const jobRestartSchema = z.object({
  restartable: z.boolean(),
  allowStartIfComplete: z.boolean(),
  startLimit: z.number().min(1, "Start limit must be at least 1").max(10, "Start limit cannot exceed 10"),
  stepRestartable: z.boolean(),
});

interface JobRestartScreenProps {
  stepNumber: number;
}

const JobRestartScreen: React.FC<JobRestartScreenProps> = ({ stepNumber }) => {
  const { formData, setFormData } = useFormStore();

  const { form, handleNext, handlePrevious } = useFormStep({
    schema: jobRestartSchema,
    currentStep: stepNumber,
    defaultValues: {
      restartable: formData.jobRestartConfig?.restartable ?? true,
      allowStartIfComplete: formData.jobRestartConfig?.stepRestartConfig?.allowStartIfComplete ?? false,
      startLimit: formData.jobRestartConfig?.stepRestartConfig?.startLimit ?? 3,
      stepRestartable: formData.jobRestartConfig?.stepRestartConfig?.restartable ?? true,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (data: any) => {
    const jobRestartConfig = {
      restartable: data.restartable,
      stepRestartConfig: {
        allowStartIfComplete: data.allowStartIfComplete,
        startLimit: data.startLimit,
        restartable: data.stepRestartable,
      },
    };

    setFormData({ ...formData, jobRestartConfig });
    handleNext(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <RotateCcw className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          Job Restart Configuration
        </h1>
        <p className="text-muted-foreground">Configure restart behavior for production batch jobs</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Restart Settings
          </CardTitle>
          <CardDescription>
            Control how your batch job handles failures and restarts in production environments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              
              {/* What is Job Restart Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  What is Job Restart?
                </h3>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <p>Job restart controls how your batch job behaves when it fails and needs to be restarted:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Job Restartable:</strong> Whether the entire job can be restarted after failure</li>
                    <li><strong>Step Restart:</strong> Whether individual steps can be restarted</li>
                    <li><strong>Start Limit:</strong> Maximum attempts before giving up</li>
                    <li><strong>Allow Start If Complete:</strong> Whether to re-run completed steps</li>
                  </ul>
                </div>
              </div>

              {/* Job-Level Restart */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Job-Level Restart
                </h3>
                
                <FormField
                  control={form.control}
                  name="restartable"
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-5 h-5 text-blue-600 bg-muted/30 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <label className="font-medium text-foreground">
                          Job is Restartable
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Allow this job to be restarted after failure. Recommended for production jobs.
                        </p>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Step-Level Restart Configuration */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Step-Level Restart Configuration
                </h3>
                
                <div className="space-y-6">
                  {/* Step Restartable */}
                  <FormField
                    control={form.control}
                    name="stepRestartable"
                    render={({ field }) => (
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-5 h-5 text-green-600 bg-muted/30 border-gray-300 rounded focus:ring-green-500"
                        />
                        <div>
                          <label className="font-medium text-foreground">
                            Steps are Restartable
                          </label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Allow individual steps to be restarted. Usually enabled for production.
                          </p>
                        </div>
                      </div>
                    )}
                  />

                  {/* Start Limit */}
                  <FormField
                    control={form.control}
                    name="startLimit"
                    render={({ field, fieldState }) => (
                      <div>
                        <label className="block font-medium text-foreground mb-2">
                          Start Limit
                        </label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Maximum number of times a step can be started (including restarts)
                        </p>
                        <div className="flex items-center gap-4">
                          <input
                            {...field}
                            type="number"
                            min="1"
                            max="10"
                            className="w-24 p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                          />
                          <div className="text-sm text-muted-foreground">
                            <div>• 1 = No retries (fail immediately)</div>
                            <div>• 3 = Default (2 retries after initial failure)</div>
                            <div>• 5+ = High retry tolerance</div>
                          </div>
                        </div>
                        {fieldState.error && (
                          <p className="text-red-500 text-sm mt-2">
                            AlertTriangle {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  {/* Allow Start If Complete */}
                  <FormField
                    control={form.control}
                    name="allowStartIfComplete"
                    render={({ field }) => (
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-5 h-5 text-yellow-600 bg-muted/30 border-gray-300 rounded focus:ring-yellow-500 mt-1"
                        />
                        <div>
                          <label className="font-medium text-foreground">
                            Allow Start If Complete
                          </label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Allow steps to restart even if they completed successfully in a previous run.
                          </p>
                          <div className="mt-2 p-3 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-xs text-yellow-700">
                              <strong>AlertTriangle Use with caution:</strong> This can cause data duplication or inconsistency 
                              if steps are not idempotent (safe to run multiple times).
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Restart Scenarios */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Target Common Restart Scenarios</h3>
                <div className="text-sm text-green-700 space-y-2">
                  <div><strong>Development/Testing:</strong> restartable=true, startLimit=1, allowStartIfComplete=true</div>
                  <div><strong>Production (Safe):</strong> restartable=true, startLimit=3, allowStartIfComplete=false</div>
                  <div><strong>Production (Aggressive):</strong> restartable=true, startLimit=5, allowStartIfComplete=false</div>
                  <div><strong>One-time Job:</strong> restartable=false, startLimit=1, allowStartIfComplete=false</div>
                </div>
              </div>

              {/* Current Configuration Preview */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-2">FileText Current Configuration</h3>
                <div className="text-sm text-foreground space-y-1">
                  <div>Job Restartable: <span className="font-medium">{form.watch("restartable") ? "CheckCircle Yes" : "XCircle No"}</span></div>
                  <div>Step Restartable: <span className="font-medium">{form.watch("stepRestartable") ? "CheckCircle Yes" : "XCircle No"}</span></div>
                  <div>Start Limit: <span className="font-medium">{form.watch("startLimit")} attempts</span></div>
                  <div>Allow Start If Complete: <span className="font-medium">{form.watch("allowStartIfComplete") ? "CheckCircle Yes" : "XCircle No"}</span></div>
                </div>
              </div>

              {/* Generated XML Preview */}
              <div className="p-4 bg-slate-50 rounded-lg border">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">FileText Generated XML Attributes</h3>
                <div className="text-sm font-mono bg-slate-100 p-3 rounded border">
                  <div>&lt;job id="{formData.batchName}" restartable="{form.watch("restartable") ? "true" : "false"}"&gt;</div>
                  <div className="ml-4">&lt;step id="stepName"</div>
                  <div className="ml-8">restartable="{form.watch("stepRestartable") ? "true" : "false"}"</div>
                  <div className="ml-8">start-limit="{form.watch("startLimit")}"</div>
                  <div className="ml-8">allow-start-if-complete="{form.watch("allowStartIfComplete") ? "true" : "false"}"&gt;</div>
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

export default JobRestartScreen;