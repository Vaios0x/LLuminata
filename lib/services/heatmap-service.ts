/**
 * Servicio de Heatmaps para InclusiveAI Coach
 * Proporciona funcionalidades de tracking de interacciones del usuario para análisis de UX
 */

// Tipos para el servicio de heatmaps
export interface HeatmapConfig {
  enabled: boolean;
  sampleRate: number;
  trackClicks: boolean;
  trackScrolls: boolean;
  trackMoves: boolean;
  trackHovers: boolean;
  trackFormInteractions: boolean;
  anonymizeData: boolean;
  sessionTimeout: number;
  maxDataPoints: number;
}

export interface HeatmapData {
  id: string;
  timestamp: number;
  type: 'click' | 'scroll' | 'move' | 'hover' | 'form';
  x: number;
  y: number;
  element: string;
  page: string;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface HeatmapSession {
  id: string;
  startTime: number;
  endTime?: number;
  pageViews: string[];
  interactions: HeatmapData[];
  duration: number;
  isActive: boolean;
}

export interface HeatmapAnalysis {
  hotspots: Array<{
    x: number;
    y: number;
    intensity: number;
    element: string;
    interactionCount: number;
  }>;
  scrollDepth: {
    average: number;
    distribution: Record<string, number>;
    maxDepth: number;
  };
  clickPatterns: Array<{
    element: string;
    count: number;
    percentage: number;
  }>;
  formInteractions: Array<{
    field: string;
    completionRate: number;
    errorRate: number;
    timeSpent: number;
  }>;
  engagementMetrics: {
    totalInteractions: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
}

export interface HeatmapExport {
  format: 'json' | 'csv' | 'png' | 'svg';
  data: HeatmapData[] | HeatmapAnalysis;
  timestamp: number;
  filters?: Record<string, any>;
}

/**
 * Servicio principal de Heatmaps
 */
export class HeatmapService {
  private config: HeatmapConfig;
  private currentSession: HeatmapSession | null = null;
  private dataPoints: HeatmapData[] = [];
  private isTracking: boolean = false;
  private observers: Map<string, () => void> = new Map();
  private sessionTimeoutId: NodeJS.Timeout | null = null;

  constructor(config?: Partial<HeatmapConfig>) {
    this.config = {
      enabled: true,
      sampleRate: 1.0, // 100% de las interacciones
      trackClicks: true,
      trackScrolls: true,
      trackMoves: false, // Deshabilitado por defecto por rendimiento
      trackHovers: true,
      trackFormInteractions: true,
      anonymizeData: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutos
      maxDataPoints: 10000,
      ...config
    };

    this.initializeService();
  }

  /**
   * Inicializa el servicio
   */
  private initializeService(): void {
    if (typeof window === 'undefined') {
      console.warn('⚠️ HeatmapService: Ejecutándose en servidor, algunas funcionalidades no estarán disponibles');
      return;
    }

    console.log('🚀 Inicializando servicio de heatmaps...');
    
    // Configurar listeners globales
    this.setupGlobalListeners();
    
    // Iniciar nueva sesión
    this.startNewSession();
    
    console.log('✅ Servicio de heatmaps inicializado');
  }

  /**
   * Configura los listeners globales para tracking
   */
  private setupGlobalListeners(): void {
    if (!this.config.enabled) return;

    // Listener para clicks
    if (this.config.trackClicks) {
      document.addEventListener('click', this.handleClick.bind(this), true);
    }

    // Listener para scrolls
    if (this.config.trackScrolls) {
      document.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    }

    // Listener para movimientos del mouse
    if (this.config.trackMoves) {
      document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
    }

    // Listener para hovers
    if (this.config.trackHovers) {
      document.addEventListener('mouseenter', this.handleMouseEnter.bind(this), true);
      document.addEventListener('mouseleave', this.handleMouseLeave.bind(this), true);
    }

    // Listener para interacciones de formularios
    if (this.config.trackFormInteractions) {
      document.addEventListener('focus', this.handleFormFocus.bind(this), true);
      document.addEventListener('blur', this.handleFormBlur.bind(this), true);
      document.addEventListener('input', this.handleFormInput.bind(this), true);
      document.addEventListener('submit', this.handleFormSubmit.bind(this), true);
    }

    // Listener para cambios de página (SPA)
    window.addEventListener('popstate', this.handlePageChange.bind(this));
    window.addEventListener('beforeunload', this.handlePageUnload.bind(this));
  }

  /**
   * Maneja eventos de click
   */
  private handleClick(event: MouseEvent): void {
    if (!this.shouldTrack()) return;

    const target = event.target as HTMLElement;
    const data: HeatmapData = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: 'click',
      x: event.clientX,
      y: event.clientY,
      element: this.getElementPath(target),
      page: this.getCurrentPage(),
      sessionId: this.currentSession?.id || '',
      metadata: {
        button: event.button,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        elementText: this.getElementText(target),
        elementType: target.tagName.toLowerCase(),
        elementClass: target.className,
        elementId: target.id
      }
    };

    this.recordDataPoint(data);
  }

  /**
   * Maneja eventos de scroll
   */
  private handleScroll(event: Event): void {
    if (!this.shouldTrack()) return;

    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop || window.pageYOffset;
    const scrollHeight = target.scrollHeight || document.documentElement.scrollHeight;
    const clientHeight = target.clientHeight || window.innerHeight;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

    const data: HeatmapData = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: 'scroll',
      x: 0,
      y: scrollTop,
      element: this.getElementPath(target),
      page: this.getCurrentPage(),
      sessionId: this.currentSession?.id || '',
      metadata: {
        scrollTop,
        scrollHeight,
        clientHeight,
        scrollPercentage,
        elementType: target.tagName.toLowerCase()
      }
    };

    this.recordDataPoint(data);
  }

  /**
   * Maneja eventos de movimiento del mouse
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.shouldTrack()) return;

    // Throttle para mejorar rendimiento
    if (this.shouldThrottle('mousemove', 100)) return;

    const data: HeatmapData = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: 'move',
      x: event.clientX,
      y: event.clientY,
      element: this.getElementPath(event.target as HTMLElement),
      page: this.getCurrentPage(),
      sessionId: this.currentSession?.id || '',
      metadata: {
        elementType: (event.target as HTMLElement)?.tagName.toLowerCase()
      }
    };

    this.recordDataPoint(data);
  }

  /**
   * Maneja eventos de hover
   */
  private handleMouseEnter(event: MouseEvent): void {
    if (!this.shouldTrack()) return;

    const target = event.target as HTMLElement;
    const data: HeatmapData = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: 'hover',
      x: event.clientX,
      y: event.clientY,
      element: this.getElementPath(target),
      page: this.getCurrentPage(),
      sessionId: this.currentSession?.id || '',
      metadata: {
        elementText: this.getElementText(target),
        elementType: target.tagName.toLowerCase(),
        elementClass: target.className,
        elementId: target.id
      }
    };

    this.recordDataPoint(data);
  }

  /**
   * Maneja eventos de salida de hover
   */
  private handleMouseLeave(event: MouseEvent): void {
    // Similar a handleMouseEnter pero para salida
    this.handleMouseEnter(event);
  }

  /**
   * Maneja eventos de formularios
   */
  private handleFormFocus(event: FocusEvent): void {
    if (!this.shouldTrack()) return;

    const target = event.target as HTMLInputElement;
    if (this.isFormElement(target)) {
      const data: HeatmapData = {
        id: this.generateId(),
        timestamp: Date.now(),
        type: 'form',
        x: 0,
        y: 0,
        element: this.getElementPath(target),
        page: this.getCurrentPage(),
        sessionId: this.currentSession?.id || '',
        metadata: {
          action: 'focus',
          fieldType: target.type,
          fieldName: target.name,
          fieldValue: this.config.anonymizeData ? '[REDACTED]' : target.value
        }
      };

      this.recordDataPoint(data);
    }
  }

  /**
   * Maneja eventos de blur en formularios
   */
  private handleFormBlur(event: FocusEvent): void {
    if (!this.shouldTrack()) return;

    const target = event.target as HTMLInputElement;
    if (this.isFormElement(target)) {
      const data: HeatmapData = {
        id: this.generateId(),
        timestamp: Date.now(),
        type: 'form',
        x: 0,
        y: 0,
        element: this.getElementPath(target),
        page: this.getCurrentPage(),
        sessionId: this.currentSession?.id || '',
        metadata: {
          action: 'blur',
          fieldType: target.type,
          fieldName: target.name,
          fieldValue: this.config.anonymizeData ? '[REDACTED]' : target.value
        }
      };

      this.recordDataPoint(data);
    }
  }

  /**
   * Maneja eventos de input en formularios
   */
  private handleFormInput(event: Event): void {
    if (!this.shouldTrack()) return;

    const target = event.target as HTMLInputElement;
    if (this.isFormElement(target)) {
      const data: HeatmapData = {
        id: this.generateId(),
        timestamp: Date.now(),
        type: 'form',
        x: 0,
        y: 0,
        element: this.getElementPath(target),
        page: this.getCurrentPage(),
        sessionId: this.currentSession?.id || '',
        metadata: {
          action: 'input',
          fieldType: target.type,
          fieldName: target.name,
          fieldValue: this.config.anonymizeData ? '[REDACTED]' : target.value,
          valueLength: target.value.length
        }
      };

      this.recordDataPoint(data);
    }
  }

  /**
   * Maneja eventos de submit en formularios
   */
  private handleFormSubmit(event: Event): void {
    if (!this.shouldTrack()) return;

    const target = event.target as HTMLFormElement;
    const data: HeatmapData = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: 'form',
      x: 0,
      y: 0,
      element: this.getElementPath(target),
      page: this.getCurrentPage(),
      sessionId: this.currentSession?.id || '',
      metadata: {
        action: 'submit',
        formAction: target.action,
        formMethod: target.method,
        fieldCount: target.elements.length
      }
    };

    this.recordDataPoint(data);
  }

  /**
   * Maneja cambios de página
   */
  private handlePageChange(): void {
    this.startNewSession();
  }

  /**
   * Maneja la salida de la página
   */
  private handlePageUnload(): void {
    this.endCurrentSession();
  }

  /**
   * Verifica si debe hacer tracking basado en sample rate
   */
  private shouldTrack(): boolean {
    return this.config.enabled && 
           this.isTracking && 
           Math.random() <= this.config.sampleRate;
  }

  /**
   * Throttle para eventos frecuentes
   */
  private shouldThrottle(eventType: string, delay: number): boolean {
    const now = Date.now();
    const lastEvent = this.observers.get(eventType);
    
    if (lastEvent && (now - (lastEvent as any)) < delay) {
      return true;
    }
    
    this.observers.set(eventType, now as any);
    return false;
  }

  /**
   * Registra un punto de datos
   */
  private recordDataPoint(data: HeatmapData): void {
    if (this.dataPoints.length >= this.config.maxDataPoints) {
      // Remover el punto más antiguo
      this.dataPoints.shift();
    }

    this.dataPoints.push(data);
    
    // Notificar a observadores
    this.notifyObservers('dataPoint', data);
  }

  /**
   * Inicia una nueva sesión
   */
  startNewSession(): void {
    if (this.currentSession) {
      this.endCurrentSession();
    }

    this.currentSession = {
      id: this.generateId(),
      startTime: Date.now(),
      pageViews: [this.getCurrentPage()],
      interactions: [],
      duration: 0,
      isActive: true
    };

    // Configurar timeout de sesión
    this.sessionTimeoutId = setTimeout(() => {
      this.endCurrentSession();
    }, this.config.sessionTimeout);

    console.log(`🔄 Nueva sesión de heatmap iniciada: ${this.currentSession.id}`);
  }

  /**
   * Termina la sesión actual
   */
  endCurrentSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
    this.currentSession.isActive = false;

    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
      this.sessionTimeoutId = null;
    }

    console.log(`✅ Sesión de heatmap terminada: ${this.currentSession.id} (${this.currentSession.duration}ms)`);
  }

  /**
   * Inicia el tracking
   */
  startTracking(): void {
    this.isTracking = true;
    console.log('🎯 Tracking de heatmap iniciado');
  }

  /**
   * Detiene el tracking
   */
  stopTracking(): void {
    this.isTracking = false;
    console.log('⏹️ Tracking de heatmap detenido');
  }

  /**
   * Analiza los datos de heatmap
   */
  analyzeData(filters?: {
    startDate?: number;
    endDate?: number;
    sessionId?: string;
    page?: string;
    type?: string;
  }): HeatmapAnalysis {
    let filteredData = this.dataPoints;

    // Aplicar filtros
    if (filters) {
      if (filters.startDate) {
        filteredData = filteredData.filter(d => d.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredData = filteredData.filter(d => d.timestamp <= filters.endDate!);
      }
      if (filters.sessionId) {
        filteredData = filteredData.filter(d => d.sessionId === filters.sessionId);
      }
      if (filters.page) {
        filteredData = filteredData.filter(d => d.page === filters.page);
      }
      if (filters.type) {
        filteredData = filteredData.filter(d => d.type === filters.type);
      }
    }

    // Calcular hotspots
    const hotspots = this.calculateHotspots(filteredData);

    // Calcular profundidad de scroll
    const scrollDepth = this.calculateScrollDepth(filteredData);

    // Calcular patrones de clicks
    const clickPatterns = this.calculateClickPatterns(filteredData);

    // Calcular interacciones de formularios
    const formInteractions = this.calculateFormInteractions(filteredData);

    // Calcular métricas de engagement
    const engagementMetrics = this.calculateEngagementMetrics(filteredData);

    return {
      hotspots,
      scrollDepth,
      clickPatterns,
      formInteractions,
      engagementMetrics
    };
  }

  /**
   * Calcula hotspots (áreas de mayor interacción)
   */
  private calculateHotspots(data: HeatmapData[]): HeatmapAnalysis['hotspots'] {
    const clickData = data.filter(d => d.type === 'click');
    const gridSize = 50; // Tamaño de la cuadrícula en píxeles
    const grid: Record<string, number> = {};

    clickData.forEach(click => {
      const gridX = Math.floor(click.x / gridSize);
      const gridY = Math.floor(click.y / gridSize);
      const key = `${gridX},${gridY}`;
      grid[key] = (grid[key] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(grid));
    
    return Object.entries(grid).map(([key, count]) => {
      const [gridX, gridY] = key.split(',').map(Number);
      return {
        x: gridX * gridSize + gridSize / 2,
        y: gridY * gridSize + gridSize / 2,
        intensity: count / maxCount,
        element: 'grid-cell',
        interactionCount: count
      };
    }).sort((a, b) => b.interactionCount - a.interactionCount);
  }

  /**
   * Calcula la profundidad de scroll
   */
  private calculateScrollDepth(data: HeatmapData[]): HeatmapAnalysis['scrollDepth'] {
    const scrollData = data.filter(d => d.type === 'scroll');
    const depths = scrollData.map(d => d.metadata?.scrollPercentage || 0);
    
    if (depths.length === 0) {
      return {
        average: 0,
        distribution: {},
        maxDepth: 0
      };
    }

    const average = depths.reduce((sum, depth) => sum + depth, 0) / depths.length;
    const maxDepth = Math.max(...depths);

    // Distribución por rangos
    const distribution: Record<string, number> = {};
    for (let i = 0; i <= 100; i += 10) {
      const range = `${i}-${i + 10}%`;
      distribution[range] = depths.filter(d => d >= i && d < i + 10).length;
    }

    return {
      average,
      distribution,
      maxDepth
    };
  }

  /**
   * Calcula patrones de clicks
   */
  private calculateClickPatterns(data: HeatmapData[]): HeatmapAnalysis['clickPatterns'] {
    const clickData = data.filter(d => d.type === 'click');
    const elementCounts: Record<string, number> = {};

    clickData.forEach(click => {
      elementCounts[click.element] = (elementCounts[click.element] || 0) + 1;
    });

    const totalClicks = clickData.length;
    
    return Object.entries(elementCounts)
      .map(([element, count]) => ({
        element,
        count,
        percentage: (count / totalClicks) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calcula interacciones de formularios
   */
  private calculateFormInteractions(data: HeatmapData[]): HeatmapAnalysis['formInteractions'] {
    const formData = data.filter(d => d.type === 'form');
    const fieldStats: Record<string, {
      focusCount: number;
      blurCount: number;
      inputCount: number;
      submitCount: number;
      totalTime: number;
    }> = {};

    formData.forEach(interaction => {
      const fieldName = interaction.metadata?.fieldName || 'unknown';
      if (!fieldStats[fieldName]) {
        fieldStats[fieldName] = {
          focusCount: 0,
          blurCount: 0,
          inputCount: 0,
          submitCount: 0,
          totalTime: 0
        };
      }

      const action = interaction.metadata?.action;
      switch (action) {
        case 'focus':
          fieldStats[fieldName].focusCount++;
          break;
        case 'blur':
          fieldStats[fieldName].blurCount++;
          break;
        case 'input':
          fieldStats[fieldName].inputCount++;
          break;
        case 'submit':
          fieldStats[fieldName].submitCount++;
          break;
      }
    });

    return Object.entries(fieldStats).map(([field, stats]) => ({
      field,
      completionRate: stats.focusCount > 0 ? (stats.blurCount / stats.focusCount) * 100 : 0,
      errorRate: 0, // Se calcularía con datos adicionales de validación
      timeSpent: stats.totalTime
    }));
  }

  /**
   * Calcula métricas de engagement
   */
  private calculateEngagementMetrics(data: HeatmapData[]): HeatmapAnalysis['engagementMetrics'] {
    const sessions = new Set(data.map(d => d.sessionId));
    const totalInteractions = data.length;
    
    // Calcular duración promedio de sesión
    const sessionDurations: number[] = [];
    sessions.forEach(sessionId => {
      const sessionData = data.filter(d => d.sessionId === sessionId);
      if (sessionData.length > 0) {
        const first = Math.min(...sessionData.map(d => d.timestamp));
        const last = Math.max(...sessionData.map(d => d.timestamp));
        sessionDurations.push(last - first);
      }
    });

    const averageSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length 
      : 0;

    // Calcular bounce rate (sesiones con 1 interacción)
    const bounceSessions = Array.from(sessions).filter(sessionId => {
      const sessionData = data.filter(d => d.sessionId === sessionId);
      return sessionData.length <= 1;
    }).length;

    const bounceRate = sessions.size > 0 ? (bounceSessions / sessions.size) * 100 : 0;

    return {
      totalInteractions,
      averageSessionDuration,
      bounceRate,
      conversionRate: 0 // Se calcularía con datos adicionales de conversión
    };
  }

  /**
   * Exporta datos de heatmap
   */
  exportData(format: 'json' | 'csv' | 'png' | 'svg', filters?: Record<string, any>): HeatmapExport {
    const timestamp = Date.now();
    let data: any;

    switch (format) {
      case 'json':
        data = this.dataPoints;
        break;
      case 'csv':
        data = this.convertToCSV(this.dataPoints);
        break;
      case 'png':
      case 'svg':
        data = this.generateHeatmapVisualization(format);
        break;
      default:
        throw new Error(`Formato no soportado: ${format}`);
    }

    return {
      format,
      data,
      timestamp,
      filters
    };
  }

  /**
   * Convierte datos a CSV
   */
  private convertToCSV(data: HeatmapData[]): string {
    const headers = ['id', 'timestamp', 'type', 'x', 'y', 'element', 'page', 'sessionId'];
    const rows = data.map(d => [
      d.id,
      d.timestamp,
      d.type,
      d.x,
      d.y,
      d.element,
      d.page,
      d.sessionId
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Genera visualización de heatmap
   */
  private generateHeatmapVisualization(format: 'png' | 'svg'): string {
    // Implementación básica - en producción se usaría una librería de visualización
    const analysis = this.analyzeData();
    const svg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="white"/>
        ${analysis.hotspots.map(hotspot => `
          <circle 
            cx="${hotspot.x}" 
            cy="${hotspot.y}" 
            r="${Math.max(5, hotspot.intensity * 20)}" 
            fill="rgba(255,0,0,${hotspot.intensity})"
            opacity="0.7"
          />
        `).join('')}
      </svg>
    `;

    return format === 'svg' ? svg : this.svgToPng(svg);
  }

  /**
   * Convierte SVG a PNG (placeholder)
   */
  private svgToPng(svg: string): string {
    // En producción se usaría canvas para convertir SVG a PNG
    return 'data:image/png;base64,placeholder';
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<HeatmapConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de heatmap actualizada');
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): HeatmapConfig {
    return { ...this.config };
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): {
    isTracking: boolean;
    isEnabled: boolean;
    currentSession: HeatmapSession | null;
    dataPointsCount: number;
    lastActivity: number;
  } {
    return {
      isTracking: this.isTracking,
      isEnabled: this.config.enabled,
      currentSession: this.currentSession,
      dataPointsCount: this.dataPoints.length,
      lastActivity: this.dataPoints.length > 0 
        ? Math.max(...this.dataPoints.map(d => d.timestamp))
        : 0
    };
  }

  /**
   * Limpia datos antiguos
   */
  cleanup(maxAge?: number): void {
    const cutoff = maxAge || (24 * 60 * 60 * 1000); // 24 horas por defecto
    const now = Date.now();
    
    this.dataPoints = this.dataPoints.filter(d => (now - d.timestamp) < cutoff);
    
    console.log(`🧹 Limpieza de datos de heatmap completada. ${this.dataPoints.length} puntos restantes`);
  }

  /**
   * Limpia todos los recursos
   */
  async cleanup(): Promise<void> {
    this.stopTracking();
    this.endCurrentSession();
    this.dataPoints = [];
    this.observers.clear();
    
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
      this.sessionTimeoutId = null;
    }

    console.log('🧹 Servicio de heatmap limpiado');
  }

  // Métodos auxiliares
  private generateId(): string {
    return `heatmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentPage(): string {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  }

  private getElementPath(element: HTMLElement): string {
    const path: string[] = [];
    let current = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className) {
        selector += `.${current.className.split(' ').join('.')}`;
      }
      
      path.unshift(selector);
      current = current.parentElement as HTMLElement;
    }

    return path.join(' > ');
  }

  private getElementText(element: HTMLElement): string {
    return element.textContent?.trim().substring(0, 100) || '';
  }

  private isFormElement(element: HTMLElement): boolean {
    const formTags = ['input', 'textarea', 'select', 'button', 'form'];
    return formTags.includes(element.tagName.toLowerCase());
  }

  private notifyObservers(event: string, data: any): void {
    // Implementación de observadores para eventos en tiempo real
    console.log(`📊 Evento de heatmap: ${event}`, data);
  }
}

// Instancia singleton del servicio
export const heatmapService = new HeatmapService();

// Exportar el servicio como default
export default heatmapService;
