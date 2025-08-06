# Batch Job Flows & Patterns 🔄

> How our tool creates different types of batch jobs and what they look like in action!

## The Three Flavors of Batch Jobs 🍦

### 1. Batchlet Jobs - "Keep It Simple" 🔨

**When to use:** One-off tasks, cleanup jobs, notifications

**The Flow:**
```
🚀 Start Job
    ↓
📋 Job Listeners (optional)
    ↓  
🔨 Execute Batchlet
    ↓
📋 Job Listeners (optional)
    ↓
✅ Job Complete
```

**What Our Tool Creates:**
```xml
<job id="mySimpleJob">
  <listeners>
    <listener ref="myJobListener"/>
  </listeners>
  
  <step id="myBatchletStep">
    <listeners>
      <listener ref="myStepListener"/>
    </listeners>
    <batchlet ref="myBatchlet"/>
  </step>
</job>
```

**Real Example:** Daily file cleanup job
- Deletes old log files
- Sends completion email
- Updates monitoring dashboard

---

### 2. Chunk Jobs - "Read, Process, Write" 📊

**When to use:** Data processing, ETL operations, transformations

**The Flow:**
```
🚀 Start Job
    ↓
📋 Job Listeners (optional)
    ↓
🔄 Start Step
    ↓
📋 Step Listeners (optional)
    ↓
📖 Read Chunk (e.g., 100 records)
    ↓
⚙️ Process Each Item (optional)
    ↓
💾 Write Chunk
    ↓
❓ More Data? → Yes: Loop back to Read
    ↓ No
📋 Step Listeners (optional)
    ↓
✅ Job Complete
```

**What Our Tool Creates:**
```xml
<job id="myChunkJob">
  <step id="myChunkStep">
    <listeners>
      <listener ref="myStepListener"/>
    </listeners>
    <chunk item-count="100">
      <reader ref="myReader"/>
      <processor ref="myProcessor"/>
      <writer ref="myWriter"/>
      <skippable-exception-classes>
        <include class="com.example.SkippableException"/>
      </skippable-exception-classes>
    </chunk>
  </step>
</job>
```

**Real Example:** Customer data processing
- Read customer records from database
- Validate and enrich data
- Write to data warehouse
- Skip invalid records, continue processing

---

### 3. Partitioned Chunk Jobs - "Divide and Conquer" 🔄

**When to use:** Large datasets, parallel processing, performance-critical jobs

**The Flow:**
```
🚀 Start Job
    ↓
📋 Job Listeners (optional)
    ↓
🔄 Start Partitioned Step
    ↓
📋 Step Listeners (optional)
    ↓
🗂️ Partitioner Splits Work
    ↓
┌─────────────────────────────────────┐
│ Partition 1    Partition 2    Partition 3 │
│     ↓              ↓              ↓       │
│ 📖 Read        📖 Read        📖 Read     │
│     ↓              ↓              ↓       │
│ ⚙️ Process     ⚙️ Process     ⚙️ Process  │
│     ↓              ↓              ↓       │
│ 💾 Write       💾 Write       💾 Write    │
└─────────────────────────────────────┘
    ↓
🔗 Collect Results (optional)
    ↓
📋 Step Listeners (optional)
    ↓
✅ Job Complete
```

**What Our Tool Creates:**
```xml
<job id="myPartitionedJob">
  <step id="myPartitionedStep">
    <listeners>
      <listener ref="myStepListener"/>
    </listeners>
    <partition>
      <plan partitions="3" threads="3"/>
      <reducer ref="myPartitionReducer"/>
      <chunk item-count="100">
        <reader ref="myReader"/>
        <processor ref="myProcessor"/>
        <writer ref="myWriter"/>
      </chunk>
    </partition>
  </step>
</job>
```

**Real Example:** Monthly report generation
- Split customers by region (3 partitions)
- Each partition processes its customers in parallel
- Combine results into final report

## How Our Tool Builds These Flows 🛠️

### Step 1: Job Foundation
```xml
<job id="{batchName}" xmlns="http://xmlns.jcp.org/xml/ns/javaee">
  <!-- We start here based on your basic info -->
</job>
```

### Step 2: Add Job-Level Stuff
```xml
<job id="{batchName}">
  <properties>
    <property name="{key}" value="{value}"/>
  </properties>
  
  <listeners>
    <listener ref="{listenerClass}"/>
  </listeners>
  
  <!-- Steps go here -->
</job>
```

### Step 3: Build Each Step
Based on your choices, we add the right step type:

**For Batchlet:**
```xml
<step id="{stepName}">
  <listeners>
    <listener ref="{stepListener}"/>
  </listeners>
  <batchlet ref="{batchletClass}"/>
</step>
```

**For Chunk:**
```xml
<step id="{stepName}">
  <listeners>
    <listener ref="{stepListener}"/>
  </listeners>
  <chunk item-count="{pageSize}">
    <reader ref="{readerClass}"/>
    <processor ref="{processorClass}"/>
    <writer ref="{writerClass}"/>
  </chunk>
</step>
```

**For Partitioned Chunk:**
```xml
<step id="{stepName}">
  <listeners>
    <listener ref="{stepListener}"/>
  </listeners>
  <partition>
    <plan partitions="3" threads="3"/>
    <reducer ref="{partitionerClass}"/>
    <chunk item-count="{pageSize}">
      <reader ref="{readerClass}"/>
      <processor ref="{processorClass}"/>
      <writer ref="{writerClass}"/>
    </chunk>
  </partition>
</step>
```

## Multi-Step Job Flows 🔗

You can create jobs with multiple steps that run in sequence:

```
🚀 Start Job
    ↓
📋 Job Listeners
    ↓
🔨 Step 1: Data Preparation (Batchlet)
    ↓
📊 Step 2: Data Processing (Chunk)
    ↓
🔄 Step 3: Parallel Analysis (Partitioned)
    ↓
🔨 Step 4: Cleanup (Batchlet)
    ↓
📋 Job Listeners
    ↓
✅ Job Complete
```

**Our tool handles this by:**
1. Letting you add multiple steps
2. Generating the right XML structure
3. Creating all the Java class templates
4. Ensuring proper step sequencing

## Error Handling & Recovery 🚨

### Skip Patterns
For chunk processing, you can skip problematic records:

```xml
<chunk item-count="100">
  <reader ref="myReader"/>
  <processor ref="myProcessor"/>
  <writer ref="myWriter"/>
  
  <skippable-exception-classes>
    <include class="com.example.DataValidationException"/>
    <include class="com.example.BusinessRuleException"/>
  </skippable-exception-classes>
  
  <skip-limit>10</skip-limit>
</chunk>
```

**What this means:**
- If processing fails for up to 10 records, skip them and continue
- Only skip for specific exception types
- Job fails if skip limit is exceeded

### Retry Patterns
Sometimes you want to retry failed operations:

```xml
<chunk item-count="100">
  <reader ref="myReader"/>
  <processor ref="myProcessor"/>
  <writer ref="myWriter"/>
  
  <retryable-exception-classes>
    <include class="com.example.TemporaryNetworkException"/>
    <include class="com.example.DatabaseConnectionException"/>
  </retryable-exception-classes>
  
  <retry-limit>3</retry-limit>
</chunk>
```

**What this means:**
- Retry failed operations up to 3 times
- Only retry for specific exception types
- Skip after retry limit is exceeded

### Combined Skip & Retry
You can use both patterns together:

```xml
<chunk item-count="100">
  <reader ref="myReader"/>
  <processor ref="myProcessor"/>
  <writer ref="myWriter"/>
  
  <!-- Try to retry these first -->
  <retryable-exception-classes>
    <include class="com.example.TemporaryException"/>
  </retryable-exception-classes>
  <retry-limit>3</retry-limit>
  
  <!-- If retry fails, skip these -->
  <skippable-exception-classes>
    <include class="com.example.TemporaryException"/>
    <include class="com.example.ValidationException"/>
  </skippable-exception-classes>
  <skip-limit>10</skip-limit>
</chunk>
```

**Our tool generates both limits:**
- **Skip Limit** - Maximum items to skip (1-100, default: 10)
- **Retry Limit** - Maximum retry attempts per item (1-10, default: 3)

**Processing order:**
1. Try to process the item
2. If retryable exception → retry up to limit
3. If still failing and skippable → skip the item
4. If not skippable → fail the job

## Performance Considerations 🚀

### Chunk Size Tuning
```xml
<chunk item-count="100">  <!-- Adjust based on your data -->
```

**Guidelines:**
- **Small chunks (10-50):** Complex processing, memory constraints
- **Medium chunks (100-500):** Balanced performance
- **Large chunks (1000+):** Simple processing, high throughput

### Partition Strategy
```xml
<partition>
  <plan partitions="4" threads="4"/>  <!-- Match your CPU cores -->
</partition>
```

**Guidelines:**
- **Partitions = CPU cores** for CPU-bound work
- **Partitions > CPU cores** for I/O-bound work
- **Consider memory usage** per partition

## Common Patterns We Generate 📋

### 1. **ETL Pipeline**
```
Extract (Reader) → Transform (Processor) → Load (Writer)
```

### 2. **Data Validation**
```
Read → Validate → Write Valid + Skip Invalid
```

### 3. **Report Generation**
```
Read Data → Aggregate → Format → Write Report
```

### 4. **Data Migration**
```
Read Old Format → Convert → Write New Format
```

### 5. **Batch Cleanup**
```
Find Old Records → Archive → Delete
```

## Decision Steps & Conditional Logic 🤔

> Add intelligent branching and conditional flow control to your batch jobs!

### What are Decision Steps?

Decision Steps are special JSR-352 elements that evaluate conditions and control job flow without processing data:

```xml
<decision id="checkDataQuality" ref="dataQualityDecider">
  <next on="HIGH_QUALITY" to="fastProcessing"/>
  <next on="LOW_QUALITY" to="detailedProcessing"/>
  <fail on="NO_DATA" exit-status="NO_DATA_TO_PROCESS"/>
</decision>
```

### Key Characteristics

**🎯 Decision Steps:**
- **Pure Logic** - No data processing, only decision making
- **Java Decider** - Implements `javax.batch.api.Decider` interface
- **Return Values** - Returns string values (TRUE/FALSE, VALID/INVALID, etc.)
- **Transition Based** - Uses same transition system as regular steps
- **Context Aware** - Can access job execution context and step results

### Common Decision Patterns

**Data Quality Check:**
```xml
<decision id="validateData" ref="dataValidationDecider">
  <next on="VALID" to="processData"/>
  <next on="INVALID" to="sendErrorReport"/>
  <fail on="CORRUPTED" exit-status="DATA_CORRUPTED"/>
</decision>
```

**Volume-Based Routing:**
```xml
<decision id="checkVolume" ref="volumeDecider">
  <next on="HIGH_VOLUME" to="parallelProcessing"/>
  <next on="LOW_VOLUME" to="simpleProcessing"/>
</decision>
```

**Business Logic Branching:**
```xml
<decision id="businessRuleCheck" ref="businessRuleDecider">
  <next on="PREMIUM_CUSTOMER" to="premiumProcessing"/>
  <next on="STANDARD_CUSTOMER" to="standardProcessing"/>
  <next on="NEW_CUSTOMER" to="onboardingFlow"/>
</decision>
```

### How Our Tool Generates Decision Steps

**In the Decision Step Configuration screen, you can:**
- **Define step name** - Unique identifier for the decision
- **Set decider class** - Java class implementing decision logic
- **Configure properties** - Parameters for the decision logic
- **Define transitions** - What happens for each decision result

**Generated XML Example:**
```xml
<decision id="dataQualityCheck" ref="com.example.DataQualityDecider">
  <properties>
    <property name="threshold" value="#{jobParameters['qualityThreshold']}"/>
    <property name="strictMode" value="true"/>
  </properties>
  
  <next on="HIGH_QUALITY" to="fastProcessing"/>
  <next on="LOW_QUALITY" to="detailedProcessing"/>
  <fail on="NO_DATA" exit-status="NO_DATA_FOUND"/>
</decision>
```

### Decision vs Regular Steps

| Feature | Regular Step | Decision Step |
|---------|-------------|---------------|
| **Purpose** | Process data | Make decisions |
| **Implementation** | Batchlet/Chunk | Decider class |
| **Data Processing** | ✅ Yes | ❌ No |
| **Transitions** | ✅ Yes | ✅ Yes |
| **Properties** | ✅ Yes | ✅ Yes |
| **Listeners** | ✅ Yes | ❌ No |
| **Return Value** | Exit Status | Decision Result |

## Split/Parallel Flows 🔄

> Enable parallel processing and performance optimization in your batch jobs!

### What are Split/Parallel Flows?

Split steps enable parallel execution of multiple flows, allowing different parts of your batch job to run simultaneously:

```xml
<split id="parallelProcessing">
  <flow id="customerFlow">
    <step id="processCustomers">
      <chunk>
        <reader ref="customerReader"/>
        <writer ref="customerWriter"/>
      </chunk>
    </step>
  </flow>
  
  <flow id="orderFlow">
    <step id="processOrders">
      <chunk>
        <reader ref="orderReader"/>
        <writer ref="orderWriter"/>
      </chunk>
    </step>
  </flow>
  
  <next on="*" to="combineResults"/>
</split>
```

### Key Characteristics

**🔄 Split Steps:**
- **Parallel Execution** - Multiple flows run simultaneously
- **Independent Processing** - Each flow operates independently
- **Performance Boost** - Reduces total execution time
- **Synchronization** - Job waits for all flows to complete
- **Resource Optimization** - Better utilization of system resources

### Common Split Patterns

**Data Type Separation:**
```xml
<split id="dataTypeProcessing">
  <flow id="customerData">
    <step id="processCustomers">...</step>
  </flow>
  <flow id="productData">
    <step id="processProducts">...</step>
  </flow>
  <flow id="orderData">
    <step id="processOrders">...</step>
  </flow>
</split>
```

**Geographic Distribution:**
```xml
<split id="regionalProcessing">
  <flow id="northRegion">
    <step id="processNorthData">...</step>
  </flow>
  <flow id="southRegion">
    <step id="processSouthData">...</step>
  </flow>
</split>
```

**Processing Pipeline:**
```xml
<split id="pipelineProcessing">
  <flow id="validationPipeline">
    <step id="validateData">...</step>
    <step id="cleanData">...</step>
  </flow>
  <flow id="enrichmentPipeline">
    <step id="enrichData">...</step>
    <step id="transformData">...</step>
  </flow>
</split>
```

### How Our Tool Generates Split Steps

**In the Split Configuration screen, you can:**
- **Define split name** - Unique identifier for the split
- **Configure parallel flows** - Multiple flows that run simultaneously
- **Set flow descriptions** - Document what each flow processes
- **Define next step** - What happens after all flows complete

**Generated XML Example:**
```xml
<split id="parallelProcessing">
  <flow id="customerFlow">
    <step id="processCustomers">
      <chunk>
        <reader ref="com.example.CustomerReader"/>
        <writer ref="com.example.CustomerWriter"/>
      </chunk>
    </step>
  </flow>
  
  <flow id="orderFlow">
    <step id="processOrders">
      <chunk>
        <reader ref="com.example.OrderReader"/>
        <writer ref="com.example.OrderWriter"/>
      </chunk>
    </step>
  </flow>
  
  <next on="COMPLETED" to="generateReport"/>
</split>
```

### Split vs Other Step Types

| Feature | Regular Step | Decision Step | Split Step |
|---------|-------------|---------------|------------|
| **Purpose** | Process data | Make decisions | Parallel execution |
| **Implementation** | Batchlet/Chunk | Decider class | Multiple flows |
| **Data Processing** | ✅ Yes | ❌ No | ✅ Yes (parallel) |
| **Transitions** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Properties** | ✅ Yes | ✅ Yes | ❌ No |
| **Listeners** | ✅ Yes | ❌ No | ❌ No |
| **Execution** | Sequential | Conditional | Parallel |
| **Performance** | Standard | Fast | Optimized |

## Flow Elements 🌊

> Create reusable, modular sequences of steps for better job organization!

### What are Flow Elements?

Flow elements are reusable sequences of steps that can be used independently or as building blocks within larger batch jobs:

```xml
<flow id="dataProcessingFlow">
  <step id="validateData">
    <batchlet ref="dataValidator"/>
    <next on="VALID" to="transformData"/>
    <fail on="INVALID" exit-status="VALIDATION_FAILED"/>
  </step>
  
  <step id="transformData">
    <chunk>
      <reader ref="dataReader"/>
      <processor ref="dataTransformer"/>
      <writer ref="dataWriter"/>
    </chunk>
    <next on="COMPLETED" to="generateReport"/>
  </step>
  
  <step id="generateReport">
    <batchlet ref="reportGenerator"/>
  </step>
</flow>
```

### Key Characteristics

**🌊 Flow Elements:**
- **Reusable** - Can be used in multiple places within a job
- **Modular** - Encapsulates related processing logic
- **Sequential** - Steps execute one after another
- **Flexible** - Can contain any combination of step types
- **Composable** - Can be used within splits for parallel execution

### Common Flow Patterns

**Data Processing Flow:**
```xml
<flow id="dataProcessingFlow">
  <step id="validateData">...</step>
  <step id="transformData">...</step>
  <step id="loadData">...</step>
</flow>
```

**Error Handling Flow:**
```xml
<flow id="errorHandlingFlow">
  <step id="detectErrors">...</step>
  <step id="logErrors">...</step>
  <step id="notifyAdmin">...</step>
  <step id="attemptRecovery">...</step>
</flow>
```

**Reporting Flow:**
```xml
<flow id="reportingFlow">
  <step id="aggregateData">...</step>
  <step id="calculateMetrics">...</step>
  <step id="formatReport">...</step>
  <step id="exportReport">...</step>
</flow>
```

**Cleanup Flow:**
```xml
<flow id="cleanupFlow">
  <step id="archiveData">...</step>
  <step id="purgeOldFiles">...</step>
  <step id="optimizeDatabase">...</step>
  <step id="verifyCleanup">...</step>
</flow>
```

### Flow Elements in Splits

Flow elements can be used within splits for parallel execution:

```xml
<split id="parallelProcessing">
  <flow id="customerProcessingFlow">
    <step id="validateCustomers">...</step>
    <step id="processCustomers">...</step>
  </flow>
  
  <flow id="orderProcessingFlow">
    <step id="validateOrders">...</step>
    <step id="processOrders">...</step>
  </flow>
</split>
```

### How Our Tool Generates Flow Elements

**In the Flow Configuration screen, you can:**
- **Define flow name** - Unique identifier for the flow
- **Set description** - Document what the flow accomplishes
- **Configure next step** - What happens after flow completion
- **Add multiple steps** - Build the flow sequence

**Generated XML Example:**
```xml
<flow id="dataProcessingFlow">
  <step id="validateInput">
    <batchlet ref="com.example.InputValidator"/>
    <next on="VALID" to="processData"/>
    <fail on="INVALID" exit-status="INVALID_INPUT"/>
  </step>
  
  <step id="processData">
    <chunk>
      <reader ref="com.example.DataReader"/>
      <processor ref="com.example.DataProcessor"/>
      <writer ref="com.example.DataWriter"/>
    </chunk>
  </step>
</flow>
```

### Flow vs Other Elements

| Feature | Step | Decision | Split | Flow |
|---------|------|----------|-------|------|
| **Purpose** | Process data | Make decisions | Parallel execution | Reusable sequence |
| **Implementation** | Batchlet/Chunk | Decider class | Multiple flows | Multiple steps |
| **Data Processing** | ✅ Yes | ❌ No | ✅ Yes (parallel) | ✅ Yes (sequential) |
| **Transitions** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Reusability** | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Modularity** | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Execution** | Single | Conditional | Parallel | Sequential |
| **Composition** | Atomic | Atomic | Container | Container |

## Checkpoint Configuration 📍

> Enable restart capability and optimize performance with intelligent checkpointing!

### What are Checkpoints?

Checkpoints save the progress of chunk processing, allowing jobs to restart from the last checkpoint instead of the beginning:

```xml
<chunk checkpoint-policy="item" item-count="1000">
  <reader ref="dataReader"/>
  <writer ref="dataWriter"/>
</chunk>
```

### Key Benefits

**📍 Checkpoints provide:**
- **Restart Capability** - Resume from last checkpoint after failure
- **Performance Optimization** - Commit data in batches for better throughput
- **Memory Management** - Prevent memory buildup in long-running jobs
- **Progress Tracking** - Monitor job progress and completion
- **Fault Tolerance** - Minimize data loss and reprocessing

### Checkpoint Strategies

**Item-Based Checkpointing:**
```xml
<chunk checkpoint-policy="item" item-count="1000">
  <!-- Checkpoint every 1000 items -->
</chunk>
```

**Time-Based Checkpointing:**
```xml
<chunk checkpoint-policy="item" item-count="1000" time-limit="300">
  <!-- Checkpoint every 1000 items OR every 5 minutes -->
</chunk>
```

**Custom Checkpoint Policy:**
```xml
<chunk checkpoint-policy="custom">
  <checkpoint-algorithm ref="com.example.CustomCheckpointAlgorithm"/>
</chunk>
```

### How Our Tool Configures Checkpoints

**In the Chunk Writer Configuration screen, you can:**
- **Enable/disable checkpoints** - Control checkpoint behavior
- **Set item count** - Checkpoint every N processed items
- **Set time limit** - Optional time-based checkpointing
- **Custom policy** - Advanced checkpoint algorithm

**Generated XML Example:**
```xml
<chunk checkpoint-policy="item" item-count="1000" time-limit="300">
  <reader ref="com.example.DataReader"/>
  <processor ref="com.example.DataProcessor"/>
  <writer ref="com.example.DataWriter"/>
</chunk>
```

### Checkpoint Best Practices

**Item Count Guidelines:**
- **Small datasets (< 10K):** 100-500 items
- **Medium datasets (10K-1M):** 1000-5000 items
- **Large datasets (> 1M):** 5000-10000 items
- **Very large datasets:** 10000+ items

**Time Limit Guidelines:**
- **Short jobs (< 1 hour):** No time limit needed
- **Medium jobs (1-4 hours):** 300-600 seconds (5-10 minutes)
- **Long jobs (> 4 hours):** 900-1800 seconds (15-30 minutes)

**Performance Considerations:**
- **Too frequent checkpoints:** Overhead reduces performance
- **Too infrequent checkpoints:** More data loss on restart
- **Balance:** Find the sweet spot for your data volume

### Checkpoint vs Commit Interval

| Feature | Checkpoint | Commit Interval |
|---------|------------|----------------|
| **Purpose** | Save restart position | Database transaction |
| **Scope** | Entire chunk step | Writer component |
| **Frequency** | Every N items/time | Every N items |
| **Restart** | ✅ Enables restart | ❌ No restart capability |
| **Performance** | Moderate impact | High impact |
| **Memory** | Clears processed items | Commits pending data |

### Common Checkpoint Patterns

**High-Volume Processing:**
```
Checkpoint: Every 10,000 items
Commit: Every 1,000 items
Ratio: 10:1 (10 commits per checkpoint)
```

**Memory-Intensive Processing:**
```
Checkpoint: Every 1,000 items
Commit: Every 100 items
Ratio: 10:1 (frequent memory cleanup)
```

**Time-Critical Processing:**
```
Checkpoint: Every 5,000 items OR 10 minutes
Commit: Every 500 items
Hybrid: Item + time-based strategy
```

### Restart Behavior

**Without Checkpoints:**
```
Job fails at item 50,000
Restart: Begins from item 1
Reprocessed: 50,000 items
```

**With Checkpoints (every 10,000):**
```
Job fails at item 50,000
Last checkpoint: Item 40,000
Restart: Begins from item 40,001
Reprocessed: 10,000 items (80% savings!)
```

## Step Transitions & Flow Control 🔄

> Control what happens when your steps complete with different exit statuses!

### Basic Step Transitions

Every step can define what happens based on its exit status:

```xml
<step id="validateData">
  <batchlet ref="dataValidator"/>
  
  <!-- Define transitions based on exit status -->
  <next on="VALID" to="processData"/>
  <next on="INVALID" to="sendAlert"/>
  <fail on="ERROR" exit-status="VALIDATION_FAILED"/>
  <end on="COMPLETED"/>
</step>
```

### Transition Actions

**Our tool supports four transition actions:**

1. **🔄 Next** - Continue to another step
   ```xml
   <next on="COMPLETED" to="nextStepId"/>
   ```

2. **✅ End** - Complete the job successfully
   ```xml
   <end on="COMPLETED" exit-status="JOB_COMPLETED"/>
   ```

3. **❌ Fail** - Fail the job with an error
   ```xml
   <fail on="ERROR" exit-status="PROCESSING_FAILED"/>
   ```

4. **⏸️ Stop** - Stop the job (can be restarted later)
   ```xml
   <stop on="PAUSED" restart="currentStep"/>
   ```

### Common Transition Patterns

**Data Validation Pattern:**
```xml
<step id="validateInput">
  <batchlet ref="inputValidator"/>
  <next on="VALID" to="processData"/>
  <fail on="INVALID" exit-status="INVALID_INPUT"/>
</step>
```

**Conditional Processing:**
```xml
<step id="checkDataSize">
  <batchlet ref="dataSizeChecker"/>
  <next on="LARGE_DATASET" to="parallelProcessing"/>
  <next on="SMALL_DATASET" to="simpleProcessing"/>
</step>
```

**Error Handling:**
```xml
<step id="processData">
  <chunk>...</chunk>
  <next on="COMPLETED" to="generateReport"/>
  <next on="PARTIAL_SUCCESS" to="handlePartialData"/>
  <fail on="FAILED" exit-status="PROCESSING_ERROR"/>
</step>
```

### How Our Tool Generates Transitions

**In the Step Configuration screens, you can:**
- **Define exit statuses** - What status triggers the transition
- **Choose actions** - next, end, fail, or stop
- **Set target steps** - Where to go next (for "next" action)
- **Custom exit status** - Override the job's final exit status

**Generated XML Example:**
```xml
<step id="myBatchletStep">
  <properties>
    <property name="timeout" value="300"/>
  </properties>
  <batchlet ref="com.example.MyBatchlet"/>
  
  <next on="COMPLETED" to="nextStep"/>
  <fail on="ERROR" exit-status="BATCHLET_FAILED"/>
  <end on="FINISHED"/>
</step>
```

## What Makes Our Generated Jobs Special? ✨

1. **Standard Compliant** - Follows JSR-352 specification exactly
2. **Production Ready** - Includes error handling, logging, monitoring, and flow control
3. **Maintainable** - Clean structure, clear naming, good documentation
4. **Flexible** - Easy to modify and extend with conditional logic
5. **Testable** - Proper separation of concerns, mockable components
6. **Flow Control** - 🆕 **NEW!** Support for step transitions and conditional execution
7. **Decision Logic** - 🆕 **NEW!** Intelligent branching with decision steps
8. **Parallel Processing** - 🆕 **NEW!** Split/parallel flows for performance optimization
9. **Flow Elements** - 🆕 **NEW!** Reusable, modular step sequences
10. **Checkpoint Configuration** - 🆕 **NEW!** Restart capability and performance optimization

---

**Ready to build your batch job?** Our wizard will guide you through choosing the right pattern and configuring all the details, including step transitions! 🎯