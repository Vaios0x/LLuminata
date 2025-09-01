import { PrismaClient } from '@prisma/client'

// Configuración de pool de conexiones para PostgreSQL
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Configuración de pool de conexiones
  __internal: {
    engine: {
      connectionLimit: 20,
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
      },
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Función para verificar la conexión a la base de datos
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Conexión a PostgreSQL establecida correctamente')
    return true
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error)
    return false
  }
}

// Función para cerrar la conexión de manera segura
export async function closeDatabaseConnection() {
  try {
    await prisma.$disconnect()
    console.log('✅ Conexión a PostgreSQL cerrada correctamente')
  } catch (error) {
    console.error('❌ Error al cerrar conexión con PostgreSQL:', error)
  }
}

// Función para obtener estadísticas de la base de datos
export async function getDatabaseStats() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      ORDER BY tablename, attname
    `
    return stats
  } catch (error) {
    console.error('Error al obtener estadísticas de la base de datos:', error)
    return null
  }
}

// Función para limpiar conexiones inactivas
export async function cleanupInactiveConnections() {
  try {
    await prisma.$queryRaw`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = current_database()
      AND pid <> pg_backend_pid()
      AND state = 'idle'
      AND state_change < current_timestamp - INTERVAL '10 minutes'
    `
    console.log('✅ Conexiones inactivas limpiadas')
  } catch (error) {
    console.error('❌ Error al limpiar conexiones inactivas:', error)
  }
}

export default prisma
