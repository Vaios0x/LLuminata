'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Eye,
  EyeOff,
  Filter,
  Search,
  Settings,
  Download,
  RefreshCw,
  Activity,
  BarChart3,
  Zap,
  Target,
  Crosshair,
  MapPin,
  Calendar,
  Timer,
  RotateCcw,
  Play,
  Pause,
  Plus,
  Minus,
  Copy,
  Check,
  AlertOctagon,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Ban,
  Hash,
  Fingerprint,
  LockKeyhole,
  UnlockKeyhole,
  FileText,
  Code,
  Database,
  Network,
  Server,
  Globe,
  UserCheck,
  UserX,
  Clock,
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para validación de entrada
interface ValidationRule {
  id: string;
  name: string;
  type: 'regex' | 'length' | 'format' | 'custom';
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  format?: string;
  customFunction?: string;
  isActive: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  category: 'security' | 'format' | 'business' | 'accessibility';
}

interface ValidationAttempt {
  id: string;
  timestamp: Date;
  inputType: string;
  inputValue: string;
  validationRules: string[];
  passedRules: string[];
  failedRules: string[];
  isMalicious: boolean;
  threatType?: 'sql_injection' | 'xss' | 'path_traversal' | 'command_injection' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  blocked: boolean;
  sanitizedValue?: string;
}

interface ValidationMetrics {
  totalAttempts: number;
  successfulValidations: number;
  failedValidations: number;
  maliciousAttempts: number;
  blockedAttempts: number;
  activeRules: number;
  attemptsToday: number;
  attemptsThisHour: number;
  averageValidationTime: number;
  threatDetectionRate: number;
}

interface InputValidationProps {
  isAdmin?: boolean;
  onValidationAttempt?: (attempt: ValidationAttempt) => void;
  onRuleCreated?: (rule: ValidationRule) => void;
  onRuleUpdated?: (ruleId: string, updates: Partial<ValidationRule>) => void;
  onRuleDeleted?: (ruleId: string) => void;
  onExportData?: (data: any) => void;
  className?: string;
}

// Datos de ejemplo
const SAMPLE_VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'rule_1',
    name: 'SQL Injection Prevention',
    type: 'regex',
    pattern: '/(\\b(union|select|insert|update|delete|drop|create|alter)\\b)/i',
    isActive: true,
    severity: 'critical',
    description: 'Previene ataques de inyección SQL',
    category: 'security'
  },
  {
    id: 'rule_2',
    name: 'XSS Prevention',
    type: 'regex',
    pattern: '/(<script|javascript:|vbscript:|on\\w+\\s*=)/i',
    isActive: true,
    severity: 'critical',
    description: 'Previene ataques de Cross-Site Scripting',
    category: 'security'
  },
  {
    id: 'rule_3',
    name: 'Email Format',
    type: 'format',
    format: 'email',
    isActive: true,
    severity: 'medium',
    description: 'Valida formato de email',
    category: 'format'
  },
  {
    id: 'rule_4',
    name: 'Password Strength',
    type: 'custom',
    customFunction: 'passwordStrength',
    isActive: true,
    severity: 'high',
    description: 'Valida fortaleza de contraseña',
    category: 'security'
  },
  {
    id: 'rule_5',
    name: 'Path Traversal Prevention',
    type: 'regex',
    pattern: '/(\\.\\.\\/|\\.\\.\\\\)',
    isActive: true,
    severity: 'high',
    description: 'Previene ataques de path traversal',
    category: 'security'
  }
];

const SAMPLE_VALIDATION_ATTEMPTS: ValidationAttempt[] = [
  {
    id: 'attempt_1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    inputType: 'search',
    inputValue: "'; DROP TABLE users; --",
    validationRules: ['rule_1', 'rule_2'],
    passedRules: [],
    failedRules: ['rule_1'],
    isMalicious: true,
    threatType: 'sql_injection',
    severity: 'critical',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Unknown)',
    blocked: true
  },
  {
    id: 'attempt_2',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    inputType: 'comment',
    inputValue: '<script>alert("XSS")</script>',
    validationRules: ['rule_2'],
    passedRules: [],
    failedRules: ['rule_2'],
    isMalicious: true,
    threatType: 'xss',
    severity: 'critical',
    ipAddress: '203.0.113.45',
    userAgent: 'Mozilla/5.0 (Unknown)',
    blocked: true
  },
  {
    id: 'attempt_3',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    inputType: 'email',
    inputValue: 'user@example.com',
    validationRules: ['rule_3'],
    passedRules: ['rule_3'],
    failedRules: [],
    isMalicious: false,
    severity: 'low',
    ipAddress: '10.0.0.15',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    blocked: false,
    sanitizedValue: 'user@example.com'
  }
];

export function InputValidation({
  isAdmin = false,
  onValidationAttempt,
  onRuleCreated,
  onRuleUpdated,
  onRuleDeleted,
  onExportData,
  className
}: InputValidationProps) {
  const [rules, setRules] = useState<ValidationRule[]>(SAMPLE_VALIDATION_RULES);
  const [attempts, setAttempts] = useState<ValidationAttempt[]>(SAMPLE_VALIDATION_ATTEMPTS);
  const [metrics, setMetrics] = useState<ValidationMetrics>({
    totalAttempts: SAMPLE_VALIDATION_ATTEMPTS.length,
    successfulValidations: SAMPLE_VALIDATION_ATTEMPTS.filter(a => !a.isMalicious && a.passedRules.length > 0).length,
    failedValidations: SAMPLE_VALIDATION_ATTEMPTS.filter(a => a.failedRules.length > 0).length,
    maliciousAttempts: SAMPLE_VALIDATION_ATTEMPTS.filter(a => a.isMalicious).length,
    blockedAttempts: SAMPLE_VALIDATION_ATTEMPTS.filter(a => a.blocked).length,
    activeRules: SAMPLE_VALIDATION_RULES.filter(r => r.isActive).length,
    attemptsToday: 45,
    attemptsThisHour: 3,
    averageValidationTime: 12,
    threatDetectionRate: 100
  });
  const [selectedRule, setSelectedRule] = useState<ValidationRule | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<ValidationAttempt | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'security' | 'format' | 'business' | 'accessibility'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState<any>(null);

  // Actualizar métricas
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      totalAttempts: attempts.length,
      successfulValidations: attempts.filter(a => !a.isMalicious && a.passedRules.length > 0).length,
      failedValidations: attempts.filter(a => a.failedRules.length > 0).length,
      maliciousAttempts: attempts.filter(a => a.isMalicious).length,
      blockedAttempts: attempts.filter(a => a.blocked).length,
      activeRules: rules.filter(r => r.isActive).length
    }));
  }, [rules, attempts]);

  // Auto-refresh de datos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simular nuevos intentos de validación
      if (Math.random() < 0.2) { // 20% de probabilidad cada 10 segundos
        const maliciousInputs = [
          "'; DROP TABLE users; --",
          '<script>alert("XSS")</script>',
          '../../../etc/passwd',
          '| cat /etc/passwd',
          'admin\' OR 1=1--'
        ];
        
        const newAttempt: ValidationAttempt = {
          id: `attempt_${Date.now()}`,
          timestamp: new Date(),
          inputType: 'test',
          inputValue: maliciousInputs[Math.floor(Math.random() * maliciousInputs.length)],
          validationRules: ['rule_1', 'rule_2'],
          passedRules: [],
          failedRules: ['rule_1'],
          isMalicious: true,
          threatType: 'sql_injection',
          severity: 'critical',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Unknown)',
          blocked: true
        };
        
        setAttempts(prev => [newAttempt, ...prev.slice(0, 49)]); // Mantener solo los últimos 50
        
        if (onValidationAttempt) {
          onValidationAttempt(newAttempt);
        }
      }
    }, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, onValidationAttempt]);

  // Validar entrada
  const validateInput = useCallback((input: string, inputType: string = 'text') => {
    const startTime = performance.now();
    const results = {
      passedRules: [] as string[],
      failedRules: [] as string[],
      isMalicious: false,
      threatType: undefined as any,
      severity: 'low' as any,
      sanitizedValue: input
    };

    // Aplicar reglas activas
    rules.filter(rule => rule.isActive).forEach(rule => {
      let passed = false;

      switch (rule.type) {
        case 'regex':
          if (rule.pattern) {
            const regex = new RegExp(rule.pattern);
            passed = !regex.test(input);
          }
          break;
        case 'length':
          if (rule.minLength && input.length < rule.minLength) passed = false;
          else if (rule.maxLength && input.length > rule.maxLength) passed = false;
          else passed = true;
          break;
        case 'format':
          if (rule.format === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            passed = emailRegex.test(input);
          }
          break;
        case 'custom':
          if (rule.customFunction === 'passwordStrength') {
            const hasUpperCase = /[A-Z]/.test(input);
            const hasLowerCase = /[a-z]/.test(input);
            const hasNumbers = /\d/.test(input);
            const hasSpecialChar = /[^A-Za-z0-9]/.test(input);
            passed = hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && input.length >= 8;
          }
          break;
      }

      if (passed) {
        results.passedRules.push(rule.id);
      } else {
        results.failedRules.push(rule.id);
        if (rule.category === 'security') {
          results.isMalicious = true;
          results.severity = rule.severity;
          results.threatType = rule.name.toLowerCase().includes('sql') ? 'sql_injection' : 
                             rule.name.toLowerCase().includes('xss') ? 'xss' : 'other';
        }
      }
    });

    const endTime = performance.now();
    const validationTime = endTime - startTime;

    // Crear intento de validación
    const attempt: ValidationAttempt = {
      id: `attempt_${Date.now()}`,
      timestamp: new Date(),
      inputType,
      inputValue: input,
      validationRules: rules.filter(r => r.isActive).map(r => r.id),
      passedRules: results.passedRules,
      failedRules: results.failedRules,
      isMalicious: results.isMalicious,
      threatType: results.threatType,
      severity: results.severity,
      ipAddress: '127.0.0.1', // En producción, obtener IP real
      userAgent: navigator.userAgent,
      blocked: results.isMalicious,
      sanitizedValue: results.sanitizedValue
    };

    setAttempts(prev => [attempt, ...prev.slice(0, 49)]);
    
    if (onValidationAttempt) {
      onValidationAttempt(attempt);
    }

    return {
      ...results,
      validationTime,
      attempt
    };
  }, [rules, onValidationAttempt]);

  // Probar validación
  const testValidation = useCallback(() => {
    if (!testInput.trim()) return;
    
    const results = validateInput(testInput, 'test');
    setTestResults(results);
  }, [testInput, validateInput]);

  // Crear nueva regla
  const createRule = useCallback((ruleData: Omit<ValidationRule, 'id'>) => {
    const newRule: ValidationRule = {
      ...ruleData,
      id: `rule_${Date.now()}`
    };

    setRules(prev => [...prev, newRule]);
    
    if (onRuleCreated) {
      onRuleCreated(newRule);
    }
  }, [onRuleCreated]);

  // Actualizar regla
  const updateRule = useCallback((ruleId: string, updates: Partial<ValidationRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
    
    if (onRuleUpdated) {
      onRuleUpdated(ruleId, updates);
    }
  }, [onRuleUpdated]);

  // Eliminar regla
  const deleteRule = useCallback((ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    
    if (onRuleDeleted) {
      onRuleDeleted(ruleId);
    }
  }, [onRuleDeleted]);

  // Exportar datos
  const exportData = useCallback(() => {
    const exportData = {
      timestamp: new Date(),
      rules: rules,
      attempts: attempts,
      metrics: metrics
    };

    if (onExportData) {
      onExportData(exportData);
    } else {
      // Descarga directa
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `input-validation-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [rules, attempts, metrics, onExportData]);

  // Obtener color por severidad
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Obtener color por categoría
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security': return 'text-red-600 bg-red-100 border-red-200';
      case 'format': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'business': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'accessibility': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Obtener icono por tipo de amenaza
  const getThreatIcon = (threatType?: string) => {
    switch (threatType) {
      case 'sql_injection': return <Database className="w-4 h-4" />;
      case 'xss': return <Code className="w-4 h-4" />;
      case 'path_traversal': return <FileText className="w-4 h-4" />;
      case 'command_injection': return <Server className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  // Filtrar reglas
  const filteredRules = rules.filter(rule => {
    if (filterSeverity !== 'all' && rule.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && rule.category !== filterCategory) return false;
    if (searchQuery && !rule.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Filtrar intentos
  const filteredAttempts = attempts.filter(attempt => {
    if (filterSeverity !== 'all' && attempt.severity !== filterSeverity) return false;
    if (searchQuery && !attempt.inputValue.includes(searchQuery)) return false;
    return true;
  });

  return (
    <Card className={cn("w-full max-w-7xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Validación de Entrada
            </CardTitle>
            <CardDescription>
              Sistema robusto de validación y sanitización de entrada con detección de amenazas
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Reanudar
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Panel de Métricas */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métricas de Validación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Intentos</span>
                    <span className="font-medium">{metrics.totalAttempts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Validaciones Exitosas</span>
                    <span className="font-medium text-green-600">{metrics.successfulValidations}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Validaciones Fallidas</span>
                    <span className="font-medium text-red-600">{metrics.failedValidations}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Intentos Maliciosos</span>
                    <span className="font-medium text-orange-600">{metrics.maliciousAttempts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Intentos Bloqueados</span>
                    <span className="font-medium text-red-600">{metrics.blockedAttempts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reglas Activas</span>
                    <span className="font-medium">{metrics.activeRules}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tiempo Promedio</span>
                    <span className="font-medium">{metrics.averageValidationTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tasa de Detección</span>
                    <span className="font-medium">{metrics.threatDetectionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Probador de Validación */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Probador de Validación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Entrada de Prueba</label>
                    <textarea
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      placeholder="Ingresa texto para probar la validación..."
                      className="w-full p-2 border rounded-md text-sm h-20 resize-none"
                      tabIndex={0}
                      aria-label="Entrada de prueba para validación"
                    />
                  </div>
                  
                  <Button 
                    onClick={testValidation}
                    className="w-full"
                    disabled={!testInput.trim()}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Probar Validación
                  </Button>

                  {testResults && (
                    <div className="mt-4 p-3 border rounded-md">
                      <h4 className="font-medium mb-2">Resultados:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Es Malicioso:</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", testResults.isMalicious ? "text-red-600" : "text-green-600")}
                          >
                            {testResults.isMalicious ? 'Sí' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Reglas Pasadas:</span>
                          <span>{testResults.passedRules.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reglas Fallidas:</span>
                          <span>{testResults.failedRules.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tiempo:</span>
                          <span>{testResults.validationTime?.toFixed(2)}ms</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Severidad:</label>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value as any)}
                  className="p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Filtrar por severidad"
                >
                  <option value="all">Todas</option>
                  <option value="critical">Crítico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Medio</option>
                  <option value="low">Bajo</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Categoría:</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Filtrar por categoría"
                >
                  <option value="all">Todas</option>
                  <option value="security">Seguridad</option>
                  <option value="format">Formato</option>
                  <option value="business">Negocio</option>
                  <option value="accessibility">Accesibilidad</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="p-2 border rounded-md text-sm"
                  tabIndex={0}
                  aria-label="Buscar reglas o intentos"
                />
              </div>

              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Aquí se abriría un modal para crear nueva regla
                    console.log('Crear nueva regla');
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Regla
                </Button>
              )}
            </div>

            {/* Lista de Reglas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reglas de Validación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredRules.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No se encontraron reglas</p>
                    </div>
                  ) : (
                    filteredRules.map((rule) => (
                      <div
                        key={rule.id}
                        className={cn(
                          "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                          selectedRule?.id === rule.id && "border-blue-500 bg-blue-50",
                          !rule.isActive && "opacity-75"
                        )}
                        onClick={() => setSelectedRule(rule)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Seleccionar regla: ${rule.name}`}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedRule(rule)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            getCategoryColor(rule.category)
                          )}>
                            <Shield className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{rule.name}</h4>
                                <p className="text-xs text-muted-foreground">{rule.description}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", getSeverityColor(rule.severity))}
                                >
                                  {rule.severity}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", getCategoryColor(rule.category))}
                                >
                                  {rule.category}
                                </Badge>
                                {!rule.isActive && (
                                  <Badge variant="outline" className="text-xs text-gray-500">
                                    Inactivo
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Tipo: {rule.type}</span>
                              {rule.pattern && <span>Patrón: {rule.pattern.substring(0, 20)}...</span>}
                              {rule.format && <span>Formato: {rule.format}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lista de Intentos Recientes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Intentos Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredAttempts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No se encontraron intentos</p>
                    </div>
                  ) : (
                    filteredAttempts.slice(0, 10).map((attempt) => (
                      <div
                        key={attempt.id}
                        className={cn(
                          "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                          selectedAttempt?.id === attempt.id && "border-blue-500 bg-blue-50",
                          attempt.isMalicious && "border-l-4 border-l-red-500"
                        )}
                        onClick={() => setSelectedAttempt(attempt)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Seleccionar intento: ${attempt.inputValue.substring(0, 20)}...`}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedAttempt(attempt)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            attempt.isMalicious ? "bg-red-100" : "bg-green-100"
                          )}>
                            {attempt.isMalicious ? getThreatIcon(attempt.threatType) : <CheckCircle className="w-4 h-4" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm font-mono">
                                  {attempt.inputValue.substring(0, 30)}...
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {attempt.timestamp.toLocaleString()} - {attempt.inputType}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", getSeverityColor(attempt.severity))}
                                >
                                  {attempt.severity}
                                </Badge>
                                {attempt.isMalicious && (
                                  <Badge variant="outline" className="text-xs text-red-600">
                                    Malicioso
                                  </Badge>
                                )}
                                {attempt.blocked && (
                                  <Badge variant="outline" className="text-xs text-green-600">
                                    Bloqueado
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Pasadas: {attempt.passedRules.length}</span>
                              <span>Fallidas: {attempt.failedRules.length}</span>
                              {attempt.ipAddress && <span>IP: {attempt.ipAddress}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
              tabIndex={0}
              aria-label="Auto-refresh"
            />
            <label htmlFor="auto-refresh" className="text-sm">
              Auto-refresh
            </label>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Monitoreo: {isMonitoring ? 'Activo' : 'Pausado'}</span>
            <span>•</span>
            <span>{filteredRules.length} reglas mostradas</span>
            <span>•</span>
            <span>{filteredAttempts.length} intentos</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Datos
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
