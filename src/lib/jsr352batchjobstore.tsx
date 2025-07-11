import type { JSR352BatchJobFormData}  from  '@/types/global'
import type { JSX } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'



type FormState  = {
   currentStep: number
   formData: JSR352BatchJobFormData
   formId: string
   steps: { id: number; name: string; components: JSX.Element }[];
   setCurrentStep: (step: number) => void
   setFormData: (data: JSR352BatchJobFormData) => void
   setFormId: (id: string) => void
   resetForm: () => void
   getLastestState: () => FormState
   addStep: (step: { id: number; name: string; components: JSX.Element  }) => void
   insertStep: (index: number, step: { id: number; name: string; components: JSX.Element  }) => void
   removeStep: (index: number) => void
   validateStep: () => boolean
   pendingStep: number | null
   setPendingStep: (step: number | null) => void
   stepItems: Array<{
     stepName: string;
     batchletClass: string;
     stepListeners: Array<{ listenerName: string }>;
   }>;
   setStepItems: (items: FormState["stepItems"]) => void;
   dynamicStepsData: { [stepKey: string]: any };
   setDynamicStepData: (stepKey: string, data: any) => void;
   resetDynamicStepsData: () => void;
}
 //Add this helper function to get the lastest state
 const getStorageData = () => {
   try {
    const storageData = localStorage.getItem('form-stor age')
    if(!storageData) return null
    const parsedData = JSON.parse(storageData)
    return parsedData.state as FormState
   } catch(error){
    console.error('Error reading localStorage', error)
    return null
   }
 }

 export const useFormStore = create<FormState>() (
    persist(
        (set, get) => ({
          steps: [], //initialize an empty array to store the steps
          currentStep: 0,
          formData: {
                batchName: '',
                functionalAreaCd: 'ED',
                frequency: 'DLY',
                packageName: '',
                batchProperties: [],
                stepItems: []
            },
            formId: '',
            addStep: (step: { id: number; name: string; components: JSX.Element }) => set((state:FormState ) => ({  steps: [...state.steps, step] })) ,
            setSteps: (steps: { id: number; name: string; components: JSX.Element }[]) => set({ steps: steps }),
            setCurrentStep: (step: number) => set({ currentStep: step }),
            setFormData: (data) =>
                set((state) => ({
                    formData: { ...state.formData , ...data }
                })),
            setFormId: (id:string) => set({ formId: id }),
            resetForm : () => set({ currentStep: 0, formData: { batchName: '', functionalAreaCd: '', frequency: 'DLY', packageName: '', batchProperties: [], stepItems: [] }, formId: '' }),
            getLastestState: () => getStorageData() || get(),
            insertStep: (index, step) => set({ steps: [...get().steps.slice(0, index), step, ...get().steps.slice(index)] }),
            removeStep: (index) => set({ steps: [...get().steps.slice(0, index), ...get().steps.slice(index + 1)] }),
            validateStep: () => {
                const currentStep = get().steps[get().currentStep]
                if(!currentStep) return false
                const form = document.getElementById(get().formId) as HTMLFormElement
                if(!form) return false
                const formData = new FormData(form)
                const data = Object.fromEntries(formData.entries())
                const errors = currentStep.components.props.validate(data)
                if(errors) return false
                return true
            },
            pendingStep: null,
            setPendingStep: (step: number | null) => set({ pendingStep: step }),
            stepItems: [], // <-- Make sure this is an empty array, not undefined
            setStepItems: (items: FormState["stepItems"]) => set((state) => ({ stepItems: items })),
            dynamicStepsData: {}, // { [stepKey]: stepData }
            setDynamicStepData: (stepKey, data) =>
                set((state) => ({
                    dynamicStepsData: { ...state.dynamicStepsData, [stepKey]: data },
                })),
            resetDynamicStepsData: () =>
                set(() => ({
                    dynamicStepsData: {},
                })),
        }),
        {
            name: 'form-storage'
        }
    )
 )
