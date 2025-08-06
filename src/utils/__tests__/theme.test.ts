/**
 * @fileoverview Tests for theme utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../../hooks/use-theme';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock matchMedia
const matchMediaMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  Object.defineProperty(window, 'matchMedia', {
    value: matchMediaMock,
    writable: true,
  });
  
  // Default matchMedia implementation
  matchMediaMock.mockImplementation((query) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe('useTheme', () => {
  it('should initialize with system theme by default', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.theme).toBe('system');
  });

  it('should load theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.theme).toBe('dark');
  });

  it('should set theme and save to localStorage', () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(result.current.theme).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should detect system dark mode preference', () => {
    localStorageMock.getItem.mockReturnValue('system');
    matchMediaMock.mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)' ? true : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.isDark).toBe(true);
  });

  it('should detect system light mode preference', () => {
    localStorageMock.getItem.mockReturnValue('system');
    matchMediaMock.mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.isDark).toBe(false);
  });

  it('should force dark mode when theme is dark', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.isDark).toBe(true);
  });

  it('should force light mode when theme is light', () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.isDark).toBe(false);
  });
});