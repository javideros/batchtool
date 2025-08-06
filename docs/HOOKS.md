# Hooks Guide 🎣

> Our custom React hooks - the secret sauce that makes everything work smoothly!

## The Hook Squad 🤝

### ♿ Accessibility Hooks

#### `useSkipToContent` - "The Skip Navigator"
**What it does:** Provides skip-to-content functionality for keyboard users

**Get back:**
- `skipLinkRef` - Reference for the skip link element
- `mainContentRef` - Reference for the main content area
- `skipToContent` - Function to focus main content

**Usage:**
```typescript
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

#### `useFocusManagement` - "The Focus Master"
**What it does:** Manages focus and screen reader announcements

**Get back:**
- `focusFirstError` - Focuses the first form field with errors
- `announceLiveRegion` - Announces messages to screen readers

**Usage:**
```typescript
const { focusFirstError, announceLiveRegion } = useFocusManagement();

// On form error
focusFirstError();

// Announce success
announceLiveRegion('Form submitted successfully!');
```

#### `useKeyboardNavigation` - "The Keyboard Shortcut Master"
**What it does:** Adds keyboard shortcuts for step navigation

**Give it:**
- `onNext` - Function to call for next step (Ctrl/Cmd + →)
- `onPrevious` - Function to call for previous step (Ctrl/Cmd + ←)

**Usage:**
```typescript
const { handleNext, handlePrevious } = useStepNavigation();
useKeyboardNavigation(handleNext, handlePrevious);
```

### ⚡ Performance Hooks

#### `usePerformance` - "The Speed Optimizer"
**What it does:** Provides performance optimization utilities

**Get back:**
- `measureTime` - Measures function execution time
- `debounce` - Creates debounced functions
- `throttle` - Creates throttled functions
- `memoizeExpensive` - Memoizes expensive computations
- `getMetrics` - Returns performance metrics

**Usage:**
```typescript
const { debounce, measureTime } = usePerformance();

const debouncedSearch = debounce(searchFunction, 300);
measureTime('search', () => performSearch());
```

#### `useLazyComponent` - "The Lazy Loader"
**What it does:** Creates lazy-loaded React components

**Give it:**
- `importFn` - Dynamic import function

**Usage:**
```typescript
const LazyComponent = useLazyComponent(() => import('./HeavyComponent'));
```

### 📝 Form & Navigation Hooks

### `useFormStep` - "The Form Helper"
**What it does:** Takes care of all the boring form stuff so you don't have to

**Give it:**
- A validation schema (the rules)
- Which step you're on
- Some default values to start with

**Get back:**
- A fully configured form
- A "next" button handler
- A "back" button handler

**How to use it:**
```typescript
// Just plug it in and go!
const { form, handleNext, handlePrevious } = useFormStep({
  schema: myValidationRules,
  currentStep: 0,
  defaultValues: { name: '', email: '' }
});
```

---

### `useStepDataUpdate` - "The Data Manager"
**What it does:** Keeps all your step data organized and up-to-date

**What you get:**
- All your current step data
- A simple function to update any step

**Super simple to use:**
```typescript
const { stepItems, updateStepData } = useStepDataUpdate();

// Update any step with new data
updateStepData('step-123', { className: 'com.example.MyClass' });
```

**Why it's awesome:**
- **One place for everything** - No more scattered update logic
- **Bulletproof** - Won't let you update non-existent steps
- **Flexible** - Update just what you need, leave the rest alone

---

### `useStepNavigation` - "The Navigator"
**What it does:** Handles going back and forth between steps (and saves your work!)

**Tell it:**
- What step you're currently on
- Which step data to save to

**Get back:**
- A "back" button that saves your work
- A special "back to main menu" function

**Easy as pie:**
```typescript
const { handleBack, handleBackToDynamicSteps } = useStepNavigation(stepNumber, stepId);

// Regular back button
<Button onClick={() => handleBack(form)}>← Back</Button>

// Special "back to main" button
<Button onClick={() => handleBackToDynamicSteps(form)}>← Back to Steps</Button>
```

**The magic:**
- **Never lose your work** - Always saves before moving
- **Smart routing** - Knows where to go based on context
- **Safe navigation** - Won't break if something goes wrong

---

## How They Work Together 🔄

**The flow:**
```
📝 useFormStep (handles your form)
    ↓
💾 useStepDataUpdate (saves your data)
    ↓
🧭 useStepNavigation (moves you around)
    ↓
🏪 Zustand Store (keeps everything)
```

## Common Recipes 👨‍🍳

### The Standard Screen Pattern
```typescript
// This is how most screens work - copy this!
const MyScreen = ({ stepNumber, stepItemId }) => {
  // Get the data tools
  const { stepItems, updateStepData } = useStepDataUpdate();
  const { handleBack } = useStepNavigation(stepNumber, targetStepId);
  
  // Set up the form
  const { form, handleNext } = useFormStep({
    schema: myValidationRules,
    currentStep: stepNumber,
    defaultValues: { name: '', email: '' }
  });

  // Handle form submission
  const handleSubmit = (data) => {
    updateStepData(targetStepId, data);  // Save it
    handleNext(data);                    // Move forward
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Your form fields go here */}
      <Button onClick={() => handleBack(form)}>← Back</Button>
      <Button type="submit">Next →</Button>
    </form>
  );
};
```

### The Special Navigation Pattern
```typescript
// For screens that need to go back to a specific place
const SpecialScreen = ({ stepNumber, stepItemId }) => {
  const { updateStepData } = useStepDataUpdate();
  const { handleBackToDynamicSteps } = useStepNavigation(stepNumber, targetStepId);
  
  // Custom back button that goes to the main menu
  const handleBack = () => {
    handleBackToDynamicSteps(form, (data) => ({ 
      listeners: data.listeners  // Transform data if needed
    }));
  };
};
```

## Want to Build Your Own Hook? 🛠️

### Keep It Simple
- **One job per hook** - Don't try to do everything
- **Consistent patterns** - Follow the same style as existing hooks
- **Good names** - Make it obvious what the hook does

### Make It Bulletproof
- **Check your inputs** - Don't assume data is perfect
- **Handle errors gracefully** - Don't let things crash
- **Test edge cases** - What happens when things go wrong?

### Keep It Fast
- **Use `useMemo`** for expensive calculations
- **Use `useCallback`** for event handlers
- **Watch your dependencies** - Only re-run when needed

## 📚 JSDoc Documentation

All hooks are fully documented with JSDoc comments including:
- Parameter descriptions and types
- Return value documentation
- Usage examples
- Error conditions
- Accessibility considerations

**View the full API documentation:** [docs/api/index.html](../api/index.html)

## 🧪 Testing Hooks

All hooks include comprehensive tests:
- Unit tests for individual functionality
- Integration tests with components
- Accessibility testing for a11y hooks
- Performance testing for optimization hooks

**Run hook tests:**
```bash
npm test hooks
```

## ♿ Accessibility Best Practices

When using accessibility hooks:
- Always provide skip navigation for keyboard users
- Use live regions for dynamic content announcements
- Implement keyboard shortcuts that don't conflict with browser/screen reader shortcuts
- Test with actual screen readers (NVDA, JAWS, VoiceOver)

**Remember:** A good hook makes complex things simple! 🎯