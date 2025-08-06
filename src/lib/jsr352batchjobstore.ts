/**
 * @fileoverview Zustand store for JSR-352 batch job form state management
 * @module lib/jsr352batchjobstore
 */

import type { FormData as JSR352BatchJobFormData } from '@/types/batch'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DynamicStepData, EnhancedStep } from "@/types/forms"

/** Type alias for enhanced step */
export type Step = EnhancedStep;

/**
 * Form state interface defining the complete application state
 */
type FormState  = {
   currentStep: number
   formData: JSR352BatchJobFormData
   formId: string
   steps: Step [];
   // eslint-disable-next-line no-unused-vars
   setCurrentStep: (step: number) => void
   // eslint-disable-next-line no-unused-vars
   setFormData: (data: JSR352BatchJobFormData) => void
   // eslint-disable-next-line no-unused-vars
   setFormId: (id: string) => void
   resetForm: () => void
   getLatestState: () => FormState
   // eslint-disable-next-line no-unused-vars
   addStep: (step: Step) => void
   // eslint-disable-next-line no-unused-vars
   insertStep: (index: number, step: Step) => void
   // eslint-disable-next-line no-unused-vars
   removeStep: (index: number) => void
   validateStep: () => boolean
   pendingStep: number | null
   // eslint-disable-next-line no-unused-vars
   setPendingStep: (step: number | null) => void
   // eslint-disable-next-line no-unused-vars
   setSteps: (steps: Step[]) => void;
   stepItems: Array<{
     id?: string;
     stepName?: string;
     type?: string;
     batchletClass?: string;
     readerClass?: string;
     processorClass?: string;
     writerClass?: string;
     listeners?: string[];
     addProcessor?: boolean;
   }>;
   // eslint-disable-next-line no-unused-vars
   setStepItems: (items: FormState["stepItems"]) => void;
   dynamicStepsData: DynamicStepData;
   // eslint-disable-next-line no-unused-vars
   setDynamicStepData: (stepKey: string, data: unknown) => void;
   resetDynamicStepsData: () => void;
}
/**
 * Creates initial form data with default values
 * @returns {JSR352BatchJobFormData} Initial form data
 */
const getInitialFormData = (): JSR352BatchJobFormData => ({
   batchName: '',
   functionalAreaCd: 'ED' as const,
   frequency: 'DLY' as const,
   packageName: '',
   stepItems: []
 });

/**
 * Creates initial application state
 * @param {Step[]} initialSteps - Initial steps array
 * @returns {Partial<FormState>} Initial state object
 */
const createInitialState = (initialSteps: Step[]) => ({
   currentStep: 0,
   formData: getInitialFormData(),
   formId: '',
   steps: initialSteps,
   stepItems: [],
   pendingStep: null,
   dynamicStepsData: {}
 });

// Memoized storage data getter with caching
let storageCache: FormState | null = null;
let lastCacheTime = 0;
/** Cache duration in milliseconds */
const CACHE_DURATION = 1000;

/**
 * Retrieves and caches form state from session storage
 * @returns {FormState | null} Cached form state or null if not found
 */
const getStorageData = (): FormState | null => {
   const now = Date.now();
   if (storageCache && (now - lastCacheTime) < CACHE_DURATION) {
     return storageCache;
   }

   try {
    const storageData = sessionStorage.getItem('form-storage')
    if(!storageData) {
      storageCache = null;
      lastCacheTime = now;
      return null;
    }
    
    const parsedData = JSON.parse(storageData)
    if (!parsedData || typeof parsedData !== 'object' || !parsedData.state) {
      // eslint-disable-next-line no-console
      console.error('Invalid storage data structure:', parsedData);
      storageCache = null;
      lastCacheTime = now;
      return null;
    }
    
    storageCache = parsedData.state as FormState;
    lastCacheTime = now;
    return storageCache;
   } catch(error){
    // eslint-disable-next-line no-console
    console.error('Error reading sessionStorage:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    storageCache = null;
    lastCacheTime = now;
    return null
   }
 }

/**
 * Zustand store hook for managing JSR-352 batch job form state
 * Includes persistence to session storage and step management
 * @returns {FormState} Form state and actions
 */
export const useFormStore = create<FormState>()(persist(
        (set, get) => ({
          steps: [], //initialize an empty array to store the steps
          currentStep: 0,
          formData: {
                batchName: '',
                functionalAreaCd: 'ED' as const,
                frequency: 'DLY' as const,
                packageName: '',
                stepItems: []
            },
            formId: '',
            // eslint-disable-next-line no-unused-vars
            addStep: (step: Step) => set((state: FormState) => ({ steps: [...state.steps, step] })),
            // eslint-disable-next-line no-unused-vars
            setSteps: (steps: Step[]) => set({ steps }),
            // eslint-disable-next-line no-unused-vars
            setCurrentStep: (step: number) => set({ currentStep: step }),
            // eslint-disable-next-line no-unused-vars
            setFormData: (data) =>
                set((state) => ({
                    formData: { ...state.formData , ...data }
                })),
            // eslint-disable-next-line no-unused-vars
            setFormId: (id: string) => set({ formId: id }),
            resetForm: () => {
                // Clear form storage but preserve session and theme data
                sessionStorage.removeItem('form-storage');
                const initialSteps = get().steps.filter(step => !step.insertedByDynamic);
                set(createInitialState(initialSteps));
            },
            getLatestState: () => getStorageData() || get(),
            // eslint-disable-next-line no-unused-vars
            insertStep: (index, step) => {
                try {
                    const currentSteps = get().steps;
                    if (!Array.isArray(currentSteps) || index < 0 || index > currentSteps.length || !step) {
                        // eslint-disable-next-line no-console
                        console.error('Invalid insertStep parameters:', { index, step, stepsLength: currentSteps?.length });
                        throw new Error('Invalid step insertion parameters');
                    }
                    set({ steps: [...currentSteps.slice(0, index), step, ...currentSteps.slice(index)] });
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('Error inserting step:', { error, index, step });
                    throw error;
                }
            },
            // eslint-disable-next-line no-unused-vars
            removeStep: (index) => {
                try {
                    const currentSteps = get().steps;
                    if (!Array.isArray(currentSteps) || index < 0 || index >= currentSteps.length) {
                        // eslint-disable-next-line no-console
                        console.error('Invalid removeStep parameters:', { index, stepsLength: currentSteps?.length });
                        throw new Error('Invalid step removal parameters');
                    }
                    set({ steps: [...currentSteps.slice(0, index), ...currentSteps.slice(index + 1)] });
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('Error removing step:', { error, index });
                    throw error;
                }
            },
            // eslint-disable-next-line no-unused-vars
            validateStep: () => {
                const currentStep = get().steps[get().currentStep]
                if(!currentStep) return false
                const form = document.getElementById(get().formId) as HTMLFormElement
                if(!form) return false
                // TODO: Implement validation logic
                return true
            },
            pendingStep: null,
            // eslint-disable-next-line no-unused-vars
            setPendingStep: (step: number | null) => set({ pendingStep: step }),
            stepItems: [],
            // eslint-disable-next-line no-unused-vars
            setStepItems: (items: FormState["stepItems"]) => set(() => ({ stepItems: items })),
            dynamicStepsData: {},
            // eslint-disable-next-line no-unused-vars
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
            name: 'form-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)