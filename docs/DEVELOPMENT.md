# Development Guide 🚀

> Want to contribute? Awesome! This guide will get you up and running in no time.

## What You'll Need 📦

- **Node.js 18+** (the newer the better!)
- **npm** (comes with Node) or **yarn** (if you prefer)
- Some **React** and **TypeScript** knowledge (don't worry, we'll help!)

## Let's Get You Set Up! ⚙️

```bash
# Grab the code
git clone <repository-url>
cd raven-app

# Get all the dependencies
npm install

# Fire it up! 🔥
npm run dev

# Want to build it? 🏗️
npm run build
```

## How We Roll 🎲

### Keep Things Organized
We've got a nice, clean structure - stick to it and everyone stays happy!

```
src/
├── screens/    # The pages users see
├── hooks/      # Reusable React magic
├── utils/      # Helper functions
├── types/      # TypeScript definitions
└── lib/        # Core stuff
```

### File Naming (Keep It Consistent!) 📝
- **Components**: `PascalCase.tsx` (like `BatchDetailsScreen.tsx`)
- **Hooks**: `use-kebab-case.ts` (like `use-step-navigation.ts`)
- **Utils**: `camelCase.ts` (like `stepUtils.ts`)
- **Types**: `kebab-case.ts` (like `batch-types.ts`)

*Why? Because consistency makes everyone's life easier!*

### 3. **Import Organization**
```typescript
// 1. External libraries
import React from 'react';
import { useForm } from 'react-hook-form';

// 2. Internal utilities and hooks
import { useStepNavigation } from '@/hooks';
import { resolveTargetStepId } from '@/utils';

// 3. Types
import { StepItem } from '@/types';

// 4. Components
import { Button } from '@/components/ui/button';
```

## The Code Rules (Don't Worry, They're Friendly!) 🎯

### TypeScript Tips
- **Be specific** - `any` is the enemy of good code
- **Interfaces are your friend** - Use them for object shapes
- **Generics are cool** - They make code reusable

```typescript
// 😎 This makes us happy
interface StepProps {
  stepNumber: number;
  stepItemId?: string;
}

// 😭 This makes us sad
const StepComponent = (props: any) => { ... }
```

### 2. **React Components**
- **Functional components** - Use hooks instead of classes
- **Props interface** - Define clear prop types
- **Default exports** - Use default exports for components

```typescript
interface BatchDetailsScreenProps {
  stepNumber: number;
}

const BatchDetailsScreen: React.FC<BatchDetailsScreenProps> = ({ stepNumber }) => {
  // Component logic
};

export default BatchDetailsScreen;
```

### 3. **Custom Hooks**
- **Single responsibility** - One concern per hook
- **Consistent naming** - Start with `use`
- **Return objects** - Use objects for multiple returns

```typescript
export const useStepNavigation = (stepNumber: number, targetStepId?: string) => {
  // Hook logic
  
  return {
    handleBack,
    handleBackToDynamicSteps
  };
};
```

### 4. **Utility Functions**
- **Pure functions** - No side effects
- **Clear naming** - Descriptive function names
- **JSDoc comments** - Document parameters and returns

```typescript
/**
 * Resolves the target step ID for step operations
 * @param stepItemId - The provided step item ID
 * @param stepItems - Array of step items
 * @returns The resolved step ID or undefined
 */
export const resolveTargetStepId = (
  stepItemId: string | undefined,
  stepItems: StepItem[]
): string | undefined => {
  // Function logic
};
```

## 🧪 Testing Guidelines

### 1. **Unit Tests**
Test utility functions and hooks:
```typescript
// utils/stepUtils.test.ts
import { resolveTargetStepId } from './stepUtils';

describe('resolveTargetStepId', () => {
  it('should return provided stepItemId when valid', () => {
    const result = resolveTargetStepId('step-1', [], false);
    expect(result).toBe('step-1');
  });
});
```

### 2. **Component Tests**
Test component behavior:
```typescript
// screens/main/BatchDetailsScreen.test.tsx
import { render, screen } from '@testing-library/react';
import BatchDetailsScreen from './BatchDetailsScreen';

describe('BatchDetailsScreen', () => {
  it('should render batch name field', () => {
    render(<BatchDetailsScreen stepNumber={0} />);
    expect(screen.getByLabelText(/batch name/i)).toBeInTheDocument();
  });
});
```

### 3. **Integration Tests**
Test complete workflows:
```typescript
// integration/batch-workflow.test.tsx
describe('Batch Job Creation Workflow', () => {
  it('should create complete batch job configuration', () => {
    // Test complete user journey
  });
});
```

## 🔧 State Management

### Zustand Store Pattern
```typescript
// lib/store.ts
interface StoreState {
  // State properties
  data: FormData;
  
  // Actions
  updateData: (data: Partial<FormData>) => void;
}

export const useStore = create<StoreState>((set) => ({
  data: initialData,
  
  updateData: (newData) => set((state) => ({
    data: { ...state.data, ...newData }
  }))
}));
```

### State Updates
- **Immutable updates** - Always create new objects
- **Partial updates** - Use `Partial<T>` for updates
- **Validation** - Validate data before state updates

## 🎨 UI/UX Guidelines

### 1. **Responsive Design**
- **Mobile-first** - Design for mobile, enhance for desktop
- **Flexible layouts** - Use CSS Grid and Flexbox
- **Consistent spacing** - Use Tailwind spacing scale

### 2. **Form Handling**
- **React Hook Form** - Use for all forms
- **Zod validation** - Schema-based validation
- **Real-time feedback** - Show errors immediately

### 3. **Loading States**
- **Loading indicators** - Show progress during operations
- **Skeleton screens** - Use for content loading
- **Error boundaries** - Handle errors gracefully

## 🚨 Error Handling

### 1. **Form Validation**
```typescript
const schema = z.object({
  batchName: z.string()
    .min(1, 'Batch name is required')
    .max(50, 'Batch name too long')
});
```

### 2. **Runtime Errors**
```typescript
try {
  // Risky operation
  const result = await processData(data);
} catch (error) {
  console.error('Processing failed:', error);
  // Handle error appropriately
}
```

### 3. **Error Boundaries**
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## 📦 Build and Deployment

### Development Build
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
```

### Pre-commit Hooks
- **Lint staged files** - Run linting on changed files
- **Type checking** - Ensure no TypeScript errors
- **Format code** - Auto-format with Prettier

## 🔄 Git Workflow

### Branch Naming
- **Feature**: `feature/add-batch-validation`
- **Bug fix**: `fix/step-navigation-issue`
- **Refactor**: `refactor/extract-validation-utils`

### Commit Messages
```
feat: add batch job validation
fix: resolve step navigation issue
refactor: extract validation utilities
docs: update API documentation
```

### Pull Request Process
1. **Create feature branch** from main
2. **Implement changes** with tests
3. **Update documentation** if needed
4. **Create pull request** with description
5. **Code review** and approval
6. **Merge to main** after approval

## 🎯 Performance Guidelines

### 1. **React Optimization**
- **useMemo** - Memoize expensive calculations
- **useCallback** - Memoize event handlers
- **React.memo** - Memoize components

### 2. **Bundle Optimization**
- **Code splitting** - Split routes and components
- **Tree shaking** - Remove unused code
- **Lazy loading** - Load components on demand

### 3. **State Management**
- **Minimize re-renders** - Optimize state updates
- **Selector patterns** - Use selectors for derived state
- **Batch updates** - Group related state changes