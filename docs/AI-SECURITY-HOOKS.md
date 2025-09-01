# Hooks de IA y Seguridad - InclusiveAI Coach

Este documento describe todos los hooks personalizados implementados para el sistema de IA y seguridad de InclusiveAI Coach.

## Índice

- [Hooks de IA](#hooks-de-ia)
  - [useNeedsDetection](#useneedsdetection)
  - [useCulturalAdaptation](#useculturaladaptation)
  - [useVoiceGeneration](#usevoicegeneration)
  - [useBehavioralAnalysis](#usebehavioralanalysis)
  - [useRecommendations](#userecommendations)
- [Hooks de Seguridad](#hooks-de-seguridad)
  - [useSecurityAudit](#usesecurityaudit)
  - [useRateLimit](#useratelimit)
  - [useCSRFProtection](#usecsrfprotection)
  - [useInputValidation](#useinputvalidation)
  - [usePrivacyControls](#useprivacycontrols)

## Hooks de IA

### useNeedsDetection

Hook para detección de necesidades educativas especiales y análisis de aprendizaje.

**Ubicación:** `lib/hooks/useNeedsDetection.ts`

**Funcionalidades:**
- Analizar necesidades especiales del estudiante
- Detectar patrones de aprendizaje
- Generar recomendaciones personalizadas
- Programar evaluaciones automáticas
- Exportar análisis en múltiples formatos

**Interfaces principales:**
```typescript
interface SpecialNeed {
  type: 'DYSLEXIA' | 'ADHD' | 'DYSCALCULIA' | 'AUDITORY_PROCESSING' | 'VISUAL_PROCESSING' | 'LANGUAGE_DELAY' | 'MOTOR_SKILLS';
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
  indicators: string[];
  recommendations: string[];
  accommodations: string[];
  detectedAt: Date;
  culturalContext?: string;
}

interface InteractionData {
  readingSpeed: number;
  readingAccuracy: number;
  readingComprehension: number;
  mathAccuracy: number;
  mathSpeed: number;
  attentionSpan: number;
  taskCompletion: number;
  helpRequests: number;
  audioPreference: number;
  visualPreference: number;
  kinestheticPreference: number;
  language: string;
  culturalBackground: string;
  socioeconomicContext: string;
  previousEducation: number;
}
```

**Ejemplo de uso:**
```typescript
const {
  specialNeeds,
  learningProfile,
  culturalAdaptations,
  confidence,
  analyzeNeeds,
  updateInteractionData,
  getRecommendations,
  getAccommodations
} = useNeedsDetection();

// Analizar necesidades del estudiante
const interactionData = {
  readingSpeed: 120,
  readingAccuracy: 85,
  readingComprehension: 78,
  mathAccuracy: 92,
  mathSpeed: 45,
  attentionSpan: 15,
  taskCompletion: 88,
  helpRequests: 3,
  audioPreference: 0.7,
  visualPreference: 0.8,
  kinestheticPreference: 0.3,
  language: 'es-MX',
  culturalBackground: 'maya',
  socioeconomicContext: 'rural',
  previousEducation: 3
};

const analysis = await analyzeNeeds(interactionData);
console.log('Necesidades detectadas:', analysis.specialNeeds);
console.log('Recomendaciones:', getRecommendations());
```

### useCulturalAdaptation

Hook para adaptación cultural del contenido educativo.

**Ubicación:** `lib/hooks/useCulturalAdaptation.ts`

**Funcionalidades:**
- Adaptar contenido según el contexto cultural
- Detectar contexto cultural automáticamente
- Validar sensibilidad cultural
- Gestionar elementos culturales
- Exportar adaptaciones

**Interfaces principales:**
```typescript
interface CulturalContext {
  region: string;
  language: string;
  languages: string[];
  symbols: string[];
  colors: string[];
  traditions: string[];
  values: string[];
  taboos: string[];
  learningStyles: string[];
  communicationPatterns: string[];
}

interface ContentAdaptation {
  originalContent: string;
  adaptedContent: string;
  culturalContext: string;
  adaptationType: 'translation' | 'contextualization' | 'localization';
  confidence: number;
  adaptations: {
    type: string;
    description: string;
    original: string;
    adapted: string;
  }[];
}
```

**Ejemplo de uso:**
```typescript
const {
  userCulturalContext,
  contentAdaptations,
  languagePreferences,
  culturalElements,
  adaptContent,
  updateCulturalContext,
  validateCulturalSensitivity,
  detectCulturalContext
} = useCulturalAdaptation();

// Detectar contexto cultural
await detectCulturalContext({
  region: 'Yucatán',
  language: 'maya',
  culturalBackground: 'maya'
});

// Adaptar contenido
const originalContent = "The farmer grows corn in his field";
const adaptedContent = await adaptContent(originalContent, 'lesson');

// Validar sensibilidad cultural
const validation = await validateCulturalSensitivity(adaptedContent);
if (validation.isSensitive) {
  console.log('Problemas detectados:', validation.issues);
  console.log('Sugerencias:', validation.suggestions);
}
```

### useVoiceGeneration

Hook para generación de voz y síntesis de habla.

**Ubicación:** `lib/hooks/useVoiceGeneration.ts`

**Funcionalidades:**
- Generar síntesis de habla en múltiples idiomas
- Configurar voces y parámetros
- Reproducir audio generado
- Gestionar historial de generación
- Exportar audio en diferentes formatos

**Interfaces principales:**
```typescript
interface VoiceSettings {
  voice: string;
  speed: number; // 0.5 - 2.0
  pitch: number; // -20 - 20
  volume: number; // 0 - 1
  language: string;
  accent?: string;
}

interface VoiceGenerationState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  audioUrl: string | null;
  voiceSettings: VoiceSettings;
  availableVoices: {
    id: string;
    name: string;
    language: string;
    gender: 'male' | 'female' | 'neutral';
    accent?: string;
  }[];
  generationHistory: {
    id: string;
    text: string;
    audioUrl: string;
    settings: VoiceSettings;
    timestamp: Date;
    duration: number;
  }[];
}
```

**Ejemplo de uso:**
```typescript
const {
  isPlaying,
  isPaused,
  currentText,
  audioUrl,
  voiceSettings,
  availableVoices,
  generateSpeech,
  playAudio,
  pauseAudio,
  resumeAudio,
  stopAudio,
  updateVoiceSettings,
  generateAndPlay
} = useVoiceGeneration();

// Configurar voz
updateVoiceSettings({
  voice: 'maya-female-1',
  speed: 1.0,
  pitch: 0,
  volume: 1.0,
  language: 'maya',
  accent: 'yucateco'
});

// Generar y reproducir audio
await generateAndPlay(
  "Bix a beel? ¿Cómo estás?",
  { speed: 0.9, volume: 0.8 }
);

// Controlar reproducción
if (isPlaying) {
  pauseAudio();
} else if (isPaused) {
  resumeAudio();
}
```

### useBehavioralAnalysis

Hook para análisis de comportamiento del usuario.

**Ubicación:** `lib/hooks/useBehavioralAnalysis.ts`

**Funcionalidades:**
- Rastrear comportamiento del usuario
- Analizar patrones de interacción
- Generar insights de aprendizaje
- Predecir comportamiento futuro
- Exportar análisis detallados

**Interfaces principales:**
```typescript
interface BehavioralData {
  sessionDuration: number;
  clickPatterns: {
    element: string;
    timestamp: Date;
    position: { x: number; y: number };
  }[];
  scrollPatterns: {
    direction: 'up' | 'down';
    speed: number;
    timestamp: Date;
  }[];
  timeOnPage: {
    page: string;
    duration: number;
    timestamp: Date;
  }[];
  interactionFrequency: {
    element: string;
    count: number;
    averageTimeBetween: number;
  }[];
  errorPatterns: {
    type: string;
    frequency: number;
    context: string;
    timestamp: Date;
  }[];
  helpRequests: {
    topic: string;
    timestamp: Date;
    resolved: boolean;
  }[];
}

interface BehaviorPattern {
  type: string;
  confidence: number;
  frequency: number;
  context: string;
  implications: string[];
  recommendations: string[];
}
```

**Ejemplo de uso:**
```typescript
const {
  currentPatterns,
  learningPatterns,
  engagementMetrics,
  attentionMetrics,
  interactionMetrics,
  behavioralInsights,
  trackBehavior,
  analyzeBehavior,
  getLearningInsights,
  generateRecommendations,
  trackClick,
  trackScroll,
  trackTimeOnPage
} = useBehavioralAnalysis();

// Rastrear comportamiento
trackClick('submit-button', { x: 150, y: 300 });
trackScroll('down', 2.5);
trackTimeOnPage('lesson-page', 450);

// Analizar comportamiento
const patterns = await analyzeBehavior();
console.log('Patrones detectados:', patterns);

// Obtener insights
const insights = await getLearningInsights();
console.log('Insights de aprendizaje:', insights);

// Generar recomendaciones
const recommendations = await generateRecommendations();
console.log('Recomendaciones:', recommendations);
```

### useRecommendations

Hook para sistema de recomendaciones inteligentes.

**Ubicación:** `lib/hooks/useRecommendations.ts`

**Funcionalidades:**
- Generar recomendaciones personalizadas
- Gestionar recomendaciones trending
- Guardar y gestionar favoritos
- Rastrear interacciones con recomendaciones
- Proporcionar feedback

**Interfaces principales:**
```typescript
interface LearningRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'lesson' | 'assessment' | 'resource' | 'activity';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: 'short' | 'medium' | 'long';
  format: 'video' | 'text' | 'interactive' | 'audio';
  language: string;
  culturalContext: string;
  tags: string[];
  relevanceScore: number;
  confidence: number;
  metadata: {
    author: string;
    lastUpdated: Date;
    rating: number;
    completionRate: number;
  };
}

interface RecommendationFilters {
  category?: 'lesson' | 'assessment' | 'resource' | 'activity';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: 'short' | 'medium' | 'long';
  format?: 'video' | 'text' | 'interactive' | 'audio';
  language?: string;
  culturalContext?: string;
}
```

**Ejemplo de uso:**
```typescript
const {
  recommendations,
  personalizedRecommendations,
  trendingRecommendations,
  recentlyViewed,
  savedRecommendations,
  filters,
  getRecommendations,
  getPersonalizedRecommendations,
  getTrendingRecommendations,
  saveRecommendation,
  unsaveRecommendation,
  trackRecommendationAction,
  provideFeedback,
  updateFilters,
  searchRecommendations
} = useRecommendations();

// Obtener recomendaciones personalizadas
const personalized = await getPersonalizedRecommendations();
console.log('Recomendaciones personalizadas:', personalized);

// Aplicar filtros
updateFilters({
  category: 'lesson',
  difficulty: 'beginner',
  language: 'maya'
});

const filteredRecommendations = await getRecommendations();
console.log('Recomendaciones filtradas:', filteredRecommendations);

// Guardar recomendación
await saveRecommendation('rec_123');

// Rastrear interacción
await trackRecommendationAction('rec_123', 'viewed');

// Proporcionar feedback
await provideFeedback('rec_123', 5, 'Excelente contenido cultural');

// Buscar recomendaciones
const searchResults = searchRecommendations('matemáticas maya');
console.log('Resultados de búsqueda:', searchResults);
```

## Hooks de Seguridad

### useSecurityAudit

Hook para auditoría de seguridad y monitoreo de vulnerabilidades.

**Ubicación:** `lib/hooks/useSecurityAudit.ts`

**Funcionalidades:**
- Ejecutar auditorías de seguridad
- Escanear vulnerabilidades específicas
- Validar cumplimiento de estándares
- Resolver vulnerabilidades detectadas
- Generar reportes de seguridad

**Interfaces principales:**
```typescript
interface SecurityVulnerability {
  id: string;
  type: 'XSS' | 'CSRF' | 'SQL_INJECTION' | 'AUTHENTICATION' | 'AUTHORIZATION' | 'DATA_EXPOSURE' | 'CONFIGURATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  location: string;
  impact: string;
  recommendation: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';
  discoveredAt: Date;
  resolvedAt?: Date;
  cveId?: string;
  cvssScore?: number;
}

interface SecurityAuditState {
  vulnerabilities: SecurityVulnerability[];
  securityScore: number;
  lastAudit: Date | null;
  auditHistory: {
    id: string;
    timestamp: Date;
    vulnerabilitiesFound: number;
    securityScore: number;
    duration: number;
    status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  }[];
  complianceStatus: {
    gdpr: boolean;
    hipaa: boolean;
    ferpa: boolean;
    sox: boolean;
    pci: boolean;
  };
  securityMetrics: {
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    resolvedVulnerabilities: number;
    averageResolutionTime: number;
  };
}
```

**Ejemplo de uso:**
```typescript
const {
  vulnerabilities,
  securityScore,
  lastAudit,
  auditHistory,
  complianceStatus,
  securityMetrics,
  runSecurityAudit,
  scanForVulnerabilities,
  validateCompliance,
  resolveVulnerability,
  exportAuditReport,
  scheduleAudit,
  getSecurityRecommendations
} = useSecurityAudit();

// Ejecutar auditoría completa
const vulnerabilities = await runSecurityAudit('full');
console.log('Vulnerabilidades encontradas:', vulnerabilities);

// Escanear objetivo específico
const targetVulnerabilities = await scanForVulnerabilities('/api/auth');
console.log('Vulnerabilidades en endpoint:', targetVulnerabilities);

// Validar cumplimiento GDPR
const isGDPRCompliant = await validateCompliance('gdpr');
console.log('Cumplimiento GDPR:', isGDPRCompliant);

// Resolver vulnerabilidad
await resolveVulnerability('vuln_123', 'Implementado CSP headers');

// Obtener recomendaciones
const recommendations = await getSecurityRecommendations();
console.log('Recomendaciones de seguridad:', recommendations);

// Exportar reporte
const reportUrl = await exportAuditReport('pdf');
console.log('Reporte disponible en:', reportUrl);
```

### useRateLimit

Hook para rate limiting y control de acceso.

**Ubicación:** `lib/hooks/useRateLimit.ts`

**Funcionalidades:**
- Verificar límites de rate
- Incrementar contadores de requests
- Resetear límites automáticamente
- Configurar parámetros de rate limiting
- Monitorear estadísticas de uso

**Interfaces principales:**
```typescript
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  handler?: (req: any, res: any) => void;
}

interface RateLimitState {
  currentRequests: number;
  remainingRequests: number;
  resetTime: Date | null;
  isLimited: boolean;
  limitHistory: {
    timestamp: Date;
    action: string;
    success: boolean;
    remainingRequests: number;
  }[];
  rateLimitConfig: RateLimitConfig;
  blockedUntil?: Date;
}
```

**Ejemplo de uso:**
```typescript
const {
  currentRequests,
  remainingRequests,
  resetTime,
  isLimited,
  limitHistory,
  rateLimitConfig,
  blockedUntil,
  checkRateLimit,
  incrementRequest,
  resetRateLimit,
  updateRateLimitConfig,
  isBlocked,
  getRemainingTime,
  makeRateLimitedRequest,
  getRateLimitStats
} = useRateLimit({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutos
  skipSuccessfulRequests: false,
  skipFailedRequests: true
});

// Verificar rate limit
const isAllowed = await checkRateLimit('api_call');
if (!isAllowed) {
  console.log('Rate limit excedido');
  return;
}

// Incrementar contador
await incrementRequest('api_call');

// Hacer request con rate limiting
const result = await makeRateLimitedRequest('api_call', async () => {
  return fetch('/api/data');
});

// Verificar si está bloqueado
if (isBlocked()) {
  const remainingTime = getRemainingTime();
  console.log(`Bloqueado por ${remainingTime}ms`);
}

// Obtener estadísticas
const stats = getRateLimitStats();
console.log('Estadísticas de rate limit:', stats);
```

### useCSRFProtection

Hook para protección CSRF (Cross-Site Request Forgery).

**Ubicación:** `lib/hooks/useCSRFProtection.ts`

**Funcionalidades:**
- Generar tokens CSRF
- Validar tokens en requests
- Refrescar tokens automáticamente
- Agregar headers CSRF a requests
- Monitorear intentos de CSRF

**Interfaces principales:**
```typescript
interface CSRFConfig {
  tokenLength: number;
  tokenExpiry: number; // en milisegundos
  headerName: string;
  cookieName: string;
  refreshOnNavigation: boolean;
  validateOnAllRequests: boolean;
}

interface CSRFState {
  token: string | null;
  tokenExpiry: Date | null;
  isTokenValid: boolean;
  tokenHistory: {
    token: string;
    generatedAt: Date;
    expiresAt: Date;
    used: boolean;
  }[];
  csrfAttempts: {
    timestamp: Date;
    ip: string;
    userAgent: string;
    blocked: boolean;
    reason: string;
  }[];
}
```

**Ejemplo de uso:**
```typescript
const {
  token,
  tokenExpiry,
  isTokenValid,
  tokenHistory,
  csrfAttempts,
  generateToken,
  validateToken,
  refreshToken,
  getToken,
  isTokenExpired,
  addCSRFHeader,
  validateRequest,
  makeCSRFProtectedRequest,
  getCSRFStats
} = useCSRFProtection({
  tokenLength: 32,
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 horas
  headerName: 'X-CSRF-Token',
  cookieName: 'csrf-token',
  refreshOnNavigation: true,
  validateOnAllRequests: true
});

// Generar token
const newToken = await generateToken();
console.log('Token generado:', newToken);

// Validar token
const isValid = await validateToken(token);
if (!isValid) {
  console.log('Token CSRF inválido');
  return;
}

// Agregar header CSRF a request
const headers = addCSRFHeader({
  'Content-Type': 'application/json'
});

// Hacer request protegido
const response = await makeCSRFProtectedRequest('/api/submit', {
  method: 'POST',
  body: JSON.stringify(data)
});

// Obtener estadísticas
const stats = getCSRFStats();
console.log('Estadísticas CSRF:', stats);
```

### useInputValidation

Hook para validación de entrada y sanitización.

**Ubicación:** `lib/hooks/useInputValidation.ts`

**Funcionalidades:**
- Validar campos individuales
- Validar formularios completos
- Sanitizar entrada
- Validar con esquemas personalizados
- Integrar con Zod
- Gestionar validadores personalizados

**Interfaces principales:**
```typescript
interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'number' | 'custom';
  value?: any;
  message: string;
  customValidator?: (value: any) => boolean | Promise<boolean>;
}

interface ValidationSchema {
  [fieldName: string]: ValidationRule[];
}

interface ValidationState {
  values: Record<string, any>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isDirty: boolean;
  validationHistory: {
    field: string;
    value: any;
    errors: string[];
    timestamp: Date;
  }[];
  customValidators: Record<string, (value: any) => boolean | Promise<boolean>>;
}
```

**Ejemplo de uso:**
```typescript
const schema: ValidationSchema = {
  email: [
    { type: 'required', message: 'El email es requerido' },
    { type: 'email', message: 'Formato de email inválido' }
  ],
  password: [
    { type: 'required', message: 'La contraseña es requerida' },
    { type: 'minLength', value: 8, message: 'Mínimo 8 caracteres' },
    { type: 'pattern', value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, message: 'Debe contener mayúscula, minúscula y número' }
  ],
  age: [
    { type: 'number', message: 'Debe ser un número' },
    { type: 'custom', message: 'Debe ser mayor de 13 años', customValidator: (value) => Number(value) >= 13 }
  ]
};

const {
  values,
  errors,
  touched,
  isValid,
  isDirty,
  validateField,
  validateForm,
  setValue,
  setTouched,
  resetForm,
  addCustomValidator,
  sanitizeInput,
  validateAndSanitize,
  validateOnChange,
  validateWithZod,
  getValidationStats
} = useInputValidation(schema);

// Validar campo individual
const fieldErrors = await validateField('email', 'invalid-email');
console.log('Errores del campo:', fieldErrors);

// Validar formulario completo
const formData = {
  email: 'user@example.com',
  password: 'Password123',
  age: '25'
};

const formErrors = await validateForm(formData);
console.log('Errores del formulario:', formErrors);

// Validar y sanitizar
const { value: sanitizedValue, errors: validationErrors } = await validateAndSanitize(
  'comment',
  '<script>alert("xss")</script>Comentario válido'
);

// Agregar validador personalizado
addCustomValidator('username', async (value) => {
  // Verificar disponibilidad en base de datos
  const response = await fetch(`/api/check-username?username=${value}`);
  const { available } = await response.json();
  return available;
});

// Validar con Zod
const zodSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const zodResult = await validateWithZod(zodSchema, formData);
if (zodResult.success) {
  console.log('Datos válidos:', zodResult.data);
} else {
  console.log('Errores Zod:', zodResult.errors);
}
```

### usePrivacyControls

Hook para controles de privacidad y gestión de datos personales.

**Ubicación:** `lib/hooks/usePrivacyControls.ts`

**Funcionalidades:**
- Gestionar configuración de privacidad
- Solicitar acceso, eliminación y portabilidad de datos
- Revocar consentimientos
- Anonimizar datos
- Generar reportes de privacidad

**Interfaces principales:**
```typescript
interface PrivacySettings {
  dataCollection: {
    analytics: boolean;
    personalization: boolean;
    marketing: boolean;
    thirdParty: boolean;
  };
  dataSharing: {
    withTeachers: boolean;
    withResearchers: boolean;
    withPartners: boolean;
    anonymized: boolean;
  };
  dataRetention: {
    duration: number; // días
    autoDelete: boolean;
    deleteOnLogout: boolean;
  };
  consentHistory: {
    timestamp: Date;
    setting: string;
    value: boolean;
    ip: string;
    userAgent: string;
  }[];
}

interface PrivacyState {
  settings: PrivacySettings;
  consentStatus: {
    gdpr: boolean;
    ccpa: boolean;
    coppa: boolean;
    ferpa: boolean;
  };
  dataRequests: {
    id: string;
    type: 'access' | 'deletion' | 'portability' | 'correction';
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    requestedAt: Date;
    completedAt?: Date;
    description: string;
  }[];
  privacyEvents: {
    id: string;
    type: 'consent_change' | 'data_access' | 'data_deletion' | 'policy_update';
    timestamp: Date;
    details: any;
  }[];
}
```

**Ejemplo de uso:**
```typescript
const {
  settings,
  consentStatus,
  dataRequests,
  privacyEvents,
  updatePrivacySettings,
  requestDataAccess,
  requestDataDeletion,
  requestDataPortability,
  requestDataCorrection,
  getDataRequestStatus,
  exportPrivacyData,
  revokeConsent,
  getPrivacyReport,
  anonymizeData,
  getPrivacyStats
} = usePrivacyControls();

// Actualizar configuración de privacidad
await updatePrivacySettings({
  dataCollection: {
    analytics: true,
    personalization: true,
    marketing: false,
    thirdParty: false
  },
  dataSharing: {
    withTeachers: true,
    withResearchers: false,
    withPartners: false,
    anonymized: true
  }
});

// Solicitar acceso a datos
const accessRequestId = await requestDataAccess('Necesito ver todos mis datos personales');
console.log('Solicitud de acceso:', accessRequestId);

// Solicitar eliminación de datos
const deletionRequestId = await requestDataDeletion('Eliminar todos mis datos de marketing');
console.log('Solicitud de eliminación:', deletionRequestId);

// Solicitar portabilidad de datos
const portabilityRequestId = await requestDataPortability('Exportar mis datos de aprendizaje');
console.log('Solicitud de portabilidad:', portabilityRequestId);

// Verificar estado de solicitud
const requestStatus = await getDataRequestStatus(accessRequestId);
console.log('Estado de solicitud:', requestStatus);

// Revocar consentimiento
await revokeConsent('marketing');

// Anonimizar datos específicos
await anonymizeData('learning_analytics');

// Exportar datos de privacidad
const privacyDataUrl = await exportPrivacyData('json');
console.log('Datos de privacidad:', privacyDataUrl);

// Obtener reporte de privacidad
const privacyReport = await getPrivacyReport();
console.log('Reporte de privacidad:', privacyReport);

// Obtener estadísticas
const stats = getPrivacyStats();
console.log('Estadísticas de privacidad:', stats);
```

## Uso General

### Importación

```typescript
import {
  // Hooks de IA
  useNeedsDetection,
  useCulturalAdaptation,
  useVoiceGeneration,
  useBehavioralAnalysis,
  useRecommendations,
  
  // Hooks de Seguridad
  useSecurityAudit,
  useRateLimit,
  useCSRFProtection,
  useInputValidation,
  usePrivacyControls
} from '../lib/hooks';
```

### Ejemplo Completo

```typescript
const MyComponent = () => {
  // Hooks de IA
  const { analyzeNeeds, getRecommendations } = useNeedsDetection();
  const { adaptContent, validateCulturalSensitivity } = useCulturalAdaptation();
  const { generateAndPlay, updateVoiceSettings } = useVoiceGeneration();
  const { trackBehavior, analyzeBehavior } = useBehavioralAnalysis();
  const { getPersonalizedRecommendations, saveRecommendation } = useRecommendations();
  
  // Hooks de Seguridad
  const { runSecurityAudit, validateCompliance } = useSecurityAudit();
  const { checkRateLimit, makeRateLimitedRequest } = useRateLimit();
  const { generateToken, makeCSRFProtectedRequest } = useCSRFProtection();
  const { validateForm, sanitizeInput } = useInputValidation();
  const { updatePrivacySettings, requestDataAccess } = usePrivacyControls();
  
  const handleUserAction = async () => {
    // Rastrear comportamiento
    trackBehavior({ sessionDuration: 300, clickPatterns: [] });
    
    // Analizar necesidades
    const analysis = await analyzeNeeds(interactionData);
    
    // Adaptar contenido culturalmente
    const adaptedContent = await adaptContent(originalContent, 'lesson');
    
    // Generar voz
    await generateAndPlay(adaptedContent);
    
    // Obtener recomendaciones
    const recommendations = await getPersonalizedRecommendations();
    
    // Verificar rate limit
    const isAllowed = await checkRateLimit('user_action');
    if (!isAllowed) return;
    
    // Hacer request protegido
    const result = await makeCSRFProtectedRequest('/api/update', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  };
  
  return (
    <div>
      {/* Componente UI */}
    </div>
  );
};
```

## Consideraciones de Rendimiento

1. **Memoización:** Todos los hooks utilizan `useCallback` para optimizar las funciones.
2. **Estado Local:** Se mantiene estado local para evitar re-renders innecesarios.
3. **Carga Lazy:** Los datos se cargan solo cuando son necesarios.
4. **WebSocket:** Para métricas en tiempo real se usa WebSocket para actualizaciones eficientes.
5. **Cache:** Los hooks implementan cache inteligente para datos frecuentemente accedidos.

## Manejo de Errores

Todos los hooks incluyen:
- Estado de error (`error`)
- Estado de carga (`loading`)
- Manejo de excepciones con try-catch
- Mensajes de error descriptivos
- Recuperación automática cuando es posible

## Dependencias

Los hooks dependen de:
- `useAuth` - Para autenticación de usuarios
- `AIServices` - Para servicios de IA
- `SecurityService` - Para servicios de seguridad
- `React` - Para hooks básicos (useState, useEffect, useCallback)
- `zod` - Para validación de esquemas (opcional)

## Próximos Pasos

1. Implementar métodos faltantes en `AIServices` y `SecurityService`
2. Agregar tests unitarios para cada hook
3. Optimizar rendimiento con React.memo
4. Agregar documentación de TypeScript
5. Implementar cache con React Query
6. Agregar métricas de rendimiento
7. Implementar logging detallado
8. Agregar soporte para múltiples idiomas
