#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { offlineContentGenerator } from '../lib/offline-content-generator';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

interface GenerationConfig {
  cultures: string[];
  languages: string[];
  batchSize: number;
  outputDir: string;
}

async function main() {
  console.log('🚀 Iniciando generación de contenido offline...');
  
  const config: GenerationConfig = {
    cultures: ['maya', 'nahuatl', 'afrodescendiente'],
    languages: ['es-GT', 'maya', 'k\'iche\'', 'nahuatl'],
    batchSize: 5,
    outputDir: path.join(process.cwd(), 'public', 'offline-content')
  };

  try {
    // Crear directorio de salida
    await fs.mkdir(config.outputDir, { recursive: true });

    // Obtener todos los estudiantes
    const students = await prisma.student.findMany({
      include: {
        specialNeeds: true,
        teacher: true
      }
    });

    console.log(`📊 Encontrados ${students.length} estudiantes`);

    const results = {
      total: 0,
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Generar paquetes para cada combinación de estudiante, cultura e idioma
    for (const student of students) {
      for (const culture of config.cultures) {
        for (const language of config.languages) {
          results.total++;
          
          try {
            console.log(`\n🎯 Generando paquete para ${student.name} (${culture}/${language})`);
            
            const packageData = await offlineContentGenerator.generateStudentPackage(
              student.id,
              culture,
              language
            );

            // Guardar metadatos del paquete
            const metadataPath = path.join(config.outputDir, `${packageData.id}-metadata.json`);
            await fs.writeFile(metadataPath, JSON.stringify({
              id: packageData.id,
              studentId: packageData.studentId,
              studentName: student.name,
              culture: packageData.culture,
              language: packageData.language,
              size: packageData.size,
              lessons: packageData.metadata.totalLessons,
              resources: packageData.metadata.totalResources,
              createdAt: packageData.createdAt,
              expiresAt: packageData.expiresAt
            }, null, 2));

            results.success++;
            console.log(`✅ Paquete generado: ${packageData.id} (${(packageData.size / 1024 / 1024).toFixed(2)}MB)`);

          } catch (error) {
            results.failed++;
            const errorMsg = `Error generando paquete para ${student.name} (${culture}/${language}): ${error.message}`;
            results.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }

          // Pausa entre generaciones para no sobrecargar el sistema
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Generar reporte
    await generateReport(results, config);

    console.log('\n📋 Resumen de generación:');
    console.log(`   Total: ${results.total}`);
    console.log(`   Exitosos: ${results.success}`);
    console.log(`   Fallidos: ${results.failed}`);
    console.log(`   Tasa de éxito: ${((results.success / results.total) * 100).toFixed(1)}%`);

    if (results.errors.length > 0) {
      console.log('\n❌ Errores encontrados:');
      results.errors.forEach(error => console.log(`   - ${error}`));
    }

  } catch (error) {
    console.error('❌ Error durante la generación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await offlineContentGenerator.cleanup();
  }
}

async function generateReport(results: any, config: GenerationConfig) {
  const reportPath = path.join(config.outputDir, 'generation-report.json');
  
  const report = {
    generatedAt: new Date().toISOString(),
    config,
    results,
    summary: {
      totalPackages: results.total,
      successfulPackages: results.success,
      failedPackages: results.failed,
      successRate: ((results.success / results.total) * 100).toFixed(1) + '%',
      totalSize: await calculateTotalSize(config.outputDir)
    }
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Reporte guardado en: ${reportPath}`);
}

async function calculateTotalSize(dir: string): Promise<number> {
  try {
    const files = await fs.readdir(dir);
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  } catch (error) {
    console.warn('Error calculando tamaño total:', error);
    return 0;
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(console.error);
}
