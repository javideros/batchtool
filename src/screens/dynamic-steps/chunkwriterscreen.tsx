import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useChunkWriterForm } from "@/hooks/use-chunk-writer-form";

const ChunkWriterScreen: React.FC<{
  stepNumber: number;
  stepItemId?: string;
}> = ({ stepNumber, stepItemId }) => {
  const { form, fields, append, remove, propFields, appendProp, removeProp, handleSubmit, handlePrevious, formData, handleNumberInput } = useChunkWriterForm(stepNumber, stepItemId);
  const dataDestinationValue = form.watch("dataDestination");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          📝 Chunk Writer
        </h1>
        <p className="text-muted-foreground">Configure your chunk writer implementation</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Writer Configuration
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
                    <FormItem>
                      <FormLabel>Writer Class</FormLabel>
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
                    <h4 className="text-lg font-semibold text-gray-800">
                      📋 Write Fields
                    </h4>
                    <Button
                      type="button"
                      onClick={() => append("")}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all"
                    >
                      ➕ Add Field
                    </Button>
                  </div>
                  
                  {fields.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                      No write fields defined. Click Add Field to specify fields to write.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {fields.map((writeField, index) => (
                        <div key={writeField.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <FormField
                              control={form.control as any}
                              name={`writeFields.${index}`}
                              render={({ field, fieldState }) => (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Field {index + 1}
                                  </label>
                                  <input
                                    {...field}
                                    className="w-full p-2 border border-gray-300 rounded focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all"
                                    placeholder="field_name"
                                  />
                                  {fieldState.error && (
                                    <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => remove(index)}
                            className="px-3 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            🗑️ Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Checkpoint Configuration */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  📍 Checkpoint Configuration
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Checkpoints save progress during chunk processing, enabling restarts from the last checkpoint instead of the beginning.
                </p>
                
                <FormField
                  control={form.control as any}
                  name="checkpointConfig.enabled"
                  render={({ field }) => (
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <label className="font-medium text-blue-800">
                          Enable Checkpoints
                        </label>
                        <p className="text-sm text-blue-600 mt-1">
                          Save progress periodically for restart capability
                        </p>
                      </div>
                    </div>
                  )}
                />
                
                {form.watch("checkpointConfig.enabled") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control as any}
                      name="checkpointConfig.itemCount"
                      render={({ field, fieldState }) => (
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            📊 Checkpoint Every N Items
                          </label>
                          <input
                            {...field}
                            type="number"
                            min="1"
                            onChange={(e) => handleNumberInput(e.target.value, field)}
                            className="w-full p-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="1000"
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            Recommended: 1000-10000 for good performance
                          </p>
                          {fieldState.error && (
                            <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                          )}
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={form.control as any}
                      name="checkpointConfig.timeLimit"
                      render={({ field, fieldState }) => (
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            ⏱️ Checkpoint Every N Seconds (Optional)
                          </label>
                          <input
                            {...field}
                            type="number"
                            min="1"
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val === "" ? undefined : parseInt(val, 10));
                            }}
                            className="w-full p-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="300 (5 minutes)"
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            Time-based checkpointing (leave empty to disable)
                          </p>
                          {fieldState.error && (
                            <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                          )}
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={form.control as any}
                      name="checkpointConfig.customPolicy"
                      render={({ field }) => (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            🎛️ Custom Checkpoint Policy (Optional)
                          </label>
                          <input
                            {...field}
                            className="w-full p-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="com.example.CustomCheckpointAlgorithm"
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            Custom Java class implementing CheckpointAlgorithm interface
                          </p>
                        </div>
                      )}
                    />
                    
                    {/* Custom Checkpoint Properties */}
                    {form.watch("checkpointConfig.customPolicy") && (
                      <div className="md:col-span-2 mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-semibold text-blue-800">
                            ⚙️ Custom Checkpoint Properties
                          </h5>
                          <Button
                            type="button"
                            onClick={() => {
                              const currentProps = form.getValues("checkpointConfig.customPolicyProperties") || [];
                              form.setValue("checkpointConfig.customPolicyProperties", [...currentProps, { key: "", value: "", type: "String" }]);
                            }}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                          >
                            ➕ Add Property
                          </Button>
                        </div>
                        
                        {(form.watch("checkpointConfig.customPolicyProperties") || []).map((_, index) => (
                          <div key={index} className="grid grid-cols-3 gap-2 mb-2 p-2 bg-blue-25 rounded border">
                            <input
                              {...form.register(`checkpointConfig.customPolicyProperties.${index}.key`)}
                              className="p-2 border border-blue-300 rounded text-xs"
                              placeholder="threshold"
                            />
                            <input
                              {...form.register(`checkpointConfig.customPolicyProperties.${index}.value`)}
                              className="p-2 border border-blue-300 rounded text-xs"
                              placeholder="500"
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                const currentProps = form.getValues("checkpointConfig.customPolicyProperties") || [];
                                currentProps.splice(index, 1);
                                form.setValue("checkpointConfig.customPolicyProperties", currentProps);
                              }}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                            >
                              🗑️
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
                    <h4 className="text-lg font-semibold text-gray-800">
                      ⚙️ Step Properties
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure writer-specific properties (can reference job parameters)
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => appendProp({ key: "", value: "", type: "String" as const })}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all"
                  >
                    ➕ Add Property
                  </Button>
                </div>
                
                {propFields.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">No step properties defined</p>
                    <p className="text-sm text-gray-400">Properties can reference job parameters like: #&#123;jobParameters['dataSource']&#125;</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {propFields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <FormField
                            control={form.control as any}
                            name={`stepProperties.${index}.key`}
                            render={({ field, fieldState }) => (
                              <div>
                                <label className="block text-xs font-medium text-green-700 mb-1">
                                  Property Key
                                </label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-green-300 rounded focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                                  placeholder="propertyName"
                                />
                                {fieldState.error && (
                                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                                )}
                              </div>
                            )}
                          />
                          
                          <FormField
                            control={form.control as any}
                            name={`stepProperties.${index}.value`}
                            render={({ field, fieldState }) => (
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-green-700 mb-1">
                                  Property Value
                                </label>
                                <input
                                  {...field}
                                  className="w-full p-2 border border-green-300 rounded focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                                  placeholder="value or #&#123;jobParameters['paramName']&#125;"
                                />
                                {fieldState.error && (
                                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                                )}
                              </div>
                            )}
                          />
                          
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removeProp(index)}
                              className="w-full px-3 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              🗑️ Remove
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <FormField
                            control={form.control as any}
                            name={`stepProperties.${index}.type`}
                            render={({ field }) => (
                              <div>
                                <label className="block text-xs font-medium text-green-700 mb-1">
                                  Property Type
                                </label>
                                <select 
                                  {...field} 
                                  className="w-full p-2 border border-green-300 rounded focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all bg-white"
                                >
                                  <option value="String">String</option>
                                  <option value="Number">Number</option>
                                  <option value="Boolean">Boolean</option>
                                  <option value="Date">Date</option>
                                </select>
                              </div>
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
}

export default ChunkWriterScreen;