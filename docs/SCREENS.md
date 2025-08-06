# Screen Guide 🖥️

> Let's walk through each screen - no jargon, just the good stuff!

## The Main Journey 🛤️

### 1. Batch Details - "Tell Us About Your Job" 📝

This is where it all starts! Think of it as filling out a job application for your batch process.

**What you'll fill out:**
- **Job Name** - Something memorable (like "daily_sales_report")
- **What Department** - Which team owns this? (Eligibility, Finance, etc.)
- **How Often** - Daily? Weekly? You decide!
- **Java Package** - Where your code will live (like "com.company.batch")

**Don't worry, we'll catch mistakes:**
- Can't leave anything blank
- Job names must be unique (no duplicates!)
- Package names need to look like real Java packages

---

### 2. Batch Properties - "Job Settings" ⚙️

Think of this like setting up preferences for your job. Need a timeout? A retry count? This is the place!

**Cool features:**
- **Add as many as you want** - Click the "+" button to add more
- **Pick the right type** - String, Number, Boolean, or Date
- **We give you one free** - `asOfDate` is already there (system handles it)

**We'll keep you on track:**
- No duplicate names allowed
- Every property needs a name AND value
- Values should match their type (numbers look like numbers, etc.)

---

### 3. Batch Listeners - "Who's Watching?" 👂

Want to know when your job starts, finishes, or hits a snag? Listeners are your friends!

**What's neat:**
- **Add multiple listeners** - The more the merrier
- **Smart suggestions** - We'll suggest names based on your package
- **Java-friendly** - Must end with 'Listener' (we'll remind you)

**We'll help you avoid oops moments:**
- Class names must look like real Java classes
- No two listeners can have the same name
- Package structure needs to make sense

---

### 4. Dynamic Steps - "The Fun Part!" 🎯

This is where you decide what your job actually DOES. It's like choosing your adventure!

**Pick your style:**
- **Batchlet** - "Just run this one thing" (simple and sweet)
- **Chunk** - "Read some data, do stuff to it, write it out" (the classic)
- **Chunk + Partition** - "Same as chunk, but run multiple copies in parallel" (for speed demons)

**What makes it special:**
- **Smart step names** - lowercase_with_underscores (we'll enforce this)
- **Optional processor** - For chunks, you can skip the middle step if you want
- **Adaptive flow** - We'll show you exactly the right screens based on your choice

---

### 5. Summary - "Does This Look Right?" 🔍

The grand finale! This is your chance to review everything before calling it done.

**You'll see:**
- **Your job basics** - Name, schedule, all that good stuff
- **All your properties** - With their types clearly marked
- **Your listeners** - Both job-level and step-level
- **Step details** - Every class, every setting, everything

**Your options:**
- **Go back** - Spotted a typo? No problem!
- **Finish up** - Looks good? Hit that complete button! 🎉

---

## 🔧 Dynamic Step Screens

### 1. Step Listeners Screen (`steplisteners.tsx`)
**Purpose**: Configure step-level event listeners

**Features**:
- **Dynamic listener management** - Add/remove step listeners
- **Java validation** - Must end with 'Listener'
- **Special navigation** - Returns to Dynamic Steps screen

---

### 2. Batchlet Definition Screen (`batchletdefinition.tsx`)
**Purpose**: Configure batchlet implementation

**Fields**:
- **Batchlet Class** - Java class ending with 'Batchlet'

**Validation**:
- Valid Java package and class name
- Unique class name across all steps

---

### 3. Chunk Reader Screen (`chunkreaderscreen.tsx`)
**Purpose**: Configure chunk data reading

**Data Sources**:
- **File** - File pattern matching
- **Database** - Table name and query criteria
- **REST** - Service URL and criteria

**Fields**:
- **Reader Class** - Java class ending with 'Reader'
- **Page Size** - Records per batch (1-10,000)
- **Source-specific configuration**

---

### 4. Chunk Processor Screen (`chunkprocessorscreen.tsx`)
**Purpose**: Configure chunk data processing

**Fields**:
- **Processor Class** - Java class ending with 'Processor'
- **Skip Exception Classes** - Exceptions to skip during processing

**Features**:
- **Dynamic exception management** - Add/remove exception classes
- **Java validation** - Proper exception class names

---

### 5. Chunk Writer Screen (`chunkwriterscreen.tsx`)
**Purpose**: Configure chunk data writing

**Data Destinations**:
- **File** - Output file patterns
- **Database** - Table name and commit intervals
- **REST** - Service URL and write fields

**Fields**:
- **Writer Class** - Java class ending with 'Writer'
- **Destination-specific configuration**

---

### 6. Chunk Partition Screen (`chunkpartition.tsx`)
**Purpose**: Configure parallel processing partitions

**Fields**:
- **Partitioner Class** - Java class ending with 'Partitioner'

**Validation**:
- Valid Java package and class name
- Unique class name across all steps

---

## 🔄 Screen Flow

```
Batch Details → Batch Properties → Batch Listeners → Dynamic Steps
                                                           ↓
Step Listeners → [Batchlet Definition] → Dynamic Steps (loop)
              ↘                      ↗
                [Chunk Reader → Processor → Writer → Partition]
                                                           ↓
                                                      Summary
```

## 📱 Responsive Design

All screens are responsive and include:
- **Mobile-first design** - Works on all screen sizes
- **Consistent navigation** - Back/Next buttons
- **Form validation** - Real-time error feedback
- **Loading states** - User feedback during operations