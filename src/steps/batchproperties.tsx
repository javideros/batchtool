import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useFormStep } from "@/hooks/use-form-step";
import { useFieldArray } from "react-hook-form";
import z from "zod";
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const propertySchema = z.object({
  batchProperties: z.array(
    z.object({
      key: z.string().min(1, "Key required"),
      value: z.string().min(1, "Value required"),
      type: z.enum(["String", "Long", "Date", "Double"], { required_error: "Type required" }),
    })
  ) // <-- no .min(1)
});

function BatchPropertiesScreen({ step }: { step: number }) {
  const { formData, setFormData, resetAll } = useFormStore();

  const { form, handleNext, handlePrevious } = useFormStep({
    schema: propertySchema,
    currentStep: step,
    defaultValues: {
      batchProperties: formData?.batchProperties ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "batchProperties",
  });

  const hasEmptyProperty = form.watch("batchProperties").some(
    (p: any) => !p.key?.trim() || !p.value?.trim() || !p.type
  );
  const hasPropertyError = form.formState.errors.batchProperties?.some?.(
    (err: any) => err?.key || err?.value || err?.type
  );
  const disableAdd = hasEmptyProperty || hasPropertyError;

  const handleSubmit = (data: any) => {
    setFormData({
      ...formData,
      batchProperties: data.batchProperties,
    });
    handleNext(data);
  };

  const handleReset = () => {
    resetAll();
    form.reset({ batchProperties: [] });
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-center">Batch Properties</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[120px]">
            {fields.length === 0 ? (
              <>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1 opacity-50">Key</label>
                  <input disabled className="w-full p-2 border rounded bg-gray-100 opacity-50" placeholder="Key" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1 opacity-50">Value</label>
                  <input disabled className="w-full p-2 border rounded bg-gray-100 opacity-50" placeholder="Value" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1 opacity-50">Type</label>
                  <select disabled className="w-full p-2 border rounded bg-gray-100 opacity-50">
                    <option>Type</option>
                  </select>
                </div>
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
                    name={`batchProperties.${idx}.key`}
                    render={({ field, fieldState }) => (
                      <div>
                        <label className="block text-sm font-medium mb-1">Key</label>
                        <input {...field} className="w-full p-2 border rounded" />
                        {fieldState.error && (
                          <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`batchProperties.${idx}.value`}
                    render={({ field, fieldState }) => {
                      const type = form.watch(`batchProperties.${idx}.type`);
                      return (
                        <div>
                          <label className="block text-sm font-medium mb-1">Value</label>
                          {type === "Date" ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={`w-full justify-start text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                                >
                                  {field.value
                                    ? new Date(field.value).toLocaleDateString()
                                    : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="start" className="p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={date => {
                                    field.onChange(date ? date.toISOString().slice(0, 10) : "");
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <input {...field} className="w-full p-2 border rounded" />
                          )}
                          {fieldState.error && (
                            <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name={`batchProperties.${idx}.type`}
                    render={({ field, fieldState }) => (
                      <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select {...field} className="w-full p-2 border rounded">
                          <option value="String">String</option>
                          <option value="Long">Long</option>
                          <option value="Date">Date</option>
                          <option value="Double">Double</option>
                        </select>
                        {fieldState.error && (
                          <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
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
          {/* Button row: span all columns on large screens */}
          <div className="col-span-1 lg:col-span-4 flex flex-col sm:flex-row justify-between gap-2 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => append({ key: "", value: "", type: "String" })}
              className="w-full sm:w-auto"
              disabled={disableAdd}
            >
              Add Property
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

export default BatchPropertiesScreen;
