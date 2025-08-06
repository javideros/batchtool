/**
 * @fileoverview Theme toggle component for switching between light/dark modes
 * @module components/ui/theme-toggle
 */

import * as React from "react";
import { Button } from "./button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

/**
 * Theme toggle button component
 * @param {React.ComponentProps<typeof Button>} props - Button props
 * @returns {JSX.Element} Theme toggle button
 */
export const ThemeToggle = ({ className, ...props }: React.ComponentProps<typeof Button>) => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'light') return '☀️';
    if (theme === 'dark') return '🌙';
    return '🖥️';
  };

  const getLabel = () => {
    if (theme === 'light') return 'Light mode';
    if (theme === 'dark') return 'Dark mode';
    return 'System mode';
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className={cn(
        "h-9 w-9 transition-colors",
        "hover:bg-primary-foreground/10 hover:text-primary-foreground",
        "text-primary-foreground",
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
      title={getLabel()}
      {...props}
    >
      <span className="text-lg" aria-hidden="true">
        {getIcon()}
      </span>
      <span className="sr-only">{getLabel()}</span>
    </Button>
  );
};