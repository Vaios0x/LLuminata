const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  console.log('🔧 Configurando base de datos...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./dev.db'
      }
    }
  });

  try {
    // Crear la base de datos
    await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
    console.log('✅ Base de datos configurada correctamente');
    
    // Verificar que las tablas se crearon
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
    console.log('📋 Tablas creadas:', tables.map(t => t.name));
    
  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
