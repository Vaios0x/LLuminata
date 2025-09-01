#!/usr/bin/env node

/**
 * Script para optimización automática de imágenes
 * Optimiza imágenes en formatos WebP, AVIF y comprime JPEG/PNG
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración
const CONFIG = {
  inputDir: 'public/images',
  outputDir: 'public/images/optimized',
  formats: ['webp', 'avif'],
  quality: {
    webp: 85,
    avif: 80,
    jpeg: 85,
    png: 9,
  },
  sizes: [
    { width: 640, suffix: 'sm' },
    { width: 1024, suffix: 'md' },
    { width: 1920, suffix: 'lg' },
    { width: 3840, suffix: 'xl' },
  ],
  maxFileSize: 500 * 1024, // 500KB
};

// Verificar dependencias
function checkDependencies() {
  const dependencies = ['sharp', 'imagemin', 'imagemin-webp', 'imagemin-avif'];
  
  for (const dep of dependencies) {
    try {
      require.resolve(dep);
    } catch (error) {
      console.error(`❌ Dependencia faltante: ${dep}`);
      console.log(`Instala con: npm install --save-dev ${dep}`);
      process.exit(1);
    }
  }
  
  console.log('✅ Todas las dependencias están instaladas');
}

// Crear directorios si no existen
function ensureDirectories() {
  const dirs = [CONFIG.outputDir];
  
  for (const format of CONFIG.formats) {
    dirs.push(path.join(CONFIG.outputDir, format));
  }
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Creado directorio: ${dir}`);
    }
  }
}

// Obtener todas las imágenes del directorio
function getImageFiles(dir) {
  const files = [];
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

// Optimizar imagen individual
async function optimizeImage(inputPath, outputPath, format, quality) {
  const sharp = require('sharp');
  
  try {
    const image = sharp(inputPath);
    
    switch (format) {
      case 'webp':
        await image
          .webp({ quality })
          .toFile(outputPath);
        break;
      case 'avif':
        await image
          .avif({ quality })
          .toFile(outputPath);
        break;
      case 'jpeg':
        await image
          .jpeg({ quality })
          .toFile(outputPath);
        break;
      case 'png':
        await image
          .png({ compressionLevel: quality })
          .toFile(outputPath);
        break;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error optimizando ${inputPath}:`, error.message);
    return false;
  }
}

// Generar múltiples tamaños
async function generateSizes(inputPath, baseName, format, quality) {
  const sharp = require('sharp');
  const results = [];
  
  for (const size of CONFIG.sizes) {
    const outputName = `${baseName}-${size.suffix}.${format}`;
    const outputPath = path.join(CONFIG.outputDir, format, outputName);
    
    try {
      await sharp(inputPath)
        .resize(size.width, null, { withoutEnlargement: true })
        .toFormat(format, { quality })
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      results.push({
        path: outputPath,
        size: stats.size,
        width: size.width,
        suffix: size.suffix,
      });
      
      console.log(`✅ Generado: ${outputName} (${(stats.size / 1024).toFixed(1)}KB)`);
    } catch (error) {
      console.error(`❌ Error generando ${outputName}:`, error.message);
    }
  }
  
  return results;
}

// Comprimir imagen original
async function compressOriginal(inputPath) {
  const sharp = require('sharp');
  const ext = path.extname(inputPath).toLowerCase();
  const outputPath = inputPath.replace(ext, `-compressed${ext}`);
  
  try {
    let image = sharp(inputPath);
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        await image
          .jpeg({ quality: CONFIG.quality.jpeg })
          .toFile(outputPath);
        break;
      case '.png':
        await image
          .png({ compressionLevel: CONFIG.quality.png })
          .toFile(outputPath);
        break;
      default:
        return null;
    }
    
    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ Comprimido: ${path.basename(inputPath)} (${savings}% reducción)`);
    
    return {
      original: originalSize,
      compressed: compressedSize,
      savings: parseFloat(savings),
    };
  } catch (error) {
    console.error(`❌ Error comprimiendo ${inputPath}:`, error.message);
    return null;
  }
}

// Generar archivo de manifiesto
function generateManifest(optimizedImages) {
  const manifest = {
    generated: new Date().toISOString(),
    totalImages: optimizedImages.length,
    formats: CONFIG.formats,
    sizes: CONFIG.sizes,
    images: optimizedImages.map(img => ({
      original: img.original,
      optimized: img.optimized,
      savings: img.savings,
      formats: img.formats,
    })),
  };
  
  const manifestPath = path.join(CONFIG.outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`📄 Manifesto generado: ${manifestPath}`);
}

// Función principal
async function main() {
  console.log('🚀 Iniciando optimización de imágenes...\n');
  
  // Verificar dependencias
  checkDependencies();
  
  // Crear directorios
  ensureDirectories();
  
  // Obtener imágenes
  const imageFiles = getImageFiles(CONFIG.inputDir);
  
  if (imageFiles.length === 0) {
    console.log('❌ No se encontraron imágenes para optimizar');
    return;
  }
  
  console.log(`📸 Encontradas ${imageFiles.length} imágenes para optimizar\n`);
  
  const optimizedImages = [];
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  
  for (const imagePath of imageFiles) {
    const fileName = path.basename(imagePath, path.extname(imagePath));
    const ext = path.extname(imagePath).toLowerCase();
    
    console.log(`🔄 Procesando: ${path.basename(imagePath)}`);
    
    const originalStats = fs.statSync(imagePath);
    totalOriginalSize += originalStats.size;
    
    const imageResult = {
      original: imagePath,
      optimized: [],
      savings: 0,
      formats: [],
    };
    
    // Comprimir original
    const compressed = await compressOriginal(imagePath);
    if (compressed) {
      imageResult.savings = compressed.savings;
    }
    
    // Generar formatos optimizados
    for (const format of CONFIG.formats) {
      const formatDir = path.join(CONFIG.outputDir, format);
      const outputPath = path.join(formatDir, `${fileName}.${format}`);
      
      const success = await optimizeImage(
        imagePath,
        outputPath,
        format,
        CONFIG.quality[format]
      );
      
      if (success) {
        const stats = fs.statSync(outputPath);
        totalOptimizedSize += stats.size;
        
        imageResult.optimized.push({
          path: outputPath,
          format,
          size: stats.size,
        });
        
        imageResult.formats.push(format);
        
        // Generar múltiples tamaños
        await generateSizes(imagePath, fileName, format, CONFIG.quality[format]);
      }
    }
    
    optimizedImages.push(imageResult);
    console.log('');
  }
  
  // Generar estadísticas
  const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
  
  console.log('📊 Estadísticas de optimización:');
  console.log(`   Imágenes procesadas: ${optimizedImages.length}`);
  console.log(`   Tamaño original: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Tamaño optimizado: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Ahorro total: ${totalSavings}%`);
  console.log(`   Formatos generados: ${CONFIG.formats.join(', ')}`);
  
  // Generar manifiesto
  generateManifest(optimizedImages);
  
  console.log('\n✅ Optimización completada exitosamente!');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  optimizeImage,
  generateSizes,
  compressOriginal,
  CONFIG,
};
