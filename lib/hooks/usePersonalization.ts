/**
 * Hook para manejo de personalización del usuario
 * Proporciona funcionalidades para preferencias, temas, configuración y adaptación cultural
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { GamificationService } from '../gamification-service';

// Interfaces
interface UserPreferences {
  id: string;
  userId: string;
  
  // Preferencias de interfaz
  theme: 'LIGHT' | 'DARK' | 'AUTO' | 'HIGH_CONTRAST' | 'CULTURAL';
  language: string;
  fontSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
  colorScheme: 'DEFAULT' | 'PROTANOPIA' | 'DEUTERANOPIA' | 'TRITANOPIA' | 'MONOCHROME';
  
  // Preferencias de accesibilidad
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  voiceNavigation: boolean;
  
  // Preferencias de contenido
  contentDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ADAPTIVE';
  learningStyle: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'READING' | 'MIXED';
  culturalContext: string;
  contentLanguage: string;
  
  // Preferencias de gamificación
  gamificationLevel: 'MINIMAL' | 'MODERATE' | 'INTENSE';
  notifications: {
    achievements: boolean;
    competitions: boolean;
    events: boolean;
    reminders: boolean;
    social: boolean;
  };
  
  // Preferencias de privacidad
  dataSharing: 'NONE' | 'ANONYMOUS' | 'AGGREGATED' | 'PERSONAL';
  analyticsOptIn: boolean;
  socialFeatures: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

interface CulturalAdaptation {
  id: string;
  userId: string;
  culturalBackground: string;
  language: string;
  region: string;
  adaptations: {
    contentStyle: string;
    examples: string[];
    references: string[];
    symbols: string[];
    colors: string[];
    [key: string]: any;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: string;
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  isCustom: boolean;
  isActive: boolean;
}

interface PersonalizationStats {
  totalCustomizations: number;
  themeUsage: Record<string, number>;
  languageUsage: Record<string, number>;
  accessibilityFeatures: Record<string, boolean>;
  culturalAdaptations: number;
  lastUpdated: Date;
}

interface UsePersonalizationReturn {
  // Estado
  preferences: UserPreferences | null;
  culturalAdaptation: CulturalAdaptation | null;
  availableThemes: UserTheme[];
  currentTheme: UserTheme | null;
  stats: PersonalizationStats;
  loading: boolean;
  error: string | null;
  
  // Acciones de preferencias
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
  exportPreferences: () => Promise<string>;
  importPreferences: (preferencesData: string) => Promise<void>;
  
  // Acciones de tema
  setTheme: (themeId: string) => Promise<void>;
  createCustomTheme: (themeData: Partial<UserTheme>) => Promise<UserTheme>;
  updateTheme: (themeId: string, updates: Partial<UserTheme>) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  
  // Acciones de adaptación cultural
  updateCulturalAdaptation: (adaptation: Partial<CulturalAdaptation>) => Promise<void>;
  detectCulturalContext: () => Promise<void>;
  applyCulturalAdaptation: (culturalBackground: string) => Promise<void>;
  
  // Acciones de accesibilidad
  toggleAccessibilityFeature: (feature: keyof UserPreferences) => Promise<void>;
  applyAccessibilityPreset: (preset: 'BASIC' | 'ADVANCED' | 'PROFESSIONAL') => Promise<void>;
  
  // Utilidades
  getCurrentTheme: () => UserTheme | null;
  getCulturalContext: () => string;
  getAccessibilityLevel: () => number;
  getPersonalizationScore: () => number;
  hasCustomizations: () => boolean;
  getRecommendations: () => string[];
  validatePreferences: (preferences: Partial<UserPreferences>) => boolean;
}

export const usePersonalization = (): UsePersonalizationReturn => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [culturalAdaptation, setCulturalAdaptation] = useState<CulturalAdaptation | null>(null);
  const [availableThemes, setAvailableThemes] = useState<UserTheme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<UserTheme | null>(null);
  const [stats, setStats] = useState<PersonalizationStats>({
    totalCustomizations: 0,
    themeUsage: {},
    languageUsage: {},
    accessibilityFeatures: {},
    culturalAdaptations: 0,
    lastUpdated: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gamificationService = new GamificationService();

  // Cargar preferencias del usuario
  const loadUserPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [userPreferences, userCulturalAdaptation, themes, userStats] = await Promise.all([
        gamificationService.getUserPreferences(user.id),
        gamificationService.getCulturalAdaptation(user.id),
        gamificationService.getAvailableThemes(),
        gamificationService.getPersonalizationStats(user.id)
      ]);
      
      setPreferences(userPreferences);
      setCulturalAdaptation(userCulturalAdaptation);
      setAvailableThemes(themes);
      setStats(userStats);
      
      // Establecer tema actual
      if (userPreferences?.theme) {
        const theme = themes.find(t => t.id === userPreferences.theme || t.name === userPreferences.theme);
        setCurrentTheme(theme || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar preferencias');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Actualizar preferencias
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const updatedPreferences = await gamificationService.updateUserPreferences(user.id, updates);
      
      setPreferences(updatedPreferences);
      
      // Actualizar tema si cambió
      if (updates.theme && updatedPreferences.theme !== preferences?.theme) {
        const theme = availableThemes.find(t => t.id === updatedPreferences.theme || t.name === updatedPreferences.theme);
        setCurrentTheme(theme || null);
      }
      
      // Recalcular estadísticas
      const userStats = await gamificationService.getPersonalizationStats(user.id);
      setStats(userStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar preferencias');
      throw err;
    }
  }, [user?.id, preferences?.theme, availableThemes]);

  // Resetear preferencias
  const resetPreferences = useCallback(async (): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const defaultPreferences = await gamificationService.resetUserPreferences(user.id);
      
      setPreferences(defaultPreferences);
      setCurrentTheme(null);
      
      // Recargar estadísticas
      const userStats = await gamificationService.getPersonalizationStats(user.id);
      setStats(userStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al resetear preferencias');
      throw err;
    }
  }, [user?.id]);

  // Exportar preferencias
  const exportPreferences = useCallback(async (): Promise<string> => {
    if (!preferences) throw new Error('No hay preferencias para exportar');
    
    try {
      const exportData = {
        preferences,
        culturalAdaptation,
        currentTheme,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar preferencias');
      throw err;
    }
  }, [preferences, culturalAdaptation, currentTheme]);

  // Importar preferencias
  const importPreferences = useCallback(async (preferencesData: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const importData = JSON.parse(preferencesData);
      
      if (importData.preferences) {
        await gamificationService.importUserPreferences(user.id, importData.preferences);
        
        // Recargar preferencias
        await loadUserPreferences();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar preferencias');
      throw err;
    }
  }, [user?.id, loadUserPreferences]);

  // Establecer tema
  const setTheme = useCallback(async (themeId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.setUserTheme(user.id, themeId);
      
      const theme = availableThemes.find(t => t.id === themeId);
      setCurrentTheme(theme || null);
      
      // Actualizar preferencias
      if (preferences) {
        setPreferences(prev => prev ? { ...prev, theme: themeId as any } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al establecer tema');
      throw err;
    }
  }, [user?.id, availableThemes, preferences]);

  // Crear tema personalizado
  const createCustomTheme = useCallback(async (themeData: Partial<UserTheme>): Promise<UserTheme> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const newTheme = await gamificationService.createCustomTheme(user.id, themeData);
      
      setAvailableThemes(prev => [...prev, newTheme]);
      return newTheme;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear tema personalizado');
      throw err;
    }
  }, [user?.id]);

  // Actualizar tema
  const updateTheme = useCallback(async (themeId: string, updates: Partial<UserTheme>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.updateTheme(themeId, updates);
      
      setAvailableThemes(prev => prev.map(theme => 
        theme.id === themeId ? { ...theme, ...updates } : theme
      ));
      
      // Actualizar tema actual si es el que se está editando
      if (currentTheme?.id === themeId) {
        setCurrentTheme(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar tema');
      throw err;
    }
  }, [user?.id, currentTheme?.id]);

  // Eliminar tema
  const deleteTheme = useCallback(async (themeId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.deleteTheme(themeId);
      
      setAvailableThemes(prev => prev.filter(theme => theme.id !== themeId));
      
      // Resetear tema actual si se eliminó
      if (currentTheme?.id === themeId) {
        setCurrentTheme(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar tema');
      throw err;
    }
  }, [user?.id, currentTheme?.id]);

  // Actualizar adaptación cultural
  const updateCulturalAdaptation = useCallback(async (adaptation: Partial<CulturalAdaptation>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const updatedAdaptation = await gamificationService.updateCulturalAdaptation(user.id, adaptation);
      
      setCulturalAdaptation(updatedAdaptation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar adaptación cultural');
      throw err;
    }
  }, [user?.id]);

  // Detectar contexto cultural
  const detectCulturalContext = useCallback(async (): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const detectedContext = await gamificationService.detectCulturalContext(user.id);
      
      if (detectedContext) {
        setCulturalAdaptation(detectedContext);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al detectar contexto cultural');
      throw err;
    }
  }, [user?.id]);

  // Aplicar adaptación cultural
  const applyCulturalAdaptation = useCallback(async (culturalBackground: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const adaptation = await gamificationService.applyCulturalAdaptation(user.id, culturalBackground);
      
      setCulturalAdaptation(adaptation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aplicar adaptación cultural');
      throw err;
    }
  }, [user?.id]);

  // Alternar característica de accesibilidad
  const toggleAccessibilityFeature = useCallback(async (feature: keyof UserPreferences): Promise<void> => {
    if (!preferences) return;
    
    const currentValue = preferences[feature];
    const newValue = typeof currentValue === 'boolean' ? !currentValue : currentValue;
    
    await updatePreferences({ [feature]: newValue } as any);
  }, [preferences, updatePreferences]);

  // Aplicar preset de accesibilidad
  const applyAccessibilityPreset = useCallback(async (preset: 'BASIC' | 'ADVANCED' | 'PROFESSIONAL'): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const presetPreferences = await gamificationService.getAccessibilityPreset(preset);
      
      await updatePreferences(presetPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aplicar preset de accesibilidad');
      throw err;
    }
  }, [user?.id, updatePreferences]);

  // Utilidades
  const getCurrentTheme = useCallback((): UserTheme | null => {
    return currentTheme;
  }, [currentTheme]);

  const getCulturalContext = useCallback((): string => {
    return culturalAdaptation?.culturalBackground || 'default';
  }, [culturalAdaptation]);

  const getAccessibilityLevel = useCallback((): number => {
    if (!preferences) return 0;
    
    let level = 0;
    if (preferences.screenReader) level += 1;
    if (preferences.highContrast) level += 1;
    if (preferences.largeText) level += 1;
    if (preferences.reducedMotion) level += 1;
    if (preferences.voiceNavigation) level += 1;
    
    return level;
  }, [preferences]);

  const getPersonalizationScore = useCallback((): number => {
    if (!preferences) return 0;
    
    let score = 0;
    
    // Puntos por personalización básica
    if (preferences.theme !== 'LIGHT') score += 10;
    if (preferences.fontSize !== 'MEDIUM') score += 5;
    if (preferences.colorScheme !== 'DEFAULT') score += 10;
    
    // Puntos por accesibilidad
    score += getAccessibilityLevel() * 15;
    
    // Puntos por adaptación cultural
    if (culturalAdaptation) score += 20;
    
    // Puntos por gamificación personalizada
    if (preferences.gamificationLevel !== 'MODERATE') score += 10;
    
    return Math.min(score, 100);
  }, [preferences, culturalAdaptation, getAccessibilityLevel]);

  const hasCustomizations = useCallback((): boolean => {
    return getPersonalizationScore() > 0;
  }, [getPersonalizationScore]);

  const getRecommendations = useCallback((): string[] => {
    const recommendations: string[] = [];
    
    if (!preferences) return recommendations;
    
    if (preferences.theme === 'LIGHT') {
      recommendations.push('Considera cambiar a un tema oscuro para reducir la fatiga visual');
    }
    
    if (getAccessibilityLevel() < 2) {
      recommendations.push('Activa más características de accesibilidad para mejorar tu experiencia');
    }
    
    if (!culturalAdaptation) {
      recommendations.push('Configura tu contexto cultural para contenido más relevante');
    }
    
    if (preferences.gamificationLevel === 'MINIMAL') {
      recommendations.push('Aumenta el nivel de gamificación para más motivación');
    }
    
    return recommendations;
  }, [preferences, culturalAdaptation, getAccessibilityLevel]);

  const validatePreferences = useCallback((preferences: Partial<UserPreferences>): boolean => {
    // Validaciones básicas
    if (preferences.fontSize && !['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'].includes(preferences.fontSize)) {
      return false;
    }
    
    if (preferences.theme && !['LIGHT', 'DARK', 'AUTO', 'HIGH_CONTRAST', 'CULTURAL'].includes(preferences.theme)) {
      return false;
    }
    
    if (preferences.contentDifficulty && !['EASY', 'MEDIUM', 'HARD', 'ADAPTIVE'].includes(preferences.contentDifficulty)) {
      return false;
    }
    
    return true;
  }, []);

  // Efectos
  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences]);

  return {
    preferences,
    culturalAdaptation,
    availableThemes,
    currentTheme,
    stats,
    loading,
    error,
    updatePreferences,
    resetPreferences,
    exportPreferences,
    importPreferences,
    setTheme,
    createCustomTheme,
    updateTheme,
    deleteTheme,
    updateCulturalAdaptation,
    detectCulturalContext,
    applyCulturalAdaptation,
    toggleAccessibilityFeature,
    applyAccessibilityPreset,
    getCurrentTheme,
    getCulturalContext,
    getAccessibilityLevel,
    getPersonalizationScore,
    hasCustomizations,
    getRecommendations,
    validatePreferences
  };
};
