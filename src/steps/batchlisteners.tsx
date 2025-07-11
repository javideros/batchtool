import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useFormStep } from "@/hooks/use-form-step";
import { useFieldArray } from "react-hook-form";
import z from "zod";
import { useFormStore } from "@/lib/jsr352batchjobstore";

const javaPackageClassRegex = /^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*)$/;

const batchListenersSchema = z.object({
  batchListeners: z.array(
    z.object({
      name: z.string()
        .trim()
        .min(1, { message: "Please enter a listener java package and class name" })
        .regex(
          javaPackageClassRegex,
          { message: "Must be a valid Java package and class name, e.g. com.example.MyListener" }
        ),
    })
  )
}).refine(
  (data) => {
    const classNames = data.batchListeners
      .map((l) => l.name.split('.').pop()?.trim())
      .filter(Boolean);
    return new Set(classNames).size === classNames.length;
  },
  {
    message: "Listener class names must be unique",
    path: ["batchListeners"],
  }
);

function BatchListenersScreen({ step }: { step: number }) {
  const { formData, packageName } = useFormStore(); // <-- get formData from store

  const { form, handleNext, handlePrevious } = useFormStep({
    schema: batchListenersSchema,
    currentStep: step,
    defaultValues: {
      batchListeners: formData?.batchListeners ?? [], // <-- use saved data if present
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "batchListeners",
  });

  const hasEmptyListener = form.watch("batchListeners").some((l: any) => !l.name?.trim());
  const hasListenerError = form.formState.errors.batchListeners?.some?.(
    (err: any) => err?.name
  );
  const disableAdd = hasEmptyListener || hasListenerError;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-center">Batch Listeners</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleNext)} className="space-y-4">
          {/* Show array-level error */}
          {(form.formState.errors.batchListeners?.message ||
            form.formState.errors.batchListeners?.root?.message) && (
            <div className="text-red-500 text-sm mb-2 text-center">
              {form.formState.errors.batchListeners?.message ||
                form.formState.errors.batchListeners?.root?.message}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[120px]">
            {fields.length === 0 ? (
              <>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1 opacity-50">Listener Name</label>
                  <input disabled className="w-full p-2 border rounded bg-gray-100 opacity-50" placeholder="Listener Name" />
                </div>
                <div className="col-span-1"></div>
                <div className="col-span-1"></div>
                <div className="col-span-1 flex items-end">
                  <Button disabled variant="destructive" className="w-full opacity-50">
                    Remove
                  </Button>
                </div>
              </>
            ) : (
              fields.map((field, idx) => (
                <div key={field.id} className="contents lg:contents">
                  <FormField
                    control={form.control}
                    name={`batchListeners.${idx}.name`}
                    render={({ field, fieldState }) => (
                      <div>
                        <label className="block text-sm font-medium mb-1">Listener Name</label>
                        <input
                          {...field}
                          className="w-full p-2 border rounded"
                          placeholder={packageName ? `${packageName}.MyListener` : "com.example.MyListener"}
                        />
                        {fieldState.error && (
                          <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                  <div className="col-span-1"></div>
                  <div className="col-span-1"></div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(idx)}
                      className="w-full"
                      disabled={fields.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="col-span-1 lg:col-span-4 flex flex-col sm:flex-row justify-between gap-2 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => append({ name: packageName ? `${packageName}.MyListener` : "com.example.MyListener" })}
              className="w-full sm:w-auto"
              disabled={disableAdd}
            >
              Add Listener
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button type="button" variant="outline" onClick={handlePrevious} className="w-full sm:w-auto">
                Back
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Next
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default BatchListenersScreen;