import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useChunkWriterForm } from "@/hooks/use-chunk-writer-form";
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { Edit, Settings, Plus, Trash2, ChevronLeft, ChevronRight, FileText, Save } from "lucide-react";

const ChunkWriterScreen: React.FC<{
  stepNumber: number;
  stepItemId?: string;
}> = ({ stepNumber, stepItemId }) => {
  const { form, fields, append, remove, propFields, appendProp, removeProp, handleSubmit, handlePrevious, formData, handleNumberInput } = useChunkWriterForm(stepNumber, stepItemId);
  const dataDestinationValue = form.watch("dataDestination");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Edit className="h-8 w-8" />
          Chunk Writer
        </h1>
        <p className="text-muted-foreground">Configure your chunk writer implementation</p>
      </div>
      
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Writer Configuration
          </CardTitle>
          <CardDescription>
            Configure your chunk writer implementation details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control as any}
                  name="writerClass"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Writer Class
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder={formData.packageName ? `${formData.packageName}.MyWriter` : "com.example.MyWriter"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control as any}
                  name="dataDestination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Destination</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="file">File</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="rest">REST Service</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {dataDestinationValue === "file" && (
                <FormField
                  control={form.control as any}
                  name="filenamePattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filename Pattern</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="output_*.csv" />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Output file pattern (e.g., output_*.csv, result_*.json)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(dataDestinationValue === "database" || dataDestinationValue === "rest") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control as any}
                    name="commitInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commit Interval</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            min="1"
                            onChange={(e) => handleNumberInput(e.target.value, field)}
                            placeholder="100"
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Number of records to commit at once
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {dataDestinationValue === "database" && (
                    <FormField
                      control={form.control as any}
                      name="writerTableName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Table Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="output_table" />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            Database table to write to
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {dataDestinationValue === "rest" && (
                    <FormField
                      control={form.control as any}
                      name="serviceUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service URL</FormLabel>
                          <FormControl>
                            <Input {...field} type="url" placeholder="https://api.example.com/write" />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            REST API endpoint for writing data
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {(dataDestinationValue === "database" || dataDestinationValue === "rest") && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Write Fields
                    </h4>
                    <Button
                      type="button"
                      onClick={() => append("")}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Field
                    </Button>
                  </div>
                  
                  {fields.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                      <p className="text-muted-foreground mb-2">No write fields defined</p>
                      <p className="text-sm text-muted-foreground">Click Add Field to specify fields to write</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((writeField, index) => (
                        <div key={writeField.id} className="p-4 bg-muted/50 rounded-lg border">
                          <FormField
                            control={form.control as any}
                            name={`writeFields.${index}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">
                                  Field {index + 1}
                                </FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="field_name"
                                    />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => remove(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Checkpoint Configuration */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Checkpoint Configuration
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Checkpoints save progress during chunk processing, enabling restarts from the last checkpoint instead of the beginning.
                </p>
                
                <FormField
                  control={form.control as any}
                  name="checkpointConfig.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 mt-1 accent-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          Enable Checkpoints
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Save progress periodically for restart capability
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                {form.watch("checkpointConfig.enabled") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control as any}
                      name="checkpointConfig.itemCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Checkpoint Every N Items
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              onChange={(e) => handleNumberInput(e.target.value, field)}
                              placeholder="1000"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Recommended: 1000-10000 for good performance
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control as any}
                      name="checkpointConfig.timeLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Checkpoint Every N Seconds (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === "" ? undefined : parseInt(val, 10));
                              }}
                              placeholder="300 (5 minutes)"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Time-based checkpointing (leave empty to disable)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control as any}
                      name="checkpointConfig.customPolicy"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Custom Checkpoint Policy (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="com.example.CustomCheckpointAlgorithm"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Custom Java class implementing CheckpointAlgorithm interface
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Custom Checkpoint Properties */}
                    {form.watch("checkpointConfig.customPolicy") && (
                      <div className="md:col-span-2 mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Custom Checkpoint Properties
                          </h5>
                          <Button
                            type="button"
                            onClick={() => {
                              const currentProps = form.getValues("checkpointConfig.customPolicyProperties") || [];
                              form.setValue("checkpointConfig.customPolicyProperties", [...currentProps, { key: "", value: "", type: "String" }]);
                            }}
                            size="sm"
                            className="gap-2"
                          >
                            <Plus className="h-3 w-3" />
                            Add Property
                          </Button>
                        </div>
                        
                        {(form.watch("checkpointConfig.customPolicyProperties") || []).map((_, index) => (
                          <div key={index} className="grid grid-cols-3 gap-2 mb-2 p-3 bg-muted/50 rounded-lg border">
                            <Input
                              {...form.register(`checkpointConfig.customPolicyProperties.${index}.key`)}
                              placeholder="threshold"
                              className="text-xs"
                            />
                            <Input
                              {...form.register(`checkpointConfig.customPolicyProperties.${index}.value`)}
                              placeholder="500"
                              className="text-xs"
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                const currentProps = form.getValues("checkpointConfig.customPolicyProperties") || [];
                                currentProps.splice(index, 1);
                                form.setValue("checkpointConfig.customPolicyProperties", currentProps);
                              }}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step Properties Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Step Properties
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure writer-specific properties (can reference job parameters)
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => appendProp({ key: "", value: "", type: "String" as const })}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Property
                  </Button>
                </div>
                
                {propFields.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-2">No step properties defined</p>
                    <p className="text-sm text-muted-foreground">Properties can reference job parameters like: #&#123;jobParameters['dataSource']&#125;</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {propFields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-muted/50 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control as any}
                            name={`stepProperties.${index}.key`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Property Key
                                </FormLabel>
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
                            control={form.control as any}
                            name={`stepProperties.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-xs">
                                  Property Value
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="value or #&#123;jobParameters['paramName']&#125;"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => removeProp(index)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <FormField
                            control={form.control as any}
                            name={`stepProperties.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Property Type
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="String">String</SelectItem>
                                    <SelectItem value="Number">Number</SelectItem>
                                    <SelectItem value="Boolean">Boolean</SelectItem>
                                    <SelectItem value="Date">Date</SelectItem>
                                  </SelectContent>
                                </Select>
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
            </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                <Button 
                  type="button" 
                  onClick={() => {
                    const { setDynamicStepData } = useFormStore.getState();
                    setDynamicStepData('chunkPhase', 'processor');
                  }}
                  className="w-full sm:w-auto gap-2"
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" variant="outline" className="w-full sm:w-auto gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChunkWriterScreen;