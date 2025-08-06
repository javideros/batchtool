# API Reference 📖

> Complete API documentation for the JSR-352 Batch Tool components, hooks, and utilities

## 🚀 Quick Navigation

- [📋 Form Components](#-form-components)
- [♿ Accessibility Hooks](#-accessibility-hooks)
- [⚡ Performance Hooks](#-performance-hooks)
- [🗄️ State Management](#️-state-management)
- [🔗 UI Components](#-ui-components)

## 📋 Form Components

### FormField

Form field component that provides field context and wraps React Hook Form's Controller.

**Props:**
- `name: string` - Field name for form control
- `...props: ControllerProps` - React Hook Form Controller props

**Usage:**
```tsx
<FormField
  control={form.control}
  name="batchName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Batch Name</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### useFormField

Hook that provides form field state and accessibility IDs. Must be used within FormField and FormItem components.

**Returns:**
- `id: string` - Unique field ID
- `name: string` - Field name
- `formItemId: string` - Form item ID for accessibility
- `formDescriptionId: string` - Description ID for aria-describedby
- `formMessageId: string` - Message ID for error announcements
- `error: FormError` - Current field error state
- `invalid: boolean` - Whether field has validation errors
- `isDirty: boolean` - Whether field has been modified
- `isTouched: boolean` - Whether field has been focused

**Throws:**
- `Error` - When used outside required contexts

### FormItem

Form item container that provides unique ID context for accessibility.

**Props:**
- `className?: string` - Additional CSS classes
- `...props: React.ComponentProps<"div">` - Standard div props

### FormLabel

Form label component with error state styling.

**Props:**
- `className?: string` - Additional CSS classes
- `...props: React.ComponentProps<typeof LabelPrimitive.Root>` - Radix Label props

### FormControl

Form control wrapper that adds accessibility attributes.

**Props:**
- `...props: React.ComponentProps<typeof Slot>` - Radix Slot props

**Features:**
- Automatic ARIA attributes
- Error state handling
- Accessibility ID linking

### FormDescription

Form description component for additional field information.

**Props:**
- `className?: string` - Additional CSS classes
- `...props: React.ComponentProps<"p">` - Paragraph props

### FormMessage

Form message component for displaying validation errors with ARIA live region support.

**Props:**
- `className?: string` - Additional CSS classes
- `...props: React.ComponentProps<"p">` - Paragraph props

**Features:**
- `role="alert"` for immediate error announcements
- `aria-live="polite"` for screen reader compatibility
- Automatic error message extraction

## ♿ Accessibility Hooks

### useSkipToContent

Hook for implementing skip-to-content functionality for keyboard users.

**Returns:**
- `skipLinkRef: React.RefObject<HTMLAnchorElement>` - Ref for skip link element
- `mainContentRef: React.RefObject<HTMLElement>` - Ref for main content element
- `skipToContent: () => void` - Function to focus main content

**Usage:**
```tsx
const { skipLinkRef, mainContentRef, skipToContent } = useSkipToContent();

return (
  <>
    <SkipLink ref={skipLinkRef} href="#main" onClick={skipToContent}>
      Skip to main content
    </SkipLink>
    <main id="main" ref={mainContentRef} tabIndex={-1}>
      {/* Your content */}
    </main>
  </>
);
```

### useFocusManagement

Hook for managing focus and screen reader announcements.

**Returns:**
- `focusFirstError: () => void` - Focuses first invalid form field
- `announceLiveRegion: (message: string, priority?: 'polite' | 'assertive') => void` - Announces message to screen readers

**Usage:**
```tsx
const { focusFirstError, announceLiveRegion } = useFocusManagement();

// On form validation error
focusFirstError();

// Announce success message
announceLiveRegion('Form submitted successfully!');

// Announce urgent message
announceLiveRegion('Error occurred!', 'assertive');
```

### useKeyboardNavigation

Hook for implementing keyboard shortcuts in step-based navigation.

**Parameters:**
- `onNext?: () => void` - Callback for next step (Ctrl/Cmd + →)
- `onPrevious?: () => void` - Callback for previous step (Ctrl/Cmd + ←)

**Usage:**
```tsx
const { handleNext, handlePrevious } = useStepNavigation();
useKeyboardNavigation(handleNext, handlePrevious);
```

**Keyboard Shortcuts:**
- `Ctrl/Cmd + →` - Navigate to next step
- `Ctrl/Cmd + ←` - Navigate to previous step

## ⚡ Performance Hooks

### usePerformance

Hook providing performance optimization utilities.

**Returns:**
- `measureTime: (label: string, fn: () => void) => void` - Measures execution time
- `debounce: <T>(func: T, delay: number) => T` - Creates debounced function
- `throttle: <T>(func: T, limit: number) => T` - Creates throttled function
- `memoizeExpensive: <T>(fn: () => T, deps: unknown[]) => T` - Memoizes expensive computations
- `getMetrics: () => Record<string, number>` - Returns performance metrics

**Usage:**
```tsx
const { debounce, throttle, measureTime, memoizeExpensive } = usePerformance();

// Debounce search input
const debouncedSearch = debounce(searchFunction, 300);

// Throttle scroll handler
const throttledScroll = throttle(handleScroll, 100);

// Measure function performance
measureTime('complexCalculation', () => {
  performComplexCalculation();
});

// Memoize expensive computation
const expensiveResult = memoizeExpensive(() => {
  return performExpensiveCalculation();
}, [dependency1, dependency2]);
```

### useLazyComponent

Hook for lazy loading React components to improve initial bundle size.

**Parameters:**
- `importFn: () => Promise<{ default: T }>` - Dynamic import function

**Returns:**
- `React.LazyExoticComponent<T>` - Lazy-loaded component

**Usage:**
```tsx
const LazyComponent = useLazyComponent(() => import('./HeavyComponent'));

// Use with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

## 🗄️ State Management

### useFormStore

Zustand store hook for managing JSR-352 batch job form state with persistence to session storage.

**State Properties:**
- `currentStep: number` - Current step index
- `formData: JSR352BatchJobFormData` - Form data object
- `formId: string` - Current form ID
- `steps: Step[]` - Array of form steps
- `stepItems: StepItem[]` - Dynamic step items
- `pendingStep: number | null` - Pending step for navigation
- `dynamicStepsData: DynamicStepData` - Dynamic step configuration data

**Actions:**
- `setCurrentStep: (step: number) => void` - Update current step
- `setFormData: (data: JSR352BatchJobFormData) => void` - Update form data
- `setFormId: (id: string) => void` - Set form ID
- `resetForm: () => void` - Reset entire form state
- `getLatestState: () => FormState` - Get latest state from storage
- `addStep: (step: Step) => void` - Add new step
- `insertStep: (index: number, step: Step) => void` - Insert step at index
- `removeStep: (index: number) => void` - Remove step by index
- `setSteps: (steps: Step[]) => void` - Set all steps
- `validateStep: () => boolean` - Validate current step
- `setPendingStep: (step: number | null) => void` - Set pending step
- `setStepItems: (items: StepItem[]) => void` - Update step items
- `setDynamicStepData: (stepKey: string, data: unknown) => void` - Update dynamic step data
- `resetDynamicStepsData: () => void` - Reset dynamic step data

**Usage:**
```tsx
const {
  currentStep,
  formData,
  setCurrentStep,
  setFormData,
  resetForm
} = useFormStore();

// Navigate to next step
setCurrentStep(currentStep + 1);

// Update form data
setFormData({ batchName: 'NEW_BATCH' });

// Reset everything
resetForm();
```

**Persistence:**
- Automatically persists to `sessionStorage`
- Storage key: `'form-storage'`
- Includes caching mechanism for performance

## 🔗 UI Components

### SkipLink

Skip link component for keyboard navigation accessibility. Becomes visible when focused and hidden otherwise.

**Props:**
- `href: string` - Target element ID or URL fragment
- `children: React.ReactNode` - Link content
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<SkipLink href="#main-content">Skip to main content</SkipLink>
```

**Features:**
- Hidden by default (`sr-only` class)
- Visible on focus with proper styling
- Keyboard accessible
- Screen reader compatible

## 🎯 Type Definitions

### FormError
```typescript
interface FormError {
  message?: string;
  type?: string;
}
```

### FormValidationContext
```typescript
interface FormValidationContext {
  hasFieldContext: boolean;
  hasItemContext: boolean;
  hasFormContext: boolean;
  fieldName?: string;
  timestamp: string;
}
```

### Step
```typescript
interface Step {
  id: number;
  name: string;
  component: React.ComponentType<{ stepNumber: number }>;
  insertedByDynamic?: boolean;
}
```

### JSR352BatchJobFormData
```typescript
interface JSR352BatchJobFormData {
  batchName: string;
  functionalAreaCd: string;
  frequency: string;
  packageName: string;
  batchProperties: Array<{ key: string; value: string }>;
  batchListeners: string[];
  stepItems: StepItem[];
}
```

## 🔍 Error Handling

### Form Validation Errors

All form components include comprehensive error handling:

- **Context Validation**: Ensures components are used within proper contexts
- **Field Validation**: Real-time validation with Zod schemas
- **Accessibility**: Error announcements via ARIA live regions
- **Focus Management**: Automatic focus on first error field

### Store Error Handling

The Zustand store includes error handling for:

- **Invalid Parameters**: Validates step indices and data
- **Storage Errors**: Graceful handling of sessionStorage failures
- **State Corruption**: Recovery mechanisms for invalid state

## 📱 Responsive Design

All components are designed to work across different screen sizes:

- **Mobile First**: Optimized for mobile devices
- **Flexible Layouts**: Adapts to different screen sizes
- **Touch Friendly**: Appropriate touch targets
- **Keyboard Navigation**: Full keyboard accessibility

## 🌐 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Accessibility**: Screen reader compatible
- **JavaScript**: ES2020+ features
- **CSS**: Modern CSS with fallbacks

---

For more detailed examples and interactive documentation, visit the [HTML API Documentation](./api/index.html).