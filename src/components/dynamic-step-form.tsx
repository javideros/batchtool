import React from 'react';
import { FormField, Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

type DynamicStepFormProps = {
  form: UseFormReturn;
  typeValue: string;
  onSubmit: (data: any) => void;
  onPrevious: () => void;
  onFinish: () => void;
};

export const DynamicStepForm: React.FC<DynamicStepFormProps> = ({
  form,
  typeValue,
  onSubmit,
  onPrevious,
  onFinish
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="stepName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Step Name</FormLabel>
                <FormControl>
                  <Input placeholder="my_step_1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A">Batchlet</SelectItem>
                    <SelectItem value="B">Chunk</SelectItem>
                    <SelectItem value="C">Chunk with Partition</SelectItem>
                    <SelectItem value="D">Decision</SelectItem>
                    <SelectItem value="S">Split/Parallel</SelectItem>
                    <SelectItem value="F">Flow</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {(typeValue === "B" || typeValue === "C") && (
            <FormField
              control={form.control}
              name="addProcessor"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Add Processor
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>
        
        <div className="flex justify-between items-center pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-3">
            <Button type="submit" variant="default">
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onFinish}
            >
              <Target className="mr-2 h-4 w-4" />
              Finish
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};