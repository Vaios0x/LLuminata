import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { SecurityService } from '../security';
import { z } from 'zod';

interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'number' | 'custom';
  value?: any;
  message: string;
  customValidator?: (value: any) => boolean | Promise<boolean>;
}

interface ValidationSchema {
  [fieldName: string]: ValidationRule[];
}

interface ValidationState {
  values: Record<string, any>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isDirty: boolean;
  validationHistory: {
    field: string;
    value: any;
    errors: string[];
    timestamp: Date;
  }[];
  customValidators: Record<string, (value: any) => boolean | Promise<boolean>>;
}

interface InputValidationActions {
  validateField: (field: string, value: any) => Promise<string[]>;
  validateForm: (values: Record<string, any>) => Promise<Record<string, string[]>>;
  setValue: (field: string, value: any) => void;
  setTouched: (field: string, touched: boolean) => void;
  resetForm: () => void;
  addCustomValidator: (field: string, validator: (value: any) => boolean | Promise<boolean>) => void;
  removeCustomValidator: (field: string) => void;
  getFieldError: (field: string) => string[];
  isFieldValid: (field: string) => boolean;
  sanitizeInput: (input: string, type: 'html' | 'sql' | 'xss') => string;
  validateAndSanitize: (field: string, value: any) => Promise<{ value: any; errors: string[] }>;
}

export function useInputValidation(schema?: ValidationSchema) {
  const { user } = useAuth();
  const [securityService] = useState(() => new SecurityService());
  const [state, setState] = useState<ValidationState>({
    values: {},
    errors: {},
    touched: {},
    isValid: true,
    isDirty: false,
    validationHistory: [],
    customValidators: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar servicio de seguridad
  useEffect(() => {
    const initializeSecurityService = async () => {
      try {
        setLoading(true);
        await securityService.initialize();
        setError(null);
      } catch (err) {
        setError('Error inicializando servicio de seguridad');
        console.error('Error inicializando servicio de seguridad:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeSecurityService();
    }
  }, [user, securityService]);

  // Validar campo individual
  const validateField = useCallback(async (field: string, value: any): Promise<string[]> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const errors: string[] = [];

      // Validar reglas del schema
      if (schema && schema[field]) {
        for (const rule of schema[field]) {
          const isValid = await validateRule(rule, value);
          if (!isValid) {
            errors.push(rule.message);
          }
        }
      }

      // Validar con servicio de seguridad
      const securityValidation = await securityService.validateInput(field, value);
      if (!securityValidation.isValid) {
        errors.push(...securityValidation.errors);
      }

      // Validar con validadores personalizados
      if (state.customValidators[field]) {
        const customValid = await state.customValidators[field](value);
        if (!customValid) {
          errors.push(`Validación personalizada falló para ${field}`);
        }
      }

      // Actualizar historial
      setState(prev => ({
        ...prev,
        validationHistory: [
          {
            field,
            value,
            errors,
            timestamp: new Date(),
          },
          ...prev.validationHistory.slice(0, 99), // Mantener solo los últimos 100
        ],
      }));

      return errors;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error validando campo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService, schema, state.customValidators]);

  // Validar regla individual
  const validateRule = useCallback(async (rule: ValidationRule, value: any): Promise<boolean> => {
    switch (rule.type) {
      case 'required':
        return value !== null && value !== undefined && value !== '';
      
      case 'minLength':
        return typeof value === 'string' && value.length >= (rule.value || 0);
      
      case 'maxLength':
        return typeof value === 'string' && value.length <= (rule.value || Infinity);
      
      case 'pattern':
        return typeof value === 'string' && new RegExp(rule.value || '').test(value);
      
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      
      case 'number':
        return !isNaN(Number(value)) && isFinite(Number(value));
      
      case 'custom':
        if (rule.customValidator) {
          return await rule.customValidator(value);
        }
        return true;
      
      default:
        return true;
    }
  }, []);

  // Validar formulario completo
  const validateForm = useCallback(async (values: Record<string, any>): Promise<Record<string, string[]>> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const errors: Record<string, string[]> = {};

      // Validar cada campo
      for (const [field, value] of Object.entries(values)) {
        const fieldErrors = await validateField(field, value);
        if (fieldErrors.length > 0) {
          errors[field] = fieldErrors;
        }
      }

      // Validar formulario completo con servicio de seguridad
      const formValidation = await securityService.validateForm(values);
      if (!formValidation.isValid) {
        Object.assign(errors, formValidation.errors);
      }

      // Actualizar estado
      setState(prev => ({
        ...prev,
        values,
        errors,
        isValid: Object.keys(errors).length === 0,
        isDirty: true,
      }));

      return errors;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error validando formulario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, securityService, validateField]);

  // Establecer valor de campo
  const setValue = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      isDirty: true,
    }));
  }, []);

  // Establecer campo como tocado
  const setTouched = useCallback((field: string, touched: boolean) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));
  }, []);

  // Resetear formulario
  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      values: {},
      errors: {},
      touched: {},
      isValid: true,
      isDirty: false,
    }));
  }, []);

  // Agregar validador personalizado
  const addCustomValidator = useCallback((field: string, validator: (value: any) => boolean | Promise<boolean>) => {
    setState(prev => ({
      ...prev,
      customValidators: { ...prev.customValidators, [field]: validator },
    }));
  }, []);

  // Remover validador personalizado
  const removeCustomValidator = useCallback((field: string) => {
    setState(prev => {
      const { [field]: removed, ...remainingValidators } = prev.customValidators;
      return {
        ...prev,
        customValidators: remainingValidators,
      };
    });
  }, []);

  // Obtener errores de campo
  const getFieldError = useCallback((field: string): string[] => {
    return state.errors[field] || [];
  }, [state.errors]);

  // Verificar si campo es válido
  const isFieldValid = useCallback((field: string): boolean => {
    return !state.errors[field] || state.errors[field].length === 0;
  }, [state.errors]);

  // Sanitizar entrada
  const sanitizeInput = useCallback((input: string, type: 'html' | 'sql' | 'xss'): string => {
    if (!input || typeof input !== 'string') return input;

    try {
      return securityService.sanitizeInput(input, type);
    } catch (err) {
      console.error('Error sanitizando entrada:', err);
      return input;
    }
  }, [securityService]);

  // Validar y sanitizar
  const validateAndSanitize = useCallback(async (
    field: string, 
    value: any
  ): Promise<{ value: any; errors: string[] }> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      let sanitizedValue = value;

      // Sanitizar si es string
      if (typeof value === 'string') {
        sanitizedValue = sanitizeInput(value, 'xss');
      }

      // Validar campo
      const errors = await validateField(field, sanitizedValue);

      return { value: sanitizedValue, errors };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error validando y sanitizando';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, validateField, sanitizeInput]);

  // Función helper para validación en tiempo real
  const validateOnChange = useCallback(async (field: string, value: any) => {
    setValue(field, value);
    setTouched(field, true);
    
    const errors = await validateField(field, value);
    
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: errors },
      isValid: Object.keys({ ...prev.errors, [field]: errors }).every(key => 
        !prev.errors[key] || prev.errors[key].length === 0
      ),
    }));
  }, [setValue, setTouched, validateField]);

  // Función helper para validación con Zod
  const validateWithZod = useCallback(async <T>(
    schema: z.ZodSchema<T>,
    data: any
  ): Promise<{ success: boolean; data?: T; errors?: string[] }> => {
    try {
      const result = schema.safeParse(data);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        const errors = result.error.errors.map(err => err.message);
        return { success: false, errors };
      }
    } catch (err) {
      return { success: false, errors: ['Error de validación'] };
    }
  }, []);

  // Función helper para obtener estadísticas de validación
  const getValidationStats = useCallback(() => {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const lastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const hourlyValidations = state.validationHistory.filter(
      entry => entry.timestamp > lastHour
    ).length;

    const dailyValidations = state.validationHistory.filter(
      entry => entry.timestamp > lastDay
    ).length;

    const totalErrors = state.validationHistory.reduce(
      (sum, entry) => sum + entry.errors.length, 0
    );

    const successRate = state.validationHistory.length > 0
      ? ((state.validationHistory.length - totalErrors) / state.validationHistory.length) * 100
      : 100;

    return {
      totalValidations: state.validationHistory.length,
      totalErrors,
      hourlyValidations,
      dailyValidations,
      successRate: Math.round(successRate * 100) / 100,
      isValid: state.isValid,
      isDirty: state.isDirty,
      customValidators: Object.keys(state.customValidators).length,
    };
  }, [state.validationHistory, state.isValid, state.isDirty, state.customValidators]);

  return {
    // Estado
    ...state,
    loading,
    error,
    
    // Acciones
    validateField,
    validateForm,
    setValue,
    setTouched,
    resetForm,
    addCustomValidator,
    removeCustomValidator,
    getFieldError,
    isFieldValid,
    sanitizeInput,
    validateAndSanitize,
    
    // Helpers
    validateOnChange,
    validateWithZod,
    getValidationStats,
  };
}
