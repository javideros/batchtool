import React from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFieldArray } from "react-hook-form";
import z from "zod";

const jobParametersSchema = z.object({
  // Built-in required parameter
  asOfDate: z.object({
    name: z.literal("asOfDate"),
    type: z.literal("Date"),
    required: z.literal(true),
    description: z.string().min(1, "Description required"),
  }),
  
  // Optional common parameters
  chunkSize: z.object({
    enabled: z.boolean(),
    name: z.literal("chunkSize"),
    type: z.literal("Long"),
    required: z.boolean(),
    defaultValue: z.string().optional(),
    description: z.string().min(1, "Description required"),
  }).optional(),
  
  dataSource: z.object({
    enabled: z.boolean(),
    name: z.literal("dataSource"),
    type: z.literal("String"),
    required: z.boolean(),
    defaultValue: z.string().optional(),
    description: z.string().min(1, "Description required"),
  }).optional(),
  
  // Custom parameters
  customParameters: z.array(
    z.object({
      name: z.string()
        .trim()
        .min(1, "Parameter name required")
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Must be a valid parameter name (letters, numbers, underscore)"),
      type: z.enum(["String", "Long", "Double", "Date"]),
      required: z.boolean(),
      defaultValue: z.string().optional(),
      description: z.string().min(1, "Description required"),
    })
  ).optional(),
});

interface JobParametersScreenProps {
  stepNumber: number;
}

const JobParametersScreen: React.FC<JobParametersScreenProps> = ({ stepNumber }) => {
  const { formData, setFormData } = useFormStore();

  const { form, handleNext, handlePrevious } = useFormStep({
    schema: jobParametersSchema,
    currentStep: stepNumber,
    defaultValues: {
      asOfDate: {
        name: "asOfDate",
        type: "Date",
        required: true,
        description: "The as-of date for batch processing (system managed)",
      },
      chunkSize: {
        enabled: formData.jobParameters?.chunkSize?.enabled || false,
        name: "chunkSize",
        type: "Long",
        required: formData.jobParameters?.chunkSize?.required || false,
        defaultValue: formData.jobParameters?.chunkSize?.defaultValue || "100",
        description: formData.jobParameters?.chunkSize?.description || "Number of items to process in each chunk",
      },
      dataSource: {
        enabled: formData.jobParameters?.dataSource?.enabled || false,
        name: "dataSource",
        type: "String",
        required: formData.jobParameters?.dataSource?.required || false,
        defaultValue: formData.jobParameters?.dataSource?.defaultValue || "",
        description: formData.jobParameters?.dataSource?.description || "Data source identifier or path",
      },
      customParameters: formData.jobParameters?.customParameters || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customParameters",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (data: any) => {
    // Build the job parameters array
    const jobParameters = [];
    
    // Always include asOfDate
    jobParameters.push(data.asOfDate);
    
    // Include optional parameters if enabled
    if (data.chunkSize?.enabled) {
      jobParameters.push({
        name: "chunkSize",
        type: "Long",
        required: data.chunkSize.required,
        defaultValue: data.chunkSize.defaultValue,
        description: data.chunkSize.description,
      });
    }
    
    if (data.dataSource?.enabled) {
      jobParameters.push({
        name: "dataSource",
        type: "String",
        required: data.dataSource.required,
        defaultValue: data.dataSource.defaultValue,
        description: data.dataSource.description,
      });
    }
    
    // Add custom parameters
    if (data.customParameters) {
      jobParameters.push(...data.customParameters);
    }

    setFormData({ ...formData, jobParameters: data });
    handleNext(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          ⚙️ Job Parameters
        </h1>
        <p className="text-muted-foreground">Define runtime parameters for your batch job</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Parameter Configuration
          </CardTitle>
          <CardDescription>
            Configure parameters that will be passed to your job at runtime
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            
              {/* Built-in Required Parameter */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">📅 Required Parameter</h3>
                <FormField
                  control={form.control}
                  name="asOfDate.description"
                  render={({ field, fieldState }) => (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-medium text-blue-700">asOfDate</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">Date</span>
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">Required</span>
                      </div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Description
                      </label>
                      <input
                        {...field}
                        className="w-full p-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="The as-of date for batch processing"
                      />
                      {fieldState.error && (
                        <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Optional Common Parameters */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">🔧 Optional Common Parameters</h3>
                
                {/* Chunk Size Parameter */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <FormField
                    control={form.control}
                    name="chunkSize.enabled"
                    render={({ field }) => (
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="font-medium">chunkSize</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm">Long</span>
                      </div>
                    )}
                  />
                  
                  {form.watch("chunkSize.enabled") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="chunkSize.required"
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4 text-red-600"
                            />
                            <label className="text-sm">Required at runtime</label>
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="chunkSize.defaultValue"
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium mb-1">Default Value</label>
                            <input
                              {...field}
                              type="number"
                              className="w-full p-2 border border-gray-300 rounded"
                              placeholder="100"
                            />
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="chunkSize.description"
                        render={({ field }) => (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <input
                              {...field}
                              className="w-full p-2 border border-gray-300 rounded"
                              placeholder="Number of items to process in each chunk"
                            />
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Data Source Parameter */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <FormField
                    control={form.control}
                    name="dataSource.enabled"
                    render={({ field }) => (
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="font-medium">dataSource</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm">String</span>
                      </div>
                    )}
                  />
                  
                  {form.watch("dataSource.enabled") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dataSource.required"
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4 text-red-600"
                            />
                            <label className="text-sm">Required at runtime</label>
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dataSource.defaultValue"
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium mb-1">Default Value</label>
                            <input
                              {...field}
                              className="w-full p-2 border border-gray-300 rounded"
                              placeholder="/data/input/"
                            />
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dataSource.description"
                        render={({ field }) => (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <input
                              {...field}
                              className="w-full p-2 border border-gray-300 rounded"
                              placeholder="Data source identifier or path"
                            />
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Parameters */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">➕ Custom Parameters</h3>
                  <Button
                    type="button"
                    onClick={() => append({
                      name: "",
                      type: "String",
                      required: false,
                      defaultValue: "",
                      description: "",
                    })}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all"
                  >
                    Add Parameter
                  </Button>
                </div>
                
                {fields.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                    No custom parameters defined. Click "Add Parameter" to create custom runtime parameters.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name={`customParameters.${index}.name`}
                            render={({ field, fieldState }) => (
                              <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-gray-300 rounded"
                                  placeholder="paramName"
                                />
                                {fieldState.error && (
                                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                                )}
                              </div>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`customParameters.${index}.type`}
                            render={({ field }) => (
                              <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <select {...field} className="w-full p-2 border border-gray-300 rounded">
                                  <option value="String">String</option>
                                  <option value="Long">Long</option>
                                  <option value="Double">Double</option>
                                  <option value="Date">Date</option>
                                </select>
                              </div>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`customParameters.${index}.required`}
                            render={({ field }) => (
                              <div className="flex items-center justify-center">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="w-4 h-4 text-red-600"
                                  />
                                  <label className="text-sm">Required</label>
                                </div>
                              </div>
                            )}
                          />
                          
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => remove(index)}
                              className="w-full px-3 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </Button>
                          </div>
                          
                          <FormField
                            control={form.control}
                            name={`customParameters.${index}.defaultValue`}
                            render={({ field }) => (
                              <div>
                                <label className="block text-sm font-medium mb-1">Default Value</label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-gray-300 rounded"
                                  placeholder="Optional default"
                                />
                              </div>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`customParameters.${index}.description`}
                            render={({ field, fieldState }) => (
                              <div className="md:col-span-3">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-gray-300 rounded"
                                  placeholder="Parameter description"
                                />
                                {fieldState.error && (
                                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <Button type="submit" variant="outline" className="w-full sm:w-auto ">
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

export default JobParametersScreen;