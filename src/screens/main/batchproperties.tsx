import React from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useFormStep } from "@/hooks/use-form-step";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFieldArray } from "react-hook-form";
import { Settings, Calendar, Plus, Trash2, Folder, FileText, Hash, Clock } from "lucide-react";
import z from "zod";

const batchPropertiesSchema = z.object({
  // Built-in required property
  asOfDate: z.object({
    name: z.literal("asOfDate"),
    type: z.literal("Date"),
    required: z.literal(true),
    description: z.string().min(1, "Description required"),
  }),
  
  // Optional common properties
  pageSize: z.object({
    enabled: z.boolean(),
    name: z.literal("pageSize"),
    type: z.literal("Number"),
    required: z.boolean(),
    defaultValue: z.string().optional(),
    description: z.string().min(1, "Description required"),
  }).optional(),
  
  inputFilePattern: z.object({
    enabled: z.boolean(),
    name: z.literal("inputFilePattern"),
    type: z.literal("String"),
    required: z.boolean(),
    defaultValue: z.string().optional(),
    description: z.string().min(1, "Description required"),
  }).optional(),
  
  archiveFolder: z.object({
    enabled: z.boolean(),
    name: z.literal("archiveFolder"),
    type: z.literal("String"),
    required: z.boolean(),
    defaultValue: z.string().optional(),
    description: z.string().min(1, "Description required"),
  }).optional(),
  
  outputFolder: z.object({
    enabled: z.boolean(),
    name: z.literal("outputFolder"),
    type: z.literal("String"),
    required: z.boolean(),
    defaultValue: z.string().optional(),
    description: z.string().min(1, "Description required"),
  }).optional(),
  
  timestampFormat: z.object({
    enabled: z.boolean(),
    name: z.literal("timestampFormat"),
    type: z.literal("String"),
    required: z.boolean(),
    defaultValue: z.string().optional(),
    description: z.string().min(1, "Description required"),
  }).optional(),
  
  // Custom properties
  customProperties: z.array(
    z.object({
      name: z.string()
        .trim()
        .min(1, "Property name required")
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Must be a valid property name (letters, numbers, underscore)"),
      type: z.enum(["String", "Number", "Boolean", "Date"]),
      required: z.boolean(),
      defaultValue: z.string().optional(),
      description: z.string().min(1, "Description required"),
    })
  ).optional(),
});

interface BatchPropertiesScreenProps {
  stepNumber: number;
}

const BatchPropertiesScreen: React.FC<BatchPropertiesScreenProps> = ({ stepNumber }) => {
  const { formData, setFormData } = useFormStore();

  const { form, handleNext, handlePrevious } = useFormStep({
    schema: batchPropertiesSchema,
    currentStep: stepNumber,
    defaultValues: {
      asOfDate: {
        name: "asOfDate",
        type: "Date",
        required: true,
        description: "The process date for batch execution (system managed)",
      },
      pageSize: {
        enabled: formData.batchProperties?.pageSize?.enabled || false,
        name: "pageSize",
        type: "Number",
        required: formData.batchProperties?.pageSize?.required || false,
        defaultValue: formData.batchProperties?.pageSize?.defaultValue || "100",
        description: formData.batchProperties?.pageSize?.description || "Number of records to process per batch",
      },
      inputFilePattern: {
        enabled: formData.batchProperties?.inputFilePattern?.enabled || false,
        name: "inputFilePattern",
        type: "String",
        required: formData.batchProperties?.inputFilePattern?.required || false,
        defaultValue: formData.batchProperties?.inputFilePattern?.defaultValue || "*.csv",
        description: formData.batchProperties?.inputFilePattern?.description || "File pattern for input data files",
      },
      archiveFolder: {
        enabled: formData.batchProperties?.archiveFolder?.enabled || false,
        name: "archiveFolder",
        type: "String",
        required: formData.batchProperties?.archiveFolder?.required || false,
        defaultValue: formData.batchProperties?.archiveFolder?.defaultValue || "/archive/#{jobParameters['asOfDate']}",
        description: formData.batchProperties?.archiveFolder?.description || "Folder to archive processed input files",
      },
      outputFolder: {
        enabled: formData.batchProperties?.outputFolder?.enabled || false,
        name: "outputFolder",
        type: "String",
        required: formData.batchProperties?.outputFolder?.required || false,
        defaultValue: formData.batchProperties?.outputFolder?.defaultValue || "/output",
        description: formData.batchProperties?.outputFolder?.description || "Final destination folder for generated files",
      },
      timestampFormat: {
        enabled: formData.batchProperties?.timestampFormat?.enabled || false,
        name: "timestampFormat",
        type: "String",
        required: formData.batchProperties?.timestampFormat?.required || false,
        defaultValue: formData.batchProperties?.timestampFormat?.defaultValue || "yyyyMMdd_HHmmss",
        description: formData.batchProperties?.timestampFormat?.description || "Timestamp format for output file naming",
      },
      customProperties: formData.batchProperties?.customProperties || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customProperties",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (data: any) => {
    // Build the batch properties array
    const batchProperties = [];
    
    // Always include asOfDate
    batchProperties.push(data.asOfDate);
    
    // Include optional properties if enabled
    if (data.pageSize?.enabled) {
      batchProperties.push({
        name: "pageSize",
        type: "Number",
        required: data.pageSize.required,
        defaultValue: data.pageSize.defaultValue,
        description: data.pageSize.description,
      });
    }
    
    if (data.inputFilePattern?.enabled) {
      batchProperties.push({
        name: "inputFilePattern",
        type: "String",
        required: data.inputFilePattern.required,
        defaultValue: data.inputFilePattern.defaultValue,
        description: data.inputFilePattern.description,
      });
    }
    
    if (data.archiveFolder?.enabled) {
      batchProperties.push({
        name: "archiveFolder",
        type: "String",
        required: data.archiveFolder.required,
        defaultValue: data.archiveFolder.defaultValue,
        description: data.archiveFolder.description,
      });
    }
    
    if (data.outputFolder?.enabled) {
      batchProperties.push({
        name: "outputFolder",
        type: "String",
        required: data.outputFolder.required,
        defaultValue: data.outputFolder.defaultValue,
        description: data.outputFolder.description,
      });
    }
    
    if (data.timestampFormat?.enabled) {
      batchProperties.push({
        name: "timestampFormat",
        type: "String",
        required: data.timestampFormat.required,
        defaultValue: data.timestampFormat.defaultValue,
        description: data.timestampFormat.description,
      });
    }
    
    // Add custom properties
    if (data.customProperties) {
      batchProperties.push(...data.customProperties);
    }

    setFormData({ ...formData, batchProperties: data });
    handleNext(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Settings className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          Batch Properties
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">Configure job-level properties for your batch job</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Property Configuration
          </CardTitle>
          <CardDescription>
            Configure properties that will be available throughout your job execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            
              {/* Built-in Required Property */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Required Property
                </h3>
                <FormField
                  control={form.control}
                  name="asOfDate.description"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-medium text-blue-700 dark:text-blue-300">asOfDate</span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm">Date</span>
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm">Required</span>
                      </div>
                      <FormLabel className="text-blue-700 dark:text-blue-300">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400"
                          placeholder="The process date for batch execution"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Optional Common Properties */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Optional Common Properties
                </h3>
                
                {/* Page Size Property */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <FormField
                    control={form.control}
                    name="pageSize.enabled"
                    render={({ field }) => (
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-5 h-5 text-primary bg-background border-input rounded focus:ring-ring"
                        />
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">pageSize</span>
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm">Number</span>
                      </div>
                    )}
                  />
                  
                  {form.watch("pageSize.enabled") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pageSize.required"
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
                        name="pageSize.defaultValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Value</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="100"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pageSize.description"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Number of records to process per batch"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Input File Pattern Property */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <FormField
                    control={form.control}
                    name="inputFilePattern.enabled"
                    render={({ field }) => (
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-5 h-5 text-primary bg-background border-input rounded focus:ring-ring"
                        />
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">inputFilePattern</span>
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm">String</span>
                      </div>
                    )}
                  />
                  
                  {form.watch("inputFilePattern.enabled") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="inputFilePattern.required"
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
                        name="inputFilePattern.defaultValue"
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium mb-1">Default Value</label>
                            <input
                              {...field}
                              className=""
                              placeholder="*.csv"
                            />
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="inputFilePattern.description"
                        render={({ field }) => (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <input
                              {...field}
                              className=""
                              placeholder="File pattern for input data files"
                            />
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Archive Folder Property */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <FormField
                    control={form.control}
                    name="archiveFolder.enabled"
                    render={({ field }) => (
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-5 h-5 text-primary bg-background border-input rounded focus:ring-ring"
                        />
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">archiveFolder</span>
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm">String</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm text-xs"><Folder className="h-3 w-3" /> File Management</span>
                      </div>
                    )}
                  />
                  
                  {form.watch("archiveFolder.enabled") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="archiveFolder.required"
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
                        name="archiveFolder.defaultValue"
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium mb-1">Default Value</label>
                            <input
                              {...field}
                              className=""
                              placeholder="/archive/#{jobParameters['asOfDate']}"
                            />
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="archiveFolder.description"
                        render={({ field }) => (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <input
                              {...field}
                              className=""
                              placeholder="Folder to archive processed input files"
                            />
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Output Folder Property */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <FormField
                    control={form.control}
                    name="outputFolder.enabled"
                    render={({ field }) => (
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-5 h-5 text-primary bg-background border-input rounded focus:ring-ring"
                        />
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">outputFolder</span>
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm">String</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm text-xs"><Folder className="h-3 w-3" /> File Management</span>
                      </div>
                    )}
                  />
                  
                  {form.watch("outputFolder.enabled") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="outputFolder.required"
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
                        name="outputFolder.defaultValue"
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium mb-1">Default Value</label>
                            <input
                              {...field}
                              className=""
                              placeholder="/output"
                            />
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="outputFolder.description"
                        render={({ field }) => (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <input
                              {...field}
                              className=""
                              placeholder="Final destination folder for generated files"
                            />
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Timestamp Format Property */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <FormField
                    control={form.control}
                    name="timestampFormat.enabled"
                    render={({ field }) => (
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-5 h-5 text-primary bg-background border-input rounded focus:ring-ring"
                        />
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">timestampFormat</span>
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm">String</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm text-xs"><Folder className="h-3 w-3" /> File Management</span>
                      </div>
                    )}
                  />
                  
                  {form.watch("timestampFormat.enabled") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="timestampFormat.required"
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
                        name="timestampFormat.defaultValue"
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium mb-1">Default Value</label>
                            <input
                              {...field}
                              className=""
                              placeholder="yyyyMMdd_HHmmss"
                            />
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="timestampFormat.description"
                        render={({ field }) => (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <input
                              {...field}
                              className=""
                              placeholder="Timestamp format for output file naming (e.g., report_20241201_143022.csv)"
                            />
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Properties */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Custom Properties
                  </h3>
                  <Button
                    type="button"
                    onClick={() => append({
                      name: "",
                      type: "String",
                      required: false,
                      defaultValue: "",
                      description: "",
                    })}
                  >
                    <Plus className="h-4 w-4" />
                    Add Property
                  </Button>
                </div>
                
                {fields.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 bg-muted/50 rounded-lg">
                    No custom properties defined. Click "Add Property" to create custom job properties.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-muted/50 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name={`customProperties.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="propertyName"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`customProperties.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="String">String</SelectItem>
                                    <SelectItem value="Number">Number</SelectItem>
                                    <SelectItem value="Boolean">Boolean</SelectItem>
                                    <SelectItem value="Date">Date</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`customProperties.${index}.required`}
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
                              variant="destructive"
                              onClick={() => remove(index)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                          
                          <FormField
                            control={form.control}
                            name={`customProperties.${index}.defaultValue`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Default Value</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Optional default"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`customProperties.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-3">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Property description"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-6">
                <Button 
                  type="button" 
                  onClick={handlePrevious}
                  variant="outline"
                >
                  ← Back
                </Button>
                <Button type="submit" variant="outline">
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

export default BatchPropertiesScreen;