import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { useStepDataUpdate } from "@/hooks/use-step-data-update";
import { useFieldArray } from "react-hook-form";
import { resolveTargetStepId, isAddingNewStep } from "@/utils/stepUtils";
import { createUniqueClassValidator, createUniqueClassErrorMessage } from "@/utils/validationUtils";
import z from "zod";
import type { StepItem, DecisionStep, SplitStep, FlowElement } from "@/types/batch";

const WRITER_REGEX = /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*Writer)$/;
const WRITER_ERROR_MSG = "Must be a valid Java package and class name ending with 'Writer', e.g. com.example.MyWriter";

const createWriterSchema = (stepItems: any[], stepItemId?: string) => z.object({
  writerClass: z.string()
    .trim()
    .min(1, "Writer class required")
    .regex(WRITER_REGEX, WRITER_ERROR_MSG)
    .refine(
      createUniqueClassValidator('writerClass', stepItems, stepItemId),
      { message: createUniqueClassErrorMessage('Writer') }
    ),
  dataDestination: z.enum(["file", "database", "rest"], { message: "Please select a data destination" }),
  filenamePattern: z.string().optional(),
  writerTableName: z.string().optional(),
  commitInterval: z.number().min(1, "Commit interval must be at least 1").optional(),
  serviceUrl: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "Must be a valid URL"
  }),
  writeFields: z.array(
    z.string().trim().min(1, "Field name required")
  ).optional(),
  stepProperties: z.array(
    z.object({
      key: z.string().trim().min(1, "Property key required"),
      value: z.string().trim().min(1, "Property value required"),
      type: z.enum(["String", "Number", "Boolean", "Date"]),
    })
  ).optional(),
  checkpointConfig: z.object({
    enabled: z.boolean(),
    itemCount: z.number().min(1, "Item count must be at least 1").optional(),
    timeLimit: z.number().min(1, "Time limit must be at least 1 second").optional(),
    customPolicy: z.string().optional(),
    customPolicyProperties: z.array(
      z.object({
        key: z.string().trim().min(1, "Property key required"),
        value: z.string().trim().min(1, "Property value required"),
        type: z.enum(["String", "Number", "Boolean", "Date"]),
      })
    ).optional()
  }).optional()
});

export const useChunkWriterForm = (stepNumber: number, stepItemId?: string) => {
  const { formData, setCurrentStep, steps } = useFormStore();
  const { stepItems, updateStepData } = useStepDataUpdate();
  
  const targetStepId = resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps));
  const item = stepItems.find((si: StepItem | DecisionStep | SplitStep | FlowElement) => si.id === targetStepId) || {} as any;

  const { form, handlePrevious } = useFormStep({
    schema: createWriterSchema(stepItems, stepItemId),
    currentStep: stepNumber,
    defaultValues: {
      writerClass: item.writerClass || (formData.packageName ? `${formData.packageName}.` : ""),
      dataDestination: item.dataDestination || "file",
      filenamePattern: item.filenamePattern || "",
      writerTableName: item.writerTableName || "",
      commitInterval: item.commitInterval || 100,
      serviceUrl: item.serviceUrl || "",
      writeFields: item.writeFields || [],
      stepProperties: item.stepProperties || [],
      checkpointConfig: item.checkpointConfig || {
        enabled: true,
        itemCount: 1000,
        timeLimit: undefined,
        customPolicy: "",
        customPolicyProperties: []
      }
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "writeFields",
  });

  const { fields: propFields, append: appendProp, remove: removeProp } = useFieldArray({
    control: form.control,
    name: "stepProperties",
  });

  const handleSubmit = async (data: any) => {
    try {
      updateStepData(targetStepId, data);
      
      // Check if this is a chunk with partition step
      const { dynamicStepsData, setDynamicStepData } = useFormStore.getState();
      const currentStep = dynamicStepsData?.currentStep;
      
      if (currentStep?.type === 'C') {
        // Go to partition phase for chunk with partition
        setDynamicStepData('chunkPhase', 'partition');
      } else {
        // Clear current step data and go back to add more steps
        setDynamicStepData('chunkPhase', 'reader');
        setDynamicStepData('currentStep', null);
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Error submitting chunk writer configuration');
      throw error;
    }
  };

  const handleNumberInput = (value: string, field: any) => {
    const parsed = parseInt(value, 10);
    field.onChange(isNaN(parsed) ? 1 : Math.max(1, parsed));
  };

  return {
    form,
    fields,
    append,
    remove,
    propFields,
    appendProp,
    removeProp,
    handleSubmit,
    handlePrevious,
    formData,
    handleNumberInput
  };
};