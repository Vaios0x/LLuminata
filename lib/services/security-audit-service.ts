/**
 * Servicio de Auditoría de Seguridad para InclusiveAI Coach
 * Proporciona funcionalidades de monitoreo y análisis de seguridad
 */

// Tipos para el servicio de auditoría de seguridad
export interface SecurityAuditConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  retentionPeriod: number; // Tiempo de retención en ms
  maxLogSize: number; // Tamaño máximo en bytes
  enableRealTimeMonitoring: boolean;
  enableAutomatedScans: boolean;
  enableVulnerabilityDetection: boolean;
  enableComplianceChecking: boolean;
  scanInterval: number; // Intervalo de escaneo en ms
  alertThreshold: number; // Umbral para alertas
}

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'authentication' | 'authorization' | 'data_access' | 'system_change' | 'security_incident' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resource?: string;
  details: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SecurityVulnerability {
  id: string;
  name: string;
  description: string;
  type: 'sql_injection' | 'xss' | 'csrf' | 'authentication' | 'authorization' | 'data_exposure' | 'configuration' | 'dependency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  cvssScore?: number;
  status: 'open' | 'investigating' | 'mitigated' | 'resolved' | 'false_positive';
  discoveredAt: Date;
  resolvedAt?: Date;
  affectedComponents: string[];
  remediation: string;
  references: string[];
  metadata?: Record<string, any>;
}

export interface SecurityCompliance {
  id: string;
  framework: 'gdpr' | 'hipaa' | 'sox' | 'pci_dss' | 'iso27001' | 'custom';
  requirement: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  lastChecked: Date;
  nextCheck: Date;
  evidence: string[];
  violations: string[];
  remediation: string;
  metadata?: Record<string, any>;
}

export interface SecurityScan {
  id: string;
  type: 'automated' | 'manual' | 'scheduled';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  findings: SecurityVulnerability[];
  summary: {
    totalFindings: number;
    criticalFindings: number;
    highFindings: number;
    mediumFindings: number;
    lowFindings: number;
  };
  metadata?: Record<string, any>;
}

export interface SecurityReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'incident' | 'compliance';
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalEvents: number;
    criticalEvents: number;
    highEvents: number;
    mediumEvents: number;
    lowEvents: number;
    vulnerabilitiesFound: number;
    complianceIssues: number;
  };
  events: SecurityEvent[];
  vulnerabilities: SecurityVulnerability[];
  compliance: SecurityCompliance[];
  recommendations: string[];
  metadata?: Record<string, any>;
}

export interface SecurityAlert {
  id: string;
  type: 'vulnerability' | 'compliance' | 'incident' | 'threshold_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  actions: Array<{
    type: 'email' | 'webhook' | 'notification' | 'ticket';
    config: Record<string, any>;
  }>;
  metadata?: Record<string, any>;
}

/**
 * Servicio principal de Auditoría de Seguridad
 */
export class SecurityAuditService {
  private config: SecurityAuditConfig;
  private events: SecurityEvent[] = [];
  private vulnerabilities: Map<string, SecurityVulnerability> = new Map();
  private compliance: Map<string, SecurityCompliance> = new Map();
  private scans: Map<string, SecurityScan> = new Map();
  private alerts: Map<string, SecurityAlert> = new Map();
  private isInitialized: boolean = false;
  private scanIntervalId: NodeJS.Timeout | null = null;
  private cleanupIntervalId: NodeJS.Timeout | null = null;
  private observers: Map<string, (data: any) => void> = new Map();

  constructor(config?: Partial<SecurityAuditConfig>) {
    this.config = {
      enabled: true,
      logLevel: 'info',
      retentionPeriod: 90 * 24 * 60 * 60 * 1000, // 90 días
      maxLogSize: 100 * 1024 * 1024, // 100MB
      enableRealTimeMonitoring: true,
      enableAutomatedScans: true,
      enableVulnerabilityDetection: true,
      enableComplianceChecking: true,
      scanInterval: 24 * 60 * 60 * 1000, // 24 horas
      alertThreshold: 10,
      ...config
    };

    this.initializeService();
  }

  /**
   * Inicializa el servicio
   */
  private initializeService(): void {
    if (!this.config.enabled) {
      console.log('⚠️ Servicio de auditoría de seguridad deshabilitado');
      return;
    }

    console.log('🚀 Inicializando servicio de auditoría de seguridad...');
    
    // Configurar escaneos automáticos
    if (this.config.enableAutomatedScans) {
      this.startAutomatedScans();
    }
    
    // Configurar limpieza automática
    this.startCleanupInterval();
    
    // Cargar datos existentes
    this.loadExistingData();
    
    this.isInitialized = true;
    console.log('✅ Servicio de auditoría de seguridad inicializado');
  }

  /**
   * Inicia escaneos automáticos
   */
  private startAutomatedScans(): void {
    this.scanIntervalId = setInterval(() => {
      this.performAutomatedScan();
    }, this.config.scanInterval);
  }

  /**
   * Inicia el intervalo de limpieza
   */
  private startCleanupInterval(): void {
    this.cleanupIntervalId = setInterval(() => {
      this.cleanup();
    }, 24 * 60 * 60 * 1000); // Cada día
  }

  /**
   * Carga datos existentes
   */
  private loadExistingData(): void {
    // En producción se cargarían desde la base de datos
    console.log('📥 Cargando datos de auditoría existentes...');
  }

  /**
   * Registra un evento de seguridad
   */
  logSecurityEvent(eventData: {
    type: SecurityEvent['type'];
    severity: SecurityEvent['severity'];
    source: string;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    action: string;
    resource?: string;
    details: Record<string, any>;
    metadata?: Record<string, any>;
  }): SecurityEvent {
    const event: SecurityEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      type: eventData.type,
      severity: eventData.severity,
      source: eventData.source,
      userId: eventData.userId,
      sessionId: eventData.sessionId,
      ipAddress: eventData.ipAddress,
      userAgent: eventData.userAgent,
      action: eventData.action,
      resource: eventData.resource,
      details: eventData.details,
      metadata: eventData.metadata
    };

    this.events.push(event);

    // Verificar si debe generar una alerta
    if (this.shouldGenerateAlert(event)) {
      this.createAlert(event);
    }

    // Verificar umbrales de seguridad
    this.checkSecurityThresholds();

    this.notifyObservers('eventLogged', event);
    return event;
  }

  /**
   * Verifica si debe generar una alerta
   */
  private shouldGenerateAlert(event: SecurityEvent): boolean {
    // Generar alerta para eventos críticos y de alta severidad
    if (event.severity === 'critical' || event.severity === 'high') {
      return true;
    }

    // Generar alerta si hay muchos eventos similares en poco tiempo
    const recentEvents = this.events.filter(e => 
      e.type === event.type && 
      e.severity === event.severity &&
      e.timestamp.getTime() > Date.now() - (5 * 60 * 1000) // Últimos 5 minutos
    );

    return recentEvents.length >= this.config.alertThreshold;
  }

  /**
   * Crea una alerta de seguridad
   */
  private createAlert(event: SecurityEvent): void {
    const alert: SecurityAlert = {
      id: this.generateId(),
      type: 'incident',
      severity: event.severity,
      title: `Evento de seguridad: ${event.action}`,
      description: `Se detectó un evento de seguridad de tipo ${event.type} con severidad ${event.severity}`,
      source: event.source,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      actions: [
        {
          type: 'notification',
          config: { channel: 'security' }
        }
      ],
      metadata: {
        eventId: event.id,
        eventType: event.type,
        eventAction: event.action
      }
    };

    this.alerts.set(alert.id, alert);
    console.log(`🚨 Alerta de seguridad creada: ${alert.title}`);
    this.notifyObservers('alertCreated', alert);
  }

  /**
   * Verifica umbrales de seguridad
   */
  private checkSecurityThresholds(): void {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Verificar eventos críticos en la última hora
    const criticalEvents = this.events.filter(e => 
      e.severity === 'critical' && 
      e.timestamp.getTime() > oneHourAgo
    );

    if (criticalEvents.length > 5) {
      this.createThresholdAlert('critical_events', criticalEvents.length);
    }

    // Verificar intentos de autenticación fallidos
    const failedAuthEvents = this.events.filter(e => 
      e.type === 'authentication' && 
      e.details.success === false &&
      e.timestamp.getTime() > oneHourAgo
    );

    if (failedAuthEvents.length > 10) {
      this.createThresholdAlert('failed_authentication', failedAuthEvents.length);
    }
  }

  /**
   * Crea una alerta por umbral excedido
   */
  private createThresholdAlert(type: string, count: number): void {
    const alert: SecurityAlert = {
      id: this.generateId(),
      type: 'threshold_exceeded',
      severity: 'high',
      title: `Umbral de seguridad excedido: ${type}`,
      description: `Se detectaron ${count} eventos que exceden el umbral de seguridad`,
      source: 'security_audit',
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      actions: [
        {
          type: 'email',
          config: { recipients: ['security@company.com'] }
        }
      ],
      metadata: {
        thresholdType: type,
        eventCount: count
      }
    };

    this.alerts.set(alert.id, alert);
    console.log(`🚨 Alerta de umbral creada: ${alert.title}`);
  }

  /**
   * Realiza un escaneo automático
   */
  private async performAutomatedScan(): Promise<void> {
    if (!this.config.enableAutomatedScans) return;

    try {
      console.log('🔍 Iniciando escaneo automático de seguridad...');

      const scan: SecurityScan = {
        id: this.generateId(),
        type: 'automated',
        status: 'running',
        startedAt: new Date(),
        findings: [],
        summary: {
          totalFindings: 0,
          criticalFindings: 0,
          highFindings: 0,
          mediumFindings: 0,
          lowFindings: 0
        }
      };

      this.scans.set(scan.id, scan);

      // Realizar diferentes tipos de escaneo
      await this.performVulnerabilityScan(scan);
      await this.performComplianceScan(scan);
      await this.performConfigurationScan(scan);

      // Finalizar escaneo
      scan.status = 'completed';
      scan.completedAt = new Date();
      scan.duration = scan.completedAt.getTime() - scan.startedAt.getTime();

      console.log(`✅ Escaneo automático completado: ${scan.findings.length} hallazgos encontrados`);
      this.notifyObservers('scanCompleted', scan);

    } catch (error) {
      console.error('❌ Error en escaneo automático:', error);
    }
  }

  /**
   * Realiza escaneo de vulnerabilidades
   */
  private async performVulnerabilityScan(scan: SecurityScan): Promise<void> {
    if (!this.config.enableVulnerabilityDetection) return;

    console.log('🔍 Escaneando vulnerabilidades...');

    // Simular detección de vulnerabilidades
    const mockVulnerabilities = [
      {
        name: 'SQL Injection Vulnerability',
        description: 'Posible vulnerabilidad de inyección SQL en endpoint de búsqueda',
        type: 'sql_injection' as const,
        severity: 'high' as const,
        cvssScore: 8.5,
        affectedComponents: ['/api/search', '/api/users'],
        remediation: 'Implementar validación de entrada y usar consultas preparadas',
        references: ['https://owasp.org/www-community/attacks/SQL_Injection']
      },
      {
        name: 'Cross-Site Scripting (XSS)',
        description: 'Vulnerabilidad XSS en formulario de comentarios',
        type: 'xss' as const,
        severity: 'medium' as const,
        cvssScore: 6.1,
        affectedComponents: ['/comments', '/feedback'],
        remediation: 'Implementar escape de HTML y validación de entrada',
        references: ['https://owasp.org/www-community/attacks/xss/']
      }
    ];

    for (const vulnData of mockVulnerabilities) {
      const vulnerability: SecurityVulnerability = {
        id: this.generateId(),
        name: vulnData.name,
        description: vulnData.description,
        type: vulnData.type,
        severity: vulnData.severity,
        cvssScore: vulnData.cvssScore,
        status: 'open',
        discoveredAt: new Date(),
        affectedComponents: vulnData.affectedComponents,
        remediation: vulnData.remediation,
        references: vulnData.references
      };

      this.vulnerabilities.set(vulnerability.id, vulnerability);
      scan.findings.push(vulnerability);

      // Actualizar resumen
      scan.summary.totalFindings++;
      switch (vulnerability.severity) {
        case 'critical':
          scan.summary.criticalFindings++;
          break;
        case 'high':
          scan.summary.highFindings++;
          break;
        case 'medium':
          scan.summary.mediumFindings++;
          break;
        case 'low':
          scan.summary.lowFindings++;
          break;
      }
    }
  }

  /**
   * Realiza escaneo de cumplimiento
   */
  private async performComplianceScan(scan: SecurityScan): Promise<void> {
    if (!this.config.enableComplianceChecking) return;

    console.log('🔍 Verificando cumplimiento...');

    // Simular verificación de cumplimiento
    const complianceChecks = [
      {
        framework: 'gdpr' as const,
        requirement: 'Consentimiento explícito',
        description: 'Verificar que se obtiene consentimiento explícito para el procesamiento de datos',
        status: 'compliant' as const,
        evidence: ['Formulario de consentimiento implementado', 'Registro de consentimientos activo'],
        violations: [],
        remediation: 'N/A'
      },
      {
        framework: 'gdpr' as const,
        requirement: 'Derecho al olvido',
        description: 'Verificar implementación del derecho de supresión de datos',
        status: 'partial' as const,
        evidence: ['Endpoint de eliminación disponible'],
        violations: ['No se eliminan datos de respaldo automáticamente'],
        remediation: 'Implementar eliminación automática en respaldos'
      }
    ];

    for (const checkData of complianceChecks) {
      const compliance: SecurityCompliance = {
        id: this.generateId(),
        framework: checkData.framework,
        requirement: checkData.requirement,
        description: checkData.description,
        status: checkData.status,
        lastChecked: new Date(),
        nextCheck: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 días
        evidence: checkData.evidence,
        violations: checkData.violations,
        remediation: checkData.remediation
      };

      this.compliance.set(compliance.id, compliance);
    }
  }

  /**
   * Realiza escaneo de configuración
   */
  private async performConfigurationScan(scan: SecurityScan): Promise<void> {
    console.log('🔍 Verificando configuración de seguridad...');

    // Simular verificación de configuración
    const configChecks = [
      {
        name: 'HTTPS Enforcement',
        description: 'Verificar que todas las conexiones usen HTTPS',
        status: 'compliant',
        details: 'Todas las rutas redirigen a HTTPS'
      },
      {
        name: 'Password Policy',
        description: 'Verificar política de contraseñas',
        status: 'non_compliant',
        details: 'Política de contraseñas no implementada'
      }
    ];

    // Crear vulnerabilidades para configuraciones no conformes
    for (const check of configChecks) {
      if (check.status === 'non_compliant') {
        const vulnerability: SecurityVulnerability = {
          id: this.generateId(),
          name: check.name,
          description: check.description,
          type: 'configuration',
          severity: 'medium',
          status: 'open',
          discoveredAt: new Date(),
          affectedComponents: ['system_configuration'],
          remediation: `Implementar ${check.name}`,
          references: []
        };

        this.vulnerabilities.set(vulnerability.id, vulnerability);
        scan.findings.push(vulnerability);
        scan.summary.totalFindings++;
        scan.summary.mediumFindings++;
      }
    }
  }

  /**
   * Inicia un escaneo manual
   */
  async startManualScan(scanType: 'vulnerability' | 'compliance' | 'configuration' | 'full'): Promise<SecurityScan> {
    const scan: SecurityScan = {
      id: this.generateId(),
      type: 'manual',
      status: 'running',
      startedAt: new Date(),
      findings: [],
      summary: {
        totalFindings: 0,
        criticalFindings: 0,
        highFindings: 0,
        mediumFindings: 0,
        lowFindings: 0
      }
    };

    this.scans.set(scan.id, scan);

    try {
      console.log(`🔍 Iniciando escaneo manual: ${scanType}`);

      if (scanType === 'vulnerability' || scanType === 'full') {
        await this.performVulnerabilityScan(scan);
      }

      if (scanType === 'compliance' || scanType === 'full') {
        await this.performComplianceScan(scan);
      }

      if (scanType === 'configuration' || scanType === 'full') {
        await this.performConfigurationScan(scan);
      }

      scan.status = 'completed';
      scan.completedAt = new Date();
      scan.duration = scan.completedAt.getTime() - scan.startedAt.getTime();

      console.log(`✅ Escaneo manual completado: ${scan.findings.length} hallazgos encontrados`);
      return scan;

    } catch (error) {
      scan.status = 'failed';
      scan.completedAt = new Date();
      console.error('❌ Error en escaneo manual:', error);
      throw error;
    }
  }

  /**
   * Genera un reporte de seguridad
   */
  generateReport(reportData: {
    title: string;
    type: SecurityReport['type'];
    period: { start: Date; end: Date };
  }): SecurityReport {
    const { start, end } = reportData.period;

    // Filtrar eventos del período
    const periodEvents = this.events.filter(e => 
      e.timestamp >= start && e.timestamp <= end
    );

    // Filtrar vulnerabilidades del período
    const periodVulnerabilities = Array.from(this.vulnerabilities.values())
      .filter(v => v.discoveredAt >= start && v.discoveredAt <= end);

    // Filtrar cumplimiento del período
    const periodCompliance = Array.from(this.compliance.values())
      .filter(c => c.lastChecked >= start && c.lastChecked <= end);

    // Calcular resumen
    const summary = {
      totalEvents: periodEvents.length,
      criticalEvents: periodEvents.filter(e => e.severity === 'critical').length,
      highEvents: periodEvents.filter(e => e.severity === 'high').length,
      mediumEvents: periodEvents.filter(e => e.severity === 'medium').length,
      lowEvents: periodEvents.filter(e => e.severity === 'low').length,
      vulnerabilitiesFound: periodVulnerabilities.length,
      complianceIssues: periodCompliance.filter(c => c.status === 'non_compliant').length
    };

    // Generar recomendaciones
    const recommendations = this.generateRecommendations(summary, periodVulnerabilities, periodCompliance);

    const report: SecurityReport = {
      id: this.generateId(),
      title: reportData.title,
      type: reportData.type,
      generatedAt: new Date(),
      period: { start, end },
      summary,
      events: periodEvents,
      vulnerabilities: periodVulnerabilities,
      compliance: periodCompliance,
      recommendations
    };

    console.log(`📊 Reporte de seguridad generado: ${report.title}`);
    return report;
  }

  /**
   * Genera recomendaciones de seguridad
   */
  private generateRecommendations(
    summary: SecurityReport['summary'],
    vulnerabilities: SecurityVulnerability[],
    compliance: SecurityCompliance[]
  ): string[] {
    const recommendations: string[] = [];

    // Recomendaciones basadas en eventos
    if (summary.criticalEvents > 0) {
      recommendations.push('Investigar inmediatamente los eventos críticos detectados');
    }

    if (summary.highEvents > 10) {
      recommendations.push('Revisar y fortalecer las medidas de seguridad para reducir eventos de alta severidad');
    }

    // Recomendaciones basadas en vulnerabilidades
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
    if (criticalVulns.length > 0) {
      recommendations.push(`Remediar ${criticalVulns.length} vulnerabilidades críticas identificadas`);
    }

    // Recomendaciones basadas en cumplimiento
    const nonCompliant = compliance.filter(c => c.status === 'non_compliant');
    if (nonCompliant.length > 0) {
      recommendations.push(`Abordar ${nonCompliant.length} problemas de cumplimiento identificados`);
    }

    // Recomendaciones generales
    if (summary.totalEvents > 1000) {
      recommendations.push('Considerar implementar un sistema de detección de intrusiones (IDS)');
    }

    if (vulnerabilities.length > 20) {
      recommendations.push('Implementar un programa de gestión de vulnerabilidades más robusto');
    }

    return recommendations;
  }

  /**
   * Acknowledges una alerta
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
      console.log(`✅ Alerta reconocida: ${alert.title}`);
    }
  }

  /**
   * Resuelve una alerta
   */
  resolveAlert(alertId: string, resolvedBy: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedBy = resolvedBy;
      alert.resolvedAt = new Date();
      console.log(`✅ Alerta resuelta: ${alert.title}`);
    }
  }

  /**
   * Actualiza el estado de una vulnerabilidad
   */
  updateVulnerabilityStatus(vulnerabilityId: string, status: SecurityVulnerability['status']): void {
    const vulnerability = this.vulnerabilities.get(vulnerabilityId);
    if (vulnerability) {
      vulnerability.status = status;
      if (status === 'resolved') {
        vulnerability.resolvedAt = new Date();
      }
      console.log(`✅ Estado de vulnerabilidad actualizado: ${vulnerability.name} -> ${status}`);
    }
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): {
    isInitialized: boolean;
    isEnabled: boolean;
    totalEvents: number;
    totalVulnerabilities: number;
    totalCompliance: number;
    activeAlerts: number;
    lastScan?: Date;
  } {
    const activeAlerts = Array.from(this.alerts.values()).filter(a => !a.resolved);
    const lastScan = Array.from(this.scans.values())
      .filter(s => s.status === 'completed')
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())[0]?.completedAt;

    return {
      isInitialized: this.isInitialized,
      isEnabled: this.config.enabled,
      totalEvents: this.events.length,
      totalVulnerabilities: this.vulnerabilities.size,
      totalCompliance: this.compliance.size,
      activeAlerts: activeAlerts.length,
      lastScan
    };
  }

  /**
   * Obtiene eventos de seguridad
   */
  getEvents(filters?: {
    type?: SecurityEvent['type'];
    severity?: SecurityEvent['severity'];
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    limit?: number;
  }): SecurityEvent[] {
    let filtered = this.events;

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(e => e.type === filters.type);
      }
      if (filters.severity) {
        filtered = filtered.filter(e => e.severity === filters.severity);
      }
      if (filters.startDate) {
        filtered = filtered.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(e => e.timestamp <= filters.endDate!);
      }
      if (filters.userId) {
        filtered = filtered.filter(e => e.userId === filters.userId);
      }
      if (filters.limit) {
        filtered = filtered.slice(-filters.limit);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Obtiene vulnerabilidades
   */
  getVulnerabilities(filters?: {
    severity?: SecurityVulnerability['severity'];
    status?: SecurityVulnerability['status'];
    type?: SecurityVulnerability['type'];
  }): SecurityVulnerability[] {
    let filtered = Array.from(this.vulnerabilities.values());

    if (filters) {
      if (filters.severity) {
        filtered = filtered.filter(v => v.severity === filters.severity);
      }
      if (filters.status) {
        filtered = filtered.filter(v => v.status === filters.status);
      }
      if (filters.type) {
        filtered = filtered.filter(v => v.type === filters.type);
      }
    }

    return filtered.sort((a, b) => b.discoveredAt.getTime() - a.discoveredAt.getTime());
  }

  /**
   * Obtiene alertas
   */
  getAlerts(filters?: {
    type?: SecurityAlert['type'];
    severity?: SecurityAlert['severity'];
    resolved?: boolean;
  }): SecurityAlert[] {
    let filtered = Array.from(this.alerts.values());

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(a => a.type === filters.type);
      }
      if (filters.severity) {
        filtered = filtered.filter(a => a.severity === filters.severity);
      }
      if (filters.resolved !== undefined) {
        filtered = filtered.filter(a => a.resolved === filters.resolved);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<SecurityAuditConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de auditoría de seguridad actualizada');
  }

  /**
   * Limpia datos antiguos
   */
  cleanup(): void {
    const cutoff = Date.now() - this.config.retentionPeriod;
    
    // Limpiar eventos antiguos
    this.events = this.events.filter(e => e.timestamp.getTime() >= cutoff);
    
    // Limpiar alertas resueltas antiguas
    for (const [alertId, alert] of this.alerts) {
      if (alert.resolved && alert.resolvedAt && alert.resolvedAt.getTime() < cutoff) {
        this.alerts.delete(alertId);
      }
    }

    console.log(`🧹 Limpieza de datos de auditoría completada`);
  }

  /**
   * Limpia todos los recursos
   */
  async cleanup(): Promise<void> {
    // Detener intervalos
    if (this.scanIntervalId) {
      clearInterval(this.scanIntervalId);
      this.scanIntervalId = null;
    }

    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }

    // Limpiar datos
    this.events = [];
    this.vulnerabilities.clear();
    this.compliance.clear();
    this.scans.clear();
    this.alerts.clear();
    this.observers.clear();

    console.log('🧹 Servicio de auditoría de seguridad limpiado');
  }

  // Métodos auxiliares
  private generateId(): string {
    return `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyObservers(event: string, data: any): void {
    console.log(`🔒 Evento de auditoría de seguridad: ${event}`, data);
  }
}

// Instancia singleton del servicio
export const securityAuditService = new SecurityAuditService();

// Exportar el servicio como default
export default securityAuditService;
