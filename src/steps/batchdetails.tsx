import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useFormStep } from "@/hooks/use-form-step";
import { useFormStore } from "@/lib/jsr352batchjobstore";
import z from "zod";

const javaPackageRegex = /^([a-z][a-z0-9_]*\.)+[a-z][a-z0-9_]*$/;

const jsr355BatchSchema = z.object({
  batchName: z.string().min(1).max(25),
  functionalAreaCd: z.string().min(1, 'Please select a functional area'),
  frequency: z.string().min(1, 'Please select a batch job frequency of execution'),
  packageName: z.string()
    .trim()
    .min(1, { message: "Please enter the Java package name" })
    .regex(
      javaPackageRegex,
      { message: "Must be a valid Java package name, e.g. com.example.batch" }
    ),
});

const batchletDefinitionSchema = z.object({
  batchletClass: z.string().min(1, "Batchlet class is required"),
});

function BatchDetailsScreen({ step }: { step: number }) {
  const batchDetails = useFormStore(state => state.formData ?? {});
  const { setFormData, resetAll, setCurrentStep } = useFormStore();

  const { form, handleNext, handlePrevious } = useFormStep({
    schema: jsr355BatchSchema,
    currentStep: step,
    defaultValues: batchDetails, // <-- Use stored data!
  });

  const handleSubmit = (data: any) => {
    setFormData(data); // <-- Save to store (and localStorage)
    handleNext(data);
  };

  const handleReset = () => {
    resetAll(); // <-- Clear everything
    form.reset({});
    setCurrentStep(0);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full mx-auto">
      <h1 className="text-lg font-semibold mb-2 text-center">Batch Details</h1>
      <span className="block text-sm text-gray-500 mb-4 text-center">Step: {step}</span>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <FormField control={form.control} name="batchName" render={({ field, fieldState }) => (
            <div>
              <label htmlFor="batchName" className="block text-sm font-medium mb-1">Batch Name</label>
              <input
                {...field}
                id="batchName" // <-- Add this line!
                className="w-full p-2 border rounded"
              />
              {fieldState.error && (
                <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
              )}
            </div>
          )} />
          <FormField control={form.control} name="functionalAreaCd" render={({ field, fieldState }) => (
            <div>
              <label htmlFor="functionalAreaCd" className="block text-sm font-medium mb-1">Functional Area</label>
              <select {...field} id="functionalAreaCd" className="w-full p-2 border rounded">
                <option value="">Select a functional area</option>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
              </select>
              {fieldState.error && (
                <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
              )}
            </div>
          )} />
          <FormField control={form.control} name="frequency" render={({ field, fieldState }) => (
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium mb-1">Batch Job Frequency</label>
              <select {...field} id="frequency" className="w-full p-2 border rounded">
                <option value="">Select a batch job frequency of execution</option>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
              </select>
              {fieldState.error && (
                <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
              )}
            </div>
          )} />
          <FormField
            control={form.control}
            name="packageName"
            render={({ field, fieldState }) => (
              <div>
                <label htmlFor="packageName" className="block text-sm font-medium mb-1">Package Name</label>
                <input {...field} type="text" id="packageName" className="w-full p-2 border rounded" />
                {fieldState.error && (
                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
          {/* Button row: span all columns on large screens */}
          <div className="col-span-1 lg:col-span-4 flex flex-col sm:flex-row justify-between gap-2 mt-6">
            <Button type="button" variant="secondary" onClick={handleReset} className="w-full sm:w-auto">
              Reset
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default BatchDetailsScreen;