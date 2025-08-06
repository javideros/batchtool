# Types Reference

## 📝 TypeScript Type Definitions

### Core Batch Types (`batch.ts`)

#### `BatchProperty`
**Purpose**: Represents a batch job property

```typescript
interface BatchProperty {
  key: string;                                    // Property name
  value: string;                                  // Property value
  type: 'String' | 'Number' | 'Boolean' | 'Date'; // Value type
}
```

**Usage**:
```typescript
const property: BatchProperty = {
  key: 'maxRetries',
  value: '3',
  type: 'Number'
};
```

---

#### `BatchListener`
**Purpose**: Represents a batch job listener

```typescript
interface BatchListener {
  listenerName: string;  // Fully qualified Java class name
}
```

**Usage**:
```typescript
const listener: BatchListener = {
  listenerName: 'com.example.batch.MyJobListener'
};
```

---

#### `QueryCriteria`
**Purpose**: Represents database query criteria for readers

```typescript
interface QueryCriteria {
  field: string;                                           // Database field name
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';  // SQL operator
  value: string;                                           // Comparison value
}
```

**Usage**:
```typescript
const criteria: QueryCriteria = {
  field: 'status',
  operator: '=',
  value: 'ACTIVE'
};
```

---

#### `StepItem`
**Purpose**: Represents a complete batch step configuration

```typescript
interface StepItem {
  // Core properties
  id: string;                    // Unique step identifier
  type: 'A' | 'B' | 'C';        // A=Batchlet, B=Chunk, C=Chunk with Partition
  addProcessor: boolean;         // Whether to include processor
  stepName: string;              // Step name (lowercase with underscores)
  listeners?: string[];          // Step-level listeners
  
  // Batchlet specific
  batchletClass?: string;        // Batchlet implementation class
  
  // Chunk Reader specific
  readerClass?: string;          // Reader implementation class
  dataSource?: 'file' | 'database' | 'rest';  // Data source type
  pageSize?: number;             // Records per batch
  filenamePattern?: string;      // File pattern for file source
  readerTableName?: string;      // Table name for database source
  serviceUrl?: string;           // URL for REST source
  criteria?: QueryCriteria[];    // Query criteria
  
  // Chunk Processor specific
  processorClass?: string;       // Processor implementation class
  skipExceptionClasses?: string[]; // Exceptions to skip
  
  // Chunk Writer specific
  writerClass?: string;          // Writer implementation class
  dataDestination?: 'file' | 'database' | 'rest';  // Data destination type
  commitInterval?: number;       // Commit frequency
  writerTableName?: string;      // Table name for database destination
  writeFields?: string[];        // Fields to write
  
  // Partitioner specific
  partitionerClass?: string;     // Partitioner implementation class
}
```

**Usage**:
```typescript
const batchletStep: StepItem = {
  id: 'step-1',
  type: 'A',
  addProcessor: false,
  stepName: 'my_batchlet_step',
  batchletClass: 'com.example.MyBatchlet'
};

const chunkStep: StepItem = {
  id: 'step-2',
  type: 'B',
  addProcessor: true,
  stepName: 'my_chunk_step',
  readerClass: 'com.example.MyReader',
  processorClass: 'com.example.MyProcessor',
  writerClass: 'com.example.MyWriter',
  dataSource: 'database',
  readerTableName: 'input_table',
  dataDestination: 'database',
  writerTableName: 'output_table'
};
```

---

#### `FormData`
**Purpose**: Represents the complete batch job configuration

```typescript
interface FormData {
  batchName: string;                    // Unique batch job name
  functionalAreaCd: 'ED' | 'DC' | 'FN' | 'IN';  // Functional area code
  frequency: 'DLY' | 'WKY' | 'MTH' | 'YRL';     // Execution frequency
  packageName: string;                  // Java package name
  batchProperties: BatchProperty[];     // Job-level properties
  batchListeners: BatchListener[];      // Job-level listeners
  stepItems: StepItem[];               // Step configurations
}
```

**Usage**:
```typescript
const jobConfig: FormData = {
  batchName: 'MyBatchJob',
  functionalAreaCd: 'ED',
  frequency: 'DLY',
  packageName: 'com.example.batch',
  batchProperties: [
    { key: 'timeout', value: '300', type: 'Number' }
  ],
  batchListeners: [
    { listenerName: 'com.example.batch.MyJobListener' }
  ],
  stepItems: [
    // ... step configurations
  ]
};
```

---

#### `Step`
**Purpose**: Represents a UI step in the wizard

```typescript
interface Step {
  id: number;                           // Step index
  name: string;                         // Display name
  component?: React.ComponentType<any>; // React component
  insertedByDynamic?: boolean;          // Whether inserted by dynamic flow
  stepItemId?: string;                  // Associated step item ID
}
```

**Usage**:
```typescript
const step: Step = {
  id: 0,
  name: 'Batch Details',
  component: BatchDetailsScreen
};
```

---

### Legacy Types (`jsr352-types.d.ts`)

#### `JSR352BatchJobFormData`
**Purpose**: Legacy form data type for backward compatibility

```typescript
type JSR352BatchJobFormData = {
  batchName: string;
  functionalAreaCode?: "" | "ED" | "IN" | "DC" | "SE" | "AR" | "AL" | "ST" | "RP";
  frequency?: "DLY" | "WLY" | "MLY" | "QLY" | "ALY" | "ONR";
  packageName?: string;
  batchProperties?: Array<{
    key: string;
    value: string;
    type: "String" | "Long" | "Date" | "Double";
  }>;
  batchListeners?: Array<{
    listenerName: string;
  }>;
  stepItems?: Array<{
    id: string;
    type: string;
    stepName: string;
    addProcessor?: boolean;
  }>;
}
```

---

## 🎯 Type Usage Guidelines

### 1. **Use Current Types**
Prefer types from `batch.ts` over legacy types:
```typescript
// ✅ Good
import { StepItem, FormData } from '@/types';

// ❌ Avoid
import { JSR352BatchJobFormData } from '@/types';
```

### 2. **Type Guards**
Create type guards for runtime validation:
```typescript
const isStepItem = (obj: any): obj is StepItem => {
  return obj && typeof obj.id === 'string' && typeof obj.stepName === 'string';
};
```

### 3. **Partial Types**
Use `Partial<T>` for updates:
```typescript
const updateStepData = (id: string, data: Partial<StepItem>) => {
  // Only update provided fields
};
```

### 4. **Union Types**
Leverage union types for specific values:
```typescript
type StepType = 'A' | 'B' | 'C';
type DataSource = 'file' | 'database' | 'rest';
```

### 5. **Generic Types**
Use generics for reusable patterns:
```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
```

## 📦 Export Pattern

All types are exported through `index.ts`:
```typescript
// types/index.ts
export * from './batch';
export * from './jsr352-types.d';

// Usage
import { StepItem, FormData, BatchProperty } from '@/types';
```

## 🔄 Type Evolution

### Migration Strategy
1. **Add new types** to `batch.ts`
2. **Keep legacy types** in `jsr352-types.d.ts` for compatibility
3. **Update components** gradually to use new types
4. **Remove legacy types** when no longer needed

### Versioning
- **Major changes** - Create new interface versions
- **Minor changes** - Add optional properties
- **Breaking changes** - Deprecate old types first