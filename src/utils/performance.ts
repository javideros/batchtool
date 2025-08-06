// Performance utilities for bundle optimization
import React from 'react';

/**
 * Tree-shakable utility functions
 */
export const createOptimizedValidator = (regex: RegExp, message: string) => {
  return (value: string) => regex.test(value) || message;
};

/**
 * Memoized class name generator
 */
const classNameCache = new Map<string, string>();

export const getOptimizedClassName = (base: string, modifiers: string[] = []) => {
  const key = `${base}-${modifiers.join('-')}`;
  
  if (classNameCache.has(key)) {
    return classNameCache.get(key)!;
  }
  
  const className = [base, ...modifiers].filter(Boolean).join(' ');
  classNameCache.set(key, className);
  return className;
};

/**
 * Optimized form field renderer
 */
export const createFieldRenderer = (fieldType: string) => {
  const renderers = {
    text: (props: unknown) => React.createElement('input', { type: 'text', ...(props as object) }),
    number: (props: unknown) => React.createElement('input', { type: 'number', ...(props as object) }),
    select: (props: unknown) => React.createElement('select', props as object)
  };
  
  return renderers[fieldType as keyof typeof renderers] || renderers.text;
};

/**
 * Memoize expensive computations
 */
export const memoizeExpensive = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  measure<T>(label: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);
    
    return result;
  }
  
  getAverageTime(label: string): number {
    const times = this.metrics.get(label) || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }
  
  getMetrics() {
    const result: Record<string, { average: number; count: number }> = {};
    
    this.metrics.forEach((times, label) => {
      result[label] = {
        average: this.getAverageTime(label),
        count: times.length
      };
    });
    
    return result;
  }
}