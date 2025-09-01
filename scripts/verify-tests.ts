#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface TestFile {
  path: string;
  name: string;
  category: string;
  type: 'component' | 'integration';
  exists: boolean;
  hasTests: boolean;
}

interface TestCategory {
  name: string;
  componentTests: TestFile[];
  integrationTests: TestFile[];
}

class TestVerifier {
  private baseDir: string;
  private testCategories: TestCategory[] = [];

  constructor() {
    this.baseDir = path.join(process.cwd(), 'tests', '__tests__');
    this.initializeCategories();
  }

  private initializeCategories() {
    const categories = [
      'gamification',
      'analytics', 
      'ai',
      'security',
      'accessibility'
    ];

    this.testCategories = categories.map(category => ({
      name: category,
      componentTests: [],
      integrationTests: []
    }));
  }

  /**
   * Verifica la estructura de directorios de tests
   */
  verifyDirectoryStructure(): boolean {
    console.log('🔍 Verificando estructura de directorios...\n');

    const requiredDirs = [
      'tests/__tests__/components',
      'tests/__tests__/integration',
      'tests/__tests__/components/gamification',
      'tests/__tests__/components/analytics',
      'tests/__tests__/components/ai',
      'tests/__tests__/components/security',
      'tests/__tests__/components/accessibility',
      'tests/__tests__/integration/gamification',
      'tests/__tests__/integration/analytics',
      'tests/__tests__/integration/ai',
      'tests/__tests__/integration/security',
      'tests/__tests__/integration/accessibility'
    ];

    let allDirsExist = true;

    for (const dir of requiredDirs) {
      const fullPath = path.join(process.cwd(), dir);
      const exists = fs.existsSync(fullPath);
      
      console.log(`${exists ? '✅' : '❌'} ${dir}`);
      
      if (!exists) {
        allDirsExist = false;
      }
    }

    console.log('');
    return allDirsExist;
  }

  /**
   * Verifica que los archivos de test existan
   */
  verifyTestFiles(): TestFile[] {
    console.log('📁 Verificando archivos de test...\n');

    const expectedTests = [
      // Component tests
      { path: 'tests/__tests__/components/gamification/gamification-dashboard.test.tsx', category: 'gamification', type: 'component' as const },
      { path: 'tests/__tests__/components/analytics/analytics-dashboard.test.tsx', category: 'analytics', type: 'component' as const },
      { path: 'tests/__tests__/components/ai/RecommendationEngine.test.tsx', category: 'ai', type: 'component' as const },
      { path: 'tests/__tests__/components/security/PrivacyControls.test.tsx', category: 'security', type: 'component' as const },
      { path: 'tests/__tests__/components/accessibility/accessibility-panel.test.tsx', category: 'accessibility', type: 'component' as const },
      
      // Integration tests
      { path: 'tests/__tests__/integration/gamification/gamification-integration.test.tsx', category: 'gamification', type: 'integration' as const },
      { path: 'tests/__tests__/integration/analytics/analytics-integration.test.tsx', category: 'analytics', type: 'integration' as const }
    ];

    const testFiles: TestFile[] = [];

    for (const expected of expectedTests) {
      const fullPath = path.join(process.cwd(), expected.path);
      const exists = fs.existsSync(fullPath);
      
      let hasTests = false;
      if (exists) {
        const content = fs.readFileSync(fullPath, 'utf8');
        hasTests = content.includes('describe(') && content.includes('it(');
      }

      const testFile: TestFile = {
        path: expected.path,
        name: path.basename(expected.path),
        category: expected.category,
        type: expected.type,
        exists,
        hasTests
      };

      testFiles.push(testFile);

      console.log(`${exists ? '✅' : '❌'} ${expected.path} ${hasTests ? '(con tests)' : '(sin tests)'}`);
    }

    console.log('');
    return testFiles;
  }

  /**
   * Verifica la configuración de Jest
   */
  verifyJestConfig(): boolean {
    console.log('⚙️ Verificando configuración de Jest...\n');

    const jestConfigPath = path.join(process.cwd(), 'jest.config.js');
    const jestSetupPath = path.join(process.cwd(), 'jest.setup.js');

    const configExists = fs.existsSync(jestConfigPath);
    const setupExists = fs.existsSync(jestSetupPath);

    console.log(`${configExists ? '✅' : '❌'} jest.config.js`);
    console.log(`${setupExists ? '✅' : '❌'} jest.setup.js`);

    if (configExists) {
      const configContent = fs.readFileSync(jestConfigPath, 'utf8');
      const hasTestPathPattern = configContent.includes('testPathPattern');
      const hasCoverage = configContent.includes('coverageThreshold');
      
      console.log(`${hasTestPathPattern ? '✅' : '❌'} Configuración de testPathPattern`);
      console.log(`${hasCoverage ? '✅' : '❌'} Configuración de coverage`);
    }

    console.log('');
    return configExists && setupExists;
  }

  /**
   * Verifica los scripts de package.json
   */
  verifyPackageScripts(): boolean {
    console.log('📦 Verificando scripts de package.json...\n');

    const packagePath = path.join(process.cwd(), 'package.json');
    const packageExists = fs.existsSync(packagePath);

    if (!packageExists) {
      console.log('❌ package.json no encontrado');
      return false;
    }

    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const scripts = packageContent.scripts || {};

    const requiredScripts = [
      'test',
      'test:watch',
      'test:coverage',
      'test:components',
      'test:integration',
      'test:runner'
    ];

    let allScriptsExist = true;

    for (const script of requiredScripts) {
      const exists = scripts.hasOwnProperty(script);
      console.log(`${exists ? '✅' : '❌'} ${script}`);
      if (!exists) {
        allScriptsExist = false;
      }
    }

    console.log('');
    return allScriptsExist;
  }

  /**
   * Verifica que Jest pueda ejecutarse
   */
  async verifyJestExecution(): Promise<boolean> {
    console.log('🚀 Verificando ejecución de Jest...\n');

    try {
      // Ejecutar Jest con --listTests para verificar que puede encontrar los tests
      const output = execSync('npx jest --listTests --passWithNoTests', {
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      const testFiles = output.trim().split('\n').filter(line => line.length > 0);
      
      console.log(`✅ Jest ejecutado correctamente`);
      console.log(`📊 Encontrados ${testFiles.length} archivos de test`);
      
      if (testFiles.length > 0) {
        console.log('📝 Archivos de test encontrados:');
        testFiles.slice(0, 5).forEach(file => {
          console.log(`   - ${file}`);
        });
        if (testFiles.length > 5) {
          console.log(`   ... y ${testFiles.length - 5} más`);
        }
      }

      console.log('');
      return true;
    } catch (error) {
      console.log('❌ Error ejecutando Jest');
      console.log(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      console.log('');
      return false;
    }
  }

  /**
   * Verifica la documentación
   */
  verifyDocumentation(): boolean {
    console.log('📚 Verificando documentación...\n');

    const readmePath = path.join(process.cwd(), 'tests', '__tests__', 'README.md');
    const readmeExists = fs.existsSync(readmePath);

    console.log(`${readmeExists ? '✅' : '❌'} README.md en tests/__tests__/`);

    if (readmeExists) {
      const content = fs.readFileSync(readmePath, 'utf8');
      const hasStructure = content.includes('Estructura de Directorios');
      const hasCommands = content.includes('Comandos de Ejecución');
      const hasCoverage = content.includes('Cobertura de Tests');

      console.log(`${hasStructure ? '✅' : '❌'} Documentación de estructura`);
      console.log(`${hasCommands ? '✅' : '❌'} Documentación de comandos`);
      console.log(`${hasCoverage ? '✅' : '❌'} Documentación de cobertura`);
    }

    console.log('');
    return readmeExists;
  }

  /**
   * Ejecuta todas las verificaciones
   */
  async runAllVerifications(): Promise<void> {
    console.log('🔍 INICIANDO VERIFICACIÓN COMPLETA DEL SISTEMA DE TESTS\n');
    console.log('='.repeat(60));

    const results = {
      directoryStructure: this.verifyDirectoryStructure(),
      testFiles: this.verifyTestFiles(),
      jestConfig: this.verifyJestConfig(),
      packageScripts: this.verifyPackageScripts(),
      jestExecution: await this.verifyJestExecution(),
      documentation: this.verifyDocumentation()
    };

    console.log('='.repeat(60));
    console.log('📋 RESUMEN DE VERIFICACIÓN');
    console.log('='.repeat(60));

    const testFiles = results.testFiles;
    const totalFiles = testFiles.length;
    const existingFiles = testFiles.filter(f => f.exists).length;
    const filesWithTests = testFiles.filter(f => f.hasTests).length;

    console.log(`📁 Estructura de directorios: ${results.directoryStructure ? '✅' : '❌'}`);
    console.log(`📄 Archivos de test: ${existingFiles}/${totalFiles} existentes`);
    console.log(`🧪 Tests implementados: ${filesWithTests}/${totalFiles} con tests`);
    console.log(`⚙️ Configuración de Jest: ${results.jestConfig ? '✅' : '❌'}`);
    console.log(`📦 Scripts de package.json: ${results.packageScripts ? '✅' : '❌'}`);
    console.log(`🚀 Ejecución de Jest: ${results.jestExecution ? '✅' : '❌'}`);
    console.log(`📚 Documentación: ${results.documentation ? '✅' : '❌'}`);

    const allPassed = results.directoryStructure && 
                     results.jestConfig && 
                     results.packageScripts && 
                     results.jestExecution && 
                     results.documentation &&
                     existingFiles === totalFiles &&
                     filesWithTests === totalFiles;

    console.log('\n' + '='.repeat(60));
    
    if (allPassed) {
      console.log('🎉 ¡TODAS LAS VERIFICACIONES PASARON EXITOSAMENTE!');
      console.log('✅ El sistema de tests está completamente configurado y listo para usar.');
    } else {
      console.log('⚠️ ALGUNAS VERIFICACIONES FALLARON');
      console.log('❌ Revisa los errores arriba y corrige los problemas identificados.');
      process.exit(1);
    }

    console.log('\n📊 ESTADÍSTICAS DETALLADAS');
    console.log('='.repeat(60));

    // Agrupar por categoría
    const categories = ['gamification', 'analytics', 'ai', 'security', 'accessibility'];
    
    for (const category of categories) {
      const categoryTests = testFiles.filter(f => f.category === category);
      const componentTests = categoryTests.filter(f => f.type === 'component');
      const integrationTests = categoryTests.filter(f => f.type === 'integration');
      
      console.log(`\n📂 ${category.toUpperCase()}:`);
      console.log(`   Componentes: ${componentTests.filter(f => f.exists).length}/${componentTests.length} archivos`);
      console.log(`   Integración: ${integrationTests.filter(f => f.exists).length}/${integrationTests.length} archivos`);
    }

    console.log('\n🚀 PRÓXIMOS PASOS');
    console.log('='.repeat(60));
    console.log('1. Ejecuta "npm run test:runner:all" para ejecutar todos los tests');
    console.log('2. Ejecuta "npm run test:coverage" para ver el reporte de cobertura');
    console.log('3. Ejecuta "npm run test:watch" para desarrollo con watch mode');
    console.log('4. Revisa la documentación en tests/__tests__/README.md');
  }
}

// Función principal
async function main() {
  const verifier = new TestVerifier();
  await verifier.runAllVerifications();
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

export default TestVerifier;
