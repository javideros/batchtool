// Batch job configuration types

export interface BatchProperty {
  key: string;
  value: string;
  type: 'String' | 'Number' | 'Boolean' | 'Date';
}

export interface BatchListener {
  listenerName: string;
}

export interface QueryCriteria {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
  value: string;
}

export interface StepProperty {
  key: string;
  value: string;
  type: 'String' | 'Number' | 'Boolean' | 'Date';
}

export interface StepTransition {
  on: string;           // Exit status to match (e.g., "COMPLETED", "FAILED", "CUSTOM_STATUS")
  action: 'next' | 'fail' | 'stop' | 'end';
  to?: string;          // Target step ID (required for 'next')
  exitStatus?: string;  // Custom exit status (optional)
}

export interface DecisionStep {
  id: string;
  type: 'DECISION';
  stepName: string;
  deciderClass: string;
  stepProperties?: StepProperty[];
  transitions: StepTransition[];  // Required - decisions must have transitions
}

export interface Flow {
  id: string;
  flowName: string;
  steps: (StepItem | DecisionStep)[];
}

export interface SplitStep {
  id: string;
  type: 'SPLIT';
  stepName: string;
  flows: Flow[];
  nextStep?: string;  // What happens after all flows complete
}

export interface FlowElement {
  id: string;
  type: 'FLOW';
  flowName: string;
  description: string;
  steps: (StepItem | DecisionStep)[];  // Now properly configured nested steps
  nextStep?: string;  // What happens after flow completes
  jslName?: string;   // JSL name for the flow
  abstract?: boolean; // Whether flow is abstract
}

export interface CheckpointConfig {
  enabled: boolean;
  itemCount?: number;        // Checkpoint every N items
  timeLimit?: number;        // Checkpoint every N seconds
  customPolicy?: string;     // Custom checkpoint policy class
  customPolicyProperties?: StepProperty[];  // Properties for custom checkpoint algorithm
}

export interface StepExecutionContext {
  next?: string;             // Next step (already handled in transitions)
  jslName?: string;          // JSL name for the step
  abstract?: boolean;        // Whether step is abstract
}

export interface AdvancedPartitionConfig {
  enabled: boolean;
  mapperClass?: string;      // PartitionMapper implementation
  collectorClass?: string;   // PartitionCollector implementation
  analyzerClass?: string;    // PartitionAnalyzer implementation
  reducerClass?: string;     // PartitionReducer implementation
  partitionCount?: number;   // Number of partitions (alternative to mapper)
}

export interface StepItem {
  id: string;
  type: 'A' | 'B' | 'C'; // A=Batchlet, B=Chunk, C=Chunk with Partition
  addProcessor: boolean;
  stepName: string;
  listeners?: string[];
  stepProperties?: StepProperty[];
  transitions?: StepTransition[];
  checkpointConfig?: CheckpointConfig;  // Only for chunk steps (B, C)
  executionContext?: StepExecutionContext;  // Step execution context properties
  
  // Flow step tracking
  parentFlowId?: string;    // ID of parent flow if this is a flow step
  parentFlowName?: string;  // Name of parent flow for display
  isFlowStep?: boolean;     // Whether this step belongs to a flow
  
  // Batchlet specific
  batchletClass?: string;
  
  // Chunk Reader specific
  readerClass?: string;
  dataSource?: 'file' | 'database' | 'rest';
  pageSize?: number;
  filenamePattern?: string;
  readerTableName?: string;
  serviceUrl?: string;
  criteria?: QueryCriteria[];
  
  // Chunk Processor specific
  processorClass?: string;
  skipExceptionClasses?: string[];
  retryExceptionClasses?: string[];
  noRollbackExceptionClasses?: string[];  // New: No-rollback exceptions
  retryLimit?: number;
  skipLimit?: number;
  skipExcludeClasses?: string[];  // New: Exceptions to exclude from skipping
  retryExcludeClasses?: string[];  // New: Exceptions to exclude from retrying
  
  // Chunk Writer specific
  writerClass?: string;
  dataDestination?: 'file' | 'database' | 'rest';
  commitInterval?: number;
  writerTableName?: string;
  writeFields?: string[];
  
  // Partitioner specific
  partitionerClass?: string;
  advancedPartitionConfig?: AdvancedPartitionConfig;  // Only for chunk with partition (C)
}

export interface JobParameter {
  name: string;
  type: 'String' | 'Long' | 'Double' | 'Date';
  required: boolean;
  defaultValue?: string;
  description: string;
  enabled?: boolean; // For optional common parameters
}

export interface JobRestartConfig {
  restartable: boolean;           // Job-level restart capability
  stepRestartConfig: {
    allowStartIfComplete: boolean;  // Allow steps to start if already completed
    startLimit: number;            // Maximum start attempts per step
    restartable: boolean;          // Step-level restart capability
  };
}

export interface BatchProperties {
  asOfDate?: {
    description: string;
    enabled: boolean;
  };
  pageSize?: {
    description: string;
    defaultValue?: string;
    enabled: boolean;
  };
  inputFilePattern?: {
    description: string;
    defaultValue?: string;
    enabled: boolean;
  };
  customProperties?: Array<{
    name: string;
    description: string;
    type: string;
    defaultValue?: string;
    required?: boolean;
  }>;
}

export interface FormData {
  batchName: string;
  functionalAreaCd: 'ED' | 'DC' | 'FN' | 'IN';
  frequency: 'DLY' | 'WKY' | 'MTH' | 'YRL';
  packageName: string;
  jobParameters?: {
    asOfDate: JobParameter;
    chunkSize?: JobParameter;
    dataSource?: JobParameter;
    customParameters?: JobParameter[];
  };
  batchProperties?: BatchProperties;
  batchListeners?: BatchListener[];
  stepItems?: (StepItem | DecisionStep | SplitStep | FlowElement)[];
  jobRestartConfig?: JobRestartConfig;
}

export interface Step {
  id: number;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: import('react').ComponentType<any>;
  insertedByDynamic?: boolean;
  stepItemId?: string;
}