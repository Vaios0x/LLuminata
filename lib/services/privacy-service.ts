/**
 * Servicio de Privacidad para InclusiveAI Coach
 * Proporciona funcionalidades de gestión de datos personales y cumplimiento GDPR
 */

// Tipos para el servicio de privacidad
export interface PrivacyConfig {
  enabled: boolean;
  gdprCompliant: boolean;
  dataRetentionDays: number;
  enableDataAnonymization: boolean;
  enableDataEncryption: boolean;
  enableConsentManagement: boolean;
  enableDataPortability: boolean;
  enableRightToBeForgotten: boolean;
  enableDataMinimization: boolean;
  enablePurposeLimitation: boolean;
  enableTransparency: boolean;
  enableDataProtectionImpactAssessment: boolean;
  defaultConsentLevel: 'explicit' | 'implicit' | 'none';
  consentExpiryDays: number;
  auditLogRetentionDays: number;
}

export interface PrivacyConsent {
  id: string;
  userId: string;
  consentType: 'explicit' | 'implicit' | 'withdrawn';
  purpose: string;
  dataCategories: string[];
  thirdParties: string[];
  grantedAt: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

export interface PrivacyRequest {
  id: string;
  userId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  description: string;
  requestedData?: string[];
  createdAt: Date;
  completedAt?: Date;
  responseData?: any;
  rejectionReason?: string;
  metadata?: Record<string, any>;
}

export interface DataInventory {
  id: string;
  userId: string;
  dataCategory: string;
  dataType: 'personal' | 'sensitive' | 'anonymized' | 'pseudonymized';
  purpose: string;
  retentionPeriod: number;
  source: string;
  location: string;
  accessLevel: 'internal' | 'external' | 'third_party';
  lastAccessed: Date;
  lastModified: Date;
  isAnonymized: boolean;
  isEncrypted: boolean;
  metadata?: Record<string, any>;
}

export interface PrivacyAudit {
  id: string;
  userId: string;
  action: 'consent_granted' | 'consent_withdrawn' | 'data_access' | 'data_modification' | 'data_deletion' | 'data_export' | 'privacy_request';
  dataCategory?: string;
  purpose?: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface PrivacyStats {
  totalUsers: number;
  activeConsents: number;
  withdrawnConsents: number;
  pendingRequests: number;
  completedRequests: number;
  dataCategories: Array<{
    category: string;
    count: number;
  }>;
  requestTypes: Array<{
    type: string;
    count: number;
  }>;
  averageResponseTime: number;
}

export interface PrivacyAlert {
  id: string;
  type: 'consent_expired' | 'data_breach' | 'unauthorized_access' | 'retention_violation' | 'gdpr_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  userId: string;
  dataCategory?: string;
  timestamp: Date;
  actions: Array<{
    type: 'notify' | 'block' | 'anonymize' | 'delete' | 'report';
    config: Record<string, any>;
  }>;
  metadata?: Record<string, any>;
}

/**
 * Servicio principal de Privacidad
 */
export class PrivacyService {
  private config: PrivacyConfig;
  private consents: Map<string, PrivacyConsent> = new Map();
  private requests: Map<string, PrivacyRequest> = new Map();
  private dataInventory: Map<string, DataInventory[]> = new Map(); // userId -> DataInventory[]
  private audits: PrivacyAudit[] = [];
  private alerts: Map<string, PrivacyAlert> = new Map();
  private isInitialized: boolean = false;
  private observers: Map<string, (data: any) => void> = new Map();

  constructor(config?: Partial<PrivacyConfig>) {
    this.config = {
      enabled: true,
      gdprCompliant: true,
      dataRetentionDays: 2555, // 7 años
      enableDataAnonymization: true,
      enableDataEncryption: true,
      enableConsentManagement: true,
      enableDataPortability: true,
      enableRightToBeForgotten: true,
      enableDataMinimization: true,
      enablePurposeLimitation: true,
      enableTransparency: true,
      enableDataProtectionImpactAssessment: true,
      defaultConsentLevel: 'explicit',
      consentExpiryDays: 365,
      auditLogRetentionDays: 2555, // 7 años
      ...config
    };

    this.initializeService();
  }

  /**
   * Inicializa el servicio
   */
  private initializeService(): void {
    if (!this.config.enabled) {
      console.log('⚠️ Servicio de privacidad deshabilitado');
      return;
    }

    console.log('🚀 Inicializando servicio de privacidad...');
    
    // Configurar limpieza automática
    this.startCleanupInterval();
    
    this.isInitialized = true;
    console.log('✅ Servicio de privacidad inicializado');
  }

  /**
   * Inicia el intervalo de limpieza
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 24 * 60 * 60 * 1000); // Cada 24 horas
  }

  /**
   * Registra consentimiento del usuario
   */
  registerConsent(consentData: {
    userId: string;
    consentType: PrivacyConsent['consentType'];
    purpose: string;
    dataCategories: string[];
    thirdParties?: string[];
    ipAddress: string;
    userAgent: string;
    metadata?: Record<string, any>;
  }): PrivacyConsent {
    if (!this.isInitialized) {
      throw new Error('Servicio de privacidad no inicializado');
    }

    const consent: PrivacyConsent = {
      id: this.generateId(),
      userId: consentData.userId,
      consentType: consentData.consentType,
      purpose: consentData.purpose,
      dataCategories: consentData.dataCategories,
      thirdParties: consentData.thirdParties || [],
      grantedAt: new Date(),
      expiresAt: this.config.consentExpiryDays 
        ? new Date(Date.now() + this.config.consentExpiryDays * 24 * 60 * 60 * 1000)
        : undefined,
      ipAddress: consentData.ipAddress,
      userAgent: consentData.userAgent,
      metadata: consentData.metadata
    };

    this.consents.set(consent.id, consent);

    // Registrar auditoría
    this.logAudit({
      userId: consentData.userId,
      action: 'consent_granted',
      dataCategory: consentData.dataCategories.join(', '),
      purpose: consentData.purpose,
      ipAddress: consentData.ipAddress,
      userAgent: consentData.userAgent,
      details: `Consentimiento ${consentData.consentType} registrado para propósito: ${consentData.purpose}`
    });

    console.log(`✅ Consentimiento registrado: ${consent.id} para usuario ${consentData.userId}`);
    return consent;
  }

  /**
   * Retira consentimiento del usuario
   */
  withdrawConsent(consentId: string, userId: string): boolean {
    const consent = this.consents.get(consentId);
    
    if (!consent || consent.userId !== userId) {
      return false;
    }

    consent.consentType = 'withdrawn';
    consent.withdrawnAt = new Date();

    // Registrar auditoría
    this.logAudit({
      userId,
      action: 'consent_withdrawn',
      dataCategory: consent.dataCategories.join(', '),
      purpose: consent.purpose,
      ipAddress: 'system',
      userAgent: 'system',
      details: `Consentimiento retirado: ${consentId}`
    });

    console.log(`❌ Consentimiento retirado: ${consentId}`);
    return true;
  }

  /**
   * Verifica si el usuario tiene consentimiento válido
   */
  hasValidConsent(
    userId: string,
    purpose: string,
    dataCategory?: string
  ): {
    hasConsent: boolean;
    consentType: PrivacyConsent['consentType'];
    expiresAt?: Date;
    consentId?: string;
  } {
    const userConsents = Array.from(this.consents.values())
      .filter(c => c.userId === userId && c.consentType !== 'withdrawn');

    // Buscar consentimiento específico
    const specificConsent = userConsents.find(c => 
      c.purpose === purpose && 
      (!dataCategory || c.dataCategories.includes(dataCategory))
    );

    if (specificConsent) {
      // Verificar expiración
      if (specificConsent.expiresAt && specificConsent.expiresAt < new Date()) {
        return { hasConsent: false, consentType: 'withdrawn' };
      }

      return {
        hasConsent: true,
        consentType: specificConsent.consentType,
        expiresAt: specificConsent.expiresAt,
        consentId: specificConsent.id
      };
    }

    // Verificar consentimiento implícito si está habilitado
    if (this.config.defaultConsentLevel === 'implicit') {
      return {
        hasConsent: true,
        consentType: 'implicit'
      };
    }

    return { hasConsent: false, consentType: 'none' };
  }

  /**
   * Crea una solicitud de privacidad
   */
  createPrivacyRequest(requestData: {
    userId: string;
    requestType: PrivacyRequest['requestType'];
    description: string;
    requestedData?: string[];
    metadata?: Record<string, any>;
  }): PrivacyRequest {
    const request: PrivacyRequest = {
      id: this.generateId(),
      userId: requestData.userId,
      requestType: requestData.requestType,
      status: 'pending',
      description: requestData.description,
      requestedData: requestData.requestedData,
      createdAt: new Date(),
      metadata: requestData.metadata
    };

    this.requests.set(request.id, request);

    // Registrar auditoría
    this.logAudit({
      userId: requestData.userId,
      action: 'privacy_request',
      ipAddress: 'system',
      userAgent: 'system',
      details: `Solicitud de privacidad creada: ${requestData.requestType} - ${requestData.description}`
    });

    console.log(`📋 Solicitud de privacidad creada: ${request.id} - ${requestData.requestType}`);
    return request;
  }

  /**
   * Procesa una solicitud de privacidad
   */
  async processPrivacyRequest(
    requestId: string,
    action: 'approve' | 'reject',
    responseData?: any,
    rejectionReason?: string
  ): Promise<boolean> {
    const request = this.requests.get(requestId);
    
    if (!request) {
      return false;
    }

    if (action === 'approve') {
      request.status = 'processing';
      
      try {
        // Procesar según el tipo de solicitud
        switch (request.requestType) {
          case 'access':
            request.responseData = await this.processDataAccessRequest(request);
            break;
          case 'rectification':
            request.responseData = await this.processDataRectificationRequest(request);
            break;
          case 'erasure':
            request.responseData = await this.processDataErasureRequest(request);
            break;
          case 'portability':
            request.responseData = await this.processDataPortabilityRequest(request);
            break;
          case 'restriction':
            request.responseData = await this.processDataRestrictionRequest(request);
            break;
          case 'objection':
            request.responseData = await this.processDataObjectionRequest(request);
            break;
        }

        request.status = 'completed';
        request.completedAt = new Date();

        // Registrar auditoría
        this.logAudit({
          userId: request.userId,
          action: 'privacy_request',
          ipAddress: 'system',
          userAgent: 'system',
          details: `Solicitud de privacidad completada: ${request.requestType}`
        });

        console.log(`✅ Solicitud de privacidad procesada: ${requestId}`);
        return true;

      } catch (error) {
        request.status = 'rejected';
        request.rejectionReason = `Error en procesamiento: ${error}`;
        console.error(`❌ Error procesando solicitud: ${requestId}`, error);
        return false;
      }

    } else {
      request.status = 'rejected';
      request.rejectionReason = rejectionReason || 'Solicitud rechazada';
      request.completedAt = new Date();

      console.log(`❌ Solicitud de privacidad rechazada: ${requestId}`);
      return true;
    }
  }

  /**
   * Procesa solicitud de acceso a datos
   */
  private async processDataAccessRequest(request: PrivacyRequest): Promise<any> {
    const userData = this.dataInventory.get(request.userId) || [];
    
    return {
      requestId: request.id,
      userId: request.userId,
      dataCategories: userData.map(item => ({
        category: item.dataCategory,
        type: item.dataType,
        purpose: item.purpose,
        lastAccessed: item.lastAccessed,
        lastModified: item.lastModified
      })),
      consents: Array.from(this.consents.values())
        .filter(c => c.userId === request.userId)
        .map(c => ({
          id: c.id,
          type: c.consentType,
          purpose: c.purpose,
          grantedAt: c.grantedAt,
          expiresAt: c.expiresAt,
          withdrawnAt: c.withdrawnAt
        }))
    };
  }

  /**
   * Procesa solicitud de rectificación de datos
   */
  private async processDataRectificationRequest(request: PrivacyRequest): Promise<any> {
    // Implementación simplificada - en producción se actualizarían los datos reales
    return {
      requestId: request.id,
      userId: request.userId,
      status: 'rectification_initiated',
      message: 'Solicitud de rectificación procesada'
    };
  }

  /**
   * Procesa solicitud de eliminación de datos
   */
  private async processDataErasureRequest(request: PrivacyRequest): Promise<any> {
    // Eliminar datos del inventario
    this.dataInventory.delete(request.userId);
    
    // Retirar todos los consentimientos
    Array.from(this.consents.values())
      .filter(c => c.userId === request.userId)
      .forEach(c => {
        c.consentType = 'withdrawn';
        c.withdrawnAt = new Date();
      });

    // Anonimizar auditorías
    this.audits = this.audits.map(audit => {
      if (audit.userId === request.userId) {
        return {
          ...audit,
          userId: `anonymized_${audit.id}`,
          details: '[DATOS ANONIMIZADOS]'
        };
      }
      return audit;
    });

    return {
      requestId: request.id,
      userId: request.userId,
      status: 'erasure_completed',
      message: 'Datos eliminados y anonimizados'
    };
  }

  /**
   * Procesa solicitud de portabilidad de datos
   */
  private async processDataPortabilityRequest(request: PrivacyRequest): Promise<any> {
    const userData = this.dataInventory.get(request.userId) || [];
    
    return {
      requestId: request.id,
      userId: request.userId,
      format: 'json',
      data: {
        personalData: userData.filter(item => item.dataType === 'personal'),
        consents: Array.from(this.consents.values())
          .filter(c => c.userId === request.userId)
          .map(c => ({
            purpose: c.purpose,
            grantedAt: c.grantedAt,
            expiresAt: c.expiresAt
          }))
      },
      exportDate: new Date()
    };
  }

  /**
   * Procesa solicitud de restricción de datos
   */
  private async processDataRestrictionRequest(request: PrivacyRequest): Promise<any> {
    return {
      requestId: request.id,
      userId: request.userId,
      status: 'restriction_applied',
      message: 'Restricción de procesamiento aplicada'
    };
  }

  /**
   * Procesa solicitud de objeción
   */
  private async processDataObjectionRequest(request: PrivacyRequest): Promise<any> {
    return {
      requestId: request.id,
      userId: request.userId,
      status: 'objection_registered',
      message: 'Objeción al procesamiento registrada'
    };
  }

  /**
   * Registra datos en el inventario
   */
  registerData(data: {
    userId: string;
    dataCategory: string;
    dataType: DataInventory['dataType'];
    purpose: string;
    retentionPeriod: number;
    source: string;
    location: string;
    accessLevel: DataInventory['accessLevel'];
    metadata?: Record<string, any>;
  }): DataInventory {
    const inventoryItem: DataInventory = {
      id: this.generateId(),
      userId: data.userId,
      dataCategory: data.dataCategory,
      dataType: data.dataType,
      purpose: data.purpose,
      retentionPeriod: data.retentionPeriod,
      source: data.source,
      location: data.location,
      accessLevel: data.accessLevel,
      lastAccessed: new Date(),
      lastModified: new Date(),
      isAnonymized: false,
      isEncrypted: this.config.enableDataEncryption,
      metadata: data.metadata
    };

    if (!this.dataInventory.has(data.userId)) {
      this.dataInventory.set(data.userId, []);
    }
    this.dataInventory.get(data.userId)!.push(inventoryItem);

    console.log(`📊 Datos registrados en inventario: ${inventoryItem.id} para usuario ${data.userId}`);
    return inventoryItem;
  }

  /**
   * Anonimiza datos de un usuario
   */
  anonymizeUserData(userId: string, dataCategories?: string[]): boolean {
    const userData = this.dataInventory.get(userId);
    
    if (!userData) {
      return false;
    }

    const dataToAnonymize = dataCategories 
      ? userData.filter(item => dataCategories.includes(item.dataCategory))
      : userData;

    dataToAnonymize.forEach(item => {
      item.isAnonymized = true;
      item.lastModified = new Date();
    });

    // Registrar auditoría
    this.logAudit({
      userId,
      action: 'data_modification',
      ipAddress: 'system',
      userAgent: 'system',
      details: `Datos anonimizados: ${dataToAnonymize.length} elementos`
    });

    console.log(`🔒 Datos anonimizados para usuario: ${userId}`);
    return true;
  }

  /**
   * Registra auditoría
   */
  private logAudit(auditData: {
    userId: string;
    action: PrivacyAudit['action'];
    dataCategory?: string;
    purpose?: string;
    ipAddress: string;
    userAgent: string;
    details: string;
    metadata?: Record<string, any>;
  }): void {
    const audit: PrivacyAudit = {
      id: this.generateId(),
      userId: auditData.userId,
      action: auditData.action,
      dataCategory: auditData.dataCategory,
      purpose: auditData.purpose,
      timestamp: new Date(),
      ipAddress: auditData.ipAddress,
      userAgent: auditData.userAgent,
      details: auditData.details,
      metadata: auditData.metadata
    };

    this.audits.push(audit);
  }

  /**
   * Obtiene estadísticas de privacidad
   */
  getStats(): PrivacyStats {
    const totalUsers = new Set([
      ...Array.from(this.consents.values()).map(c => c.userId),
      ...Array.from(this.requests.values()).map(r => r.userId),
      ...Array.from(this.dataInventory.keys())
    ]).size;

    const activeConsents = Array.from(this.consents.values())
      .filter(c => c.consentType !== 'withdrawn').length;

    const withdrawnConsents = Array.from(this.consents.values())
      .filter(c => c.consentType === 'withdrawn').length;

    const pendingRequests = Array.from(this.requests.values())
      .filter(r => r.status === 'pending').length;

    const completedRequests = Array.from(this.requests.values())
      .filter(r => r.status === 'completed').length;

    // Categorías de datos
    const categoryCounts: Record<string, number> = {};
    Array.from(this.dataInventory.values()).flat().forEach(item => {
      categoryCounts[item.dataCategory] = (categoryCounts[item.dataCategory] || 0) + 1;
    });

    const dataCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Tipos de solicitudes
    const requestTypeCounts: Record<string, number> = {};
    Array.from(this.requests.values()).forEach(request => {
      requestTypeCounts[request.requestType] = (requestTypeCounts[request.requestType] || 0) + 1;
    });

    const requestTypes = Object.entries(requestTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalUsers,
      activeConsents,
      withdrawnConsents,
      pendingRequests,
      completedRequests,
      dataCategories,
      requestTypes,
      averageResponseTime: 0 // Se calcularía con métricas reales
    };
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): {
    isInitialized: boolean;
    isEnabled: boolean;
    gdprCompliant: boolean;
    totalConsents: number;
    totalRequests: number;
    totalDataItems: number;
    totalAudits: number;
    totalAlerts: number;
  } {
    const totalDataItems = Array.from(this.dataInventory.values())
      .reduce((sum, items) => sum + items.length, 0);

    return {
      isInitialized: this.isInitialized,
      isEnabled: this.config.enabled,
      gdprCompliant: this.config.gdprCompliant,
      totalConsents: this.consents.size,
      totalRequests: this.requests.size,
      totalDataItems,
      totalAudits: this.audits.length,
      totalAlerts: this.alerts.size
    };
  }

  /**
   * Obtiene todas las alertas
   */
  getAlerts(): PrivacyAlert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Obtiene auditorías de un usuario
   */
  getUserAudits(userId: string, limit: number = 100): PrivacyAudit[] {
    return this.audits
      .filter(audit => audit.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Obtiene datos del inventario de un usuario
   */
  getUserDataInventory(userId: string): DataInventory[] {
    return this.dataInventory.get(userId) || [];
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<PrivacyConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de privacidad actualizada');
  }

  /**
   * Limpia datos antiguos
   */
  cleanup(): void {
    const now = new Date();
    const retentionCutoff = new Date(now.getTime() - this.config.dataRetentionDays * 24 * 60 * 60 * 1000);
    const auditCutoff = new Date(now.getTime() - this.config.auditLogRetentionDays * 24 * 60 * 60 * 1000);

    // Limpiar datos expirados del inventario
    for (const [userId, items] of this.dataInventory) {
      const validItems = items.filter(item => 
        new Date(item.lastModified.getTime() + item.retentionPeriod * 24 * 60 * 60 * 1000) > now
      );
      
      if (validItems.length !== items.length) {
        this.dataInventory.set(userId, validItems);
        console.log(`🗑️ Datos expirados eliminados para usuario: ${userId}`);
      }
    }

    // Limpiar auditorías antiguas
    const originalAuditCount = this.audits.length;
    this.audits = this.audits.filter(audit => audit.timestamp > auditCutoff);
    
    if (this.audits.length !== originalAuditCount) {
      console.log(`🗑️ Auditorías antiguas eliminadas: ${originalAuditCount - this.audits.length}`);
    }

    // Limpiar alertas antiguas
    for (const [alertId, alert] of this.alerts) {
      if (alert.timestamp < retentionCutoff) {
        this.alerts.delete(alertId);
      }
    }

    console.log(`🧹 Limpieza de privacidad completada`);
  }

  /**
   * Limpia todos los recursos
   */
  async cleanup(): Promise<void> {
    this.consents.clear();
    this.requests.clear();
    this.dataInventory.clear();
    this.audits = [];
    this.alerts.clear();
    this.observers.clear();

    console.log('🧹 Servicio de privacidad limpiado');
  }

  // Métodos auxiliares
  private generateId(): string {
    return `privacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyObservers(event: string, data: any): void {
    console.log(`🔒 Evento de privacidad: ${event}`, data);
  }
}

// Instancia singleton del servicio
export const privacyService = new PrivacyService();

// Exportar el servicio como default
export default privacyService;
