import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import z from "zod";
import { useEffect } from "react";
import StepListenersScreen from "./steplisteners";
import BatchletDefinitionScreen from "./batchletdefinition";
import ChunkReaderScreen from "./chunkreaderscreen";
import ChunkProcessorScreen from "./chunkprocessorscreen";
import ChunkWriterScreen from "./chunkwriterscreen";
import ChunkPartitionScreen from "./chunkpartitionscreen";

const dynamicStepsSchema = z.object({
  type: z.string().trim().min(1, { message: "Please indicate a type" }),
  addProcessor: z.boolean().optional(),
  stepName: z.string().trim().min(1, { message: "Please indicate a step name" }).max(25),
});

function DynamicStepsScreen({ step, stepItemId }: { step: number; stepItemId?: string }) {
  const {
    steps,
    setSteps,
    stepItems,
    setStepItems,
    setPendingStep,
    setCurrentStep,
    resetForm,
  } = useFormStore();

  // Find the item by id, or use empty if adding new
  const isEditing = !!stepItemId;
  const currentId = stepItemId || crypto.randomUUID();
  const item = isEditing ? stepItems.find(si => si.id === stepItemId) || {} : {};

  const { form, handleNext, handlePrevious } = useFormStep({
    schema: dynamicStepsSchema,
    currentStep: step,
    defaultValues: {
      type: item.type || "",
      addProcessor: item.addProcessor || false,
      stepName: item.stepName || "",
    },
  });

  useEffect(() => {
    form.reset({
      type: item.type || "",
      addProcessor: item.addProcessor || false,
      stepName: item.stepName || "",
    });
  }, [item.type, item.addProcessor, item.stepName]);

  const typeValue = form.watch("type");

  const handleSubmit = (data: any) => {
    let newStepItems = [...stepItems];
    if (isEditing) {
      // Update existing
      newStepItems = newStepItems.map(si =>
        si.id === currentId ? { ...si, ...data } : si
      );
      setStepItems(newStepItems);
      handleNext(data);
      return;
    }
    // Add new
    newStepItems = [...newStepItems, { id: currentId, ...data }];
    setStepItems(newStepItems);

    // Build sub-steps for this new step, all with stepItemId: currentId
    const nextId = steps.length;
    let subSteps = [
      {
        id: nextId,
        name: "Step Listeners",
        components: StepListenersScreen,
        insertedByDynamic: true,
        stepItemId: currentId,
      },
    ];
    let offset = 1;

    if (data.type === "A") {
      subSteps.push({
        id: nextId + offset,
        name: "Batchlet Definition",
        components: BatchletDefinitionScreen,
        insertedByDynamic: true,
        stepItemId: currentId,
      });
      offset++;
      subSteps.push({
        id: nextId + offset,
        name: "Dynamic Step Items",
        components: DynamicStepsScreen,
        insertedByDynamic: true,
        stepItemId: currentId, // always edit mode for this step
      });
    } else if (data.type === "B" || data.type === "C") {
      subSteps.push({
        id: nextId + offset,
        name: "Chunk Reader",
        components: ChunkReaderScreen,
        insertedByDynamic: true,
        stepItemId: currentId,
      });
      offset++;
      if (data.addProcessor) {
        subSteps.push({
          id: nextId + offset,
          name: "Chunk Processor",
          components: ChunkProcessorScreen,
          insertedByDynamic: true,
          stepItemId: currentId,
        });
        offset++;
      }
      subSteps.push({
        id: nextId + offset,
        name: "Chunk Writer",
        components: ChunkWriterScreen,
        insertedByDynamic: true,
        stepItemId: currentId,
      });
      offset++;
      if (data.type === "C") {
        subSteps.push({
          id: nextId + offset,
          name: "Partition",
          components: ChunkPartitionScreen,
          insertedByDynamic: true,
          stepItemId: currentId,
        });
        offset++;
      }
      subSteps.push({
        id: nextId + offset,
        name: "Dynamic Step Items",
        components: DynamicStepsScreen,
        insertedByDynamic: true,
        stepItemId: currentId, // always edit mode for this step
      });
    }

    setSteps([...steps, ...subSteps]);
    setPendingStep(nextId); // Go to first sub-step for the new stepItem
  };

  const handleFinish = () => {
    resetForm();
    setCurrentStep(0); // Go back to BatchDetailsScreen
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-center">Dynamic Steps</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[120px]">
            <FormField
              control={form.control}
              name="stepName"
              render={({ field, fieldState }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">Step Name</label>
                  <input {...field} className="w-full p-2 border rounded" />
                  {fieldState.error && (
                    <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select {...field} className="w-full p-2 border rounded">
                    <option value="">Select type</option>
                    <option value="A">Batchlet</option>
                    <option value="B">Chunk</option>
                    <option value="C">Chunk with Partition</option>
                  </select>
                  {fieldState.error && (
                    <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />
            {(typeValue === "B" || typeValue === "C") ? (
              <FormField
                control={form.control}
                name="addProcessor"
                render={({ field }) => (
                  <div className="flex flex-col items-center">
                    <label htmlFor="addProcessor" className="block text-sm font-medium mb-1 text-center">
                      Add Processor
                    </label>
                    <input
                      type="checkbox"
                      id="addProcessor"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-5 h-5"
                    />
                  </div>
                )}
              />
            ) : (
              <div></div>
            )}
            <div></div>
          </div>
          <div className="col-span-1 lg:col-span-4 flex flex-col sm:flex-row justify-between gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="w-full sm:w-auto"
            >
              Back
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Next
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleFinish}
              className="w-full sm:w-auto"
            >
              Finish
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default DynamicStepsScreen;