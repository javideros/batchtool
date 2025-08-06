/**
 * @fileoverview Form components with accessibility features and validation
 * @module components/ui/form
 */

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import type { FormValidationContext, FormError } from "@/types/forms"

/**
 * Form provider component that wraps React Hook Form's FormProvider
 * @type {React.ComponentType}
 */
const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

/**
 * Form field component that provides field context and wraps React Hook Form's Controller
 * @template TFieldValues - The form values type
 * @template TName - The field name type
 * @param {ControllerProps<TFieldValues, TName>} props - Controller props including field name
 * @returns {JSX.Element} Form field with context provider
 */
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller name={name} {...props} />
    </FormFieldContext.Provider>
  )
}

/**
 * Creates context information for validation logging
 */
const createContextInfo = (fieldContext: FormFieldContextValue | null, itemContext: { id: string } | null, formContext: ReturnType<typeof useFormContext> | null): FormValidationContext => ({
  hasFieldContext: !!fieldContext,
  hasItemContext: !!itemContext,
  hasFormContext: !!formContext,
  ...(fieldContext?.name && { fieldName: fieldContext.name }),
  timestamp: new Date().toISOString()
});

/**
 * Validates field context and throws error if missing
 */
const validateFieldContext = (fieldContext: FormFieldContextValue | null, contextInfo: FormValidationContext) => {
  if (!fieldContext) {
    // eslint-disable-next-line no-console
    console.error('Form validation error:', { ...contextInfo, error: 'Missing FormField context' });
    throw new Error("useFormField must be used within <FormField>. Ensure the component is wrapped in FormField.");
  }
};

/**
 * Validates item context and throws error if missing
 */
const validateItemContext = (itemContext: { id: string } | null, contextInfo: FormValidationContext) => {
  if (!itemContext) {
    // eslint-disable-next-line no-console
    console.error('Form validation error:', { ...contextInfo, error: 'Missing FormItem context' });
    throw new Error("useFormField must be used within <FormItem>. Ensure the component is wrapped in FormItem.");
  }
};

/**
 * Validates form context and throws error if missing
 */
const validateFormContext = (formContext: ReturnType<typeof useFormContext> | null, contextInfo: FormValidationContext) => {
  if (!formContext) {
    // eslint-disable-next-line no-console
    console.error('Form validation error:', { ...contextInfo, error: 'Missing Form provider' });
    throw new Error("useFormField must be used within a Form provider. Ensure the component is wrapped in <Form>.");
  }
};

/**
 * Validates field name and throws error if missing
 */
const validateFieldName = (fieldContext: FormFieldContextValue | null, contextInfo: FormValidationContext) => {
  if (!fieldContext?.name) {
    // eslint-disable-next-line no-console
    console.error('Form validation error:', { ...contextInfo, error: 'Missing field name' });
    throw new Error("Field name is required. Ensure FormField has a valid 'name' prop.");
  }
};

/**
 * Validates that all required form contexts are available
 * @param {FormFieldContextValue | null} fieldContext - Field context from FormFieldContext
 * @param {{ id: string } | null} itemContext - Item context from FormItemContext
 * @param {ReturnType<typeof useFormContext> | null} formContext - Form context from React Hook Form
 * @throws {Error} When any required context is missing
 */
const validateFormFieldContexts = (
  fieldContext: FormFieldContextValue | null,
  itemContext: { id: string } | null,
  formContext: ReturnType<typeof useFormContext> | null
) => {
  const contextInfo = createContextInfo(fieldContext, itemContext, formContext);
  
  validateFieldContext(fieldContext, contextInfo);
  validateItemContext(itemContext, contextInfo);
  validateFormContext(formContext, contextInfo);
  validateFieldName(fieldContext, contextInfo);
}

/**
 * Hook that provides form field state and accessibility IDs
 * Must be used within FormField and FormItem components
 * @returns {Object} Form field state and accessibility attributes
 * @returns {string} returns.id - Unique field ID
 * @returns {string} returns.name - Field name
 * @returns {string} returns.formItemId - Form item ID for accessibility
 * @returns {string} returns.formDescriptionId - Description ID for aria-describedby
 * @returns {string} returns.formMessageId - Message ID for error announcements
 * @throws {Error} When used outside required contexts
 */
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const formContext = useFormContext()
  
  validateFormFieldContexts(fieldContext, itemContext, formContext)
  
  const { getFieldState } = formContext
  
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  const { id } = itemContext

  const accessibilityIds = React.useMemo(() => ({
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
  }), [id]);

  return React.useMemo(() => ({
    id,
    name: fieldContext.name,
    ...accessibilityIds,
    ...fieldState,
  }), [id, fieldContext.name, accessibilityIds, fieldState])
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

/**
 * Form item container that provides unique ID context for accessibility
 * @param {React.ComponentProps<"div">} props - Standard div props
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Form item container with context
 */
const FormItem = React.memo(({ className, ...props }: React.ComponentProps<"div">) => {
  const id = React.useId()
  const contextValue = React.useMemo(() => ({ id }), [id])

  return (
    <FormItemContext.Provider value={contextValue}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
})

/**
 * Form label component with error state styling
 * @param {React.ComponentProps<typeof LabelPrimitive.Root>} props - Label props
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Accessible form label
 */
const FormLabel = React.memo(({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})

/**
 * Form control wrapper that adds accessibility attributes
 * @param {React.ComponentProps<typeof Slot>} props - Slot props
 * @returns {JSX.Element} Form control with ARIA attributes
 */
function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      aria-required={props['aria-required']}
      {...props}
    />
  )
}

/**
 * Form description component for additional field information
 * @param {React.ComponentProps<"p">} props - Paragraph props
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Form description paragraph
 */
function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * Extracts message content from error or children
 * @param {FormError | null | undefined} error - Form validation error
 * @param {React.ReactNode} children - Fallback content
 * @returns {string | React.ReactNode} Message content
 */
const getMessageBody = (error: FormError | null | undefined, children: React.ReactNode) => {
  if (error) {
    return String(error?.message ?? "");
  }
  return children;
};

/**
 * Form message component for displaying validation errors
 * Includes ARIA live region for screen reader announcements
 * @param {React.ComponentProps<"p">} props - Paragraph props
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element | null} Error message or null if no error
 */
function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = getMessageBody(error, props.children)

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      role="alert"
      aria-live="polite"
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
}