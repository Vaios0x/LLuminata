/**
 * Servicio de Protección CSRF para InclusiveAI Coach
 * Proporciona funcionalidades de protección contra ataques Cross-Site Request Forgery
 */

import { randomBytes, createHmac, timingSafeEqual } from 'crypto';

// Tipos para el servicio CSRF
export interface CSRFConfig {
  enabled: boolean;
  secretKey: string;
  tokenLength: number;
  tokenExpiry: number; // Duración del token en ms
  cookieName: string;
  headerName: string;
  fieldName: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
  path: string;
  enableDoubleSubmit: boolean;
  enableSynchronizerToken: boolean;
  enableCustomTokenValidation: boolean;
  maxTokensPerSession: number;
  cleanupInterval: number; // Intervalo de limpieza en ms
}

export interface CSRFToken {
  id: string;
  token: string;
  sessionId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  method: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  usedAt?: Date;
  metadata?: Record<string, any>;
}

export interface CSRFValidationResult {
  isValid: boolean;
  token?: string;
  sessionId?: string;
  userId?: string;
  error?: string;
  errorCode?: 'token_missing' | 'token_invalid' | 'token_expired' | 'token_used' | 'session_mismatch';
  metadata?: Record<string, any>;
}

export interface CSRFStats {
  totalTokensGenerated: number;
  totalTokensValidated: number;
  validTokens: number;
  invalidTokens: number;
  expiredTokens: number;
  usedTokens: number;
  activeTokens: number;
  averageTokenLifetime: number;
  topEndpoints: Array<{
    endpoint: string;
    count: number;
  }>;
  topUserAgents: Array<{
    userAgent: string;
    count: number;
  }>;
}

export interface CSRFAlert {
  id: string;
  type: 'token_missing' | 'token_invalid' | 'token_expired' | 'token_reuse' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  sessionId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  tokenId?: string;
  attempts: number;
  actions: Array<{
    type: 'block' | 'notify' | 'log' | 'escalate';
    config: Record<string, any>;
  }>;
  metadata?: Record<string, any>;
}

export interface CSRFRequest {
  sessionId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  method: string;
  token?: string;
  headers?: Record<string, string>;
  body?: any;
  metadata?: Record<string, any>;
}

/**
 * Servicio principal de Protección CSRF
 */
export class CSRFService {
  private config: CSRFConfig;
  private tokens: Map<string, CSRFToken> = new Map();
  private sessions: Map<string, Set<string>> = new Map(); // sessionId -> Set<tokenId>
  private alerts: Map<string, CSRFAlert> = new Map();
  private validationAttempts: Map<string, number> = new Map(); // sessionId -> attempts
  private isInitialized: boolean = false;
  private cleanupIntervalId: NodeJS.Timeout | null = null;
  private observers: Map<string, (data: any) => void> = new Map();

  constructor(config?: Partial<CSRFConfig>) {
    this.config = {
      enabled: true,
      secretKey: process.env.CSRF_SECRET_KEY || this.generateSecretKey(),
      tokenLength: 32,
      tokenExpiry: 30 * 60 * 1000, // 30 minutos
      cookieName: 'csrf_token',
      headerName: 'X-CSRF-Token',
      fieldName: '_csrf',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      enableDoubleSubmit: true,
      enableSynchronizerToken: true,
      enableCustomTokenValidation: true,
      maxTokensPerSession: 10,
      cleanupInterval: 5 * 60 * 1000, // 5 minutos
      ...config
    };

    this.initializeService();
  }

  /**
   * Inicializa el servicio
   */
  private initializeService(): void {
    if (!this.config.enabled) {
      console.log('⚠️ Servicio de protección CSRF deshabilitado');
      return;
    }

    console.log('🚀 Inicializando servicio de protección CSRF...');
    
    // Configurar limpieza automática
    this.startCleanupInterval();
    
    this.isInitialized = true;
    console.log('✅ Servicio de protección CSRF inicializado');
  }

  /**
   * Inicia el intervalo de limpieza
   */
  private startCleanupInterval(): void {
    this.cleanupIntervalId = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Genera una clave secreta
   */
  private generateSecretKey(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Genera un token CSRF
   */
  generateToken(requestData: {
    sessionId: string;
    userId?: string;
    ipAddress: string;
    userAgent: string;
    endpoint: string;
    method: string;
    metadata?: Record<string, any>;
  }): {
    token: string;
    tokenId: string;
    expiresAt: Date;
    cookieOptions: {
      name: string;
      value: string;
      options: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'strict' | 'lax' | 'none';
        domain?: string;
        path: string;
        maxAge: number;
      };
    };
  } {
    if (!this.isInitialized) {
      throw new Error('Servicio CSRF no inicializado');
    }

    // Verificar límite de tokens por sesión
    this.enforceSessionTokenLimit(requestData.sessionId);

    // Generar token único
    const tokenId = this.generateId();
    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + this.config.tokenExpiry);

    // Crear objeto de token
    const csrfToken: CSRFToken = {
      id: tokenId,
      token,
      sessionId: requestData.sessionId,
      userId: requestData.userId,
      ipAddress: requestData.ipAddress,
      userAgent: requestData.userAgent,
      endpoint: requestData.endpoint,
      method: requestData.method,
      createdAt: new Date(),
      expiresAt,
      isUsed: false,
      metadata: requestData.metadata
    };

    // Almacenar token
    this.tokens.set(tokenId, csrfToken);

    // Asociar token con sesión
    if (!this.sessions.has(requestData.sessionId)) {
      this.sessions.set(requestData.sessionId, new Set());
    }
    this.sessions.get(requestData.sessionId)!.add(tokenId);

    console.log(`🔐 Token CSRF generado: ${tokenId} para sesión ${requestData.sessionId}`);

    // Configuración de cookie
    const cookieOptions = {
      name: this.config.cookieName,
      value: token,
      options: {
        httpOnly: this.config.httpOnly,
        secure: this.config.secure,
        sameSite: this.config.sameSite,
        domain: this.config.domain,
        path: this.config.path,
        maxAge: Math.floor(this.config.tokenExpiry / 1000)
      }
    };

    return {
      token,
      tokenId,
      expiresAt,
      cookieOptions
    };
  }

  /**
   * Valida un token CSRF
   */
  validateToken(requestData: CSRFRequest): CSRFValidationResult {
    if (!this.isInitialized) {
      return {
        isValid: true,
        error: 'Servicio CSRF no inicializado'
      };
    }

    // Extraer token de diferentes fuentes
    const token = this.extractToken(requestData);
    
    if (!token) {
      this.createAlert(requestData, 'token_missing', 'Token CSRF faltante');
      return {
        isValid: false,
        error: 'Token CSRF faltante',
        errorCode: 'token_missing'
      };
    }

    // Buscar token en almacenamiento
    const csrfToken = this.findToken(token);
    
    if (!csrfToken) {
      this.createAlert(requestData, 'token_invalid', 'Token CSRF inválido');
      return {
        isValid: false,
        error: 'Token CSRF inválido',
        errorCode: 'token_invalid'
      };
    }

    // Verificar expiración
    if (csrfToken.expiresAt < new Date()) {
      this.createAlert(requestData, 'token_expired', 'Token CSRF expirado');
      return {
        isValid: false,
        error: 'Token CSRF expirado',
        errorCode: 'token_expired'
      };
    }

    // Verificar si ya fue usado
    if (csrfToken.isUsed) {
      this.createAlert(requestData, 'token_reuse', 'Token CSRF ya utilizado');
      return {
        isValid: false,
        error: 'Token CSRF ya utilizado',
        errorCode: 'token_used'
      };
    }

    // Verificar coincidencia de sesión
    if (csrfToken.sessionId !== requestData.sessionId) {
      this.createAlert(requestData, 'suspicious_activity', 'Token CSRF no coincide con sesión');
      return {
        isValid: false,
        error: 'Token CSRF no coincide con sesión',
        errorCode: 'session_mismatch'
      };
    }

    // Verificar IP (opcional, para mayor seguridad)
    if (csrfToken.ipAddress !== requestData.ipAddress) {
      console.log(`⚠️ IP diferente para token CSRF: ${csrfToken.ipAddress} vs ${requestData.ipAddress}`);
    }

    // Marcar token como usado
    csrfToken.isUsed = true;
    csrfToken.usedAt = new Date();

    console.log(`✅ Token CSRF validado: ${csrfToken.id}`);

    return {
      isValid: true,
      token: csrfToken.token,
      sessionId: csrfToken.sessionId,
      userId: csrfToken.userId,
      metadata: csrfToken.metadata
    };
  }

  /**
   * Extrae el token de diferentes fuentes
   */
  private extractToken(requestData: CSRFRequest): string | null {
    // 1. Header personalizado
    if (requestData.headers && requestData.headers[this.config.headerName]) {
      return requestData.headers[this.config.headerName];
    }

    // 2. Campo de formulario
    if (requestData.body && requestData.body[this.config.fieldName]) {
      return requestData.body[this.config.fieldName];
    }

    // 3. Query parameter
    if (requestData.body && requestData.body['_csrf']) {
      return requestData.body['_csrf'];
    }

    // 4. Cookie (si está disponible en headers)
    if (requestData.headers && requestData.headers.cookie) {
      const cookies = this.parseCookies(requestData.headers.cookie);
      if (cookies[this.config.cookieName]) {
        return cookies[this.config.cookieName];
      }
    }

    return null;
  }

  /**
   * Parsea cookies de string
   */
  private parseCookies(cookieString: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    cookieString.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });

    return cookies;
  }

  /**
   * Busca un token en el almacenamiento
   */
  private findToken(token: string): CSRFToken | null {
    for (const csrfToken of this.tokens.values()) {
      if (csrfToken.token === token) {
        return csrfToken;
      }
    }
    return null;
  }

  /**
   * Genera un token seguro
   */
  private generateSecureToken(): string {
    const randomToken = randomBytes(this.config.tokenLength).toString('hex');
    const timestamp = Date.now().toString();
    const data = `${randomToken}:${timestamp}`;
    
    // Crear HMAC para mayor seguridad
    const hmac = createHmac('sha256', this.config.secretKey);
    hmac.update(data);
    const signature = hmac.digest('hex');
    
    return `${randomToken}.${timestamp}.${signature}`;
  }

  /**
   * Verifica un token seguro
   */
  private verifySecureToken(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const [randomToken, timestamp, signature] = parts;
      const data = `${randomToken}:${timestamp}`;
      
      const hmac = createHmac('sha256', this.config.secretKey);
      hmac.update(data);
      const expectedSignature = hmac.digest('hex');
      
      return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    } catch {
      return false;
    }
  }

  /**
   * Aplica límite de tokens por sesión
   */
  private enforceSessionTokenLimit(sessionId: string): void {
    const sessionTokens = this.sessions.get(sessionId);
    if (sessionTokens && sessionTokens.size >= this.config.maxTokensPerSession) {
      // Eliminar tokens más antiguos
      const tokenIds = Array.from(sessionTokens);
      const oldestTokenId = tokenIds[0]; // Asumiendo orden cronológico
      
      this.sessions.get(sessionId)!.delete(oldestTokenId);
      this.tokens.delete(oldestTokenId);
      
      console.log(`🗑️ Token CSRF eliminado por límite de sesión: ${oldestTokenId}`);
    }
  }

  /**
   * Crea una alerta de seguridad
   */
  private createAlert(
    requestData: CSRFRequest, 
    type: CSRFAlert['type'], 
    description: string
  ): void {
    const sessionId = requestData.sessionId;
    const attempts = (this.validationAttempts.get(sessionId) || 0) + 1;
    this.validationAttempts.set(sessionId, attempts);

    const alert: CSRFAlert = {
      id: this.generateId(),
      type,
      severity: this.determineSeverity(type, attempts),
      title: `Alerta CSRF: ${type}`,
      description,
      sessionId,
      userId: requestData.userId,
      ipAddress: requestData.ipAddress,
      userAgent: requestData.userAgent,
      endpoint: requestData.endpoint,
      method: requestData.method,
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
        requestMetadata: requestData.metadata
      }
    };

    this.alerts.set(alert.id, alert);
    console.log(`🚨 Alerta CSRF: ${alert.title} - ${description}`);
    this.notifyObservers('alertCreated', alert);
  }

  /**
   * Determina la severidad de una alerta
   */
  private determineSeverity(type: CSRFAlert['type'], attempts: number): CSRFAlert['severity'] {
    if (attempts > 10) return 'critical';
    if (attempts > 5) return 'high';
    if (attempts > 2) return 'medium';
    return 'low';
  }

  /**
   * Revoca todos los tokens de una sesión
   */
  revokeSessionTokens(sessionId: string): void {
    const sessionTokens = this.sessions.get(sessionId);
    if (sessionTokens) {
      sessionTokens.forEach(tokenId => {
        this.tokens.delete(tokenId);
      });
      this.sessions.delete(sessionId);
      console.log(`🗑️ Tokens CSRF revocados para sesión: ${sessionId}`);
    }
  }

  /**
   * Revoca un token específico
   */
  revokeToken(tokenId: string): void {
    const token = this.tokens.get(tokenId);
    if (token) {
      this.tokens.delete(tokenId);
      const sessionTokens = this.sessions.get(token.sessionId);
      if (sessionTokens) {
        sessionTokens.delete(tokenId);
      }
      console.log(`🗑️ Token CSRF revocado: ${tokenId}`);
    }
  }

  /**
   * Obtiene estadísticas del servicio
   */
  getStats(): CSRFStats {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const recentTokens = Array.from(this.tokens.values())
      .filter(t => t.createdAt.getTime() > oneHourAgo);

    const totalTokensGenerated = this.tokens.size;
    const totalTokensValidated = Array.from(this.tokens.values())
      .filter(t => t.isUsed).length;
    const validTokens = recentTokens.filter(t => !t.isUsed && t.expiresAt > new Date()).length;
    const invalidTokens = 0; // Se calcularía con métricas reales
    const expiredTokens = Array.from(this.tokens.values())
      .filter(t => t.expiresAt < new Date() && !t.isUsed).length;
    const usedTokens = Array.from(this.tokens.values())
      .filter(t => t.isUsed).length;
    const activeTokens = Array.from(this.tokens.values())
      .filter(t => !t.isUsed && t.expiresAt > new Date()).length;

    // Calcular tiempo promedio de vida del token
    const tokenLifetimes = Array.from(this.tokens.values())
      .filter(t => t.isUsed && t.usedAt)
      .map(t => t.usedAt!.getTime() - t.createdAt.getTime());
    
    const averageTokenLifetime = tokenLifetimes.length > 0 
      ? tokenLifetimes.reduce((sum, time) => sum + time, 0) / tokenLifetimes.length 
      : 0;

    // Top endpoints
    const endpointCounts: Record<string, number> = {};
    Array.from(this.tokens.values()).forEach(token => {
      endpointCounts[token.endpoint] = (endpointCounts[token.endpoint] || 0) + 1;
    });

    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top user agents
    const userAgentCounts: Record<string, number> = {};
    Array.from(this.tokens.values()).forEach(token => {
      userAgentCounts[token.userAgent] = (userAgentCounts[token.userAgent] || 0) + 1;
    });

    const topUserAgents = Object.entries(userAgentCounts)
      .map(([userAgent, count]) => ({ userAgent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalTokensGenerated,
      totalTokensValidated,
      validTokens,
      invalidTokens,
      expiredTokens,
      usedTokens,
      activeTokens,
      averageTokenLifetime,
      topEndpoints,
      topUserAgents
    };
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): {
    isInitialized: boolean;
    isEnabled: boolean;
    totalTokens: number;
    activeTokens: number;
    totalSessions: number;
    totalAlerts: number;
    validationAttempts: number;
  } {
    const activeTokens = Array.from(this.tokens.values())
      .filter(t => !t.isUsed && t.expiresAt > new Date()).length;
    
    const totalValidationAttempts = Array.from(this.validationAttempts.values())
      .reduce((sum, attempts) => sum + attempts, 0);

    return {
      isInitialized: this.isInitialized,
      isEnabled: this.config.enabled,
      totalTokens: this.tokens.size,
      activeTokens,
      totalSessions: this.sessions.size,
      totalAlerts: this.alerts.size,
      validationAttempts: totalValidationAttempts
    };
  }

  /**
   * Obtiene todas las alertas
   */
  getAlerts(): CSRFAlert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Obtiene tokens de una sesión
   */
  getSessionTokens(sessionId: string): CSRFToken[] {
    const sessionTokens = this.sessions.get(sessionId);
    if (!sessionTokens) return [];

    return Array.from(sessionTokens)
      .map(tokenId => this.tokens.get(tokenId))
      .filter((token): token is CSRFToken => token !== undefined);
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<CSRFConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de protección CSRF actualizada');
  }

  /**
   * Limpia datos antiguos
   */
  cleanup(): void {
    const now = new Date();
    const cutoff = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 horas

    // Limpiar tokens expirados
    for (const [tokenId, token] of this.tokens) {
      if (token.expiresAt < now) {
        this.tokens.delete(tokenId);
        
        // Limpiar de sesiones
        const sessionTokens = this.sessions.get(token.sessionId);
        if (sessionTokens) {
          sessionTokens.delete(tokenId);
          if (sessionTokens.size === 0) {
            this.sessions.delete(token.sessionId);
          }
        }
      }
    }

    // Limpiar alertas antiguas
    for (const [alertId, alert] of this.alerts) {
      if (alert.timestamp < cutoff) {
        this.alerts.delete(alertId);
      }
    }

    // Limpiar intentos de validación antiguos
    for (const [sessionId, attempts] of this.validationAttempts) {
      if (attempts === 0) {
        this.validationAttempts.delete(sessionId);
      }
    }

    console.log(`🧹 Limpieza de protección CSRF completada`);
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
    this.tokens.clear();
    this.sessions.clear();
    this.alerts.clear();
    this.validationAttempts.clear();
    this.observers.clear();

    console.log('🧹 Servicio de protección CSRF limpiado');
  }

  // Métodos auxiliares
  private generateId(): string {
    return `csrf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyObservers(event: string, data: any): void {
    console.log(`🔐 Evento de protección CSRF: ${event}`, data);
  }
}

// Instancia singleton del servicio
export const csrfService = new CSRFService();

// Exportar el servicio como default
export default csrfService;
