#!/usr/bin/env tsx

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface PerformanceMetrics {
  timestamp: string;
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  bundleSize: {
    total: number;
    gzipped: number;
  };
  buildTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly metricsFile = './performance-metrics.json';

  async runLighthouse(): Promise<PerformanceMetrics['lighthouse']> {
    console.log('🔍 Ejecutando Lighthouse...');
    
    try {
      const output = execSync(
        'npx lighthouse http://localhost:3000 --output=json --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless --no-sandbox"',
        { encoding: 'utf8' }
      );
      
      const result = JSON.parse(output);
      
      return {
        performance: Math.round(result.categories.performance.score * 100),
        accessibility: Math.round(result.categories.accessibility.score * 100),
        bestPractices: Math.round(result.categories['best-practices'].score * 100),
        seo: Math.round(result.categories.seo.score * 100),
      };
    } catch (error) {
      console.error('❌ Error ejecutando Lighthouse:', error);
      return {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
      };
    }
  }

  async getBundleSize(): Promise<PerformanceMetrics['bundleSize']> {
    console.log('📦 Analizando tamaño del bundle...');
    
    try {
      // Construir la aplicación
      execSync('npm run build', { stdio: 'pipe' });
      
      // Analizar el bundle
      const output = execSync('npx @next/bundle-analyzer --output json', { encoding: 'utf8' });
      const bundleData = JSON.parse(output);
      
      const totalSize = bundleData.totalSize || 0;
      const gzippedSize = bundleData.gzippedSize || 0;
      
      return {
        total: totalSize,
        gzipped: gzippedSize,
      };
    } catch (error) {
      console.error('❌ Error analizando bundle:', error);
      return {
        total: 0,
        gzipped: 0,
      };
    }
  }

  async measureBuildTime(): Promise<number> {
    console.log('⏱️  Midiento tiempo de construcción...');
    
    const startTime = Date.now();
    
    try {
      execSync('npm run build', { stdio: 'pipe' });
      const buildTime = Date.now() - startTime;
      return buildTime;
    } catch (error) {
      console.error('❌ Error midiendo tiempo de construcción:', error);
      return 0;
    }
  }

  async checkPerformance(): Promise<void> {
    console.log('🚀 Iniciando monitoreo de performance...');
    
    // Verificar que la aplicación esté corriendo
    try {
      execSync('curl -f http://localhost:3000/api/health', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ La aplicación no está corriendo en localhost:3000');
      console.log('💡 Ejecuta: npm run dev');
      process.exit(1);
    }

    const lighthouse = await this.runLighthouse();
    const bundleSize = await this.getBundleSize();
    const buildTime = await this.measureBuildTime();

    const metrics: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      lighthouse,
      bundleSize,
      buildTime,
    };

    this.metrics.push(metrics);
    this.saveMetrics();

    this.printReport(metrics);
    this.checkThresholds(metrics);
  }

  private printReport(metrics: PerformanceMetrics): void {
    console.log('\n📊 REPORTE DE PERFORMANCE');
    console.log('='.repeat(50));
    console.log(`📅 Timestamp: ${metrics.timestamp}`);
    console.log('\n🏆 Lighthouse Scores:');
    console.log(`  Performance: ${metrics.lighthouse.performance}/100`);
    console.log(`  Accessibility: ${metrics.lighthouse.accessibility}/100`);
    console.log(`  Best Practices: ${metrics.lighthouse.bestPractices}/100`);
    console.log(`  SEO: ${metrics.lighthouse.seo}/100`);
    
    console.log('\n📦 Bundle Size:');
    console.log(`  Total: ${(metrics.bundleSize.total / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Gzipped: ${(metrics.bundleSize.gzipped / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n⏱️  Build Time:');
    console.log(`  ${(metrics.buildTime / 1000).toFixed(2)} seconds`);
  }

  private checkThresholds(metrics: PerformanceMetrics): void {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Verificar Lighthouse scores
    if (metrics.lighthouse.performance < 90) {
      warnings.push(`Performance score bajo: ${metrics.lighthouse.performance}/100`);
    }
    if (metrics.lighthouse.accessibility < 95) {
      errors.push(`Accessibility score crítico: ${metrics.lighthouse.accessibility}/100`);
    }
    if (metrics.lighthouse.bestPractices < 90) {
      warnings.push(`Best Practices score bajo: ${metrics.lighthouse.bestPractices}/100`);
    }
    if (metrics.lighthouse.seo < 90) {
      warnings.push(`SEO score bajo: ${metrics.lighthouse.seo}/100`);
    }

    // Verificar tamaño del bundle
    if (metrics.bundleSize.total > 5 * 1024 * 1024) { // 5MB
      warnings.push(`Bundle size muy grande: ${(metrics.bundleSize.total / 1024 / 1024).toFixed(2)} MB`);
    }

    // Verificar tiempo de construcción
    if (metrics.buildTime > 60000) { // 60 segundos
      warnings.push(`Tiempo de construcción lento: ${(metrics.buildTime / 1000).toFixed(2)}s`);
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  ADVERTENCIAS:');
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (errors.length > 0) {
      console.log('\n❌ ERRORES CRÍTICOS:');
      errors.forEach(error => console.log(`  - ${error}`));
      process.exit(1);
    }

    if (warnings.length === 0 && errors.length === 0) {
      console.log('\n✅ Todas las métricas están dentro de los umbrales aceptables');
    }
  }

  private saveMetrics(): void {
    try {
      fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
      console.log(`\n💾 Métricas guardadas en ${this.metricsFile}`);
    } catch (error) {
      console.error('❌ Error guardando métricas:', error);
    }
  }

  async generateTrendReport(): Promise<void> {
    if (this.metrics.length < 2) {
      console.log('📈 Se necesitan al menos 2 mediciones para generar tendencias');
        return;
      }

    console.log('\n📈 ANÁLISIS DE TENDENCIAS');
    console.log('='.repeat(50));

    const latest = this.metrics[this.metrics.length - 1];
    const previous = this.metrics[this.metrics.length - 2];

    const performanceChange = latest.lighthouse.performance - previous.lighthouse.performance;
    const accessibilityChange = latest.lighthouse.accessibility - previous.lighthouse.accessibility;
    const bundleSizeChange = latest.bundleSize.total - previous.bundleSize.total;
    const buildTimeChange = latest.buildTime - previous.buildTime;

    console.log(`Performance: ${previous.lighthouse.performance} → ${latest.lighthouse.performance} (${performanceChange > 0 ? '+' : ''}${performanceChange})`);
    console.log(`Accessibility: ${previous.lighthouse.accessibility} → ${latest.lighthouse.accessibility} (${accessibilityChange > 0 ? '+' : ''}${accessibilityChange})`);
    console.log(`Bundle Size: ${(previous.bundleSize.total / 1024 / 1024).toFixed(2)}MB → ${(latest.bundleSize.total / 1024 / 1024).toFixed(2)}MB (${bundleSizeChange > 0 ? '+' : ''}${(bundleSizeChange / 1024 / 1024).toFixed(2)}MB)`);
    console.log(`Build Time: ${(previous.buildTime / 1000).toFixed(2)}s → ${(latest.buildTime / 1000).toFixed(2)}s (${buildTimeChange > 0 ? '+' : ''}${(buildTimeChange / 1000).toFixed(2)}s)`);
  }
}

// Ejecutar el monitor
async function main() {
  const monitor = new PerformanceMonitor();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      await monitor.checkPerformance();
      break;
    case 'trends':
      await monitor.generateTrendReport();
      break;
    default:
      console.log('Uso: npm run monitor:performance [check|trends]');
      console.log('  check  - Ejecutar análisis de performance completo');
      console.log('  trends - Generar reporte de tendencias');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
