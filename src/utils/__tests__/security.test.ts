/**
 * @fileoverview Tests for security utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeJavaClassName,
  sanitizePackageName,
  sanitizeBatchName,
  isValidFilePath,
  RateLimiter,
  generateCSP
} from '../security';

describe('Security Utils', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const input = '<div>Hello <script>alert("xss")</script> World</div>';
      const result = sanitizeHtml(input);
      expect(result).toBe('<div>Hello  World</div>');
    });

    it('should remove dangerous attributes', () => {
      const input = '<div onclick="alert(1)" onload="evil()">Content</div>';
      const result = sanitizeHtml(input);
      expect(result).toBe('<div>Content</div>');
    });

    it('should remove dangerous tags', () => {
      const input = '<div>Safe <iframe src="evil.com"></iframe> Content</div>';
      const result = sanitizeHtml(input);
      expect(result).toBe('<div>Safe  Content</div>');
    });
  });

  describe('sanitizeText', () => {
    it('should remove angle brackets', () => {
      const input = 'Hello <script> World';
      const result = sanitizeText(input);
      expect(result).toBe('Hello script World');
    });

    it('should remove dangerous protocols', () => {
      const input = 'javascript:alert(1) vbscript:evil() data:text/html,<script>';
      const result = sanitizeText(input);
      expect(result).toBe('alert(1) evil() text/html,script');
    });

    it('should remove control characters', () => {
      const input = 'Hello\x00\x1F\x7F World';
      const result = sanitizeText(input);
      expect(result).toBe('Hello World');
    });
  });

  describe('sanitizeJavaClassName', () => {
    it('should accept valid Java class names', () => {
      const input = 'com.example.MyClass';
      const result = sanitizeJavaClassName(input);
      expect(result).toBe('com.example.MyClass');
    });

    it('should throw error for invalid class names', () => {
      expect(() => sanitizeJavaClassName('123Invalid')).toThrow('Invalid Java class name format');
      expect(() => sanitizeJavaClassName('com..example')).toThrow('Invalid Java class name format');
    });

    it('should remove invalid characters', () => {
      const input = 'com.example.My@Class#';
      const result = sanitizeJavaClassName(input);
      expect(result).toBe('com.example.MyClass');
    });
  });

  describe('sanitizePackageName', () => {
    it('should accept valid package names', () => {
      const input = 'com.example.batch';
      const result = sanitizePackageName(input);
      expect(result).toBe('com.example.batch');
    });

    it('should convert to lowercase', () => {
      const input = 'COM.EXAMPLE.BATCH';
      const result = sanitizePackageName(input);
      expect(result).toBe('com.example.batch');
    });

    it('should throw error for invalid package names', () => {
      expect(() => sanitizePackageName('invalid')).toThrow('Invalid package name format');
      expect(() => sanitizePackageName('123.invalid')).toThrow('Invalid package name format');
    });
  });

  describe('sanitizeBatchName', () => {
    it('should convert to uppercase and limit length', () => {
      const input = 'my_very_long_batch_job_name_that_exceeds_limit';
      const result = sanitizeBatchName(input);
      expect(result).toBe('MY_VERY_LONG_BATCH_JOB_NA');
      expect(result.length).toBe(25);
    });

    it('should remove invalid characters', () => {
      const input = 'my-batch@job#name';
      const result = sanitizeBatchName(input);
      expect(result).toBe('MYBATCHJOBNAME');
    });
  });

  describe('isValidFilePath', () => {
    it('should reject directory traversal attempts', () => {
      expect(isValidFilePath('../../../etc/passwd')).toBe(false);
      expect(isValidFilePath('..\\windows\\system32')).toBe(false);
      expect(isValidFilePath('/etc/passwd')).toBe(false);
      expect(isValidFilePath('C:\\Windows\\System32')).toBe(false);
    });

    it('should accept safe relative paths', () => {
      expect(isValidFilePath('documents/file.txt')).toBe(true);
      expect(isValidFilePath('folder/subfolder/file.pdf')).toBe(true);
    });
  });

  describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter(3, 1000); // 3 attempts per second
    });

    it('should allow requests within limit', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      expect(rateLimiter.isAllowed('user1')).toBe(false);
    });

    it('should track different users separately', () => {
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      
      expect(rateLimiter.isAllowed('user1')).toBe(false);
      expect(rateLimiter.isAllowed('user2')).toBe(true);
    });

    it('should return correct remaining attempts', () => {
      expect(rateLimiter.getRemainingAttempts('user1')).toBe(3);
      rateLimiter.isAllowed('user1');
      expect(rateLimiter.getRemainingAttempts('user1')).toBe(2);
    });
  });

  describe('generateCSP', () => {
    it('should generate valid CSP header', () => {
      const csp = generateCSP();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self' 'unsafe-inline'");
      expect(csp).toContain("frame-ancestors 'none'");
    });
  });
});