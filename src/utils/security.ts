/**
 * @fileoverview Security utilities for input sanitization and XSS prevention
 * @module utils/security
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} input - Raw HTML input
 * @returns {string} Sanitized HTML string
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*javascript\s*:/gi, '');
  sanitized = sanitized.replace(/\s*vbscript\s*:/gi, '');
  sanitized = sanitized.replace(/\s*data\s*:/gi, '');
  
  // Remove dangerous tags
  const dangerousTags = ['iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized.trim();
};

/**
 * Sanitizes text input to prevent injection attacks
 * @param {string} input - Raw text input
 * @returns {string} Sanitized text string
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim();
};

/**
 * Validates and sanitizes Java class names
 * @param {string} className - Java class name to validate
 * @returns {string} Sanitized class name
 * @throws {Error} If class name is invalid
 */
export const sanitizeJavaClassName = (className: string): string => {
  if (!className) return '';
  
  const sanitized = className.replace(/[^a-zA-Z0-9._$]/g, '');
  
  // Validate Java class name format
  const javaClassRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/;
  if (!javaClassRegex.test(sanitized)) {
    throw new Error('Invalid Java class name format');
  }
  
  return sanitized;
};

/**
 * Validates and sanitizes package names
 * @param {string} packageName - Package name to validate
 * @returns {string} Sanitized package name
 * @throws {Error} If package name is invalid
 */
export const sanitizePackageName = (packageName: string): string => {
  if (!packageName) return '';
  
  const sanitized = packageName.toLowerCase().replace(/[^a-z0-9._]/g, '');
  
  // Validate package name format
  const packageRegex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
  if (!packageRegex.test(sanitized)) {
    throw new Error('Invalid package name format');
  }
  
  return sanitized;
};

/**
 * Sanitizes batch job names
 * @param {string} batchName - Batch name to sanitize
 * @returns {string} Sanitized batch name
 */
export const sanitizeBatchName = (batchName: string): string => {
  if (!batchName) return '';
  
  return batchName
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '')
    .substring(0, 25); // Limit to 25 characters
};

/**
 * Validates file paths to prevent directory traversal
 * @param {string} filePath - File path to validate
 * @returns {boolean} True if path is safe
 */
export const isValidFilePath = (filePath: string): boolean => {
  if (!filePath) return false;
  
  // Check for directory traversal patterns
  const dangerousPatterns = [
    /\.\./,
    /\/\//,
    /\\/,
    /^\//, // Absolute paths
    /^[a-zA-Z]:/i, // Windows drive letters
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(filePath));
};

/**
 * Rate limiting utility for form submissions
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  /**
   * Checks if action is allowed for given identifier
   * @param {string} identifier - Unique identifier (IP, user ID, etc.)
   * @returns {boolean} True if action is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Record this attempt
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }

  /**
   * Gets remaining attempts for identifier
   * @param {string} identifier - Unique identifier
   * @returns {number} Remaining attempts
   */
  getRemainingAttempts(identifier: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxAttempts - validAttempts.length);
  }
}

/**
 * Content Security Policy generator
 * @returns {string} CSP header value
 */
export const generateCSP = (): string => {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];
  
  return directives.join('; ');
};