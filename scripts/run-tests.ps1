# Script para ejecutar todos los tests del proyecto LLuminata
# Autor: AI Assistant
# Fecha: $(Get-Date)

param(
    [Parameter(Position=0)]
    [string]$Option = "all"
)

# Configurar para salir en caso de error
$ErrorActionPreference = "Stop"

# Función para imprimir mensajes con colores
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Función para verificar si un comando existe
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Función para verificar dependencias
function Test-Dependencies {
    Write-Status "Verificando dependencias..."
    
    $missingDeps = @()
    
    if (-not (Test-Command "node")) {
        $missingDeps += "node"
    }
    
    if (-not (Test-Command "npm")) {
        $missingDeps += "npm"
    }
    
    if (-not (Test-Command "npx")) {
        $missingDeps += "npx"
    }
    
    if ($missingDeps.Count -gt 0) {
        Write-Error "Dependencias faltantes: $($missingDeps -join ', ')"
        exit 1
    }
    
    Write-Success "Todas las dependencias están instaladas"
}

# Función para instalar dependencias si es necesario
function Install-Dependencies {
    Write-Status "Verificando si las dependencias están instaladas..."
    
    if (-not (Test-Path "node_modules")) {
        Write-Status "Instalando dependencias..."
        npm install
        Write-Success "Dependencias instaladas"
    }
    else {
        Write-Success "Dependencias ya están instaladas"
    }
}

# Función para generar cliente de Prisma
function Invoke-PrismaClientGeneration {
    Write-Status "Generando cliente de Prisma..."
    npm run db:generate
    Write-Success "Cliente de Prisma generado"
}

# Función para ejecutar tests unitarios
function Invoke-UnitTests {
    Write-Status "Ejecutando tests unitarios..."
    
    try {
        npm run test:unit
        Write-Success "Tests unitarios completados exitosamente"
        return $true
    }
    catch {
        Write-Error "Tests unitarios fallaron"
        return $false
    }
}

# Función para ejecutar tests de componentes
function Invoke-ComponentTests {
    Write-Status "Ejecutando tests de componentes..."
    
    try {
        npm run test:components
        Write-Success "Tests de componentes completados exitosamente"
        return $true
    }
    catch {
        Write-Error "Tests de componentes fallaron"
        return $false
    }
}

# Función para ejecutar tests de servicios
function Invoke-ServiceTests {
    Write-Status "Ejecutando tests de servicios..."
    
    try {
        npm run test:services
        Write-Success "Tests de servicios completados exitosamente"
        return $true
    }
    catch {
        Write-Error "Tests de servicios fallaron"
        return $false
    }
}

# Función para ejecutar tests de integración
function Invoke-IntegrationTests {
    Write-Status "Ejecutando tests de integración..."
    
    try {
        npm run test:integration
        Write-Success "Tests de integración completados exitosamente"
        return $true
    }
    catch {
        Write-Error "Tests de integración fallaron"
        return $false
    }
}

# Función para ejecutar tests E2E
function Invoke-E2ETests {
    Write-Status "Ejecutando tests E2E..."
    
    # Verificar si Playwright está instalado
    if (-not (Test-Command "npx")) {
        Write-Error "npx no está disponible"
        return $false
    }
    
    # Instalar navegadores de Playwright si es necesario
    if (-not (Test-Path "node_modules\.cache\playwright")) {
        Write-Status "Instalando navegadores de Playwright..."
        npx playwright install --with-deps
    }
    
    try {
        npm run test:e2e
        Write-Success "Tests E2E completados exitosamente"
        return $true
    }
    catch {
        Write-Error "Tests E2E fallaron"
        return $false
    }
}

# Función para ejecutar tests de accesibilidad
function Invoke-AccessibilityTests {
    Write-Status "Ejecutando tests de accesibilidad..."
    
    try {
        npm run test:a11y:ci
        Write-Success "Tests de accesibilidad completados exitosamente"
        return $true
    }
    catch {
        Write-Error "Tests de accesibilidad fallaron"
        return $false
    }
}

# Función para ejecutar tests de performance
function Invoke-PerformanceTests {
    Write-Status "Ejecutando tests de performance..."
    
    # Verificar si Lighthouse está disponible
    if (-not (Test-Command "lighthouse")) {
        Write-Warning "Lighthouse no está instalado. Instalando..."
        npm install -g lighthouse
    }
    
    try {
        npm run test:performance:lighthouse
        Write-Success "Tests de performance completados exitosamente"
        return $true
    }
    catch {
        Write-Error "Tests de performance fallaron"
        return $false
    }
}

# Función para ejecutar tests de seguridad
function Invoke-SecurityTests {
    Write-Status "Ejecutando tests de seguridad..."
    
    try {
        npm run test:security:owasp
        Write-Success "Tests de seguridad completados exitosamente"
        return $true
    }
    catch {
        Write-Error "Tests de seguridad fallaron"
        return $false
    }
}

# Función para ejecutar validaciones
function Invoke-Validations {
    Write-Status "Ejecutando validaciones..."
    
    try {
        npm run test:validate
        Write-Success "Validaciones completadas exitosamente"
        return $true
    }
    catch {
        Write-Error "Validaciones fallaron"
        return $false
    }
}

# Función para generar reporte de cobertura
function Invoke-CoverageReportGeneration {
    Write-Status "Generando reporte de cobertura..."
    
    try {
        npm run test:coverage
        Write-Success "Reporte de cobertura generado"
        
        # Abrir reporte en navegador
        if (Test-Path "coverage\lcov-report\index.html") {
            Start-Process "coverage\lcov-report\index.html"
        }
        return $true
    }
    catch {
        Write-Error "Error generando reporte de cobertura"
        return $false
    }
}

# Función para mostrar resumen
function Show-Summary {
    param([int]$ExitCode)
    
    Write-Host ""
    Write-Host "=========================================="
    Write-Host "           RESUMEN DE TESTS"
    Write-Host "=========================================="
    Write-Host ""
    
    if ($ExitCode -eq 0) {
        Write-Success "Todos los tests pasaron exitosamente!"
    }
    else {
        Write-Error "Algunos tests fallaron. Revisa los logs arriba."
    }
    
    Write-Host ""
    Write-Host "Reportes generados:"
    Write-Host "- Cobertura: coverage\lcov-report\index.html"
    Write-Host "- E2E: test-results\"
    Write-Host "- Performance: lighthouse-report.json"
    Write-Host ""
}

# Función principal
function Main {
    $exitCode = 0
    $startTime = Get-Date
    
    Write-Host "=========================================="
    Write-Host "    LLUMINATA - TEST SUITE"
    Write-Host "=========================================="
    Write-Host ""
    
    # Verificar dependencias
    Test-Dependencies
    
    # Instalar dependencias si es necesario
    Install-Dependencies
    
    # Generar cliente de Prisma
    Invoke-PrismaClientGeneration
    
    # Ejecutar validaciones primero
    if (-not (Invoke-Validations)) {
        $exitCode = 1
    }
    
    # Ejecutar tests unitarios
    if (-not (Invoke-UnitTests)) {
        $exitCode = 1
    }
    
    # Ejecutar tests de componentes
    if (-not (Invoke-ComponentTests)) {
        $exitCode = 1
    }
    
    # Ejecutar tests de servicios
    if (-not (Invoke-ServiceTests)) {
        $exitCode = 1
    }
    
    # Ejecutar tests de integración
    if (-not (Invoke-IntegrationTests)) {
        $exitCode = 1
    }
    
    # Ejecutar tests E2E
    if (-not (Invoke-E2ETests)) {
        $exitCode = 1
    }
    
    # Ejecutar tests de accesibilidad
    if (-not (Invoke-AccessibilityTests)) {
        $exitCode = 1
    }
    
    # Ejecutar tests de performance
    if (-not (Invoke-PerformanceTests)) {
        $exitCode = 1
    }
    
    # Ejecutar tests de seguridad
    if (-not (Invoke-SecurityTests)) {
        $exitCode = 1
    }
    
    # Generar reporte de cobertura
    if (-not (Invoke-CoverageReportGeneration)) {
        $exitCode = 1
    }
    
    # Calcular tiempo total
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host ""
    Write-Status "Tiempo total de ejecución: $([math]::Round($duration, 2)) segundos"
    
    # Mostrar resumen
    Show-Summary $exitCode
    
    exit $exitCode
}

# Función para mostrar ayuda
function Show-Help {
    Write-Host "Uso: .\run-tests.ps1 [OPCIÓN]"
    Write-Host ""
    Write-Host "Opciones:"
    Write-Host "  -help         Mostrar esta ayuda"
    Write-Host "  unit          Ejecutar solo tests unitarios"
    Write-Host "  components    Ejecutar solo tests de componentes"
    Write-Host "  services      Ejecutar solo tests de servicios"
    Write-Host "  integration   Ejecutar solo tests de integración"
    Write-Host "  e2e           Ejecutar solo tests E2E"
    Write-Host "  accessibility Ejecutar solo tests de accesibilidad"
    Write-Host "  performance   Ejecutar solo tests de performance"
    Write-Host "  security      Ejecutar solo tests de seguridad"
    Write-Host "  validate      Ejecutar solo validaciones"
    Write-Host "  quick         Ejecutar tests rápidos (unit + components + validate)"
    Write-Host "  all           Ejecutar todos los tests (por defecto)"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\run-tests.ps1              # Ejecutar todos los tests"
    Write-Host "  .\run-tests.ps1 quick        # Ejecutar tests rápidos"
    Write-Host "  .\run-tests.ps1 unit         # Solo tests unitarios"
    Write-Host "  .\run-tests.ps1 e2e          # Solo tests E2E"
}

# Procesar argumentos
switch ($Option.ToLower()) {
    "help" {
        Show-Help
        exit 0
    }
    "unit" {
        Test-Dependencies
        Install-Dependencies
        Invoke-PrismaClientGeneration
        Invoke-UnitTests
    }
    "components" {
        Test-Dependencies
        Install-Dependencies
        Invoke-PrismaClientGeneration
        Invoke-ComponentTests
    }
    "services" {
        Test-Dependencies
        Install-Dependencies
        Invoke-PrismaClientGeneration
        Invoke-ServiceTests
    }
    "integration" {
        Test-Dependencies
        Install-Dependencies
        Invoke-PrismaClientGeneration
        Invoke-IntegrationTests
    }
    "e2e" {
        Test-Dependencies
        Install-Dependencies
        Invoke-PrismaClientGeneration
        Invoke-E2ETests
    }
    "accessibility" {
        Test-Dependencies
        Install-Dependencies
        Invoke-PrismaClientGeneration
        Invoke-AccessibilityTests
    }
    "performance" {
        Test-Dependencies
        Install-Dependencies
        Invoke-PrismaClientGeneration
        Invoke-PerformanceTests
    }
    "security" {
        Test-Dependencies
        Install-Dependencies
        Invoke-PrismaClientGeneration
        Invoke-SecurityTests
    }
    "validate" {
        Test-Dependencies
        Install-Dependencies
        Invoke-PrismaClientGeneration
        Invoke-Validations
    }
    "quick" {
        Test-Dependencies
        Install-Dependencies
        Invoke-PrismaClientGeneration
        if (Invoke-Validations -and Invoke-UnitTests -and Invoke-ComponentTests) {
            Write-Success "Tests rápidos completados exitosamente"
        }
        else {
            Write-Error "Algunos tests rápidos fallaron"
            exit 1
        }
    }
    "all" {
        Main
    }
    default {
        Write-Error "Opción desconocida: $Option"
        Show-Help
        exit 1
    }
}
