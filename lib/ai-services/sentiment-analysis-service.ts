/**
 * Servicio de Análisis de Sentimientos en Tiempo Real
 * Proporciona APIs para análisis de emociones, predicción de abandono y recomendaciones
 */

import { sentimentAnalysisModel, type SentimentData, type SentimentResult, type DropoutPrediction, type EmotionTrend } from '../../ml-models/sentiment-analysis-model';
import { PrismaClient } from '@prisma/client';
import { EmotionType, AlertType, AlertSeverity } from '@prisma/client';

const prisma = new PrismaClient();

export class SentimentAnalysisService {
  private model = sentimentAnalysisModel;

  constructor() {
    this.initialize();
  }

  /**
   * Inicializa el servicio
   */
  private async initialize() {
    try {
      console.log('🧠 Inicializando servicio de análisis de sentimientos...');
      
      // Esperar a que el modelo esté listo
      let attempts = 0;
      const maxAttempts = 30;
      
      while (!this.model.isReady() && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (this.model.isReady()) {
        console.log('✅ Servicio de análisis de sentimientos inicializado');
      } else {
        console.warn('⚠️ Modelo de sentimientos no está listo después de 30 segundos');
      }
    } catch (error) {
      console.error('❌ Error inicializando servicio de sentimientos:', error);
    }
  }

  /**
   * Analiza sentimientos en tiempo real
   */
  async analyzeSentiment(data: SentimentData, studentId: string): Promise<SentimentResult> {
    try {
      if (!this.model.isReady()) {
        throw new Error('Modelo de sentimientos no está listo');
      }

      const result = await this.model.analyzeSentiment(data, studentId);
      
      // Log para debugging
      console.log(`📊 Análisis de sentimientos para estudiante ${studentId}:`, {
        emotion: result.emotion,
        sentimentScore: result.sentimentScore,
        isAlert: result.isAlert
      });

      return result;
    } catch (error) {
      console.error('Error en análisis de sentimientos:', error);
      throw error;
    }
  }

  /**
   * Analiza sentimientos de texto
   */
  async analyzeTextSentiment(text: string, studentId: string, context?: any): Promise<SentimentResult> {
    const data: SentimentData = {
      text,
      context: {
        activityType: context?.activityType || 'text_analysis',
        contentId: context?.contentId,
        sessionId: context?.sessionId,
        timestamp: new Date()
      }
    };

    return this.analyzeSentiment(data, studentId);
  }

  /**
   * Analiza sentimientos de audio
   */
  async analyzeAudioSentiment(audioFeatures: number[], studentId: string, context?: any): Promise<SentimentResult> {
    const data: SentimentData = {
      audioFeatures,
      context: {
        activityType: context?.activityType || 'audio_analysis',
        contentId: context?.contentId,
        sessionId: context?.sessionId,
        timestamp: new Date()
      }
    };

    return this.analyzeSentiment(data, studentId);
  }

  /**
   * Analiza sentimientos de comportamiento
   */
  async analyzeBehavioralSentiment(behavioralMetrics: any, studentId: string, context?: any): Promise<SentimentResult> {
    const data: SentimentData = {
      behavioralMetrics,
      context: {
        activityType: context?.activityType || 'behavioral_analysis',
        contentId: context?.contentId,
        sessionId: context?.sessionId,
        timestamp: new Date()
      }
    };

    return this.analyzeSentiment(data, studentId);
  }

  /**
   * Predice riesgo de abandono escolar
   */
  async predictDropoutRisk(studentId: string): Promise<DropoutPrediction> {
    try {
      if (!this.model.isReady()) {
        throw new Error('Modelo de sentimientos no está listo');
      }

      const prediction = await this.model.predictDropoutRisk(studentId);
      
      console.log(`🎯 Predicción de abandono para estudiante ${studentId}:`, {
        riskLevel: prediction.riskLevel,
        probability: prediction.probability
      });

      return prediction;
    } catch (error) {
      console.error('Error prediciendo riesgo de abandono:', error);
      throw error;
    }
  }

  /**
   * Obtiene tendencias de emociones
   */
  async getEmotionTrends(studentId: string, days: number = 7): Promise<EmotionTrend[]> {
    try {
      const trends = await this.model.getEmotionTrends(studentId, days);
      return trends;
    } catch (error) {
      console.error('Error obteniendo tendencias de emociones:', error);
      return [];
    }
  }

  /**
   * Obtiene análisis de sentimientos recientes
   */
  async getRecentSentimentAnalyses(studentId: string, limit: number = 20): Promise<any[]> {
    try {
      const analyses = await prisma.sentimentAnalysis.findMany({
        where: { studentId },
        orderBy: { timestamp: 'desc' },
        take: limit,
        include: {
          session: {
            select: {
              id: true,
              type: true,
              subject: true
            }
          }
        }
      });

      return analyses;
    } catch (error) {
      console.error('Error obteniendo análisis recientes:', error);
      return [];
    }
  }

  /**
   * Obtiene alertas de sentimientos no resueltas
   */
  async getUnresolvedAlerts(studentId?: string, teacherId?: string): Promise<any[]> {
    try {
      const where: any = { isResolved: false };
      
      if (studentId) {
        where.studentId = studentId;
      }
      
      if (teacherId) {
        where.teacherId = teacherId;
      }

      const alerts = await prisma.sentimentAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              age: true
            }
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return alerts;
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      return [];
    }
  }

  /**
   * Resuelve una alerta de sentimientos
   */
  async resolveAlert(alertId: string, resolvedBy: string, resolutionNotes?: string): Promise<boolean> {
    try {
      await prisma.sentimentAlert.update({
        where: { id: alertId },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy,
          resolutionNotes
        }
      });

      console.log(`✅ Alerta ${alertId} resuelta por ${resolvedBy}`);
      return true;
    } catch (error) {
      console.error('Error resolviendo alerta:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de sentimientos
   */
  async getSentimentStats(studentId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const analyses = await prisma.sentimentAnalysis.findMany({
        where: {
          studentId,
          timestamp: { gte: startDate }
        }
      });

      if (analyses.length === 0) {
        return {
          totalAnalyses: 0,
          avgSentiment: 0,
          dominantEmotion: EmotionType.NEUTRAL,
          alertCount: 0,
          engagementTrend: 0,
          stressTrend: 0
        };
      }

      // Calcular estadísticas
      const totalAnalyses = analyses.length;
      const avgSentiment = analyses.reduce((sum, a) => sum + a.sentimentScore, 0) / totalAnalyses;
      
      // Emoción dominante
      const emotionCounts = analyses.reduce((counts, a) => {
        counts[a.emotion] = (counts[a.emotion] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      const dominantEmotion = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)[0][0] as EmotionType;

      // Conteo de alertas
      const alertCount = analyses.filter(a => a.isAlert).length;

      // Tendencias
      const recentAnalyses = analyses.slice(0, 10);
      const olderAnalyses = analyses.slice(-10);
      
      const recentEngagement = recentAnalyses.reduce((sum, a) => sum + (a.engagementLevel || 0), 0) / recentAnalyses.length;
      const olderEngagement = olderAnalyses.reduce((sum, a) => sum + (a.engagementLevel || 0), 0) / olderAnalyses.length;
      const engagementTrend = recentEngagement - olderEngagement;

      const recentStress = recentAnalyses.reduce((sum, a) => sum + (a.stressLevel || 0), 0) / recentAnalyses.length;
      const olderStress = olderAnalyses.reduce((sum, a) => sum + (a.stressLevel || 0), 0) / olderAnalyses.length;
      const stressTrend = recentStress - olderStress;

      return {
        totalAnalyses,
        avgSentiment,
        dominantEmotion,
        alertCount,
        engagementTrend,
        stressTrend,
        emotionDistribution: emotionCounts
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  /**
   * Genera reporte de sentimientos
   */
  async generateSentimentReport(studentId: string, days: number = 30): Promise<any> {
    try {
      const stats = await this.getSentimentStats(studentId, days);
      const trends = await this.getEmotionTrends(studentId, days);
      const dropoutRisk = await this.predictDropoutRisk(studentId);
      const recentAlerts = await this.getUnresolvedAlerts(studentId);

      return {
        studentId,
        period: `${days} días`,
        generatedAt: new Date(),
        statistics: stats,
        trends,
        dropoutRisk,
        recentAlerts,
        recommendations: this.generateReportRecommendations(stats, dropoutRisk, trends)
      };
    } catch (error) {
      console.error('Error generando reporte:', error);
      throw error;
    }
  }

  /**
   * Genera recomendaciones basadas en el reporte
   */
  private generateReportRecommendations(stats: any, dropoutRisk: DropoutPrediction, trends: EmotionTrend[]): string[] {
    const recommendations: string[] = [];

    // Recomendaciones basadas en sentimientos
    if (stats.avgSentiment < -0.3) {
      recommendations.push('Implementar actividades de bienestar emocional');
      recommendations.push('Considerar apoyo psicológico');
    }

    if (stats.engagementTrend < -0.2) {
      recommendations.push('Revisar estrategias de engagement');
      recommendations.push('Introducir contenido más interactivo');
    }

    if (stats.stressTrend > 0.2) {
      recommendations.push('Implementar técnicas de manejo de estrés');
      recommendations.push('Reducir carga académica temporalmente');
    }

    // Recomendaciones basadas en riesgo de abandono
    if (dropoutRisk.riskLevel === 'CRITICAL' || dropoutRisk.riskLevel === 'HIGH') {
      recommendations.push('Intervención inmediata requerida');
      recommendations.push('Contacto con familia y especialistas');
    }

    // Recomendaciones basadas en tendencias
    const negativeTrends = trends.filter(t => t.avgSentiment < -0.2);
    if (negativeTrends.length > trends.length * 0.5) {
      recommendations.push('Monitoreo más frecuente del estado emocional');
      recommendations.push('Adaptar contenido a preferencias del estudiante');
    }

    return recommendations;
  }

  /**
   * Entrena el modelo con nuevos datos
   */
  async trainModel(trainingData: any[]): Promise<void> {
    try {
      await this.model.trainModel(trainingData);
      console.log('✅ Modelo de sentimientos entrenado exitosamente');
    } catch (error) {
      console.error('❌ Error entrenando modelo:', error);
      throw error;
    }
  }

  /**
   * Guarda el modelo entrenado
   */
  async saveModel(): Promise<void> {
    try {
      await this.model.saveModel();
      console.log('✅ Modelo de sentimientos guardado exitosamente');
    } catch (error) {
      console.error('❌ Error guardando modelo:', error);
      throw error;
    }
  }

  /**
   * Verifica el estado del servicio
   */
  isReady(): boolean {
    return this.model.isReady();
  }

  /**
   * Obtiene información del servicio
   */
  getServiceInfo(): any {
    return {
      name: 'SentimentAnalysisService',
      version: '1.0.0',
      isReady: this.isReady(),
      modelStatus: this.model.isReady() ? 'ready' : 'initializing',
      features: [
        'Real-time sentiment analysis',
        'Emotion detection',
        'Dropout risk prediction',
        'Behavioral analysis',
        'Alert generation',
        'Trend analysis'
      ]
    };
  }
}

// Instancia singleton
export const sentimentAnalysisService = new SentimentAnalysisService();
