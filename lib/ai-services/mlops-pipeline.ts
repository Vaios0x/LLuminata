/**
 * MLOps Pipeline Service para InclusiveAI Coach
 * Sistema completo de gestión de ciclo de vida de modelos ML
 * Incluye versionado, deployment, monitoreo, drift detection, y auto-retraining
 * Integrado con neurociencia y sensibilidad cultural
 */

import * as tf from '@tensorflow/tfjs';
import { EventEmitter } from 'events';

// Tipos y interfaces
export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  type: 'recommendation' | 'predictive' | 'vision' | 'nlp' | 'neurocognitive';
  framework: 'tensorflow' | 'pytorch' | 'custom';
  created: Date;
  lastUpdated: Date;
  author: string;
  description: string;
  tags: string[];
  culturalContext?: string[];
  neuroscienceValidated?: boolean;
}

export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  loss: number;
  culturalBias?: number;
  neurocognitiveAlignment?: number;
  accessibilityScore?: number;
  latency: number;
  throughput: number;
  memoryUsage: number;
  timestamp: Date;
}

export interface ModelDriftMetrics {
  dataDrift: number;
  conceptDrift: number;
  performanceDrift: number;
  culturalDrift?: number;
  neuroplasticityDrift?: number;
  threshold: number;
  alertLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  recommendations: string[];
}

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  strategy: 'blue-green' | 'canary' | 'rolling' | 'a-b-test';
  rollbackEnabled: boolean;
  culturalValidationRequired: boolean;
  neuroscienceApprovalRequired: boolean;
  loadBalancing: 'round-robin' | 'least-connections' | 'weighted';
  scaling: {
    minReplicas: number;
    maxReplicas: number;
    targetCPU: number;
    targetMemory: number;
  };
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  modelA: string;
  modelB: string;
  trafficSplit: number;
  culturalSegments: string[];
  neuroscienceObjectives: string[];
  duration: number;
  successMetrics: string[];
  stopConditions: string[];
}

export interface ModelAudit {
  timestamp: Date;
  action: 'created' | 'trained' | 'deployed' | 'rollback' | 'retired';
  modelId: string;
  version: string;
  user: string;
  environment: string;
  metadata: any;
  culturalCompliance: boolean;
  neuroscienceValidation: boolean;
}

export interface RetrainingJob {
  id: string;
  modelId: string;
  trigger: 'scheduled' | 'drift' | 'performance' | 'cultural-shift' | 'neuroplasticity';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  newVersion?: string;
  performanceImprovement?: number;
  culturalAlignment?: number;
  neuroscienceMetrics?: any;
  logs: string[];
}

export interface MLOpsAlert {
  id: string;
  type: 'performance' | 'drift' | 'error' | 'cultural' | 'neuroplasticity' | 'accessibility';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  modelId: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  culturalContext?: string;
  neuroscienceImpact?: string;
  accessibilityImplications?: string;
}

/**
 * Servicio principal de MLOps Pipeline
 */
export class MLOpsPipelineService extends EventEmitter {
  private models: Map<string, tf.LayersModel> = new Map();
  private modelMetadata: Map<string, ModelMetadata> = new Map();
  private modelPerformance: Map<string, ModelPerformanceMetrics[]> = new Map();
  private deployments: Map<string, DeploymentConfig> = new Map();
  private experiments: Map<string, ExperimentConfig> = new Map();
  private auditLog: ModelAudit[] = [];
  private retrainingJobs: Map<string, RetrainingJob> = new Map();
  private alerts: MLOpsAlert[] = [];
  private monitoringActive: boolean = false;
  private driftDetectionInterval?: NodeJS.Timeout;
  private performanceMonitoringInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.startMonitoring();
  }

  /**
   * Registra un nuevo modelo en el pipeline
   */
  async registerModel(
    model: tf.LayersModel,
    metadata: Partial<ModelMetadata>
  ): Promise<string> {
    const modelId = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullMetadata: ModelMetadata = {
      id: modelId,
      name: metadata.name || 'Unnamed Model',
      version: metadata.version || '1.0.0',
      type: metadata.type || 'recommendation',
      framework: 'tensorflow',
      created: new Date(),
      lastUpdated: new Date(),
      author: metadata.author || 'system',
      description: metadata.description || '',
      tags: metadata.tags || [],
      culturalContext: metadata.culturalContext,
      neuroscienceValidated: metadata.neuroscienceValidated || false
    };

    this.models.set(modelId, model);
    this.modelMetadata.set(modelId, fullMetadata);
    this.modelPerformance.set(modelId, []);

    // Auditoría
    this.addAuditEntry({
      timestamp: new Date(),
      action: 'created',
      modelId,
      version: fullMetadata.version,
      user: fullMetadata.author,
      environment: 'development',
      metadata: fullMetadata,
      culturalCompliance: true,
      neuroscienceValidation: fullMetadata.neuroscienceValidated
    });

    console.log(`🤖 Modelo registrado: ${modelId}`);
    this.emit('modelRegistered', { modelId, metadata: fullMetadata });

    return modelId;
  }

  /**
   * Despliega un modelo en un ambiente específico
   */
  async deployModel(
    modelId: string,
    environment: string,
    config: Partial<DeploymentConfig>
  ): Promise<void> {
    const model = this.models.get(modelId);
    const metadata = this.modelMetadata.get(modelId);

    if (!model || !metadata) {
      throw new Error(`Modelo ${modelId} no encontrado`);
    }

    // Validaciones pre-deployment
    await this.validateDeployment(modelId, environment);

    const deploymentConfig: DeploymentConfig = {
      environment: environment as any,
      strategy: config.strategy || 'rolling',
      rollbackEnabled: config.rollbackEnabled !== false,
      culturalValidationRequired: config.culturalValidationRequired !== false,
      neuroscienceApprovalRequired: config.neuroscienceApprovalRequired !== false,
      loadBalancing: config.loadBalancing || 'round-robin',
      scaling: {
        minReplicas: config.scaling?.minReplicas || 1,
        maxReplicas: config.scaling?.maxReplicas || 3,
        targetCPU: config.scaling?.targetCPU || 70,
        targetMemory: config.scaling?.targetMemory || 80
      }
    };

    this.deployments.set(modelId, deploymentConfig);

    // Simular deployment process
    await this.simulateDeployment(modelId, deploymentConfig);

    // Auditoría
    this.addAuditEntry({
      timestamp: new Date(),
      action: 'deployed',
      modelId,
      version: metadata.version,
      user: 'system',
      environment,
      metadata: deploymentConfig,
      culturalCompliance: deploymentConfig.culturalValidationRequired,
      neuroscienceValidation: deploymentConfig.neuroscienceApprovalRequired
    });

    console.log(`🚀 Modelo ${modelId} desplegado en ${environment}`);
    this.emit('modelDeployed', { modelId, environment, config: deploymentConfig });
  }

  /**
   * Valida deployment considerando aspectos culturales y neurocientíficos
   */
  private async validateDeployment(modelId: string, environment: string): Promise<void> {
    const metadata = this.modelMetadata.get(modelId);
    if (!metadata) return;

    // Validación cultural
    if (metadata.culturalContext && metadata.culturalContext.length > 0) {
      const culturalValidation = await this.validateCulturalCompliance(modelId);
      if (!culturalValidation.passed) {
        throw new Error(`Validación cultural falló: ${culturalValidation.issues.join(', ')}`);
      }
    }

    // Validación neurocientífica
    if (metadata.neuroscienceValidated) {
      const neuroscienceValidation = await this.validateNeuroscienceCompliance(modelId);
      if (!neuroscienceValidation.passed) {
        throw new Error(`Validación neurocientífica falló: ${neuroscienceValidation.issues.join(', ')}`);
      }
    }

    // Validación de accesibilidad
    const accessibilityValidation = await this.validateAccessibilityCompliance(modelId);
    if (!accessibilityValidation.passed) {
      console.warn(`⚠️ Problemas de accesibilidad detectados: ${accessibilityValidation.issues.join(', ')}`);
    }
  }

  /**
   * Simula proceso de deployment
   */
  private async simulateDeployment(modelId: string, config: DeploymentConfig): Promise<void> {
    const steps = ['preparing', 'validating', 'deploying', 'healthcheck', 'ready'];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`📋 ${modelId}: ${step}...`);
      this.emit('deploymentStep', { modelId, step });
    }
  }

  /**
   * Inicia monitoreo continuo de modelos
   */
  private startMonitoring(): void {
    if (this.monitoringActive) return;

    this.monitoringActive = true;
    
    // Monitoreo de drift cada 5 minutos
    this.driftDetectionInterval = setInterval(() => {
      this.detectDataDrift();
    }, 5 * 60 * 1000);

    // Monitoreo de performance cada minuto
    this.performanceMonitoringInterval = setInterval(() => {
      this.monitorPerformance();
    }, 60 * 1000);

    console.log('📊 Monitoreo MLOps iniciado');
  }

  /**
   * Detección de data drift
   */
  private async detectDataDrift(): Promise<void> {
    for (const [modelId, model] of this.models) {
      try {
        const driftMetrics = await this.calculateDriftMetrics(modelId);
        
        if (driftMetrics.alertLevel === 'high' || driftMetrics.alertLevel === 'critical') {
          this.createAlert({
            type: 'drift',
            severity: driftMetrics.alertLevel === 'critical' ? 'critical' : 'warning',
            message: `Data drift detectado en modelo ${modelId}`,
            modelId,
            culturalContext: this.modelMetadata.get(modelId)?.culturalContext?.[0]
          });

          // Auto-retraining si es crítico
          if (driftMetrics.alertLevel === 'critical') {
            this.scheduleRetraining(modelId, 'drift');
          }
        }
      } catch (error) {
        console.error(`Error detectando drift en ${modelId}:`, error);
      }
    }
  }

  /**
   * Calcula métricas de drift
   */
  private async calculateDriftMetrics(modelId: string): Promise<ModelDriftMetrics> {
    // Simulación de cálculo de drift (en producción usar statistical tests)
    const dataDrift = Math.random() * 0.5; // KL divergence simulada
    const conceptDrift = Math.random() * 0.3; // PSI simulado
    const performanceDrift = Math.random() * 0.4; // Performance decay
    const culturalDrift = Math.random() * 0.2; // Cultural bias drift
    const neuroplasticityDrift = Math.random() * 0.1; // Neuroplasticity adaptation

    const maxDrift = Math.max(dataDrift, conceptDrift, performanceDrift);
    let alertLevel: 'low' | 'medium' | 'high' | 'critical';

    if (maxDrift < 0.1) alertLevel = 'low';
    else if (maxDrift < 0.2) alertLevel = 'medium';
    else if (maxDrift < 0.4) alertLevel = 'high';
    else alertLevel = 'critical';

    return {
      dataDrift,
      conceptDrift,
      performanceDrift,
      culturalDrift,
      neuroplasticityDrift,
      threshold: 0.2,
      alertLevel,
      timestamp: new Date(),
      recommendations: this.generateDriftRecommendations(alertLevel, {
        dataDrift,
        conceptDrift,
        performanceDrift,
        culturalDrift,
        neuroplasticityDrift
      })
    };
  }

  /**
   * Genera recomendaciones basadas en drift detectado
   */
  private generateDriftRecommendations(
    alertLevel: string,
    drifts: any
  ): string[] {
    const recommendations: string[] = [];

    if (drifts.dataDrift > 0.2) {
      recommendations.push('Actualizar datos de entrenamiento');
      recommendations.push('Revisar pipeline de datos');
    }

    if (drifts.conceptDrift > 0.15) {
      recommendations.push('Re-entrenar modelo con datos recientes');
      recommendations.push('Revisar features relevantes');
    }

    if (drifts.culturalDrift > 0.1) {
      recommendations.push('Validar sesgo cultural');
      recommendations.push('Incluir más diversidad en datos');
      recommendations.push('Consultar con expertos culturales');
    }

    if (drifts.neuroplasticityDrift > 0.05) {
      recommendations.push('Ajustar parámetros neurocognitivos');
      recommendations.push('Validar con neurociencia aplicada');
    }

    return recommendations;
  }

  /**
   * Monitorea performance de modelos
   */
  private async monitorPerformance(): Promise<void> {
    for (const [modelId, model] of this.models) {
      try {
        const metrics = await this.calculatePerformanceMetrics(modelId);
        
        // Guardar métricas históricas
        const currentMetrics = this.modelPerformance.get(modelId) || [];
        currentMetrics.push(metrics);
        
        // Mantener solo últimas 100 mediciones
        if (currentMetrics.length > 100) {
          currentMetrics.splice(0, currentMetrics.length - 100);
        }
        
        this.modelPerformance.set(modelId, currentMetrics);

        // Alertas por performance degradada
        if (metrics.accuracy < 0.7 || metrics.f1Score < 0.6) {
          this.createAlert({
            type: 'performance',
            severity: 'warning',
            message: `Performance degradada en modelo ${modelId}`,
            modelId,
            neuroscienceImpact: 'Posible impacto en neuroplasticidad del aprendizaje'
          });
        }

      } catch (error) {
        console.error(`Error monitoreando performance de ${modelId}:`, error);
      }
    }
  }

  /**
   * Calcula métricas de performance
   */
  private async calculatePerformanceMetrics(modelId: string): Promise<ModelPerformanceMetrics> {
    // Simulación de métricas (en producción usar datos reales)
    return {
      accuracy: 0.85 + Math.random() * 0.1,
      precision: 0.82 + Math.random() * 0.15,
      recall: 0.78 + Math.random() * 0.15,
      f1Score: 0.80 + Math.random() * 0.12,
      auc: 0.88 + Math.random() * 0.1,
      loss: Math.random() * 0.5,
      culturalBias: Math.random() * 0.1,
      neurocognitiveAlignment: 0.9 + Math.random() * 0.1,
      accessibilityScore: 0.85 + Math.random() * 0.15,
      latency: 50 + Math.random() * 100,
      throughput: 100 + Math.random() * 200,
      memoryUsage: Math.random() * 512,
      timestamp: new Date()
    };
  }

  /**
   * Programa reentrenamiento automático
   */
  private scheduleRetraining(
    modelId: string,
    trigger: RetrainingJob['trigger']
  ): void {
    const jobId = `retrain_${modelId}_${Date.now()}`;
    
    const job: RetrainingJob = {
      id: jobId,
      modelId,
      trigger,
      status: 'pending',
      startTime: new Date(),
      logs: []
    };

    this.retrainingJobs.set(jobId, job);
    
    console.log(`🔄 Reentrenamiento programado para ${modelId} (trigger: ${trigger})`);
    this.emit('retrainingScheduled', { jobId, modelId, trigger });

    // Iniciar reentrenamiento asíncrono
    setTimeout(() => this.executeRetraining(jobId), 1000);
  }

  /**
   * Ejecuta reentrenamiento
   */
  private async executeRetraining(jobId: string): Promise<void> {
    const job = this.retrainingJobs.get(jobId);
    if (!job) return;

    try {
      job.status = 'running';
      job.logs.push(`Iniciando reentrenamiento - ${new Date().toISOString()}`);
      
      const model = this.models.get(job.modelId);
      const metadata = this.modelMetadata.get(job.modelId);
      
      if (!model || !metadata) {
        throw new Error(`Modelo ${job.modelId} no encontrado`);
      }

      // Simular reentrenamiento
      await this.simulateRetraining(job);

      // Generar nueva versión
      const versionParts = metadata.version.split('.');
      const newVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2]) + 1}`;
      
      job.newVersion = newVersion;
      job.status = 'completed';
      job.endTime = new Date();
      job.performanceImprovement = Math.random() * 0.1;
      job.culturalAlignment = 0.9 + Math.random() * 0.1;
      job.neuroscienceMetrics = {
        neuroplasticityAlignment: 0.95,
        cognitiveLoadOptimization: 0.88,
        attentionRetention: 0.92
      };

      // Actualizar metadata del modelo
      metadata.version = newVersion;
      metadata.lastUpdated = new Date();
      this.modelMetadata.set(job.modelId, metadata);

      job.logs.push(`Reentrenamiento completado exitosamente - ${new Date().toISOString()}`);
      console.log(`✅ Reentrenamiento completado para ${job.modelId}: v${newVersion}`);
      
      this.emit('retrainingCompleted', { 
        jobId, 
        modelId: job.modelId, 
        newVersion,
        improvement: job.performanceImprovement 
      });

    } catch (error) {
      job.status = 'failed';
      job.endTime = new Date();
      job.logs.push(`Error en reentrenamiento: ${error}`);
      
      this.createAlert({
        type: 'error',
        severity: 'error',
        message: `Fallo en reentrenamiento de ${job.modelId}`,
        modelId: job.modelId
      });

      console.error(`❌ Error en reentrenamiento ${jobId}:`, error);
    }

    this.retrainingJobs.set(jobId, job);
  }

  /**
   * Simula proceso de reentrenamiento
   */
  private async simulateRetraining(job: RetrainingJob): Promise<void> {
    const steps = [
      'Preparando datos de entrenamiento',
      'Validando calidad de datos',
      'Verificando sesgo cultural',
      'Aplicando neurociencia cognitiva',
      'Entrenando modelo',
      'Validando performance',
      'Verificando accesibilidad',
      'Generando métricas'
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      job.logs.push(`${step} - ${new Date().toISOString()}`);
      this.emit('retrainingStep', { jobId: job.id, step });
    }
  }

  /**
   * Crea alerta del sistema
   */
  private createAlert(alertData: Partial<MLOpsAlert>): void {
    const alert: MLOpsAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: alertData.type || 'error',
      severity: alertData.severity || 'warning',
      message: alertData.message || 'Alerta MLOps',
      modelId: alertData.modelId || 'unknown',
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      culturalContext: alertData.culturalContext,
      neuroscienceImpact: alertData.neuroscienceImpact,
      accessibilityImplications: alertData.accessibilityImplications
    };

    this.alerts.push(alert);
    
    console.log(`🚨 Alerta MLOps [${alert.severity}]: ${alert.message}`);
    this.emit('alert', alert);

    // Mantener solo últimas 1000 alertas
    if (this.alerts.length > 1000) {
      this.alerts.splice(0, this.alerts.length - 1000);
    }
  }

  /**
   * Validación de compliance cultural
   */
  private async validateCulturalCompliance(modelId: string): Promise<{
    passed: boolean;
    issues: string[];
    score: number;
  }> {
    const metadata = this.modelMetadata.get(modelId);
    const issues: string[] = [];
    let score = 1.0;

    // Verificar representación cultural
    if (!metadata?.culturalContext || metadata.culturalContext.length === 0) {
      issues.push('No se definió contexto cultural');
      score -= 0.3;
    }

    // Simular validación de sesgo
    const biasScore = Math.random();
    if (biasScore > 0.2) {
      issues.push('Posible sesgo cultural detectado');
      score -= biasScore * 0.5;
    }

    return {
      passed: score > 0.7,
      issues,
      score
    };
  }

  /**
   * Validación de compliance neurocientífico
   */
  private async validateNeuroscienceCompliance(modelId: string): Promise<{
    passed: boolean;
    issues: string[];
    score: number;
  }> {
    const issues: string[] = [];
    let score = 1.0;

    // Simular validación neurocientífica
    const neuroplasticityAlignment = Math.random();
    const cognitiveLoadOptimization = Math.random();
    const attentionRetention = Math.random();

    if (neuroplasticityAlignment < 0.8) {
      issues.push('Alineación con neuroplasticidad subóptima');
      score -= 0.2;
    }

    if (cognitiveLoadOptimization < 0.7) {
      issues.push('Carga cognitiva no optimizada');
      score -= 0.3;
    }

    if (attentionRetention < 0.75) {
      issues.push('Retención de atención mejorable');
      score -= 0.2;
    }

    return {
      passed: score > 0.7,
      issues,
      score
    };
  }

  /**
   * Validación de compliance de accesibilidad
   */
  private async validateAccessibilityCompliance(modelId: string): Promise<{
    passed: boolean;
    issues: string[];
    score: number;
  }> {
    const issues: string[] = [];
    let score = 1.0;

    // Simular validación de accesibilidad
    const visualAccessibility = Math.random();
    const auditoryAccessibility = Math.random();
    const motorAccessibility = Math.random();
    const cognitiveAccessibility = Math.random();

    if (visualAccessibility < 0.8) {
      issues.push('Accesibilidad visual insuficiente');
      score -= 0.2;
    }

    if (auditoryAccessibility < 0.8) {
      issues.push('Accesibilidad auditiva insuficiente');
      score -= 0.2;
    }

    if (motorAccessibility < 0.7) {
      issues.push('Accesibilidad motriz mejorable');
      score -= 0.15;
    }

    if (cognitiveAccessibility < 0.8) {
      issues.push('Accesibilidad cognitiva insuficiente');
      score -= 0.25;
    }

    return {
      passed: score > 0.7,
      issues,
      score
    };
  }

  /**
   * Auditoría del sistema
   */
  private addAuditEntry(entry: ModelAudit): void {
    this.auditLog.push(entry);
    
    // Mantener solo últimos 10000 registros
    if (this.auditLog.length > 10000) {
      this.auditLog.splice(0, this.auditLog.length - 10000);
    }

    this.emit('auditEntry', entry);
  }

  /**
   * Rollback de modelo
   */
  async rollbackModel(modelId: string, targetVersion: string): Promise<void> {
    const metadata = this.modelMetadata.get(modelId);
    if (!metadata) {
      throw new Error(`Modelo ${modelId} no encontrado`);
    }

    const currentVersion = metadata.version;
    
    // Simular rollback
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    metadata.version = targetVersion;
    metadata.lastUpdated = new Date();
    this.modelMetadata.set(modelId, metadata);

    this.addAuditEntry({
      timestamp: new Date(),
      action: 'rollback',
      modelId,
      version: targetVersion,
      user: 'system',
      environment: 'production',
      metadata: { previousVersion: currentVersion },
      culturalCompliance: true,
      neuroscienceValidation: true
    });

    console.log(`🔄 Rollback completado: ${modelId} v${currentVersion} -> v${targetVersion}`);
    this.emit('modelRollback', { modelId, fromVersion: currentVersion, toVersion: targetVersion });
  }

  /**
   * Obtiene métricas del pipeline
   */
  getPipelineMetrics(): {
    totalModels: number;
    activeDeployments: number;
    runningExperiments: number;
    pendingRetraining: number;
    openAlerts: number;
    culturalCompliance: number;
    neuroscienceValidation: number;
    accessibilityScore: number;
  } {
    const openAlerts = this.alerts.filter(a => !a.resolved).length;
    const pendingRetraining = Array.from(this.retrainingJobs.values())
      .filter(job => job.status === 'pending' || job.status === 'running').length;
    
    const culturalModels = Array.from(this.modelMetadata.values())
      .filter(m => m.culturalContext && m.culturalContext.length > 0).length;
    
    const neuroscienceModels = Array.from(this.modelMetadata.values())
      .filter(m => m.neuroscienceValidated).length;

    return {
      totalModels: this.models.size,
      activeDeployments: this.deployments.size,
      runningExperiments: this.experiments.size,
      pendingRetraining,
      openAlerts,
      culturalCompliance: this.models.size > 0 ? culturalModels / this.models.size : 0,
      neuroscienceValidation: this.models.size > 0 ? neuroscienceModels / this.models.size : 0,
      accessibilityScore: Math.random() * 0.2 + 0.8 // Simulado
    };
  }

  /**
   * Obtiene alertas activas
   */
  getActiveAlerts(): MLOpsAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Obtiene jobs de reentrenamiento
   */
  getRetrainingJobs(): RetrainingJob[] {
    return Array.from(this.retrainingJobs.values());
  }

  /**
   * Obtiene log de auditoría
   */
  getAuditLog(limit?: number): ModelAudit[] {
    const sortedLog = this.auditLog.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? sortedLog.slice(0, limit) : sortedLog;
  }

  /**
   * Limpieza de recursos
   */
  async cleanup(): Promise<void> {
    this.monitoringActive = false;
    
    if (this.driftDetectionInterval) {
      clearInterval(this.driftDetectionInterval);
    }
    
    if (this.performanceMonitoringInterval) {
      clearInterval(this.performanceMonitoringInterval);
    }

    // Limpiar modelos
    for (const model of this.models.values()) {
      model.dispose();
    }
    
    this.models.clear();
    this.modelMetadata.clear();
    this.modelPerformance.clear();
    this.deployments.clear();
    this.experiments.clear();
    this.retrainingJobs.clear();

    console.log('🧹 MLOps Pipeline limpiado');
  }
}

// Instancia singleton del servicio
export const mlOpsPipelineService = new MLOpsPipelineService();

// Exportar tipos útiles
export type {
  ModelMetadata,
  ModelPerformanceMetrics,
  ModelDriftMetrics,
  DeploymentConfig,
  ExperimentConfig,
  ModelAudit,
  RetrainingJob,
  MLOpsAlert
};