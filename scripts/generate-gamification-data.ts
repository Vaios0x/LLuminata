#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GamificationData {
  achievements: Array<{
    name: string;
    description: string;
    icon: string;
    points: number;
    category: string;
  }>;
  badges: Array<{
    name: string;
    description: string;
    icon: string;
    rarity: string;
    requirements: string[];
  }>;
  leaderboards: Array<{
    name: string;
    description: string;
    type: string;
    resetFrequency: string;
  }>;
  challenges: Array<{
    title: string;
    description: string;
    points: number;
    difficulty: string;
    duration: number;
    requirements: string[];
  }>;
}

const gamificationData: GamificationData = {
  achievements: [
    {
      name: 'Primer Paso',
      description: 'Completa tu primera lección',
      icon: '🎯',
      points: 10,
      category: 'PROGRESS',
    },
    {
      name: 'Estudiante Dedicado',
      description: 'Completa 5 lecciones en una semana',
      icon: '📚',
      points: 50,
      category: 'PROGRESS',
    },
    {
      name: 'Maestro del Conocimiento',
      description: 'Completa 50 lecciones',
      icon: '👑',
      points: 200,
      category: 'PROGRESS',
    },
    {
      name: 'Perfecto',
      description: 'Obtén 100% en una evaluación',
      icon: '⭐',
      points: 25,
      category: 'PERFORMANCE',
    },
    {
      name: 'Consistente',
      description: 'Obtén 90% o más en 10 evaluaciones consecutivas',
      icon: '🔥',
      points: 100,
      category: 'PERFORMANCE',
    },
    {
      name: 'Ayudante',
      description: 'Ayuda a 5 compañeros',
      icon: '🤝',
      points: 30,
      category: 'SOCIAL',
    },
    {
      name: 'Explorador',
      description: 'Prueba todas las funcionalidades de la plataforma',
      icon: '🔍',
      points: 75,
      category: 'EXPLORATION',
    },
    {
      name: 'Puntual',
      description: 'Completa 7 días consecutivos de estudio',
      icon: '⏰',
      points: 40,
      category: 'CONSISTENCY',
    },
  ],
  badges: [
    {
      name: 'Novato',
      description: 'Comienza tu viaje de aprendizaje',
      icon: '🌱',
      rarity: 'COMMON',
      requirements: ['Completar primera lección'],
    },
    {
      name: 'Aprendiz',
      description: 'Has completado 10 lecciones',
      icon: '📖',
      rarity: 'COMMON',
      requirements: ['Completar 10 lecciones'],
    },
    {
      name: 'Estudiante Avanzado',
      description: 'Has completado 25 lecciones',
      icon: '🎓',
      rarity: 'RARE',
      requirements: ['Completar 25 lecciones'],
    },
    {
      name: 'Experto',
      description: 'Has completado 50 lecciones',
      icon: '🏆',
      rarity: 'EPIC',
      requirements: ['Completar 50 lecciones'],
    },
    {
      name: 'Maestro',
      description: 'Has completado 100 lecciones',
      icon: '👑',
      rarity: 'LEGENDARY',
      requirements: ['Completar 100 lecciones'],
    },
    {
      name: 'Perfecto',
      description: 'Obtuviste 100% en una evaluación',
      icon: '💎',
      rarity: 'RARE',
      requirements: ['Obtener 100% en evaluación'],
    },
    {
      name: 'Ayudante',
      description: 'Ayudaste a 10 compañeros',
      icon: '🤝',
      rarity: 'RARE',
      requirements: ['Ayudar a 10 compañeros'],
    },
    {
      name: 'Mentor',
      description: 'Ayudaste a 50 compañeros',
      icon: '🌟',
      rarity: 'EPIC',
      requirements: ['Ayudar a 50 compañeros'],
    },
  ],
  leaderboards: [
    {
      name: 'Líderes Semanales',
      description: 'Estudiantes con más puntos esta semana',
      type: 'POINTS',
      resetFrequency: 'WEEKLY',
    },
    {
      name: 'Líderes Mensuales',
      description: 'Estudiantes con más puntos este mes',
      type: 'POINTS',
      resetFrequency: 'MONTHLY',
    },
    {
      name: 'Líderes de Lecciones',
      description: 'Estudiantes que han completado más lecciones',
      type: 'LESSONS_COMPLETED',
      resetFrequency: 'NEVER',
    },
    {
      name: 'Líderes de Precisión',
      description: 'Estudiantes con mejor promedio en evaluaciones',
      type: 'AVERAGE_SCORE',
      resetFrequency: 'MONTHLY',
    },
    {
      name: 'Líderes de Ayuda',
      description: 'Estudiantes que más han ayudado a otros',
      type: 'HELP_COUNT',
      resetFrequency: 'MONTHLY',
    },
  ],
  challenges: [
    {
      title: 'Desafío Semanal',
      description: 'Completa 5 lecciones esta semana',
      points: 100,
      difficulty: 'EASY',
      duration: 7,
      requirements: ['Completar 5 lecciones en 7 días'],
    },
    {
      title: 'Desafío de Precisión',
      description: 'Obtén 95% o más en 3 evaluaciones consecutivas',
      points: 150,
      difficulty: 'MEDIUM',
      duration: 14,
      requirements: ['Obtener 95%+ en 3 evaluaciones consecutivas'],
    },
    {
      title: 'Desafío Social',
      description: 'Ayuda a 10 compañeros en una semana',
      points: 200,
      difficulty: 'HARD',
      duration: 7,
      requirements: ['Ayudar a 10 compañeros en 7 días'],
    },
    {
      title: 'Desafío de Consistencia',
      description: 'Estudia 30 días consecutivos',
      points: 300,
      difficulty: 'HARD',
      duration: 30,
      requirements: ['Estudiar 30 días consecutivos'],
    },
    {
      title: 'Desafío de Exploración',
      description: 'Prueba todas las funcionalidades de la plataforma',
      points: 250,
      difficulty: 'MEDIUM',
      duration: 21,
      requirements: ['Usar todas las funcionalidades'],
    },
  ],
};

async function generateGamificationData() {
  console.log('🎮 Generando datos de gamificación...');

  try {
    // Generar Achievements
    console.log('🏆 Generando achievements...');
    for (const achievement of gamificationData.achievements) {
      await prisma.achievement.upsert({
        where: { name: achievement.name },
        update: achievement,
        create: achievement,
      });
    }

    // Generar Badges
    console.log('🏅 Generando badges...');
    for (const badge of gamificationData.badges) {
      await prisma.badge.upsert({
        where: { name: badge.name },
        update: badge,
        create: badge,
      });
    }

    // Generar Leaderboards
    console.log('📊 Generando leaderboards...');
    for (const leaderboard of gamificationData.leaderboards) {
      await prisma.leaderboard.upsert({
        where: { name: leaderboard.name },
        update: leaderboard,
        create: leaderboard,
      });
    }

    // Generar Challenges
    console.log('🎯 Generando challenges...');
    for (const challenge of gamificationData.challenges) {
      await prisma.challenge.upsert({
        where: { title: challenge.title },
        update: challenge,
        create: challenge,
      });
    }

    // Generar datos de ejemplo para usuarios
    console.log('👥 Generando datos de ejemplo para usuarios...');
    
    const users = await prisma.user.findMany({ take: 5 });
    
    for (const user of users) {
      // Asignar algunos achievements
      const randomAchievements = gamificationData.achievements
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1);

      for (const achievement of randomAchievements) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: user.id,
              achievementId: achievement.name,
            },
          },
          update: {},
          create: {
            userId: user.id,
            achievementId: achievement.name,
            earnedAt: new Date(),
          },
        });
      }

      // Asignar algunos badges
      const randomBadges = gamificationData.badges
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 2) + 1);

      for (const badge of randomBadges) {
        await prisma.userBadge.upsert({
          where: {
            userId_badgeId: {
              userId: user.id,
              badgeId: badge.name,
            },
          },
          update: {},
          create: {
            userId: user.id,
            badgeId: badge.name,
            earnedAt: new Date(),
          },
        });
      }

      // Generar puntos de ejemplo
      const totalPoints = randomAchievements.reduce((sum, a) => sum + a.points, 0);
      
      await prisma.userPoints.upsert({
        where: { userId: user.id },
        update: { points: totalPoints },
        create: {
          userId: user.id,
          points: totalPoints,
        },
      });
    }

    console.log('✅ Datos de gamificación generados exitosamente!');
    console.log(`📊 Se generaron:`);
    console.log(`  - ${gamificationData.achievements.length} achievements`);
    console.log(`  - ${gamificationData.badges.length} badges`);
    console.log(`  - ${gamificationData.leaderboards.length} leaderboards`);
    console.log(`  - ${gamificationData.challenges.length} challenges`);

  } catch (error) {
    console.error('❌ Error generando datos de gamificación:', error);
    throw error;
  }
}

// Ejecutar el script
if (require.main === module) {
  generateGamificationData()
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
