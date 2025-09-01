/**
 * Servicio de Exportación para InclusiveAI Coach
 * Proporciona funcionalidades de exportación de datos en múltiples formatos
 */

// Tipos para el servicio de exportación
export interface ExportConfig {
  enabled: boolean;
  maxFileSize: number; // Tamaño máximo en bytes
  supportedFormats: string[];
  enableCompression: boolean;
  enableEncryption: boolean;
  tempDirectory: string;
  retentionPeriod: number; // Tiempo de retención en ms
  maxConcurrentExports: number;
  enableScheduling: boolean;
  enableTemplates: boolean;
}

export interface ExportJob {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'scheduled' | 'automated';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  format: string;
  dataSource: string;
  filters?: Record<string, any>;
  options?: Record<string, any>;
  progress: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  filePath?: string;
  fileSize?: number;
  downloadUrl?: string;
  error?: string;
  createdBy: string;
  metadata?: Record<string, any>;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: string;
  dataSource: string;
  filters: Record<string, any>;
  options: Record<string, any>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:mm
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number; // 1-31
    timezone: string;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportFormat {
  name: string;
  extension: string;
  mimeType: string;
  supportsCompression: boolean;
  supportsEncryption: boolean;
  maxFileSize: number;
  description: string;
}

export interface ExportData {
  headers: string[];
  rows: any[][];
  metadata?: Record<string, any>;
}

export interface ExportResult {
  jobId: string;
  success: boolean;
  filePath?: string;
  fileSize?: number;
  downloadUrl?: string;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Servicio principal de Exportación
 */
export class ExportService {
  private config: ExportConfig;
  private jobs: Map<string, ExportJob> = new Map();
  private templates: Map<string, ExportTemplate> = new Map();
  private activeJobs: Set<string> = new Set();
  private isInitialized: boolean = false;
  private cleanupIntervalId: NodeJS.Timeout | null = null;
  private observers: Map<string, (data: any) => void> = new Map();

  // Formatos soportados
  private supportedFormats: Map<string, ExportFormat> = new Map([
    ['csv', {
      name: 'CSV',
      extension: '.csv',
      mimeType: 'text/csv',
      supportsCompression: true,
      supportsEncryption: false,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      description: 'Archivo de valores separados por comas'
    }],
    ['json', {
      name: 'JSON',
      extension: '.json',
      mimeType: 'application/json',
      supportsCompression: true,
      supportsEncryption: false,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      description: 'Archivo JavaScript Object Notation'
    }],
    ['xlsx', {
      name: 'Excel',
      extension: '.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      supportsCompression: false,
      supportsEncryption: true,
      maxFileSize: 200 * 1024 * 1024, // 200MB
      description: 'Archivo de Microsoft Excel'
    }],
    ['pdf', {
      name: 'PDF',
      extension: '.pdf',
      mimeType: 'application/pdf',
      supportsCompression: false,
      supportsEncryption: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      description: 'Documento PDF'
    }],
    ['xml', {
      name: 'XML',
      extension: '.xml',
      mimeType: 'application/xml',
      supportsCompression: true,
      supportsEncryption: false,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      description: 'Archivo XML'
    }],
    ['txt', {
      name: 'Texto',
      extension: '.txt',
      mimeType: 'text/plain',
      supportsCompression: true,
      supportsEncryption: false,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      description: 'Archivo de texto plano'
    }]
  ]);

  constructor(config?: Partial<ExportConfig>) {
    this.config = {
      enabled: true,
      maxFileSize: 500 * 1024 * 1024, // 500MB
      supportedFormats: ['csv', 'json', 'xlsx', 'pdf', 'xml', 'txt'],
      enableCompression: true,
      enableEncryption: false,
      tempDirectory: '/tmp/exports',
      retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 días
      maxConcurrentExports: 5,
      enableScheduling: true,
      enableTemplates: true,
      ...config
    };

    this.initializeService();
  }

  /**
   * Inicializa el servicio
   */
  private initializeService(): void {
    if (!this.config.enabled) {
      console.log('⚠️ Servicio de exportación deshabilitado');
      return;
    }

    console.log('🚀 Inicializando servicio de exportación...');
    
    // Crear directorio temporal si no existe
    this.createTempDirectory();
    
    // Configurar limpieza automática
    this.startCleanupInterval();
    
    // Cargar plantillas existentes
    this.loadTemplates();
    
    this.isInitialized = true;
    console.log('✅ Servicio de exportación inicializado');
  }

  /**
   * Crea el directorio temporal
   */
  private createTempDirectory(): void {
    // En producción se usaría fs.mkdirSync con recursive: true
    console.log(`📁 Creando directorio temporal: ${this.config.tempDirectory}`);
  }

  /**
   * Inicia el intervalo de limpieza
   */
  private startCleanupInterval(): void {
    this.cleanupIntervalId = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); // Cada hora
  }

  /**
   * Carga plantillas existentes
   */
  private loadTemplates(): void {
    // En producción se cargarían desde la base de datos
    console.log('📋 Cargando plantillas de exportación...');
  }

  /**
   * Crea un trabajo de exportación
   */
  createExportJob(jobData: {
    name: string;
    description: string;
    format: string;
    dataSource: string;
    filters?: Record<string, any>;
    options?: Record<string, any>;
    createdBy: string;
  }): ExportJob {
    if (!this.isFormatSupported(jobData.format)) {
      throw new Error(`Formato no soportado: ${jobData.format}`);
    }

    if (this.activeJobs.size >= this.config.maxConcurrentExports) {
      throw new Error('Número máximo de exportaciones concurrentes alcanzado');
    }

    const job: ExportJob = {
      id: this.generateId(),
      name: jobData.name,
      description: jobData.description,
      type: 'manual',
      status: 'pending',
      format: jobData.format,
      dataSource: jobData.dataSource,
      filters: jobData.filters,
      options: jobData.options,
      progress: 0,
      createdAt: new Date(),
      createdBy: jobData.createdBy
    };

    this.jobs.set(job.id, job);
    console.log(`📤 Trabajo de exportación creado: ${job.name} (${job.id})`);
    
    this.notifyObservers('jobCreated', job);
    return job;
  }

  /**
   * Ejecuta un trabajo de exportación
   */
  async executeExportJob(jobId: string): Promise<ExportResult> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Trabajo de exportación ${jobId} no encontrado`);
    }

    if (job.status !== 'pending') {
      throw new Error(`Trabajo ${jobId} no puede ser ejecutado desde estado ${job.status}`);
    }

    try {
      console.log(`🚀 Ejecutando trabajo de exportación: ${job.name} (${jobId})`);

      // Actualizar estado
      job.status = 'processing';
      job.startedAt = new Date();
      job.progress = 0;
      this.activeJobs.add(jobId);

      // Obtener datos
      const data = await this.fetchData(job.dataSource, job.filters);
      job.progress = 30;

      // Validar datos
      this.validateData(data, job.format);
      job.progress = 50;

      // Exportar datos
      const result = await this.exportData(data, job);
      job.progress = 80;

      // Finalizar trabajo
      job.status = 'completed';
      job.completedAt = new Date();
      job.progress = 100;
      job.filePath = result.filePath;
      job.fileSize = result.fileSize;
      job.downloadUrl = result.downloadUrl;

      this.activeJobs.delete(jobId);

      console.log(`✅ Exportación completada: ${job.name} (${jobId})`);
      this.notifyObservers('jobCompleted', job);

      return {
        jobId,
        success: true,
        filePath: result.filePath,
        fileSize: result.fileSize,
        downloadUrl: result.downloadUrl,
        metadata: result.metadata
      };

    } catch (error) {
      console.error(`❌ Error en exportación ${jobId}:`, error);

      job.status = 'failed';
      job.completedAt = new Date();
      job.error = error instanceof Error ? error.message : 'Error desconocido';
      this.activeJobs.delete(jobId);

      this.notifyObservers('jobFailed', { job, error });

      return {
        jobId,
        success: false,
        error: job.error
      };
    }
  }

  /**
   * Obtiene datos para exportación
   */
  private async fetchData(dataSource: string, filters?: Record<string, any>): Promise<ExportData> {
    // Simulación de obtención de datos
    console.log(`📊 Obteniendo datos de: ${dataSource}`);

    // En producción se conectaría a la base de datos o API correspondiente
    const mockData: ExportData = {
      headers: ['id', 'nombre', 'email', 'fecha_creacion', 'estado'],
      rows: [
        ['1', 'Juan Pérez', 'juan@example.com', '2024-01-15', 'activo'],
        ['2', 'María García', 'maria@example.com', '2024-01-16', 'activo'],
        ['3', 'Carlos López', 'carlos@example.com', '2024-01-17', 'inactivo'],
        ['4', 'Ana Martínez', 'ana@example.com', '2024-01-18', 'activo'],
        ['5', 'Luis Rodríguez', 'luis@example.com', '2024-01-19', 'activo']
      ],
      metadata: {
        totalRows: 5,
        dataSource,
        filters,
        exportedAt: new Date().toISOString()
      }
    };

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    return mockData;
  }

  /**
   * Valida los datos antes de exportar
   */
  private validateData(data: ExportData, format: string): void {
    if (!data.headers || data.headers.length === 0) {
      throw new Error('Los datos no tienen encabezados');
    }

    if (!data.rows || data.rows.length === 0) {
      throw new Error('Los datos no tienen filas');
    }

    // Validar que todas las filas tengan el mismo número de columnas
    const expectedColumns = data.headers.length;
    for (let i = 0; i < data.rows.length; i++) {
      if (data.rows[i].length !== expectedColumns) {
        throw new Error(`Fila ${i + 1} tiene ${data.rows[i].length} columnas, se esperaban ${expectedColumns}`);
      }
    }

    // Validar límites de tamaño según formato
    const formatConfig = this.supportedFormats.get(format);
    if (formatConfig) {
      const estimatedSize = this.estimateFileSize(data, format);
      if (estimatedSize > formatConfig.maxFileSize) {
        throw new Error(`El archivo estimado (${this.formatBytes(estimatedSize)}) excede el límite máximo (${this.formatBytes(formatConfig.maxFileSize)})`);
      }
    }
  }

  /**
   * Exporta datos al formato especificado
   */
  private async exportData(data: ExportData, job: ExportJob): Promise<{
    filePath: string;
    fileSize: number;
    downloadUrl: string;
    metadata?: Record<string, any>;
  }> {
    const format = this.supportedFormats.get(job.format);
    if (!format) {
      throw new Error(`Formato no soportado: ${job.format}`);
    }

    const fileName = `${job.name}_${Date.now()}${format.extension}`;
    const filePath = `${this.config.tempDirectory}/${fileName}`;

    console.log(`💾 Exportando datos a ${format.name}: ${filePath}`);

    let content: string | Buffer;
    let fileSize: number;

    switch (job.format) {
      case 'csv':
        content = this.exportToCSV(data);
        break;
      case 'json':
        content = this.exportToJSON(data);
        break;
      case 'xlsx':
        content = await this.exportToExcel(data);
        break;
      case 'pdf':
        content = await this.exportToPDF(data, job);
        break;
      case 'xml':
        content = this.exportToXML(data);
        break;
      case 'txt':
        content = this.exportToText(data);
        break;
      default:
        throw new Error(`Formato no implementado: ${job.format}`);
    }

    // Aplicar compresión si está habilitada
    if (this.config.enableCompression && format.supportsCompression) {
      content = await this.compressContent(content);
    }

    // Aplicar encriptación si está habilitada
    if (this.config.enableEncryption && format.supportsEncryption) {
      content = await this.encryptContent(content);
    }

    // Escribir archivo
    fileSize = await this.writeFile(filePath, content);

    // Generar URL de descarga
    const downloadUrl = this.generateDownloadUrl(fileName);

    return {
      filePath,
      fileSize,
      downloadUrl,
      metadata: {
        format: job.format,
        compression: this.config.enableCompression && format.supportsCompression,
        encryption: this.config.enableEncryption && format.supportsEncryption,
        exportedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Exporta datos a CSV
   */
  private exportToCSV(data: ExportData): string {
    const csvRows: string[] = [];

    // Agregar encabezados
    csvRows.push(data.headers.join(','));

    // Agregar filas
    for (const row of data.rows) {
      const escapedRow = row.map(cell => {
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      });
      csvRows.push(escapedRow.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Exporta datos a JSON
   */
  private exportToJSON(data: ExportData): string {
    const jsonData = {
      headers: data.headers,
      rows: data.rows,
      metadata: data.metadata,
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(jsonData, null, 2);
  }

  /**
   * Exporta datos a Excel
   */
  private async exportToExcel(data: ExportData): Promise<Buffer> {
    // En producción se usaría una librería como xlsx
    console.log('📊 Generando archivo Excel...');
    
    // Simulación de generación de Excel
    const excelContent = this.exportToCSV(data); // Por simplicidad, usar CSV como base
    return Buffer.from(excelContent, 'utf-8');
  }

  /**
   * Exporta datos a PDF
   */
  private async exportToPDF(data: ExportData, job: ExportJob): Promise<Buffer> {
    // En producción se usaría una librería como puppeteer o jsPDF
    console.log('📄 Generando archivo PDF...');
    
    // Simulación de generación de PDF
    const pdfContent = `
      <html>
        <head>
          <title>${job.name}</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>${job.name}</h1>
          <p>${job.description}</p>
          <table>
            <thead>
              <tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    return Buffer.from(pdfContent, 'utf-8');
  }

  /**
   * Exporta datos a XML
   */
  private exportToXML(data: ExportData): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<export>\n';
    xml += '  <metadata>\n';
    if (data.metadata) {
      for (const [key, value] of Object.entries(data.metadata)) {
        xml += `    <${key}>${value}</${key}>\n`;
      }
    }
    xml += '  </metadata>\n';
    xml += '  <data>\n';
    
    for (const row of data.rows) {
      xml += '    <row>\n';
      for (let i = 0; i < data.headers.length; i++) {
        const header = data.headers[i].replace(/[^a-zA-Z0-9]/g, '_');
        xml += `      <${header}>${this.escapeXml(row[i])}</${header}>\n`;
      }
      xml += '    </row>\n';
    }
    
    xml += '  </data>\n';
    xml += '</export>';
    
    return xml;
  }

  /**
   * Exporta datos a texto plano
   */
  private exportToText(data: ExportData): string {
    const lines: string[] = [];
    
    // Agregar encabezados
    lines.push(data.headers.join('\t'));
    
    // Agregar filas
    for (const row of data.rows) {
      lines.push(row.join('\t'));
    }
    
    return lines.join('\n');
  }

  /**
   * Comprime contenido
   */
  private async compressContent(content: string | Buffer): Promise<Buffer> {
    // En producción se usaría una librería como zlib
    console.log('🗜️ Comprimiendo contenido...');
    return Buffer.from(content);
  }

  /**
   * Encripta contenido
   */
  private async encryptContent(content: string | Buffer): Promise<Buffer> {
    // En producción se usaría una librería de encriptación
    console.log('🔒 Encriptando contenido...');
    return Buffer.from(content);
  }

  /**
   * Escribe archivo al sistema
   */
  private async writeFile(filePath: string, content: string | Buffer): Promise<number> {
    // En producción se usaría fs.writeFileSync
    console.log(`💾 Escribiendo archivo: ${filePath}`);
    
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8');
    return buffer.length;
  }

  /**
   * Genera URL de descarga
   */
  private generateDownloadUrl(fileName: string): string {
    return `/api/exports/download/${fileName}`;
  }

  /**
   * Crea una plantilla de exportación
   */
  createTemplate(templateData: {
    name: string;
    description: string;
    format: string;
    dataSource: string;
    filters: Record<string, any>;
    options: Record<string, any>;
    schedule?: ExportTemplate['schedule'];
    createdBy: string;
  }): ExportTemplate {
    if (!this.isFormatSupported(templateData.format)) {
      throw new Error(`Formato no soportado: ${templateData.format}`);
    }

    const template: ExportTemplate = {
      id: this.generateId(),
      name: templateData.name,
      description: templateData.description,
      format: templateData.format,
      dataSource: templateData.dataSource,
      filters: templateData.filters,
      options: templateData.options,
      schedule: templateData.schedule,
      isActive: true,
      createdBy: templateData.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(template.id, template);
    console.log(`📋 Plantilla creada: ${template.name} (${template.id})`);
    return template;
  }

  /**
   * Ejecuta una plantilla de exportación
   */
  async executeTemplate(templateId: string, createdBy: string): Promise<ExportJob> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Plantilla ${templateId} no encontrada`);
    }

    if (!template.isActive) {
      throw new Error(`Plantilla ${templateId} no está activa`);
    }

    // Crear trabajo basado en la plantilla
    const job = this.createExportJob({
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      format: template.format,
      dataSource: template.dataSource,
      filters: template.filters,
      options: template.options,
      createdBy
    });

    // Ejecutar el trabajo
    await this.executeExportJob(job.id);

    return job;
  }

  /**
   * Programa exportaciones automáticas
   */
  scheduleExport(scheduleData: {
    templateId: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    timezone: string;
  }): void {
    const template = this.templates.get(scheduleData.templateId);
    if (!template) {
      throw new Error(`Plantilla ${scheduleData.templateId} no encontrada`);
    }

    template.schedule = {
      frequency: scheduleData.frequency,
      time: scheduleData.time,
      dayOfWeek: scheduleData.dayOfWeek,
      dayOfMonth: scheduleData.dayOfMonth,
      timezone: scheduleData.timezone
    };

    template.updatedAt = new Date();
    console.log(`⏰ Exportación programada: ${template.name}`);
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): {
    isInitialized: boolean;
    isEnabled: boolean;
    activeJobsCount: number;
    totalJobsCount: number;
    templatesCount: number;
    supportedFormatsCount: number;
  } {
    const activeJobs = Array.from(this.jobs.values()).filter(j => j.status === 'processing');
    
    return {
      isInitialized: this.isInitialized,
      isEnabled: this.config.enabled,
      activeJobsCount: activeJobs.length,
      totalJobsCount: this.jobs.size,
      templatesCount: this.templates.size,
      supportedFormatsCount: this.supportedFormats.size
    };
  }

  /**
   * Obtiene todos los trabajos
   */
  getJobs(): ExportJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Obtiene un trabajo específico
   */
  getJob(jobId: string): ExportJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Obtiene todas las plantillas
   */
  getTemplates(): ExportTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Obtiene formatos soportados
   */
  getSupportedFormats(): ExportFormat[] {
    return Array.from(this.supportedFormats.values());
  }

  /**
   * Verifica si un formato es soportado
   */
  isFormatSupported(format: string): boolean {
    return this.supportedFormats.has(format);
  }

  /**
   * Cancela un trabajo de exportación
   */
  cancelJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Trabajo ${jobId} no encontrado`);
    }

    if (job.status === 'processing') {
      job.status = 'cancelled';
      job.completedAt = new Date();
      this.activeJobs.delete(jobId);
      console.log(`❌ Trabajo cancelado: ${job.name} (${jobId})`);
    }
  }

  /**
   * Elimina un trabajo de exportación
   */
  deleteJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      // Eliminar archivo si existe
      if (job.filePath) {
        this.deleteFile(job.filePath);
      }
      
      this.jobs.delete(jobId);
      console.log(`🗑️ Trabajo eliminado: ${job.name} (${jobId})`);
    }
  }

  /**
   * Elimina un archivo
   */
  private deleteFile(filePath: string): void {
    // En producción se usaría fs.unlinkSync
    console.log(`🗑️ Eliminando archivo: ${filePath}`);
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<ExportConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de exportación actualizada');
  }

  /**
   * Estima el tamaño del archivo
   */
  private estimateFileSize(data: ExportData, format: string): number {
    const formatConfig = this.supportedFormats.get(format);
    if (!formatConfig) return 0;

    // Estimación simple basada en el número de caracteres
    const totalChars = data.headers.join('').length + 
      data.rows.reduce((sum, row) => sum + row.join('').length, 0);
    
    // Factor de multiplicación según formato
    const formatFactors: Record<string, number> = {
      csv: 1.2,
      json: 2.5,
      xlsx: 3.0,
      pdf: 4.0,
      xml: 2.8,
      txt: 1.0
    };

    return Math.ceil(totalChars * (formatFactors[format] || 1.0));
  }

  /**
   * Formatea bytes en formato legible
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Escapa caracteres especiales en XML
   */
  private escapeXml(text: any): string {
    const str = String(text);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Limpia trabajos antiguos
   */
  cleanup(): void {
    const cutoff = Date.now() - this.config.retentionPeriod;
    
    for (const [jobId, job] of this.jobs) {
      if (job.createdAt.getTime() < cutoff) {
        this.deleteJob(jobId);
      }
    }

    console.log(`🧹 Limpieza de trabajos de exportación completada`);
  }

  /**
   * Limpia todos los recursos
   */
  async cleanup(): Promise<void> {
    // Detener intervalo de limpieza
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }

    // Cancelar trabajos activos
    for (const jobId of this.activeJobs) {
      this.cancelJob(jobId);
    }

    // Limpiar datos
    this.jobs.clear();
    this.templates.clear();
    this.activeJobs.clear();
    this.observers.clear();

    console.log('🧹 Servicio de exportación limpiado');
  }

  // Métodos auxiliares
  private generateId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyObservers(event: string, data: any): void {
    console.log(`📤 Evento de exportación: ${event}`, data);
  }
}

// Instancia singleton del servicio
export const exportService = new ExportService();

// Exportar el servicio como default
export default exportService;
