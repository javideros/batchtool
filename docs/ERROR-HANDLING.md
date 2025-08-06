# Error Handling & Recovery Guide 🚨

> Batch jobs deal with lots of data, and sometimes things go wrong. Here's how to handle it gracefully!

## The Three-Tier Error Strategy 🛡️

**JSR-352 gives you three ways to handle errors:**
1. **🔄 Retry** - "Try again, it might work this time"
2. **⏭️ Skip** - "Ignore this one and keep going"
3. **💥 Fail** - "Stop everything, something's seriously wrong"

---

## 🔄 Retry Pattern - "Try, Try Again"

**When to use:** Temporary issues like network glitches, database timeouts, or resource locks

```xml
<chunk item-count="100">
  <reader ref="myReader"/>
  <processor ref="myProcessor"/>
  <writer ref="myWriter"/>
  
  <retryable-exception-classes>
    <include class="com.example.TemporaryNetworkException"/>
    <include class="com.example.DatabaseConnectionException"/>
    <include class="java.sql.SQLTransientException"/>
  </retryable-exception-classes>
  
  <retry-limit>3</retry-limit>
</chunk>
```

**How it works:**
- 📝 **Item fails** → Check if exception is in retry list
- 🔄 **If retryable** → Wait a moment, try again (up to retry-limit times)
- ✅ **If succeeds** → Continue normally
- ❌ **If still fails** → Move to skip logic (if configured) or fail job

**Our tool settings:**
- **Retry Limit Range:** 1-10 attempts (default: 3)
- **Best for:** Network calls, database operations, file I/O
- **Not good for:** Data validation errors, business rule violations

---

## ⏭️ Skip Pattern - "Move Along, Nothing to See Here"

**When to use:** Bad data that shouldn't stop the whole job

```xml
<chunk item-count="100">
  <reader ref="myReader"/>
  <processor ref="myProcessor"/>
  <writer ref="myWriter"/>
  
  <skippable-exception-classes>
    <include class="com.example.DataValidationException"/>
    <include class="com.example.BusinessRuleException"/>
    <include class="java.lang.NumberFormatException"/>
  </skippable-exception-classes>
  
  <skip-limit>10</skip-limit>
</chunk>
```

**How it works:**
- 📝 **Item fails** → Check if exception is in skip list
- ⏭️ **If skippable** → Log the error, skip this item, continue with next
- 📊 **Track skips** → Count how many items we've skipped
- 🚨 **Hit skip limit** → Fail the job (too many bad records)

**Our tool settings:**
- **Skip Limit Range:** 1-100 items (default: 10)
- **Best for:** Invalid data formats, missing required fields, business rule failures
- **Not good for:** System errors, infrastructure problems

---

## 🔄⏭️ Combined Strategy - "The Best of Both Worlds"

**The smart approach:** Try to retry first, then skip if it keeps failing

```xml
<chunk item-count="100">
  <reader ref="myReader"/>
  <processor ref="myProcessor"/>
  <writer ref="myWriter"/>
  
  <!-- Step 1: Try to retry these -->
  <retryable-exception-classes>
    <include class="com.example.TemporaryException"/>
    <include class="java.sql.SQLTransientException"/>
  </retryable-exception-classes>
  <retry-limit>3</retry-limit>
  
  <!-- Step 2: If retry fails, skip these -->
  <skippable-exception-classes>
    <include class="com.example.TemporaryException"/>
    <include class="com.example.ValidationException"/>
  </skippable-exception-classes>
  <skip-limit>10</skip-limit>
</chunk>
```

**The complete flow:**
```
📝 Process Item
    ↓
❌ Exception Thrown
    ↓
❓ Is it retryable?
    ↓ Yes
🔄 Retry (up to retry-limit)
    ↓ Still failing
❓ Is it skippable?
    ↓ Yes
⏭️ Skip item (count towards skip-limit)
    ↓ Skip limit exceeded
💥 Fail Job
```

**Real-world example:**
1. **Database timeout** → Retry 3 times → If still failing, skip the record
2. **Invalid email format** → Skip immediately (no point retrying)
3. **Unknown system error** → Fail the job (something's seriously wrong)

---

## 🎯 Choosing the Right Strategy

| Error Type | Strategy | Why |
|------------|----------|-----|
| Network timeout | Retry → Skip | Might be temporary, but don't retry forever |
| Invalid email format | Skip only | Won't get better with retries |
| Database connection lost | Retry → Fail | System issue, needs attention |
| Missing required field | Skip only | Data quality issue, log and continue |
| Out of memory | Fail immediately | System problem, stop everything |

## 📊 Our Tool's Limit Settings

- **Skip Limit:** 1-100 items (default: 10)
- **Retry Limit:** 1-10 attempts per item (default: 3)
- **Smart defaults** based on common batch job patterns
- **Configurable ranges** to fit your specific needs

## 🔧 How to Configure in Our Tool

### 1. **Chunk Processor Screen**
- Add **Skip Exception Classes** for data quality issues
- Add **Retry Exception Classes** for temporary problems
- Set **Skip Limit** (how many bad records to tolerate)
- Set **Retry Limit** (how many times to retry each item)

### 2. **Smart UI Features**
- **Color coding:** Yellow for skip, blue for retry
- **Conditional fields:** Limits only show when exceptions are configured
- **Validation:** Prevents invalid limit ranges
- **Suggestions:** Auto-suggests exception class names

### 3. **Summary Display**
- Shows all configured exceptions with their limits
- Clear visual distinction between skip and retry
- Easy to review before generating job XML

## 💡 Best Practices

### **Start Conservative**
- Begin with low limits (skip: 5, retry: 2)
- Monitor your first few runs
- Adjust based on actual error patterns

### **Monitor Everything**
- Log all skipped items for analysis
- Track retry patterns to identify system issues
- Set up alerts for high skip/retry rates

### **Choose Exceptions Wisely**
- **Retry:** Temporary, infrastructure-related exceptions
- **Skip:** Data quality, validation, business rule exceptions
- **Fail:** Unknown errors, system failures

### **Test Your Error Handling**
- Inject bad data to test skip logic
- Simulate network issues to test retry logic
- Verify limits work as expected

---

**Remember:** Good error handling is the difference between a robust production batch job and one that fails at 2 AM! 🌙