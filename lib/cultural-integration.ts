/**
 * Servicio de Integración Cultural para InclusiveAI Coach
 * Coordina todos los servicios de adaptación cultural y accesibilidad
 */

import { culturalAdapter, type CulturalContext, type ContentAdaptation } from './cultural-adapter';
import { accessibilityService, type AccessibilityProfile } from './accessibility';
import { aiServices } from './ai-services';

export interface CulturalIntegrationRequest {
  content: string;
  userId: string;
  culturalContext: CulturalContext;
  accessibilityProfile?: AccessibilityProfile;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  targetLanguage?: string;
}

export interface CulturalIntegrationResponse {
  originalContent: string;
  adaptedContent: string;
  culturalElements: string[];
  accessibilityFeatures: string[];
  languageAdaptations: Record<string, string>;
  visualAdaptations: string[];
  audioAdaptations: string[];
  sensitivityNotes: string[];
  recommendations: string[];
  confidence: number;
  compliance: {
    cultural: number;
    accessibility: number;
    overall: number;
  };
}

export interface OfflineContentPackage {
  id: string;
  culture: string;
  category: string;
  content: any;
  metadata: {
    size: number;
    lastUpdated: string;
    version: string;
    accessibility: boolean;
  };
}

export class CulturalIntegrationService {
  private offlineContent: Map<string, OfflineContentPackage> = new Map();

  constructor() {
    this.initializeOfflineContent();
  }

  /**
   * Inicializa el contenido offline
   */
  private initializeOfflineContent(): void {
    // Contenido offline para cultura Maya
    this.offlineContent.set('maya-mathematics-basic', {
      id: 'maya-mathematics-basic',
      culture: 'maya',
      category: 'mathematics',
      content: {
        numbers: {
          '1': 'jun',
          '2': 'ka\'i\'',
          '3': 'oxi\'',
          '4': 'kaji\'',
          '5': 'wo\'o\'',
          '6': 'waqi\'',
          '7': 'wuqu\'',
          '8': 'wajxaqi\'',
          '9': 'b\'eleje\'',
          '10': 'lajuj'
        },
        examples: [
          {
            problem: '¿Cuántos granos de maíz hay en 3 mazorcas?',
            solution: 'Si cada mazorca tiene 20 granos, entonces 3 mazorcas tienen 60 granos',
            culturalContext: 'maíz'
          }
        ]
      },
      metadata: {
        size: 1024,
        lastUpdated: '2024-12-19T10:00:00Z',
        version: '1.0.0',
        accessibility: true
      }
    });

    // Contenido offline para cultura Náhuatl
    this.offlineContent.set('nahuatl-mathematics-basic', {
      id: 'nahuatl-mathematics-basic',
      culture: 'nahuatl',
      category: 'mathematics',
      content: {
        numbers: {
          '1': 'ce',
          '2': 'ome',
          '3': 'eyi',
          '4': 'nahui',
          '5': 'macuilli',
          '6': 'chicuace',
          '7': 'chicome',
          '8': 'chicuēyi',
          '9': 'chicnahui',
          '10': 'mahtlactli'
        },
        examples: [
          {
            problem: '¿Cuántos granos de cacao hay en 4 vainas?',
            solution: 'Si cada vaina tiene 25 granos, entonces 4 vainas tienen 100 granos',
            culturalContext: 'cacao'
          }
        ]
      },
      metadata: {
        size: 1024,
        lastUpdated: '2024-12-19T10:00:00Z',
        version: '1.0.0',
        accessibility: true
      }
    });
  }

  /**
   * Integra adaptación cultural y accesibilidad
   */
  async integrateCulturalContent(request: CulturalIntegrationRequest): Promise<CulturalIntegrationResponse> {
    try {
      // Obtener perfil de accesibilidad si no se proporciona
      let accessibilityProfile = request.accessibilityProfile;
      if (!accessibilityProfile) {
        accessibilityProfile = accessibilityService.getProfile(request.userId) || 
          this.getDefaultAccessibilityProfile();
      }

      // Adaptar contenido culturalmente
      const culturalAdaptation = await culturalAdapter.adaptContent({
        content: request.content,
        culturalContext: request.culturalContext,
        targetLanguage: request.targetLanguage,
        difficulty: request.difficulty,
        subject: request.subject
      });

      // Aplicar adaptaciones de accesibilidad
      const accessibilityAdaptations = this.applyAccessibilityAdaptations(
        culturalAdaptation.adaptedContent,
        accessibilityProfile
      );

      // Generar recomendaciones combinadas
      const recommendations = this.generateCombinedRecommendations(
        culturalAdaptation,
        accessibilityProfile
      );

      // Calcular cumplimiento
      const compliance = this.calculateCompliance(
        culturalAdaptation,
        accessibilityProfile
      );

      return {
        originalContent: request.content,
        adaptedContent: accessibilityAdaptations.content,
        culturalElements: culturalAdaptation.culturalElements,
        accessibilityFeatures: accessibilityAdaptations.features,
        languageAdaptations: culturalAdaptation.languageAdaptations,
        visualAdaptations: culturalAdaptation.visualAdaptations,
        audioAdaptations: culturalAdaptation.audioAdaptations,
        sensitivityNotes: culturalAdaptation.sensitivityNotes,
        recommendations,
        confidence: culturalAdaptation.confidence,
        compliance
      };

    } catch (error) {
      console.error('Error en integración cultural:', error);
      throw error;
    }
  }

  /**
   * Aplica adaptaciones de accesibilidad al contenido
   */
  private applyAccessibilityAdaptations(content: string, profile: AccessibilityProfile): {
    content: string;
    features: string[];
  } {
    let adaptedContent = content;
    const features: string[] = [];

    // Aplicar adaptaciones visuales
    if (profile.visualAcuity !== 'normal') {
      if (profile.preferences.highContrast) {
        adaptedContent = this.applyHighContrast(adaptedContent);
        features.push('high-contrast');
      }

      if (profile.preferences.largeText) {
        adaptedContent = this.applyLargeText(adaptedContent);
        features.push('large-text');
      }
    }

    // Aplicar adaptaciones auditivas
    if (profile.hearing !== 'normal') {
      if (profile.preferences.captions) {
        features.push('captions');
      }

      if (profile.preferences.audioDescriptions) {
        features.push('audio-descriptions');
      }
    }

    // Aplicar adaptaciones motoras
    if (profile.motorCoordination !== 'normal') {
      if (profile.preferences.keyboardOnly) {
        features.push('keyboard-navigation');
      }

      if (profile.preferences.voiceControl) {
        features.push('voice-control');
      }
    }

    // Aplicar adaptaciones cognitivas
    if (profile.cognitiveProcessing !== 'normal') {
      if (profile.preferences.simplifiedInterface) {
        adaptedContent = this.simplifyContent(adaptedContent);
        features.push('simplified-interface');
      }

      if (profile.attentionSpan < 10) {
        features.push('focus-mode');
      }
    }

    return {
      content: adaptedContent,
      features
    };
  }

  /**
   * Aplica alto contraste al contenido
   */
  private applyHighContrast(content: string): string {
    // En una implementación real, esto modificaría CSS o aplicaría estilos
    return content.replace(
      /<(\w+)([^>]*)>/g,
      '<$1$2 style="background-color: #000000; color: #FFFFFF; border: 2px solid #FFFFFF;">'
    );
  }

  /**
   * Aplica texto grande al contenido
   */
  private applyLargeText(content: string): string {
    // En una implementación real, esto modificaría el tamaño de fuente
    return content.replace(
      /<(\w+)([^>]*)>/g,
      '<$1$2 style="font-size: 150%; line-height: 1.5;">'
    );
  }

  /**
   * Simplifica el contenido para usuarios con limitaciones cognitivas
   */
  private simplifyContent(content: string): string {
    // Simplificar oraciones largas
    let simplified = content
      .replace(/\. /g, '.\n')
      .replace(/; /g, '.\n')
      .replace(/, /g, ', ');

    // Agregar pausas para mejor comprensión
    simplified = simplified.replace(/\./g, '... ');

    return simplified;
  }

  /**
   * Genera recomendaciones combinadas
   */
  private generateCombinedRecommendations(
    culturalAdaptation: ContentAdaptation,
    accessibilityProfile: AccessibilityProfile
  ): string[] {
    const recommendations: string[] = [];

    // Recomendaciones culturales
    recommendations.push(...culturalAdaptation.sensitivityNotes);

    // Recomendaciones de accesibilidad
    const accessibilityRecommendations = accessibilityService.generateRecommendations(accessibilityProfile);
    recommendations.push(...accessibilityRecommendations);

    // Recomendaciones específicas de integración
    if (accessibilityProfile.visualAcuity !== 'normal' && culturalAdaptation.visualAdaptations.length > 0) {
      recommendations.push('Considerar usar imágenes culturales con alto contraste');
    }

    if (accessibilityProfile.hearing !== 'normal' && culturalAdaptation.audioAdaptations.length > 0) {
      recommendations.push('Asegurar que el audio cultural tenga subtítulos');
    }

    return [...new Set(recommendations)];
  }

  /**
   * Calcula el cumplimiento combinado
   */
  private calculateCompliance(
    culturalAdaptation: ContentAdaptation,
    accessibilityProfile: AccessibilityProfile
  ): { cultural: number; accessibility: number; overall: number } {
    // Calcular cumplimiento cultural
    const culturalCompliance = culturalAdaptation.confidence * 100;

    // Calcular cumplimiento de accesibilidad
    const latestAudit = accessibilityService.getLatestAudit(accessibilityProfile.userId || 'default');
    const accessibilityCompliance = latestAudit ? latestAudit.score : 75;

    // Calcular cumplimiento general
    const overallCompliance = (culturalCompliance + accessibilityCompliance) / 2;

    return {
      cultural: culturalCompliance,
      accessibility: accessibilityCompliance,
      overall: overallCompliance
    };
  }

  /**
   * Obtiene perfil de accesibilidad por defecto
   */
  private getDefaultAccessibilityProfile(): AccessibilityProfile {
    return {
      visualAcuity: 'normal',
      colorVision: 'normal',
      hearing: 'normal',
      motorCoordination: 'normal',
      cognitiveProcessing: 'normal',
      attentionSpan: 15,
      memoryCapacity: 'normal',
      languageProcessing: 'normal',
      assistiveTechnology: [],
      preferences: {
        highContrast: false,
        largeText: false,
        screenReader: false,
        keyboardOnly: false,
        reducedMotion: false,
        audioDescriptions: false,
        captions: false,
        simplifiedInterface: false,
        voiceControl: false,
        switchControl: false,
        eyeTracking: false,
        fontSize: 100,
        lineSpacing: 1.2,
        colorScheme: 'default',
        audioVolume: 1.0,
        speechRate: 150
      },
      knownDisabilities: []
    };
  }

  /**
   * Obtiene contenido offline para una cultura y categoría específicas
   */
  getOfflineContent(culture: string, category: string): OfflineContentPackage | null {
    const key = `${culture}-${category}-basic`;
    return this.offlineContent.get(key) || null;
  }

  /**
   * Obtiene todo el contenido offline disponible
   */
  getAllOfflineContent(): OfflineContentPackage[] {
    return Array.from(this.offlineContent.values());
  }

  /**
   * Agrega contenido offline
   */
  addOfflineContent(contentPackage: OfflineContentPackage): void {
    this.offlineContent.set(contentPackage.id, contentPackage);
  }

  /**
   * Verifica compatibilidad cultural y de accesibilidad
   */
  checkCompatibility(
    culturalContext: CulturalContext,
    accessibilityProfile: AccessibilityProfile
  ): { compatible: boolean; issues: string[] } {
    const issues: string[] = [];

    // Verificar compatibilidad de idioma
    if (accessibilityProfile.languageProcessing === 'dyslexia') {
      if (culturalContext.language !== 'es-MX') {
        issues.push('Idioma indígena puede ser difícil para usuarios con dislexia');
      }
    }

    // Verificar compatibilidad visual
    if (accessibilityProfile.visualAcuity !== 'normal') {
      if (culturalContext.culture === 'maya' || culturalContext.culture === 'nahuatl') {
        // Verificar si hay símbolos complejos
        issues.push('Símbolos culturales complejos pueden ser difíciles de distinguir');
      }
    }

    // Verificar compatibilidad auditiva
    if (accessibilityProfile.hearing !== 'normal') {
      if (culturalContext.language !== 'es-MX') {
        issues.push('Audio en idioma indígena puede necesitar subtítulos adicionales');
      }
    }

    return {
      compatible: issues.length === 0,
      issues
    };
  }

  /**
   * Genera un reporte de integración cultural
   */
  async generateIntegrationReport(
    userId: string,
    culturalContext: CulturalContext
  ): Promise<any> {
    const accessibilityProfile = accessibilityService.getProfile(userId);
    const compatibility = this.checkCompatibility(culturalContext, accessibilityProfile || this.getDefaultAccessibilityProfile());

    return {
      userId,
      culturalContext,
      accessibilityProfile,
      compatibility,
      recommendations: this.generateCombinedRecommendations(
        { culturalElements: [], languageAdaptations: {}, visualAdaptations: [], audioAdaptations: [], sensitivityNotes: [], confidence: 0.8, originalContent: '', adaptedContent: '' },
        accessibilityProfile || this.getDefaultAccessibilityProfile()
      ),
      timestamp: new Date().toISOString()
    };
  }
}

// Instancia singleton
export const culturalIntegrationService = new CulturalIntegrationService();
