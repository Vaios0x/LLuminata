/**
 * Servicio de Rate Limiting para InclusiveAI Coach
 * Proporciona funcionalidades de limitación de velocidad y protección contra ataques
 */

// Tipos para el servicio de rate limiting
export interface RateLimitConfig {
  enabled: boolean;
  defaultLimit: number; // Número de solicitudes por ventana
  defaultWindow: number; // Ventana de tiempo en ms
  maxBurst: number; // Máximo burst permitido
  enableSlidingWindow: boolean;
  enableTokenBucket: boolean;
  enableLeakyBucket: boolean;
  enableIPBasedLimiting: boolean;
  enableUserBasedLimiting: boolean;
  enableEndpointBasedLimiting: boolean;
  blockDuration: number; // Duración del bloqueo en ms
  enableWhitelist: boolean;
  enableBlacklist: boolean;
  enableRetryAfter: boolean;
  storageType: 'memory' | 'redis' | 'database';
}

export interface RateLimitRule {
  id: string;
  name: string;
  description: string;
  type: 'ip' | 'user' | 'endpoint' | 'global';
  pattern: string; // Patrón para coincidencia (IP, userId, endpoint, etc.)
  limit: number;
  window: number;
  burst: number;
  blockDuration: number;
  isActive: boolean;
  priority: number; // Prioridad para resolución de conflictos
  createdAt: Date;
  updatedAt: Date;
}

export interface RateLimitRequest {
  id: string;
  identifier: string; // IP, userId, endpoint, etc.
  timestamp: number;
  ruleId: string;
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  blocked: boolean;
  blockExpiry?: number;
  metadata?: Record<string, any>;
}

export interface RateLimitBucket {
  identifier: string;
  ruleId: string;
  tokens: number;
  lastRefill: number;
  windowStart: number;
  requestCount: number;
  blocked: boolean;
  blockExpiry?: number;
}

export interface RateLimitStats {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  activeBuckets: number;
  blockedIdentifiers: number;
  averageResponseTime: number;
  peakRequestsPerSecond: number;
  topBlockedIdentifiers: Array<{
    identifier: string;
    count: number;
  }>;
  topBlockedRules: Array<{
    ruleId: string;
    count: number;
  }>;
}

export interface RateLimitAlert {
  id: string;
  type: 'threshold_exceeded' | 'attack_detected' | 'rule_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  identifier: string;
  ruleId: string;
  timestamp: Date;
  requestCount: number;
  threshold: number;
  actions: Array<{
    type: 'block' | 'notify' | 'log' | 'escalate';
    config: Record<string, any>;
  }>;
  metadata?: Record<string, any>;
}

/**
 * Servicio principal de Rate Limiting
 */
export class RateLimitService {
  private config: RateLimitConfig;
  private rules: Map<string, RateLimitRule> = new Map();
  private buckets: Map<string, RateLimitBucket> = new Map();
  private requests: RateLimitRequest[] = [];
  private alerts: Map<string, RateLimitAlert> = new Map();
  private whitelist: Set<string> = new Set();
  private blacklist: Set<string> = new Set();
  private isInitialized: boolean = false;
  private cleanupIntervalId: NodeJS.Timeout | null = null;
  private observers: Map<string, (data: any) => void> = new Map();

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      enabled: true,
      defaultLimit: 100,
      defaultWindow: 60 * 1000, // 1 minuto
      maxBurst: 10,
      enableSlidingWindow: true,
      enableTokenBucket: true,
      enableLeakyBucket: false,
      enableIPBasedLimiting: true,
      enableUserBasedLimiting: true,
      enableEndpointBasedLimiting: true,
      blockDuration: 15 * 60 * 1000, // 15 minutos
      enableWhitelist: true,
      enableBlacklist: true,
      enableRetryAfter: true,
      storageType: 'memory',
      ...config
    };

    this.initializeService();
  }

  /**
   * Inicializa el servicio
   */
  private initializeService(): void {
    if (!this.config.enabled) {
      console.log('⚠️ Servicio de rate limiting deshabilitado');
      return;
    }

    console.log('🚀 Inicializando servicio de rate limiting...');
    
    // Cargar reglas por defecto
    this.loadDefaultRules();
    
    // Configurar limpieza automática
    this.startCleanupInterval();
    
    this.isInitialized = true;
    console.log('✅ Servicio de rate limiting inicializado');
  }

  /**
   * Carga reglas por defecto
   */
  private loadDefaultRules(): void {
    const defaultRules: Omit<RateLimitRule, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'API Global',
        description: 'Límite global para todas las APIs',
        type: 'global',
        pattern: '*',
        limit: this.config.defaultLimit,
        window: this.config.defaultWindow,
        burst: this.config.maxBurst,
        blockDuration: this.config.blockDuration,
        isActive: true,
        priority: 1
      },
      {
        name: 'Autenticación',
        description: 'Límite para endpoints de autenticación',
        type: 'endpoint',
        pattern: '/api/auth/*',
        limit: 5,
        window: 15 * 60 * 1000, // 15 minutos
        burst: 2,
        blockDuration: 30 * 60 * 1000, // 30 minutos
        isActive: true,
        priority: 10
      },
      {
        name: 'Registro',
        description: 'Límite para endpoints de registro',
        type: 'endpoint',
        pattern: '/api/register',
        limit: 3,
        window: 60 * 60 * 1000, // 1 hora
        burst: 1,
        blockDuration: 60 * 60 * 1000, // 1 hora
        isActive: true,
        priority: 10
      },
      {
        name: 'IP Suspicious',
        description: 'Límite más estricto para IPs sospechosas',
        type: 'ip',
        pattern: 'suspicious',
        limit: 10,
        window: 60 * 1000, // 1 minuto
        burst: 2,
        blockDuration: 60 * 60 * 1000, // 1 hora
        isActive: true,
        priority: 20
      }
    ];

    defaultRules.forEach(ruleData => {
      this.createRule(ruleData);
    });
  }

  /**
   * Inicia el intervalo de limpieza
   */
  private startCleanupInterval(): void {
    this.cleanupIntervalId = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Cada 5 minutos
  }

  /**
   * Crea una nueva regla de rate limiting
   */
  createRule(ruleData: {
    name: string;
    description: string;
    type: RateLimitRule['type'];
    pattern: string;
    limit: number;
    window: number;
    burst?: number;
    blockDuration?: number;
    priority?: number;
  }): RateLimitRule {
    const rule: RateLimitRule = {
      id: this.generateId(),
      name: ruleData.name,
      description: ruleData.description,
      type: ruleData.type,
      pattern: ruleData.pattern,
      limit: ruleData.limit,
      window: ruleData.window,
      burst: ruleData.burst || this.config.maxBurst,
      blockDuration: ruleData.blockDuration || this.config.blockDuration,
      isActive: true,
      priority: ruleData.priority || 5,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.rules.set(rule.id, rule);
    console.log(`📋 Regla de rate limiting creada: ${rule.name} (${rule.id})`);
    return rule;
  }

  /**
   * Verifica si una solicitud está permitida
   */
  checkRequest(requestData: {
    identifier: string; // IP, userId, endpoint, etc.
    type: RateLimitRule['type'];
    endpoint?: string;
    userId?: string;
    ipAddress?: string;
    metadata?: Record<string, any>;
  }): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
    blocked: boolean;
    blockExpiry?: number;
    ruleId: string;
  } {
    if (!this.isInitialized) {
      return {
        allowed: true,
        remaining: 999,
        resetTime: Date.now() + this.config.defaultWindow,
        blocked: false,
        ruleId: 'default'
      };
    }

    // Verificar whitelist
    if (this.config.enableWhitelist && this.whitelist.has(requestData.identifier)) {
      return {
        allowed: true,
        remaining: 999,
        resetTime: Date.now() + this.config.defaultWindow,
        blocked: false,
        ruleId: 'whitelist'
      };
    }

    // Verificar blacklist
    if (this.config.enableBlacklist && this.blacklist.has(requestData.identifier)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + this.config.blockDuration,
        blocked: true,
        blockExpiry: Date.now() + this.config.blockDuration,
        ruleId: 'blacklist'
      };
    }

    // Encontrar regla aplicable
    const applicableRule = this.findApplicableRule(requestData);
    if (!applicableRule) {
      return {
        allowed: true,
        remaining: 999,
        resetTime: Date.now() + this.config.defaultWindow,
        blocked: false,
        ruleId: 'default'
      };
    }

    // Obtener o crear bucket
    const bucketKey = `${applicableRule.id}:${requestData.identifier}`;
    let bucket = this.buckets.get(bucketKey);

    if (!bucket) {
      bucket = this.createBucket(requestData.identifier, applicableRule);
      this.buckets.set(bucketKey, bucket);
    }

    // Verificar si está bloqueado
    if (bucket.blocked && bucket.blockExpiry && bucket.blockExpiry > Date.now()) {
      const request: RateLimitRequest = {
        id: this.generateId(),
        identifier: requestData.identifier,
        timestamp: Date.now(),
        ruleId: applicableRule.id,
        allowed: false,
        remaining: 0,
        resetTime: bucket.blockExpiry,
        blocked: true,
        blockExpiry: bucket.blockExpiry,
        metadata: requestData.metadata
      };

      this.requests.push(request);
      this.notifyObservers('requestBlocked', request);

      return {
        allowed: false,
        remaining: 0,
        resetTime: bucket.blockExpiry,
        retryAfter: Math.ceil((bucket.blockExpiry - Date.now()) / 1000),
        blocked: true,
        blockExpiry: bucket.blockExpiry,
        ruleId: applicableRule.id
      };
    }

    // Verificar límite
    const now = Date.now();
    const windowStart = now - applicableRule.window;
    
    // Limpiar solicitudes antiguas
    bucket.requestCount = this.requests
      .filter(r => r.identifier === requestData.identifier && 
                   r.ruleId === applicableRule.id && 
                   r.timestamp > windowStart)
      .length;

    const allowed = bucket.requestCount < applicableRule.limit;
    const remaining = Math.max(0, applicableRule.limit - bucket.requestCount - 1);
    const resetTime = now + applicableRule.window;

    // Registrar solicitud
    const request: RateLimitRequest = {
      id: this.generateId(),
      identifier: requestData.identifier,
      timestamp: now,
      ruleId: applicableRule.id,
      allowed,
      remaining,
      resetTime,
      blocked: false,
      metadata: requestData.metadata
    };

    this.requests.push(request);

    // Actualizar bucket
    bucket.requestCount++;
    bucket.windowStart = windowStart;

    // Verificar si debe bloquear
    if (!allowed) {
      bucket.blocked = true;
      bucket.blockExpiry = now + applicableRule.blockDuration;
      request.blocked = true;
      request.blockExpiry = bucket.blockExpiry;

      // Crear alerta si es necesario
      this.createAlert(requestData.identifier, applicableRule, bucket.requestCount);

      this.notifyObservers('requestBlocked', request);
    } else {
      this.notifyObservers('requestAllowed', request);
    }

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil((bucket.blockExpiry! - now) / 1000),
      blocked: request.blocked,
      blockExpiry: request.blockExpiry,
      ruleId: applicableRule.id
    };
  }

  /**
   * Encuentra la regla aplicable para una solicitud
   */
  private findApplicableRule(requestData: {
    identifier: string;
    type: RateLimitRule['type'];
    endpoint?: string;
    userId?: string;
    ipAddress?: string;
  }): RateLimitRule | null {
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => rule.isActive && rule.type === requestData.type)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of applicableRules) {
      if (this.matchesPattern(rule.pattern, requestData)) {
        return rule;
      }
    }

    return null;
  }

  /**
   * Verifica si una solicitud coincide con un patrón
   */
  private matchesPattern(pattern: string, requestData: {
    identifier: string;
    type: RateLimitRule['type'];
    endpoint?: string;
    userId?: string;
    ipAddress?: string;
  }): boolean {
    if (pattern === '*') return true;

    switch (requestData.type) {
      case 'ip':
        return this.matchesIPPattern(pattern, requestData.ipAddress || requestData.identifier);
      case 'user':
        return this.matchesUserPattern(pattern, requestData.userId || requestData.identifier);
      case 'endpoint':
        return this.matchesEndpointPattern(pattern, requestData.endpoint || requestData.identifier);
      case 'global':
        return true;
      default:
        return false;
    }
  }

  /**
   * Verifica coincidencia de patrón IP
   */
  private matchesIPPattern(pattern: string, ip: string): boolean {
    if (pattern === 'suspicious') {
      // Lógica para detectar IPs sospechosas
      return this.isSuspiciousIP(ip);
    }
    
    // Patrón de subred (ej: 192.168.1.*)
    if (pattern.includes('*')) {
      const patternParts = pattern.split('.');
      const ipParts = ip.split('.');
      
      if (patternParts.length !== 4 || ipParts.length !== 4) return false;
      
      for (let i = 0; i < 4; i++) {
        if (patternParts[i] !== '*' && patternParts[i] !== ipParts[i]) {
          return false;
        }
      }
      return true;
    }
    
    return pattern === ip;
  }

  /**
   * Verifica si una IP es sospechosa
   */
  private isSuspiciousIP(ip: string): boolean {
    // Lógica simplificada para detectar IPs sospechosas
    const suspiciousPatterns = [
      /^10\./, // Red privada
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Red privada
      /^192\.168\./, // Red privada
      /^127\./, // Loopback
      /^0\./, // Red reservada
    ];

    return suspiciousPatterns.some(pattern => pattern.test(ip));
  }

  /**
   * Verifica coincidencia de patrón de usuario
   */
  private matchesUserPattern(pattern: string, userId: string): boolean {
    if (pattern === '*') return true;
    
    // Patrón de comodín (ej: user_*)
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(userId);
    }
    
    return pattern === userId;
  }

  /**
   * Verifica coincidencia de patrón de endpoint
   */
  private matchesEndpointPattern(pattern: string, endpoint: string): boolean {
    if (pattern === '*') return true;
    
    // Patrón de comodín (ej: /api/auth/*)
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(endpoint);
    }
    
    return pattern === endpoint;
  }

  /**
   * Crea un nuevo bucket
   */
  private createBucket(identifier: string, rule: RateLimitRule): RateLimitBucket {
    return {
      identifier,
      ruleId: rule.id,
      tokens: rule.limit,
      lastRefill: Date.now(),
      windowStart: Date.now() - rule.window,
      requestCount: 0,
      blocked: false
    };
  }

  /**
   * Crea una alerta de rate limiting
   */
  private createAlert(identifier: string, rule: RateLimitRule, requestCount: number): void {
    const alert: RateLimitAlert = {
      id: this.generateId(),
      type: 'threshold_exceeded',
      severity: requestCount > rule.limit * 2 ? 'high' : 'medium',
      title: `Rate limit excedido: ${rule.name}`,
      description: `El identificador ${identifier} excedió el límite de ${rule.limit} solicitudes en ${rule.window / 1000} segundos`,
      identifier,
      ruleId: rule.id,
      timestamp: new Date(),
      requestCount,
      threshold: rule.limit,
      actions: [
        {
          type: 'block',
          config: { duration: rule.blockDuration }
        },
        {
          type: 'notify',
          config: { channel: 'security' }
        }
      ],
      metadata: {
        ruleName: rule.name,
        ruleType: rule.type,
        rulePattern: rule.pattern
      }
    };

    this.alerts.set(alert.id, alert);
    console.log(`🚨 Alerta de rate limiting: ${alert.title}`);
    this.notifyObservers('alertCreated', alert);
  }

  /**
   * Agrega un identificador a la whitelist
   */
  addToWhitelist(identifier: string): void {
    if (this.config.enableWhitelist) {
      this.whitelist.add(identifier);
      console.log(`✅ Agregado a whitelist: ${identifier}`);
    }
  }

  /**
   * Remueve un identificador de la whitelist
   */
  removeFromWhitelist(identifier: string): void {
    this.whitelist.delete(identifier);
    console.log(`❌ Removido de whitelist: ${identifier}`);
  }

  /**
   * Agrega un identificador a la blacklist
   */
  addToBlacklist(identifier: string, duration?: number): void {
    if (this.config.enableBlacklist) {
      this.blacklist.add(identifier);
      
      if (duration) {
        setTimeout(() => {
          this.removeFromBlacklist(identifier);
        }, duration);
      }
      
      console.log(`🚫 Agregado a blacklist: ${identifier}`);
    }
  }

  /**
   * Remueve un identificador de la blacklist
   */
  removeFromBlacklist(identifier: string): void {
    this.blacklist.delete(identifier);
    console.log(`✅ Removido de blacklist: ${identifier}`);
  }

  /**
   * Obtiene estadísticas de rate limiting
   */
  getStats(): RateLimitStats {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const recentRequests = this.requests.filter(r => r.timestamp > oneHourAgo);
    const totalRequests = recentRequests.length;
    const allowedRequests = recentRequests.filter(r => r.allowed).length;
    const blockedRequests = recentRequests.filter(r => !r.allowed).length;

    // Calcular pico de solicitudes por segundo
    const requestsBySecond: Record<number, number> = {};
    recentRequests.forEach(r => {
      const second = Math.floor(r.timestamp / 1000);
      requestsBySecond[second] = (requestsBySecond[second] || 0) + 1;
    });

    const peakRequestsPerSecond = Math.max(...Object.values(requestsBySecond), 0);

    // Top identificadores bloqueados
    const blockedByIdentifier: Record<string, number> = {};
    recentRequests.filter(r => !r.allowed).forEach(r => {
      blockedByIdentifier[r.identifier] = (blockedByIdentifier[r.identifier] || 0) + 1;
    });

    const topBlockedIdentifiers = Object.entries(blockedByIdentifier)
      .map(([identifier, count]) => ({ identifier, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top reglas bloqueadas
    const blockedByRule: Record<string, number> = {};
    recentRequests.filter(r => !r.allowed).forEach(r => {
      blockedByRule[r.ruleId] = (blockedByRule[r.ruleId] || 0) + 1;
    });

    const topBlockedRules = Object.entries(blockedByRule)
      .map(([ruleId, count]) => ({ ruleId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests,
      allowedRequests,
      blockedRequests,
      activeBuckets: this.buckets.size,
      blockedIdentifiers: Array.from(this.buckets.values()).filter(b => b.blocked).length,
      averageResponseTime: 0, // Se calcularía con métricas reales
      peakRequestsPerSecond,
      topBlockedIdentifiers,
      topBlockedRules
    };
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): {
    isInitialized: boolean;
    isEnabled: boolean;
    totalRules: number;
    activeRules: number;
    totalBuckets: number;
    blockedBuckets: number;
    whitelistSize: number;
    blacklistSize: number;
    totalRequests: number;
    blockedRequests: number;
  } {
    const activeRules = Array.from(this.rules.values()).filter(r => r.isActive);
    const blockedBuckets = Array.from(this.buckets.values()).filter(b => b.blocked);
    const blockedRequests = this.requests.filter(r => !r.allowed);

    return {
      isInitialized: this.isInitialized,
      isEnabled: this.config.enabled,
      totalRules: this.rules.size,
      activeRules: activeRules.length,
      totalBuckets: this.buckets.size,
      blockedBuckets: blockedBuckets.length,
      whitelistSize: this.whitelist.size,
      blacklistSize: this.blacklist.size,
      totalRequests: this.requests.length,
      blockedRequests: blockedRequests.length
    };
  }

  /**
   * Obtiene todas las reglas
   */
  getRules(): RateLimitRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Obtiene todas las alertas
   */
  getAlerts(): RateLimitAlert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Actualiza una regla
   */
  updateRule(ruleId: string, updates: Partial<RateLimitRule>): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
      rule.updatedAt = new Date();
      console.log(`✅ Regla actualizada: ${rule.name}`);
    }
  }

  /**
   * Desactiva una regla
   */
  deactivateRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.isActive = false;
      rule.updatedAt = new Date();
      console.log(`⏸️ Regla desactivada: ${rule.name}`);
    }
  }

  /**
   * Activa una regla
   */
  activateRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.isActive = true;
      rule.updatedAt = new Date();
      console.log(`▶️ Regla activada: ${rule.name}`);
    }
  }

  /**
   * Elimina una regla
   */
  deleteRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.delete(ruleId);
      
      // Limpiar buckets asociados
      for (const [key, bucket] of this.buckets) {
        if (bucket.ruleId === ruleId) {
          this.buckets.delete(key);
        }
      }
      
      console.log(`🗑️ Regla eliminada: ${rule.name}`);
    }
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de rate limiting actualizada');
  }

  /**
   * Limpia datos antiguos
   */
  cleanup(): void {
    const now = Date.now();
    const cutoff = now - (24 * 60 * 60 * 1000); // 24 horas

    // Limpiar solicitudes antiguas
    this.requests = this.requests.filter(r => r.timestamp > cutoff);

    // Limpiar buckets vacíos
    for (const [key, bucket] of this.buckets) {
      if (bucket.requestCount === 0 && !bucket.blocked) {
        this.buckets.delete(key);
      }
    }

    // Limpiar alertas antiguas
    for (const [alertId, alert] of this.alerts) {
      if (alert.timestamp.getTime() < cutoff) {
        this.alerts.delete(alertId);
      }
    }

    console.log(`🧹 Limpieza de rate limiting completada`);
  }

  /**
   * Limpia todos los recursos
   */
  async cleanup(): Promise<void> {
    // Detener intervalo de limpieza
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }

    // Limpiar datos
    this.rules.clear();
    this.buckets.clear();
    this.requests = [];
    this.alerts.clear();
    this.whitelist.clear();
    this.blacklist.clear();
    this.observers.clear();

    console.log('🧹 Servicio de rate limiting limpiado');
  }

  // Métodos auxiliares
  private generateId(): string {
    return `ratelimit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyObservers(event: string, data: any): void {
    console.log(`🚦 Evento de rate limiting: ${event}`, data);
  }
}

// Instancia singleton del servicio
export const rateLimitService = new RateLimitService();

// Exportar el servicio como default
export default rateLimitService;
