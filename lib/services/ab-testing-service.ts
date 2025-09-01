/**
 * Servicio de A/B Testing para InclusiveAI Coach
 * Proporciona funcionalidades de experimentación y análisis estadístico
 */

// Tipos para el servicio de A/B testing
export interface ABTestConfig {
  enabled: boolean;
  defaultTrafficSplit: number; // Porcentaje para variante B (0-100)
  confidenceLevel: number; // Nivel de confianza para significancia estadística
  minimumSampleSize: number; // Tamaño mínimo de muestra
  maxTestDuration: number; // Duración máxima en días
  enableAutoStop: boolean; // Detener automáticamente cuando se alcanza significancia
  enableMultiVariant: boolean; // Soporte para múltiples variantes
  enablePersonalization: boolean; // Personalización basada en segmentos
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'stopped';
  type: 'ui' | 'content' | 'feature' | 'algorithm' | 'workflow';
  hypothesis: string;
  successMetrics: string[];
  trafficSplit: {
    control: number;
    variantA: number;
    variantB: number;
    variantC?: number;
  };
  startDate: Date;
  endDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  config: {
    confidenceLevel: number;
    minimumSampleSize: number;
    maxDuration: number;
    autoStop: boolean;
    segments?: string[];
  };
}

export interface ABTestVariant {
  id: string;
  testId: string;
  name: string;
  type: 'control' | 'variant';
  config: Record<string, any>;
  trafficPercentage: number;
  isActive: boolean;
}

export interface ABTestParticipant {
  id: string;
  testId: string;
  userId?: string;
  sessionId: string;
  variantId: string;
  assignedAt: Date;
  firstSeenAt: Date;
  lastSeenAt: Date;
  events: ABTestEvent[];
  metadata?: Record<string, any>;
}

export interface ABTestEvent {
  id: string;
  participantId: string;
  testId: string;
  variantId: string;
  eventType: string;
  eventName: string;
  timestamp: Date;
  value?: number;
  properties?: Record<string, any>;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  variantName: string;
  sampleSize: number;
  conversionRate: number;
  conversionCount: number;
  averageValue: number;
  totalValue: number;
  standardError: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  pValue: number;
  isSignificant: boolean;
  lift: number; // Mejora vs control
  relativeLift: number; // Porcentaje de mejora
}

export interface ABTestAnalysis {
  testId: string;
  testName: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  totalParticipants: number;
  totalEvents: number;
  results: ABTestResult[];
  winner?: string;
  confidence: number;
  statisticalPower: number;
  recommendations: string[];
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    message: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

export interface ABTestSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
  }[];
  isActive: boolean;
  createdAt: Date;
}

/**
 * Servicio principal de A/B Testing
 */
export class ABTestingService {
  private config: ABTestConfig;
  private tests: Map<string, ABTest> = new Map();
  private variants: Map<string, ABTestVariant> = new Map();
  private participants: Map<string, ABTestParticipant> = new Map();
  private events: ABTestEvent[] = [];
  private segments: Map<string, ABTestSegment> = new Map();
  private isInitialized: boolean = false;
  private observers: Map<string, (data: any) => void> = new Map();

  constructor(config?: Partial<ABTestConfig>) {
    this.config = {
      enabled: true,
      defaultTrafficSplit: 50,
      confidenceLevel: 0.95,
      minimumSampleSize: 1000,
      maxTestDuration: 30,
      enableAutoStop: true,
      enableMultiVariant: true,
      enablePersonalization: true,
      ...config
    };

    this.initializeService();
  }

  /**
   * Inicializa el servicio
   */
  private initializeService(): void {
    if (!this.config.enabled) {
      console.log('⚠️ Servicio de A/B testing deshabilitado');
      return;
    }

    console.log('🚀 Inicializando servicio de A/B testing...');
    
    // Cargar datos existentes (en producción desde base de datos)
    this.loadExistingData();
    
    // Configurar limpieza automática
    this.scheduleCleanup();
    
    this.isInitialized = true;
    console.log('✅ Servicio de A/B testing inicializado');
  }

  /**
   * Carga datos existentes
   */
  private loadExistingData(): void {
    // En producción se cargarían desde la base de datos
    console.log('📥 Cargando datos existentes de A/B testing...');
  }

  /**
   * Crea un nuevo test A/B
   */
  createTest(testData: {
    name: string;
    description: string;
    type: ABTest['type'];
    hypothesis: string;
    successMetrics: string[];
    trafficSplit?: ABTest['trafficSplit'];
    config?: Partial<ABTest['config']>;
    createdBy: string;
  }): ABTest {
    const testId = this.generateId();
    
    const test: ABTest = {
      id: testId,
      name: testData.name,
      description: testData.description,
      status: 'draft',
      type: testData.type,
      hypothesis: testData.hypothesis,
      successMetrics: testData.successMetrics,
      trafficSplit: testData.trafficSplit || {
        control: 50,
        variantA: 25,
        variantB: 25
      },
      startDate: new Date(),
      createdBy: testData.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        confidenceLevel: this.config.confidenceLevel,
        minimumSampleSize: this.config.minimumSampleSize,
        maxDuration: this.config.maxTestDuration,
        autoStop: this.config.enableAutoStop,
        segments: testData.config?.segments,
        ...testData.config
      }
    };

    this.tests.set(testId, test);
    
    // Crear variantes por defecto
    this.createDefaultVariants(testId);
    
    console.log(`✅ Test A/B creado: ${test.name} (${testId})`);
    return test;
  }

  /**
   * Crea variantes por defecto para un test
   */
  private createDefaultVariants(testId: string): void {
    const test = this.tests.get(testId);
    if (!test) return;

    // Variante de control
    const controlVariant: ABTestVariant = {
      id: this.generateId(),
      testId,
      name: 'Control',
      type: 'control',
      config: {},
      trafficPercentage: test.trafficSplit.control,
      isActive: true
    };

    // Variante A
    const variantA: ABTestVariant = {
      id: this.generateId(),
      testId,
      name: 'Variante A',
      type: 'variant',
      config: {},
      trafficPercentage: test.trafficSplit.variantA,
      isActive: true
    };

    // Variante B
    const variantB: ABTestVariant = {
      id: this.generateId(),
      testId,
      name: 'Variante B',
      type: 'variant',
      config: {},
      trafficPercentage: test.trafficSplit.variantB,
      isActive: true
    };

    this.variants.set(controlVariant.id, controlVariant);
    this.variants.set(variantA.id, variantA);
    this.variants.set(variantB.id, variantB);

    // Si hay variante C, crearla
    if (test.trafficSplit.variantC) {
      const variantC: ABTestVariant = {
        id: this.generateId(),
        testId,
        name: 'Variante C',
        type: 'variant',
        config: {},
        trafficPercentage: test.trafficSplit.variantC,
        isActive: true
      };
      this.variants.set(variantC.id, variantC);
    }
  }

  /**
   * Inicia un test A/B
   */
  startTest(testId: string): void {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} no encontrado`);
    }

    if (test.status !== 'draft') {
      throw new Error(`Test ${testId} no puede ser iniciado desde estado ${test.status}`);
    }

    test.status = 'running';
    test.startDate = new Date();
    test.updatedAt = new Date();

    console.log(`🚀 Test A/B iniciado: ${test.name} (${testId})`);
    this.notifyObservers('testStarted', test);
  }

  /**
   * Pausa un test A/B
   */
  pauseTest(testId: string): void {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} no encontrado`);
    }

    if (test.status !== 'running') {
      throw new Error(`Test ${testId} no puede ser pausado desde estado ${test.status}`);
    }

    test.status = 'paused';
    test.updatedAt = new Date();

    console.log(`⏸️ Test A/B pausado: ${test.name} (${testId})`);
    this.notifyObservers('testPaused', test);
  }

  /**
   * Detiene un test A/B
   */
  stopTest(testId: string, reason?: string): void {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} no encontrado`);
    }

    test.status = 'stopped';
    test.endDate = new Date();
    test.updatedAt = new Date();

    console.log(`⏹️ Test A/B detenido: ${test.name} (${testId}) - Razón: ${reason || 'Manual'}`);
    this.notifyObservers('testStopped', { test, reason });
  }

  /**
   * Completa un test A/B
   */
  completeTest(testId: string): void {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} no encontrado`);
    }

    test.status = 'completed';
    test.endDate = new Date();
    test.updatedAt = new Date();

    console.log(`✅ Test A/B completado: ${test.name} (${testId})`);
    this.notifyObservers('testCompleted', test);
  }

  /**
   * Asigna un participante a una variante
   */
  assignParticipant(
    testId: string,
    sessionId: string,
    userId?: string,
    metadata?: Record<string, any>
  ): ABTestParticipant {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      throw new Error(`Test ${testId} no está ejecutándose`);
    }

    // Verificar si el participante ya existe
    const existingParticipant = Array.from(this.participants.values())
      .find(p => p.testId === testId && 
        (p.userId === userId || p.sessionId === sessionId));

    if (existingParticipant) {
      return existingParticipant;
    }

    // Seleccionar variante basada en el split de tráfico
    const variantId = this.selectVariant(testId, sessionId, userId);
    
    const participant: ABTestParticipant = {
      id: this.generateId(),
      testId,
      userId,
      sessionId,
      variantId,
      assignedAt: new Date(),
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
      events: [],
      metadata
    };

    this.participants.set(participant.id, participant);
    
    console.log(`👤 Participante asignado: ${participant.id} -> Variante ${variantId}`);
    return participant;
  }

  /**
   * Selecciona una variante para un participante
   */
  private selectVariant(testId: string, sessionId: string, userId?: string): string {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test ${testId} no encontrado`);

    // Obtener variantes activas
    const activeVariants = Array.from(this.variants.values())
      .filter(v => v.testId === testId && v.isActive)
      .sort((a, b) => b.trafficPercentage - a.trafficPercentage);

    if (activeVariants.length === 0) {
      throw new Error(`No hay variantes activas para el test ${testId}`);
    }

    // Generar hash determinístico para asignación consistente
    const hash = this.hashString(userId || sessionId);
    const normalizedHash = hash % 100;

    // Asignar basado en porcentajes de tráfico
    let cumulativePercentage = 0;
    for (const variant of activeVariants) {
      cumulativePercentage += variant.trafficPercentage;
      if (normalizedHash < cumulativePercentage) {
        return variant.id;
      }
    }

    // Fallback a la primera variante
    return activeVariants[0].id;
  }

  /**
   * Registra un evento para un participante
   */
  recordEvent(
    participantId: string,
    eventType: string,
    eventName: string,
    value?: number,
    properties?: Record<string, any>
  ): ABTestEvent {
    const participant = this.participants.get(participantId);
    if (!participant) {
      throw new Error(`Participante ${participantId} no encontrado`);
    }

    const event: ABTestEvent = {
      id: this.generateId(),
      participantId,
      testId: participant.testId,
      variantId: participant.variantId,
      eventType,
      eventName,
      timestamp: new Date(),
      value,
      properties
    };

    this.events.push(event);
    participant.events.push(event);
    participant.lastSeenAt = new Date();

    // Verificar si el test debe detenerse automáticamente
    if (this.config.enableAutoStop) {
      this.checkAutoStop(participant.testId);
    }

    this.notifyObservers('eventRecorded', event);
    return event;
  }

  /**
   * Verifica si un test debe detenerse automáticamente
   */
  private checkAutoStop(testId: string): void {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') return;

    const analysis = this.analyzeTest(testId);
    
    // Detener si hay un ganador claro
    if (analysis.winner && analysis.confidence >= test.config.confidenceLevel) {
      this.stopTest(testId, 'Ganador estadísticamente significativo encontrado');
    }

    // Detener si se alcanzó la duración máxima
    const daysRunning = (Date.now() - test.startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysRunning >= test.config.maxDuration) {
      this.stopTest(testId, 'Duración máxima alcanzada');
    }
  }

  /**
   * Analiza un test A/B
   */
  analyzeTest(testId: string): ABTestAnalysis {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} no encontrado`);
    }

    const testVariants = Array.from(this.variants.values())
      .filter(v => v.testId === testId);

    const testParticipants = Array.from(this.participants.values())
      .filter(p => p.testId === testId);

    const testEvents = this.events.filter(e => e.testId === testId);

    // Calcular resultados por variante
    const results: ABTestResult[] = testVariants.map(variant => {
      const variantParticipants = testParticipants.filter(p => p.variantId === variant.id);
      const variantEvents = testEvents.filter(e => e.variantId === variant.id);
      
      return this.calculateVariantResult(variant, variantParticipants, variantEvents, test);
    });

    // Encontrar ganador
    const winner = this.determineWinner(results, test);

    // Calcular confianza general
    const confidence = this.calculateOverallConfidence(results);

    // Calcular poder estadístico
    const statisticalPower = this.calculateStatisticalPower(results, test);

    // Generar recomendaciones
    const recommendations = this.generateRecommendations(results, test);

    // Generar insights
    const insights = this.generateInsights(results, test);

    return {
      testId,
      testName: test.name,
      status: test.status,
      startDate: test.startDate,
      endDate: test.endDate,
      totalParticipants: testParticipants.length,
      totalEvents: testEvents.length,
      results,
      winner,
      confidence,
      statisticalPower,
      recommendations,
      insights
    };
  }

  /**
   * Calcula el resultado de una variante
   */
  private calculateVariantResult(
    variant: ABTestVariant,
    participants: ABTestParticipant[],
    events: ABTestEvent[],
    test: ABTest
  ): ABTestResult {
    const sampleSize = participants.length;
    
    // Calcular tasa de conversión (eventos de éxito)
    const conversionEvents = events.filter(e => 
      test.successMetrics.includes(e.eventName)
    );
    const conversionCount = conversionEvents.length;
    const conversionRate = sampleSize > 0 ? conversionCount / sampleSize : 0;

    // Calcular valor promedio
    const values = events
      .filter(e => e.value !== undefined)
      .map(e => e.value!);
    const averageValue = values.length > 0 
      ? values.reduce((sum, val) => sum + val, 0) / values.length 
      : 0;
    const totalValue = values.reduce((sum, val) => sum + val, 0);

    // Calcular error estándar
    const standardError = this.calculateStandardError(conversionRate, sampleSize);

    // Calcular intervalo de confianza
    const confidenceInterval = this.calculateConfidenceInterval(
      conversionRate,
      standardError,
      test.config.confidenceLevel
    );

    // Calcular p-value (simplificado)
    const pValue = this.calculatePValue(conversionRate, standardError);

    // Determinar significancia
    const isSignificant = pValue < (1 - test.config.confidenceLevel);

    // Calcular lift vs control
    const controlResult = this.getControlResult(test.id);
    const lift = controlResult ? conversionRate - controlResult.conversionRate : 0;
    const relativeLift = controlResult && controlResult.conversionRate > 0
      ? (lift / controlResult.conversionRate) * 100
      : 0;

    return {
      testId: test.id,
      variantId: variant.id,
      variantName: variant.name,
      sampleSize,
      conversionRate,
      conversionCount,
      averageValue,
      totalValue,
      standardError,
      confidenceInterval,
      pValue,
      isSignificant,
      lift,
      relativeLift
    };
  }

  /**
   * Obtiene el resultado de la variante de control
   */
  private getControlResult(testId: string): ABTestResult | null {
    const controlVariant = Array.from(this.variants.values())
      .find(v => v.testId === testId && v.type === 'control');
    
    if (!controlVariant) return null;

    const controlParticipants = Array.from(this.participants.values())
      .filter(p => p.testId === testId && p.variantId === controlVariant.id);
    
    const controlEvents = this.events.filter(e => 
      e.testId === testId && e.variantId === controlVariant.id
    );

    const test = this.tests.get(testId);
    if (!test) return null;

    return this.calculateVariantResult(controlVariant, controlParticipants, controlEvents, test);
  }

  /**
   * Calcula el error estándar
   */
  private calculateStandardError(conversionRate: number, sampleSize: number): number {
    if (sampleSize === 0) return 0;
    return Math.sqrt((conversionRate * (1 - conversionRate)) / sampleSize);
  }

  /**
   * Calcula el intervalo de confianza
   */
  private calculateConfidenceInterval(
    conversionRate: number,
    standardError: number,
    confidenceLevel: number
  ): { lower: number; upper: number } {
    const zScore = this.getZScore(confidenceLevel);
    const margin = zScore * standardError;
    
    return {
      lower: Math.max(0, conversionRate - margin),
      upper: Math.min(1, conversionRate + margin)
    };
  }

  /**
   * Obtiene el Z-score para un nivel de confianza
   */
  private getZScore(confidenceLevel: number): number {
    const zScores: Record<number, number> = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };
    return zScores[confidenceLevel] || 1.96;
  }

  /**
   * Calcula el p-value (simplificado)
   */
  private calculatePValue(conversionRate: number, standardError: number): number {
    // Implementación simplificada - en producción se usaría una librería estadística
    if (standardError === 0) return 1;
    return Math.exp(-Math.abs(conversionRate) / standardError);
  }

  /**
   * Determina el ganador del test
   */
  private determineWinner(results: ABTestResult[], test: ABTest): string | undefined {
    const significantResults = results.filter(r => r.isSignificant);
    
    if (significantResults.length === 0) return undefined;

    // Encontrar el resultado con mayor lift
    const winner = significantResults.reduce((best, current) => 
      current.lift > best.lift ? current : best
    );

    return winner.variantId;
  }

  /**
   * Calcula la confianza general
   */
  private calculateOverallConfidence(results: ABTestResult[]): number {
    const significantResults = results.filter(r => r.isSignificant);
    return significantResults.length / results.length;
  }

  /**
   * Calcula el poder estadístico
   */
  private calculateStatisticalPower(results: ABTestResult[], test: ABTest): number {
    // Implementación simplificada - en producción se usaría una librería estadística
    const totalSampleSize = results.reduce((sum, r) => sum + r.sampleSize, 0);
    const minimumSampleSize = test.config.minimumSampleSize;
    
    return Math.min(1, totalSampleSize / minimumSampleSize);
  }

  /**
   * Genera recomendaciones
   */
  private generateRecommendations(results: ABTestResult[], test: ABTest): string[] {
    const recommendations: string[] = [];

    const totalSampleSize = results.reduce((sum, r) => sum + r.sampleSize, 0);
    if (totalSampleSize < test.config.minimumSampleSize) {
      recommendations.push('Continuar el test hasta alcanzar el tamaño mínimo de muestra');
    }

    const significantResults = results.filter(r => r.isSignificant);
    if (significantResults.length > 0) {
      recommendations.push('Considerar implementar la variante ganadora');
    }

    const daysRunning = (Date.now() - test.startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysRunning >= test.config.maxDuration * 0.8) {
      recommendations.push('El test se acerca a su duración máxima');
    }

    return recommendations;
  }

  /**
   * Genera insights
   */
  private generateInsights(results: ABTestResult[], test: ABTest): Array<{
    type: 'positive' | 'negative' | 'neutral';
    message: string;
    impact: 'high' | 'medium' | 'low';
  }> {
    const insights: Array<{
      type: 'positive' | 'negative' | 'neutral';
      message: string;
      impact: 'high' | 'medium' | 'low';
    }> = [];

    const controlResult = results.find(r => 
      this.variants.get(r.variantId)?.type === 'control'
    );

    if (controlResult) {
      results.forEach(result => {
        if (result.variantId !== controlResult.variantId) {
          const variant = this.variants.get(result.variantId);
          if (variant && result.lift > 0.05) {
            insights.push({
              type: 'positive',
              message: `${variant.name} muestra una mejora del ${(result.relativeLift).toFixed(1)}%`,
              impact: result.relativeLift > 20 ? 'high' : result.relativeLift > 10 ? 'medium' : 'low'
            });
          } else if (variant && result.lift < -0.05) {
            insights.push({
              type: 'negative',
              message: `${variant.name} muestra una disminución del ${Math.abs(result.relativeLift).toFixed(1)}%`,
              impact: Math.abs(result.relativeLift) > 20 ? 'high' : Math.abs(result.relativeLift) > 10 ? 'medium' : 'low'
            });
          }
        }
      });
    }

    return insights;
  }

  /**
   * Crea un segmento de usuarios
   */
  createSegment(segmentData: {
    name: string;
    description: string;
    criteria: ABTestSegment['criteria'];
  }): ABTestSegment {
    const segment: ABTestSegment = {
      id: this.generateId(),
      name: segmentData.name,
      description: segmentData.description,
      criteria: segmentData.criteria,
      isActive: true,
      createdAt: new Date()
    };

    this.segments.set(segment.id, segment);
    console.log(`✅ Segmento creado: ${segment.name} (${segment.id})`);
    return segment;
  }

  /**
   * Verifica si un usuario pertenece a un segmento
   */
  isUserInSegment(userId: string, segmentId: string, userData: Record<string, any>): boolean {
    const segment = this.segments.get(segmentId);
    if (!segment || !segment.isActive) return false;

    return segment.criteria.every(criterion => {
      const value = userData[criterion.field];
      
      switch (criterion.operator) {
        case 'equals':
          return value === criterion.value;
        case 'contains':
          return String(value).includes(String(criterion.value));
        case 'greater_than':
          return Number(value) > Number(criterion.value);
        case 'less_than':
          return Number(value) < Number(criterion.value);
        case 'in':
          return Array.isArray(criterion.value) && criterion.value.includes(value);
        case 'not_in':
          return Array.isArray(criterion.value) && !criterion.value.includes(value);
        default:
          return false;
      }
    });
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): {
    isInitialized: boolean;
    isEnabled: boolean;
    activeTestsCount: number;
    totalTestsCount: number;
    totalParticipantsCount: number;
    totalEventsCount: number;
  } {
    const activeTests = Array.from(this.tests.values()).filter(t => t.status === 'running');
    
    return {
      isInitialized: this.isInitialized,
      isEnabled: this.config.enabled,
      activeTestsCount: activeTests.length,
      totalTestsCount: this.tests.size,
      totalParticipantsCount: this.participants.size,
      totalEventsCount: this.events.length
    };
  }

  /**
   * Obtiene todos los tests
   */
  getTests(): ABTest[] {
    return Array.from(this.tests.values());
  }

  /**
   * Obtiene un test específico
   */
  getTest(testId: string): ABTest | undefined {
    return this.tests.get(testId);
  }

  /**
   * Obtiene las variantes de un test
   */
  getTestVariants(testId: string): ABTestVariant[] {
    return Array.from(this.variants.values()).filter(v => v.testId === testId);
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<ABTestConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de A/B testing actualizada');
  }

  /**
   * Programa limpieza automática
   */
  private scheduleCleanup(): void {
    // Limpiar datos antiguos cada día
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Limpia datos antiguos
   */
  cleanupOldData(maxAge?: number): void {
    const cutoff = maxAge || (90 * 24 * 60 * 60 * 1000); // 90 días por defecto
    const now = Date.now();
    
    // Limpiar eventos antiguos
    this.events = this.events.filter(e => (now - e.timestamp.getTime()) < cutoff);
    
    // Limpiar participantes inactivos
    const activeParticipants = Array.from(this.participants.values())
      .filter(p => (now - p.lastSeenAt.getTime()) < cutoff);
    
    this.participants.clear();
    activeParticipants.forEach(p => this.participants.set(p.id, p));
    
    console.log(`🧹 Limpieza de datos de A/B testing completada. ${this.events.length} eventos, ${this.participants.size} participantes restantes`);
  }

  /**
   * Limpia todos los recursos
   */
  async cleanup(): Promise<void> {
    this.tests.clear();
    this.variants.clear();
    this.participants.clear();
    this.events = [];
    this.segments.clear();
    this.observers.clear();

    console.log('🧹 Servicio de A/B testing limpiado');
  }

  // Métodos auxiliares
  private generateId(): string {
    return `abtest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private notifyObservers(event: string, data: any): void {
    console.log(`🧪 Evento de A/B testing: ${event}`, data);
  }
}

// Instancia singleton del servicio
export const abTestingService = new ABTestingService();

// Exportar el servicio como default
export default abTestingService;
