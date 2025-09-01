/**
 * Servicio de Validación de Entrada para InclusiveAI Coach
 * Proporciona funcionalidades de validación y sanitización de datos de entrada
 */

// Tipos para el servicio de validación
export interface ValidationConfig {
  enabled: boolean;
  strictMode: boolean;
  sanitizeInputs: boolean;
  maxInputLength: number;
  allowedFileTypes: string[];
  maxFileSize: number;
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  enablePathTraversalProtection: boolean;
  enableCommandInjectionProtection: boolean;
  customValidators: Map<string, (value: any) => boolean>;
  customSanitizers: Map<string, (value: any) => any>;
}

export interface ValidationRule {
  id: string;
  name: string;
  field: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date' | 'file' | 'array' | 'object';
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  allowedValues?: any[];
  customValidator?: (value: any) => boolean;
  customSanitizer?: (value: any) => any;
  errorMessage?: string;
  sanitize?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData: any;
  warnings: string[];
  metadata?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
  rule?: string;
}

export interface ValidationStats {
  totalValidations: number;
  successfulValidations: number;
  failedValidations: number;
  totalErrors: number;
  topErrorTypes: Array<{
    code: string;
    count: number;
  }>;
  topInvalidFields: Array<{
    field: string;
    count: number;
  }>;
  averageValidationTime: number;
}

export interface ValidationAlert {
  id: string;
  type: 'xss_attempt' | 'sql_injection' | 'path_traversal' | 'command_injection' | 'validation_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  field: string;
  value: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  attempts: number;
  actions: Array<{
    type: 'block' | 'notify' | 'log' | 'sanitize';
    config: Record<string, any>;
  }>;
  metadata?: Record<string, any>;
}

/**
 * Servicio principal de Validación de Entrada
 */
export class InputValidationService {
  private config: ValidationConfig;
  private rules: Map<string, ValidationRule[]> = new Map(); // endpoint -> rules[]
  private alerts: Map<string, ValidationAlert> = new Map();
  private validationAttempts: Map<string, number> = new Map(); // ip -> attempts
  private isInitialized: boolean = false;
  private observers: Map<string, (data: any) => void> = new Map();

  constructor(config?: Partial<ValidationConfig>) {
    this.config = {
      enabled: true,
      strictMode: true,
      sanitizeInputs: true,
      maxInputLength: 10000,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      enableXSSProtection: true,
      enableSQLInjectionProtection: true,
      enablePathTraversalProtection: true,
      enableCommandInjectionProtection: true,
      customValidators: new Map(),
      customSanitizers: new Map(),
      ...config
    };

    this.initializeService();
  }

  /**
   * Inicializa el servicio
   */
  private initializeService(): void {
    if (!this.config.enabled) {
      console.log('⚠️ Servicio de validación de entrada deshabilitado');
      return;
    }

    console.log('🚀 Inicializando servicio de validación de entrada...');
    
    // Cargar validadores y sanitizadores por defecto
    this.loadDefaultValidators();
    this.loadDefaultSanitizers();
    
    this.isInitialized = true;
    console.log('✅ Servicio de validación de entrada inicializado');
  }

  /**
   * Carga validadores por defecto
   */
  private loadDefaultValidators(): void {
    // Validador de email
    this.config.customValidators.set('email', (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    });

    // Validador de URL
    this.config.customValidators.set('url', (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    });

    // Validador de fecha
    this.config.customValidators.set('date', (value: string) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    });

    // Validador de número entero
    this.config.customValidators.set('integer', (value: any) => {
      return Number.isInteger(Number(value));
    });

    // Validador de número decimal
    this.config.customValidators.set('decimal', (value: any) => {
      return !isNaN(Number(value)) && isFinite(Number(value));
    });
  }

  /**
   * Carga sanitizadores por defecto
   */
  private loadDefaultSanitizers(): void {
    // Sanitizador de string
    this.config.customSanitizers.set('string', (value: any) => {
      if (typeof value !== 'string') return String(value);
      return value.trim();
    });

    // Sanitizador de número
    this.config.customSanitizers.set('number', (value: any) => {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    });

    // Sanitizador de boolean
    this.config.customSanitizers.set('boolean', (value: any) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
      }
      return Boolean(value);
    });

    // Sanitizador de email
    this.config.customSanitizers.set('email', (value: any) => {
      if (typeof value !== 'string') return '';
      return value.toLowerCase().trim();
    });
  }

  /**
   * Valida datos de entrada
   */
  validate(
    data: any,
    rules: ValidationRule[],
    context?: {
      ipAddress?: string;
      userAgent?: string;
      endpoint?: string;
      userId?: string;
    }
  ): ValidationResult {
    if (!this.isInitialized) {
      return {
        isValid: true,
        errors: [],
        sanitizedData: data,
        warnings: ['Servicio de validación no inicializado']
      };
    }

    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    let sanitizedData = { ...data };

    // Verificar longitud máxima de entrada
    if (this.config.maxInputLength && JSON.stringify(data).length > this.config.maxInputLength) {
      errors.push({
        field: 'input',
        message: 'Datos de entrada demasiado largos',
        code: 'input_too_large',
        value: JSON.stringify(data).length
      });
    }

    // Aplicar reglas de validación
    for (const rule of rules) {
      const fieldValue = this.getNestedValue(data, rule.field);
      const validationResult = this.validateField(fieldValue, rule, context);
      
      if (!validationResult.isValid) {
        errors.push(...validationResult.errors);
      }
      
      if (validationResult.warnings.length > 0) {
        warnings.push(...validationResult.warnings);
      }

      // Sanitizar si es necesario
      if (rule.sanitize && this.config.sanitizeInputs) {
        const sanitizedValue = this.sanitizeField(fieldValue, rule);
        this.setNestedValue(sanitizedData, rule.field, sanitizedValue);
      }
    }

    // Verificar protección contra ataques
    if (this.config.enableXSSProtection) {
      const xssResult = this.checkXSSProtection(data, context);
      if (!xssResult.isValid) {
        errors.push(...xssResult.errors);
        this.createAlert(context, 'xss_attempt', 'Intento de XSS detectado', data);
      }
    }

    if (this.config.enableSQLInjectionProtection) {
      const sqlResult = this.checkSQLInjectionProtection(data, context);
      if (!sqlResult.isValid) {
        errors.push(...sqlResult.errors);
        this.createAlert(context, 'sql_injection', 'Intento de SQL Injection detectado', data);
      }
    }

    if (this.config.enablePathTraversalProtection) {
      const pathResult = this.checkPathTraversalProtection(data, context);
      if (!pathResult.isValid) {
        errors.push(...pathResult.errors);
        this.createAlert(context, 'path_traversal', 'Intento de Path Traversal detectado', data);
      }
    }

    if (this.config.enableCommandInjectionProtection) {
      const commandResult = this.checkCommandInjectionProtection(data, context);
      if (!commandResult.isValid) {
        errors.push(...commandResult.errors);
        this.createAlert(context, 'command_injection', 'Intento de Command Injection detectado', data);
      }
    }

    const validationTime = Date.now() - startTime;
    const isValid = errors.length === 0;

    console.log(`🔍 Validación completada en ${validationTime}ms - ${isValid ? '✅ Válido' : '❌ Inválido'}`);

    return {
      isValid,
      errors,
      sanitizedData,
      warnings,
      metadata: {
        validationTime,
        rulesApplied: rules.length,
        fieldsValidated: rules.length
      }
    };
  }

  /**
   * Valida un campo específico
   */
  private validateField(
    value: any,
    rule: ValidationRule,
    context?: any
  ): { isValid: boolean; errors: ValidationError[]; warnings: string[] } {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Verificar si es requerido
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: rule.field,
        message: rule.errorMessage || `El campo ${rule.field} es requerido`,
        code: 'required_field',
        value,
        rule: rule.name
      });
      return { isValid: false, errors, warnings };
    }

    // Si no es requerido y está vacío, es válido
    if (value === undefined || value === null || value === '') {
      return { isValid: true, errors, warnings };
    }

    // Validar tipo
    const typeValidation = this.validateType(value, rule.type);
    if (!typeValidation.isValid) {
      errors.push(...typeValidation.errors);
      return { isValid: false, errors, warnings };
    }

    // Validar longitud para strings
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push({
          field: rule.field,
          message: rule.errorMessage || `El campo ${rule.field} debe tener al menos ${rule.minLength} caracteres`,
          code: 'min_length',
          value: value.length,
          rule: rule.name
        });
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push({
          field: rule.field,
          message: rule.errorMessage || `El campo ${rule.field} debe tener máximo ${rule.maxLength} caracteres`,
          code: 'max_length',
          value: value.length,
          rule: rule.name
        });
      }
    }

    // Validar rango para números
    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push({
          field: rule.field,
          message: rule.errorMessage || `El campo ${rule.field} debe ser mayor o igual a ${rule.min}`,
          code: 'min_value',
          value,
          rule: rule.name
        });
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push({
          field: rule.field,
          message: rule.errorMessage || `El campo ${rule.field} debe ser menor o igual a ${rule.max}`,
          code: 'max_value',
          value,
          rule: rule.name
        });
      }
    }

    // Validar patrón
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        errors.push({
          field: rule.field,
          message: rule.errorMessage || `El campo ${rule.field} no cumple con el formato requerido`,
          code: 'pattern_mismatch',
          value,
          rule: rule.name
        });
      }
    }

    // Validar valores permitidos
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push({
        field: rule.field,
        message: rule.errorMessage || `El campo ${rule.field} debe ser uno de: ${rule.allowedValues.join(', ')}`,
        code: 'invalid_value',
        value,
        rule: rule.name
      });
    }

    // Validador personalizado
    if (rule.customValidator) {
      try {
        if (!rule.customValidator(value)) {
          errors.push({
            field: rule.field,
            message: rule.errorMessage || `El campo ${rule.field} no pasó la validación personalizada`,
            code: 'custom_validation_failed',
            value,
            rule: rule.name
          });
        }
      } catch (error) {
        errors.push({
          field: rule.field,
          message: `Error en validación personalizada: ${error}`,
          code: 'custom_validation_error',
          value,
          rule: rule.name
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida el tipo de dato
   */
  private validateType(value: any, type: ValidationRule['type']): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({
            field: 'type',
            message: 'El valor debe ser una cadena de texto',
            code: 'invalid_type',
            value
          });
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push({
            field: 'type',
            message: 'El valor debe ser un número',
            code: 'invalid_type',
            value
          });
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push({
            field: 'type',
            message: 'El valor debe ser un booleano',
            code: 'invalid_type',
            value
          });
        }
        break;

      case 'email':
        const emailValidator = this.config.customValidators.get('email');
        if (emailValidator && !emailValidator(value)) {
          errors.push({
            field: 'type',
            message: 'El valor debe ser un email válido',
            code: 'invalid_type',
            value
          });
        }
        break;

      case 'url':
        const urlValidator = this.config.customValidators.get('url');
        if (urlValidator && !urlValidator(value)) {
          errors.push({
            field: 'type',
            message: 'El valor debe ser una URL válida',
            code: 'invalid_type',
            value
          });
        }
        break;

      case 'date':
        const dateValidator = this.config.customValidators.get('date');
        if (dateValidator && !dateValidator(value)) {
          errors.push({
            field: 'type',
            message: 'El valor debe ser una fecha válida',
            code: 'invalid_type',
            value
          });
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push({
            field: 'type',
            message: 'El valor debe ser un array',
            code: 'invalid_type',
            value
          });
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          errors.push({
            field: 'type',
            message: 'El valor debe ser un objeto',
            code: 'invalid_type',
            value
          });
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitiza un campo
   */
  private sanitizeField(value: any, rule: ValidationRule): any {
    // Sanitizador personalizado
    if (rule.customSanitizer) {
      try {
        return rule.customSanitizer(value);
      } catch (error) {
        console.warn(`Error en sanitizador personalizado para ${rule.field}:`, error);
        return value;
      }
    }

    // Sanitizador por tipo
    const sanitizer = this.config.customSanitizers.get(rule.type);
    if (sanitizer) {
      return sanitizer(value);
    }

    return value;
  }

  /**
   * Verifica protección contra XSS
   */
  private checkXSSProtection(data: any, context?: any): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<form/gi,
      /<input/gi,
      /<textarea/gi,
      /<select/gi,
      /<button/gi,
      /<link/gi,
      /<meta/gi,
      /<style/gi
    ];

    const checkValue = (value: any, path: string = '') => {
      if (typeof value === 'string') {
        for (const pattern of xssPatterns) {
          if (pattern.test(value)) {
            errors.push({
              field: path || 'input',
              message: 'Contenido potencialmente peligroso detectado',
              code: 'xss_attempt',
              value: value.substring(0, 100) + '...'
            });
            break;
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        for (const [key, val] of Object.entries(value)) {
          checkValue(val, path ? `${path}.${key}` : key);
        }
      }
    };

    checkValue(data);
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Verifica protección contra SQL Injection
   */
  private checkSQLInjectionProtection(data: any, context?: any): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/gi,
      /(\b(or|and)\b\s+\d+\s*=\s*\d+)/gi,
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b.*\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/gi,
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b.*['"`])/gi,
      /(['"`].*\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/gi
    ];

    const checkValue = (value: any, path: string = '') => {
      if (typeof value === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(value)) {
            errors.push({
              field: path || 'input',
              message: 'Patrón de SQL Injection detectado',
              code: 'sql_injection',
              value: value.substring(0, 100) + '...'
            });
            break;
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        for (const [key, val] of Object.entries(value)) {
          checkValue(val, path ? `${path}.${key}` : key);
        }
      }
    };

    checkValue(data);
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Verifica protección contra Path Traversal
   */
  private checkPathTraversalProtection(data: any, context?: any): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const pathTraversalPatterns = [
      /\.\.\//gi,
      /\.\.\\/gi,
      /\.\.%2f/gi,
      /\.\.%5c/gi,
      /\.\.%252f/gi,
      /\.\.%255c/gi,
      /\.\.%c0%af/gi,
      /\.\.%c1%9c/gi
    ];

    const checkValue = (value: any, path: string = '') => {
      if (typeof value === 'string') {
        for (const pattern of pathTraversalPatterns) {
          if (pattern.test(value)) {
            errors.push({
              field: path || 'input',
              message: 'Patrón de Path Traversal detectado',
              code: 'path_traversal',
              value: value.substring(0, 100) + '...'
            });
            break;
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        for (const [key, val] of Object.entries(value)) {
          checkValue(val, path ? `${path}.${key}` : key);
        }
      }
    };

    checkValue(data);
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Verifica protección contra Command Injection
   */
  private checkCommandInjectionProtection(data: any, context?: any): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const commandPatterns = [
      /[;&|`$(){}[\]]/g,
      /\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ipconfig|dir|type|del|rm|cp|mv|chmod|chown|sudo|su|bash|sh|cmd|powershell)\b/gi,
      /(\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ipconfig|dir|type|del|rm|cp|mv|chmod|chown|sudo|su|bash|sh|cmd|powershell)\b.*[;&|`$(){}[\]]|.*[;&|`$(){}[\]]\s*\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ipconfig|dir|type|del|rm|cp|mv|chmod|chown|sudo|su|bash|sh|cmd|powershell)\b)/gi
    ];

    const checkValue = (value: any, path: string = '') => {
      if (typeof value === 'string') {
        for (const pattern of commandPatterns) {
          if (pattern.test(value)) {
            errors.push({
              field: path || 'input',
              message: 'Patrón de Command Injection detectado',
              code: 'command_injection',
              value: value.substring(0, 100) + '...'
            });
            break;
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        for (const [key, val] of Object.entries(value)) {
          checkValue(val, path ? `${path}.${key}` : key);
        }
      }
    };

    checkValue(data);
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Crea una alerta de seguridad
   */
  private createAlert(
    context: any,
    type: ValidationAlert['type'],
    description: string,
    data: any
  ): void {
    if (!context?.ipAddress) return;

    const attempts = (this.validationAttempts.get(context.ipAddress) || 0) + 1;
    this.validationAttempts.set(context.ipAddress, attempts);

    const alert: ValidationAlert = {
      id: this.generateId(),
      type,
      severity: this.determineSeverity(type, attempts),
      title: `Alerta de Validación: ${type}`,
      description,
      field: 'input',
      value: JSON.stringify(data).substring(0, 200) + '...',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent || 'Unknown',
      timestamp: new Date(),
      attempts,
      actions: [
        {
          type: 'log',
          config: { level: 'warn' }
        },
        {
          type: 'notify',
          config: { channel: 'security' }
        }
      ],
      metadata: {
        endpoint: context.endpoint,
        userId: context.userId
      }
    };

    this.alerts.set(alert.id, alert);
    console.log(`🚨 Alerta de validación: ${alert.title} - ${description}`);
    this.notifyObservers('alertCreated', alert);
  }

  /**
   * Determina la severidad de una alerta
   */
  private determineSeverity(type: ValidationAlert['type'], attempts: number): ValidationAlert['severity'] {
    if (attempts > 10) return 'critical';
    if (attempts > 5) return 'high';
    if (attempts > 2) return 'medium';
    return 'low';
  }

  /**
   * Obtiene un valor anidado de un objeto
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Establece un valor anidado en un objeto
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Obtiene estadísticas del servicio
   */
  getStats(): ValidationStats {
    // Implementación simplificada - en producción se usarían métricas reales
    return {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      totalErrors: 0,
      topErrorTypes: [],
      topInvalidFields: [],
      averageValidationTime: 0
    };
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): {
    isInitialized: boolean;
    isEnabled: boolean;
    totalRules: number;
    totalAlerts: number;
    validationAttempts: number;
  } {
    const totalValidationAttempts = Array.from(this.validationAttempts.values())
      .reduce((sum, attempts) => sum + attempts, 0);

    return {
      isInitialized: this.isInitialized,
      isEnabled: this.config.enabled,
      totalRules: Array.from(this.rules.values()).flat().length,
      totalAlerts: this.alerts.size,
      validationAttempts: totalValidationAttempts
    };
  }

  /**
   * Obtiene todas las alertas
   */
  getAlerts(): ValidationAlert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de validación de entrada actualizada');
  }

  /**
   * Limpia todos los recursos
   */
  async cleanup(): Promise<void> {
    this.rules.clear();
    this.alerts.clear();
    this.validationAttempts.clear();
    this.observers.clear();

    console.log('🧹 Servicio de validación de entrada limpiado');
  }

  // Métodos auxiliares
  private generateId(): string {
    return `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyObservers(event: string, data: any): void {
    console.log(`🔍 Evento de validación: ${event}`, data);
  }
}

// Instancia singleton del servicio
export const inputValidationService = new InputValidationService();

// Exportar el servicio como default
export default inputValidationService;
