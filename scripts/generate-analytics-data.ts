#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AnalyticsData {
  userEngagement: Array<{
    userId: string;
    sessionDuration: number;
    pagesVisited: number;
    actionsPerformed: number;
    date: Date;
  }>;
  learningProgress: Array<{
    userId: string;
    lessonId: string;
    completionRate: number;
    timeSpent: number;
    attempts: number;
    date: Date;
  }>;
  assessmentResults: Array<{
    userId: string;
    assessmentId: string;
    score: number;
    timeSpent: number;
    questionsAnswered: number;
    date: Date;
  }>;
  gamificationMetrics: Array<{
    userId: string;
    pointsEarned: number;
    achievementsUnlocked: number;
    badgesEarned: number;
    challengesCompleted: number;
    date: Date;
  }>;
  accessibilityUsage: Array<{
    userId: string;
    featureUsed: string;
    usageDuration: number;
    effectiveness: number;
    date: Date;
  }>;
}

async function generateAnalyticsData() {
  console.log('📊 Generando datos de analytics...');

  try {
    const users = await prisma.user.findMany({ take: 10 });
    const lessons = await prisma.lesson.findMany({ take: 20 });
    const assessments = await prisma.assessment.findMany({ take: 10 });

    if (users.length === 0) {
      console.log('⚠️  No hay usuarios en la base de datos. Creando usuarios de ejemplo...');
      // Crear usuarios de ejemplo
      for (let i = 1; i <= 5; i++) {
        await prisma.user.create({
          data: {
            email: `user${i}@example.com`,
            name: `Usuario ${i}`,
            role: 'STUDENT',
            preferences: {
              accessibility: {
                fontSize: 'medium',
                contrast: 'normal',
                screenReader: false,
              },
            },
          },
        });
      }
      // Recargar usuarios
      const newUsers = await prisma.user.findMany({ take: 10 });
      users.push(...newUsers);
    }

    // Generar datos de engagement
    console.log('📈 Generando datos de engagement...');
    for (const user of users) {
      for (let i = 0; i < 30; i++) { // 30 días de datos
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        await prisma.userEngagement.create({
          data: {
            userId: user.id,
            sessionDuration: Math.floor(Math.random() * 3600) + 300, // 5-60 minutos
            pagesVisited: Math.floor(Math.random() * 20) + 1,
            actionsPerformed: Math.floor(Math.random() * 50) + 5,
            date: date,
          },
        });
      }
    }

    // Generar datos de progreso de aprendizaje
    console.log('📚 Generando datos de progreso de aprendizaje...');
    for (const user of users) {
      for (const lesson of lessons.slice(0, 10)) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        await prisma.learningProgress.create({
          data: {
            userId: user.id,
            lessonId: lesson.id,
            completionRate: Math.random() * 100,
            timeSpent: Math.floor(Math.random() * 1800) + 300, // 5-30 minutos
            attempts: Math.floor(Math.random() * 3) + 1,
            date: date,
          },
        });
      }
    }

    // Generar datos de resultados de evaluaciones
    console.log('📝 Generando datos de evaluaciones...');
    for (const user of users) {
      for (const assessment of assessments.slice(0, 5)) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        await prisma.assessmentResult.create({
          data: {
            userId: user.id,
            assessmentId: assessment.id,
            score: Math.floor(Math.random() * 40) + 60, // 60-100%
            timeSpent: Math.floor(Math.random() * 1800) + 600, // 10-40 minutos
            questionsAnswered: Math.floor(Math.random() * 20) + 10,
            date: date,
          },
        });
      }
    }

    // Generar datos de gamificación
    console.log('🎮 Generando datos de gamificación...');
    for (const user of users) {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        await prisma.gamificationMetrics.create({
          data: {
            userId: user.id,
            pointsEarned: Math.floor(Math.random() * 100) + 10,
            achievementsUnlocked: Math.floor(Math.random() * 3),
            badgesEarned: Math.floor(Math.random() * 2),
            challengesCompleted: Math.floor(Math.random() * 2),
            date: date,
          },
        });
      }
    }

    // Generar datos de uso de accesibilidad
    console.log('♿ Generando datos de accesibilidad...');
    const accessibilityFeatures = [
      'screen_reader',
      'high_contrast',
      'large_font',
      'voice_commands',
      'keyboard_navigation',
    ];

    for (const user of users) {
      for (let i = 0; i < 15; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const feature = accessibilityFeatures[Math.floor(Math.random() * accessibilityFeatures.length)];
        
        await prisma.accessibilityUsage.create({
          data: {
            userId: user.id,
            featureUsed: feature,
            usageDuration: Math.floor(Math.random() * 3600) + 300, // 5-60 minutos
            effectiveness: Math.random() * 100,
            date: date,
          },
        });
      }
    }

    // Generar datos de performance
    console.log('⚡ Generando datos de performance...');
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      await prisma.performanceMetrics.create({
          data: {
          pageLoadTime: Math.random() * 3000 + 500, // 500-3500ms
          apiResponseTime: Math.random() * 1000 + 100, // 100-1100ms
          memoryUsage: Math.random() * 100 + 50, // 50-150MB
          cpuUsage: Math.random() * 30 + 10, // 10-40%
          date: date,
        },
      });
    }

    // Generar datos de errores
    console.log('🐛 Generando datos de errores...');
    const errorTypes = ['API_ERROR', 'UI_ERROR', 'AUTH_ERROR', 'DB_ERROR', 'NETWORK_ERROR'];
    
    for (let i = 0; i < 20; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      await prisma.errorLog.create({
        data: {
          type: errorTypes[Math.floor(Math.random() * errorTypes.length)],
          message: `Error de ejemplo ${i + 1}`,
          stack: `Error stack trace ${i + 1}`,
          userId: users[Math.floor(Math.random() * users.length)]?.id || null,
          date: date,
        },
      });
    }

    console.log('✅ Datos de analytics generados exitosamente!');
    console.log(`📊 Se generaron:`);
    console.log(`  - ${users.length * 30} registros de engagement`);
    console.log(`  - ${users.length * 10} registros de progreso de aprendizaje`);
    console.log(`  - ${users.length * 5} registros de evaluaciones`);
    console.log(`  - ${users.length * 30} registros de gamificación`);
    console.log(`  - ${users.length * 15} registros de accesibilidad`);
    console.log(`  - 30 registros de performance`);
    console.log(`  - 20 registros de errores`);

  } catch (error) {
    console.error('❌ Error generando datos de analytics:', error);
    throw error;
  }
}

// Función para limpiar datos de analytics
async function cleanupAnalyticsData() {
  console.log('🧹 Limpiando datos de analytics...');

  try {
    await prisma.userEngagement.deleteMany();
    await prisma.learningProgress.deleteMany();
    await prisma.assessmentResult.deleteMany();
    await prisma.gamificationMetrics.deleteMany();
    await prisma.accessibilityUsage.deleteMany();
    await prisma.performanceMetrics.deleteMany();
    await prisma.errorLog.deleteMany();

    console.log('✅ Datos de analytics limpiados exitosamente!');
    } catch (error) {
    console.error('❌ Error limpiando datos de analytics:', error);
      throw error;
  }
}

// Ejecutar el script
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === '--cleanup') {
    cleanupAnalyticsData()
      .then(() => {
        console.log('🎉 Limpieza completada exitosamente!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Error en la limpieza:', error);
        process.exit(1);
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
  } else {
    generateAnalyticsData()
      .then(() => {
        console.log('🎉 Proceso completado exitosamente!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Error en el proceso:', error);
        process.exit(1);
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
  }
}
