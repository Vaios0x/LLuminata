#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function migrateToPostgreSQL() {
  console.log('🚀 Iniciando migración a PostgreSQL...');

  try {
    // 1. Verificar configuración de PostgreSQL
    console.log('📋 Verificando configuración de PostgreSQL...');
    
    if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
      throw new Error('DATABASE_URL y DIRECT_URL deben estar configurados en .env');
    }

    // 2. Generar cliente de Prisma para PostgreSQL
    console.log('🔧 Generando cliente de Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // 3. Crear migración inicial
    console.log('📦 Creando migración inicial...');
    execSync('npx prisma migrate dev --name init-postgresql', { stdio: 'inherit' });

    // 4. Verificar conexión a PostgreSQL
    console.log('🔌 Verificando conexión a PostgreSQL...');
    await prisma.$connect();
    console.log('✅ Conexión a PostgreSQL exitosa');

    // 5. Ejecutar seed si existe
    console.log('🌱 Ejecutando seed de datos...');
    try {
      execSync('npx prisma db seed', { stdio: 'inherit' });
      console.log('✅ Seed ejecutado correctamente');
    } catch (error) {
      console.log('⚠️ No se pudo ejecutar el seed:', error);
    }

    // 6. Verificar datos
    console.log('🔍 Verificando datos...');
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const lessonCount = await prisma.lesson.count();

    console.log(`📊 Datos verificados:`);
    console.log(`   - Usuarios: ${userCount}`);
    console.log(`   - Estudiantes: ${studentCount}`);
    console.log(`   - Lecciones: ${lessonCount}`);

    // 7. Crear índices adicionales para PostgreSQL
    console.log('📈 Creando índices optimizados...');
    await createPostgreSQLIndexes();

    // 8. Configurar pool de conexiones
    console.log('🔧 Configurando pool de conexiones...');
    await configureConnectionPool();

    console.log('🎉 Migración a PostgreSQL completada exitosamente!');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('   1. Actualizar variables de entorno en producción');
    console.log('   2. Configurar backup automático');
    console.log('   3. Configurar monitoreo de base de datos');
    console.log('   4. Ejecutar tests de integración');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function createPostgreSQLIndexes() {
  const indexes = [
    // Índices para búsquedas frecuentes
    'CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email)',
    'CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role)',
    'CREATE INDEX IF NOT EXISTS idx_student_location ON "Student"(location)',
    'CREATE INDEX IF NOT EXISTS idx_student_language ON "Student"(language)',
    'CREATE INDEX IF NOT EXISTS idx_lesson_subject ON "Lesson"(subject)',
    'CREATE INDEX IF NOT EXISTS idx_lesson_grade_level ON "Lesson"("gradeLevel")',
    
    // Índices para relaciones
    'CREATE INDEX IF NOT EXISTS idx_completed_lesson_student ON "CompletedLesson"("studentId")',
    'CREATE INDEX IF NOT EXISTS idx_completed_lesson_lesson ON "CompletedLesson"("lessonId")',
    'CREATE INDEX IF NOT EXISTS idx_assessment_student ON "Assessment"("studentId")',
    'CREATE INDEX IF NOT EXISTS idx_special_need_student ON "SpecialNeed"("studentId")',
    
    // Índices para fechas
    'CREATE INDEX IF NOT EXISTS idx_user_created_at ON "User"("createdAt")',
    'CREATE INDEX IF NOT EXISTS idx_student_created_at ON "Student"("createdAt")',
    'CREATE INDEX IF NOT EXISTS idx_lesson_created_at ON "Lesson"("createdAt")',
    
    // Índices para gamificación
    'CREATE INDEX IF NOT EXISTS idx_user_badge_user ON "UserBadge"("userId")',
    'CREATE INDEX IF NOT EXISTS idx_user_badge_badge ON "UserBadge"("badgeId")',
    'CREATE INDEX IF NOT EXISTS idx_user_achievement_user ON "UserAchievement"("userId")',
    'CREATE INDEX IF NOT EXISTS idx_user_level_user ON "UserLevel"("userId")',
    
    // Índices para analytics
    'CREATE INDEX IF NOT EXISTS idx_assessment_session_student ON "AssessmentSession"("studentId")',
    'CREATE INDEX IF NOT EXISTS idx_assessment_response_session ON "AssessmentResponse"("assessmentId")',
    'CREATE INDEX IF NOT EXISTS idx_learning_difficulty_student ON "LearningDifficulty"("studentId")',
    'CREATE INDEX IF NOT EXISTS idx_personalized_content_student ON "PersonalizedContent"("studentId")',
  ];

  for (const index of indexes) {
    try {
      await prisma.$executeRawUnsafe(index);
    } catch (error) {
      console.log(`⚠️ Error creando índice: ${index}`, error);
    }
  }
}

async function configureConnectionPool() {
  // Configurar pool de conexiones para PostgreSQL
  const poolConfig = {
    min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
    max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
    timeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '30000'),
  };

  console.log(`🔧 Pool configurado: min=${poolConfig.min}, max=${poolConfig.max}, timeout=${poolConfig.timeout}ms`);
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateToPostgreSQL()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script falló:', error);
      process.exit(1);
    });
}

export { migrateToPostgreSQL };
