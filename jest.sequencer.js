const TestSequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends TestSequencer {
  sort(tests) {
    // Ordenar tests por prioridad y dependencias
    return tests.sort((testA, testB) => {
      // Tests unitarios primero (más rápidos)
      const isUnitA = testA.path.includes('unit') || testA.path.includes('.test.');
      const isUnitB = testB.path.includes('unit') || testB.path.includes('.test.');
      
      if (isUnitA && !isUnitB) return -1;
      if (!isUnitA && isUnitB) return 1;
      
      // Tests de componentes después
      const isComponentA = testA.path.includes('components');
      const isComponentB = testB.path.includes('components');
      
      if (isComponentA && !isComponentB) return -1;
      if (!isComponentA && isComponentB) return 1;
      
      // Tests de integración después
      const isIntegrationA = testA.path.includes('integration');
      const isIntegrationB = testB.path.includes('integration');
      
      if (isIntegrationA && !isIntegrationB) return -1;
      if (!isIntegrationA && isIntegrationB) return 1;
      
      // Tests de API al final
      const isApiA = testA.path.includes('api');
      const isApiB = testB.path.includes('api');
      
      if (isApiA && !isApiB) return 1;
      if (!isApiA && isApiB) return -1;
      
      // Si son del mismo tipo, ordenar alfabéticamente
      return testA.path.localeCompare(testB.path);
    });
  }
}

module.exports = CustomSequencer;
