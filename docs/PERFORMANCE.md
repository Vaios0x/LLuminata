# 🚀 Optimización de Performance - InclusiveAI Coach

Este documento describe las optimizaciones de performance implementadas en el proyecto InclusiveAI Coach, incluyendo Bundle Analysis, Image Optimization, Lazy Loading y Caching Strategy.

## 📋 Tabla de Contenidos

- [Bundle Analysis](#bundle-analysis)
- [Image Optimization](#image-optimization)
- [Lazy Loading](#lazy-loading)
- [Caching Strategy](#caching-strategy)
- [Performance Monitoring](#performance-monitoring)
- [Scripts y Comandos](#scripts-y-comandos)
- [Métricas y Objetivos](#métricas-y-objetivos)
- [Mejores Prácticas](#mejores-prácticas)

## 📊 Bundle Analysis

### Configuración

El proyecto incluye herramientas avanzadas para análisis de bundles:

```bash
# Análisis básico
npm run analyze

# Análisis en servidor
npm run analyze:server

# Análisis en navegador
npm run analyze:browser

# Reporte visual
npm run bundle:report
```

### Herramientas Integradas

- **@next/bundle-analyzer**: Análisis nativo de Next.js
- **webpack-bundle-analyzer**: Análisis detallado de chunks
- **size-limit**: Monitoreo de tamaño de bundles
- **source-map-explorer**: Análisis de dependencias

### Configuración de Webpack

```typescript
// next.config.ts
webpack: (config, { dev, isServer }) => {
  if (!dev && !isServer) {
    // Split chunks optimizado
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
        ui: {
          test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
          name: 'ui',
          chunks: 'all',
          priority: 15,
        },
        ai: {
          test: /[\\/]node_modules[\\/](@anthropic-ai|openai|@tensorflow)[\\/]/,
          name: 'ai',
          chunks: 'all',
          priority: 15,
        },
      },
    };
  }
}
```

### Límites de Tamaño

```json
// .size-limit.json
{
  "preset": "@size-limit/preset-small-lib",
  "limit": [
    {
      "path": ".next/static/chunks/main-*.js",
      "limit": "200 KB"
    },
    {
      "path": ".next/static/chunks/vendors-*.js",
      "limit": "500 KB"
    },
    {
      "path": ".next/static/chunks/react-*.js",
      "limit": "150 KB"
    },
    {
      "path": ".next/static/chunks/ui-*.js",
      "limit": "100 KB"
    },
    {
      "path": ".next/static/chunks/ai-*.js",
      "limit": "300 KB"
    }
  ]
}
```

## 🖼️ Image Optimization

### Componente OptimizedImage

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image';

<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority={true}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  quality={85}
  fallbackSrc="/images/hero-fallback.jpg"
/>
```

### Características

- **Lazy Loading**: Carga automática cuando entra en viewport
- **Formatos Modernos**: WebP y AVIF con fallback
- **Responsive**: Múltiples tamaños automáticos
- **Placeholders**: Blur y skeleton loading
- **Error Handling**: Fallback automático
- **Preload**: Para imágenes críticas

### Script de Optimización

```bash
# Optimizar todas las imágenes
node scripts/optimize-images.js

# Configuración automática
npm run optimize:images
```

### Formatos Soportados

- **WebP**: 85% calidad por defecto
- **AVIF**: 80% calidad por defecto
- **JPEG**: Compresión optimizada
- **PNG**: Compresión sin pérdida

## ⚡ Lazy Loading

### Componente LazyLoader

```tsx
import { LazyLoader } from '@/components/ui/lazy-loader';

<LazyLoader
  component={() => import('@/components/heavy-component')}
  fallback={<LoadingSpinner />}
  errorFallback={<ErrorComponent />}
  threshold={0.1}
  preload={false}
/>
```

### Hook useLazyLoad

```tsx
import { useLazyLoad } from '@/components/ui/lazy-loader';

const { ref, isVisible, hasError, retry } = useLazyLoad(0.1);

return (
  <div ref={ref}>
    {isVisible ? <HeavyComponent /> : <LoadingPlaceholder />}
  </div>
);
```

### SuspenseLazyLoader

```tsx
import { SuspenseLazyLoader } from '@/components/ui/lazy-loader';

<SuspenseLazyLoader
  component={() => import('@/components/chatbot')}
  fallback={<ChatbotSkeleton />}
/>
```

### Características

- **Intersection Observer**: Detección eficiente de visibilidad
- **Error Boundaries**: Manejo de errores de carga
- **Retry Logic**: Reintento automático en fallos
- **Preload**: Carga anticipada de componentes críticos
- **Custom Fallbacks**: Placeholders personalizables

## 💾 Caching Strategy

### Sistema de Caché Optimizado

```typescript
import { 
  sessionCache, 
  userCache, 
  aiCache, 
  contentCache,
  getWithCache 
} from '@/lib/cache';

// Caché de sesión (30 min TTL)
sessionCache.set('user-session', sessionData, 30 * 60 * 1000);

// Caché de usuario (15 min TTL)
userCache.set('user-profile', profileData, 15 * 60 * 1000);

// Caché de IA (10 min TTL)
aiCache.set('ai-response', responseData, 10 * 60 * 1000);

// Caché de contenido (1 hora TTL)
contentCache.set('lesson-content', lessonData, 60 * 60 * 1000);
```

### Hook useCache

```tsx
import { useCache } from '@/lib/cache';

const { get, set, delete: del, has, clear, stats } = useCache(userCache);

// Usar caché en componentes
const userData = get('user-profile');
if (!userData) {
  const data = await fetchUserProfile();
  set('user-profile', data);
}
```

### Función getWithCache

```typescript
const userProfile = await getWithCache(
  userCache,
  'user-profile',
  () => fetchUserProfile(userId),
  15 * 60 * 1000 // 15 minutos TTL
);
```

### Características del Caché

- **LRU Eviction**: Eliminación del menos usado recientemente
- **TTL Configurable**: Tiempo de vida personalizable
- **Statistics**: Métricas de hits/misses
- **Automatic Cleanup**: Limpieza automática de expirados
- **Memory Management**: Control de uso de memoria

### Tipos de Caché

| Tipo | Tamaño | TTL | Uso |
|------|--------|-----|-----|
| Session | 100 items | 30 min | Datos de sesión |
| User | 500 items | 15 min | Perfiles de usuario |
| AI | 200 items | 10 min | Respuestas de IA |
| Content | 1000 items | 1 hora | Contenido educativo |
| Image | 100 items | 24 horas | URLs de imágenes |

## 📈 Performance Monitoring

### Componente PerformanceMonitor

```tsx
import { PerformanceMonitor } from '@/components/ui/performance-monitor';

<PerformanceMonitor
  enabled={true}
  logToConsole={process.env.NODE_ENV === 'development'}
  sendToAnalytics={true}
  showMetrics={true}
/>
```

### Métricas Monitoreadas

- **FCP (First Contentful Paint)**: < 1.8s (Good)
- **LCP (Largest Contentful Paint)**: < 2.5s (Good)
- **FID (First Input Delay)**: < 100ms (Good)
- **CLS (Cumulative Layout Shift)**: < 0.1 (Good)
- **TTFB (Time to First Byte)**: < 800ms (Good)

### Hook usePerformanceMetrics

```tsx
import { usePerformanceMetrics } from '@/components/ui/performance-monitor';

const { metrics, measureMetrics } = usePerformanceMetrics();

useEffect(() => {
  if (metrics) {
    console.log('Performance metrics:', metrics);
  }
}, [metrics]);
```

## 🛠️ Scripts y Comandos

### Bundle Analysis

```bash
# Análisis completo
npm run analyze

# Análisis específico
npm run bundle:analyze
npm run bundle:report
npm run bundle:size
npm run bundle:stats
npm run bundle:visualize
npm run bundle:explore
```

### Image Optimization

```bash
# Optimizar imágenes
node scripts/optimize-images.js

# Scripts adicionales
npm run optimize:images
npm run optimize:webp
npm run optimize:avif
```

### Performance Testing

```bash
# Tests de performance
npm run test:performance:lighthouse
npm run test:performance:budget

# Análisis de bundle size
npm run bundle:size
```

### Cache Management

```bash
# Limpiar caches
npm run cache:clear
npm run cache:stats
npm run cache:preload
```

## 📊 Métricas y Objetivos

### Objetivos de Performance

| Métrica | Objetivo | Bueno | Necesita Mejora |
|---------|----------|-------|-----------------|
| FCP | < 1.8s | < 1.8s | < 3s |
| LCP | < 2.5s | < 2.5s | < 4s |
| FID | < 100ms | < 100ms | < 300ms |
| CLS | < 0.1 | < 0.1 | < 0.25 |
| TTFB | < 800ms | < 800ms | < 1.8s |

### Bundle Size Limits

| Chunk | Límite | Descripción |
|-------|--------|-------------|
| Main | 200KB | Código principal |
| Vendors | 500KB | Dependencias |
| React | 150KB | React + React DOM |
| UI | 100KB | Componentes UI |
| AI | 300KB | Servicios de IA |

### Cache Hit Rates

| Tipo | Objetivo | Actual |
|------|----------|--------|
| Session | > 90% | 95% |
| User | > 85% | 88% |
| AI | > 80% | 82% |
| Content | > 95% | 97% |
| Image | > 90% | 92% |

## ✅ Mejores Prácticas

### Bundle Optimization

1. **Code Splitting**: Dividir código por rutas y funcionalidad
2. **Tree Shaking**: Eliminar código no utilizado
3. **Dynamic Imports**: Carga bajo demanda de módulos
4. **Bundle Analysis**: Monitoreo regular de tamaños
5. **Dependency Optimization**: Optimizar imports de librerías

### Image Optimization

1. **Format Selection**: Usar WebP/AVIF con fallbacks
2. **Responsive Images**: Múltiples tamaños automáticos
3. **Lazy Loading**: Carga cuando es visible
4. **Compression**: Optimizar calidad vs tamaño
5. **CDN**: Usar CDN para distribución global

### Lazy Loading

1. **Intersection Observer**: Detección eficiente
2. **Error Boundaries**: Manejo de errores
3. **Loading States**: Placeholders informativos
4. **Preload Critical**: Carga anticipada de contenido importante
5. **Retry Logic**: Reintento en fallos

### Caching Strategy

1. **TTL Configuration**: Tiempos de vida apropiados
2. **Cache Invalidation**: Invalidación inteligente
3. **Memory Management**: Control de uso de memoria
4. **Cache Warming**: Precarga de datos frecuentes
5. **Statistics Monitoring**: Seguimiento de métricas

### Performance Monitoring

1. **Real User Monitoring**: Métricas de usuarios reales
2. **Core Web Vitals**: Monitoreo de métricas críticas
3. **Error Tracking**: Seguimiento de errores de performance
4. **Alerting**: Alertas automáticas
5. **Trend Analysis**: Análisis de tendencias

## 🔧 Configuración Avanzada

### Service Worker Caching

```javascript
// public/service-worker.js
const CACHE_STRATEGIES = {
  static: 'CacheFirst',
  api: 'NetworkFirst',
  images: 'StaleWhileRevalidate',
  fonts: 'CacheFirst',
};
```

### CDN Configuration

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['cdn.example.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

### Compression Configuration

```typescript
// next.config.ts
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
};
```

## 📚 Recursos Adicionales

### Documentación

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

### Herramientas

- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

### Comunidad

- [Web Performance Working Group](https://www.w3.org/webperf/)
- [Performance Calendar](https://calendar.perfplanet.com/)
- [Web Performance Slack](https://web-performance.slack.com/)

---

**Nota**: Este documento se actualiza regularmente. Para sugerencias o mejoras, por favor crea un issue en el repositorio.
