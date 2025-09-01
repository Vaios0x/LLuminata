# 🧪 Testing Suite - InclusiveAI Coach

Este documento describe la suite completa de testing implementada para el proyecto InclusiveAI Coach, incluyendo tests unitarios, de integración, E2E, accesibilidad, performance y seguridad.

## 📋 Tabla de Contenidos

- [Arquitectura de Testing](#arquitectura-de-testing)
- [Configuración](#configuración)
- [Tipos de Tests](#tipos-de-tests)
- [Ejecución de Tests](#ejecución-de-tests)
- [Cobertura](#cobertura)
- [Reportes](#reportes)
- [CI/CD](#cicd)
- [Mejores Prácticas](#mejores-prácticas)
- [Solución de Problemas](#solución-de-problemas)

## 🏗️ Arquitectura de Testing

### Estructura de Directorios

```
tests/
├── unit/                    # Tests unitarios
│   ├── components/         # Tests de componentes UI
│   ├── services/           # Tests de servicios
│   ├── utils/              # Tests de utilidades
│   └── lib/                # Tests de librerías
├── integration/            # Tests de integración
│   ├── api/               # Tests de APIs
│   ├── database/          # Tests de base de datos
│   └── components/        # Tests de integración de componentes
├── e2e/                   # Tests end-to-end
│   ├── accessibility.spec.ts
│   ├── chatbot.spec.ts
│   ├── navigation.spec.ts
│   └── performance.spec.ts
└── fixtures/              # Datos de prueba
    ├── mock-data.json
    └── test-users.json
```

### Tecnologías Utilizadas

- **Jest**: Framework principal de testing
- **React Testing Library**: Testing de componentes React
- **Playwright**: Tests E2E
- **Jest-Axe**: Testing de accesibilidad
- **MSW**: Mock Service Worker para APIs
- **Lighthouse**: Testing de performance
- **Pa11y**: Testing de accesibilidad automatizado

## ⚙️ Configuración

### Dependencias

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.40.0",
    "jest": "^29.7.0",
    "jest-axe": "^8.0.0",
    "msw": "^2.0.0",
    "lighthouse": "^11.0.0",
    "pa11y-ci": "^3.1.0"
  }
}
```

### Configuración de Jest

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testSequencer: '<rootDir>/jest.sequencer.js',
};

module.exports = createJestConfig(customJestConfig);
```

### Configuración de Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 🧪 Tipos de Tests

### 1. Tests Unitarios

Los tests unitarios verifican el comportamiento individual de funciones, componentes y servicios.

#### Ejemplo: Test de Componente

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Ejemplo: Test de Servicio

```typescript
import { needsDetectionService } from '@/lib/ai-services/needs-detection-service';

describe('Needs Detection Service', () => {
  it('should detect dyslexia correctly', async () => {
    const mockData = {
      readingSpeed: 0.3,
      readingAccuracy: 0.85,
      // ... más datos
    };

    const result = await needsDetectionService.analyzeNeeds('student-1', mockData);
    
    expect(result.specialNeeds).toHaveLength(1);
    expect(result.specialNeeds[0].type).toBe('DYSLEXIA');
  });
});
```

### 2. Tests de Integración

Los tests de integración verifican la interacción entre múltiples componentes y servicios.

```typescript
import { render, screen } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';

describe('Dashboard Integration', () => {
  it('should render all components correctly', () => {
    render(<Dashboard />);
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getAllByTestId('stat-card')).toHaveLength(4);
    expect(screen.getAllByTestId('activity-item')).toHaveLength(4);
  });
});
```

### 3. Tests E2E

Los tests E2E simulan el comportamiento real del usuario en la aplicación.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Chatbot E2E', () => {
  test('should open and send messages', async ({ page }) => {
    await page.goto('/');
    
    // Abrir chatbot
    await page.locator('[aria-label="Abrir chatbot"]').click();
    
    // Enviar mensaje
    await page.locator('input[placeholder="Escribe tu mensaje..."]').fill('Hola');
    await page.keyboard.press('Enter');
    
    // Verificar respuesta
    await expect(page.locator('text=Respuesta del asistente')).toBeVisible();
  });
});
```

### 4. Tests de Accesibilidad

Los tests de accesibilidad verifican que la aplicación cumpla con los estándares WCAG.

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 5. Tests de Performance

Los tests de performance verifican que la aplicación cumpla con los objetivos de rendimiento.

```typescript
import { test, expect } from '@playwright/test';

test('should load dashboard quickly', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/dashboard');
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000); // Debe cargar en menos de 3 segundos
});
```

## 🚀 Ejecución de Tests

### Scripts Disponibles

```bash
# Tests unitarios
npm run test:unit

# Tests de componentes
npm run test:components

# Tests de servicios
npm run test:services

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e

# Tests de accesibilidad
npm run test:a11y:ci

# Tests de performance
npm run test:performance:lighthouse

# Tests de seguridad
npm run test:security:owasp

# Todos los tests
npm run test:all

# Tests rápidos
npm run test:quick
```

### Scripts Automatizados

#### Windows (PowerShell)
```powershell
.\scripts\run-tests.ps1
.\scripts\run-tests.ps1 quick
.\scripts\run-tests.ps1 unit
.\scripts\run-tests.ps1 e2e
```

#### Linux/Mac (Bash)
```bash
./scripts/run-tests.sh
./scripts/run-tests.sh --quick
./scripts/run-tests.sh --unit
./scripts/run-tests.sh --e2e
```

### Ejecución Manual

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npm run db:generate

# Ejecutar tests específicos
npm run test:unit
npm run test:e2e
npm run test:coverage
```

## 📊 Cobertura

### Configuración de Cobertura

```javascript
// jest.config.js
collectCoverageFrom: [
  'components/**/*.{ts,tsx}',
  'lib/**/*.{ts,tsx}',
  'app/**/*.{ts,tsx}',
  '!**/*.d.ts',
  '!**/node_modules/**',
  '!**/coverage/**',
  '!**/tests/**',
],
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

### Objetivos de Cobertura

- **Cobertura Total**: 80% mínimo
- **Componentes UI**: 90% mínimo
- **Servicios de IA**: 85% mínimo
- **Utilidades**: 95% mínimo
- **APIs**: 80% mínimo

### Generar Reporte de Cobertura

```bash
npm run test:coverage
```

El reporte se genera en `coverage/lcov-report/index.html`

## 📈 Reportes

### Tipos de Reportes

1. **Cobertura de Código**: HTML, LCOV, JSON
2. **Tests E2E**: HTML, JSON, JUnit
3. **Performance**: Lighthouse JSON
4. **Accesibilidad**: Pa11y HTML
5. **Seguridad**: Snyk, npm audit

### Configuración de Reportes

```javascript
// jest.config.js
reporters: [
  'default',
  ['jest-junit', {
    outputDirectory: 'reports/junit',
    outputName: 'js-test-results.xml',
  }],
  ['jest-html-reporters', {
    publicPath: './reports/html',
    filename: 'test-report.html',
  }],
],
```

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Generate Prisma client
      run: npm run db:generate
    
    - name: Run unit tests
      run: npm run test:ci
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Run accessibility tests
      run: npm run test:a11y:ci
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### Pipeline de Testing

1. **Validaciones**: TypeScript, ESLint, Prettier
2. **Tests Unitarios**: Jest con cobertura
3. **Tests de Integración**: APIs y base de datos
4. **Tests E2E**: Playwright en múltiples navegadores
5. **Tests de Accesibilidad**: Pa11y CI
6. **Tests de Performance**: Lighthouse
7. **Tests de Seguridad**: Snyk, npm audit

## ✅ Mejores Prácticas

### 1. Naming Conventions

```typescript
// ✅ Correcto
describe('UserService', () => {
  it('should create user with valid data', () => {
    // test implementation
  });
});

// ❌ Incorrecto
describe('user service', () => {
  it('test user creation', () => {
    // test implementation
  });
});
```

### 2. Estructura AAA (Arrange, Act, Assert)

```typescript
describe('Calculator', () => {
  it('should add two numbers correctly', () => {
    // Arrange
    const calculator = new Calculator();
    const a = 5;
    const b = 3;
    
    // Act
    const result = calculator.add(a, b);
    
    // Assert
    expect(result).toBe(8);
  });
});
```

### 3. Mocks y Stubs

```typescript
// Mock de servicios externos
jest.mock('@/lib/ai-services/needs-detection-service', () => ({
  needsDetectionService: {
    analyzeNeeds: jest.fn().mockResolvedValue({
      specialNeeds: [],
      learningProfile: { learningStyle: 'visual' },
    }),
  },
}));

// Mock de APIs
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.post('/api/ai/chat', (req, res, ctx) => {
    return res(
      ctx.json({
        message: 'Respuesta del asistente',
        conversationId: 'conv-123',
      })
    );
  })
);
```

### 4. Testing de Accesibilidad

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Component Accessibility', () => {
  it('should meet accessibility standards', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 5. Testing de Performance

```typescript
test('should render within performance budget', async ({ page }) => {
  const startTime = performance.now();
  
  await page.goto('/dashboard');
  
  const endTime = performance.now();
  const loadTime = endTime - startTime;
  
  expect(loadTime).toBeLessThan(2000); // 2 segundos máximo
});
```

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. Tests que Fallan Intermitentemente

```typescript
// ✅ Usar waitFor para operaciones asíncronas
await waitFor(() => {
  expect(screen.getByText('Resultado')).toBeInTheDocument();
});

// ✅ Usar findBy en lugar de getBy para elementos que aparecen después
const element = await screen.findByText('Resultado');
expect(element).toBeInTheDocument();
```

#### 2. Mocks que No Funcionan

```typescript
// ✅ Limpiar mocks entre tests
beforeEach(() => {
  jest.clearAllMocks();
});

// ✅ Verificar que el mock se llamó correctamente
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
```

#### 3. Tests E2E Lentos

```typescript
// ✅ Usar selectores más específicos
await page.locator('[data-testid="submit-button"]').click();

// ✅ Esperar a que los elementos estén listos
await page.waitForSelector('[data-testid="result"]');
```

#### 4. Problemas de Cobertura

```typescript
// ✅ Agregar tests para ramas no cubiertas
if (condition) {
  // código que necesita test
} else {
  // código que también necesita test
}

// ✅ Usar istanbul ignore para código que no necesita test
/* istanbul ignore next */
function utilityFunction() {
  // código que no necesita test
}
```

### Debugging

#### 1. Debug Tests Unitarios

```bash
# Ejecutar tests en modo debug
npm run test:unit -- --verbose --detectOpenHandles

# Ejecutar un test específico
npm run test:unit -- --testNamePattern="should create user"
```

#### 2. Debug Tests E2E

```bash
# Ejecutar tests en modo headed
npm run test:e2e -- --headed

# Ejecutar tests en modo debug
npm run test:e2e -- --debug

# Ejecutar un test específico
npm run test:e2e -- --grep="should open chatbot"
```

#### 3. Debug Performance

```bash
# Ejecutar Lighthouse con más detalle
lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless"
```

## 📚 Recursos Adicionales

### Documentación

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Jest-Axe](https://github.com/nickcolley/jest-axe)
- [MSW Documentation](https://mswjs.io/docs/)

### Herramientas

- [Jest Coverage Badge](https://github.com/artemv/jest-and-github-actions)
- [Playwright Test Generator](https://playwright.dev/docs/codegen)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Pa11y CI](https://github.com/pa11y/pa11y-ci)

### Comunidad

- [Testing Library Discord](https://discord.gg/testing-library)
- [Jest Community](https://github.com/facebook/jest)
- [Playwright Community](https://github.com/microsoft/playwright)

---

**Nota**: Este documento se actualiza regularmente. Para sugerencias o mejoras, por favor crea un issue en el repositorio.
