# Accessibility Guide 🌐

This document outlines the accessibility features implemented in the JSR-352 Batch Tool to ensure it's usable by everyone, including users with disabilities.

## 🎯 Accessibility Standards

The application follows **WCAG 2.1 AA** guidelines and implements:

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and landmarks
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: Sufficient contrast ratios for text and UI elements
- **Responsive Design**: Works across different screen sizes and zoom levels

## 🔧 Implemented Features

### Skip Navigation
- **Skip to main content** link appears on first Tab press
- Allows keyboard users to bypass navigation and go directly to content
- Located at `src/components/ui/skip-link.tsx`

### ARIA Landmarks
- `role="banner"` for header
- `role="main"` for main content area
- `role="contentinfo"` for footer
- `role="status"` for step progress indicator

### Form Accessibility
- **Required fields** marked with `aria-required="true"`
- **Error messages** with `role="alert"` and `aria-live="polite"`
- **Field descriptions** linked via `aria-describedby`
- **Form validation** with immediate feedback

### Focus Management
- **Focus indicators** visible on all interactive elements
- **Error focus**: Automatically focuses first error field on validation failure
- **Logical tab order** throughout the application

### Screen Reader Support
- **Live regions** announce form submission status
- **Hidden decorative elements** with `aria-hidden="true"`
- **Descriptive labels** for all form controls
- **Status announcements** for user actions

## 🎹 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate forward through interactive elements |
| `Shift + Tab` | Navigate backward through interactive elements |
| `Enter` | Activate buttons and submit forms |
| `Space` | Activate buttons and toggle controls |
| `Escape` | Close modals and dropdowns |
| `Ctrl/Cmd + →` | Navigate to next step (when not in input field) |
| `Ctrl/Cmd + ←` | Navigate to previous step (when not in input field) |

## 🎨 Visual Accessibility

### High Contrast Support
- Automatic detection of `prefers-contrast: high`
- Enhanced border widths and focus rings in high contrast mode
- Sufficient color contrast ratios (4.5:1 for normal text, 3:1 for large text)

### Reduced Motion Support
- Respects `prefers-reduced-motion: reduce`
- Disables animations for users who prefer reduced motion
- Maintains functionality while reducing visual distractions

### Focus Indicators
- Clear, visible focus rings on all interactive elements
- High contrast focus indicators that work in both light and dark modes
- Focus rings are never removed, only enhanced

## 🛠️ Implementation Details

### Custom Hooks

#### `useSkipToContent`
```typescript
const { skipLinkRef, mainContentRef, skipToContent } = useSkipToContent();
```
Manages skip navigation functionality.

#### `useFocusManagement`
```typescript
const { focusFirstError, announceLiveRegion } = useFocusManagement();
```
Handles focus management and screen reader announcements.

#### `useKeyboardNavigation`
```typescript
useKeyboardNavigation(onNext, onPrevious);
```
Enables keyboard shortcuts for step navigation.

### Form Components

All form components include:
- Proper labeling with `FormLabel`
- Error handling with `FormMessage`
- ARIA attributes for accessibility
- Screen reader descriptions

### CSS Classes

#### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  /* ... hides content visually but keeps it for screen readers */
}
```

## 🧪 Testing Accessibility

### Automated Testing
- Use `axe-core` for automated accessibility testing
- Run `npm run test:a11y` to check for accessibility violations

### Manual Testing
1. **Keyboard Navigation**: Navigate entire app using only keyboard
2. **Screen Reader**: Test with NVDA, JAWS, or VoiceOver
3. **High Contrast**: Test in Windows High Contrast mode
4. **Zoom**: Test at 200% zoom level
5. **Color Blindness**: Use tools like Stark or Colour Oracle

### Browser Extensions
- **axe DevTools**: Real-time accessibility scanning
- **WAVE**: Web accessibility evaluation
- **Lighthouse**: Accessibility audit in Chrome DevTools

## 📋 Accessibility Checklist

- ✅ Skip navigation implemented
- ✅ ARIA landmarks present
- ✅ Form labels and descriptions
- ✅ Error handling with ARIA
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ High contrast support
- ✅ Reduced motion support
- ✅ Screen reader announcements
- ✅ Semantic HTML structure

## 🔄 Continuous Improvement

Accessibility is an ongoing process. Regular audits and user testing help identify areas for improvement:

1. **User Testing**: Include users with disabilities in testing
2. **Regular Audits**: Monthly accessibility reviews
3. **Training**: Keep team updated on accessibility best practices
4. **Feedback**: Provide easy ways for users to report accessibility issues

## 📞 Support

If you encounter accessibility barriers while using this application, please contact our support team or file an issue in the repository.