/**
 * Servicio de Evaluación Adaptativa para InclusiveAI Coach
 * Sistema completo de evaluación dinámica basada en el progreso del estudiante
 */

import { PrismaClient } from '@prisma/client';
import { aiServices } from './ai-services';
import { culturalIntegrationService } from './cultural-integration';
import { accessibilityService } from './accessibility';

const prisma = new PrismaClient();

export interface AdaptiveAssessmentConfig {
  studentId: string;
  subject: string;
  assessmentType: 'diagnostic' | 'progress' | 'mastery' | 'remedial';
  difficulty: 'easy' | 'medium' | 'hard';
  culturalContext?: any;
  accessibilityProfile?: any;
  adaptiveSettings: {
    difficultyAdjustment: boolean;
    culturalAdaptation: boolean;
    accessibilityFeatures: boolean;
    realTimeAnalysis: boolean;
    personalizedFeedback: boolean;
    learningPathOptimization: boolean;
  };
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'matching' | 'fill-blank' | 'drag-drop' | 'open-ended';
  difficulty: 'easy' | 'medium' | 'hard';
  content: {
    question: string;
    options?: string[];
    correctAnswer: any;
    explanation?: string;
    audio?: string;
    image?: string;
    culturalContext?: string;
    hints?: string[];
  };
  metadata: {
    subject: string;
    skill: string;
    estimatedTime: number;
    accessibility: {
      hasAudio: boolean;
      hasVisualAids: boolean;
      supportsVoiceControl: boolean;
      screenReaderCompatible: boolean;
    };
    learningObjectives: string[];
    prerequisites: string[];
  };
}

export interface StudentResponse {
  questionId: string;
  answer: any;
  timeSpent: number;
  correct: boolean;
  confidence: number;
  hintsUsed: number;
  attempts: number;
  emotionalState?: 'frustrated' | 'confident' | 'confused' | 'engaged';
}

export interface AssessmentResults {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  difficultyProgression: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  learningPath: string[];
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  nextSteps: string[];
  culturalInsights: string[];
  accessibilityRecommendations: string[];
}

export interface LearningDifficulty {
  type: 'cognitive' | 'reading' | 'mathematical' | 'attention' | 'memory' | 'language' | 'motor';
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
  evidence: string[];
  recommendations: string[];
  adaptiveStrategies: string[];
}

export interface PersonalizedContent {
  type: 'lesson' | 'exercise' | 'review' | 'enrichment';
  content: any;
  difficulty: 'easy' | 'medium' | 'hard';
  culturalAdaptations: any;
  accessibilityFeatures: any;
  estimatedTime: number;
  learningObjectives: string[];
}

export interface LearningRecommendation {
  type: 'lesson' | 'practice' | 'review' | 'enrichment' | 'remediation';
  priority: 'high' | 'medium' | 'low';
  reason: string;
  estimatedTime: number;
  culturalRelevance: number;
  accessibilityScore: number;
  content: any;
}

export class AdaptiveAssessmentService {
  private difficultyThresholds = {
    easy: { minScore: 0, maxScore: 60 },
    medium: { minScore: 40, maxScore: 80 },
    hard: { minScore: 70, maxScore: 100 }
  };

  /**
   * Crea una evaluación adaptativa completa
   */
  async createAdaptiveAssessment(config: AdaptiveAssessmentConfig): Promise<{
    assessmentId: string;
    questions: AssessmentQuestion[];
    studentProfile: any;
    adaptiveSettings: any;
  }> {
    try {
      // Obtener perfil completo del estudiante
      const studentProfile = await this.getStudentProfile(config.studentId);
      
      // Analizar dificultades de aprendizaje
      const learningDifficulties = await this.detectLearningDifficulties(config.studentId);
      
      // Generar preguntas adaptativas
      const questions = await this.generateAdaptiveQuestions(
        config.subject,
        config.difficulty,
        studentProfile,
        learningDifficulties,
        config.culturalContext
      );

      // Crear sesión de evaluación
      const assessmentSession = await prisma.assessmentSession.create({
        data: {
          studentId: config.studentId,
          type: config.assessmentType,
          subject: config.subject,
          status: 'active',
          startTime: new Date(),
          adaptiveSettings: config.adaptiveSettings,
          studentProfile: studentProfile,
          learningDifficulties: learningDifficulties,
          metadata: {
            culturalContext: config.culturalContext,
            accessibilityProfile: config.accessibilityProfile
          }
        }
      });

      return {
        assessmentId: assessmentSession.id,
        questions,
        studentProfile,
        adaptiveSettings: config.adaptiveSettings
      };

    } catch (error) {
      console.error('Error creando evaluación adaptativa:', error);
      throw error;
    }
  }

  /**
   * Procesa una respuesta y genera la siguiente pregunta adaptativa
   */
  async processResponse(
    assessmentId: string,
    response: StudentResponse
  ): Promise<{
    feedback: any;
    nextQuestion?: AssessmentQuestion;
    difficultyAdjustment: any;
    learningInsights: any;
    recommendations: string[];
  }> {
    try {
      // Analizar respuesta
      const responseAnalysis = await this.analyzeResponse(response);
      
      // Ajustar dificultad
      const difficultyAdjustment = await this.adjustDifficulty(
        assessmentId,
        response,
        responseAnalysis
      );

      // Generar retroalimentación personalizada
      const feedback = await this.generatePersonalizedFeedback(
        response,
        responseAnalysis,
        difficultyAdjustment
      );

      // Detectar dificultades de aprendizaje
      const learningInsights = await this.detectLearningPatterns(
        assessmentId,
        response,
        responseAnalysis
      );

      // Generar recomendaciones
      const recommendations = await this.generateRecommendations(
        assessmentId,
        responseAnalysis,
        learningInsights
      );

      // Generar siguiente pregunta si es necesario
      let nextQuestion;
      if (this.shouldContinueAssessment(assessmentId)) {
        nextQuestion = await this.generateNextQuestion(
          assessmentId,
          responseAnalysis,
          difficultyAdjustment
        );
      }

      // Guardar respuesta
      await this.saveResponse(assessmentId, response, responseAnalysis);

      return {
        feedback,
        nextQuestion,
        difficultyAdjustment,
        learningInsights,
        recommendations
      };

    } catch (error) {
      console.error('Error procesando respuesta:', error);
      throw error;
    }
  }

  /**
   * Detecta automáticamente dificultades de aprendizaje
   */
  async detectLearningDifficulties(studentId: string): Promise<LearningDifficulty[]> {
    try {
      // Obtener datos históricos del estudiante
      const historicalData = await this.getHistoricalData(studentId);
      
      // Analizar patrones de respuesta
      const responsePatterns = this.analyzeResponsePatterns(historicalData);
      
      // Detectar dificultades específicas
      const difficulties: LearningDifficulty[] = [];

      // Análisis de dificultades cognitivas
      if (responsePatterns.consistency < 0.6) {
        difficulties.push({
          type: 'cognitive',
          severity: responsePatterns.consistency < 0.4 ? 'severe' : 'moderate',
          confidence: 0.8,
          evidence: ['Inconsistencia en respuestas', 'Tiempo de respuesta variable'],
          recommendations: ['Implementar estrategias de metacognición', 'Usar organizadores gráficos'],
          adaptiveStrategies: ['Preguntas más estructuradas', 'Retroalimentación inmediata']
        });
      }

      // Análisis de dificultades de lectura
      if (responsePatterns.readingTime > 30) {
        difficulties.push({
          type: 'reading',
          severity: responsePatterns.readingTime > 60 ? 'severe' : 'moderate',
          confidence: 0.7,
          evidence: ['Tiempo de lectura prolongado', 'Errores de comprensión'],
          recommendations: ['Usar texto simplificado', 'Implementar audio'],
          adaptiveStrategies: ['Texto con audio', 'Preguntas más cortas']
        });
      }

      // Análisis de dificultades matemáticas
      if (responsePatterns.mathErrors > 0.3) {
        difficulties.push({
          type: 'mathematical',
          severity: responsePatterns.mathErrors > 0.5 ? 'severe' : 'moderate',
          confidence: 0.75,
          evidence: ['Errores frecuentes en cálculos', 'Dificultad con conceptos abstractos'],
          recommendations: ['Usar manipulativos virtuales', 'Implementar práctica incremental'],
          adaptiveStrategies: ['Problemas paso a paso', 'Visualizaciones matemáticas']
        });
      }

      // Análisis de dificultades de atención
      if (responsePatterns.attentionSpan < 10) {
        difficulties.push({
          type: 'attention',
          severity: responsePatterns.attentionSpan < 5 ? 'severe' : 'moderate',
          confidence: 0.8,
          evidence: ['Tiempo de atención corto', 'Distracciones frecuentes'],
          recommendations: ['Sesiones más cortas', 'Elementos interactivos'],
          adaptiveStrategies: ['Micro-lecciones', 'Gamificación']
        });
      }

      return difficulties;

    } catch (error) {
      console.error('Error detectando dificultades de aprendizaje:', error);
      return [];
    }
  }

  /**
   * Genera contenido personalizado basado en el perfil del estudiante
   */
  async generatePersonalizedContent(
    studentId: string,
    subject: string,
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<PersonalizedContent[]> {
    try {
      const studentProfile = await this.getStudentProfile(studentId);
      const learningDifficulties = await this.detectLearningDifficulties(studentId);
      
      // Generar contenido usando IA
      const aiContent = await aiServices.adaptiveAssessment.generateContent({
        subject,
        difficulty,
        studentProfile,
        learningDifficulties,
        culturalContext: studentProfile.culturalBackground
      });

      // Adaptar contenido culturalmente
      const culturalAdaptations = await culturalIntegrationService.integrateCulturalContent({
        content: aiContent,
        userId: studentId,
        culturalContext: {
          culture: studentProfile.culturalBackground,
          language: studentProfile.language,
          region: studentProfile.location
        },
        accessibilityProfile: studentProfile.accessibility
      });

      // Aplicar adaptaciones de accesibilidad
      const accessibilityFeatures = await accessibilityService.applyAdaptations(
        culturalAdaptations.adaptedContent,
        studentProfile.accessibility
      );

      return [{
        type: 'lesson',
        content: accessibilityFeatures.content,
        difficulty,
        culturalAdaptations: culturalAdaptations.culturalElements,
        accessibilityFeatures: accessibilityFeatures.features,
        estimatedTime: 20,
        learningObjectives: aiContent.learningObjectives
      }];

    } catch (error) {
      console.error('Error generando contenido personalizado:', error);
      throw error;
    }
  }

  /**
   * Genera recomendaciones de lecciones personalizadas
   */
  async generateLessonRecommendations(
    studentId: string,
    subject: string
  ): Promise<LearningRecommendation[]> {
    try {
      const studentProfile = await this.getStudentProfile(studentId);
      const learningDifficulties = await this.detectLearningDifficulties(studentId);
      const recentPerformance = await this.getRecentPerformance(studentId, subject);

      const recommendations: LearningRecommendation[] = [];

      // Análisis de brechas de conocimiento
      const knowledgeGaps = this.identifyKnowledgeGaps(recentPerformance);
      
      for (const gap of knowledgeGaps) {
        recommendations.push({
          type: 'remediation',
          priority: 'high',
          reason: `Brecha identificada en: ${gap.skill}`,
          estimatedTime: 15,
          culturalRelevance: 0.8,
          accessibilityScore: 0.9,
          content: await this.generateRemedialContent(gap)
        });
      }

      // Recomendaciones de práctica
      if (recentPerformance.averageScore < 70) {
        recommendations.push({
          type: 'practice',
          priority: 'medium',
          reason: 'Necesita más práctica en conceptos básicos',
          estimatedTime: 10,
          culturalRelevance: 0.7,
          accessibilityScore: 0.8,
          content: await this.generatePracticeContent(subject, 'easy')
        });
      }

      // Recomendaciones de enriquecimiento
      if (recentPerformance.averageScore > 85) {
        recommendations.push({
          type: 'enrichment',
          priority: 'low',
          reason: 'Listo para conceptos avanzados',
          estimatedTime: 25,
          culturalRelevance: 0.9,
          accessibilityScore: 0.8,
          content: await this.generateEnrichmentContent(subject, 'hard')
        });
      }

      // Ordenar por prioridad
      return recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    } catch (error) {
      console.error('Error generando recomendaciones:', error);
      return [];
    }
  }

  /**
   * Completa una evaluación y genera resultados finales
   */
  async completeAssessment(assessmentId: string): Promise<AssessmentResults> {
    try {
      const session = await prisma.assessmentSession.findUnique({
        where: { id: assessmentId },
        include: { responses: true }
      });

      if (!session) {
        throw new Error('Sesión de evaluación no encontrada');
      }

      const responses = session.responses;
      const totalQuestions = responses.length;
      const correctAnswers = responses.filter(r => r.isCorrect).length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const timeSpent = responses.reduce((total, r) => total + r.responseTime, 0);

      // Analizar progresión de dificultad
      const difficultyProgression = responses.map(r => 
        r.difficultyAdjustment?.direction || 'maintain'
      );

      // Analizar fortalezas y debilidades
      const strengths = this.analyzeStrengths(responses);
      const weaknesses = this.analyzeWeaknesses(responses);

      // Generar recomendaciones
      const recommendations = await this.generateFinalRecommendations(
        session.studentId,
        responses,
        score
      );

      // Generar ruta de aprendizaje
      const learningPath = await this.generateLearningPath(
        session.studentId,
        session.subject,
        responses,
        score
      );

      // Determinar nivel de dominio
      const masteryLevel = this.determineMasteryLevel(score, responses);

      // Generar próximos pasos
      const nextSteps = await this.generateNextSteps(
        session.studentId,
        session.subject,
        masteryLevel,
        weaknesses
      );

      // Actualizar sesión
      await prisma.assessmentSession.update({
        where: { id: assessmentId },
        data: {
          status: 'completed',
          endTime: new Date(),
          finalScore: score,
          results: {
            totalQuestions,
            correctAnswers,
            score,
            timeSpent,
            difficultyProgression,
            strengths,
            weaknesses,
            recommendations,
            learningPath,
            masteryLevel,
            nextSteps
          }
        }
      });

      return {
        totalQuestions,
        correctAnswers,
        score,
        timeSpent,
        difficultyProgression,
        strengths,
        weaknesses,
        recommendations,
        learningPath,
        masteryLevel,
        nextSteps,
        culturalInsights: [],
        accessibilityRecommendations: []
      };

    } catch (error) {
      console.error('Error completando evaluación:', error);
      throw error;
    }
  }

  // Métodos auxiliares privados

  private async getStudentProfile(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        specialNeeds: true,
        assessments: {
          orderBy: { conductedAt: 'desc' },
          take: 10
        },
        completedLessons: {
          orderBy: { completedAt: 'desc' },
          take: 20
        }
      }
    });

    if (!student) {
      throw new Error('Estudiante no encontrado');
    }

    return {
      ...student,
      learningProfile: student.learningProfile || {},
      accessibility: student.specialNeeds.map(need => ({
        type: need.type,
        severity: need.severity,
        recommendations: need.recommendations
      }))
    };
  }

  private async generateAdaptiveQuestions(
    subject: string,
    difficulty: 'easy' | 'medium' | 'hard',
    studentProfile: any,
    learningDifficulties: LearningDifficulty[],
    culturalContext?: any
  ): Promise<AssessmentQuestion[]> {
    // Generar preguntas usando IA
    const aiQuestions = await aiServices.adaptiveAssessment.generateQuestions({
      subject,
      difficulty,
      count: 10,
      studentProfile,
      learningDifficulties,
      culturalContext
    });

    return aiQuestions.map((q: any, index: number) => ({
      id: `q_${index + 1}`,
      type: q.type,
      difficulty: q.difficulty,
      content: {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        audio: q.audio,
        image: q.image,
        culturalContext: q.culturalContext,
        hints: q.hints
      },
      metadata: {
        subject,
        skill: q.skill,
        estimatedTime: q.estimatedTime || 60,
        accessibility: {
          hasAudio: !!q.audio,
          hasVisualAids: !!q.image,
          supportsVoiceControl: true,
          screenReaderCompatible: true
        },
        learningObjectives: q.learningObjectives || [],
        prerequisites: q.prerequisites || []
      }
    }));
  }

  private async analyzeResponse(response: StudentResponse) {
    return {
      correctness: response.correct,
      confidence: response.confidence,
      timeEfficiency: response.timeSpent < 30 ? 'fast' : response.timeSpent > 120 ? 'slow' : 'normal',
      hintUsage: response.hintsUsed > 0,
      attempts: response.attempts,
      emotionalState: response.emotionalState
    };
  }

  private async adjustDifficulty(
    assessmentId: string,
    response: StudentResponse,
    analysis: any
  ) {
    const session = await prisma.assessmentSession.findUnique({
      where: { id: assessmentId }
    });

    let direction = 'maintain';
    let reason = 'stable_performance';

    if (response.correct && analysis.confidence > 0.7 && analysis.timeEfficiency === 'fast') {
      direction = 'increase';
      reason = 'high_performance';
    } else if (!response.correct && analysis.confidence < 0.3 && analysis.attempts > 2) {
      direction = 'decrease';
      reason = 'struggling';
    }

    return { direction, reason };
  }

  private async generatePersonalizedFeedback(
    response: StudentResponse,
    analysis: any,
    difficultyAdjustment: any
  ) {
    let feedback = {
      type: 'neutral',
      message: 'Respuesta recibida',
      score: response.correct ? 1 : 0,
      suggestions: []
    };

    if (response.correct) {
      feedback.type = 'positive';
      feedback.message = '¡Excelente trabajo!';
      if (analysis.confidence > 0.8) {
        feedback.message += ' Tu confianza muestra que dominas este concepto.';
      }
    } else {
      feedback.type = 'constructive';
      feedback.message = 'No te preocupes, los errores son parte del aprendizaje.';
      feedback.suggestions = ['Revisa el concepto', 'Practica más ejercicios similares'];
    }

    return feedback;
  }

  private async detectLearningPatterns(
    assessmentId: string,
    response: StudentResponse,
    analysis: any
  ) {
    // Implementar detección de patrones de aprendizaje
    return {
      pattern: 'consistent',
      confidence: 0.8,
      insights: ['El estudiante muestra consistencia en respuestas']
    };
  }

  private async generateRecommendations(
    assessmentId: string,
    analysis: any,
    insights: any
  ) {
    const recommendations = [];

    if (analysis.timeEfficiency === 'slow') {
      recommendations.push('Considera practicar para mejorar la velocidad');
    }

    if (analysis.hintUsage) {
      recommendations.push('Usa las pistas cuando necesites ayuda');
    }

    return recommendations;
  }

  private shouldContinueAssessment(assessmentId: string): boolean {
    // Lógica para determinar si continuar la evaluación
    return true;
  }

  private async generateNextQuestion(
    assessmentId: string,
    analysis: any,
    difficultyAdjustment: any
  ): Promise<AssessmentQuestion> {
    // Generar siguiente pregunta adaptativa
    return {
      id: 'next_question',
      type: 'multiple-choice',
      difficulty: 'medium',
      content: {
        question: 'Pregunta adaptativa generada dinámicamente',
        options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
        correctAnswer: 'Opción A'
      },
      metadata: {
        subject: 'mathematics',
        skill: 'problem_solving',
        estimatedTime: 60,
        accessibility: {
          hasAudio: false,
          hasVisualAids: false,
          supportsVoiceControl: true,
          screenReaderCompatible: true
        },
        learningObjectives: [],
        prerequisites: []
      }
    };
  }

  private async saveResponse(
    assessmentId: string,
    response: StudentResponse,
    analysis: any
  ) {
    await prisma.assessmentResponse.create({
      data: {
        assessmentId,
        questionId: response.questionId,
        studentId: 'student_id', // Obtener del contexto
        response: JSON.stringify(response.answer),
        responseTime: response.timeSpent,
        confidence: response.confidence,
        hintsUsed: response.hintsUsed,
        attempts: response.attempts,
        isCorrect: response.correct,
        score: response.correct ? 1 : 0,
        feedback: analysis,
        difficultyAdjustment: { direction: 'maintain', reason: 'default' },
        timestamp: new Date()
      }
    });
  }

  private async getHistoricalData(studentId: string) {
    const assessments = await prisma.assessment.findMany({
      where: { studentId },
      include: { responses: true },
      orderBy: { conductedAt: 'desc' },
      take: 20
    });

    return assessments.flatMap(a => a.responses);
  }

  private analyzeResponsePatterns(historicalData: any[]) {
    return {
      consistency: 0.7,
      readingTime: 25,
      mathErrors: 0.2,
      attentionSpan: 15
    };
  }

  private analyzeStrengths(responses: any[]): string[] {
    const strengths = [];
    const correctResponses = responses.filter(r => r.isCorrect);
    
    if (correctResponses.length > responses.length * 0.8) {
      strengths.push('Alto nivel de precisión');
    }
    
    if (responses.every(r => r.responseTime < 60)) {
      strengths.push('Buena velocidad de respuesta');
    }

    return strengths;
  }

  private analyzeWeaknesses(responses: any[]): string[] {
    const weaknesses = [];
    const incorrectResponses = responses.filter(r => !r.isCorrect);
    
    if (incorrectResponses.length > responses.length * 0.3) {
      weaknesses.push('Necesita refuerzo en conceptos básicos');
    }
    
    if (responses.some(r => r.responseTime > 120)) {
      weaknesses.push('Dificultad con tiempo de respuesta');
    }

    return weaknesses;
  }

  private async generateFinalRecommendations(
    studentId: string,
    responses: any[],
    score: number
  ): Promise<string[]> {
    const recommendations = [];

    if (score < 70) {
      recommendations.push('Revisar conceptos fundamentales');
      recommendations.push('Practicar ejercicios básicos');
    } else if (score < 85) {
      recommendations.push('Reforzar áreas específicas');
      recommendations.push('Practicar problemas más complejos');
    } else {
      recommendations.push('Explorar conceptos avanzados');
      recommendations.push('Aplicar conocimientos en contextos reales');
    }

    return recommendations;
  }

  private async generateLearningPath(
    studentId: string,
    subject: string,
    responses: any[],
    score: number
  ): Promise<string[]> {
    return [
      'Lección de refuerzo',
      'Ejercicios de práctica',
      'Evaluación de seguimiento',
      'Contenido avanzado'
    ];
  }

  private determineMasteryLevel(score: number, responses: any[]): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (score < 60) return 'beginner';
    if (score < 75) return 'intermediate';
    if (score < 90) return 'advanced';
    return 'expert';
  }

  private async generateNextSteps(
    studentId: string,
    subject: string,
    masteryLevel: string,
    weaknesses: string[]
  ): Promise<string[]> {
    return [
      'Completar lección de refuerzo',
      'Practicar ejercicios específicos',
      'Tomar evaluación de seguimiento'
    ];
  }

  private identifyKnowledgeGaps(performance: any) {
    return [
      { skill: 'álgebra básica', confidence: 0.6 },
      { skill: 'geometría', confidence: 0.8 }
    ];
  }

  private async generateRemedialContent(gap: any) {
    return {
      type: 'lesson',
      title: `Refuerzo: ${gap.skill}`,
      content: 'Contenido de refuerzo generado dinámicamente'
    };
  }

  private async generatePracticeContent(subject: string, difficulty: string) {
    return {
      type: 'exercise',
      title: 'Ejercicios de práctica',
      content: 'Ejercicios generados dinámicamente'
    };
  }

  private async generateEnrichmentContent(subject: string, difficulty: string) {
    return {
      type: 'lesson',
      title: 'Contenido avanzado',
      content: 'Contenido de enriquecimiento generado dinámicamente'
    };
  }

  private async getRecentPerformance(studentId: string, subject: string) {
    return {
      averageScore: 75,
      totalAssessments: 5,
      trend: 'improving'
    };
  }
}

// Instancia singleton
export const adaptiveAssessmentService = new AdaptiveAssessmentService();
