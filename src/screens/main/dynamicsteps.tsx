import React from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { useDynamicStepLogic } from "@/hooks/use-dynamic-step-logic";
import { useStepHandlers } from "@/hooks/use-step-handlers";
import { DynamicStepForm } from "@/components/dynamic-step-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildSubSteps } from "@/utils/step-builders";
import z from "zod";
import { useEffect, useMemo } from "react";

type DynamicStepFormData = {
  type: string;
  stepName: string;
  addProcessor?: boolean | undefined;
};

type StepItem = {
  id: string;
  stepName: string;
  type: string;
  addProcessor?: boolean;
};


const DynamicStepFormContainer: React.FC<{
  stepNumber: number;
  stepItemId?: string | undefined;
}> = ({ stepNumber, stepItemId }) => {
  const { formData, dynamicStepsData } = useFormStore();
  const stepItems = formData.stepItems || [];
  const currentId = crypto.randomUUID();
  const isAddingNewStep = true;
  const existingStep = null;
  const isEditing = false;

  const existingStepNames = useMemo(() => 
    (stepItems as StepItem[])
      .filter((item: StepItem) => item.id !== currentId)
      .map((item: StepItem) => item.stepName),
    [stepItems, currentId]
  );

  const baseSchema = useMemo(() => z.object({
    type: z.string().trim().min(1, { message: "Please indicate a type" }),
    addProcessor: z.boolean().optional(),
    stepName: z
      .string()
      .trim()
      .min(1, { message: "Please indicate a step name" })
      .max(25, { message: "Step name must be 25 characters or less" })
      .regex(/^[a-zA-Z0-9_.-]+$/, { message: "Step name must contain only letters, numbers, underscores, hyphens, and periods" }),
  }), []);

  const createDynamicSchema = useMemo(() => baseSchema.extend({
    stepName: baseSchema.shape.stepName.refine((name) => {
      return !existingStepNames.includes(name);
    }, { message: "Step name must be unique" }),
  }), [baseSchema, existingStepNames]);
  
  const stepFormData = useMemo(() => {
    // Always return empty data for new steps
    return { type: '', stepName: '', addProcessor: false };
  }, []) as { type?: string; stepName?: string; addProcessor?: boolean };

  const { form, handleNext, handlePrevious } = useFormStep({
    schema: createDynamicSchema,
    currentStep: stepNumber,
    defaultValues: {
      type: stepFormData.type || "",
      addProcessor: stepFormData.addProcessor || false,
      stepName: stepFormData.stepName || "",
    },
  });

  useEffect(() => {
    // Always reset form to empty for new steps
    form.reset({
      type: "",
      addProcessor: false,
      stepName: "",
    });
  }, [form]);

  const typeValue = form.watch("type");

  const { handleUpdateExistingStep, handleAddNewStep, handleFinish } = useStepHandlers(
    currentId,
    stepNumber,
    existingStep,
    isEditing,
    stepItems,
    formData,
    buildSubSteps
  );

  const handleSubmit = (data: DynamicStepFormData) => {
    if (isEditing && existingStep) {
      handleUpdateExistingStep(data);
    } else {
      handleAddNewStep(data);
    }
  };

  return (
    <DynamicStepForm
      form={form as any}
      typeValue={typeValue}
      onSubmit={handleSubmit}
      onPrevious={handlePrevious}
      onFinish={handleFinish}
    />
  );
};

const DynamicSteps: React.FC<{
  stepNumber: number;
  stepItemId?: string | undefined;
}> = ({ stepNumber, stepItemId }) => {

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Step Definition
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure your batch job step details
          </p>
        </div>
        
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">
              Step Configuration
            </CardTitle>
            <CardDescription className="text-sm">
              Define the step details for your batch job
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <DynamicStepFormContainer
              stepNumber={stepNumber}
              stepItemId={stepItemId}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DynamicSteps;
