import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import z from "zod";
import { useFieldArray } from "react-hook-form";

// Java class with package regex
const javaClassRegex = /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*)$/;

// Schema: each listener must be a valid java class, and all must be unique
const stepListenersSchema = z.object({
  listeners: z
    .array(
      z.string()
        .trim()
        .min(1, "Listener name required")
        .regex(javaClassRegex, "Must be a valid Java package and class name, e.g. com.example.Listener1")
    )
    .refine(
      (arr) => new Set(arr).size === arr.length,
      { message: "Listener names must be unique" }
    ),
});

function StepListenersScreen({ step, stepItemId }: { step: number; stepItemId: string }) {
  const { stepItems, setStepItems } = useFormStore();
  const item = stepItems.find(si => si.id === stepItemId) || {};

  const { form, handleNext, handlePrevious } = useFormStep({
    schema: stepListenersSchema,
    currentStep: step,
    defaultValues: {
      listeners: item.listeners || [""],
    },
  });

  // Use react-hook-form's useFieldArray for dynamic fields
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "listeners",
  });

  const handleSubmit = (data: any) => {
    setStepItems(
      stepItems.map(si =>
        si.id === stepItemId ? { ...si, ...data } : si
      )
    );
    handleNext(data);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-center">Step Listeners</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {fields.map((field, idx) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`listeners.${idx}`}
              render={({ field, fieldState }) => (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    {...field}
                    className="w-full p-2 border rounded"
                    placeholder="com.example.Listener1"
                  />
                  <Button type="button" variant="outline" onClick={() => remove(idx)} disabled={fields.length === 1}>Remove</Button>
                  {fieldState.error && (
                    <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />
          ))}
          <Button type="button" onClick={() => append("")} className="mb-4">Add Listener</Button>
          <div className="flex gap-2 mt-4">
            <Button type="button" onClick={handlePrevious}>Back</Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default StepListenersScreen;