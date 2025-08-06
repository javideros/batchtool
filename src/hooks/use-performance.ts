/**
 * @fileoverview Performance optimization hooks and utilities
 * @module hooks/use-performance
 */

import React, { useCallback, useRef } from 'react';

/**
 * Hook providing performance optimization utilities
 */
export const usePerformance = () => {
  const performanceRef = useRef<{ [key: string]: number }>({});

  const measureTime = useCallback((label: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    performanceRef.current[label] = end - start;
  }, []);

  return {
    measureTime,
    getMetrics: () => performanceRef.current
  };
};

/**
 * Hook for lazy loading React components
 */
export function useLazyComponent<T extends React.ComponentType>(
  importFn: () => Promise<{ default: T }>
) {
  return React.lazy(importFn);
}