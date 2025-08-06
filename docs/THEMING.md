# Theming Guide 🎨

> Comprehensive dark mode and theming system for the JSR-352 Batch Tool

## 🌓 Theme System Overview

The JSR-352 Batch Tool features a sophisticated theming system with support for:

- **Light Mode** - Clean, professional light interface
- **Dark Mode** - Modern dark interface with enhanced contrast
- **System Mode** - Automatically follows OS preference
- **Smooth Transitions** - Seamless theme switching animations

## 🛠️ Implementation

### Theme Hook

The `useTheme` hook manages theme state and system preference detection:

```typescript
const { theme, setTheme, isDark } = useTheme();

// Available themes: 'light' | 'dark' | 'system'
setTheme('dark');
```

### Theme Provider

Wrap your application with the `ThemeProvider`:

```tsx
<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>
```

### Theme Toggle Component

Interactive theme switcher with accessibility:

```tsx
<ThemeToggle />
```

**Features:**
- Cycles through light → dark → system
- Visual icons for each mode (☀️ 🌙 🖥️)
- Keyboard accessible
- Screen reader friendly

## 🎨 Color System

### CSS Custom Properties

The theme system uses CSS custom properties for dynamic color switching:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}

.dark {
  --background: 224 71% 4%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... */
}
```

### Enhanced Color Palette

**Light Mode:**
- Background: Pure white with subtle gradients
- Cards: Clean white with soft shadows
- Text: High contrast dark grays
- Primary: Professional blue tones

**Dark Mode:**
- Background: Deep navy with subtle variations
- Cards: Elevated dark surfaces
- Text: High contrast light colors
- Primary: Bright accent colors

### Additional Colors

```css
/* Success, Warning, Info colors */
--success: 142 76% 36%;
--warning: 38 92% 50%;
--info: 199 89% 48%;
```

## 🎯 Tailwind Integration

### Dark Mode Classes

Tailwind's dark mode variant is used throughout:

```tsx
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-gray-100">
    Content that adapts to theme
  </p>
</div>
```

### Custom Utilities

Enhanced utilities for theming:

```css
.theme-card {
  @apply bg-card border border-border theme-shadow rounded-lg;
}

.theme-shadow {
  @apply shadow-lg dark:shadow-2xl dark:shadow-black/25;
}

.dark-gradient {
  @apply bg-gradient-to-br from-background via-muted/50 to-background;
}
```

## 🔧 Component Theming

### Form Components

All form components include dark mode styling:

```tsx
<SecureInput
  className="dark:bg-input dark:border-input dark:text-foreground"
  // Automatic dark mode support
/>
```

### Cards and Containers

Enhanced card styling with theme awareness:

```tsx
<Card className="theme-card">
  <CardHeader>
    <CardTitle>Theme-aware card</CardTitle>
  </CardHeader>
</Card>
```

### Alerts and Notifications

Theme-aware alert styling:

```tsx
<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30">
  <p className="text-yellow-800 dark:text-yellow-200">
    Alert message
  </p>
</div>
```

## ⚡ Performance Optimizations

### Smooth Transitions

All theme changes include smooth transitions:

```css
body {
  @apply transition-colors duration-300;
}

.transition-colors {
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
}
```

### Efficient Color Switching

- CSS custom properties enable instant color updates
- No JavaScript color calculations
- Minimal reflow and repaint

### System Preference Detection

Automatic system theme detection with event listeners:

```typescript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', handleSystemThemeChange);
```

## 🎨 Customization

### Adding New Colors

1. **Define CSS Variables:**
```css
:root {
  --custom-color: 200 100% 50%;
}

.dark {
  --custom-color: 200 80% 60%;
}
```

2. **Add Tailwind Config:**
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'custom': 'hsl(var(--custom-color))',
      }
    }
  }
}
```

3. **Use in Components:**
```tsx
<div className="bg-custom text-custom-foreground">
  Custom themed content
</div>
```

### Theme Variants

Create custom theme variants:

```typescript
type CustomTheme = 'light' | 'dark' | 'system' | 'high-contrast';

const useCustomTheme = () => {
  // Extended theme logic
};
```

## ♿ Accessibility

### High Contrast Support

Automatic high contrast mode detection:

```css
@media (prefers-contrast: high) {
  .border {
    border-width: 2px;
  }
  
  .focus-visible\:ring-2:focus-visible {
    --tw-ring-width: 3px;
  }
}
```

### Reduced Motion Support

Respects user motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus Indicators

Enhanced focus indicators for both themes:

```css
*:focus-visible {
  @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
}
```

## 🧪 Testing

### Theme Testing

Comprehensive tests for theme functionality:

```typescript
describe('useTheme', () => {
  it('should initialize with system theme by default', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
  });

  it('should detect system dark mode preference', () => {
    // Mock system preference
    mockMatchMedia('(prefers-color-scheme: dark)', true);
    
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBe(true);
  });
});
```

### Visual Testing

Test theme switching across components:

```typescript
it('should apply dark mode styles', () => {
  render(
    <ThemeProvider defaultTheme="dark">
      <MyComponent />
    </ThemeProvider>
  );
  
  expect(document.documentElement).toHaveClass('dark');
});
```

## 📱 Responsive Theming

### Mobile Considerations

- Touch-friendly theme toggle
- Appropriate contrast ratios
- Readable text sizes in both themes

### Tablet and Desktop

- Hover states for interactive elements
- Enhanced shadows and depth
- Optimized for larger screens

## 🔄 Theme Persistence

### Local Storage

Theme preference is automatically saved:

```typescript
// Automatic persistence
localStorage.setItem('theme', selectedTheme);

// Automatic restoration on page load
const savedTheme = localStorage.getItem('theme');
```

### Session Handling

- Theme persists across browser sessions
- Respects system changes when in system mode
- Graceful fallback to system preference

## 🎯 Best Practices

### For Developers

1. **Always Test Both Themes**: Ensure components work in light and dark modes
2. **Use Semantic Colors**: Prefer `text-foreground` over `text-black`
3. **Include Transitions**: Add smooth transitions for theme changes
4. **Test Accessibility**: Verify contrast ratios and focus indicators
5. **Consider System Preferences**: Respect user's OS theme preference

### For Designers

1. **Maintain Contrast**: Ensure sufficient contrast in both themes
2. **Consistent Branding**: Keep brand colors recognizable across themes
3. **Test Edge Cases**: Verify readability in all scenarios
4. **Consider Context**: Some content may need theme-specific adjustments

## 🚀 Future Enhancements

### Planned Features

- **Custom Theme Builder**: User-defined color schemes
- **Theme Scheduling**: Automatic theme switching based on time
- **Accessibility Themes**: High contrast and low vision themes
- **Brand Themes**: Multiple brand color variations

### Advanced Customization

- CSS-in-JS theme objects
- Dynamic theme generation
- Theme marketplace/sharing
- Advanced animation controls

---

This comprehensive theming system ensures the JSR-352 Batch Tool provides an excellent user experience in any lighting condition while maintaining accessibility and performance standards.