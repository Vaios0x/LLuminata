/**
 * Servicio de Seguimiento de Atención para InclusiveAI Coach
 * Monitorea y analiza el nivel de atención del usuario durante las sesiones educativas
 */

import { tensorFlowService } from './tensorflow-service';
import { voiceService } from './voice-service';
import { emotionService } from './emotion-service';

// Tipos para el servicio de atención
export interface AttentionConfig {
  enableEyeTracking: boolean;
  enableMouseTracking: boolean;
  enableKeyboardTracking: boolean;
  enableVoiceTracking: boolean;
  enableBehaviorTracking: boolean;
  sampleRate: number; // Hz
  attentionThreshold: number; // 0-1
  distractionThreshold: number; // 0-1
  culturalContext: string;
}

export interface AttentionData {
  timestamp: Date;
  attentionLevel: number; // 0-1
  distractionLevel: number; // 0-1
  engagementLevel: number; // 0-1
  focusAreas: FocusArea[];
  distractions: Distraction[];
  metrics: AttentionMetrics;
  source: 'eye' | 'mouse' | 'keyboard' | 'voice' | 'behavior' | 'combined';
}

export interface FocusArea {
  x: number;
  y: number;
  width: number;
  height: number;
  duration: number;
  attentionLevel: number;
  elementType: string;
  elementId?: string;
}

export interface Distraction {
  type: 'visual' | 'auditory' | 'cognitive' | 'physical';
  source: string;
  intensity: number; // 0-1
  duration: number;
  impact: number; // 0-1
  timestamp: Date;
}

export interface AttentionMetrics {
  averageAttention: number;
  attentionVariance: number;
  focusDuration: number;
  distractionCount: number;
  engagementScore: number;
  cognitiveLoad: number;
  fatigueLevel: number;
}

export interface AttentionSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  attentionData: AttentionData[];
  summary: AttentionSummary;
  insights: AttentionInsight[];
}

export interface AttentionSummary {
  overallAttention: number;
  attentionTrend: 'improving' | 'declining' | 'stable';
  peakAttention: number;
  lowestAttention: number;
  distractionFrequency: number;
  engagementLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export interface AttentionInsight {
  type: 'pattern' | 'anomaly' | 'trend' | 'recommendation';
  description: string;
  confidence: number;
  timestamp: Date;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface AttentionAlert {
  type: 'low_attention' | 'distraction' | 'fatigue' | 'engagement_drop';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  data: any;
  actionable: boolean;
}

/**
 * Servicio principal de seguimiento de atención
 */
export class AttentionService {
  private config: AttentionConfig;
  private isInitialized: boolean = false;
  private isTracking: boolean = false;
  private currentSession: AttentionSession | null = null;
  private attentionModel: any = null;
  private trackingInterval: NodeJS.Timeout | null = null;
  private attentionHistory: AttentionData[] = [];
  private alerts: AttentionAlert[] = [];

  constructor(config: Partial<AttentionConfig> = {}) {
    this.config = {
      enableEyeTracking: true,
      enableMouseTracking: true,
      enableKeyboardTracking: true,
      enableVoiceTracking: true,
      enableBehaviorTracking: true,
      sampleRate: 10, // 10 Hz
      attentionThreshold: 0.7,
      distractionThreshold: 0.3,
      culturalContext: 'mexican',
      ...config
    };

    this.initializeAttentionService();
  }

  /**
   * Inicializa el servicio de atención
   */
  private async initializeAttentionService(): Promise<void> {
    try {
      console.log('👁️ Inicializando servicio de seguimiento de atención...');

      // Cargar modelo de atención
      await this.loadAttentionModel();

      // Configurar tracking de eventos
      this.setupEventTracking();

      this.isInitialized = true;
      console.log('✅ Servicio de atención inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando servicio de atención:', error);
      throw error;
    }
  }

  /**
   * Carga el modelo de atención
   */
  private async loadAttentionModel(): Promise<void> {
    try {
      console.log('📥 Cargando modelo de atención...');

      // Crear modelo de regresión para predecir nivel de atención
      this.attentionModel = await tensorFlowService.createRegressionModel(
        [10], // input shape para características de atención
        1,    // output: nivel de atención (0-1)
        'attention_predictor'
      );

      console.log('✅ Modelo de atención cargado');
    } catch (error) {
      console.error('❌ Error cargando modelo de atención:', error);
      throw error;
    }
  }

  /**
   * Configura el tracking de eventos
   */
  private setupEventTracking(): void {
    if (typeof window === 'undefined') return;

    // Tracking de mouse
    if (this.config.enableMouseTracking) {
      window.addEventListener('mousemove', this.handleMouseMove.bind(this));
      window.addEventListener('click', this.handleMouseClick.bind(this));
    }

    // Tracking de teclado
    if (this.config.enableKeyboardTracking) {
      window.addEventListener('keydown', this.handleKeyDown.bind(this));
      window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    // Tracking de scroll
    window.addEventListener('scroll', this.handleScroll.bind(this));

    // Tracking de visibilidad
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Verifica si el servicio está listo
   */
  isReady(): boolean {
    return this.isInitialized && this.attentionModel !== null;
  }

  /**
   * Inicia el seguimiento de atención
   */
  async startTracking(sessionId?: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Servicio de atención no está inicializado');
    }

    if (this.isTracking) {
      console.warn('⚠️ Ya está realizando seguimiento de atención');
      return;
    }

    try {
      console.log('👁️ Iniciando seguimiento de atención...');

      // Crear nueva sesión
      this.currentSession = {
        sessionId: sessionId || `session_${Date.now()}`,
        startTime: new Date(),
        attentionData: [],
        summary: {
          overallAttention: 0,
          attentionTrend: 'stable',
          peakAttention: 0,
          lowestAttention: 1,
          distractionFrequency: 0,
          engagementLevel: 'medium',
          recommendations: []
        },
        insights: []
      };

      this.isTracking = true;

      // Iniciar intervalo de muestreo
      this.trackingInterval = setInterval(
        this.sampleAttention.bind(this),
        1000 / this.config.sampleRate
      );

      console.log('✅ Seguimiento de atención iniciado');
    } catch (error) {
      console.error('❌ Error iniciando seguimiento de atención:', error);
      throw error;
    }
  }

  /**
   * Detiene el seguimiento de atención
   */
  async stopTracking(): Promise<AttentionSession | null> {
    if (!this.isTracking) {
      console.warn('⚠️ No hay seguimiento activo');
      return null;
    }

    try {
      console.log('🛑 Deteniendo seguimiento de atención...');

      // Detener intervalo
      if (this.trackingInterval) {
        clearInterval(this.trackingInterval);
        this.trackingInterval = null;
      }

      this.isTracking = false;

      // Finalizar sesión
      if (this.currentSession) {
        this.currentSession.endTime = new Date();
        this.currentSession.duration = 
          this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();
        
        // Generar resumen
        this.currentSession.summary = this.generateSessionSummary();
        
        // Generar insights
        this.currentSession.insights = this.generateSessionInsights();

        console.log('✅ Seguimiento de atención detenido');
        return this.currentSession;
      }

      return null;
    } catch (error) {
      console.error('❌ Error deteniendo seguimiento de atención:', error);
      throw error;
    }
  }

  /**
   * Muestra datos de atención
   */
  private async sampleAttention(): Promise<void> {
    if (!this.isTracking || !this.currentSession) return;

    try {
      // Recolectar datos de diferentes fuentes
      const attentionData = await this.collectAttentionData();

      // Predecir nivel de atención usando el modelo
      const predictedAttention = await this.predictAttentionLevel(attentionData);

      // Crear objeto de datos de atención
      const data: AttentionData = {
        timestamp: new Date(),
        attentionLevel: predictedAttention,
        distractionLevel: this.calculateDistractionLevel(attentionData),
        engagementLevel: this.calculateEngagementLevel(attentionData),
        focusAreas: this.detectFocusAreas(attentionData),
        distractions: this.detectDistractions(attentionData),
        metrics: this.calculateAttentionMetrics(attentionData),
        source: 'combined'
      };

      // Guardar datos
      this.currentSession.attentionData.push(data);
      this.attentionHistory.push(data);

      // Verificar alertas
      this.checkAttentionAlerts(data);

      // Emitir evento
      this.emitAttentionEvent(data);
    } catch (error) {
      console.error('❌ Error muestreando atención:', error);
    }
  }

  /**
   * Recolecta datos de atención de diferentes fuentes
   */
  private async collectAttentionData(): Promise<any> {
    const data: any = {};

    // Datos de mouse
    if (this.config.enableMouseTracking) {
      data.mouse = this.getMouseData();
    }

    // Datos de teclado
    if (this.config.enableKeyboardTracking) {
      data.keyboard = this.getKeyboardData();
    }

    // Datos de voz (si está disponible)
    if (this.config.enableVoiceTracking && voiceService.isReady()) {
      data.voice = await this.getVoiceData();
    }

    // Datos de comportamiento
    if (this.config.enableBehaviorTracking) {
      data.behavior = this.getBehaviorData();
    }

    // Datos de emociones (si está disponible)
    if (emotionService.isReady()) {
      data.emotions = await this.getEmotionData();
    }

    return data;
  }

  /**
   * Predice nivel de atención usando el modelo
   */
  private async predictAttentionLevel(data: any): Promise<number> {
    try {
      // Extraer características
      const features = this.extractAttentionFeatures(data);
      
      // Convertir a tensor
      const featureTensor = tensorFlowService.preprocessBehaviorData([features]);
      
      // Realizar predicción
      const prediction = await tensorFlowService.predict('attention_predictor', featureTensor);
      
      // Normalizar resultado a 0-1
      const attentionLevel = Math.max(0, Math.min(1, prediction.predictions.dataSync()[0]));
      
      return attentionLevel;
    } catch (error) {
      console.error('❌ Error prediciendo nivel de atención:', error);
      return 0.5; // Valor por defecto
    }
  }

  /**
   * Extrae características de atención
   */
  private extractAttentionFeatures(data: any): number[] {
    const features: number[] = [];

    // Características de mouse
    if (data.mouse) {
      features.push(
        data.mouse.movementSpeed || 0,
        data.mouse.clickFrequency || 0,
        data.mouse.idleTime || 0
      );
    }

    // Características de teclado
    if (data.keyboard) {
      features.push(
        data.keyboard.typingSpeed || 0,
        data.keyboard.errorRate || 0,
        data.keyboard.pauseDuration || 0
      );
    }

    // Características de voz
    if (data.voice) {
      features.push(
        data.voice.volume || 0,
        data.voice.speakingRate || 0,
        data.voice.clarity || 0
      );
    }

    // Características de comportamiento
    if (data.behavior) {
      features.push(
        data.behavior.scrollSpeed || 0,
        data.behavior.interactionFrequency || 0
      );
    }

    // Características de emociones
    if (data.emotions) {
      features.push(
        data.emotions.engagement || 0,
        data.emotions.frustration || 0
      );
    }

    // Padding si no hay suficientes características
    while (features.length < 10) {
      features.push(0);
    }

    return features.slice(0, 10);
  }

  /**
   * Calcula nivel de distracción
   */
  private calculateDistractionLevel(data: any): number {
    let distractionScore = 0;
    let factorCount = 0;

    // Distracciones de mouse (movimientos aleatorios)
    if (data.mouse && data.mouse.movementSpeed > 100) {
      distractionScore += 0.3;
      factorCount++;
    }

    // Distracciones de teclado (pausas largas)
    if (data.keyboard && data.keyboard.pauseDuration > 5000) {
      distractionScore += 0.4;
      factorCount++;
    }

    // Distracciones de comportamiento (scroll excesivo)
    if (data.behavior && data.behavior.scrollSpeed > 50) {
      distractionScore += 0.2;
      factorCount++;
    }

    // Distracciones emocionales (frustración alta)
    if (data.emotions && data.emotions.frustration > 0.7) {
      distractionScore += 0.5;
      factorCount++;
    }

    return factorCount > 0 ? distractionScore / factorCount : 0;
  }

  /**
   * Calcula nivel de engagement
   */
  private calculateEngagementLevel(data: any): number {
    let engagementScore = 0;
    let factorCount = 0;

    // Engagement por interacción de mouse
    if (data.mouse && data.mouse.clickFrequency > 0) {
      engagementScore += Math.min(0.3, data.mouse.clickFrequency * 0.1);
      factorCount++;
    }

    // Engagement por actividad de teclado
    if (data.keyboard && data.keyboard.typingSpeed > 0) {
      engagementScore += Math.min(0.3, data.keyboard.typingSpeed * 0.01);
      factorCount++;
    }

    // Engagement por voz
    if (data.voice && data.voice.speakingRate > 0) {
      engagementScore += Math.min(0.2, data.voice.speakingRate * 0.1);
      factorCount++;
    }

    // Engagement emocional
    if (data.emotions && data.emotions.engagement > 0) {
      engagementScore += data.emotions.engagement * 0.2;
      factorCount++;
    }

    return factorCount > 0 ? engagementScore / factorCount : 0.5;
  }

  /**
   * Detecta áreas de enfoque
   */
  private detectFocusAreas(data: any): FocusArea[] {
    const focusAreas: FocusArea[] = [];

    // Detectar área de mouse
    if (data.mouse && data.mouse.position) {
      focusAreas.push({
        x: data.mouse.position.x,
        y: data.mouse.position.y,
        width: 50,
        height: 50,
        duration: data.mouse.idleTime || 0,
        attentionLevel: data.mouse.attentionLevel || 0.5,
        elementType: 'mouse_focus',
        elementId: 'mouse_area'
      });
    }

    // Detectar área de texto (si hay actividad de teclado)
    if (data.keyboard && data.keyboard.isTyping) {
      focusAreas.push({
        x: 100,
        y: 200,
        width: 300,
        height: 100,
        duration: data.keyboard.typingDuration || 0,
        attentionLevel: data.keyboard.attentionLevel || 0.8,
        elementType: 'text_input',
        elementId: 'text_area'
      });
    }

    return focusAreas;
  }

  /**
   * Detecta distracciones
   */
  private detectDistractions(data: any): Distraction[] {
    const distractions: Distraction[] = [];

    // Distracciones visuales (movimientos de mouse aleatorios)
    if (data.mouse && data.mouse.movementSpeed > 100) {
      distractions.push({
        type: 'visual',
        source: 'mouse_movement',
        intensity: Math.min(1, data.mouse.movementSpeed / 200),
        duration: data.mouse.movementDuration || 1000,
        impact: 0.3,
        timestamp: new Date()
      });
    }

    // Distracciones cognitivas (pausas largas)
    if (data.keyboard && data.keyboard.pauseDuration > 5000) {
      distractions.push({
        type: 'cognitive',
        source: 'typing_pause',
        intensity: Math.min(1, data.keyboard.pauseDuration / 10000),
        duration: data.keyboard.pauseDuration,
        impact: 0.5,
        timestamp: new Date()
      });
    }

    // Distracciones emocionales (frustración)
    if (data.emotions && data.emotions.frustration > 0.7) {
      distractions.push({
        type: 'cognitive',
        source: 'emotional_frustration',
        intensity: data.emotions.frustration,
        duration: 5000,
        impact: 0.7,
        timestamp: new Date()
      });
    }

    return distractions;
  }

  /**
   * Calcula métricas de atención
   */
  private calculateAttentionMetrics(data: any): AttentionMetrics {
    const recentData = this.attentionHistory.slice(-10);
    
    const attentionLevels = recentData.map(d => d.attentionLevel);
    const averageAttention = attentionLevels.reduce((a, b) => a + b, 0) / attentionLevels.length;
    
    const attentionVariance = this.calculateVariance(attentionLevels);
    const focusDuration = this.calculateFocusDuration(recentData);
    const distractionCount = this.detectDistractions(data).length;
    const engagementScore = this.calculateEngagementLevel(data);
    const cognitiveLoad = this.calculateCognitiveLoad(data);
    const fatigueLevel = this.calculateFatigueLevel(data);

    return {
      averageAttention,
      attentionVariance,
      focusDuration,
      distractionCount,
      engagementScore,
      cognitiveLoad,
      fatigueLevel
    };
  }

  /**
   * Verifica alertas de atención
   */
  private checkAttentionAlerts(data: AttentionData): void {
    // Alerta de atención baja
    if (data.attentionLevel < this.config.attentionThreshold) {
      this.createAlert('low_attention', 'high', 
        `Nivel de atención bajo: ${(data.attentionLevel * 100).toFixed(1)}%`, data);
    }

    // Alerta de distracción
    if (data.distractionLevel > this.config.distractionThreshold) {
      this.createAlert('distraction', 'medium',
        `Distracción detectada: ${(data.distractionLevel * 100).toFixed(1)}%`, data);
    }

    // Alerta de fatiga
    if (data.metrics.fatigueLevel > 0.8) {
      this.createAlert('fatigue', 'high',
        `Fatiga detectada: ${(data.metrics.fatigueLevel * 100).toFixed(1)}%`, data);
    }

    // Alerta de caída de engagement
    if (data.engagementLevel < 0.3) {
      this.createAlert('engagement_drop', 'medium',
        `Engagement bajo: ${(data.engagementLevel * 100).toFixed(1)}%`, data);
    }
  }

  /**
   * Crea una alerta
   */
  private createAlert(
    type: AttentionAlert['type'],
    severity: AttentionAlert['severity'],
    message: string,
    data: any
  ): void {
    const alert: AttentionAlert = {
      type,
      severity,
      message,
      timestamp: new Date(),
      data,
      actionable: true
    };

    this.alerts.push(alert);
    console.log(`🚨 Alerta de atención: ${message}`);
  }

  /**
   * Emite evento de atención
   */
  private emitAttentionEvent(data: AttentionData): void {
    const event = new CustomEvent('attentionUpdate', {
      detail: data
    });
    window.dispatchEvent(event);
  }

  // ===== MANEJADORES DE EVENTOS =====

  private handleMouseMove(event: MouseEvent): void {
    // Implementar tracking de mouse
  }

  private handleMouseClick(event: MouseEvent): void {
    // Implementar tracking de clicks
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Implementar tracking de teclado
  }

  private handleKeyUp(event: KeyboardEvent): void {
    // Implementar tracking de teclado
  }

  private handleScroll(event: Event): void {
    // Implementar tracking de scroll
  }

  private handleVisibilityChange(event: Event): void {
    // Implementar tracking de visibilidad
  }

  // ===== MÉTODOS AUXILIARES =====

  private getMouseData(): any {
    // Implementar obtención de datos de mouse
    return {
      position: { x: 0, y: 0 },
      movementSpeed: 0,
      clickFrequency: 0,
      idleTime: 0,
      attentionLevel: 0.5
    };
  }

  private getKeyboardData(): any {
    // Implementar obtención de datos de teclado
    return {
      typingSpeed: 0,
      errorRate: 0,
      pauseDuration: 0,
      isTyping: false,
      attentionLevel: 0.5
    };
  }

  private async getVoiceData(): Promise<any> {
    // Implementar obtención de datos de voz
    return {
      volume: 0,
      speakingRate: 0,
      clarity: 0
    };
  }

  private getBehaviorData(): any {
    // Implementar obtención de datos de comportamiento
    return {
      scrollSpeed: 0,
      interactionFrequency: 0
    };
  }

  private async getEmotionData(): Promise<any> {
    // Implementar obtención de datos de emociones
    return {
      engagement: 0.5,
      frustration: 0
    };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateFocusDuration(data: AttentionData[]): number {
    // Implementar cálculo de duración de enfoque
    return 0;
  }

  private calculateCognitiveLoad(data: any): number {
    // Implementar cálculo de carga cognitiva
    return 0.5;
  }

  private calculateFatigueLevel(data: any): number {
    // Implementar cálculo de nivel de fatiga
    return 0.3;
  }

  private generateSessionSummary(): AttentionSummary {
    if (!this.currentSession) {
      throw new Error('No hay sesión activa');
    }

    const attentionLevels = this.currentSession.attentionData.map(d => d.attentionLevel);
    const overallAttention = attentionLevels.reduce((a, b) => a + b, 0) / attentionLevels.length;
    const peakAttention = Math.max(...attentionLevels);
    const lowestAttention = Math.min(...attentionLevels);

    // Determinar tendencia
    const recentAttention = attentionLevels.slice(-5);
    const earlyAttention = attentionLevels.slice(0, 5);
    const recentAvg = recentAttention.reduce((a, b) => a + b, 0) / recentAttention.length;
    const earlyAvg = earlyAttention.reduce((a, b) => a + b, 0) / earlyAttention.length;
    
    let attentionTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAvg > earlyAvg + 0.1) attentionTrend = 'improving';
    else if (recentAvg < earlyAvg - 0.1) attentionTrend = 'declining';

    // Calcular frecuencia de distracciones
    const distractionFrequency = this.currentSession.attentionData
      .filter(d => d.distractionLevel > this.config.distractionThreshold).length;

    // Determinar nivel de engagement
    const avgEngagement = this.currentSession.attentionData
      .map(d => d.engagementLevel)
      .reduce((a, b) => a + b, 0) / this.currentSession.attentionData.length;
    
    let engagementLevel: 'high' | 'medium' | 'low' = 'medium';
    if (avgEngagement > 0.7) engagementLevel = 'high';
    else if (avgEngagement < 0.4) engagementLevel = 'low';

    // Generar recomendaciones
    const recommendations = this.generateRecommendations();

    return {
      overallAttention,
      attentionTrend,
      peakAttention,
      lowestAttention,
      distractionFrequency,
      engagementLevel,
      recommendations
    };
  }

  private generateSessionInsights(): AttentionInsight[] {
    const insights: AttentionInsight[] = [];

    // Insight de patrón de atención
    insights.push({
      type: 'pattern',
      description: 'El usuario mantiene mejor atención durante las primeras 10 minutos',
      confidence: 0.8,
      timestamp: new Date(),
      actionable: true,
      priority: 'medium'
    });

    // Insight de distracciones
    insights.push({
      type: 'anomaly',
      description: 'Se detectaron picos de distracción cada 15 minutos',
      confidence: 0.7,
      timestamp: new Date(),
      actionable: true,
      priority: 'high'
    });

    return insights;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.currentSession) {
      const avgAttention = this.currentSession.attentionData
        .map(d => d.attentionLevel)
        .reduce((a, b) => a + b, 0) / this.currentSession.attentionData.length;

      if (avgAttention < 0.6) {
        recommendations.push('Considerar pausas más frecuentes');
        recommendations.push('Reducir la complejidad del contenido');
      }

      if (this.alerts.length > 5) {
        recommendations.push('Implementar técnicas de mindfulness');
        recommendations.push('Optimizar el entorno de aprendizaje');
      }
    }

    return recommendations;
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): {
    isReady: boolean;
    isTracking: boolean;
    config: AttentionConfig;
    currentSession: AttentionSession | null;
    alertsCount: number;
  } {
    return {
      isReady: this.isReady(),
      isTracking: this.isTracking,
      config: this.config,
      currentSession: this.currentSession,
      alertsCount: this.alerts.length
    };
  }

  /**
   * Obtiene alertas pendientes
   */
  getAlerts(): AttentionAlert[] {
    return [...this.alerts];
  }

  /**
   * Limpia alertas
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<AttentionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de atención actualizada:', this.config);
  }

  /**
   * Limpia recursos
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Limpiando recursos del servicio de atención...');

      // Detener tracking si está activo
      if (this.isTracking) {
        await this.stopTracking();
      }

      // Limpiar historial
      this.attentionHistory = [];
      this.alerts = [];

      // Limpiar modelo si es necesario
      if (this.attentionModel) {
        await tensorFlowService.disposeModel('attention_predictor');
        this.attentionModel = null;
      }

      console.log('✅ Recursos del servicio de atención limpiados');
    } catch (error) {
      console.error('❌ Error limpiando recursos:', error);
    }
  }
}

// Instancia singleton del servicio
export const attentionService = new AttentionService();

// Exportar tipos útiles
export type {
  AttentionConfig,
  AttentionData,
  FocusArea,
  Distraction,
  AttentionMetrics,
  AttentionSession,
  AttentionSummary,
  AttentionInsight,
  AttentionAlert
};
