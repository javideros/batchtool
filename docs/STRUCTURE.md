# Project Structure

## 📁 Directory Organization

```
src/
├── screens/                    # UI Screens
│   ├── main/                  # Main workflow screens
│   │   ├── batchdetails.tsx   # Batch job basic information
│   │   ├── batchproperties.tsx # Job-level properties configuration
│   │   ├── batchlisteners.tsx # Job-level event listeners
│   │   ├── dynamicsteps.tsx   # Step configuration hub
│   │   ├── summaryscreen.tsx  # Final configuration review
│   │   └── index.ts           # Clean exports
│   └── dynamic-steps/         # Dynamic step configuration screens
│       ├── steplisteners.tsx  # Step-level event listeners
│       ├── batchletdefinition.tsx # Batchlet implementation
│       ├── chunkreaderscreen.tsx  # Chunk reader configuration
│       ├── chunkprocessorscreen.tsx # Chunk processor configuration
│       ├── chunkwriterscreen.tsx   # Chunk writer configuration
│       ├── chunkpartition.tsx     # Partition configuration
│       └── index.ts               # Clean exports
├── hooks/                     # Custom React hooks
│   ├── use-form-step.tsx     # Form step management
│   ├── use-step-data-update.ts # Step data updates
│   ├── use-step-navigation.ts # Step navigation logic
│   └── index.ts              # Clean exports
├── utils/                    # Utility functions
│   ├── stepUtils.ts         # Step ID resolution utilities
│   ├── validationUtils.ts   # Form validation utilities
│   └── index.ts             # Clean exports
├── types/                   # TypeScript type definitions
│   ├── batch.ts            # Main batch job types
│   ├── jsr352-types.d.ts   # Legacy compatibility types
│   └── index.ts            # Unified exports
├── components/             # Reusable UI components
│   └── ui/                # Shadcn/ui components
└── lib/                   # Core libraries and stores
    ├── jsr352batchjobstore.ts # Zustand state management
    └── utils.ts              # Utility functions
```

## 🎯 Design Principles

### 1. **Separation of Concerns**
- **Main screens** - Core workflow steps
- **Dynamic steps** - Configurable step implementations
- **Hooks** - Reusable logic
- **Utils** - Pure functions
- **Types** - Type definitions

### 2. **Clean Imports**
Each directory has an `index.ts` file for clean imports:
```typescript
// Instead of:
import BatchDetailsScreen from './screens/main/batchdetails';

// Use:
import { BatchDetailsScreen } from './screens/main';
```

### 3. **File Extensions**
- **`.ts`** - Pure TypeScript (no JSX)
- **`.tsx`** - TypeScript + React/JSX
- **`.d.ts`** - Type declarations only

### 4. **Naming Conventions**
- **Components** - PascalCase (`BatchDetailsScreen`)
- **Hooks** - camelCase with `use` prefix (`useStepNavigation`)
- **Utils** - camelCase (`resolveTargetStepId`)
- **Types** - PascalCase (`StepItem`, `FormData`)

## 🔄 Data Flow

```
App.tsx
├── Zustand Store (jsr352batchjobstore.ts)
├── Main Screens (screens/main/)
│   └── Dynamic Steps (screens/dynamic-steps/)
├── Custom Hooks (hooks/)
├── Utilities (utils/)
└── Type Definitions (types/)
```

## 📦 Module Dependencies

### Internal Dependencies
- Screens depend on hooks and utils
- Hooks depend on store and utils
- Utils are dependency-free
- Types are dependency-free

### External Dependencies
- React ecosystem (React, React Hook Form)
- State management (Zustand)
- Validation (Zod)
- UI (Tailwind CSS, Shadcn/ui)
- Build tools (Vite, TypeScript)