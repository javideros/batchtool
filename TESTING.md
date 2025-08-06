# 🧪 Testing Guide

## Overview

This project uses **Vitest** with **React Testing Library** for comprehensive unit and integration testing:

- **Vitest** - Fast unit testing framework with hot reload
- **React Testing Library** - Component testing with user-centric queries
- **jsdom** - Browser environment simulation
- **@testing-library/jest-dom** - Custom matchers for DOM testing

## Test Structure

```
src/
├── test/
│   ├── setup.ts           # Test configuration & global mocks
│   ├── mockReactHookForm.ts # Form mocking utilities
│   └── testUtils.tsx       # Testing utilities
├── screens/__tests__/      # Screen component tests
├── hooks/__tests__/        # Custom hook tests
└── utils/__tests__/        # Utility function tests
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Tests
```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests once (CI mode)
npm run test:run
```

## Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run tests in watch mode |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:run` | Run tests once and exit |

## Test Coverage

Current test coverage: **54 tests passing** across **9 test files**

### Component Tests
- ✅ **BatchDetailsScreen** - Form validation and field rendering
- ✅ **BatchletDefinitionScreen** - Batchlet configuration and properties
- ✅ **SummaryScreen** - XML generation and validation display

### Hook Tests
- ✅ **useStepDataUpdate** - Step data management
- ✅ **Custom hooks** - Form handling and navigation

### Utility Tests
- ✅ **stepUtils** - Step resolution and validation
- ✅ **validationUtils** - Unique class validation
- ✅ **xmlGenerator** - JSR-352 XML generation
- ✅ **xmlValidator** - XML validation and error reporting

## Testing Patterns

### Component Testing
```typescript
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

// Mock dependencies
vi.mock('@/lib/jsr352batchjobstore', () => ({
  useFormStore: vi.fn()
}))

// Test component rendering
it('should render form fields correctly', () => {
  render(<BatchDetailsScreen stepNumber={1} />)
  
  expect(screen.getByRole('heading', { name: /📊 Batch Job Configuration/i }))
    .toBeInTheDocument()
})
```

### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react'

it('should update step data correctly', () => {
  const { result } = renderHook(() => useStepDataUpdate())
  
  act(() => {
    result.current.updateStepData('step1', { batchletClass: 'com.test.Test' })
  })
  
  expect(mockUpdateStepItems).toHaveBeenCalled()
})
```

### Utility Testing
```typescript
it('should generate valid JSR-352 XML', () => {
  const xml = generateJSR352XML(mockFormData)
  
  expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
  expect(xml).toContain('<job id="test_job"')
})
```

## Mocking Strategy

### UI Components
```typescript
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))
```

### Form Libraries
```typescript
vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useFieldArray: vi.fn(() => ({
      fields: [],
      append: vi.fn(),
      remove: vi.fn()
    }))
  }
})
```

### Schema Validation
```typescript
vi.mock('zod', () => {
  const mockChain = {
    trim: vi.fn(() => mockChain),
    min: vi.fn(() => mockChain),
    regex: vi.fn(() => mockChain)
  }
  
  return {
    default: {
      object: vi.fn(() => mockChain),
      string: vi.fn(() => mockChain)
    }
  }
})
```

## Best Practices

### 1. Use Semantic Queries
```typescript
// ✅ Good - semantic and accessible
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email address/i)

// ❌ Avoid - fragile and not user-centric
screen.getByTestId('submit-btn')
```

### 2. Test User Interactions
```typescript
import userEvent from '@testing-library/user-event'

it('should handle form submission', async () => {
  const user = userEvent.setup()
  render(<MyForm />)
  
  await user.type(screen.getByLabelText(/name/i), 'John Doe')
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(mockSubmit).toHaveBeenCalledWith({ name: 'John Doe' })
})
```

### 3. Mock External Dependencies
```typescript
// Mock store
vi.mock('@/lib/jsr352batchjobstore')

// Mock utilities
vi.mock('@/utils/xmlGenerator')

// Mock hooks
vi.mock('@/hooks/use-form-step')
```

## Troubleshooting

### Common Issues

#### "Multiple elements found"
```typescript
// ❌ Problem - ambiguous text
screen.getByText(/submit/i)

// ✅ Solution - be more specific
screen.getByRole('button', { name: /submit form/i })
```

#### "Element not found"
```typescript
// ❌ Problem - element not rendered
expect(screen.getByText(/loading/i)).toBeInTheDocument()

// ✅ Solution - wait for element
await screen.findByText(/loading/i)
```

#### Mock not working
```typescript
// ❌ Problem - mock after import
import { myFunction } from './utils'
vi.mock('./utils')

// ✅ Solution - mock before import
vi.mock('./utils')
import { myFunction } from './utils'
```

### Debug Tests
```bash
# Run specific test file
npm test -- BatchDetailsScreen.test.tsx

# Run with verbose output
npm test -- --reporter=verbose

# Debug in browser
npm run test:ui
```

## Configuration

### Vitest Config (`vitest.config.ts`)
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

### Test Setup (`src/test/setup.ts`)
```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Global mocks
Object.defineProperty(global, 'crypto', {
  value: { randomUUID: vi.fn(() => 'test-uuid-123') }
})

// Mock clipboard API
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn(() => Promise.resolve()) }
  })
}
```

## Test Results

✅ **All 54 tests passing**
- 9 test files
- 100% critical path coverage
- Component, hook, and utility tests
- Comprehensive mocking strategy

The JSR-352 Batch Tool is thoroughly tested and ready for production! 🎉