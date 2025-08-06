import React from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { useStepDataUpdate } from "@/hooks/use-step-data-update";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveTargetStepId, isAddingNewStep } from "@/utils/stepUtils";
import { useMemo, useEffect } from "react";
import type { StepItem, DecisionStep, SplitStep, FlowElement } from "@/types/batch";
import z from "zod";

const flowElementSchema = z.object({
  template: z.string().optional(),
  flowName: z.string()
    .trim()
    .min(1, "Flow name required")
    .max(25, "Flow name must be 25 characters or less")
    .regex(/^[a-z_]+$/, "Flow name must contain only lowercase letters and underscores"),
  description: z.string().min(1, "Flow description required"),
  nextStep: z.string().optional(),
});

const FLOW_TEMPLATES = {
  custom: {
    name: "Custom Flow",
    flowName: "",
    description: "",
    icon: "🎯"
  },
  data_processing: {
    name: "Data Processing Flow",
    flowName: "data_processing_flow",
    description: "Validate, transform, and load data in sequence",
    icon: "📊"
  },
  error_handling: {
    name: "Error Handling Flow",
    flowName: "error_handling_flow",
    description: "Detect, log, notify, and recover from errors",
    icon: "🚨"
  },
  reporting: {
    name: "Reporting Flow",
    flowName: "reporting_flow",
    description: "Aggregate data, calculate metrics, and generate reports",
    icon: "📈"
  },
  cleanup: {
    name: "Cleanup Flow",
    flowName: "cleanup_flow",
    description: "Archive old data, purge files, and optimize storage",
    icon: "🧹"
  },
  validation: {
    name: "Validation Flow",
    flowName: "validation_flow",
    description: "Check data quality, validate business rules, and ensure compliance",
    icon: "✅"
  },
  file_management: {
    name: "File Management Flow",
    flowName: "file_management_flow",
    description: "Read files, archive originals, generate timestamped outputs",
    icon: "📁"
  }
};

interface FlowElementScreenProps {
  stepNumber: number;
  stepItemId?: string;
}

const FlowElementScreen: React.FC<FlowElementScreenProps> = ({ stepNumber, stepItemId }) => {
  const { setCurrentStep, steps } = useFormStore();
  const { stepItems, updateStepData } = useStepDataUpdate();
  
  const targetStepId = resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps));
  
  const item = useMemo(() => {
    return stepItems.find((si: StepItem | DecisionStep | SplitStep | FlowElement) => si.id === targetStepId) || {} as Partial<FlowElement>;
  }, [stepItems, targetStepId]);

  // Get previous step names for next step reference
  const previousStepNames = useMemo(() => {
    return stepItems
      .filter((step: StepItem | DecisionStep | SplitStep | FlowElement) => step.id !== targetStepId && 'stepName' in step && step.stepName)
      .map((step: StepItem | DecisionStep | SplitStep | FlowElement) => 'stepName' in step ? step.stepName : '')
      .filter((stepName: string) => Boolean(stepName));
  }, [stepItems, targetStepId]);

  const { form, handlePrevious } = useFormStep({
    schema: flowElementSchema,
    currentStep: stepNumber,
    defaultValues: {
      template: "custom",
      flowName: item.flowName || "",
      description: item.description || "",
      nextStep: item.nextStep || "",
    },
  });

  const selectedTemplate = form.watch("template");

  const handleTemplateChange = (templateKey: string) => {
    const template = FLOW_TEMPLATES[templateKey as keyof typeof FLOW_TEMPLATES];
    if (template && templateKey !== "custom") {
      form.setValue("flowName", template.flowName);
      form.setValue("description", template.description);
    } else if (templateKey === "custom") {
      form.setValue("flowName", "");
      form.setValue("description", "");
    }
  };

  // Reset form when step changes to ensure data isolation
  useEffect(() => {
    form.reset({
      template: "custom",
      flowName: item.flowName || "",
      description: item.description || "",
      nextStep: item.nextStep || "",
    });
  }, [targetStepId, item, form]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (data: any) => {
    updateStepData(targetStepId, {
      ...item,
      type: 'FLOW',
      flowName: data.flowName,
      description: data.description,
      steps: [], // Will be populated when configuring individual steps within the flow
      nextStep: data.nextStep,
    });
    
    setCurrentStep(stepNumber + 1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🌊 Flow Element
        </h1>
        <p className="text-muted-foreground">Configure a reusable flow of steps for your batch job</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Flow Configuration
          </CardTitle>
          <CardDescription>
            Flow elements are reusable sequences of steps that can be used independently or within splits for modular job design.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              
              {/* Flow Template Selection */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  🎯 Choose Flow Template
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Select a preset template or create a custom flow
                </p>
                
                <FormField
                  control={form.control}
                  name="template"
                  render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(FLOW_TEMPLATES).map(([key, template]) => (
                        <div
                          key={key}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            field.value === key
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-teal-300 hover:bg-teal-25'
                          }`}
                          onClick={() => {
                            field.onChange(key);
                            handleTemplateChange(key);
                          }}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{template.icon}</div>
                            <div className="font-semibold text-gray-800 mb-1">{template.name}</div>
                            <div className="text-xs text-gray-600">{template.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* What is a Flow Element Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Flow = Reusable Recipe</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>Think of a <strong>Flow</strong> as a recipe you can use multiple times:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>📝 Write once, use many times</strong> - Avoid repeating the same steps</li>
                    <li><strong>🔧 Easy to change</strong> - Update the flow, all uses get updated</li>
                    <li><strong>📋 Better organization</strong> - Group related steps together</li>
                    <li><strong>🎯 Clear purpose</strong> - Each flow has a specific job</li>
                  </ul>
                  
                  {selectedTemplate === "file_management" && (
                    <div className="mt-3 p-3 bg-blue-100 rounded border">
                      <p className="font-semibold">📁 File Management Pattern:</p>
                      <div className="text-xs mt-1 space-y-1">
                        <div>• <strong>Read:</strong> Process input files from /input folder</div>
                        <div>• <strong>Archive:</strong> Move processed files to /archive/{'{'}date{'}'}</div>
                        <div>• <strong>Generate:</strong> Create output in /temp folder</div>
                        <div>• <strong>Finalize:</strong> Move to /output with timestamp</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Flow Name */}
              <FormField
                control={form.control}
                name="flowName"
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📝 Flow Name
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Unique identifier for this flow element
                    </p>
                    <input 
                      {...field} 
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all" 
                      placeholder="data_processing_flow"
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-2">
                        ⚠️ {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Flow Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📄 Flow Description
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Describe what this flow accomplishes
                    </p>
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all resize-none"
                      placeholder="This flow handles data validation, transformation, and loading processes"
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-2">
                        ⚠️ {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Flow Steps Info */}
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <h3 className="text-lg font-semibold text-teal-800 mb-2">🔧 Flow Steps Configuration</h3>
                <div className="text-sm text-teal-700 space-y-2">
                  <p>After creating this flow, you'll be able to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Add multiple steps to this flow (Batchlet, Chunk, Decision)</li>
                    <li>Configure step transitions within the flow</li>
                    <li>Define the flow's completion behavior</li>
                    <li>Reuse this flow in different parts of your job</li>
                  </ul>
                </div>
              </div>

              {/* Next Step After Flow */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  ➡️ After Flow Completion
                </h4>
                
                {previousStepNames.length > 0 ? (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <h5 className="text-sm font-semibold text-green-800 mb-2">📝 Available Steps:</h5>
                    <div className="flex flex-wrap gap-2">
                      {previousStepNames.map((stepName: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                          {stepName}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-700">
                      No previous steps available. The flow will end the job when it completes.
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="nextStep"
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Next Step (Optional)
                      </label>
                      <p className="text-sm text-gray-500 mb-3">
                        Step to execute after this flow completes
                      </p>
                      <input
                        {...field}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                        placeholder="Leave empty to end job"
                      />
                    </div>
                  )}
                />
              </div>

              {/* Template Preview */}
              {selectedTemplate && selectedTemplate !== "custom" && (
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <h3 className="text-lg font-semibold text-teal-800 mb-2">
                    {FLOW_TEMPLATES[selectedTemplate as keyof typeof FLOW_TEMPLATES].icon} Template Preview
                  </h3>
                  <div className="text-sm text-teal-700">
                    <p><strong>Flow Name:</strong> {FLOW_TEMPLATES[selectedTemplate as keyof typeof FLOW_TEMPLATES].flowName}</p>
                    <p><strong>Description:</strong> {FLOW_TEMPLATES[selectedTemplate as keyof typeof FLOW_TEMPLATES].description}</p>
                    <p className="mt-2 text-xs">You can modify these values below if needed.</p>
                  </div>
                </div>
              )}
              
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

export default FlowElementScreen;