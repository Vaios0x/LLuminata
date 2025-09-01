"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import { useI18n } from '@/lib/i18n'

interface Language {
  code: string
  name: string
  nativeName: string
  type: 'primary' | 'indigenous'
  region: string
  status: 'active' | 'beta' | 'planned'
}

interface LanguageContextType {
  currentLanguage: string
  setLanguage: (languageCode: string) => void
  getCurrentLanguageInfo: () => Language
  getAllLanguages: () => Language[]
  getLanguagesByType: (type: 'primary' | 'indigenous') => Language[]
  isLoading: boolean
  translations: Record<string, any>
  t: (key: string) => string
}

const LANGUAGE_GROUPS = {
  primary: {
    label: "Idiomas Principales",
    languages: [
      { code: "es-MX", name: "Español (México)", nativeName: "Español", type: "primary" as const, region: "México", status: "active" as const },
      { code: "en", name: "English", nativeName: "English", type: "primary" as const, region: "Estados Unidos", status: "active" as const },
      { code: "pt", name: "Português", nativeName: "Português", type: "primary" as const, region: "Brasil", status: "active" as const },
      { code: "fr", name: "Français", nativeName: "Français", type: "primary" as const, region: "Francia", status: "active" as const },
      { code: "de", name: "Deutsch", nativeName: "Deutsch", type: "primary" as const, region: "Alemania", status: "active" as const }
    ]
  },
  indigenous: {
    label: "Idiomas Indígenas",
    languages: [
      { code: "maya", name: "Maya (Yucateco)", nativeName: "Maya", type: "indigenous" as const, region: "Península de Yucatán", status: "active" as const },
      { code: "nahuatl", name: "Náhuatl", nativeName: "Nahuatl", type: "indigenous" as const, region: "Centro de México", status: "active" as const },
      { code: "kiche", name: "K'iche'", nativeName: "K'iche'", type: "indigenous" as const, region: "Guatemala", status: "active" as const },
      { code: "kaqchikel", name: "Kaqchikel", nativeName: "Kaqchikel", type: "indigenous" as const, region: "Guatemala", status: "active" as const },
      { code: "mam", name: "Mam", nativeName: "Mam", type: "indigenous" as const, region: "Guatemala", status: "active" as const },
      { code: "qeqchi", name: "Q'eqchi'", nativeName: "Q'eqchi'", type: "indigenous" as const, region: "Guatemala", status: "active" as const },
      { code: "tzotzil", name: "Tsotsil", nativeName: "Bats'i k'op", type: "indigenous" as const, region: "Chiapas", status: "active" as const },
      { code: "tseltal", name: "Tseltal", nativeName: "K'op", type: "indigenous" as const, region: "Chiapas", status: "active" as const },
      { code: "mixteco", name: "Mixteco", nativeName: "Tu'un savi", type: "indigenous" as const, region: "Oaxaca, Guerrero, Puebla", status: "active" as const },
      { code: "zapoteco", name: "Zapoteco", nativeName: "Diidxazá", type: "indigenous" as const, region: "Oaxaca", status: "active" as const },
      { code: "otomi", name: "Otomí (hñähñu)", nativeName: "Hñähñu", type: "indigenous" as const, region: "Hidalgo, México, Querétaro", status: "active" as const },
      { code: "totonaco", name: "Totonaco", nativeName: "Tachihuiin", type: "indigenous" as const, region: "Veracruz, Puebla", status: "active" as const },
      { code: "mazateco", name: "Mazateco", nativeName: "Ha shuta enima", type: "indigenous" as const, region: "Oaxaca", status: "active" as const },
      { code: "chol", name: "Chol", nativeName: "Winik", type: "indigenous" as const, region: "Chiapas", status: "active" as const },
      { code: "mazahua", name: "Mazahua", nativeName: "Jñatjo", type: "indigenous" as const, region: "Estado de México, Michoacán", status: "active" as const },
      { code: "huasteco", name: "Huasteco", nativeName: "Téenek", type: "indigenous" as const, region: "San Luis Potosí, Veracruz", status: "active" as const },
      { code: "chinanteco", name: "Chinanteco", nativeName: "Tsa jujmí", type: "indigenous" as const, region: "Oaxaca", status: "active" as const },
      { code: "purepecha", name: "Purépecha", nativeName: "P'urhépecha", type: "indigenous" as const, region: "Michoacán", status: "active" as const },
      { code: "mixe", name: "Mixe", nativeName: "Ayüük", type: "indigenous" as const, region: "Oaxaca", status: "active" as const },
      { code: "tlapaneco", name: "Tlapaneco", nativeName: "Me'phaa", type: "indigenous" as const, region: "Guerrero", status: "active" as const },
      { code: "tarahumara", name: "Tarahumara", nativeName: "Rarámuri", type: "indigenous" as const, region: "Chihuahua", status: "active" as const }
    ]
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Cache para traducciones
const translationCache = new Map<string, Record<string, any>>()

// Cache para traducciones - no limpiar automáticamente

// Función para cargar traducciones desde archivos JSON
async function loadTranslations(languageCode: string): Promise<Record<string, any>> {
  console.log(`🔄 Cargando traducciones para: ${languageCode}`)
  
  // Verificar cache primero
  if (translationCache.has(languageCode)) {
    console.log(`✅ Traducciones encontradas en cache para: ${languageCode}`)
    return translationCache.get(languageCode)!
  }

  try {
    // Intentar cargar el archivo common.json del idioma específico usando la API
    const response = await fetch(`/api/translations/${languageCode}`)
    
    if (response.ok) {
      const translations = await response.json()
      console.log(`✅ Traducciones cargadas para ${languageCode}:`, Object.keys(translations))
      // Guardar en cache
      translationCache.set(languageCode, translations)
      return translations
    } else {
      console.warn(`❌ Error HTTP ${response.status} para ${languageCode}`)
    }
  } catch (error) {
    console.warn(`❌ No se pudieron cargar las traducciones para ${languageCode}:`, error)
  }
  
  // Fallback a español si no se puede cargar el idioma solicitado
  if (languageCode !== 'es-MX') {
    try {
      const fallbackResponse = await fetch('/api/translations/es-MX')
      if (fallbackResponse.ok) {
        const fallbackTranslations = await fallbackResponse.json()
        translationCache.set(languageCode, fallbackTranslations)
        return fallbackTranslations
      }
    } catch (error) {
      console.error('Error cargando traducciones de fallback:', error)
    }
  }
  
  // Traducciones mínimas de emergencia
  const emergencyTranslations = {
    common: {
      app: { name: 'Lluminata', tagline: 'Educación Inclusiva' },
      navigation: { 
        home: 'Inicio', 
        about: 'Nosotros', 
        contact: 'Contacto',
        features: 'Características',
        populations: 'Poblaciones',
        technology: 'Tecnología',
        pricing: 'Precios'
      },
      auth: {
        login: 'Iniciar Sesión',
        register: 'Registrarse'
      },
      actions: { save: 'Guardar', cancel: 'Cancelar', search: 'Buscar' }
    }
  }
  
  translationCache.set(languageCode, emergencyTranslations)
  return emergencyTranslations
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const i18n = useI18n()
  const [currentLanguage, setCurrentLanguageState] = useState<string>('es-MX')
  const [isLoading, setIsLoading] = useState(true)
  const [translations, setTranslations] = useState<Record<string, any>>({})

  // Memoizar todas las funciones para evitar re-renderizados
  const getAllLanguages = useCallback(() => {
    return [
      ...LANGUAGE_GROUPS.primary.languages,
      ...LANGUAGE_GROUPS.indigenous.languages
    ]
  }, [])

  const getLanguagesByType = useCallback((type: 'primary' | 'indigenous') => {
    return type === 'primary' 
      ? LANGUAGE_GROUPS.primary.languages 
      : LANGUAGE_GROUPS.indigenous.languages
  }, [])

  const getCurrentLanguageInfo = useCallback(() => {
    return getAllLanguages().find(lang => lang.code === currentLanguage) || LANGUAGE_GROUPS.primary.languages[0]
  }, [currentLanguage, getAllLanguages])

  // Inicializar idioma solo una vez
  useEffect(() => {
    const initializeLanguage = async () => {
      console.log('🚀 Inicializando contexto de idioma...')
      
      try {
        const savedLanguage = localStorage.getItem('preferred-language')
        const initialLanguage = savedLanguage || 'es-MX'
        
        console.log('📋 Idioma inicial:', initialLanguage)
        
        // Verificar que el idioma esté disponible
        const isValidLanguage = getAllLanguages().some(lang => lang.code === initialLanguage)
        const finalLanguage = isValidLanguage ? initialLanguage : 'es-MX'
        
        setCurrentLanguageState(finalLanguage)
        i18n.setLanguage(finalLanguage)
        localStorage.setItem('preferred-language', finalLanguage)
        
        // Cargar traducciones del idioma seleccionado
        console.log('📥 Cargando traducciones iniciales...')
        const loadedTranslations = await loadTranslations(finalLanguage)
        console.log('✅ Traducciones cargadas:', Object.keys(loadedTranslations))
        setTranslations(loadedTranslations)
        
        setIsLoading(false)
        console.log('🎉 Contexto de idioma inicializado')
      } catch (error) {
        console.error('❌ Error inicializando contexto:', error)
        setIsLoading(false)
      }
    }

    initializeLanguage()
  }, [getAllLanguages, i18n]) // Agregar dependencias necesarias

  const setLanguage = useCallback(async (languageCode: string) => {
    console.log('🔄 Cambiando idioma a:', languageCode)
    
    const isValidLanguage = getAllLanguages().some(lang => lang.code === languageCode)
    console.log('✅ Idioma válido:', isValidLanguage)
    
    if (isValidLanguage && languageCode !== currentLanguage) {
      console.log('📝 Aplicando cambio de idioma...')
      setIsLoading(true)
      
      setCurrentLanguageState(languageCode)
      i18n.setLanguage(languageCode)
      localStorage.setItem('preferred-language', languageCode)
      
              // Cargar traducciones del nuevo idioma
        console.log('📥 Cargando traducciones para:', languageCode)
        const loadedTranslations = await loadTranslations(languageCode)
        console.log('✅ Nuevas traducciones cargadas:', Object.keys(loadedTranslations))
        console.log('📊 Estructura de nuevas traducciones:', JSON.stringify(loadedTranslations, null, 2))
        setTranslations(loadedTranslations)
      
      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: languageCode } 
      }))
      
      // Forzar re-renderizado del documento
      document.documentElement.lang = languageCode
      document.documentElement.setAttribute('data-language', languageCode)
      
      setIsLoading(false)
      console.log('🎉 Cambio de idioma completado')
    } else {
      console.log('❌ No se aplicó el cambio de idioma')
    }
  }, [currentLanguage, getAllLanguages, i18n])

  // Función de traducción memoizada
  const t = useCallback((key: string): string => {
    // Si no hay traducciones, devolver la clave
    if (!translations || Object.keys(translations).length === 0) {
      console.warn(`❌ No hay traducciones disponibles para: ${key}`)
      return key
    }
    
    const keys = key.split('.')
    let value: any = translations
    
    // Navegar por la estructura de traducciones
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Si no se encuentra la traducción, devolver la clave
        console.warn(`❌ Clave no encontrada: ${k} en ${JSON.stringify(value)}`)
        return key
      }
    }
    
    // Devolver el valor si es string, o la clave si no
    return typeof value === 'string' ? value : key
  }, [translations, currentLanguage])

  const value: LanguageContextType = useMemo(() => ({
    currentLanguage,
    setLanguage,
    getCurrentLanguageInfo,
    getAllLanguages,
    getLanguagesByType,
    isLoading,
    translations,
    t
  }), [
    currentLanguage,
    setLanguage,
    getCurrentLanguageInfo,
    getAllLanguages,
    getLanguagesByType,
    isLoading,
    translations,
    t
  ])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
