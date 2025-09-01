import config from '@/locales/config.json';

export interface LanguageConfig {
  name: string;
  nativeName: string;
  code: string;
  region: string;
  type: 'primary' | 'secondary' | 'indigenous';
  status: 'active' | 'beta' | 'planned';
  speakers: number;
  features: {
    translation: boolean;
    speechRecognition: boolean;
    textToSpeech: boolean;
    culturalAdaptation: boolean;
  };
  accessibility: {
    screenReader: boolean;
    voiceSynthesis: boolean;
    subtitles: boolean;
    signLanguage: boolean;
  };
  culturalContext: {
    writingSystem: string;
    readingDirection: 'ltr' | 'rtl';
    numberSystem: string;
    culturalReferences: string[];
  };
}

export interface TranslationData {
  common: {
    app: {
      name: string;
      tagline: string;
      version: string;
    };
    navigation: {
      home: string;
      dashboard: string;
      lessons: string;
      progress: string;
      assessments: string;
      profile: string;
      settings: string;
      help: string;
      logout: string;
    };
    actions: {
      save: string;
      cancel: string;
      delete: string;
      edit: string;
      add: string;
      search: string;
      filter: string;
      sort: string;
      refresh: string;
      download: string;
      upload: string;
      sync: string;
      play: string;
      pause: string;
      stop: string;
      next: string;
      previous: string;
      complete: string;
      start: string;
      continue: string;
      finish: string;
      retry: string;
      close: string;
      open: string;
      expand: string;
      collapse: string;
      show: string;
      hide: string;
    };
    status: {
      loading: string;
      saving: string;
      syncing: string;
      processing: string;
      success: string;
      error: string;
      warning: string;
      info: string;
      pending: string;
      completed: string;
      failed: string;
      online: string;
      offline: string;
      connected: string;
      disconnected: string;
    };
    cultural: {
      maya: string;
      nahuatl: string;
      indigenous: string;
      traditional: string;
      modern: string;
      heritage: string;
      customs: string;
      traditions: string;
      ceremonies: string;
      festivals: string;
      rituals: string;
    };
    education: {
      learning: string;
      teaching: string;
      study: string;
      practice: string;
      review: string;
      assessment: string;
      quiz: string;
      test: string;
      lesson: string;
      course: string;
      module: string;
      unit: string;
      topic: string;
      subject: string;
      grade: string;
      score: string;
      progress: string;
      achievement: string;
      certificate: string;
      diploma: string;
    };
    accessibility: {
      screenReader: string;
      highContrast: string;
      keyboardNavigation: string;
      audioDescription: string;
      subtitles: string;
      signLanguage: string;
      voiceSynthesis: string;
      fontSize: string;
      playbackSpeed: string;
      focusIndicator: string;
      reducedMotion: string;
      colorBlindness: string;
    };
  };
}

class I18nManager {
  private currentLanguage: string;
  private fallbackLanguage: string;
  private translations: Map<string, TranslationData> = new Map();
  private config: typeof config;

  constructor() {
    this.config = config;
    this.currentLanguage = config.defaultLanguage;
    this.fallbackLanguage = config.fallbackLanguage;
  }

  /**
   * Obtiene la configuración de un idioma específico
   */
  getLanguageConfig(languageCode: string): LanguageConfig | null {
    return this.config.languages[languageCode] || null;
  }

  /**
   * Obtiene todos los idiomas disponibles
   */
  getAvailableLanguages(): LanguageConfig[] {
    return Object.values(this.config.languages);
  }

  /**
   * Obtiene solo los idiomas indígenas
   */
  getIndigenousLanguages(): LanguageConfig[] {
    return this.getAvailableLanguages().filter(lang => lang.type === 'indigenous');
  }

  /**
   * Obtiene solo los idiomas primarios
   */
  getPrimaryLanguages(): LanguageConfig[] {
    return this.getAvailableLanguages().filter(lang => lang.type === 'primary');
  }

  /**
   * Obtiene solo los idiomas secundarios
   */
  getSecondaryLanguages(): LanguageConfig[] {
    return this.getAvailableLanguages().filter(lang => lang.type === 'secondary');
  }

  /**
   * Establece el idioma actual
   */
  setLanguage(languageCode: string): boolean {
    if (this.config.languages[languageCode]) {
      this.currentLanguage = languageCode;
      return true;
    }
    return false;
  }

  /**
   * Obtiene el idioma actual
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Detecta el idioma del navegador
   */
  detectBrowserLanguage(): string {
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    const langCode = browserLang.split('-')[0];
    
    // Buscar coincidencia exacta
    if (this.config.languages[browserLang]) {
      return browserLang;
    }
    
    // Buscar coincidencia parcial
    const availableLang = Object.keys(this.config.languages).find(lang => 
      lang.startsWith(langCode)
    );
    
    return availableLang || this.fallbackLanguage;
  }

  /**
   * Carga las traducciones para un idioma específico
   */
  async loadTranslations(languageCode: string): Promise<TranslationData | null> {
    try {
      // Verificar si ya está cargado
      if (this.translations.has(languageCode)) {
        return this.translations.get(languageCode)!;
      }

      // Cargar dinámicamente
      const translations = await import(`@/locales/${languageCode}/common.json`);
      this.translations.set(languageCode, translations.default);
      return translations.default;
    } catch (error) {
      console.error(`Error loading translations for ${languageCode}:`, error);
      return null;
    }
  }

  /**
   * Obtiene una traducción específica
   */
  async getTranslation(key: string, languageCode?: string): Promise<string> {
    const lang = languageCode || this.currentLanguage;
    
    try {
      const translations = await this.loadTranslations(lang);
      if (!translations) {
        // Intentar con idioma de respaldo
        const fallbackTranslations = await this.loadTranslations(this.fallbackLanguage);
        if (!fallbackTranslations) {
          return key; // Devolver la clave si no hay traducción
        }
        return this.getNestedValue(fallbackTranslations, key) || key;
      }
      
      return this.getNestedValue(translations, key) || key;
    } catch (error) {
      console.error(`Error getting translation for key ${key}:`, error);
      return key;
    }
  }

  /**
   * Obtiene una traducción anidada usando notación de punto
   */
  private getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Formatea un número según el sistema numérico del idioma
   */
  formatNumber(number: number, languageCode?: string): string {
    const lang = languageCode || this.currentLanguage;
    const langConfig = this.getLanguageConfig(lang);
    
    if (!langConfig) {
      return number.toString();
    }

    // Para idiomas indígenas, usar su sistema numérico específico
    if (langConfig.culturalContext.numberSystem === 'Maya') {
      return this.formatMayaNumber(number);
    } else if (langConfig.culturalContext.numberSystem === 'Nahuatl') {
      return this.formatNahuatlNumber(number);
    }

    // Para otros idiomas, usar el formato estándar
    return new Intl.NumberFormat(lang).format(number);
  }

  /**
   * Formatea números en sistema maya
   */
  private formatMayaNumber(number: number): string {
    // Implementación básica del sistema vigesimal maya
    if (number === 0) return 'majun';
    
    const mayaNumbers = [
      'majun', 'jun', 'ka\'i\'', 'oxi\'', 'kaji\'', 'wo\'o\'',
      'waqi\'', 'wuqu\'', 'wajxaqi\'', 'b\'eleje\'', 'lajuj'
    ];
    
    if (number <= 10) {
      return mayaNumbers[number];
    }
    
    // Para números mayores, usar representación simplificada
    return `${number} (maya: ${this.toMayaVigesimal(number)})`;
  }

  /**
   * Convierte a sistema vigesimal maya
   */
  private toMayaVigesimal(number: number): string {
    if (number === 0) return '0';
    
    const symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    let result = '';
    let num = number;
    
    while (num > 0) {
      result = symbols[num % 20] + result;
      num = Math.floor(num / 20);
    }
    
    return result;
  }

  /**
   * Formatea números en sistema náhuatl
   */
  private formatNahuatlNumber(number: number): string {
    // Implementación básica del sistema náhuatl
    if (number === 0) return 'amo';
    
    const nahuatlNumbers = [
      'amo', 'ce', 'ome', 'eyi', 'nahui', 'macuilli',
      'chicuace', 'chicome', 'chicueyi', 'chicnahui', 'mahtlactli'
    ];
    
    if (number <= 10) {
      return nahuatlNumbers[number];
    }
    
    // Para números mayores, usar representación simplificada
    return `${number} (náhuatl: ${this.toNahuatlVigesimal(number)})`;
  }

  /**
   * Convierte a sistema vigesimal náhuatl
   */
  private toNahuatlVigesimal(number: number): string {
    if (number === 0) return '0';
    
    const symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    let result = '';
    let num = number;
    
    while (num > 0) {
      result = symbols[num % 20] + result;
      num = Math.floor(num / 20);
    }
    
    return result;
  }

  /**
   * Verifica si un idioma tiene soporte para una característica específica
   */
  hasFeature(languageCode: string, feature: keyof LanguageConfig['features']): boolean {
    const langConfig = this.getLanguageConfig(languageCode);
    return langConfig?.features[feature] || false;
  }

  /**
   * Verifica si un idioma tiene soporte para una característica de accesibilidad
   */
  hasAccessibility(languageCode: string, feature: keyof LanguageConfig['accessibility']): boolean {
    const langConfig = this.getLanguageConfig(languageCode);
    return langConfig?.accessibility[feature] || false;
  }

  /**
   * Obtiene las referencias culturales de un idioma
   */
  getCulturalReferences(languageCode: string): string[] {
    const langConfig = this.getLanguageConfig(languageCode);
    return langConfig?.culturalContext.culturalReferences || [];
  }

  /**
   * Obtiene la dirección de lectura de un idioma
   */
  getReadingDirection(languageCode: string): 'ltr' | 'rtl' {
    const langConfig = this.getLanguageConfig(languageCode);
    return langConfig?.culturalContext.readingDirection || 'ltr';
  }

  /**
   * Limpia la caché de traducciones
   */
  clearCache(): void {
    this.translations.clear();
  }

  /**
   * Obtiene estadísticas de uso de idiomas
   */
  getLanguageStats(): {
    totalLanguages: number;
    activeLanguages: number;
    indigenousLanguages: number;
    primaryLanguages: number;
    secondaryLanguages: number;
    totalSpeakers: number;
  } {
    const languages = this.getAvailableLanguages();
    const activeLanguages = languages.filter(lang => lang.status === 'active');
    const indigenousLanguages = languages.filter(lang => lang.type === 'indigenous');
    const primaryLanguages = languages.filter(lang => lang.type === 'primary');
    const secondaryLanguages = languages.filter(lang => lang.type === 'secondary');
    const totalSpeakers = languages.reduce((sum, lang) => sum + lang.speakers, 0);

    return {
      totalLanguages: languages.length,
      activeLanguages: activeLanguages.length,
      indigenousLanguages: indigenousLanguages.length,
      primaryLanguages: primaryLanguages.length,
      secondaryLanguages: secondaryLanguages.length,
      totalSpeakers
    };
  }
}

// Instancia singleton
export const i18n = new I18nManager();

// Hook para React
export function useI18n() {
  const t = async (key: string, params?: Record<string, string | number>): Promise<string> => {
    let translation = await i18n.getTranslation(key);
    
    // Reemplazar parámetros si existen
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
      });
    }
    
    return translation;
  };

  return {
    currentLanguage: i18n.getCurrentLanguage(),
    setLanguage: i18n.setLanguage.bind(i18n),
    getTranslation: i18n.getTranslation.bind(i18n),
    t,
    getLanguageConfig: i18n.getLanguageConfig.bind(i18n),
    getAvailableLanguages: i18n.getAvailableLanguages.bind(i18n),
    getIndigenousLanguages: i18n.getIndigenousLanguages.bind(i18n),
    hasFeature: i18n.hasFeature.bind(i18n),
    hasAccessibility: i18n.hasAccessibility.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
    detectBrowserLanguage: i18n.detectBrowserLanguage.bind(i18n),
    getLanguageStats: i18n.getLanguageStats.bind(i18n)
  };
}

export default i18n;
