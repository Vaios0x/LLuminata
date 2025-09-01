import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

export interface OfflinePackage {
  id: string;
  version: string;
  studentId: string;
  culture: string;
  language: string;
  lessons: OfflineLesson[];
  resources: OfflineResource[];
  metadata: PackageMetadata;
  size: number;
  checksum: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface OfflineLesson {
  id: string;
  title: string;
  description: string;
  content: any;
  culturalVariants: any;
  languageVersions: any;
  accessibilityFeatures: any;
  multimedia: OfflineMultimedia[];
  size: number;
  checksum: string;
}

export interface OfflineResource {
  id: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  localPath: string;
  size: number;
  optimizedSize: number;
  checksum: string;
  metadata: ResourceMetadata;
}

export interface OfflineMultimedia {
  type: 'image' | 'audio' | 'video';
  originalUrl: string;
  optimizedUrl: string;
  size: number;
  optimizedSize: number;
  format: string;
  quality: number;
}

export interface PackageMetadata {
  totalLessons: number;
  totalResources: number;
  totalSize: number;
  estimatedDownloadTime: number;
  compatibility: string[];
  requirements: {
    minStorage: number;
    minBandwidth: number;
    supportedDevices: string[];
  };
}

export interface ResourceMetadata {
  width?: number;
  height?: number;
  duration?: number;
  bitrate?: number;
  format: string;
  codec?: string;
}

export interface CulturalAdaptation {
  culture: string;
  language: string;
  adaptations: {
    examples: string[];
    context: string;
    values: string[];
    traditions: string[];
  };
}

export class OfflineContentGenerator {
  private readonly baseDir = path.join(process.cwd(), 'public', 'offline-content');
  private readonly tempDir = path.join(process.cwd(), 'temp');
  private readonly maxPackageSize = 500 * 1024 * 1024; // 500MB
  private readonly imageQuality = 80;
  private readonly audioBitrate = 64;
  private readonly videoBitrate = 500;

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    const dirs = [this.baseDir, this.tempDir];
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * Genera un paquete offline completo para un estudiante
   */
  async generateStudentPackage(
    studentId: string,
    culture: string = 'maya',
    language: string = 'es-GT'
  ): Promise<OfflinePackage> {
    console.log(`🎯 Generando paquete offline para estudiante ${studentId}`);

    // Obtener datos del estudiante
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        specialNeeds: true,
        teacher: true
      }
    });

    if (!student) {
      throw new Error(`Estudiante ${studentId} no encontrado`);
    }

    // Obtener lecciones adaptadas
    const lessons = await this.getAdaptedLessons(student, culture, language);
    
    // Generar recursos multimedia optimizados
    const resources = await this.generateOptimizedResources(lessons);
    
    // Crear paquete
    const packageId = this.generatePackageId(studentId, culture, language);
    const packagePath = path.join(this.baseDir, `${packageId}.json`);
    
    const offlinePackage: OfflinePackage = {
      id: packageId,
      version: '1.0.0',
      studentId,
      culture,
      language,
      lessons: await this.createOfflineLessons(lessons, resources),
      resources,
      metadata: this.generatePackageMetadata(lessons, resources),
      size: 0,
      checksum: '',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
    };

    // Calcular tamaño y checksum
    const packageData = JSON.stringify(offlinePackage, null, 2);
    offlinePackage.size = Buffer.byteLength(packageData, 'utf8');
    offlinePackage.checksum = this.calculateChecksum(packageData);

    // Guardar paquete
    await fs.writeFile(packagePath, packageData, 'utf8');

    // Actualizar base de datos
    await this.updateLessonOfflineInfo(lessons, packageId);

    console.log(`✅ Paquete generado: ${packageId} (${(offlinePackage.size / 1024 / 1024).toFixed(2)}MB)`);
    
    return offlinePackage;
  }

  /**
   * Obtiene lecciones adaptadas culturalmente para el estudiante
   */
  private async getAdaptedLessons(student: any, culture: string, language: string) {
    const lessons = await prisma.lesson.findMany({
      where: {
        gradeLevel: student.cognitiveLevel,
        difficulty: {
          gte: Math.max(1, student.readingLevel - 1),
          lte: Math.min(5, student.readingLevel + 1)
        }
      },
      orderBy: { difficulty: 'asc' }
    });

    // Adaptar contenido culturalmente
    const adaptedLessons = await Promise.all(
      lessons.map(lesson => this.adaptLessonForCulture(lesson, student, culture, language))
    );

    return adaptedLessons;
  }

  /**
   * Adapta una lección para una cultura específica
   */
  private async adaptLessonForCulture(lesson: any, student: any, culture: string, language: string) {
    const culturalVariants = lesson.culturalVariants as any;
    const languageVersions = lesson.languageVersions as any;

    // Obtener variante cultural
    const culturalVariant = culturalVariants[culture] || culturalVariants['default'] || {};
    const languageVersion = languageVersions[language] || languageVersions['es-GT'] || {};

    // Adaptar contenido base
    const adaptedContent = await this.adaptContent(
      lesson.baseContent,
      culturalVariant,
      student.specialNeeds
    );

    return {
      ...lesson,
      content: adaptedContent,
      culturalVariants: culturalVariant,
      languageVersions: languageVersion
    };
  }

  /**
   * Adapta el contenido según necesidades especiales y cultura
   */
  private async adaptContent(content: any, culturalVariant: any, specialNeeds: any[]) {
    const adaptedContent = { ...content };

    // Adaptar para dislexia
    if (specialNeeds.some(need => need.type === 'DYSLEXIA')) {
      adaptedContent.fontSize = 'large';
      adaptedContent.lineSpacing = 2.0;
      adaptedContent.colorScheme = 'high-contrast';
      adaptedContent.audioSupport = true;
    }

    // Adaptar para TDAH
    if (specialNeeds.some(need => need.type === 'ADHD')) {
      adaptedContent.breakDuration = 300; // 5 minutos
      adaptedContent.interactiveElements = true;
      adaptedContent.progressIndicators = true;
    }

    // Adaptar ejemplos culturales
    if (culturalVariant.examples) {
      adaptedContent.examples = culturalVariant.examples;
    }

    if (culturalVariant.context) {
      adaptedContent.context = culturalVariant.context;
    }

    return adaptedContent;
  }

  /**
   * Genera recursos multimedia optimizados
   */
  private async generateOptimizedResources(lessons: any[]): Promise<OfflineResource[]> {
    const resources: OfflineResource[] = [];
    const processedUrls = new Set<string>();

    for (const lesson of lessons) {
      const multimediaUrls = this.extractMultimediaUrls(lesson);
      
      for (const url of multimediaUrls) {
        if (processedUrls.has(url)) continue;
        processedUrls.add(url);

        try {
          const resource = await this.optimizeResource(url);
          if (resource) {
            resources.push(resource);
          }
        } catch (error) {
          console.warn(`⚠️ Error optimizando recurso ${url}:`, error);
        }
      }
    }

    return resources;
  }

  /**
   * Extrae URLs de recursos multimedia de una lección
   */
  private extractMultimediaUrls(lesson: any): string[] {
    const urls: string[] = [];
    
    const extractFromObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && this.isMultimediaUrl(value)) {
          urls.push(value);
        } else if (typeof value === 'object') {
          extractFromObject(value);
        }
      }
    };

    extractFromObject(lesson);
    return [...new Set(urls)];
  }

  /**
   * Verifica si una URL es un recurso multimedia
   */
  private isMultimediaUrl(url: string): boolean {
    const multimediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp3', '.wav', '.ogg', '.mp4', '.webm'];
    return multimediaExtensions.some(ext => url.toLowerCase().includes(ext));
  }

  /**
   * Optimiza un recurso multimedia
   */
  private async optimizeResource(url: string): Promise<OfflineResource | null> {
    const resourceId = this.generateResourceId(url);
    const localPath = path.join(this.baseDir, 'resources', resourceId);
    
    try {
      // Descargar recurso
      await this.downloadResource(url, localPath);
      
      // Determinar tipo y optimizar
      const resourceType = this.getResourceType(url);
      const optimizedPath = await this.optimizeByType(localPath, resourceType);
      
      // Obtener metadatos
      const metadata = await this.getResourceMetadata(optimizedPath, resourceType);
      
      // Calcular tamaños y checksum
      const originalSize = (await fs.stat(localPath)).size;
      const optimizedSize = (await fs.stat(optimizedPath)).size;
      const checksum = await this.calculateFileChecksum(optimizedPath);

      return {
        id: resourceId,
        type: resourceType,
        url,
        localPath: optimizedPath,
        size: originalSize,
        optimizedSize,
        checksum,
        metadata
      };
    } catch (error) {
      console.error(`Error optimizando recurso ${url}:`, error);
      return null;
    }
  }

  /**
   * Descarga un recurso
   */
  private async downloadResource(url: string, localPath: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error descargando ${url}: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    await fs.writeFile(localPath, Buffer.from(buffer));
  }

  /**
   * Determina el tipo de recurso
   */
  private getResourceType(url: string): 'image' | 'audio' | 'video' | 'document' {
    const urlLower = url.toLowerCase();
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => urlLower.includes(ext))) {
      return 'image';
    }
    
    if (['.mp3', '.wav', '.ogg', '.m4a'].some(ext => urlLower.includes(ext))) {
      return 'audio';
    }
    
    if (['.mp4', '.webm', '.avi', '.mov'].some(ext => urlLower.includes(ext))) {
      return 'video';
    }
    
    return 'document';
  }

  /**
   * Optimiza un recurso según su tipo
   */
  private async optimizeByType(filePath: string, type: string): Promise<string> {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const name = path.basename(filePath, ext);
    const optimizedPath = path.join(dir, `${name}_optimized${ext}`);

    switch (type) {
      case 'image':
        await this.optimizeImage(filePath, optimizedPath);
        break;
      case 'audio':
        await this.optimizeAudio(filePath, optimizedPath);
        break;
      case 'video':
        await this.optimizeVideo(filePath, optimizedPath);
        break;
      default:
        // Para documentos, solo copiar
        await fs.copyFile(filePath, optimizedPath);
    }

    return optimizedPath;
  }

  /**
   * Optimiza una imagen
   */
  private async optimizeImage(inputPath: string, outputPath: string): Promise<void> {
    await sharp(inputPath)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: this.imageQuality, progressive: true })
      .toFile(outputPath);
  }

  /**
   * Optimiza un archivo de audio usando ffmpeg
   */
  private async optimizeAudio(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-b:a', `${this.audioBitrate}k`,
        '-c:a', 'aac',
        outputPath
      ]);

      ffmpeg.on('close', (code: number) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  /**
   * Optimiza un video usando ffmpeg
   */
  private async optimizeVideo(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-b:v', `${this.videoBitrate}k`,
        '-b:a', `${this.audioBitrate}k`,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-s', '640x480',
        outputPath
      ]);

      ffmpeg.on('close', (code: number) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  /**
   * Obtiene metadatos de un recurso
   */
  private async getResourceMetadata(filePath: string, type: string): Promise<ResourceMetadata> {
    const metadata: ResourceMetadata = {
      format: path.extname(filePath).slice(1)
    };

    switch (type) {
      case 'image':
        const imageInfo = await sharp(filePath).metadata();
        metadata.width = imageInfo.width;
        metadata.height = imageInfo.height;
        break;
      
      case 'audio':
      case 'video':
        const mediaInfo = await this.getMediaInfo(filePath);
        metadata.duration = mediaInfo.duration;
        metadata.bitrate = mediaInfo.bitrate;
        metadata.codec = mediaInfo.codec;
        break;
    }

    return metadata;
  }

  /**
   * Obtiene información de medios usando ffprobe
   */
  private async getMediaInfo(filePath: string): Promise<any> {
    try {
      const { stdout } = await execAsync(`ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`);
      const info = JSON.parse(stdout);
      
      const videoStream = info.streams?.find((s: any) => s.codec_type === 'video');
      const audioStream = info.streams?.find((s: any) => s.codec_type === 'audio');
      
      return {
        duration: parseFloat(info.format?.duration || '0'),
        bitrate: parseInt(info.format?.bit_rate || '0'),
        codec: videoStream?.codec_name || audioStream?.codec_name
      };
    } catch (error) {
      console.warn('Error obteniendo información de medios:', error);
      return { duration: 0, bitrate: 0, codec: 'unknown' };
    }
  }

  /**
   * Crea lecciones offline
   */
  private async createOfflineLessons(lessons: any[], resources: OfflineResource[]): Promise<OfflineLesson[]> {
    return lessons.map(lesson => {
      const multimedia = this.mapResourcesToLesson(lesson, resources);
      const content = JSON.stringify(lesson.content);
      
      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        culturalVariants: lesson.culturalVariants,
        languageVersions: lesson.languageVersions,
        accessibilityFeatures: lesson.accessibilityFeatures,
        multimedia,
        size: Buffer.byteLength(content, 'utf8'),
        checksum: this.calculateChecksum(content)
      };
    });
  }

  /**
   * Mapea recursos a una lección
   */
  private mapResourcesToLesson(lesson: any, resources: OfflineResource[]): OfflineMultimedia[] {
    const multimedia: OfflineMultimedia[] = [];
    const lessonUrls = this.extractMultimediaUrls(lesson);
    
    for (const url of lessonUrls) {
      const resource = resources.find(r => r.url === url);
      if (resource && resource.type !== 'document') {
        multimedia.push({
          type: resource.type as 'image' | 'audio' | 'video',
          originalUrl: url,
          optimizedUrl: resource.localPath,
          size: resource.size,
          optimizedSize: resource.optimizedSize,
          format: resource.metadata.format,
          quality: this.calculateQuality(resource.size, resource.optimizedSize)
        });
      }
    }
    
    return multimedia;
  }

  /**
   * Calcula la calidad de optimización
   */
  private calculateQuality(originalSize: number, optimizedSize: number): number {
    return Math.round((optimizedSize / originalSize) * 100);
  }

  /**
   * Genera metadatos del paquete
   */
  private generatePackageMetadata(lessons: any[], resources: OfflineResource[]): PackageMetadata {
    const totalSize = resources.reduce((sum, r) => sum + r.optimizedSize, 0);
    const estimatedDownloadTime = this.estimateDownloadTime(totalSize);

    return {
      totalLessons: lessons.length,
      totalResources: resources.length,
      totalSize,
      estimatedDownloadTime,
      compatibility: ['mobile', 'tablet', 'desktop'],
      requirements: {
        minStorage: totalSize + (50 * 1024 * 1024), // 50MB extra
        minBandwidth: 100, // 100 kbps
        supportedDevices: ['Android 8+', 'iOS 12+', 'Chrome 80+', 'Firefox 75+']
      }
    };
  }

  /**
   * Estima el tiempo de descarga
   */
  private estimateDownloadTime(sizeInBytes: number): number {
    const sizeInMB = sizeInBytes / (1024 * 1024);
    const slowConnection = 100; // kbps
    const fastConnection = 1000; // kbps
    
    const slowTime = (sizeInMB * 8 * 1024) / slowConnection; // segundos
    const fastTime = (sizeInMB * 8 * 1024) / fastConnection; // segundos
    
    return Math.round((slowTime + fastTime) / 2);
  }

  /**
   * Actualiza información offline de lecciones en la base de datos
   */
  private async updateLessonOfflineInfo(lessons: any[], packageId: string) {
    for (const lesson of lessons) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          offlinePackageUrl: `/offline-content/${packageId}.json`,
          offlineSize: lesson.size || 0
        }
      });
    }
  }

  /**
   * Genera ID único para paquete
   */
  private generatePackageId(studentId: string, culture: string, language: string): string {
    const timestamp = Date.now();
    const hash = createHash('md5')
      .update(`${studentId}-${culture}-${language}-${timestamp}`)
      .digest('hex');
    return `package-${hash.slice(0, 8)}`;
  }

  /**
   * Genera ID único para recurso
   */
  private generateResourceId(url: string): string {
    const hash = createHash('md5').update(url).digest('hex');
    return `resource-${hash.slice(0, 8)}`;
  }

  /**
   * Calcula checksum de string
   */
  private calculateChecksum(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Calcula checksum de archivo
   */
  private async calculateFileChecksum(filePath: string): Promise<string> {
    const data = await fs.readFile(filePath);
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Limpia recursos temporales
   */
  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Error limpiando directorio temporal:', error);
    }
  }
}

// Instancia singleton
export const offlineContentGenerator = new OfflineContentGenerator();
