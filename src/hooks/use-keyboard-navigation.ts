/**
 * @fileoverview Keyboard navigation hook for step-based interfaces
 * @module hooks/use-keyboard-navigation
 */

import { useEffect, useCallback } from 'react';

/**
 * Hook for implementing keyboard shortcuts in step-based navigation
 * @param {Function} [onNext] - Callback for next step navigation
 * @param {Function} [onPrevious] - Callback for previous step navigation
 */
export const useKeyboardNavigation = (onNext?: () => void, onPrevious?: () => void) => {
  /**
   * Handles keyboard events for navigation shortcuts
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle if not in an input field
    const inputElements = [HTMLInputElement, HTMLTextAreaElement, HTMLSelectElement];
    if (inputElements.some(Element => event.target instanceof Element)) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext?.();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrevious?.();
      }
    }
  }, [onNext, onPrevious]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};