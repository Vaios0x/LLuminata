import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  validatePasswordStrength,
  sanitizeUserInput,
  validateEmail,
  validateUUID,
  generateSecureToken,
  validateAgainstInjection,
  sanitizeHTML,
  validateUploadedFile,
  detectSuspiciousActivity,
  SECURITY_CONFIG,
} from '@/lib/security';

describe('Security Utilities', () => {
  describe('validatePasswordStrength', () => {
    it('should validate strong passwords correctly', () => {
      const strongPassword = 'MySecurePass123!';
      const result = validatePasswordStrength(strongPassword);
      
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.feedback).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const weakPassword = '123456';
      const result = validatePasswordStrength(weakPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(4);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should detect common patterns', () => {
      const commonPassword = 'password123';
      const result = validatePasswordStrength(commonPassword);
      
      expect(result.feedback).toContain('La contraseña contiene patrones comunes inseguros');
    });

    it('should require minimum length', () => {
      const shortPassword = 'Abc123!';
      const result = validatePasswordStrength(shortPassword);
      
      expect(result.feedback).toContain(`La contraseña debe tener al menos ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres`);
    });
  });

  describe('sanitizeUserInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeUserInput(input);
      
      expect(sanitized).toBe('Hello World');
    });

    it('should remove JavaScript protocols', () => {
      const input = 'javascript:alert("xss")';
      const sanitized = sanitizeUserInput(input);
      
      expect(sanitized).toBe('');
    });

    it('should remove event handlers', () => {
      const input = 'Hello<img src="x" onerror="alert(1)">World';
      const sanitized = sanitizeUserInput(input);
      
      expect(sanitized).toBe('HelloWorld');
    });

    it('should escape special characters', () => {
      const input = 'Hello & World < "test" >';
      const sanitized = sanitizeUserInput(input);
      
      expect(sanitized).toBe('Hello &amp; World &quot;test&quot;');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const sanitized = sanitizeUserInput(input);
      
      expect(sanitized).toBe('Hello World');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        '123@numbers.com',
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example..com',
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validateUUID', () => {
    it('should validate correct UUIDs', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ];

      validUUIDs.forEach(uuid => {
        expect(validateUUID(uuid)).toBe(true);
      });
    });

    it('should reject invalid UUIDs', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123e4567-e89b-12d3-a456-42661417400', // too short
        '123e4567-e89b-12d3-a456-4266141740000', // too long
        '123e4567-e89b-12d3-a456-42661417400g', // invalid character
      ];

      invalidUUIDs.forEach(uuid => {
        expect(validateUUID(uuid)).toBe(false);
      });
    });
  });

  describe('generateSecureToken', () => {
    it('should generate tokens of specified length', () => {
      const token = generateSecureToken(32);
      expect(token).toHaveLength(64); // 32 bytes = 64 hex characters
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      
      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with only hex characters', () => {
      const token = generateSecureToken();
      expect(token).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('validateAgainstInjection', () => {
    it('should detect SQL injection attempts', () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
      ];

      sqlInjectionAttempts.forEach(attempt => {
        expect(validateAgainstInjection(attempt)).toBe(false);
      });
    });

    it('should detect XSS attempts', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        'onload="alert(\'xss\')"',
        'onerror="alert(1)"',
      ];

      xssAttempts.forEach(attempt => {
        expect(validateAgainstInjection(attempt)).toBe(false);
      });
    });

    it('should allow safe input', () => {
      const safeInputs = [
        'Hello World',
        'user@example.com',
        '12345',
        'normal text with spaces',
      ];

      safeInputs.forEach(input => {
        expect(validateAgainstInjection(input)).toBe(true);
      });
    });
  });

  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const html = '<div>Hello<script>alert("xss")</script>World</div>';
      const sanitized = sanitizeHTML(html);
      
      expect(sanitized).toBe('<div>HelloWorld</div>');
    });

    it('should remove iframe tags', () => {
      const html = '<p>Content<iframe src="malicious.com"></iframe>More content</p>';
      const sanitized = sanitizeHTML(html);
      
      expect(sanitized).toBe('<p>ContentMore content</p>');
    });

    it('should remove event handlers', () => {
      const html = '<img src="image.jpg" onload="alert(1)" onclick="alert(2)">';
      const sanitized = sanitizeHTML(html);
      
      expect(sanitized).toBe('<img src="image.jpg">');
    });

    it('should remove JavaScript protocols', () => {
      const html = '<a href="javascript:alert(\'xss\')">Click me</a>';
      const sanitized = sanitizeHTML(html);
      
      expect(sanitized).toBe('<a href="">Click me</a>');
    });
  });

  describe('validateUploadedFile', () => {
    it('should validate allowed file types', () => {
      const allowedFiles = [
        { type: 'image/jpeg', size: 1024 * 1024 } as File,
        { type: 'image/png', size: 2 * 1024 * 1024 } as File,
        { type: 'application/pdf', size: 5 * 1024 * 1024 } as File,
      ];

      allowedFiles.forEach(file => {
        const result = validateUploadedFile(file);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject files that are too large', () => {
      const largeFile = { type: 'image/jpeg', size: 15 * 1024 * 1024 } as File;
      const result = validateUploadedFile(largeFile);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('demasiado grande');
    });

    it('should reject disallowed file types', () => {
      const disallowedFile = { type: 'application/exe', size: 1024 } as File;
      const result = validateUploadedFile(disallowedFile);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Tipo de archivo no permitido');
    });
  });

  describe('detectSuspiciousActivity', () => {
    it('should detect multiple failed login attempts', () => {
      const activityLog = [
        { action: 'login_failed', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
        { action: 'login_failed', timestamp: new Date(Date.now() - 4 * 60 * 1000) },
        { action: 'login_failed', timestamp: new Date(Date.now() - 3 * 60 * 1000) },
        { action: 'login_failed', timestamp: new Date(Date.now() - 2 * 60 * 1000) },
        { action: 'login_failed', timestamp: new Date(Date.now() - 1 * 60 * 1000) },
      ];

      const result = detectSuspiciousActivity(activityLog);
      
      expect(result.isSuspicious).toBe(true);
      expect(result.reasons).toContain('Múltiples intentos de login fallidos');
    });

    it('should detect activity from multiple locations', () => {
      const activityLog = [
        { action: 'login', ipAddress: '192.168.1.1' },
        { action: 'login', ipAddress: '192.168.1.2' },
        { action: 'login', ipAddress: '192.168.1.3' },
        { action: 'login', ipAddress: '192.168.1.4' },
      ];

      const result = detectSuspiciousActivity(activityLog);
      
      expect(result.isSuspicious).toBe(true);
      expect(result.reasons).toContain('Actividad desde múltiples ubicaciones');
    });

    it('should detect unusual hour activity', () => {
      const activityLog = [
        { action: 'login', timestamp: new Date('2023-01-01T03:00:00Z') },
      ];

      const result = detectSuspiciousActivity(activityLog);
      
      expect(result.reasons).toContain('Actividad en horario inusual');
    });

    it('should not flag normal activity', () => {
      const activityLog = [
        { action: 'login', timestamp: new Date('2023-01-01T14:00:00Z') },
        { action: 'logout', timestamp: new Date('2023-01-01T15:00:00Z') },
      ];

      const result = detectSuspiciousActivity(activityLog);
      
      expect(result.isSuspicious).toBe(false);
      expect(result.reasons).toHaveLength(0);
    });
  });

  describe('SECURITY_CONFIG', () => {
    it('should have required configuration values', () => {
      expect(SECURITY_CONFIG.PASSWORD_MIN_LENGTH).toBeGreaterThan(8);
      expect(SECURITY_CONFIG.SESSION_TIMEOUT).toBeGreaterThan(0);
      expect(SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS).toBeGreaterThan(0);
      expect(SECURITY_CONFIG.LOCKOUT_DURATION).toBeGreaterThan(0);
      expect(SECURITY_CONFIG.TOKEN_EXPIRY).toBeGreaterThan(0);
    });

    it('should have reasonable timeout values', () => {
      expect(SECURITY_CONFIG.SESSION_TIMEOUT).toBeLessThan(7 * 24 * 60 * 60 * 1000); // Less than 7 days
      expect(SECURITY_CONFIG.LOCKOUT_DURATION).toBeLessThan(60 * 60 * 1000); // Less than 1 hour
      expect(SECURITY_CONFIG.TOKEN_EXPIRY).toBeLessThan(24 * 60 * 60 * 1000); // Less than 24 hours
    });
  });
});
