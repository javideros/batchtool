import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormStep } from "@/hooks/use-form-step";
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { FileText, Building2, Clock, Package, Target, RotateCcw, ChevronRight, Settings } from "lucide-react";
import z from "zod";



const javaPackageRegex = /^([a-z][a-z0-9_]*\.)+[a-z][a-z0-9_]*$/;

const jsr355BatchSchema = z.object({
  batchName: z.string()
    .min(1, "Batch name is required")
    .max(25, "Batch name must be 25 characters or less")
    .regex(/^[A-Z_]+$/, "Batch name must contain only uppercase letters and underscores"),
  functionalAreaCd: z.string().min(1, "Please select a functional area"),
  frequency: z
    .string()
    .min(1, "Please select a batch job frequency of execution"),
  packageName: z
    .string()
    .trim()
    .min(1, { message: "Please enter the Java package name" })
    .regex(javaPackageRegex, {
      message: "Must be a valid Java package name, e.g. com.example.batch",
    }),
});

const BatchDetailsScreen: React.FC<{ stepNumber: number }> = ({
  stepNumber,
}) => {
  const { formData: batchDetails = {}, setFormData, resetForm, setCurrentStep } = useFormStore();

  const { form, handleNext } = useFormStep({
    schema: jsr355BatchSchema,
    currentStep: stepNumber,
    defaultValues: batchDetails,
  });

  const handleSubmit = (data: z.infer<typeof jsr355BatchSchema>) => {
    const finalBatchName = (data.batchName && data.functionalAreaCd && data.frequency) 
      ? `${data.functionalAreaCd}-${data.batchName}-${data.frequency}`
      : data.batchName;
    
    const formDataWithGeneratedName = {
      ...data,
      generatedBatchName: finalBatchName
    };
    
    setFormData(formDataWithGeneratedName);
    handleNext(formDataWithGeneratedName);
  };

  const handleReset = () => {
    resetForm();
    form.reset({});
    setCurrentStep(0);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Settings className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          Batch Job Configuration
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">Configure your batch job details</p>
      </div>
      
      <Card className="transition-colors duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Enter the basic details for your batch job configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="batchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Batch Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="MY_BATCH_JOB" 
                          {...field}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          aria-required="true"
                          aria-describedby={`${field.name}-description`}
                        />
                      </FormControl>
                      <div id={`${field.name}-description`} className="sr-only">
                        Enter a batch name using only uppercase letters and underscores, maximum 25 characters
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="functionalAreaCd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Functional Area
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} required>
                        <FormControl>
                          <SelectTrigger aria-required="true">
                            <SelectValue placeholder="Select a functional area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ED">Eligibility</SelectItem>
                          <SelectItem value="DC">Data Collection</SelectItem>
                          <SelectItem value="FN">Finance</SelectItem>
                          <SelectItem value="IN">Interfaces</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Batch Job Frequency
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} required>
                        <FormControl>
                          <SelectTrigger aria-required="true">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DLY">Daily</SelectItem>
                          <SelectItem value="WKY">Weekly</SelectItem>
                          <SelectItem value="MTH">Monthly</SelectItem>
                          <SelectItem value="YRL">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Generated Batch Name Display */}
                {(() => {
                  const batchName = form.watch("batchName");
                  const functionalArea = form.watch("functionalAreaCd");
                  const frequency = form.watch("frequency");
                  
                  const finalBatchName = (batchName && functionalArea && frequency) 
                    ? `${functionalArea}-${batchName}-${frequency}`
                    : "";
                  
                  return finalBatchName ? (
                    <div className="sm:col-span-2 lg:col-span-2 xl:col-span-3 2xl:col-span-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span className="text-sm font-medium">Generated Batch Name</span>
                      </div>
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono font-semibold">
                        {finalBatchName}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Format: {functionalArea} (Functional Area) - {batchName} (Batch Name) - {frequency} (Frequency)
                      </p>
                    </div>
                  ) : null;
                })()}
                
                <FormField
                  control={form.control}
                  name="packageName"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2 lg:col-span-2 xl:col-span-3 2xl:col-span-4">
                      <FormLabel className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Package Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="com.example.batch" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                          aria-required="true"
                          aria-describedby={`${field.name}-description`}
                        />
                      </FormControl>
                      <div id={`${field.name}-description`} className="sr-only">
                        Enter a valid Java package name using lowercase letters, dots, and underscores
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-between items-center pt-6">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  variant="outline"
                >
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
};

export default BatchDetailsScreen;
