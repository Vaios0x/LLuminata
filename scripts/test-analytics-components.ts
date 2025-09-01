#!/usr/bin/env tsx

/**
 * Script de prueba para verificar que todos los componentes de analytics funcionan correctamente
 * 
 * Uso: npm run test:analytics
 * o: npx tsx scripts/test-analytics-components.ts
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface TestResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: string;
}

class AnalyticsComponentTester {
  private results: TestResult[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Iniciando pruebas de componentes de Analytics...\n');

    // Verificar estructura de archivos
    await this.testFileStructure();
    
    // Verificar dependencias
    await this.testDependencies();
    
    // Verificar componentes individuales
    await this.testHeatmapVisualizer();
    await this.testPredictiveAnalytics();
    await this.testABTestingDashboard();
    await this.testRealTimeMetrics();
    await this.testExportManager();
    
    // Verificar archivo de índice
    await this.testIndexFile();
    
    // Verificar ejemplo de uso
    await this.testExampleFile();
    
    // Verificar documentación
    await this.testDocumentation();
    
    // Mostrar resultados
    this.printResults();
  }

  private async testFileStructure(): Promise<void> {
    console.log('📁 Verificando estructura de archivos...');
    
    const requiredFiles = [
      'components/analytics/HeatmapVisualizer.tsx',
      'components/analytics/PredictiveAnalytics.tsx',
      'components/analytics/ABTestingDashboard.tsx',
      'components/analytics/RealTimeMetrics.tsx',
      'components/analytics/ExportManager.tsx',
      'components/analytics/index.ts',
      'examples/analytics-example.tsx',
      'docs/ANALYTICS-COMPONENTS.md'
    ];

    for (const file of requiredFiles) {
      const filePath = join(this.projectRoot, file);
      const exists = existsSync(filePath);
      
      this.results.push({
        component: `File: ${file}`,
        status: exists ? 'PASS' : 'FAIL',
        message: exists ? 'Archivo encontrado' : 'Archivo no encontrado',
        details: exists ? undefined : `Ruta esperada: ${filePath}`
      });
    }
  }

  private async testDependencies(): Promise<void> {
    console.log('📦 Verificando dependencias...');
    
    try {
      const packageJsonPath = join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      
      const requiredDeps = [
        'recharts',
        'socket.io-client',
        'date-fns',
        'lodash'
      ];

      const missingDeps: string[] = [];
      
      for (const dep of requiredDeps) {
        if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
          missingDeps.push(dep);
        }
      }

      this.results.push({
        component: 'Dependencies',
        status: missingDeps.length === 0 ? 'PASS' : 'FAIL',
        message: missingDeps.length === 0 
          ? 'Todas las dependencias están instaladas' 
          : `Faltan dependencias: ${missingDeps.join(', ')}`,
        details: missingDeps.length > 0 
          ? `Ejecutar: npm install ${missingDeps.join(' ')} --legacy-peer-deps`
          : undefined
      });
    } catch (error) {
      this.results.push({
        component: 'Dependencies',
        status: 'FAIL',
        message: 'Error al verificar dependencias',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  private async testHeatmapVisualizer(): Promise<void> {
    console.log('🔥 Verificando HeatmapVisualizer...');
    
    try {
      const filePath = join(this.projectRoot, 'components/analytics/HeatmapVisualizer.tsx');
      const content = readFileSync(filePath, 'utf-8');
      
      const checks = [
        { name: 'Import React', pattern: /import React/ },
        { name: 'Export default', pattern: /export default HeatmapVisualizer/ },
        { name: 'Props interface', pattern: /interface HeatmapVisualizerProps/ },
        { name: 'useState hook', pattern: /useState/ },
        { name: 'useEffect hook', pattern: /useEffect/ },
        { name: 'Card component', pattern: /Card/ },
        { name: 'Button component', pattern: /Button/ },
        { name: 'Heatmap rendering', pattern: /generateWeeklyHeatmap/ },
        { name: 'Accessibility', pattern: /tabIndex|aria-label/ }
      ];

      const passedChecks = checks.filter(check => check.pattern.test(content));
      
      this.results.push({
        component: 'HeatmapVisualizer',
        status: passedChecks.length === checks.length ? 'PASS' : 'FAIL',
        message: `${passedChecks.length}/${checks.length} verificaciones pasaron`,
        details: passedChecks.length < checks.length 
          ? `Faltan: ${checks.filter(c => !c.pattern.test(content)).map(c => c.name).join(', ')}`
          : undefined
      });
    } catch (error) {
      this.results.push({
        component: 'HeatmapVisualizer',
        status: 'FAIL',
        message: 'Error al verificar componente',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  private async testPredictiveAnalytics(): Promise<void> {
    console.log('🧠 Verificando PredictiveAnalytics...');
    
    try {
      const filePath = join(this.projectRoot, 'components/analytics/PredictiveAnalytics.tsx');
      const content = readFileSync(filePath, 'utf-8');
      
      const checks = [
        { name: 'Import React', pattern: /import React/ },
        { name: 'Export default', pattern: /export default PredictiveAnalytics/ },
        { name: 'Props interface', pattern: /interface PredictiveAnalyticsProps/ },
        { name: 'Prediction cards', pattern: /filteredPredictions\.map/ },
        { name: 'Confidence display', pattern: /showConfidence/ },
        { name: 'Model management', pattern: /models\.map/ },
        { name: 'Progress component', pattern: /Progress/ },
        { name: 'Badge component', pattern: /Badge/ }
      ];

      const passedChecks = checks.filter(check => check.pattern.test(content));
      
      this.results.push({
        component: 'PredictiveAnalytics',
        status: passedChecks.length === checks.length ? 'PASS' : 'FAIL',
        message: `${passedChecks.length}/${checks.length} verificaciones pasaron`,
        details: passedChecks.length < checks.length 
          ? `Faltan: ${checks.filter(c => !c.pattern.test(content)).map(c => c.name).join(', ')}`
          : undefined
      });
    } catch (error) {
      this.results.push({
        component: 'PredictiveAnalytics',
        status: 'FAIL',
        message: 'Error al verificar componente',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  private async testABTestingDashboard(): Promise<void> {
    console.log('🧪 Verificando ABTestingDashboard...');
    
    try {
      const filePath = join(this.projectRoot, 'components/analytics/ABTestingDashboard.tsx');
      const content = readFileSync(filePath, 'utf-8');
      
      const checks = [
        { name: 'Import React', pattern: /import React/ },
        { name: 'Export default', pattern: /export default ABTestingDashboard/ },
        { name: 'Props interface', pattern: /interface ABTestingDashboardProps/ },
        { name: 'Active tests', pattern: /runningTests/ },
        { name: 'Completed tests', pattern: /completedTests/ },
        { name: 'Statistical significance', pattern: /isStatisticallySignificant/ },
        { name: 'Effect size', pattern: /getEffectSize/ },
        { name: 'Winner determination', pattern: /getWinner/ }
      ];

      const passedChecks = checks.filter(check => check.pattern.test(content));
      
      this.results.push({
        component: 'ABTestingDashboard',
        status: passedChecks.length === checks.length ? 'PASS' : 'FAIL',
        message: `${passedChecks.length}/${checks.length} verificaciones pasaron`,
        details: passedChecks.length < checks.length 
          ? `Faltan: ${checks.filter(c => !c.pattern.test(content)).map(c => c.name).join(', ')}`
          : undefined
      });
    } catch (error) {
      this.results.push({
        component: 'ABTestingDashboard',
        status: 'FAIL',
        message: 'Error al verificar componente',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  private async testRealTimeMetrics(): Promise<void> {
    console.log('⚡ Verificando RealTimeMetrics...');
    
    try {
      const filePath = join(this.projectRoot, 'components/analytics/RealTimeMetrics.tsx');
      const content = readFileSync(filePath, 'utf-8');
      
      const checks = [
        { name: 'Import React', pattern: /import React/ },
        { name: 'Export default', pattern: /export default RealTimeMetrics/ },
        { name: 'Props interface', pattern: /interface RealTimeMetricsProps/ },
        { name: 'Socket.io import', pattern: /socket\.io-client/ },
        { name: 'WebSocket connection', pattern: /connectWebSocket/ },
        { name: 'Real-time metrics', pattern: /realTimeMetrics/ },
        { name: 'Event log', pattern: /recentEvents/ },
        { name: 'Connection status', pattern: /connectionStatus/ }
      ];

      const passedChecks = checks.filter(check => check.pattern.test(content));
      
      this.results.push({
        component: 'RealTimeMetrics',
        status: passedChecks.length === checks.length ? 'PASS' : 'FAIL',
        message: `${passedChecks.length}/${checks.length} verificaciones pasaron`,
        details: passedChecks.length < checks.length 
          ? `Faltan: ${checks.filter(c => !c.pattern.test(content)).map(c => c.name).join(', ')}`
          : undefined
      });
    } catch (error) {
      this.results.push({
        component: 'RealTimeMetrics',
        status: 'FAIL',
        message: 'Error al verificar componente',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  private async testExportManager(): Promise<void> {
    console.log('📤 Verificando ExportManager...');
    
    try {
      const filePath = join(this.projectRoot, 'components/analytics/ExportManager.tsx');
      const content = readFileSync(filePath, 'utf-8');
      
      const checks = [
        { name: 'Import React', pattern: /import React/ },
        { name: 'Export default', pattern: /export default ExportManager/ },
        { name: 'Props interface', pattern: /interface ExportManagerProps/ },
        { name: 'Export jobs', pattern: /exportJobs/ },
        { name: 'Templates', pattern: /templates\.map/ },
        { name: 'Progress tracking', pattern: /job\.progress/ },
        { name: 'File size formatting', pattern: /formatFileSize/ },
        { name: 'Multiple formats', pattern: /ExportFormat/ }
      ];

      const passedChecks = checks.filter(check => check.pattern.test(content));
      
      this.results.push({
        component: 'ExportManager',
        status: passedChecks.length === checks.length ? 'PASS' : 'FAIL',
        message: `${passedChecks.length}/${checks.length} verificaciones pasaron`,
        details: passedChecks.length < checks.length 
          ? `Faltan: ${checks.filter(c => !c.pattern.test(content)).map(c => c.name).join(', ')}`
          : undefined
      });
    } catch (error) {
      this.results.push({
        component: 'ExportManager',
        status: 'FAIL',
        message: 'Error al verificar componente',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  private async testIndexFile(): Promise<void> {
    console.log('📋 Verificando archivo de índice...');
    
    try {
      const filePath = join(this.projectRoot, 'components/analytics/index.ts');
      const content = readFileSync(filePath, 'utf-8');
      
      const checks = [
        { name: 'HeatmapVisualizer export', pattern: /export.*HeatmapVisualizer/ },
        { name: 'PredictiveAnalytics export', pattern: /export.*PredictiveAnalytics/ },
        { name: 'ABTestingDashboard export', pattern: /export.*ABTestingDashboard/ },
        { name: 'RealTimeMetrics export', pattern: /export.*RealTimeMetrics/ },
        { name: 'ExportManager export', pattern: /export.*ExportManager/ },
        { name: 'Types export', pattern: /export.*HeatmapData/ },
        { name: 'Enums export', pattern: /export.*AnalyticsCategory/ },
        { name: 'Utils export', pattern: /export.*formatFileSize/ }
      ];

      const passedChecks = checks.filter(check => check.pattern.test(content));
      
      this.results.push({
        component: 'Index File',
        status: passedChecks.length === checks.length ? 'PASS' : 'FAIL',
        message: `${passedChecks.length}/${checks.length} verificaciones pasaron`,
        details: passedChecks.length < checks.length 
          ? `Faltan: ${checks.filter(c => !c.pattern.test(content)).map(c => c.name).join(', ')}`
          : undefined
      });
    } catch (error) {
      this.results.push({
        component: 'Index File',
        status: 'FAIL',
        message: 'Error al verificar archivo de índice',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  private async testExampleFile(): Promise<void> {
    console.log('📖 Verificando archivo de ejemplo...');
    
    try {
      const filePath = join(this.projectRoot, 'examples/analytics-example.tsx');
      const content = readFileSync(filePath, 'utf-8');
      
      const checks = [
        { name: 'Import analytics components', pattern: /import.*analytics/ },
        { name: 'All components imported', pattern: /HeatmapVisualizer/ },
        { name: 'Tabs component', pattern: /Tabs/ },
        { name: 'State management', pattern: /useState/ },
        { name: 'Event handlers', pattern: /handleExport/ },
        { name: 'Component usage', pattern: /<HeatmapVisualizer/ }
      ];

      const passedChecks = checks.filter(check => check.pattern.test(content));
      
      this.results.push({
        component: 'Example File',
        status: passedChecks.length === checks.length ? 'PASS' : 'FAIL',
        message: `${passedChecks.length}/${checks.length} verificaciones pasaron`,
        details: passedChecks.length < checks.length 
          ? `Faltan: ${checks.filter(c => !c.pattern.test(content)).map(c => c.name).join(', ')}`
          : undefined
      });
    } catch (error) {
      this.results.push({
        component: 'Example File',
        status: 'FAIL',
        message: 'Error al verificar archivo de ejemplo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  private async testDocumentation(): Promise<void> {
    console.log('📚 Verificando documentación...');
    
    try {
      const filePath = join(this.projectRoot, 'docs/ANALYTICS-COMPONENTS.md');
      const content = readFileSync(filePath, 'utf-8');
      
      const checks = [
        { name: 'Title', pattern: /# Componentes de Analytics Avanzados/ },
        { name: 'Table of contents', pattern: /## Tabla de Contenidos/ },
        { name: 'HeatmapVisualizer section', pattern: /## HeatmapVisualizer/ },
        { name: 'PredictiveAnalytics section', pattern: /## PredictiveAnalytics/ },
        { name: 'ABTestingDashboard section', pattern: /## ABTestingDashboard/ },
        { name: 'RealTimeMetrics section', pattern: /## RealTimeMetrics/ },
        { name: 'ExportManager section', pattern: /## ExportManager/ },
        { name: 'API endpoints', pattern: /## API Endpoints/ },
        { name: 'Code examples', pattern: /```tsx/ }
      ];

      const passedChecks = checks.filter(check => check.pattern.test(content));
      
      this.results.push({
        component: 'Documentation',
        status: passedChecks.length === checks.length ? 'PASS' : 'FAIL',
        message: `${passedChecks.length}/${checks.length} verificaciones pasaron`,
        details: passedChecks.length < checks.length 
          ? `Faltan: ${checks.filter(c => !c.pattern.test(content)).map(c => c.name).join(', ')}`
          : undefined
      });
    } catch (error) {
      this.results.push({
        component: 'Documentation',
        status: 'FAIL',
        message: 'Error al verificar documentación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  private printResults(): void {
    console.log('\n📊 Resultados de las pruebas:\n');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    console.log(`✅ Pasaron: ${passed}`);
    console.log(`❌ Fallaron: ${failed}`);
    console.log(`⏭️  Omitidos: ${skipped}`);
    console.log(`📈 Total: ${this.results.length}\n`);
    
    // Mostrar detalles de fallos
    const failures = this.results.filter(r => r.status === 'FAIL');
    if (failures.length > 0) {
      console.log('❌ Detalles de fallos:');
      failures.forEach(failure => {
        console.log(`\n🔍 ${failure.component}:`);
        console.log(`   ${failure.message}`);
        if (failure.details) {
          console.log(`   💡 ${failure.details}`);
        }
      });
    }
    
    // Mostrar resumen
    console.log('\n🎯 Resumen:');
    if (failed === 0) {
      console.log('🎉 ¡Todas las pruebas pasaron! Los componentes de analytics están listos para usar.');
    } else {
      console.log('⚠️  Algunas pruebas fallaron. Revisa los detalles arriba y corrige los problemas.');
    }
    
    // Sugerencias
    if (failed > 0) {
      console.log('\n💡 Sugerencias:');
      console.log('1. Verifica que todos los archivos estén en las ubicaciones correctas');
      console.log('2. Asegúrate de que las dependencias estén instaladas');
      console.log('3. Revisa la sintaxis de TypeScript en los componentes');
      console.log('4. Verifica que las importaciones sean correctas');
    }
  }
}

// Ejecutar pruebas
async function main() {
  const tester = new AnalyticsComponentTester();
  await tester.runAllTests();
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error ejecutando pruebas:', error);
    process.exit(1);
  });
}

export { AnalyticsComponentTester };
