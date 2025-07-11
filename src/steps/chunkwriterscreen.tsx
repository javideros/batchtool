import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import z from "zod";

const chunkWriterSchema = z.object({
  writerClass: z.string()
    .trim()
    .min(1, "Writer class required")
    .regex(
      /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*)$/,
      "Must be a valid Java package and class name, e.g. com.example.MyWriter"
    ),
});

function ChunkWriterScreen({ step, stepItemId }: { step: number; stepItemId: string }) {
  const { stepItems, setStepItems } = useFormStore();
  const item = stepItems.find(si => si.id === stepItemId) || {};

  const { form, handleNext, handlePrevious } = useFormStep({
    schema: chunkWriterSchema,
    currentStep: step,
    defaultValues: {
      writerClass: item.writerClass || "",
    },
  });

  const handleSubmit = (data: any) => {
    setStepItems(
      stepItems.map(si =>
        si.id === stepItemId ? { ...si, writerClass: data.writerClass } : si
      )
    );
    handleNext(data);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-center">Chunk Writer</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="writerClass"
            render={({ field, fieldState }) => (
              <div>
                <label className="block text-sm font-medium mb-1">Writer Class</label>
                <input {...field} className="w-full p-2 border rounded" />
                {fieldState.error && (
                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
          <div className="flex gap-2 mt-4">
            <Button type="button" onClick={handlePrevious}>Back</Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ChunkWriterScreen;