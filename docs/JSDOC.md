# JSDoc Documentation Guide 📚

This document explains the JSDoc documentation standards implemented in the JSR-352 Batch Tool.

## 🎯 Documentation Standards

All functions, components, hooks, and types are documented using JSDoc comments following these conventions:

### Components
```typescript
/**
 * Component description
 * @param {Props} props - Component props
 * @param {string} [props.className] - Optional CSS classes
 * @returns {JSX.Element} Component description
 * @example
 * <MyComponent className="custom-class" />
 */
```

### Hooks
```typescript
/**
 * Hook description and purpose
 * @returns {Object} Hook return object
 * @returns {Function} returns.method - Method description
 * @throws {Error} When conditions are not met
 */
```

### Functions
```typescript
/**
 * Function description
 * @param {Type} param - Parameter description
 * @returns {ReturnType} Return value description
 * @example
 * const result = myFunction('example');
 */
```

## 📁 Documented Files

### Components
- `src/components/ui/form.tsx` - Form components with accessibility
- `src/components/ui/skip-link.tsx` - Skip navigation component

### Hooks
- `src/hooks/use-accessibility.ts` - Accessibility utilities
- `src/hooks/use-keyboard-navigation.ts` - Keyboard shortcuts
- `src/hooks/use-performance.ts` - Performance optimizations

### State Management
- `src/lib/jsr352batchjobstore.ts` - Zustand store with persistence

## 🛠️ Generating Documentation

### Install JSDoc Dependencies
```bash
npm install -D jsdoc jsdoc-plugin-typescript
```

### Generate API Documentation
```bash
npx jsdoc -c jsdoc.config.js
```

### View Documentation
Open `docs/api/index.html` in your browser.

## 📋 JSDoc Tags Used

| Tag | Purpose | Example |
|-----|---------|---------|
| `@fileoverview` | File description | `@fileoverview Form components` |
| `@module` | Module identifier | `@module components/ui/form` |
| `@param` | Parameter description | `@param {string} name - Field name` |
| `@returns` | Return value | `@returns {JSX.Element} Form element` |
| `@throws` | Exception conditions | `@throws {Error} When invalid` |
| `@example` | Usage example | `@example <Form>...</Form>` |
| `@template` | Generic type | `@template T - Component type` |

## 🎨 Documentation Features

### Type Safety
- Full TypeScript integration
- Generic type documentation
- Interface and type alias coverage

### Accessibility Focus
- ARIA attribute documentation
- Screen reader considerations
- Keyboard navigation details

### Examples
- Real-world usage examples
- Code snippets for common patterns
- Integration examples

### Cross-References
- Automatic linking between related functions
- Module dependency mapping
- Type relationship documentation

## 🔄 Maintenance

### Documentation Standards
1. **Every public function/component must have JSDoc**
2. **Include @param for all parameters**
3. **Describe return values with @returns**
4. **Add @example for complex usage**
5. **Document @throws conditions**

### Review Checklist
- [ ] All parameters documented
- [ ] Return types specified
- [ ] Examples provided for complex functions
- [ ] Error conditions documented
- [ ] Accessibility considerations noted

## 📖 Best Practices

### Clear Descriptions
- Start with a clear, concise description
- Explain the purpose and behavior
- Include context when necessary

### Parameter Documentation
- Describe each parameter's purpose
- Include type information
- Mark optional parameters with `[param]`

### Examples
- Provide realistic usage examples
- Show common patterns
- Include edge cases when relevant

### Accessibility Notes
- Document ARIA attributes
- Explain keyboard interactions
- Note screen reader considerations

This comprehensive JSDoc documentation ensures the codebase is maintainable and accessible to new developers.