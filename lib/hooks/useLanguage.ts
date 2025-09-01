import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'

interface Language {
  code: string
  name: string
  nativeName: string
  type: 'primary' | 'indigenous'
  region: string
  status: 'active' | 'beta' | 'planned'
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

export function useLanguage() {
  const i18n = useI18n()
  const [currentLanguage, setCurrentLanguageState] = useState<string>('es-MX')
  const [isLoading, setIsLoading] = useState(true)

  // Inicializar idioma desde localStorage o detectar del navegador
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    const browserLanguage = i18n.detectBrowserLanguage()
    
    const initialLanguage = savedLanguage || browserLanguage || 'es-MX'
    
    // Verificar que el idioma esté disponible
    const allLanguages = [
      ...LANGUAGE_GROUPS.primary.languages,
      ...LANGUAGE_GROUPS.indigenous.languages
    ]
    
    const isValidLanguage = allLanguages.some(lang => lang.code === initialLanguage)
    const finalLanguage = isValidLanguage ? initialLanguage : 'es-MX'
    
    setCurrentLanguageState(finalLanguage)
    i18n.setLanguage(finalLanguage)
    localStorage.setItem('preferred-language', finalLanguage)
    setIsLoading(false)
  }, [i18n])

  const setLanguage = useCallback((languageCode: string) => {
    const allLanguages = [
      ...LANGUAGE_GROUPS.primary.languages,
      ...LANGUAGE_GROUPS.indigenous.languages
    ]
    
    const isValidLanguage = allLanguages.some(lang => lang.code === languageCode)
    
    if (isValidLanguage) {
      setCurrentLanguageState(languageCode)
      i18n.setLanguage(languageCode)
      localStorage.setItem('preferred-language', languageCode)
      
      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: languageCode } 
      }))
    }
  }, [i18n])

  const getCurrentLanguageInfo = useCallback(() => {
    const allLanguages = [
      ...LANGUAGE_GROUPS.primary.languages,
      ...LANGUAGE_GROUPS.indigenous.languages
    ]
    return allLanguages.find(lang => lang.code === currentLanguage) || LANGUAGE_GROUPS.primary.languages[0]
  }, [currentLanguage])

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

  return {
    currentLanguage,
    setLanguage,
    getCurrentLanguageInfo,
    getAllLanguages,
    getLanguagesByType,
    isLoading,
    i18n
  }
}
