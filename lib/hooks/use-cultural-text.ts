import { useCallback, useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

export function useCulturalText() {
  const i18n = useI18n();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Función sincrónica para obtener texto con fallback
  const getText = useCallback((key: string, params?: Record<string, string | number>): string => {
    try {
      // Si tenemos la traducción en caché, usarla
      if (translations[key]) {
        let text = translations[key];
        if (params) {
          Object.entries(params).forEach(([param, value]) => {
            text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
          });
        }
        return text;
      }
      
      // Fallback: retornar la clave
      console.warn(`No hay traducciones disponibles para: ${key}`);
      return key;
    } catch (error) {
      console.warn(`Error obteniendo traducción para: ${key}`, error);
      return key;
    }
  }, [translations]);

  const getCulturalText = useCallback((key: string, culturalContext?: string, params?: Record<string, string | number>): string => {
    try {
      // Intentar obtener texto específico del contexto cultural
      if (culturalContext) {
        const culturalKey = `${culturalContext}.${key}`;
        if (translations[culturalKey]) {
          let text = translations[culturalKey];
          if (params) {
            Object.entries(params).forEach(([param, value]) => {
              text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
            });
          }
          return text;
        }
      }
      
      // Fallback al texto general
      return getText(key, params);
    } catch (error) {
      console.warn(`Error obteniendo texto cultural para: ${key}`, error);
      return key;
    }
  }, [translations, getText]);

  // Cargar traducciones al inicializar
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Cargar traducciones básicas
        const basicKeys = [
          'common.app.name',
          'common.app.tagline',
          'common.navigation.features',
          'common.navigation.populations',
          'common.navigation.technology',
          'common.navigation.pricing',
          'common.navigation.about',
          'common.navigation.contact'
        ];
        
        const newTranslations: Record<string, string> = {};
        
        for (const key of basicKeys) {
          try {
            const translation = await i18n.t(key);
            newTranslations[key] = translation;
          } catch (error) {
            // Si no hay traducción, usar la clave como fallback
            newTranslations[key] = key;
          }
        }
        
        setTranslations(newTranslations);
      } catch (error) {
        console.error('Error cargando traducciones:', error);
      }
    };

    loadTranslations();
  }, [i18n]);

  return {
    getText,
    getCulturalText,
    currentLanguage: i18n.currentLanguage,
    setLanguage: i18n.setLanguage,
    t: i18n.t
  };
}
