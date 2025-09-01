/**
 * Índice de hooks para InclusiveAI Coach
 * Exporta todos los hooks de gamificación, analytics, IA y seguridad
 */

// Hooks de Gamificación
export { useCompetition } from './useCompetition';
export { useClan } from './useClan';
export { useEvents } from './useEvents';
export { useTrading } from './useTrading';
export { usePersonalization } from './usePersonalization';

// Hooks de Analytics
export { useHeatmap } from './useHeatmap';
export { usePredictions } from './usePredictions';
export { useABTesting } from './useABTesting';
export { useRealTimeMetrics } from './useRealTimeMetrics';
export { useExportManager } from './useExportManager';

// Hooks de IA
export { useNeedsDetection } from './useNeedsDetection';
export { useCulturalAdaptation } from './useCulturalAdaptation';
export { useVoiceGeneration } from './useVoiceGeneration';
export { useBehavioralAnalysis } from './useBehavioralAnalysis';
export { useRecommendations } from './useRecommendations';

// Hooks de Seguridad
export { useSecurityAudit } from './useSecurityAudit';
export { useRateLimit } from './useRateLimit';
export { useCSRFProtection } from './useCSRFProtection';
export { useInputValidation } from './useInputValidation';
export { usePrivacyControls } from './usePrivacyControls';

// Hooks existentes
export { useAuth } from './useAuth';
export { useSentimentAnalysis } from './useSentimentAnalysis';
export { useCulturalText } from './use-cultural-text';
export { useAccessibility } from './useAccessibility';
