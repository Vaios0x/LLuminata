import { execSync } from 'child_process';
import path from 'path';

interface TestResult {
  testFile: string;
  passed: boolean;
  error?: string;
  duration: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
}

class TestRunner {
  private testSuites: TestSuite[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Ejecuta todos los tests de componentes
   */
  async runComponentTests(): Promise<TestSuite> {
    console.log('🧪 Ejecutando tests de componentes...');
    
    const componentTestPaths = [
      'tests/__tests__/components/gamification',
      'tests/__tests__/components/analytics',
      'tests/__tests__/components/ai',
      'tests/__tests__/components/security',
      'tests/__tests__/components/accessibility'
    ];

    const results: TestResult[] = [];

    for (const testPath of componentTestPaths) {
      try {
        const startTime = Date.now();
        execSync(`npm test -- ${testPath} --passWithNoTests --silent`, {
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        results.push({
          testFile: testPath,
          passed: true,
          duration: Date.now() - startTime
        });
      } catch (error) {
        results.push({
          testFile: testPath,
          passed: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          duration: 0
        });
      }
    }

    const suite: TestSuite = {
      name: 'Component Tests',
      tests: results,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: results.reduce((acc, r) => acc + r.duration, 0)
    };

    this.testSuites.push(suite);
    return suite;
  }

  /**
   * Ejecuta todos los tests de integración
   */
  async runIntegrationTests(): Promise<TestSuite> {
    console.log('🔗 Ejecutando tests de integración...');
    
    const integrationTestPaths = [
      'tests/__tests__/integration/gamification',
      'tests/__tests__/integration/analytics',
      'tests/__tests__/integration/ai',
      'tests/__tests__/integration/security',
      'tests/__tests__/integration/accessibility'
    ];

    const results: TestResult[] = [];

    for (const testPath of integrationTestPaths) {
      try {
        const startTime = Date.now();
        execSync(`npm test -- ${testPath} --passWithNoTests --silent`, {
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        results.push({
          testFile: testPath,
          passed: true,
          duration: Date.now() - startTime
        });
      } catch (error) {
        results.push({
          testFile: testPath,
          passed: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          duration: 0
        });
      }
    }

    const suite: TestSuite = {
      name: 'Integration Tests',
      tests: results,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: results.reduce((acc, r) => acc + r.duration, 0)
    };

    this.testSuites.push(suite);
    return suite;
  }

  /**
   * Ejecuta tests específicos de gamificación
   */
  async runGamificationTests(): Promise<TestSuite> {
    console.log('🎮 Ejecutando tests de gamificación...');
    
    const gamificationTests = [
      'tests/__tests__/components/gamification',
      'tests/__tests__/integration/gamification'
    ];

    const results: TestResult[] = [];

    for (const testPath of gamificationTests) {
      try {
        const startTime = Date.now();
        execSync(`npm test -- ${testPath} --passWithNoTests --silent`, {
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        results.push({
          testFile: testPath,
          passed: true,
          duration: Date.now() - startTime
        });
      } catch (error) {
        results.push({
          testFile: testPath,
          passed: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          duration: 0
        });
      }
    }

    const suite: TestSuite = {
      name: 'Gamification Tests',
      tests: results,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: results.reduce((acc, r) => acc + r.duration, 0)
    };

    this.testSuites.push(suite);
    return suite;
  }

  /**
   * Ejecuta tests específicos de analytics
   */
  async runAnalyticsTests(): Promise<TestSuite> {
    console.log('📊 Ejecutando tests de analytics...');
    
    const analyticsTests = [
      'tests/__tests__/components/analytics',
      'tests/__tests__/integration/analytics'
    ];

    const results: TestResult[] = [];

    for (const testPath of analyticsTests) {
      try {
        const startTime = Date.now();
        execSync(`npm test -- ${testPath} --passWithNoTests --silent`, {
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        results.push({
          testFile: testPath,
          passed: true,
          duration: Date.now() - startTime
        });
      } catch (error) {
        results.push({
          testFile: testPath,
          passed: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          duration: 0
        });
      }
    }

    const suite: TestSuite = {
      name: 'Analytics Tests',
      tests: results,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: results.reduce((acc, r) => acc + r.duration, 0)
    };

    this.testSuites.push(suite);
    return suite;
  }

  /**
   * Ejecuta tests específicos de IA
   */
  async runAITests(): Promise<TestSuite> {
    console.log('🤖 Ejecutando tests de IA...');
    
    const aiTests = [
      'tests/__tests__/components/ai',
      'tests/__tests__/integration/ai'
    ];

    const results: TestResult[] = [];

    for (const testPath of aiTests) {
      try {
        const startTime = Date.now();
        execSync(`npm test -- ${testPath} --passWithNoTests --silent`, {
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        results.push({
          testFile: testPath,
          passed: true,
          duration: Date.now() - startTime
        });
      } catch (error) {
        results.push({
          testFile: testPath,
          passed: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          duration: 0
        });
      }
    }

    const suite: TestSuite = {
      name: 'AI Tests',
      tests: results,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: results.reduce((acc, r) => acc + r.duration, 0)
    };

    this.testSuites.push(suite);
    return suite;
  }

  /**
   * Ejecuta tests específicos de seguridad
   */
  async runSecurityTests(): Promise<TestSuite> {
    console.log('🔒 Ejecutando tests de seguridad...');
    
    const securityTests = [
      'tests/__tests__/components/security',
      'tests/__tests__/integration/security'
    ];

    const results: TestResult[] = [];

    for (const testPath of securityTests) {
      try {
        const startTime = Date.now();
        execSync(`npm test -- ${testPath} --passWithNoTests --silent`, {
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        results.push({
          testFile: testPath,
          passed: true,
          duration: Date.now() - startTime
        });
      } catch (error) {
        results.push({
          testFile: testPath,
          passed: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          duration: 0
        });
      }
    }

    const suite: TestSuite = {
      name: 'Security Tests',
      tests: results,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: results.reduce((acc, r) => acc + r.duration, 0)
    };

    this.testSuites.push(suite);
    return suite;
  }

  /**
   * Ejecuta tests específicos de accesibilidad
   */
  async runAccessibilityTests(): Promise<TestSuite> {
    console.log('♿ Ejecutando tests de accesibilidad...');
    
    const accessibilityTests = [
      'tests/__tests__/components/accessibility',
      'tests/__tests__/integration/accessibility'
    ];

    const results: TestResult[] = [];

    for (const testPath of accessibilityTests) {
      try {
        const startTime = Date.now();
        execSync(`npm test -- ${testPath} --passWithNoTests --silent`, {
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        results.push({
          testFile: testPath,
          passed: true,
          duration: Date.now() - startTime
        });
      } catch (error) {
        results.push({
          testFile: testPath,
          passed: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          duration: 0
        });
      }
    }

    const suite: TestSuite = {
      name: 'Accessibility Tests',
      tests: results,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: results.reduce((acc, r) => acc + r.duration, 0)
    };

    this.testSuites.push(suite);
    return suite;
  }

  /**
   * Ejecuta todos los tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Iniciando ejecución completa de tests...\n');

    try {
      await this.runComponentTests();
      await this.runIntegrationTests();
      
      this.printSummary();
    } catch (error) {
      console.error('❌ Error ejecutando tests:', error);
      process.exit(1);
    }
  }

  /**
   * Ejecuta tests por categoría
   */
  async runTestsByCategory(category: string): Promise<void> {
    console.log(`🎯 Ejecutando tests de categoría: ${category}\n`);

    try {
      switch (category.toLowerCase()) {
        case 'gamification':
        case 'gamificación':
          await this.runGamificationTests();
          break;
        case 'analytics':
        case 'analíticas':
          await this.runAnalyticsTests();
          break;
        case 'ai':
        case 'inteligencia artificial':
          await this.runAITests();
          break;
        case 'security':
        case 'seguridad':
          await this.runSecurityTests();
          break;
        case 'accessibility':
        case 'accesibilidad':
          await this.runAccessibilityTests();
          break;
        default:
          console.error(`❌ Categoría no válida: ${category}`);
          console.log('Categorías disponibles: gamification, analytics, ai, security, accessibility');
          process.exit(1);
      }
      
      this.printSummary();
    } catch (error) {
      console.error('❌ Error ejecutando tests:', error);
      process.exit(1);
    }
  }

  /**
   * Imprime el resumen de los tests ejecutados
   */
  private printSummary(): void {
    const totalDuration = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE TESTS');
    console.log('='.repeat(60));

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    for (const suite of this.testSuites) {
      console.log(`\n📁 ${suite.name}:`);
      console.log(`   ✅ Tests pasados: ${suite.passedTests}/${suite.totalTests}`);
      console.log(`   ❌ Tests fallidos: ${suite.failedTests}`);
      console.log(`   ⏱️  Duración: ${suite.duration}ms`);

      if (suite.failedTests > 0) {
        console.log('   📝 Tests fallidos:');
        suite.tests
          .filter(test => !test.passed)
          .forEach(test => {
            console.log(`      - ${test.testFile}: ${test.error}`);
          });
      }

      totalTests += suite.totalTests;
      totalPassed += suite.passedTests;
      totalFailed += suite.failedTests;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 ESTADÍSTICAS GENERALES');
    console.log('='.repeat(60));
    console.log(`🎯 Total de tests: ${totalTests}`);
    console.log(`✅ Tests pasados: ${totalPassed}`);
    console.log(`❌ Tests fallidos: ${totalFailed}`);
    console.log(`📈 Tasa de éxito: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    console.log(`⏱️  Tiempo total: ${totalDuration}ms`);

    if (totalFailed === 0) {
      console.log('\n🎉 ¡Todos los tests pasaron exitosamente!');
    } else {
      console.log(`\n⚠️  ${totalFailed} test(s) fallaron. Revisa los errores arriba.`);
      process.exit(1);
    }
  }
}

// Función principal para ejecutar el test runner
async function main() {
  const runner = new TestRunner();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Ejecutar todos los tests
    await runner.runAllTests();
  } else if (args[0] === '--category' || args[0] === '-c') {
    // Ejecutar tests por categoría
    const category = args[1];
    if (!category) {
      console.error('❌ Debes especificar una categoría');
      console.log('Uso: npm run test:category <categoría>');
      console.log('Categorías: gamification, analytics, ai, security, accessibility');
      process.exit(1);
    }
    await runner.runTestsByCategory(category);
  } else {
    console.error('❌ Argumentos no válidos');
    console.log('Uso:');
    console.log('  npm run test:all                    # Ejecutar todos los tests');
    console.log('  npm run test:category <categoría>   # Ejecutar tests por categoría');
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

export default TestRunner;
