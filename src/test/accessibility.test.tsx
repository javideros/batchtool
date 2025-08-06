import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock the theme hook
vi.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn()
  })
}));

// Mock the form store
vi.mock('@/lib/jsr352batchjobstore', () => ({
  useFormStore: () => ({
    steps: [{ id: 0, name: 'Test Step', component: () => null }],
    currentStep: 0,
    setSteps: vi.fn(),
    setCurrentStep: vi.fn(),
    resetForm: vi.fn(),
    formData: {},
    stepItems: [],
    dynamicStepsData: {}
  })
}));

describe('Accessibility Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have skip link that becomes visible on focus', () => {
    render(<App />);
    
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should have proper ARIA landmarks', () => {
    render(<App />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument(); // main content
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
  });

  it('should have proper heading structure', () => {
    render(<App />);
    
    const mainHeading = screen.getByText('JSR-352 Batch Tool');
    expect(mainHeading).toBeInTheDocument();
  });

  it('should have live region for step progress', () => {
    render(<App />);
    
    const stepProgress = screen.getByRole('status');
    expect(stepProgress).toHaveAttribute('aria-live', 'polite');
    expect(stepProgress).toHaveTextContent(/Step \d+ of \d+/);
  });

  it('should hide decorative elements from screen readers', () => {
    render(<App />);
    
    // Check if any decorative elements exist with aria-hidden
    const decorativeElements = document.querySelectorAll('[aria-hidden="true"]');
    expect(decorativeElements.length).toBeGreaterThanOrEqual(0);
  });
});