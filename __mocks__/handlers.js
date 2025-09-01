import { http, HttpResponse } from 'msw';

// Mock data
const mockStudents = [
  {
    id: 'student-1',
    name: 'Juan López',
    email: 'juan@example.com',
    age: 12,
    grade: 6,
    learningProfile: {
      learningStyle: 'visual',
      pace: 'moderate',
      strengths: ['comprehension', 'creativity'],
      challenges: ['reading_speed', 'spelling']
    }
  },
  {
    id: 'student-2',
    name: 'María Santos',
    email: 'maria@example.com',
    age: 11,
    grade: 5,
    learningProfile: {
      learningStyle: 'auditory',
      pace: 'slow',
      strengths: ['listening', 'memory'],
      challenges: ['writing', 'math']
    }
  }
];

const mockTeachers = [
  {
    id: 'teacher-1',
    name: 'María González',
    email: 'maria.gonzalez@school.edu',
    school: 'Escuela Primaria Maya',
    region: 'Guatemala',
    languages: ['es-MX', 'maya']
  },
  {
    id: 'teacher-2',
    name: 'Carlos Méndez',
    email: 'carlos.mendez@school.edu',
    school: 'Escuela Secundaria Nahuatl',
    region: 'México',
    languages: ['es-MX', 'nahuatl']
  }
];

const mockLessons = [
  {
    id: 'lesson-1',
    title: 'Los Números en Maya',
    description: 'Aprende a contar del 1 al 10 en idioma maya',
    content: {
      text: 'Hoy aprenderemos a contar en maya...',
      audio: '/audio/lesson-1.mp3',
      images: ['/images/numbers-maya.jpg']
    },
    culturalVariants: {
      examples: ['maíz', 'frijoles', 'calabazas'],
      context: 'agricultura tradicional maya'
    },
    accessibilityFeatures: {
      hasAudio: true,
      hasVisualAids: true,
      hasTextAlternative: true
    }
  },
  {
    id: 'lesson-2',
    title: 'Lectura Básica',
    description: 'Fundamentos de lectura y comprensión',
    content: {
      text: 'Vamos a aprender a leer...',
      audio: '/audio/lesson-2.mp3',
      images: ['/images/reading.jpg']
    },
    culturalVariants: {
      examples: ['historia local', 'tradiciones'],
      context: 'comunidad rural'
    },
    accessibilityFeatures: {
      hasAudio: true,
      hasVisualAids: true,
      hasTextAlternative: true
    }
  }
];

const mockSpecialNeeds = [
  {
    id: 'need-1',
    studentId: 'student-1',
    type: 'DYSLEXIA',
    severity: 'mild',
    confidence: 0.85,
    indicators: ['reversals', 'slow_reading'],
    recommendations: ['use_audio', 'larger_font'],
    detectedAt: new Date().toISOString()
  }
];

const mockAssessments = [
  {
    id: 'assessment-1',
    studentId: 'student-1',
    type: 'INITIAL',
    score: 75,
    maxScore: 100,
    conductedAt: new Date().toISOString(),
    results: {
      readingSpeed: 85,
      readingAccuracy: 0.92,
      readingComprehension: 0.88
    }
  }
];

// API Handlers
export const handlers = [
  // Students API
  http.get('/api/students', () => {
    return HttpResponse.json(mockStudents);
  }),

  http.get('/api/students/:id', ({ params }) => {
    const student = mockStudents.find(s => s.id === params.id);
    if (!student) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(student);
  }),

  http.post('/api/students', async ({ request }) => {
    const student = await request.json();
    return HttpResponse.json({ ...student, id: 'new-student-id' });
  }),

  // Teachers API
  http.get('/api/teachers', () => {
    return HttpResponse.json(mockTeachers);
  }),

  http.get('/api/teachers/:id', ({ params }) => {
    const teacher = mockTeachers.find(t => t.id === params.id);
    if (!teacher) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(teacher);
  }),

  // Lessons API
  http.get('/api/lessons', () => {
    return HttpResponse.json(mockLessons);
  }),

  http.get('/api/lessons/:id', ({ params }) => {
    const lesson = mockLessons.find(l => l.id === params.id);
    if (!lesson) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(lesson);
  }),

  // Special Needs API
  http.get('/api/special-needs', () => {
    return HttpResponse.json(mockSpecialNeeds);
  }),

  http.get('/api/special-needs/:id', ({ params }) => {
    const need = mockSpecialNeeds.find(n => n.id === params.id);
    if (!need) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(need);
  }),

  // Assessments API
  http.get('/api/assessments', () => {
    return HttpResponse.json(mockAssessments);
  }),

  http.get('/api/assessments/:id', ({ params }) => {
    const assessment = mockAssessments.find(a => a.id === params.id);
    if (!assessment) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(assessment);
  }),

  // AI Services API
  http.post('/api/ai/needs-detection', async ({ request }) => {
    const { studentId, interactionData } = await request.json();
    
    return HttpResponse.json({
      success: true,
      analysis: {
        specialNeeds: [
          {
            type: 'DYSLEXIA',
            severity: 'mild',
            confidence: 0.85,
            indicators: ['reversals', 'slow_reading'],
            recommendations: ['use_audio', 'larger_font']
          }
        ],
        learningProfile: {
          learningStyle: 'visual',
          pace: 'moderate',
          strengths: ['comprehension', 'creativity'],
          challenges: ['reading_speed', 'spelling']
        },
        culturalAdaptations: {
          languageSupport: ['maya_translations'],
          culturalRelevance: ['local_examples']
        }
      }
    });
  }),

  http.post('/api/ai/tts', async ({ request }) => {
    const { text, language, options } = await request.json();
    
    return HttpResponse.json({
      success: true,
      audio: 'base64_encoded_audio_data',
      format: 'mp3',
      language: language || 'es-MX',
      textLength: text.length,
      audioSize: 1024,
      cacheStats: { hits: 1, misses: 0 }
    });
  }),

  http.post('/api/ai/speech-recognition', async ({ request }) => {
    const { action, data } = await request.json();
    
    if (action === 'start') {
      return HttpResponse.json({
        success: true,
        message: 'Reconocimiento de voz iniciado'
      });
    }
    
    if (action === 'stop') {
      return HttpResponse.json({
        success: true,
        message: 'Reconocimiento de voz detenido'
      });
    }
    
    return HttpResponse.json({
      success: true,
      transcript: 'Texto reconocido de ejemplo',
      confidence: 0.95
    });
  }),

  // Offline Content API
  http.get('/api/offline/packages', ({ request }) => {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const culture = url.searchParams.get('culture') || 'maya';
    const language = url.searchParams.get('language') || 'es-GT';
    
    return HttpResponse.json({
      id: `package-${studentId}`,
      version: '1.0.0',
      studentId,
      culture,
      language,
      lessons: mockLessons,
      resources: [],
      metadata: {
        totalLessons: mockLessons.length,
        totalResources: 0,
        totalSize: 52428800,
        estimatedDownloadTime: 300,
        compatibility: ['mobile', 'tablet', 'desktop'],
        requirements: {
          minStorage: 55000000,
          minBandwidth: 100,
          supportedDevices: ['Android 8+', 'iOS 12+']
        }
      },
      size: 52428800,
      checksum: 'sha256-hash',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }),

  // Sync API
  http.post('/api/sync', async ({ request }) => {
    const { items } = await request.json();
    
    return HttpResponse.json({
      success: true,
      syncedItems: items.length,
      message: `${items.length} elementos sincronizados exitosamente`
    });
  }),

  // Auth API
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    
    if (email === 'test@example.com' && password === 'password') {
      return HttpResponse.json({
        success: true,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'student'
        },
        token: 'mock-jwt-token'
      });
    }
    
    return new HttpResponse(null, { status: 401 });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const userData = await request.json();
    
    return HttpResponse.json({
      success: true,
      user: {
        id: 'new-user-id',
        ...userData
      },
      token: 'mock-jwt-token'
    });
  }),

  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }),

  // Catch-all handler for unmatched requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`);
    return new HttpResponse(null, { status: 404 });
  })
];
