import { useState, useEffect, useCallback } from 'react';
import { adaptiveAssessmentService, type AssessmentResults, type LearningRecommendation, type LearningDifficulty } from '@/lib/adaptive-assessment-service';

interface UseAdaptiveAssessmentOptions {
  studentId: string;
  subject: string;
  autoLoad?: boolean;
}

interface UseAdaptiveAssessmentReturn {
  // Estado de evaluación
  isAssessmentActive: boolean;
  currentQuestion: any;
  progress: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeSpent: number;
  
  // Estado de carga
  isLoading: boolean;
  error: string | null;
  
  // Datos
  assessmentResults: AssessmentResults | null;
  learningDifficulties: LearningDifficulty[];
  recommendations: LearningRecommendation[];
  learningInsights: any[];
  
  // Acciones
  startAssessment: () => Promise<void>;
  submitAnswer: (answer: any, confidence?: number) => Promise<void>;
  completeAssessment: () => Promise<void>;
  pauseAssessment: () => void;
  resumeAssessment: () => void;
  loadRecommendations: () => Promise<void>;
  loadDifficulties: () => Promise<void>;
  
  // Utilidades
  resetAssessment: () => void;
  getCurrentProgress: () => number;
  getEstimatedTimeRemaining: () => number;
}

export const useAdaptiveAssessment = ({
  studentId,
  subject,
  autoLoad = true
}: UseAdaptiveAssessmentOptions): UseAdaptiveAssessmentReturn => {
  // Estado de evaluación
  const [isAssessmentActive, setIsAssessmentActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timeSpent, setTimeSpent] = useState(0);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  
  // Estado de carga
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Datos
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);
  const [learningDifficulties, setLearningDifficulties] = useState<LearningDifficulty[]>([]);
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [learningInsights, setLearningInsights] = useState<any[]>([]);
  
  // Timer para tiempo de evaluación
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isAssessmentActive && !isLoading) {
      timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAssessmentActive, isLoading]);

  // Cargar datos iniciales
  useEffect(() => {
    if (autoLoad) {
      loadRecommendations();
      loadDifficulties();
    }
  }, [studentId, subject, autoLoad]);

  const startAssessment = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTimeSpent(0);
      setProgress(0);

      const response = await fetch('/api/adaptive-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          subject,
          assessmentType: 'diagnostic',
          difficulty,
          adaptiveSettings: {
            difficultyAdjustment: true,
            culturalAdaptation: true,
            accessibilityFeatures: true,
            realTimeAnalysis: true,
            personalizedFeedback: true,
            learningPathOptimization: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error iniciando evaluación');
      }

      const data = await response.json();
      
      setAssessmentId(data.assessment.assessmentId);
      setCurrentQuestion(data.assessment.questions[0]);
      setIsAssessmentActive(true);
      setProgress(0);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, subject, difficulty]);

  const submitAnswer = useCallback(async (answer: any, confidence: number = 0.5) => {
    if (!assessmentId || !currentQuestion) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/adaptive-assessment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          questionId: currentQuestion.id,
          answer,
          timeSpent: timeSpent,
          confidence,
          hintsUsed: 0,
          attempts: 1
        })
      });

      if (!response.ok) {
        throw new Error('Error procesando respuesta');
      }

      const data = await response.json();

      // Actualizar insights
      if (data.learningInsights) {
        setLearningInsights(prev => [...prev, data.learningInsights]);
      }

      // Actualizar dificultad si es necesario
      if (data.difficultyAdjustment?.direction === 'increase' && difficulty !== 'hard') {
        const newDifficulty = difficulty === 'easy' ? 'medium' : 'hard';
        setDifficulty(newDifficulty);
      } else if (data.difficultyAdjustment?.direction === 'decrease' && difficulty !== 'easy') {
        const newDifficulty = difficulty === 'hard' ? 'medium' : 'easy';
        setDifficulty(newDifficulty);
      }

      // Generar siguiente pregunta si está disponible
      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setProgress(prev => prev + (100 / 10)); // Asumiendo 10 preguntas
      } else {
        // Evaluación completada
        await completeAssessment();
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId, currentQuestion, timeSpent, difficulty]);

  const completeAssessment = useCallback(async () => {
    if (!assessmentId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/adaptive-assessment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId
        })
      });

      if (!response.ok) {
        throw new Error('Error completando evaluación');
      }

      const data = await response.json();
      
      setAssessmentResults(data.results);
      setIsAssessmentActive(false);
      setProgress(100);
      setCurrentQuestion(null);

      // Recargar recomendaciones después de completar
      await loadRecommendations();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  const pauseAssessment = useCallback(() => {
    setIsAssessmentActive(false);
  }, []);

  const resumeAssessment = useCallback(() => {
    setIsAssessmentActive(true);
  }, []);

  const loadRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/adaptive-assessment?studentId=${studentId}&type=recommendations&subject=${subject}`);
      
      if (!response.ok) {
        throw new Error('Error cargando recomendaciones');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, subject]);

  const loadDifficulties = useCallback(async () => {
    try {
      const difficulties = await adaptiveAssessmentService.detectLearningDifficulties(studentId);
      setLearningDifficulties(difficulties);
    } catch (err) {
      console.error('Error cargando dificultades:', err);
    }
  }, [studentId]);

  const resetAssessment = useCallback(() => {
    setIsAssessmentActive(false);
    setCurrentQuestion(null);
    setProgress(0);
    setTimeSpent(0);
    setAssessmentId(null);
    setAssessmentResults(null);
    setError(null);
  }, []);

  const getCurrentProgress = useCallback(() => {
    return progress;
  }, [progress]);

  const getEstimatedTimeRemaining = useCallback(() => {
    if (progress === 0) return 0;
    
    const averageTimePerQuestion = timeSpent / (progress / 10); // Asumiendo 10 preguntas
    const remainingQuestions = 10 - (progress / 10);
    
    return Math.round(averageTimePerQuestion * remainingQuestions);
  }, [progress, timeSpent]);

  return {
    // Estado de evaluación
    isAssessmentActive,
    currentQuestion,
    progress,
    difficulty,
    timeSpent,
    
    // Estado de carga
    isLoading,
    error,
    
    // Datos
    assessmentResults,
    learningDifficulties,
    recommendations,
    learningInsights,
    
    // Acciones
    startAssessment,
    submitAnswer,
    completeAssessment,
    pauseAssessment,
    resumeAssessment,
    loadRecommendations,
    loadDifficulties,
    
    // Utilidades
    resetAssessment,
    getCurrentProgress,
    getEstimatedTimeRemaining
  };
};
