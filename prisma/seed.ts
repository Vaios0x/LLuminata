import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear maestros de prueba
  const teacher1 = await prisma.teacher.create({
    data: {
      name: 'María González',
      email: 'maria.gonzalez@escuela.edu',
      phone: '+502 1234-5678',
      school: 'Escuela Rural San Pedro',
      region: 'Guatemala Rural',
      languages: JSON.stringify(['es-GT', 'maya'])
    }
  })

  const teacher2 = await prisma.teacher.create({
    data: {
      name: 'Carlos Méndez',
      email: 'carlos.mendez@escuela.edu',
      phone: '+502 8765-4321',
      school: 'Escuela Comunitaria Xela',
      region: 'Quetzaltenango',
      languages: JSON.stringify(['es-GT', 'maya', 'k\'iche\''])
    }
  })

  // Crear familias
  const family1 = await prisma.family.create({
    data: {
      primaryContactName: 'Ana López',
      phone: '+502 5555-1234',
      email: 'ana.lopez@email.com',
      address: 'Aldea San Juan, Guatemala',
      socioeconomicLevel: 'bajo'
    }
  })

  // Crear estudiantes
  const student1 = await prisma.student.create({
    data: {
      name: 'Juan López',
      age: 8,
      gender: 'masculino',
      location: 'Aldea San Juan, Guatemala',
      language: 'es-GT',
      culturalBackground: 'maya',
      cognitiveLevel: 3,
      readingLevel: 2,
      hasInternet: false,
      deviceType: 'mobile',
      teacherId: teacher1.id,
      familyId: family1.id,
      learningProfile: {
        learningStyle: 'visual',
        pace: 'moderado',
        interests: ['naturaleza', 'animales'],
        challenges: ['lectura', 'concentración']
      }
    }
  })

  const student2 = await prisma.student.create({
    data: {
      name: 'María Santos',
      age: 10,
      gender: 'femenino',
      location: 'Xela, Quetzaltenango',
      language: 'maya',
      culturalBackground: 'maya-k\'iche\'',
      cognitiveLevel: 4,
      readingLevel: 3,
      hasInternet: true,
      deviceType: 'tablet',
      teacherId: teacher2.id,
      learningProfile: {
        learningStyle: 'kinestésico',
        pace: 'rápido',
        interests: ['música', 'danza'],
        challenges: ['matemáticas']
      }
    }
  })

  // Crear lecciones
  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'Los Números en Maya',
      description: 'Aprende a contar del 1 al 10 en idioma maya',
      subject: 'matemáticas',
      gradeLevel: 1,
      difficulty: 2,
      baseContent: {
        type: 'interactive',
        sections: [
          {
            title: 'Introducción',
            content: 'Hoy aprenderemos a contar en maya',
            media: ['audio_intro.mp3', 'imagen_numeros.jpg']
          },
          {
            title: 'Práctica',
            content: 'Practica contando objetos',
            interactive: true
          }
        ]
      },
      culturalVariants: {
        'maya': {
          examples: ['maíz', 'frijoles', 'calabazas'],
          context: 'agricultura tradicional'
        },
        'nahuatl': {
          examples: ['cacao', 'chiles', 'tomates'],
          context: 'cocina tradicional'
        }
      },
      languageVersions: {
        'es-GT': { title: 'Los Números en Maya', content: '...' },
        'maya': { title: 'Jun Junik', content: '...' },
        'k\'iche\'': { title: 'Jun Junik', content: '...' }
      },
      accessibilityFeatures: {
        audioSupport: true,
        visualAids: true,
        textToSpeech: true,
        highContrast: true
      },
      prerequisites: JSON.stringify([]),
      averageCompletionTime: 15,
      successRate: 0.85
    }
  })

  const lesson2 = await prisma.lesson.create({
    data: {
      title: 'Lectura Básica',
      description: 'Aprende a leer palabras simples',
      subject: 'lenguaje',
      gradeLevel: 1,
      difficulty: 1,
      baseContent: {
        type: 'progressive',
        sections: [
          {
            title: 'Vocales',
            content: 'A, E, I, O, U',
            media: ['audio_vocales.mp3']
          },
          {
            title: 'Sílabas',
            content: 'ma, me, mi, mo, mu',
            interactive: true
          }
        ]
      },
      culturalVariants: {
        'maya': {
          examples: ['maíz', 'maya', 'mundo'],
          context: 'palabras familiares'
        }
      },
      languageVersions: {
        'es-GT': { title: 'Lectura Básica', content: '...' },
        'maya': { title: 'Tz\'ib\'anik', content: '...' }
      },
      accessibilityFeatures: {
        audioSupport: true,
        visualAids: true,
        textToSpeech: true,
        fontSize: 'large'
      },
      prerequisites: JSON.stringify([lesson1.id]),
      averageCompletionTime: 20,
      successRate: 0.78
    }
  })

  // Crear lecciones completadas
  await prisma.completedLesson.create({
    data: {
      studentId: student1.id,
      lessonId: lesson1.id,
              startedAt: new Date('2025-01-15T10:00:00Z'),
        completedAt: new Date('2025-01-15T10:25:00Z'),
      timeSpent: 1500, // 25 minutos
      score: 85.5,
      attempts: 1,
      helpUsed: {
        audioPlayed: 3,
        hintsUsed: 1,
        timeExtensions: 0
      }
    }
  })

  // Crear evaluaciones
  await prisma.assessment.create({
    data: {
      studentId: student1.id,
      type: 'INITIAL',
      subject: 'general',
      score: 75.0,
      details: {
        reading: 70,
        math: 80,
        language: 75
      },
      strengths: JSON.stringify(['memoria visual', 'comprensión auditiva']),
      weaknesses: JSON.stringify(['velocidad de lectura', 'concentración']),
      recommendations: {
        suggestedPace: 'moderado',
        focusAreas: ['lectura', 'atención'],
        accommodations: ['tiempo extra', 'audio support']
      }
    }
  })

  // Crear necesidades especiales detectadas
  await prisma.specialNeed.create({
    data: {
      studentId: student1.id,
      type: 'DYSLEXIA',
      severity: 2,
      detectionMethod: 'AI',
      recommendations: {
        accommodations: [
          'texto con espaciado aumentado',
          'audio para todas las lecturas',
          'tiempo extra en evaluaciones'
        ],
        strategies: [
          'usar colores para distinguir letras',
          'practicar con palabras familiares',
          'reforzar con imágenes'
        ]
      }
    }
  })

  // Crear logros
  await prisma.achievement.create({
    data: {
      studentId: student1.id,
      type: 'lesson_completion',
      name: 'Primera Lección Completada',
      description: 'Completaste tu primera lección en la plataforma',
              earnedAt: new Date('2025-01-15T10:25:00Z')
    }
  })

  // Crear metas semanales
  await prisma.weeklyGoal.create({
    data: {
      studentId: student1.id,
              week: new Date('2025-01-15'),
      lessonsTarget: 3,
      lessonsCompleted: 1,
      minutesTarget: 60,
      minutesCompleted: 25
    }
  })

  console.log('✅ Seed completado exitosamente!')
  console.log(`📊 Datos creados:`)
  console.log(`   - ${await prisma.teacher.count()} maestros`)
  console.log(`   - ${await prisma.student.count()} estudiantes`)
  console.log(`   - ${await prisma.lesson.count()} lecciones`)
  console.log(`   - ${await prisma.family.count()} familias`)
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
