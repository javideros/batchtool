import { type FieldValues, type DefaultValues, useForm } from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import { useFormStore } from '@/lib/jsr352batchjobstore';
import type { JSR352BatchJobFormData } from '@/types/global';

export interface useFormStepProps<T extends FieldValues> {
   schema?: z.ZodSchema<T>,
   currentStep?: number,
   defaultValues?: DefaultValues<T>,
}

export function useFormStep<T extends FieldValues>({
    schema,
    currentStep,
    defaultValues,
}: useFormStepProps<T>) {
    const { setCurrentStep, setFormData, getLastestState  } = useFormStore()

    const form = useForm<T>({
        resolver: schema ? zodResolver(schema) : undefined,
        mode: 'onChange',
        defaultValues: defaultValues || (getLastestState().formData as unknown as DefaultValues<T>),
    })

    const handleNext = (data: T) => {
        setFormData(data as unknown as JSR352BatchJobFormData)
        setCurrentStep((currentStep ?? 0) + 1 )
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
