#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

interface ProductionMigrationConfig {
  environment: string
  backupBeforeMigration: boolean
  validateAfterMigration: boolean
  rollbackOnError: boolean
  maxRetries: number
}

const config: ProductionMigrationConfig = {
  environment: process.env.NODE_ENV || 'production',
  backupBeforeMigration: true,
  validateAfterMigration: true,
  rollbackOnError: true,
  maxRetries: 3
}

// Función para crear backup de producción
async function createProductionBackup() {
  console.log('🔄 Creando backup de producción...')
  
  const backupDir = './backups/production'
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true })
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = `production-backup-${timestamp}.sql`
  const backupPath = join(backupDir, backupFile)
  
  try {
    // Crear backup usando pg_dump
    execSync(`pg_dump $DATABASE_URL > "${backupPath}"`, { stdio: 'inherit' })
    
    // Comprimir backup
    execSync(`gzip "${backupPath}"`, { stdio: 'inherit' })
    
    console.log(`✅ Backup de producción creado: ${backupPath}.gz`)
    return `${backupPath}.gz`
  } catch (error) {
    console.error('❌ Error al crear backup de producción:', error)
    throw error
  }
}

// Función para verificar estado de la base de datos
async function checkDatabaseHealth() {
  console.log('🔍 Verificando salud de la base de datos...')
  
  try {
    // Verificar conexión
    await prisma.$connect()
    
    // Verificar tablas críticas
    const criticalTables = ['User', 'Student', 'Lesson', 'Assessment']
    const healthChecks = []
    
    for (const table of criticalTables) {
      try {
        const count = await (prisma as any)[table.toLowerCase()].count()
        healthChecks.push({ table, status: 'OK', count })
      } catch (error) {
        healthChecks.push({ table, status: 'ERROR', error: error.message })
      }
    }
    
    // Verificar conexiones activas
    const activeConnections = await prisma.$queryRaw`
      SELECT count(*) as active_connections 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `
    
    console.log('✅ Verificación de salud completada:')
    healthChecks.forEach(check => {
      console.log(`   ${check.table}: ${check.status} ${check.count ? `(${check.count} registros)` : ''}`)
    })
    
    return healthChecks.every(check => check.status === 'OK')
  } catch (error) {
    console.error('❌ Error en verificación de salud:', error)
    return false
  }
}

// Función para ejecutar migración de producción
async function executeProductionMigration() {
  console.log('🚀 Ejecutando migración de producción...')
  
  try {
    // 1. Generar migración
    console.log('📝 Generando migración...')
    execSync('npx prisma migrate dev --name production-migration --create-only', { stdio: 'inherit' })
    
    // 2. Aplicar migración
    console.log('🔧 Aplicando migración...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    
    // 3. Generar cliente
    console.log('⚙️ Generando cliente Prisma...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    console.log('✅ Migración de producción completada')
    return true
  } catch (error) {
    console.error('❌ Error en migración de producción:', error)
    return false
  }
}

// Función para validar migración
async function validateMigration() {
  console.log('🔍 Validando migración...')
  
  try {
    // Verificar que todas las tablas existen
    const expectedTables = [
      'Student', 'SpecialNeed', 'Lesson', 'CompletedLesson', 
      'Assessment', 'Teacher', 'Family', 'FamilyEngagement',
      'Achievement', 'WeeklyGoal', 'TeacherContent', 'SyncLog',
      'Account', 'Session', 'User', 'VerificationToken'
    ]
    
    const validationResults = []
    
    for (const table of expectedTables) {
      try {
        const count = await (prisma as any)[table.toLowerCase()].count()
        validationResults.push({ table, status: 'OK', count })
      } catch (error) {
        validationResults.push({ table, status: 'ERROR', error: error.message })
      }
    }
    
    // Verificar índices críticos
    const indexCheck = await prisma.$queryRaw`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
    `
    
    console.log('✅ Validación completada:')
    validationResults.forEach(result => {
      console.log(`   ${result.table}: ${result.status} ${result.count ? `(${result.count} registros)` : ''}`)
    })
    
    console.log(`   Índices encontrados: ${indexCheck.length}`)
    
    return validationResults.every(result => result.status === 'OK')
  } catch (error) {
    console.error('❌ Error en validación:', error)
    return false
  }
}

// Función para rollback
async function rollbackMigration(backupPath: string) {
  console.log('🔄 Ejecutando rollback...')
  
  try {
    // Restaurar desde backup
    console.log('📦 Restaurando desde backup...')
    execSync(`gunzip -c "${backupPath}" | psql $DATABASE_URL`, { stdio: 'inherit' })
    
    console.log('✅ Rollback completado exitosamente')
    return true
  } catch (error) {
    console.error('❌ Error en rollback:', error)
    return false
  }
}

// Función para generar reporte de migración
function generateMigrationReport(success: boolean, backupPath?: string, errors?: string[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const reportFile = `./backups/production/migration-report-${timestamp}.txt`
  
  const report = `
=== REPORTE DE MIGRACIÓN DE PRODUCCIÓN ===
Fecha: ${new Date().toISOString()}
Entorno: ${config.environment}
Estado: ${success ? 'EXITOSO' : 'FALLIDO'}
Backup: ${backupPath || 'No creado'}

=== CONFIGURACIÓN ===
Backup antes de migración: ${config.backupBeforeMigration}
Validación después de migración: ${config.validateAfterMigration}
Rollback en error: ${config.rollbackOnError}
Máximo de reintentos: ${config.maxRetries}

${errors && errors.length > 0 ? `
=== ERRORES ===
${errors.join('\n')}
` : ''}

=== PRÓXIMOS PASOS ===
${success ? `
1. Verificar funcionalidad de la aplicación
2. Monitorear logs de errores
3. Verificar rendimiento de consultas
4. Actualizar documentación
` : `
1. Revisar logs de error
2. Corregir problemas identificados
3. Reintentar migración
4. Contactar al equipo de desarrollo si persisten los problemas
`}
`
  
  try {
    writeFileSync(reportFile, report)
    console.log(`📋 Reporte generado: ${reportFile}`)
  } catch (error) {
    console.error('❌ Error al generar reporte:', error)
  }
}

// Función principal de migración de producción
async function main() {
  console.log('🚀 === MIGRACIÓN DE PRODUCCIÓN ===')
  console.log(`Entorno: ${config.environment}`)
  
  let backupPath: string | undefined
  const errors: string[] = []
  
  try {
    // 1. Verificar salud inicial
    console.log('\n1️⃣ Verificando salud inicial de la base de datos...')
    const initialHealth = await checkDatabaseHealth()
    if (!initialHealth) {
      throw new Error('La base de datos no está en un estado saludable')
    }
    
    // 2. Crear backup si está habilitado
    if (config.backupBeforeMigration) {
      console.log('\n2️⃣ Creando backup de producción...')
      backupPath = await createProductionBackup()
    }
    
    // 3. Ejecutar migración con reintentos
    console.log('\n3️⃣ Ejecutando migración...')
    let migrationSuccess = false
    let attempts = 0
    
    while (!migrationSuccess && attempts < config.maxRetries) {
      attempts++
      console.log(`   Intento ${attempts}/${config.maxRetries}`)
      
      migrationSuccess = await executeProductionMigration()
      
      if (!migrationSuccess && attempts < config.maxRetries) {
        console.log('   Esperando 30 segundos antes del reintento...')
        await new Promise(resolve => setTimeout(resolve, 30000))
      }
    }
    
    if (!migrationSuccess) {
      throw new Error(`Migración falló después de ${config.maxRetries} intentos`)
    }
    
    // 4. Validar migración si está habilitado
    if (config.validateAfterMigration) {
      console.log('\n4️⃣ Validando migración...')
      const validationSuccess = await validateMigration()
      if (!validationSuccess) {
        throw new Error('La validación de la migración falló')
      }
    }
    
    // 5. Verificar salud final
    console.log('\n5️⃣ Verificando salud final...')
    const finalHealth = await checkDatabaseHealth()
    if (!finalHealth) {
      throw new Error('La base de datos no está saludable después de la migración')
    }
    
    console.log('\n🎉 === MIGRACIÓN DE PRODUCCIÓN COMPLETADA EXITOSAMENTE ===')
    generateMigrationReport(true, backupPath)
    
  } catch (error) {
    console.error('\n💥 === ERROR EN MIGRACIÓN DE PRODUCCIÓN ===')
    console.error(error.message)
    errors.push(error.message)
    
    // Rollback si está habilitado y hay backup
    if (config.rollbackOnError && backupPath) {
      console.log('\n🔄 Intentando rollback...')
      const rollbackSuccess = await rollbackMigration(backupPath)
      if (rollbackSuccess) {
        console.log('✅ Rollback completado exitosamente')
      } else {
        console.error('❌ Rollback falló - REQUIERE INTERVENCIÓN MANUAL')
        errors.push('Rollback falló - requiere intervención manual')
      }
    }
    
    generateMigrationReport(false, backupPath, errors)
    process.exit(1)
    
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
}

export { main as productionMigration }
