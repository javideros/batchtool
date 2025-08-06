/**
 * @fileoverview Theme provider component for managing application theme context
 * @module components/ui/theme-provider
 */

import * as React from "react";
import { useTheme } from "@/hooks/use-theme";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
};

const ThemeContext = React.createContext<ReturnType<typeof useTheme> | undefined>(undefined);

/**
 * Theme provider component that wraps the application with theme context
 * @param {ThemeProviderProps} props - Provider props
 * @returns {JSX.Element} Theme provider wrapper
 */
export const ThemeProvider = ({ children, defaultTheme = 'system' }: ThemeProviderProps) => {
  const theme = useTheme();

  // Set default theme on first load
  React.useEffect(() => {
    if (!localStorage.getItem('theme')) {
      theme.setTheme(defaultTheme);
    }
  }, [defaultTheme, theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 * @returns {ReturnType<typeof useTheme>} Theme utilities
 * @throws {Error} When used outside ThemeProvider
 */
export const useThemeContext = () => {
  const context = React.useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  
  return context;
};