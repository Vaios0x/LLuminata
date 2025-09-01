# Sistema de Tests - InclusiveAI Coach

Este directorio contiene la estructura completa de tests para el proyecto InclusiveAI Coach, organizados por categorías y tipos de testing.

## 📁 Estructura de Directorios

```
tests/__tests__/
├── components/           # Tests de componentes individuales
│   ├── gamification/    # Tests de componentes de gamificación
│   ├── analytics/       # Tests de componentes de analytics
│   ├── ai/             # Tests de componentes de IA
│   ├── security/       # Tests de componentes de seguridad
│   └── accessibility/  # Tests de componentes de accesibilidad
├── integration/         # Tests de integración
│   ├── gamification/   # Tests de integración de gamificación
│   ├── analytics/      # Tests de integración de analytics
│   ├── ai/            # Tests de integración de IA
│   ├── security/      # Tests de integración de seguridad
│   └── accessibility/ # Tests de integración de accesibilidad
└── test-runner.ts     # Runner principal de tests
```

## 🧪 Tipos de Tests

### Tests de Componentes
Los tests de componentes verifican el funcionamiento individual de cada componente React:

- **Renderizado correcto**: Verifica que los componentes se rendericen sin errores
- **Props y estado**: Prueba el manejo de props y estado interno
- **Eventos y callbacks**: Verifica que los eventos se manejen correctamente
- **Accesibilidad**: Asegura que los componentes cumplan con estándares de accesibilidad
- **Responsive design**: Prueba el comportamiento en diferentes tamaños de pantalla

### Tests de Integración
Los tests de integración verifican cómo los componentes trabajan juntos:

- **Comunicación entre componentes**: Prueba el flujo de datos entre componentes
- **APIs y servicios**: Verifica la integración con APIs externas
- **Estado global**: Prueba el manejo de estado compartido
- **Rutas y navegación**: Verifica el enrutamiento y navegación
- **Autenticación**: Prueba flujos de autenticación completos

## 🚀 Comandos de Ejecución

### Ejecutar Todos los Tests
```bash
# Ejecutar todos los tests usando el runner
npm run test:runner:all

# Ejecutar tests tradicionales
npm test
```

### Ejecutar Tests por Categoría
```bash
# Tests de componentes
npm run test:components

# Tests de integración
npm run test:integration

# Tests específicos por categoría
npm run test:components:gamification
npm run test:components:analytics
npm run test:components:ai
npm run test:components:security
npm run test:components:accessibility

# Tests de integración por categoría
npm run test:integration:gamification
npm run test:integration:analytics
npm run test:integration:ai
npm run test:integration:security
npm run test:integration:accessibility
```

### Usar el Test Runner
```bash
# Ejecutar todos los tests
npm run test:runner

# Ejecutar tests por categoría específica
npm run test:runner:category gamification
npm run test:runner:category analytics
npm run test:runner:category ai
npm run test:runner:category security
npm run test:runner:category accessibility
```

### Otros Comandos Útiles
```bash
# Tests con watch mode
npm run test:watch

# Tests con coverage
npm run test:coverage

# Tests de accesibilidad
npm run test:accessibility

# Tests de seguridad
npm run test:security

# Tests de rendimiento
npm run test:performance
```

## 📊 Cobertura de Tests

### Gamificación
- **Componentes**: Dashboard, Personalización, Trading, Eventos, Clanes, Competencias
- **Integración**: Flujos completos de gamificación, economía virtual, eventos

### Analytics
- **Componentes**: Dashboard, Métricas en tiempo real, Exportación, Predictivo, Heatmap, A/B Testing
- **Integración**: Flujos de datos, exportación, análisis predictivo

### IA
- **Componentes**: Motor de recomendaciones, Análisis de comportamiento, Generación de voz, Adaptación cultural
- **Integración**: Servicios de IA, modelos de ML, APIs de IA

### Seguridad
- **Componentes**: Controles de privacidad, Protección CSRF, Validación de entrada, Monitoreo de rate limiting
- **Integración**: Flujos de seguridad, autenticación, autorización

### Accesibilidad
- **Componentes**: Panel de accesibilidad, Lector de pantalla, Alto contraste, Control por voz
- **Integración**: Flujos de accesibilidad, navegación por teclado, lectores de pantalla

## 🛠️ Configuración

### Jest Configuration
Los tests utilizan la configuración de Jest definida en `jest.config.js`:

- **Environment**: jsdom para simular el DOM del navegador
- **Setup**: `jest.setup.js` para configuración global
- **Coverage**: 80% mínimo de cobertura
- **Timeouts**: 30 segundos por test

### Mocks y Stubs
Los tests incluyen mocks para:

- **APIs externas**: fetch, servicios de IA
- **Componentes UI**: shadcn/ui components
- **Librerías**: recharts, TensorFlow.js
- **APIs del navegador**: localStorage, sessionStorage, Web APIs

### Datos de Prueba
Cada test incluye datos mock realistas que simulan:

- Datos de usuario y perfiles
- Configuraciones de gamificación
- Métricas de analytics
- Resultados de IA
- Configuraciones de seguridad
- Preferencias de accesibilidad

## 📝 Escribiendo Tests

### Estructura de un Test
```typescript
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ComponentName } from '@/components/category/component-name';
import '@testing-library/jest-dom';

describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza correctamente', async () => {
    render(<ComponentName />);
    
    await waitFor(() => {
      expect(screen.getByText('Texto esperado')).toBeInTheDocument();
    });
  });

  it('maneja eventos correctamente', async () => {
    render(<ComponentName />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Resultado esperado')).toBeInTheDocument();
    });
  });
});
```

### Buenas Prácticas

1. **Nombres descriptivos**: Usa nombres que describan claramente qué se está probando
2. **Arrange-Act-Assert**: Organiza los tests en tres secciones claras
3. **Mocks apropiados**: Mock solo lo necesario para aislar el componente
4. **Datos realistas**: Usa datos que simulen el uso real
5. **Cobertura completa**: Prueba casos exitosos, errores y edge cases
6. **Accesibilidad**: Incluye tests de accesibilidad cuando sea relevante

### Testing de Accesibilidad
```typescript
it('cumple con estándares de accesibilidad', () => {
  render(<ComponentName />);
  
  // Verificar roles ARIA
  expect(screen.getByRole('button')).toBeInTheDocument();
  
  // Verificar labels
  expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
  
  // Verificar navegación por teclado
  const element = screen.getByRole('button');
  element.focus();
  expect(element).toHaveFocus();
});
```

## 🔍 Debugging de Tests

### Ver Tests Fallidos
```bash
# Ver output detallado
npm test -- --verbose

# Ver tests específicos
npm test -- --testNamePattern="nombre del test"

# Ver tests de un archivo específico
npm test -- path/to/test-file.test.tsx
```

### Coverage Report
```bash
# Generar reporte de cobertura
npm run test:coverage

# Ver reporte en navegador
open coverage/lcov-report/index.html
```

### Watch Mode
```bash
# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests específicos en watch
npm test -- --watch --testPathPattern="gamification"
```

## 📈 Métricas y Reportes

### Cobertura Mínima
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Reportes Generados
- **Coverage**: Reporte de cobertura en formato HTML y LCOV
- **Test Results**: Resumen de tests pasados/fallidos
- **Performance**: Métricas de tiempo de ejecución
- **Accessibility**: Reportes de accesibilidad con pa11y

## 🚨 Troubleshooting

### Problemas Comunes

1. **Tests que fallan intermitentemente**
   - Verificar mocks y timers
   - Usar `waitFor` para operaciones asíncronas
   - Limpiar estado entre tests

2. **Errores de importación**
   - Verificar paths en `jest.config.js`
   - Asegurar que los mocks estén configurados correctamente

3. **Tests lentos**
   - Optimizar mocks pesados
   - Usar `jest.isolateModules` cuando sea necesario
   - Considerar tests paralelos

### Logs y Debugging
```bash
# Ver logs detallados
DEBUG=* npm test

# Ver logs de Jest
npm test -- --verbose --detectOpenHandles

# Ver logs de mocks
npm test -- --verbose --showConfig
```

## 🤝 Contribución

### Agregando Nuevos Tests

1. **Crear archivo de test**: `component-name.test.tsx`
2. **Seguir convenciones**: Usar la estructura establecida
3. **Agregar mocks**: Mock dependencias externas
4. **Documentar**: Agregar comentarios para casos complejos
5. **Verificar cobertura**: Asegurar que el test cubra el código

### Actualizando Tests Existentes

1. **Mantener compatibilidad**: No romper tests existentes
2. **Actualizar mocks**: Mantener mocks actualizados
3. **Refactorizar**: Mejorar tests cuando sea necesario
4. **Documentar cambios**: Actualizar documentación

## 📚 Recursos Adicionales

- [Testing Library Documentation](https://testing-library.com/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Best Practices](https://reactjs.org/docs/testing.html)
- [Accessibility Testing Guide](https://www.w3.org/WAI/ER/tools/)
- [Security Testing Guidelines](https://owasp.org/www-project-web-security-testing-guide/)

## 📞 Soporte

Para problemas con los tests:

1. Revisar la documentación de Jest y Testing Library
2. Verificar la configuración en `jest.config.js`
3. Revisar los mocks en `jest.setup.js`
4. Consultar los logs de error detallados
5. Crear un issue en el repositorio con detalles del problema
