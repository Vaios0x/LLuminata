#!/bin/bash

# Script para ejecutar todos los tests del proyecto LLuminata
# Autor: AI Assistant
# Fecha: $(date)

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para verificar dependencias
check_dependencies() {
    print_status "Verificando dependencias..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("node")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists npx; then
        missing_deps+=("npx")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Dependencias faltantes: ${missing_deps[*]}"
        exit 1
    fi
    
    print_success "Todas las dependencias están instaladas"
}

# Función para instalar dependencias si es necesario
install_dependencies() {
    print_status "Verificando si las dependencias están instaladas..."
    
    if [ ! -d "node_modules" ]; then
        print_status "Instalando dependencias..."
        npm install
        print_success "Dependencias instaladas"
    else
        print_success "Dependencias ya están instaladas"
    fi
}

# Función para generar cliente de Prisma
generate_prisma_client() {
    print_status "Generando cliente de Prisma..."
    npm run db:generate
    print_success "Cliente de Prisma generado"
}

# Función para ejecutar tests unitarios
run_unit_tests() {
    print_status "Ejecutando tests unitarios..."
    
    if npm run test:unit; then
        print_success "Tests unitarios completados exitosamente"
    else
        print_error "Tests unitarios fallaron"
        return 1
    fi
}

# Función para ejecutar tests de componentes
run_component_tests() {
    print_status "Ejecutando tests de componentes..."
    
    if npm run test:components; then
        print_success "Tests de componentes completados exitosamente"
    else
        print_error "Tests de componentes fallaron"
        return 1
    fi
}

# Función para ejecutar tests de servicios
run_service_tests() {
    print_status "Ejecutando tests de servicios..."
    
    if npm run test:services; then
        print_success "Tests de servicios completados exitosamente"
    else
        print_error "Tests de servicios fallaron"
        return 1
    fi
}

# Función para ejecutar tests de integración
run_integration_tests() {
    print_status "Ejecutando tests de integración..."
    
    if npm run test:integration; then
        print_success "Tests de integración completados exitosamente"
    else
        print_error "Tests de integración fallaron"
        return 1
    fi
}

# Función para ejecutar tests E2E
run_e2e_tests() {
    print_status "Ejecutando tests E2E..."
    
    # Verificar si Playwright está instalado
    if ! command_exists npx; then
        print_error "npx no está disponible"
        return 1
    fi
    
    # Instalar navegadores de Playwright si es necesario
    if [ ! -d "node_modules/.cache/playwright" ]; then
        print_status "Instalando navegadores de Playwright..."
        npx playwright install --with-deps
    fi
    
    if npm run test:e2e; then
        print_success "Tests E2E completados exitosamente"
    else
        print_error "Tests E2E fallaron"
        return 1
    fi
}

# Función para ejecutar tests de accesibilidad
run_accessibility_tests() {
    print_status "Ejecutando tests de accesibilidad..."
    
    if npm run test:a11y:ci; then
        print_success "Tests de accesibilidad completados exitosamente"
    else
        print_error "Tests de accesibilidad fallaron"
        return 1
    fi
}

# Función para ejecutar tests de performance
run_performance_tests() {
    print_status "Ejecutando tests de performance..."
    
    # Verificar si Lighthouse está disponible
    if ! command_exists lighthouse; then
        print_warning "Lighthouse no está instalado. Instalando..."
        npm install -g lighthouse
    fi
    
    if npm run test:performance:lighthouse; then
        print_success "Tests de performance completados exitosamente"
    else
        print_error "Tests de performance fallaron"
        return 1
    fi
}

# Función para ejecutar tests de seguridad
run_security_tests() {
    print_status "Ejecutando tests de seguridad..."
    
    if npm run test:security:owasp; then
        print_success "Tests de seguridad completados exitosamente"
    else
        print_error "Tests de seguridad fallaron"
        return 1
    fi
}

# Función para ejecutar validaciones
run_validations() {
    print_status "Ejecutando validaciones..."
    
    if npm run test:validate; then
        print_success "Validaciones completadas exitosamente"
    else
        print_error "Validaciones fallaron"
        return 1
    fi
}

# Función para generar reporte de cobertura
generate_coverage_report() {
    print_status "Generando reporte de cobertura..."
    
    if npm run test:coverage; then
        print_success "Reporte de cobertura generado"
        
        # Abrir reporte en navegador si es posible
        if command_exists open; then
            open coverage/lcov-report/index.html
        elif command_exists xdg-open; then
            xdg-open coverage/lcov-report/index.html
        fi
    else
        print_error "Error generando reporte de cobertura"
        return 1
    fi
}

# Función para mostrar resumen
show_summary() {
    echo ""
    echo "=========================================="
    echo "           RESUMEN DE TESTS"
    echo "=========================================="
    echo ""
    
    if [ $1 -eq 0 ]; then
        print_success "Todos los tests pasaron exitosamente!"
    else
        print_error "Algunos tests fallaron. Revisa los logs arriba."
    fi
    
    echo ""
    echo "Reportes generados:"
    echo "- Cobertura: coverage/lcov-report/index.html"
    echo "- E2E: test-results/"
    echo "- Performance: lighthouse-report.json"
    echo ""
}

# Función principal
main() {
    local exit_code=0
    local start_time=$(date +%s)
    
    echo "=========================================="
    echo "    LLUMINATA - TEST SUITE"
    echo "=========================================="
    echo ""
    
    # Verificar dependencias
    check_dependencies
    
    # Instalar dependencias si es necesario
    install_dependencies
    
    # Generar cliente de Prisma
    generate_prisma_client
    
    # Ejecutar validaciones primero
    if ! run_validations; then
        exit_code=1
    fi
    
    # Ejecutar tests unitarios
    if ! run_unit_tests; then
        exit_code=1
    fi
    
    # Ejecutar tests de componentes
    if ! run_component_tests; then
        exit_code=1
    fi
    
    # Ejecutar tests de servicios
    if ! run_service_tests; then
        exit_code=1
    fi
    
    # Ejecutar tests de integración
    if ! run_integration_tests; then
        exit_code=1
    fi
    
    # Ejecutar tests E2E
    if ! run_e2e_tests; then
        exit_code=1
    fi
    
    # Ejecutar tests de accesibilidad
    if ! run_accessibility_tests; then
        exit_code=1
    fi
    
    # Ejecutar tests de performance
    if ! run_performance_tests; then
        exit_code=1
    fi
    
    # Ejecutar tests de seguridad
    if ! run_security_tests; then
        exit_code=1
    fi
    
    # Generar reporte de cobertura
    if ! generate_coverage_report; then
        exit_code=1
    fi
    
    # Calcular tiempo total
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    print_status "Tiempo total de ejecución: ${duration} segundos"
    
    # Mostrar resumen
    show_summary $exit_code
    
    exit $exit_code
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help     Mostrar esta ayuda"
    echo "  -u, --unit     Ejecutar solo tests unitarios"
    echo "  -c, --components Ejecutar solo tests de componentes"
    echo "  -s, --services Ejecutar solo tests de servicios"
    echo "  -i, --integration Ejecutar solo tests de integración"
    echo "  -e, --e2e      Ejecutar solo tests E2E"
    echo "  -a, --accessibility Ejecutar solo tests de accesibilidad"
    echo "  -p, --performance Ejecutar solo tests de performance"
    echo "  -sec, --security Ejecutar solo tests de seguridad"
    echo "  -v, --validate Ejecutar solo validaciones"
    echo "  -q, --quick    Ejecutar tests rápidos (unit + components + validate)"
    echo "  --all          Ejecutar todos los tests (por defecto)"
    echo ""
    echo "Ejemplos:"
    echo "  $0              # Ejecutar todos los tests"
    echo "  $0 --quick      # Ejecutar tests rápidos"
    echo "  $0 --unit       # Solo tests unitarios"
    echo "  $0 --e2e        # Solo tests E2E"
}

# Procesar argumentos de línea de comandos
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -u|--unit)
        check_dependencies
        install_dependencies
        generate_prisma_client
        run_unit_tests
        ;;
    -c|--components)
        check_dependencies
        install_dependencies
        generate_prisma_client
        run_component_tests
        ;;
    -s|--services)
        check_dependencies
        install_dependencies
        generate_prisma_client
        run_service_tests
        ;;
    -i|--integration)
        check_dependencies
        install_dependencies
        generate_prisma_client
        run_integration_tests
        ;;
    -e|--e2e)
        check_dependencies
        install_dependencies
        generate_prisma_client
        run_e2e_tests
        ;;
    -a|--accessibility)
        check_dependencies
        install_dependencies
        generate_prisma_client
        run_accessibility_tests
        ;;
    -p|--performance)
        check_dependencies
        install_dependencies
        generate_prisma_client
        run_performance_tests
        ;;
    -sec|--security)
        check_dependencies
        install_dependencies
        generate_prisma_client
        run_security_tests
        ;;
    -v|--validate)
        check_dependencies
        install_dependencies
        generate_prisma_client
        run_validations
        ;;
    -q|--quick)
        check_dependencies
        install_dependencies
        generate_prisma_client
        run_validations && run_unit_tests && run_component_tests
        ;;
    --all|"")
        main
        ;;
    *)
        print_error "Opción desconocida: $1"
        show_help
        exit 1
        ;;
esac
