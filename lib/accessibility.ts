/**
 * Servicio de Accesibilidad para InclusiveAI Coach
 * Maneja todas las funcionalidades de accesibilidad para usuarios con necesidades especiales
 */

import { z } from 'zod';

// Tipos y esquemas
export interface AccessibilityProfile {
  visualAcuity: 'normal' | 'low' | 'blind';
  colorVision: 'normal' | 'colorblind' | 'monochrome';
  hearing: 'normal' | 'hard-of-hearing' | 'deaf';
  motorCoordination: 'normal' | 'limited' | 'severe';
  cognitiveProcessing: 'normal' | 'mild' | 'moderate' | 'severe';
  attentionSpan: number; // minutos
  memoryCapacity: 'normal' | 'limited' | 'severe';
  languageProcessing: 'normal' | 'dyslexia' | 'aphasia';
  assistiveTechnology: string[];
  preferences: AccessibilityPreferences;
  knownDisabilities: string[];
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardOnly: boolean;
  reducedMotion: boolean;
  audioDescriptions: boolean;
  captions: boolean;
  simplifiedInterface: boolean;
  voiceControl: boolean;
  switchControl: boolean;
  eyeTracking: boolean;
  fontSize: number; // porcentaje
  lineSpacing: number; // multiplicador
  colorScheme: 'default' | 'high-contrast' | 'dark' | 'sepia';
  audioVolume: number; // 0-1
  speechRate: number; // palabras por minuto
}

export interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  category: 'visual' | 'auditory' | 'motor' | 'cognitive' | 'general';
  enabled: boolean;
  settings: Record<string, any>;
  compatibility: string[];
}

export interface AccessibilityAudit {
  id: string;
  timestamp: string;
  profile: AccessibilityProfile;
  issues: AccessibilityIssue[];
  recommendations: string[];
  compliance: ComplianceReport;
  score: number; // 0-100
}

export interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'visual' | 'auditory' | 'motor' | 'cognitive' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  element?: string;
  recommendation: string;
  wcagCriteria?: string[];
}

export interface ComplianceReport {
  wcag2_1: {
    level: 'A' | 'AA' | 'AAA';
    score: number;
    issues: string[];
  };
  section508: {
    compliant: boolean;
    score: number;
    issues: string[];
  };
  localRegulations: {
    compliant: boolean;
    score: number;
    issues: string[];
  };
}

// Esquemas de validación
const AccessibilityProfileSchema = z.object({
  visualAcuity: z.enum(['normal', 'low', 'blind']),
  colorVision: z.enum(['normal', 'colorblind', 'monochrome']),
  hearing: z.enum(['normal', 'hard-of-hearing', 'deaf']),
  motorCoordination: z.enum(['normal', 'limited', 'severe']),
  cognitiveProcessing: z.enum(['normal', 'mild', 'moderate', 'severe']),
  attentionSpan: z.number().min(1).max(120),
  memoryCapacity: z.enum(['normal', 'limited', 'severe']),
  languageProcessing: z.enum(['normal', 'dyslexia', 'aphasia']),
  assistiveTechnology: z.array(z.string()),
  preferences: z.object({
    highContrast: z.boolean(),
    largeText: z.boolean(),
    screenReader: z.boolean(),
    keyboardOnly: z.boolean(),
    reducedMotion: z.boolean(),
    audioDescriptions: z.boolean(),
    captions: z.boolean(),
    simplifiedInterface: z.boolean(),
    voiceControl: z.boolean(),
    switchControl: z.boolean(),
    eyeTracking: z.boolean(),
    fontSize: z.number().min(50).max(300),
    lineSpacing: z.number().min(1).max(3),
    colorScheme: z.enum(['default', 'high-contrast', 'dark', 'sepia']),
    audioVolume: z.number().min(0).max(1),
    speechRate: z.number().min(50).max(300)
  }),
  knownDisabilities: z.array(z.string())
});

export class AccessibilityService {
  private features: AccessibilityFeature[] = [];
  private profiles: Map<string, AccessibilityProfile> = new Map();
  private audits: Map<string, AccessibilityAudit> = new Map();

  constructor() {
    this.initializeFeatures();
  }

  /**
   * Inicializa las características de accesibilidad disponibles
   */
  private initializeFeatures(): void {
    this.features = [
      // Características visuales
      {
        id: 'high-contrast',
        name: 'Alto Contraste',
        description: 'Aumenta el contraste entre texto y fondo',
        category: 'visual',
        enabled: false,
        settings: {
          contrastRatio: 4.5,
          backgroundColor: '#000000',
          textColor: '#FFFFFF'
        },
        compatibility: ['screen-reader', 'keyboard-only']
      },
      {
        id: 'large-text',
        name: 'Texto Grande',
        description: 'Aumenta el tamaño del texto',
        category: 'visual',
        enabled: false,
        settings: {
          fontSize: 150,
          lineSpacing: 1.5
        },
        compatibility: ['screen-reader', 'high-contrast']
      },
      {
        id: 'screen-reader',
        name: 'Lector de Pantalla',
        description: 'Narración de contenido por voz',
        category: 'visual',
        enabled: false,
        settings: {
          voice: 'default',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0
        },
        compatibility: ['keyboard-only', 'high-contrast']
      },
      {
        id: 'colorblind-support',
        name: 'Soporte para Daltonismo',
        description: 'Adapta colores para usuarios con daltonismo',
        category: 'visual',
        enabled: false,
        settings: {
          colorScheme: 'colorblind-friendly',
          usePatterns: true,
          useLabels: true
        },
        compatibility: ['high-contrast']
      },

      // Características auditivas
      {
        id: 'captions',
        name: 'Subtítulos',
        description: 'Muestra subtítulos en videos y audio',
        category: 'auditory',
        enabled: false,
        settings: {
          language: 'es-MX',
          fontSize: 16,
          backgroundColor: 'rgba(0,0,0,0.8)',
          textColor: '#FFFFFF'
        },
        compatibility: ['high-contrast']
      },
      {
        id: 'audio-descriptions',
        name: 'Descripciones de Audio',
        description: 'Describe contenido visual en audio',
        category: 'auditory',
        enabled: false,
        settings: {
          autoPlay: false,
          volume: 0.8,
          language: 'es-MX'
        },
        compatibility: ['screen-reader']
      },
      {
        id: 'visual-alerts',
        name: 'Alertas Visuales',
        description: 'Convierte alertas de audio en visuales',
        category: 'auditory',
        enabled: false,
        settings: {
          flashScreen: true,
          showNotification: true,
          vibration: true
        },
        compatibility: ['high-contrast']
      },

      // Características motoras
      {
        id: 'keyboard-only',
        name: 'Solo Teclado',
        description: 'Permite navegación completa con teclado',
        category: 'motor',
        enabled: false,
        settings: {
          focusIndicator: true,
          skipLinks: true,
          tabOrder: 'logical'
        },
        compatibility: ['screen-reader']
      },
      {
        id: 'voice-control',
        name: 'Control por Voz',
        description: 'Permite control de la aplicación por voz',
        category: 'motor',
        enabled: false,
        settings: {
          language: 'es-MX',
          sensitivity: 0.8,
          commands: ['navegar', 'seleccionar', 'cerrar']
        },
        compatibility: ['screen-reader']
      },
      {
        id: 'switch-control',
        name: 'Control por Interruptor',
        description: 'Permite control mediante interruptores',
        category: 'motor',
        enabled: false,
        settings: {
          scanSpeed: 1000,
          autoScan: true,
          switchCount: 1
        },
        compatibility: ['keyboard-only']
      },
      {
        id: 'eye-tracking',
        name: 'Seguimiento Ocular',
        description: 'Permite control mediante seguimiento ocular',
        category: 'motor',
        enabled: false,
        settings: {
          dwellTime: 1000,
          calibration: 'auto',
          sensitivity: 0.8
        },
        compatibility: ['keyboard-only']
      },

      // Características cognitivas
      {
        id: 'simplified-interface',
        name: 'Interfaz Simplificada',
        description: 'Simplifica la interfaz para reducir distracciones',
        category: 'cognitive',
        enabled: false,
        settings: {
          hideComplexElements: true,
          reduceAnimations: true,
          clearNavigation: true
        },
        compatibility: ['high-contrast', 'large-text']
      },
      {
        id: 'reading-assistant',
        name: 'Asistente de Lectura',
        description: 'Ayuda con la lectura y comprensión',
        category: 'cognitive',
        enabled: false,
        settings: {
          highlightWords: true,
          readAloud: true,
          wordSpacing: 1.2,
          lineSpacing: 1.5
        },
        compatibility: ['screen-reader', 'large-text']
      },
      {
        id: 'focus-mode',
        name: 'Modo de Enfoque',
        description: 'Reduce distracciones y mejora la concentración',
        category: 'cognitive',
        enabled: false,
        settings: {
          hideSidebar: true,
          dimBackground: true,
          showProgress: true
        },
        compatibility: ['simplified-interface']
      },
      {
        id: 'memory-aids',
        name: 'Ayudas de Memoria',
        description: 'Proporciona recordatorios y ayudas visuales',
        category: 'cognitive',
        enabled: false,
        settings: {
          showProgress: true,
          repeatInstructions: true,
          visualCues: true
        },
        compatibility: ['simplified-interface']
      }
    ];
  }

  /**
   * Crea o actualiza un perfil de accesibilidad
   */
  async createProfile(userId: string, profile: AccessibilityProfile): Promise<AccessibilityProfile> {
    try {
      // Validar perfil
      const validatedProfile = AccessibilityProfileSchema.parse(profile);
      
      // Guardar perfil
      this.profiles.set(userId, validatedProfile);
      
      // Realizar auditoría automática
      await this.performAudit(userId, validatedProfile);
      
      return validatedProfile;
    } catch (error) {
      console.error('Error creando perfil de accesibilidad:', error);
      throw error;
    }
  }

  /**
   * Obtiene un perfil de accesibilidad
   */
  getProfile(userId: string): AccessibilityProfile | null {
    return this.profiles.get(userId) || null;
  }

  /**
   * Actualiza un perfil de accesibilidad
   */
  async updateProfile(userId: string, updates: Partial<AccessibilityProfile>): Promise<AccessibilityProfile> {
    const currentProfile = this.getProfile(userId);
    if (!currentProfile) {
      throw new Error('Perfil de accesibilidad no encontrado');
    }

    const updatedProfile = { ...currentProfile, ...updates };
    return await this.createProfile(userId, updatedProfile);
  }

  /**
   * Realiza una auditoría de accesibilidad
   */
  async performAudit(userId: string, profile?: AccessibilityProfile): Promise<AccessibilityAudit> {
    const userProfile = profile || this.getProfile(userId);
    if (!userProfile) {
      throw new Error('Perfil de accesibilidad no encontrado');
    }

    const issues: AccessibilityIssue[] = [];
    const recommendations: string[] = [];

    // Verificar características visuales
    if (userProfile.visualAcuity !== 'normal') {
      if (!userProfile.preferences.highContrast) {
        issues.push({
          id: 'vis-001',
          type: 'warning',
          category: 'visual',
          severity: 'medium',
          description: 'Usuario con baja visión no tiene alto contraste habilitado',
          recommendation: 'Habilitar alto contraste para mejorar la visibilidad',
          wcagCriteria: ['1.4.3', '1.4.6']
        });
        recommendations.push('Habilitar alto contraste');
      }

      if (!userProfile.preferences.largeText) {
        issues.push({
          id: 'vis-002',
          type: 'warning',
          category: 'visual',
          severity: 'medium',
          description: 'Usuario con baja visión no tiene texto grande habilitado',
          recommendation: 'Habilitar texto grande para mejorar la legibilidad',
          wcagCriteria: ['1.4.4']
        });
        recommendations.push('Habilitar texto grande');
      }
    }

    if (userProfile.colorVision !== 'normal') {
      issues.push({
        id: 'vis-003',
        type: 'info',
        category: 'visual',
        severity: 'low',
        description: 'Usuario con daltonismo detectado',
        recommendation: 'Habilitar soporte para daltonismo',
        wcagCriteria: ['1.4.1']
      });
      recommendations.push('Habilitar soporte para daltonismo');
    }

    // Verificar características auditivas
    if (userProfile.hearing !== 'normal') {
      if (!userProfile.preferences.captions) {
        issues.push({
          id: 'aud-001',
          type: 'warning',
          category: 'auditory',
          severity: 'high',
          description: 'Usuario con problemas auditivos no tiene subtítulos habilitados',
          recommendation: 'Habilitar subtítulos para todo el contenido multimedia',
          wcagCriteria: ['1.2.2', '1.2.4']
        });
        recommendations.push('Habilitar subtítulos');
      }

      if (!userProfile.preferences.audioDescriptions) {
        issues.push({
          id: 'aud-002',
          type: 'info',
          category: 'auditory',
          severity: 'medium',
          description: 'Usuario con problemas auditivos podría beneficiarse de descripciones de audio',
          recommendation: 'Habilitar descripciones de audio para contenido visual',
          wcagCriteria: ['1.2.3', '1.2.5']
        });
        recommendations.push('Considerar habilitar descripciones de audio');
      }
    }

    // Verificar características motoras
    if (userProfile.motorCoordination !== 'normal') {
      if (!userProfile.preferences.keyboardOnly) {
        issues.push({
          id: 'mot-001',
          type: 'warning',
          category: 'motor',
          severity: 'high',
          description: 'Usuario con limitaciones motoras no tiene navegación por teclado habilitada',
          recommendation: 'Habilitar navegación completa por teclado',
          wcagCriteria: ['2.1.1', '2.1.2', '2.1.3']
        });
        recommendations.push('Habilitar navegación por teclado');
      }

      if (userProfile.motorCoordination === 'severe') {
        issues.push({
          id: 'mot-002',
          type: 'info',
          category: 'motor',
          severity: 'medium',
          description: 'Usuario con limitaciones motoras severas',
          recommendation: 'Considerar habilitar control por voz o interruptores',
          wcagCriteria: ['2.1.1']
        });
        recommendations.push('Considerar control por voz o interruptores');
      }
    }

    // Verificar características cognitivas
    if (userProfile.cognitiveProcessing !== 'normal') {
      if (!userProfile.preferences.simplifiedInterface) {
        issues.push({
          id: 'cog-001',
          type: 'warning',
          category: 'cognitive',
          severity: 'medium',
          description: 'Usuario con limitaciones cognitivas no tiene interfaz simplificada habilitada',
          recommendation: 'Habilitar interfaz simplificada para reducir distracciones',
          wcagCriteria: ['2.2.1', '2.2.2']
        });
        recommendations.push('Habilitar interfaz simplificada');
      }

      if (userProfile.attentionSpan < 10) {
        issues.push({
          id: 'cog-002',
          type: 'info',
          category: 'cognitive',
          severity: 'medium',
          description: 'Usuario con período de atención limitado',
          recommendation: 'Habilitar modo de enfoque y ayudas de memoria',
          wcagCriteria: ['2.2.1']
        });
        recommendations.push('Habilitar modo de enfoque');
      }
    }

    // Verificar tecnologías asistivas
    if (userProfile.assistiveTechnology.includes('screen-reader') && !userProfile.preferences.screenReader) {
      issues.push({
        id: 'tech-001',
        type: 'error',
        category: 'general',
        severity: 'critical',
        description: 'Usuario usa lector de pantalla pero no está habilitado en la aplicación',
        recommendation: 'Habilitar soporte para lector de pantalla inmediatamente',
        wcagCriteria: ['1.1.1', '4.1.2']
      });
      recommendations.push('Habilitar soporte para lector de pantalla');
    }

    // Calcular puntuación de cumplimiento
    const compliance = this.calculateCompliance(issues);
    const score = this.calculateScore(issues, compliance);

    const audit: AccessibilityAudit = {
      id: `audit-${userId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      profile: userProfile,
      issues,
      recommendations: [...new Set(recommendations)],
      compliance,
      score
    };

    this.audits.set(audit.id, audit);
    return audit;
  }

  /**
   * Calcula el cumplimiento de estándares
   */
  private calculateCompliance(issues: AccessibilityIssue[]): ComplianceReport {
    const wcagIssues = issues.filter(issue => issue.wcagCriteria && issue.wcagCriteria.length > 0);
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    const highIssues = issues.filter(issue => issue.severity === 'high');

    const wcagScore = Math.max(0, 100 - (wcagIssues.length * 10));
    const section508Score = Math.max(0, 100 - (criticalIssues.length * 20) - (highIssues.length * 10));
    const localScore = Math.max(0, 100 - (issues.length * 5));

    return {
      wcag2_1: {
        level: wcagScore >= 90 ? 'AAA' : wcagScore >= 80 ? 'AA' : 'A',
        score: wcagScore,
        issues: wcagIssues.map(issue => issue.description)
      },
      section508: {
        compliant: section508Score >= 80,
        score: section508Score,
        issues: criticalIssues.concat(highIssues).map(issue => issue.description)
      },
      localRegulations: {
        compliant: localScore >= 70,
        score: localScore,
        issues: issues.map(issue => issue.description)
      }
    };
  }

  /**
   * Calcula la puntuación general de accesibilidad
   */
  private calculateScore(issues: AccessibilityIssue[], compliance: ComplianceReport): number {
    let score = 100;

    // Reducir puntuación basado en la severidad de los problemas
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    });

    // Considerar cumplimiento de estándares
    score = (score + compliance.wcag2_1.score + compliance.section508.score + compliance.localRegulations.score) / 4;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Obtiene características de accesibilidad disponibles
   */
  getFeatures(category?: string): AccessibilityFeature[] {
    if (category) {
      return this.features.filter(feature => feature.category === category);
    }
    return this.features;
  }

  /**
   * Habilita o deshabilita una característica de accesibilidad
   */
  toggleFeature(userId: string, featureId: string, enabled: boolean): boolean {
    const feature = this.features.find(f => f.id === featureId);
    if (!feature) {
      throw new Error('Característica de accesibilidad no encontrada');
    }

    feature.enabled = enabled;
    
    // Actualizar perfil del usuario si existe
    const profile = this.getProfile(userId);
    if (profile) {
      // Actualizar preferencias según la característica
      switch (featureId) {
        case 'high-contrast':
          profile.preferences.highContrast = enabled;
          break;
        case 'large-text':
          profile.preferences.largeText = enabled;
          break;
        case 'screen-reader':
          profile.preferences.screenReader = enabled;
          break;
        case 'keyboard-only':
          profile.preferences.keyboardOnly = enabled;
          break;
        case 'captions':
          profile.preferences.captions = enabled;
          break;
        case 'audio-descriptions':
          profile.preferences.audioDescriptions = enabled;
          break;
        case 'simplified-interface':
          profile.preferences.simplifiedInterface = enabled;
          break;
        case 'voice-control':
          profile.preferences.voiceControl = enabled;
          break;
      }
    }

    return enabled;
  }

  /**
   * Obtiene auditorías de un usuario
   */
  getAudits(userId: string): AccessibilityAudit[] {
    return Array.from(this.audits.values())
      .filter(audit => audit.profile === this.getProfile(userId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Obtiene la última auditoría de un usuario
   */
  getLatestAudit(userId: string): AccessibilityAudit | null {
    const audits = this.getAudits(userId);
    return audits.length > 0 ? audits[0] : null;
  }

  /**
   * Genera recomendaciones personalizadas
   */
  generateRecommendations(profile: AccessibilityProfile): string[] {
    const recommendations: string[] = [];

    // Recomendaciones basadas en perfil visual
    if (profile.visualAcuity !== 'normal') {
      recommendations.push('Habilitar alto contraste para mejorar la visibilidad');
      recommendations.push('Usar texto grande para mejor legibilidad');
      recommendations.push('Considerar usar lector de pantalla');
    }

    if (profile.colorVision !== 'normal') {
      recommendations.push('Habilitar soporte para daltonismo');
      recommendations.push('Usar patrones además de colores');
    }

    // Recomendaciones basadas en perfil auditivo
    if (profile.hearing !== 'normal') {
      recommendations.push('Habilitar subtítulos para todo el contenido multimedia');
      recommendations.push('Usar alertas visuales en lugar de auditivas');
      recommendations.push('Considerar descripciones de audio para contenido visual');
    }

    // Recomendaciones basadas en perfil motor
    if (profile.motorCoordination !== 'normal') {
      recommendations.push('Habilitar navegación completa por teclado');
      recommendations.push('Usar controles grandes y espaciados');
      recommendations.push('Considerar control por voz para limitaciones severas');
    }

    // Recomendaciones basadas en perfil cognitivo
    if (profile.cognitiveProcessing !== 'normal') {
      recommendations.push('Habilitar interfaz simplificada');
      recommendations.push('Usar ayudas de memoria y recordatorios');
      recommendations.push('Reducir distracciones y animaciones');
    }

    // Recomendaciones basadas en tecnologías asistivas
    profile.assistiveTechnology.forEach(tech => {
      switch (tech) {
        case 'screen-reader':
          recommendations.push('Asegurar compatibilidad completa con lectores de pantalla');
          break;
        case 'switch-control':
          recommendations.push('Habilitar control por interruptores');
          break;
        case 'eye-tracking':
          recommendations.push('Habilitar seguimiento ocular');
          break;
        case 'voice-control':
          recommendations.push('Habilitar control por voz');
          break;
      }
    });

    return [...new Set(recommendations)];
  }

  /**
   * Verifica compatibilidad entre características
   */
  checkCompatibility(featureIds: string[]): { compatible: boolean; conflicts: string[] } {
    const conflicts: string[] = [];
    const features = this.features.filter(f => featureIds.includes(f.id));

    for (let i = 0; i < features.length; i++) {
      for (let j = i + 1; j < features.length; j++) {
        const feature1 = features[i];
        const feature2 = features[j];

        // Verificar si son incompatibles
        if (!feature1.compatibility.includes(feature2.id) && 
            !feature2.compatibility.includes(feature1.id)) {
          conflicts.push(`${feature1.name} y ${feature2.name} pueden tener conflictos`);
        }
      }
    }

    return {
      compatible: conflicts.length === 0,
      conflicts
    };
  }
}

// Instancia singleton
export const accessibilityService = new AccessibilityService();
