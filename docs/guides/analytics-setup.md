# Guía de Configuración de Analytics

## Descripción General

Esta guía proporciona instrucciones paso a paso para configurar el sistema de analytics de InclusiveAI Coach, incluyendo dashboards en tiempo real, análisis predictivo, mapas de calor, y herramientas de exportación.

## Requisitos Previos

- Node.js 18+ instalado
- Base de datos PostgreSQL configurada
- Redis para cache y rate limiting
- Variables de entorno configuradas
- Permisos de administrador

## Instalación

### 1. Instalar Dependencias

```bash
# Navegar al directorio del proyecto
cd inclusive-ai-coach

# Instalar dependencias
npm install

# Instalar dependencias específicas de analytics
npm install @prisma/client redis socket.io chart.js react-chartjs-2
npm install @types/redis @types/socket.io
```

### 2. Configurar Variables de Entorno

Crear o actualizar el archivo `.env`:

```env
# Configuración de analytics
ANALYTICS_ENABLED=true
ANALYTICS_API_URL=http://localhost:3000/api/analytics
ANALYTICS_WEBSOCKET_URL=ws://localhost:3000/ws/analytics

# Configuración de predicciones
ML_MODELS_ENABLED=true
PREDICTION_API_URL=http://localhost:3000/api/ml/predictions

# Configuración de exportación
EXPORT_ENABLED=true
EXPORT_STORAGE_PATH=/exports
EXPORT_MAX_SIZE=100MB

# Configuración de A/B testing
AB_TESTING_ENABLED=true
AB_TESTING_SAMPLE_SIZE=1000
AB_TESTING_CONFIDENCE_LEVEL=0.95

# Configuración de mapas de calor
HEATMAP_ENABLED=true
HEATMAP_RESOLUTION=high
HEATMAP_STORAGE_ENABLED=true

# Configuración de Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Configuración de base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/inclusive_ai"
```

### 3. Configurar Base de Datos

Ejecutar las migraciones de Prisma:

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init-analytics

# Sembrar datos iniciales
npx prisma db seed
```

## Configuración de Componentes

### 1. Configurar AnalyticsDashboard

```typescript
// app/analytics/page.tsx
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <AnalyticsDashboard 
        timeRange="last_30_days"
        filters={{ category: 'learning', region: 'mexico' }}
      />
    </div>
  );
}
```

### 2. Configurar RealTimeMetrics

```typescript
// components/analytics/RealTimeMetrics.tsx
import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics';

export function RealTimeSection() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Métricas en Tiempo Real</h2>
      <RealTimeMetrics 
        metrics={[]} // Se cargarán automáticamente
        updateInterval={5000}
        autoRefresh={true}
      />
    </div>
  );
}
```

### 3. Configurar PredictiveAnalytics

```typescript
// components/analytics/PredictiveAnalytics.tsx
import { PredictiveAnalytics } from '@/components/analytics/PredictiveAnalytics';

export function PredictiveSection() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Análisis Predictivo</h2>
      <PredictiveAnalytics 
        userId="current-user-id"
        predictionType="engagement"
        timeframe={30}
      />
    </div>
  );
}
```

## Configuración de APIs

### 1. Configurar Rutas de API

Crear las rutas de API necesarias:

```typescript
// app/api/analytics/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'last_30_days';
    const category = searchParams.get('category');

    // Intentar obtener del cache primero
    const cacheKey = `analytics:metrics:${timeRange}:${category}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Calcular métricas
    const metrics = await calculateMetrics(timeRange, category);

    // Guardar en cache por 5 minutos
    await redis.setex(cacheKey, 300, JSON.stringify(metrics));

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function calculateMetrics(timeRange: string, category?: string) {
  const startDate = getStartDate(timeRange);

  const whereClause: any = {
    createdAt: {
      gte: startDate
    }
  };

  if (category) {
    whereClause.category = category;
  }

  const [
    totalUsers,
    activeUsers,
    lessonsCompleted,
    assessmentsPassed,
    engagementRate
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.lessonCompletion.count({ where: whereClause }),
    prisma.assessmentResult.count({ where: whereClause }),
    calculateEngagementRate(startDate)
  ]);

  return {
    totalUsers,
    activeUsers,
    lessonsCompleted,
    assessmentsPassed,
    engagementRate,
    timestamp: new Date().toISOString()
  };
}

function getStartDate(timeRange: string): Date {
  const now = new Date();
  switch (timeRange) {
    case 'last_7_days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'last_30_days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'last_90_days':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

async function calculateEngagementRate(startDate: Date): Promise<number> {
  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.user.count({
    where: {
      lastLoginAt: {
        gte: startDate
      }
    }
  });

  return totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
}
```

### 2. Configurar WebSocket para Tiempo Real

```typescript
// lib/websocket/analytics.ts
import { Server } from 'socket.io';
import { redis } from '@/lib/redis';

export function setupAnalyticsWebSocket(io: Server) {
  const analyticsNamespace = io.of('/analytics');

  analyticsNamespace.on('connection', (socket) => {
    console.log('User connected to analytics namespace:', socket.id);

    // Unirse a sala de métricas globales
    socket.on('join-global-metrics', () => {
      socket.join('global-metrics');
    });

    // Unirse a sala de métricas específicas
    socket.on('join-metrics-room', (room: string) => {
      socket.join(`metrics-${room}`);
    });

    // Manejar actualizaciones de métricas
    socket.on('metrics-update', (data) => {
      // Emitir actualización a todos los clientes
      analyticsNamespace.to('global-metrics').emit('metrics-updated', data);
    });

    // Manejar eventos de usuario
    socket.on('user-event', (data) => {
      // Procesar evento y actualizar métricas
      processUserEvent(data);
      
      // Emitir actualización
      analyticsNamespace.to('global-metrics').emit('user-event-processed', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from analytics namespace:', socket.id);
    });
  });

  // Configurar actualización automática cada 30 segundos
  setInterval(async () => {
    const metrics = await getRealTimeMetrics();
    analyticsNamespace.to('global-metrics').emit('real-time-metrics', metrics);
  }, 30000);
}

async function processUserEvent(event: any) {
  // Guardar evento en base de datos
  await prisma.analyticsEvent.create({
    data: {
      type: event.type,
      userId: event.userId,
      data: event.data,
      timestamp: new Date()
    }
  });

  // Actualizar métricas en tiempo real
  await updateRealTimeMetrics(event);
}

async function getRealTimeMetrics() {
  const now = new Date();
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

  const [
    activeUsers,
    eventsLastHour,
    lessonsCompleted,
    assessmentsPassed
  ] = await Promise.all([
    prisma.user.count({
      where: {
        lastActivityAt: {
          gte: lastHour
        }
      }
    }),
    prisma.analyticsEvent.count({
      where: {
        timestamp: {
          gte: lastHour
        }
      }
    }),
    prisma.lessonCompletion.count({
      where: {
        completedAt: {
          gte: lastHour
        }
      }
    }),
    prisma.assessmentResult.count({
      where: {
        completedAt: {
          gte: lastHour
        }
      }
    })
  ]);

  return {
    activeUsers,
    eventsLastHour,
    lessonsCompleted,
    assessmentsPassed,
    timestamp: now.toISOString()
  };
}

async function updateRealTimeMetrics(event: any) {
  const key = `analytics:realtime:${event.type}`;
  await redis.incr(key);
  await redis.expire(key, 3600); // Expirar en 1 hora
}
```

## Configuración de Base de Datos

### 1. Esquema de Base de Datos

```prisma
// prisma/schema.prisma

// Modelo de Eventos de Analytics
model AnalyticsEvent {
  id        String   @id @default(cuid())
  type      String   NOT NULL
  userId    String?
  sessionId String?
  data      Json
  timestamp DateTime @default(now())
  ipAddress String?
  userAgent String?
  page      String?
  referrer  String?

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}

// Modelo de Métricas
model AnalyticsMetric {
  id        String   @id @default(cuid())
  name      String   NOT NULL
  value     Decimal  @db.Decimal(10,2)
  category  String?
  userId    String?
  sessionId String?
  timestamp DateTime @default(now())
  metadata  Json?

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}

// Modelo de Experimentos A/B
model ABTest {
  id          String   @id @default(cuid())
  name        String   NOT NULL
  description String?
  status      String   @default("draft") // draft, active, paused, completed
  variants    Json     NOT NULL
  metrics     Json?
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  participants ABTestParticipant[]
}

// Modelo de Participantes en A/B Tests
model ABTestParticipant {
  id        String   @id @default(cuid())
  testId    String
  userId    String?
  variant   String   NOT NULL
  joinedAt  DateTime @default(now())
  results   Json?

  test ABTest @relation(fields: [testId], references: [id], onDelete: Cascade)
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@unique([testId, userId])
}

// Modelo de Mapas de Calor
model HeatmapData {
  id             String   @id @default(cuid())
  pageUrl        String   NOT NULL
  xCoordinate    Int      NOT NULL
  yCoordinate    Int      NOT NULL
  intensity      Int      NOT NULL
  interactionType String  NOT NULL // click, scroll, hover
  userId         String?
  sessionId      String?
  timestamp      DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}

// Modelo de Predicciones
model Prediction {
  id        String   @id @default(cuid())
  userId    String?
  type      String   NOT NULL // engagement, performance, retention
  value     Decimal  @db.Decimal(5,4)
  confidence Decimal @db.Decimal(5,4)
  timeframe Int      NOT NULL // días
  createdAt DateTime @default(now())
  metadata  Json?

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}

// Modelo de Exportaciones
model AnalyticsExport {
  id        String   @id @default(cuid())
  userId    String?
  type      String   NOT NULL // metrics, events, predictions
  format    String   NOT NULL // csv, json, pdf, excel
  status    String   @default("pending") // pending, processing, completed, failed
  filePath  String?
  filters   Json?
  createdAt DateTime @default(now())
  completedAt DateTime?

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}

// Extender modelo User existente
model User {
  // ... campos existentes ...

  // Relaciones de analytics
  analyticsEvents    AnalyticsEvent[]
  analyticsMetrics   AnalyticsMetric[]
  abTestParticipants ABTestParticipant[]
  heatmapData        HeatmapData[]
  predictions        Prediction[]
  analyticsExports   AnalyticsExport[]
}
```

### 2. Datos Iniciales

```typescript
// prisma/seed-analytics.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear experimentos A/B iniciales
  const abTests = [
    {
      name: "Nuevo Diseño de Dashboard",
      description: "Probando nuevo diseño del dashboard principal",
      status: "active",
      variants: [
        { name: "control", description: "Diseño actual" },
        { name: "variant_a", description: "Nuevo diseño con sidebar" },
        { name: "variant_b", description: "Nuevo diseño con tabs" }
      ],
      metrics: ["engagement", "time_on_page", "conversion_rate"],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
    }
  ];

  for (const test of abTests) {
    await prisma.aBTest.upsert({
      where: { name: test.name },
      update: {},
      create: test
    });
  }

  // Crear métricas iniciales
  const initialMetrics = [
    {
      name: "total_users",
      value: 0,
      category: "user_metrics"
    },
    {
      name: "active_users",
      value: 0,
      category: "user_metrics"
    },
    {
      name: "lessons_completed",
      value: 0,
      category: "learning_metrics"
    },
    {
      name: "engagement_rate",
      value: 0,
      category: "engagement_metrics"
    }
  ];

  for (const metric of initialMetrics) {
    await prisma.analyticsMetric.create({
      data: metric
    });
  }

  console.log('Datos iniciales de analytics creados');
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

### 1. Configurar useAnalytics

```typescript
// lib/hooks/use-analytics.ts
import { useState, useEffect, useCallback } from 'react';

interface AnalyticsData {
  metrics: any[];
  trends: any[];
  predictions: any[];
  heatmaps: any[];
}

export function useAnalytics(timeRange: string, filters?: any) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        timeRange,
        ...filters
      });

      const response = await fetch(`/api/analytics/metrics?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load analytics data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [timeRange, filters]);

  const exportData = useCallback(async (format: string, filters?: any) => {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          filters,
          timeRange
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const result = await response.json();
      return result.downloadUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      return null;
    }
  }, [timeRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    exportData,
    refresh: loadData
  };
}
```

### 2. Configurar useRealTimeMetrics

```typescript
// lib/hooks/useRealTimeMetrics.ts
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface RealTimeMetrics {
  activeUsers: number;
  eventsLastHour: number;
  lessonsCompleted: number;
  assessmentsPassed: number;
  timestamp: string;
}

export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conectar al WebSocket
    socketRef.current = io('/analytics');

    socketRef.current.on('connect', () => {
      setConnected(true);
      socketRef.current?.emit('join-global-metrics');
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current.on('real-time-metrics', (data: RealTimeMetrics) => {
      setMetrics(data);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const trackEvent = useCallback((eventType: string, eventData: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('user-event', {
        type: eventType,
        data: eventData,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  return {
    metrics,
    connected,
    trackEvent
  };
}
```

## Configuración de Mapas de Calor

### 1. Configurar HeatmapVisualizer

```typescript
// lib/heatmap/heatmap-tracker.ts
export class HeatmapTracker {
  private static instance: HeatmapTracker;
  private isTracking = false;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): HeatmapTracker {
    if (!HeatmapTracker.instance) {
      HeatmapTracker.instance = new HeatmapTracker();
    }
    return HeatmapTracker.instance;
  }

  startTracking() {
    if (this.isTracking) return;

    this.isTracking = true;
    this.trackClicks();
    this.trackScrolls();
    this.trackHovers();
  }

  stopTracking() {
    this.isTracking = false;
  }

  private trackClicks() {
    document.addEventListener('click', (event) => {
      if (!this.isTracking) return;

      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      
      this.sendHeatmapData({
        type: 'click',
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        page: window.location.pathname,
        element: target.tagName.toLowerCase()
      });
    });
  }

  private trackScrolls() {
    let scrollTimeout: NodeJS.Timeout;
    
    window.addEventListener('scroll', () => {
      if (!this.isTracking) return;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.sendHeatmapData({
          type: 'scroll',
          x: window.scrollX,
          y: window.scrollY,
          page: window.location.pathname
        });
      }, 100);
    });
  }

  private trackHovers() {
    document.addEventListener('mouseover', (event) => {
      if (!this.isTracking) return;

      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      
      this.sendHeatmapData({
        type: 'hover',
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        page: window.location.pathname,
        element: target.tagName.toLowerCase()
      });
    });
  }

  private async sendHeatmapData(data: any) {
    try {
      await fetch('/api/analytics/heatmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Error sending heatmap data:', error);
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}
```

## Configuración de A/B Testing

### 1. Configurar ABTestingDashboard

```typescript
// lib/ab-testing/ab-test-manager.ts
export class ABTestManager {
  static async assignVariant(testId: string, userId?: string): Promise<string> {
    try {
      const response = await fetch('/api/analytics/ab-testing/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign variant');
      }

      const result = await response.json();
      return result.variant;
    } catch (error) {
      console.error('Error assigning AB test variant:', error);
      return 'control'; // Fallback al control
    }
  }

  static async trackEvent(testId: string, variant: string, event: string, data?: any) {
    try {
      await fetch('/api/analytics/ab-testing/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          variant,
          event,
          data,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Error tracking AB test event:', error);
    }
  }

  static async getResults(testId: string) {
    try {
      const response = await fetch(`/api/analytics/ab-testing/results/${testId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get AB test results');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting AB test results:', error);
      return null;
    }
  }
}
```

## Configuración de Exportación

### 1. Configurar ExportManager

```typescript
// lib/export/export-manager.ts
import { prisma } from '@/lib/prisma';
import { createObjectCsvWriter } from 'csv-writer';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

export class ExportManager {
  static async exportData(format: string, filters: any, timeRange: string) {
    try {
      // Crear registro de exportación
      const exportRecord = await prisma.analyticsExport.create({
        data: {
          type: 'analytics',
          format,
          status: 'processing',
          filters,
          userId: filters.userId
        }
      });

      let filePath: string;

      switch (format.toLowerCase()) {
        case 'csv':
          filePath = await this.exportToCSV(filters, timeRange);
          break;
        case 'excel':
          filePath = await this.exportToExcel(filters, timeRange);
          break;
        case 'json':
          filePath = await this.exportToJSON(filters, timeRange);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Actualizar registro con la ruta del archivo
      await prisma.analyticsExport.update({
        where: { id: exportRecord.id },
        data: {
          filePath,
          status: 'completed',
          completedAt: new Date()
        }
      });

      return {
        id: exportRecord.id,
        downloadUrl: `/api/analytics/export/download/${exportRecord.id}`
      };
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  private static async exportToCSV(filters: any, timeRange: string): Promise<string> {
    const data = await this.getExportData(filters, timeRange);
    const fileName = `analytics_${Date.now()}.csv`;
    const filePath = path.join(process.env.EXPORT_STORAGE_PATH!, fileName);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'type', title: 'Type' },
        { id: 'userId', title: 'User ID' },
        { id: 'data', title: 'Data' }
      ]
    });

    await csvWriter.writeRecords(data);
    return filePath;
  }

  private static async exportToExcel(filters: any, timeRange: string): Promise<string> {
    const data = await this.getExportData(filters, timeRange);
    const fileName = `analytics_${Date.now()}.xlsx`;
    const filePath = path.join(process.env.EXPORT_STORAGE_PATH!, fileName);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Analytics Data');

    worksheet.columns = [
      { header: 'Timestamp', key: 'timestamp' },
      { header: 'Type', key: 'type' },
      { header: 'User ID', key: 'userId' },
      { header: 'Data', key: 'data' }
    ];

    data.forEach(row => {
      worksheet.addRow(row);
    });

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  private static async exportToJSON(filters: any, timeRange: string): Promise<string> {
    const data = await this.getExportData(filters, timeRange);
    const fileName = `analytics_${Date.now()}.json`;
    const filePath = path.join(process.env.EXPORT_STORAGE_PATH!, fileName);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return filePath;
  }

  private static async getExportData(filters: any, timeRange: string) {
    const startDate = this.getStartDate(timeRange);

    const whereClause: any = {
      timestamp: {
        gte: startDate
      }
    };

    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    return await prisma.analyticsEvent.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'desc'
      }
    });
  }

  private static getStartDate(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case 'last_7_days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'last_30_days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'last_90_days':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }
}
```

## Testing

### 1. Tests de Configuración

```typescript
// tests/analytics-setup.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { redis } from '@/lib/redis';

const prisma = new PrismaClient();

describe('Analytics Setup', () => {
  beforeAll(async () => {
    // Configurar base de datos de prueba
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await redis.quit();
  });

  it('should create initial AB tests', async () => {
    const tests = await prisma.aBTest.findMany();
    expect(tests.length).toBeGreaterThan(0);
  });

  it('should create initial metrics', async () => {
    const metrics = await prisma.analyticsMetric.findMany();
    expect(metrics.length).toBeGreaterThan(0);
  });

  it('should handle real-time metrics correctly', async () => {
    // Test de métricas en tiempo real
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Redis no se conecta**
   - Verificar que Redis esté ejecutándose
   - Comprobar configuración de URL y contraseña
   - Revisar logs de Redis

2. **WebSocket no funciona**
   - Verificar configuración de CORS
   - Comprobar que el servidor WebSocket esté ejecutándose
   - Revisar logs de conexión

3. **Las exportaciones fallan**
   - Verificar permisos de escritura en el directorio de exportaciones
   - Comprobar espacio en disco
   - Revisar configuración de formatos

### Logs de Debug

```typescript
// Habilitar logs de debug
const DEBUG_ANALYTICS = process.env.NODE_ENV === 'development';

if (DEBUG_ANALYTICS) {
  console.log('Analytics setup completed');
  console.log('Redis connection:', redisStatus);
  console.log('WebSocket connection:', websocketStatus);
}
```

## Recursos Adicionales

- [Documentación de Componentes de Analytics](../components/analytics.md)
- [API de Analytics](../AI-APIS.md#analytics)
- [Base de Datos](../DATABASE.md)
- [Testing](../TESTING.md)
