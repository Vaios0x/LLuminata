// Configuración centralizada para optimizaciones de rendimiento

export const PERFORMANCE_CONFIG = {
  // Configuración de Redis
  REDIS: {
    HOST: process.env.REDIS_HOST || 'localhost',
    PORT: parseInt(process.env.REDIS_PORT || '6379'),
    PASSWORD: process.env.REDIS_PASSWORD,
    DB: parseInt(process.env.REDIS_DB || '0'),
    TTL: {
      SESSION: 30 * 60, // 30 minutos
      USER: 15 * 60, // 15 minutos
      AI_MODEL: 60 * 60, // 1 hora
      CONTENT: 24 * 60 * 60, // 24 horas
      IMAGE: 7 * 24 * 60 * 60, // 7 días
      API_RESPONSE: 5 * 60, // 5 minutos
      STATIC_DATA: 60 * 60, // 1 hora
    },
    COMPRESSION: {
      ENABLED: true,
      THRESHOLD: 1024, // Comprimir si > 1KB
    },
  },

  // Configuración de CDN
  CDN: {
    PROVIDER: (process.env.CDN_PROVIDER as 'cloudflare' | 'aws-cloudfront' | 'vercel' | 'custom') || 'cloudflare',
    BASE_URL: process.env.CDN_BASE_URL || 'https://cdn.lluminata.com',
    API_KEY: process.env.CDN_API_KEY,
    ZONE_ID: process.env.CDN_ZONE_ID,
    REGION: process.env.CDN_REGION || 'us-east-1',
    CACHE_CONTROL: {
      IMAGES: 'public, max-age=31536000, immutable',
      SCRIPTS: 'public, max-age=31536000, immutable',
      STYLES: 'public, max-age=31536000, immutable',
      FONTS: 'public, max-age=31536000, immutable',
      VIDEOS: 'public, max-age=86400',
      DOCUMENTS: 'public, max-age=3600',
    },
    OPTIMIZATION: {
      IMAGES: true,
      COMPRESSION: true,
      MINIFICATION: true,
      BUNDLING: true,
    },
    FALLBACK: {
      ENABLED: true,
      LOCAL_PATH: '/public/assets',
    },
  },

  // Configuración de optimización de imágenes
  IMAGE_OPTIMIZATION: {
    OUTPUT_DIR: 'public/optimized-images',
    SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'],
    DEFAULT_QUALITY: 85,
    DEFAULT_FORMAT: 'webp' as const,
    CACHE_TTL: 24 * 60 * 60 * 1000, // 24 horas
    CONCURRENCY_LIMIT: 4,
    RESPONSIVE_BREAKPOINTS: [
      { width: 320 },
      { width: 640 },
      { width: 768 },
      { width: 1024 },
      { width: 1280 },
    ],
    PLACEHOLDER: {
      WIDTH: 20,
      HEIGHT: 20,
      BLUR: 10,
      QUALITY: 30,
    },
  },

  // Configuración de lazy loading
  LAZY_LOADING: {
    THRESHOLD: 0.1,
    ROOT_MARGIN: '50px',
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000,
    PRELOAD_DELAY: 1000,
    INTERSECTION_OPTIONS: {
      threshold: 0.1,
      rootMargin: '50px',
    },
  },

  // Configuración de compresión
  COMPRESSION: {
    ENABLED: true,
    LEVEL: 6,
    THRESHOLD: 1024, // Comprimir archivos > 1KB
    ALGORITHMS: {
      GZIP: true,
      BROTLI: true,
      DEFLATE: true,
    },
  },

  // Configuración de bundling
  BUNDLING: {
    ENABLED: true,
    SPLIT_CHUNKS: true,
    MINIFY: true,
    SOURCE_MAPS: process.env.NODE_ENV === 'development',
    TREE_SHAKING: true,
    DYNAMIC_IMPORTS: true,
  },

  // Configuración de caché
  CACHE: {
    BROWSER: {
      ENABLED: true,
      MAX_AGE: 31536000, // 1 año
      STALE_WHILE_REVALIDATE: 86400, // 1 día
    },
    SERVICE_WORKER: {
      ENABLED: true,
      STRATEGY: 'cache-first' as const,
      CACHE_NAME: 'lluminata-cache-v1',
      MAX_ENTRIES: 100,
      MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 días
    },
  },

  // Configuración de monitoreo
  MONITORING: {
    ENABLED: true,
    METRICS: {
      PERFORMANCE: true,
      ERRORS: true,
      RESOURCE_LOADING: true,
      USER_INTERACTIONS: true,
    },
    SAMPLING_RATE: 0.1, // 10% de las sesiones
    BATCH_SIZE: 10,
    FLUSH_INTERVAL: 5000, // 5 segundos
  },

  // Configuración de análisis
  ANALYTICS: {
    ENABLED: process.env.NODE_ENV === 'production',
    PROVIDER: 'vercel' as const,
    EVENTS: {
      PAGE_VIEW: true,
      CLICK: true,
      SCROLL: true,
      PERFORMANCE: true,
      ERROR: true,
    },
  },

  // Configuración de PWA
  PWA: {
    ENABLED: true,
    NAME: 'LLuminata',
    SHORT_NAME: 'LLuminata',
    DESCRIPTION: 'Plataforma educativa inclusiva con IA',
    THEME_COLOR: '#3B82F6',
    BACKGROUND_COLOR: '#FFFFFF',
    DISPLAY: 'standalone' as const,
    ORIENTATION: 'portrait' as const,
    START_URL: '/',
    SCOPE: '/',
    ICONS: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },

  // Configuración de seguridad
  SECURITY: {
    HEADERS: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
    CSP: {
      ENABLED: true,
      DIRECTIVES: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'https:'],
        'connect-src': ["'self'", 'https:'],
        'media-src': ["'self'", 'https:'],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
      },
    },
  },

  // Configuración de accesibilidad
  ACCESSIBILITY: {
    ENABLED: true,
    FEATURES: {
      SCREEN_READER: true,
      KEYBOARD_NAVIGATION: true,
      HIGH_CONTRAST: true,
      FONT_SCALING: true,
      VOICE_CONTROL: true,
    },
    COMPLIANCE: {
      WCAG_2_1: true,
      WCAG_2_2: true,
      SECTION_508: true,
    },
  },

  // Configuración de internacionalización
  I18N: {
    ENABLED: true,
    DEFAULT_LOCALE: 'es-MX',
    SUPPORTED_LOCALES: ['es-MX', 'maya', 'nahuatl', 'quechua'],
    FALLBACK_LOCALE: 'es-MX',
    LOADING_STRATEGY: 'lazy' as const,
  },

  // Configuración de offline
  OFFLINE: {
    ENABLED: true,
    STRATEGY: 'cache-first' as const,
    CACHE_NAME: 'lluminata-offline-v1',
    MAX_ENTRIES: 50,
    MAX_AGE: 30 * 24 * 60 * 60 * 1000, // 30 días
    PRECACHE: [
      '/',
      '/dashboard',
      '/lessons',
      '/assessments',
      '/offline',
    ],
    DYNAMIC_CACHE: [
      '/api/ai/',
      '/api/auth/',
      '/api/health/',
    ],
  },

  // Configuración de desarrollo
  DEVELOPMENT: {
    HOT_RELOAD: true,
    SOURCE_MAPS: true,
    DEBUG_MODE: process.env.NODE_ENV === 'development',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    PROFILING: process.env.PROFILING === 'true',
  },

  // Configuración de producción
  PRODUCTION: {
    MINIFY: true,
    COMPRESS: true,
    OPTIMIZE_IMAGES: true,
    ENABLE_CDN: true,
    ENABLE_CACHE: true,
    ENABLE_MONITORING: true,
    ENABLE_ANALYTICS: true,
  },
};

// Funciones de utilidad para configuración
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isTest = () => process.env.NODE_ENV === 'test';

export const getConfig = (key: string) => {
  const keys = key.split('.');
  let value: any = PERFORMANCE_CONFIG;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  
  return value;
};

export const setConfig = (key: string, value: any) => {
  const keys = key.split('.');
  let config: any = PERFORMANCE_CONFIG;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!config[k]) config[k] = {};
    config = config[k];
  }
  
  config[keys[keys.length - 1]] = value;
};

// Configuración específica por entorno
export const getEnvironmentConfig = () => {
  if (isDevelopment()) {
    return {
      ...PERFORMANCE_CONFIG,
      REDIS: {
        ...PERFORMANCE_CONFIG.REDIS,
        HOST: 'localhost',
        DB: 1,
      },
      CDN: {
        ...PERFORMANCE_CONFIG.CDN,
        FALLBACK: {
          ...PERFORMANCE_CONFIG.CDN.FALLBACK,
          ENABLED: true,
        },
      },
      MONITORING: {
        ...PERFORMANCE_CONFIG.MONITORING,
        SAMPLING_RATE: 1.0, // 100% en desarrollo
      },
    };
  }
  
  if (isProduction()) {
    return {
      ...PERFORMANCE_CONFIG,
      DEVELOPMENT: {
        ...PERFORMANCE_CONFIG.DEVELOPMENT,
        DEBUG_MODE: false,
        SOURCE_MAPS: false,
      },
    };
  }
  
  return PERFORMANCE_CONFIG;
};

// Validación de configuración
export const validateConfig = () => {
  const errors: string[] = [];
  
  // Validar Redis
  if (!PERFORMANCE_CONFIG.REDIS.HOST) {
    errors.push('REDIS_HOST no está configurado');
  }
  
  // Validar CDN
  if (!PERFORMANCE_CONFIG.CDN.BASE_URL) {
    errors.push('CDN_BASE_URL no está configurado');
  }
  
  // Validar formatos de imagen
  if (PERFORMANCE_CONFIG.IMAGE_OPTIMIZATION.SUPPORTED_FORMATS.length === 0) {
    errors.push('No hay formatos de imagen soportados');
  }
  
  if (errors.length > 0) {
    console.warn('⚠️ Errores en configuración de rendimiento:', errors);
    return false;
  }
  
  return true;
};

// Inicialización de configuración
export const initializePerformanceConfig = () => {
  console.log('🚀 Inicializando configuración de rendimiento...');
  
  const isValid = validateConfig();
  if (!isValid) {
    console.warn('⚠️ Algunas configuraciones de rendimiento no son válidas');
  }
  
  const envConfig = getEnvironmentConfig();
  console.log('✅ Configuración de rendimiento inicializada:', {
    environment: process.env.NODE_ENV,
    redis: envConfig.REDIS.HOST,
    cdn: envConfig.CDN.BASE_URL,
    imageOptimization: envConfig.IMAGE_OPTIMIZATION.ENABLED,
    lazyLoading: envConfig.LAZY_LOADING.ENABLED,
  });
  
  return envConfig;
};

export default PERFORMANCE_CONFIG;
