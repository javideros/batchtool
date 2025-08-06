/**
 * @fileoverview Skip link component for keyboard navigation accessibility
 * @module components/ui/skip-link
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props for the SkipLink component
 */
interface SkipLinkProps {
  /** Target element ID or URL fragment */
  href: string;
  /** Link content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skip link component that allows keyboard users to bypass navigation
 * Becomes visible when focused and hidden otherwise
 * @param {SkipLinkProps} props - Component props
 * @returns {JSX.Element} Skip link element
 * @example
 * <SkipLink href="#main-content">Skip to main content</SkipLink>
 */
export const SkipLink = ({ href, children, className }: SkipLinkProps) => (
  <a
    href={href}
    className={cn(
      "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
      "bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className
    )}
  >
    {children}
  </a>
);