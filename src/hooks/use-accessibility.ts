/**
 * @fileoverview Accessibility hooks for skip navigation and focus management
 * @module hooks/use-accessibility
 */

import { useEffect, useRef } from 'react';

/**
 * Hook for implementing skip-to-content functionality
 * @returns {Object} Skip navigation utilities
 * @returns {React.RefObject<HTMLAnchorElement>} returns.skipLinkRef - Ref for skip link element
 * @returns {React.RefObject<HTMLElement>} returns.mainContentRef - Ref for main content element
 * @returns {Function} returns.skipToContent - Function to focus main content
 */
export const useSkipToContent = () => {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleSkipToContent = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        skipLinkRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleSkipToContent, { once: true });
    return () => document.removeEventListener('keydown', handleSkipToContent);
  }, []);

  const skipToContent = () => {
    mainContentRef.current?.focus();
  };

  return { skipLinkRef, mainContentRef, skipToContent };
};

/**
 * Hook for managing focus and screen reader announcements
 * @returns {Object} Focus management utilities
 * @returns {Function} returns.focusFirstError - Focuses first invalid form field
 * @returns {Function} returns.announceLiveRegion - Announces message to screen readers
 */
export const useFocusManagement = () => {
  /**
   * Focuses the first form field with validation errors
   */
  const focusFirstError = () => {
    const firstError = document.querySelector('[aria-invalid="true"]') as HTMLElement;
    firstError?.focus();
  };

  /**
   * Announces a message to screen readers using ARIA live regions
   * @param {string} message - Message to announce
   * @param {'polite' | 'assertive'} [priority='polite'] - Announcement priority
   */
  const announceLiveRegion = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    setTimeout(() => document.body.removeChild(liveRegion), 1000);
  };

  return { focusFirstError, announceLiveRegion };
};