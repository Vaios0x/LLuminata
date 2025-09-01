# Guía de Configuración de Gamificación

## Descripción General

Esta guía proporciona instrucciones paso a paso para configurar el sistema de gamificación de InclusiveAI Coach, incluyendo la configuración de niveles, badges, logros, competencias y sistemas de recompensas.

## Requisitos Previos

- Node.js 18+ instalado
- Base de datos PostgreSQL configurada
- Variables de entorno configuradas
- Permisos de administrador

## Instalación

### 1. Instalar Dependencias

```bash
# Navegar al directorio del proyecto
cd inclusive-ai-coach

# Instalar dependencias
npm install

# Instalar dependencias específicas de gamificación
npm install @prisma/client bcryptjs jsonwebtoken
```

### 2. Configurar Variables de Entorno

Crear o actualizar el archivo `.env`:

```env
# Configuración de gamificación
GAMIFICATION_ENABLED=true
GAMIFICATION_API_URL=http://localhost:3000/api/gamification
GAMIFICATION_WEBSOCKET_URL=ws://localhost:3000/ws/gamification

# Configuración de recompensas
REWARDS_ENABLED=true
TRADING_ENABLED=true
CLAN_SYSTEM_ENABLED=true

# Configuración de eventos
EVENTS_ENABLED=true
EVENTS_NOTIFICATION_ENABLED=true

# Configuración de base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/inclusive_ai"
```

### 3. Configurar Base de Datos

Ejecutar las migraciones de Prisma:

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init-gamification

# Sembrar datos iniciales
npx prisma db seed
```

## Configuración de Componentes

### 1. Configurar GamificationDashboard

```typescript
// app/gamification/page.tsx
import { GamificationDashboard } from '@/components/gamification/gamification-dashboard';

export default function GamificationPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Gamificación</h1>
      <GamificationDashboard userId="current-user-id" />
    </div>
  );
}
```

### 2. Configurar CompetitionBoard

```typescript
// components/gamification/CompetitionBoard.tsx
import { CompetitionBoard } from '@/components/gamification/CompetitionBoard';

export function CompetitionSection() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Competencias Activas</h2>
      <CompetitionBoard 
        userId="current-user-id"
        competitions={[]} // Se cargarán automáticamente
      />
    </div>
  );
}
```

### 3. Configurar ClanSystem

```typescript
// components/gamification/ClanSystem.tsx
import { ClanSystem } from '@/components/gamification/ClanSystem';

export function ClanSection() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Mi Clan</h2>
      <ClanSystem 
        userId="current-user-id"
        clanId="user-clan-id" // Opcional
      />
    </div>
  );
}
```

## Configuración de APIs

### 1. Configurar Rutas de API

Crear las rutas de API necesarias:

```typescript
// app/api/gamification/user-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Obtener datos de gamificación del usuario
    const gamificationData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        level: true,
        badges: {
          include: { badge: true }
        },
        achievements: {
          include: { achievement: true }
        },
        rewards: {
          include: { reward: true }
        },
        stats: true
      }
    });

    return NextResponse.json({ data: gamificationData });
  } catch (error) {
    console.error('Error fetching gamification data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 2. Configurar WebSocket para Tiempo Real

```typescript
// lib/websocket/gamification.ts
import { Server } from 'socket.io';

export function setupGamificationWebSocket(io: Server) {
  const gamificationNamespace = io.of('/gamification');

  gamificationNamespace.on('connection', (socket) => {
    console.log('User connected to gamification namespace:', socket.id);

    // Unirse a sala del usuario
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user-${userId}`);
    });

    // Manejar actualizaciones de progreso
    socket.on('progress-update', (data) => {
      // Emitir actualización a todos los clientes del usuario
      gamificationNamespace.to(`user-${data.userId}`).emit('progress-updated', data);
    });

    // Manejar nuevos logros
    socket.on('achievement-earned', (data) => {
      gamificationNamespace.to(`user-${data.userId}`).emit('achievement-unlocked', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from gamification namespace:', socket.id);
    });
  });
}
```

## Configuración de Base de Datos

### 1. Esquema de Base de Datos

```prisma
// prisma/schema.prisma

// Modelo de Usuario
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones de gamificación
  level      Level?
  badges     UserBadge[]
  achievements UserAchievement[]
  rewards    UserReward[]
  stats      UserStats?
  clan       Clan?    @relation(fields: [clanId], references: [id])
  clanId     String?
  competitions UserCompetition[]
}

// Modelo de Nivel
model Level {
  id                String @id @default(cuid())
  userId            String @unique
  level             Int    @default(1)
  experience        Int    @default(0)
  points            Int    @default(0)
  title             String @default("Novato")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Modelo de Badge
model Badge {
  id          String @id @default(cuid())
  name        String
  description String
  icon        String
  category    String
  rarity      String
  points      Int    @default(0)
  createdAt   DateTime @default(now())

  userBadges UserBadge[]
}

// Modelo de Usuario-Badge
model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  badgeId   String
  earnedAt  DateTime @default(now())
  progress  Int      @default(0)

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge Badge @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
}

// Modelo de Logro
model Achievement {
  id          String @id @default(cuid())
  name        String
  description String
  icon        String
  category    String
  points      Int    @default(0)
  requirements Json
  createdAt   DateTime @default(now())

  userAchievements UserAchievement[]
}

// Modelo de Usuario-Logro
model UserAchievement {
  id           String @id @default(cuid())
  userId       String
  achievementId String
  earnedAt     DateTime @default(now())
  progress     Int      @default(0)

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@unique([userId, achievementId])
}

// Modelo de Recompensa
model Reward {
  id          String @id @default(cuid())
  name        String
  description String
  type        String
  value       Int
  icon        String?
  createdAt   DateTime @default(now())

  userRewards UserReward[]
}

// Modelo de Usuario-Recompensa
model UserReward {
  id        String    @id @default(cuid())
  userId    String
  rewardId  String
  earnedAt  DateTime  @default(now())
  claimedAt DateTime?

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  reward Reward @relation(fields: [rewardId], references: [id], onDelete: Cascade)

  @@unique([userId, rewardId])
}

// Modelo de Estadísticas
model UserStats {
  id                  String @id @default(cuid())
  userId              String @unique
  lessonsCompleted    Int    @default(0)
  assessmentsPassed   Int    @default(0)
  culturalActivities  Int    @default(0)
  helpOthers          Int    @default(0)
  perfectScores       Int    @default(0)
  studyStreak         Int    @default(0)
  languagesLearned    Int    @default(0)
  studentsHelped      Int    @default(0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Modelo de Clan
model Clan {
  id          String @id @default(cuid())
  name        String
  description String?
  icon        String?
  level       Int    @default(1)
  experience  Int    @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users User[]
}

// Modelo de Competencia
model Competition {
  id          String @id @default(cuid())
  name        String
  description String
  type        String
  startDate   DateTime
  endDate     DateTime
  status      String @default("upcoming")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  participants UserCompetition[]
}

// Modelo de Usuario-Competencia
model UserCompetition {
  id            String @id @default(cuid())
  userId        String
  competitionId String
  joinedAt      DateTime @default(now())
  score         Int      @default(0)
  rank          Int?

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  competition Competition @relation(fields: [competitionId], references: [id], onDelete: Cascade)

  @@unique([userId, competitionId])
}
```

### 2. Datos Iniciales

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear badges iniciales
  const badges = [
    {
      name: "Primer Paso",
      description: "Completaste tu primera lección",
      icon: "🎯",
      category: "learning",
      rarity: "common",
      points: 10
    },
    {
      name: "Estudiante Dedicado",
      description: "Completaste 10 lecciones",
      icon: "📚",
      category: "learning",
      rarity: "uncommon",
      points: 25
    },
    {
      name: "Ayudante",
      description: "Ayudaste a otro estudiante",
      icon: "🤝",
      category: "social",
      rarity: "common",
      points: 15
    }
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge
    });
  }

  // Crear logros iniciales
  const achievements = [
    {
      name: "Estudiante Avanzado",
      description: "Alcanzaste el nivel 5",
      icon: "⭐",
      category: "progression",
      points: 50,
      requirements: { level: 5 }
    },
    {
      name: "Coleccionista",
      description: "Obtuviste 10 badges",
      icon: "🏆",
      category: "collection",
      points: 100,
      requirements: { badges: 10 }
    }
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement
    });
  }

  // Crear recompensas iniciales
  const rewards = [
    {
      name: "Puntos Extra",
      description: "100 puntos adicionales",
      type: "points",
      value: 100,
      icon: "💎"
    },
    {
      name: "Título Especial",
      description: "Título personalizado por 7 días",
      type: "title",
      value: 1,
      icon: "👑"
    }
  ];

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: { name: reward.name },
      update: {},
      create: reward
    });
  }

  console.log('Datos iniciales de gamificación creados');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Configuración de Hooks

### 1. Configurar useGamification

```typescript
// lib/hooks/useGamification.ts
import { useState, useEffect, useCallback } from 'react';

interface GamificationData {
  level: {
    level: number;
    experience: number;
    points: number;
    title: string;
  };
  badges: any[];
  achievements: any[];
  rewards: any[];
  stats: any;
}

export function useGamification(userId: string) {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/user-data?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load gamification data');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProgress = useCallback(async (progressData: any) => {
    try {
      const response = await fetch('/api/gamification/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...progressData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      // Recargar datos
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [userId, loadData]);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, loadData]);

  return {
    data,
    loading,
    error,
    updateProgress,
    refresh: loadData
  };
}
```

## Configuración de Notificaciones

### 1. Configurar Notificaciones de Gamificación

```typescript
// components/gamification/gamification-notification.tsx
import { useEffect } from 'react';
import { useGamification } from '@/lib/hooks/useGamification';

export function GamificationNotifications({ userId }: { userId: string }) {
  const { data } = useGamification(userId);

  useEffect(() => {
    // Configurar WebSocket para notificaciones en tiempo real
    const socket = new WebSocket(process.env.NEXT_PUBLIC_GAMIFICATION_WS_URL!);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'join-user-room',
        userId
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'achievement-unlocked':
          showNotification('¡Logro Desbloqueado!', data.achievement.name);
          break;
        case 'level-up':
          showNotification('¡Subiste de Nivel!', `Ahora eres ${data.newTitle}`);
          break;
        case 'badge-earned':
          showNotification('¡Nuevo Badge!', data.badge.name);
          break;
      }
    };

    return () => {
      socket.close();
    };
  }, [userId]);

  const showNotification = (title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
    }
  };

  return null;
}
```

## Configuración de Eventos

### 1. Configurar Eventos de Gamificación

```typescript
// lib/events/gamification-events.ts
import { prisma } from '@/lib/prisma';

export class GamificationEventManager {
  static async handleLessonCompleted(userId: string, lessonId: string) {
    try {
      // Actualizar estadísticas
      await prisma.userStats.upsert({
        where: { userId },
        update: {
          lessonsCompleted: { increment: 1 }
        },
        create: {
          userId,
          lessonsCompleted: 1
        }
      });

      // Verificar si se debe otorgar un badge
      const stats = await prisma.userStats.findUnique({
        where: { userId }
      });

      if (stats?.lessonsCompleted === 1) {
        await this.grantBadge(userId, 'Primer Paso');
      }

      if (stats?.lessonsCompleted === 10) {
        await this.grantBadge(userId, 'Estudiante Dedicado');
      }

      // Actualizar experiencia y nivel
      await this.addExperience(userId, 10);

    } catch (error) {
      console.error('Error handling lesson completed:', error);
    }
  }

  static async handleAssessmentPassed(userId: string, assessmentId: string, score: number) {
    try {
      // Actualizar estadísticas
      await prisma.userStats.upsert({
        where: { userId },
        update: {
          assessmentsPassed: { increment: 1 },
          perfectScores: score === 100 ? { increment: 1 } : undefined
        },
        create: {
          userId,
          assessmentsPassed: 1,
          perfectScores: score === 100 ? 1 : 0
        }
      });

      // Otorgar puntos basados en la puntuación
      const points = Math.floor(score / 10);
      await this.addPoints(userId, points);

    } catch (error) {
      console.error('Error handling assessment passed:', error);
    }
  }

  private static async grantBadge(userId: string, badgeName: string) {
    const badge = await prisma.badge.findUnique({
      where: { name: badgeName }
    });

    if (badge) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
          progress: 100
        }
      });

      // Emitir evento de WebSocket
      // this.emitWebSocketEvent(userId, 'badge-earned', { badge });
    }
  }

  private static async addExperience(userId: string, amount: number) {
    const level = await prisma.level.findUnique({
      where: { userId }
    });

    if (level) {
      const newExperience = level.experience + amount;
      const experienceForNextLevel = level.level * 100; // 100 XP por nivel

      if (newExperience >= experienceForNextLevel) {
        // Subir de nivel
        await prisma.level.update({
          where: { userId },
          data: {
            level: { increment: 1 },
            experience: newExperience - experienceForNextLevel,
            points: { increment: 50 }, // 50 puntos por subir de nivel
            title: this.getTitleForLevel(level.level + 1)
          }
        });

        // Emitir evento de WebSocket
        // this.emitWebSocketEvent(userId, 'level-up', { newLevel: level.level + 1 });
      } else {
        // Solo actualizar experiencia
        await prisma.level.update({
          where: { userId },
          data: {
            experience: newExperience
          }
        });
      }
    }
  }

  private static async addPoints(userId: string, amount: number) {
    await prisma.level.update({
      where: { userId },
      data: {
        points: { increment: amount }
      }
    });
  }

  private static getTitleForLevel(level: number): string {
    const titles = [
      "Novato",
      "Aprendiz",
      "Estudiante",
      "Avanzado",
      "Experto",
      "Maestro",
      "Gurú"
    ];

    return titles[Math.min(level - 1, titles.length - 1)];
  }
}
```

## Configuración de Monitoreo

### 1. Configurar Métricas de Gamificación

```typescript
// lib/analytics/gamification-metrics.ts
import { prisma } from '@/lib/prisma';

export class GamificationMetrics {
  static async getUserEngagement(userId: string) {
    const stats = await prisma.userStats.findUnique({
      where: { userId }
    });

    if (!stats) return 0;

    // Calcular engagement basado en múltiples factores
    const engagement = (
      stats.lessonsCompleted * 0.3 +
      stats.assessmentsPassed * 0.2 +
      stats.culturalActivities * 0.15 +
      stats.helpOthers * 0.1 +
      stats.perfectScores * 0.1 +
      stats.studyStreak * 0.1 +
      stats.languagesLearned * 0.05
    );

    return Math.min(engagement, 100);
  }

  static async getSystemMetrics() {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.userStats.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
        }
      }
    });

    const totalBadgesEarned = await prisma.userBadge.count();
    const totalAchievementsEarned = await prisma.userAchievement.count();

    return {
      totalUsers,
      activeUsers,
      totalBadgesEarned,
      totalAchievementsEarned,
      engagementRate: (activeUsers / totalUsers) * 100
    };
  }
}
```

## Testing

### 1. Tests de Configuración

```typescript
// tests/gamification-setup.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Gamification Setup', () => {
  beforeAll(async () => {
    // Configurar base de datos de prueba
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create initial badges', async () => {
    const badges = await prisma.badge.findMany();
    expect(badges.length).toBeGreaterThan(0);
    expect(badges.some(b => b.name === 'Primer Paso')).toBe(true);
  });

  it('should create initial achievements', async () => {
    const achievements = await prisma.achievement.findMany();
    expect(achievements.length).toBeGreaterThan(0);
  });

  it('should handle user progression correctly', async () => {
    // Test de progresión de usuario
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Las migraciones fallan**
   - Verificar conexión a base de datos
   - Comprobar permisos de usuario
   - Revisar esquema de Prisma

2. **Los componentes no se renderizan**
   - Verificar configuración de rutas
   - Comprobar importaciones
   - Revisar logs de consola

3. **Las notificaciones no funcionan**
   - Verificar permisos de notificación
   - Comprobar configuración de WebSocket
   - Revisar configuración de eventos

### Logs de Debug

```typescript
// Habilitar logs de debug
const DEBUG_GAMIFICATION = process.env.NODE_ENV === 'development';

if (DEBUG_GAMIFICATION) {
  console.log('Gamification setup completed');
  console.log('Database connection:', databaseStatus);
  console.log('WebSocket connection:', websocketStatus);
}
```

## Recursos Adicionales

- [Documentación de Componentes de Gamificación](../components/gamification.md)
- [API de Gamificación](../AI-APIS.md#gamification)
- [Base de Datos](../DATABASE.md)
- [Testing](../TESTING.md)
