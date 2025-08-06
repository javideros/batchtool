import { type FieldValues, type DefaultValues, useForm } from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import { useFormStore } from '@/lib/jsr352batchjobstore';
import type { FormData as JSR352BatchJobFormData } from '@/types/batch';

export interface useFormStepProps<T extends FieldValues> {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   schema?: z.ZodType<T, any, any>,
   currentStep?: number,
   defaultValues?: DefaultValues<T>,
}

export function useFormStep<T extends FieldValues>({
    schema,
    currentStep,
    defaultValues,
}: useFormStepProps<T>) {
    const { setCurrentStep, setFormData, getLatestState  } = useFormStore()

    const form = useForm<T>({
        ...(schema && { resolver: zodResolver(schema as z.ZodType<T, any, any>) }),
        mode: 'onChange',
        defaultValues: defaultValues || (getLatestState().formData as unknown as DefaultValues<T>),
    })

    const handleNext = (data: T) => {
        try {
            if (!data) {
                // eslint-disable-next-line no-console
                console.error('Invalid form data provided to handleNext: [DATA_REDACTED]');
                throw new Error('Form data is required');
            }
            setFormData(data as unknown as JSR352BatchJobFormData)
            setCurrentStep((currentStep ?? 0) + 1 )
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error in handleNext:', {
                error: error instanceof Error ? error.message : String(error),
                dataType: typeof data,
                currentStep
            });
            throw error;
        }
    }

    const moveNext = () => {
        setCurrentStep((currentStep ?? 0) + 1)
    }

    const handlePrevious = () => {
        setFormData(form.getValues() as unknown as JSR352BatchJobFormData)
        setCurrentStep((currentStep ?? 0) - 1)
    }

    return {
        form,
        setFormData,
        handleNext,
        moveNext,
        handlePrevious
    }
}
