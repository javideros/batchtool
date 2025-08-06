# Utils Reference

## 🛠️ Utility Functions

### Step Utilities (`stepUtils.ts`)

#### `resolveTargetStepId`
**Purpose**: Resolves the target step ID for step operations

**Signature**:
```typescript
resolveTargetStepId(
  stepItemId: string | undefined,
  stepItems: any[],
  isAddingNewStep: boolean = false
): string | undefined
```

**Parameters**:
- `stepItemId` - The provided step item ID (may be undefined)
- `stepItems` - Array of step items from formData
- `isAddingNewStep` - Whether we're adding a new step (optional, defaults to false)

**Returns**: The resolved step ID or undefined if no valid step found

**Usage**:
```typescript
const targetStepId = resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps));
```

**Logic**:
1. If `stepItemId` is provided and valid → return it
2. If adding new step → return undefined (will create new)
3. If editing existing → return last step item ID
4. Otherwise → return undefined

---

#### `isAddingNewStep`
**Purpose**: Determines if we're adding a new step based on the steps array

**Signature**:
```typescript
isAddingNewStep(steps: any[]): boolean
```

**Parameters**:
- `steps` - Array of steps from the store

**Returns**: True if adding a new step, false if editing existing

**Usage**:
```typescript
const addingNew = isAddingNewStep(steps);
```

**Logic**:
- Checks if current step flow indicates new step creation
- Used to determine form behavior and validation context

---

### Validation Utilities (`validationUtils.ts`)

#### `createUniqueClassValidator`
**Purpose**: Creates a unique class validator for Zod schemas

**Signature**:
```typescript
createUniqueClassValidator(
  classField: string,
  stepItems: any[],
  currentStepId: string | undefined
): (className: string) => boolean
```

**Parameters**:
- `classField` - The field name to check for uniqueness (e.g., 'batchletClass', 'readerClass')
- `stepItems` - Array of step items to check against
- `currentStepId` - ID of the current step to exclude from uniqueness check

**Returns**: Zod refine validator function

**Usage**:
```typescript
const schema = z.object({
  batchletClass: z.string()
    .refine(
      createUniqueClassValidator('batchletClass', stepItems, targetStepId),
      { message: createUniqueClassErrorMessage('Batchlet') }
    )
});
```

**Logic**:
1. Filters out current step from validation
2. Extracts existing class names for the specified field
3. Returns true if class name is unique, false otherwise

---

#### `createUniqueClassErrorMessage`
**Purpose**: Creates consistent error messages for unique class validation

**Signature**:
```typescript
createUniqueClassErrorMessage(classType: string): string
```

**Parameters**:
- `classType` - Type of class (e.g., 'Batchlet', 'Reader', 'Processor')

**Returns**: Error message string

**Usage**:
```typescript
const errorMessage = createUniqueClassErrorMessage('Batchlet');
// Returns: "Batchlet class name must be unique"
```

---

## 🎯 Usage Patterns

### 1. Step Screen Setup
```typescript
const MyStepScreen = ({ stepNumber, stepItemId }) => {
  const { formData, steps } = useFormStore();
  const { stepItems } = useStepDataUpdate();
  
  // Resolve target step ID
  const targetStepId = resolveTargetStepId(stepItemId, stepItems, isAddingNewStep(steps));
  
  // Find current item
  const item = stepItems.find(si => si.id === targetStepId) || {};
  
  // Create validation schema with uniqueness
  const schema = z.object({
    myClass: z.string()
      .refine(
        createUniqueClassValidator('myClass', stepItems, targetStepId),
        { message: createUniqueClassErrorMessage('MyClass') }
      )
  });
};
```

### 2. Dynamic Schema Creation
```typescript
const createDynamicSchema = (stepItems, targetStepId) => z.object({
  readerClass: z.string()
    .trim()
    .min(1, "Reader class required")
    .regex(/^([a-z][a-z0-9_]*\.)+([A-Z][A-Za-z0-9_]*Reader)$/, "Must end with 'Reader'")
    .refine(
      createUniqueClassValidator('readerClass', stepItems, targetStepId),
      { message: createUniqueClassErrorMessage('Reader') }
    ),
  // ... other fields
});
```

## 🔧 Utility Development Guidelines

### 1. **Pure Functions**
- No side effects
- Predictable outputs for given inputs
- Easy to test and reason about

### 2. **Error Handling**
```typescript
export const myUtility = (param: string): string => {
  if (!param) {
    console.error('Parameter is required');
    return '';
  }
  // ... logic
};
```

### 3. **TypeScript Types**
- Provide proper type annotations
- Use generic types where appropriate
- Document complex types with JSDoc

### 4. **Documentation**
- Clear JSDoc comments
- Usage examples
- Parameter descriptions
- Return value descriptions

### 5. **Testing Considerations**
- Write utilities to be easily testable
- Avoid dependencies on external state
- Use dependency injection for complex utilities

## 📦 Export Pattern

All utilities are exported through `index.ts`:
```typescript
// utils/index.ts
export * from './stepUtils';
export * from './validationUtils';

// Usage
import { resolveTargetStepId, createUniqueClassValidator } from '@/utils';
```