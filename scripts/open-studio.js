const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Abriendo Prisma Studio...');

try {
  // Verificar que estamos en el directorio correcto
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  console.log(`📁 Esquema encontrado en: ${schemaPath}`);
  
  // Ejecutar Prisma Studio
  execSync('npx prisma studio', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
} catch (error) {
  console.error('❌ Error al abrir Prisma Studio:', error.message);
  console.log('💡 Intenta ejecutar manualmente: npx prisma studio');
}
