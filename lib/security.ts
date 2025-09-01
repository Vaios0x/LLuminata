import { createHash, randomBytes } from 'crypto';
import { z } from 'zod';

// Configuración de seguridad
export const SECURITY_CONFIG = {
  PASSWORD_MIN_LENGTH: 12,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL: true,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
  TOKEN_EXPIRY: 60 * 60 * 1000, // 1 hora
} as const;

// Esquemas de validación con Zod
export const validationSchemas = {
  // Esquema para autenticación
  auth: {
    login: z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
      rememberMe: z.boolean().optional(),
    }),
    
    register: z.object({
      email: z.string().email('Email inválido'),
      password: z.string()
        .min(SECURITY_CONFIG.PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres`)
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
        .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
        .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial'),
      confirmPassword: z.string(),
      firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
      lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
      role: z.enum(['student', 'teacher', 'admin']).optional(),
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    }),
    
    resetPassword: z.object({
      email: z.string().email('Email inválido'),
    }),
    
    changePassword: z.object({
      currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
      newPassword: z.string()
        .min(SECURITY_CONFIG.PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres`)
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
        .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
        .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial'),
      confirmNewPassword: z.string(),
    }).refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "Las contraseñas no coinciden",
      path: ["confirmNewPassword"],
    }),
  },
  
  // Esquema para datos de estudiante
  student: {
    profile: z.object({
      firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
      lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50),
      dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
      gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
      language: z.string().min(2, 'El idioma es requerido'),
      culturalBackground: z.string().optional(),
      socioeconomicContext: z.string().optional(),
      previousEducation: z.number().min(0).optional(),
      specialNeeds: z.array(z.string()).optional(),
      accessibilityPreferences: z.object({
        highContrast: z.boolean().optional(),
        screenReader: z.boolean().optional(),
        voiceControl: z.boolean().optional(),
        fontSize: z.enum(['small', 'medium', 'large']).optional(),
      }).optional(),
    }),
    
    interactionData: z.object({
      readingSpeed: z.number().min(0).max(1000),
      readingAccuracy: z.number().min(0).max(100),
      readingComprehension: z.number().min(0).max(100),
      mathAccuracy: z.number().min(0).max(100),
      mathSpeed: z.number().min(0).max(1000),
      attentionSpan: z.number().min(0).max(100),
      taskCompletion: z.number().min(0).max(100),
      helpRequests: z.number().min(0),
      audioPreference: z.number().min(0).max(1),
      visualPreference: z.number().min(0).max(1),
      kinestheticPreference: z.number().min(0).max(1),
      readingErrors: z.object({
        substitutions: z.number().min(0),
        omissions: z.number().min(0),
        insertions: z.number().min(0),
        reversals: z.number().min(0),
        transpositions: z.number().min(0),
      }),
      mathErrors: z.object({
        calculation: z.number().min(0),
        procedural: z.number().min(0),
        conceptual: z.number().min(0),
        visual: z.number().min(0),
      }),
      responseTime: z.object({
        mean: z.number().min(0),
        variance: z.number().min(0),
        outliers: z.number().min(0),
      }),
      language: z.string().min(2),
      culturalBackground: z.string().min(2),
      socioeconomicContext: z.string().min(2),
      previousEducation: z.number().min(0).optional(),
      sessionDuration: z.number().min(0).optional(),
      breaksTaken: z.number().min(0).optional(),
      internetSpeed: z.number().min(0).optional(),
      offlineUsage: z.number().min(0).max(1).optional(),
      deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional(),
    }),
  },
  
  // Esquema para contenido educativo
  content: {
    lesson: z.object({
      title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
      description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(1000),
      content: z.string().min(20, 'El contenido debe tener al menos 20 caracteres'),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
      subject: z.string().min(2, 'La materia es requerida'),
      tags: z.array(z.string()).optional(),
      accessibilityFeatures: z.array(z.string()).optional(),
      culturalAdaptations: z.array(z.string()).optional(),
      estimatedDuration: z.number().min(1, 'La duración estimada debe ser al menos 1 minuto'),
    }),
    
    assessment: z.object({
      title: z.string().min(5).max(200),
      description: z.string().min(10).max(1000),
      questions: z.array(z.object({
        question: z.string().min(5),
        type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay']),
        options: z.array(z.string()).optional(),
        correctAnswer: z.string().optional(),
        points: z.number().min(1),
      })),
      timeLimit: z.number().min(1).optional(),
      passingScore: z.number().min(0).max(100),
    }),
  },
};

// Función para generar tokens seguros
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

// Función para generar hash de contraseña
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

// Función para verificar contraseña
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  const computedHash = createHash('sha256').update(password + salt).digest('hex');
  return hash === computedHash;
}

// Función para validar contraseña fuerte
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Longitud mínima
  if (password.length >= SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    score += 2;
  } else {
    feedback.push(`La contraseña debe tener al menos ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres`);
  }
  
  // Mayúsculas
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE) {
    feedback.push('La contraseña debe contener al menos una mayúscula');
  }
  
  // Minúsculas
  if (/[a-z]/.test(password)) {
    score += 1;
  } else if (SECURITY_CONFIG.PASSWORD_REQUIRE_LOWERCASE) {
    feedback.push('La contraseña debe contener al menos una minúscula');
  }
  
  // Números
  if (/[0-9]/.test(password)) {
    score += 1;
  } else if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBERS) {
    feedback.push('La contraseña debe contener al menos un número');
  }
  
  // Caracteres especiales
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else if (SECURITY_CONFIG.PASSWORD_REQUIRE_SPECIAL) {
    feedback.push('La contraseña debe contener al menos un carácter especial');
  }
  
  // Verificar patrones comunes
  const commonPatterns = [
    /123456/,
    /password/,
    /qwerty/,
    /admin/,
    /user/,
    /test/,
  ];
  
  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password.toLowerCase()));
  if (hasCommonPattern) {
    score -= 2;
    feedback.push('La contraseña contiene patrones comunes inseguros');
  }
  
  // Verificar repetición de caracteres
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('La contraseña no debe contener caracteres repetidos consecutivos');
  }
  
  const isValid = score >= 4 && feedback.length === 0;
  
  return {
    isValid,
    score: Math.max(0, score),
    feedback,
  };
}

// Función para sanitizar HTML
export function sanitizeHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '');
}

// Función para validar y sanitizar entrada de usuario
export function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Función para validar email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Función para validar UUID
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Función para generar CSRF token
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

// Función para validar CSRF token
export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 64;
}

// Función para encriptar datos sensibles
export function encryptSensitiveData(data: string): string {
  // En producción, usar una librería de encriptación como crypto-js o node:crypto
  const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  const cipher = createHash('sha256').update(data + key).digest('hex');
  return cipher;
}

// Función para desencriptar datos sensibles
export function decryptSensitiveData(encryptedData: string): string {
  // En producción, implementar desencriptación real
  return encryptedData; // Placeholder
}

// Función para validar entrada contra ataques de inyección
export function validateAgainstInjection(input: string): boolean {
  const injectionPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
    /(\b(exec|execute|sp_|xp_)\b)/i,
    /(\b(script|javascript|vbscript|expression)\b)/i,
    /(\b(onload|onerror|onclick|onmouseover)\b)/i,
    /(\b(alert|confirm|prompt)\b)/i,
    /(\b(document|window|location)\b)/i,
    /(\b(eval|setTimeout|setInterval)\b)/i,
  ];
  
  return !injectionPatterns.some(pattern => pattern.test(input));
}

// Función para generar nonce para CSP
export function generateNonce(): string {
  return randomBytes(16).toString('base64');
}

// Función para validar archivo subido
export function validateUploadedFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo es demasiado grande. Máximo 10MB permitido.',
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no permitido.',
    };
  }
  
  return { isValid: true };
}

// Función para generar auditoría de seguridad
export function generateSecurityAudit(userId: string, action: string, details: any): {
  id: string;
  userId: string;
  action: string;
  details: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
} {
  return {
    id: generateSecureToken(16),
    userId,
    action,
    details,
    timestamp: new Date(),
  };
}

// Función para detectar actividad sospechosa
export function detectSuspiciousActivity(activityLog: any[]): {
  isSuspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let isSuspicious = false;
  
  // Verificar múltiples intentos de login fallidos
  const failedLogins = activityLog.filter(log => 
    log.action === 'login_failed' && 
    log.timestamp > new Date(Date.now() - 15 * 60 * 1000) // Últimos 15 minutos
  );
  
  if (failedLogins.length >= 5) {
    isSuspicious = true;
    reasons.push('Múltiples intentos de login fallidos');
  }
  
  // Verificar actividad en horarios inusuales
  const now = new Date();
  const hour = now.getHours();
  if (hour < 6 || hour > 23) {
    reasons.push('Actividad en horario inusual');
  }
  
  // Verificar múltiples ubicaciones
  const uniqueIPs = new Set(activityLog.map(log => log.ipAddress)).size;
  if (uniqueIPs > 3) {
    isSuspicious = true;
    reasons.push('Actividad desde múltiples ubicaciones');
  }
  
  return { isSuspicious, reasons };
}

// Exportar tipos
export type ValidationSchema = typeof validationSchemas;
export type SecurityConfig = typeof SECURITY_CONFIG;
