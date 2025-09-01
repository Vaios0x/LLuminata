/**
 * Servicio de Adaptación Cultural para InclusiveAI Coach
 * Maneja la adaptación de contenido educativo a contextos culturales indígenas
 */

import { z } from 'zod';
import { aiServices } from './ai-services';

// Tipos y esquemas
export interface CulturalContext {
  culture: string;
  language: string;
  region?: string;
  socioeconomicLevel?: string;
  educationLevel?: string;
  age?: number;
  gender?: string;
  traditions?: string[];
  values?: string[];
  taboos?: string[];
  examples?: string[];
}

export interface ContentAdaptation {
  originalContent: string;
  adaptedContent: string;
  culturalElements: string[];
  languageAdaptations: Record<string, string>;
  visualAdaptations: string[];
  audioAdaptations: string[];
  sensitivityNotes: string[];
  confidence: number;
}

export interface CulturalAsset {
  id: string;
  type: 'image' | 'audio' | 'video' | 'text';
  culture: string;
  category: string;
  url: string;
  metadata: Record<string, any>;
  tags: string[];
}

// Esquemas de validación
const CulturalContextSchema = z.object({
  culture: z.string().min(1),
  language: z.string().min(2),
  region: z.string().optional(),
  socioeconomicLevel: z.enum(['low', 'medium', 'high']).optional(),
  educationLevel: z.enum(['basic', 'intermediate', 'advanced']).optional(),
  age: z.number().min(5).max(18).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  traditions: z.array(z.string()).optional(),
  values: z.array(z.string()).optional(),
  taboos: z.array(z.string()).optional(),
  examples: z.array(z.string()).optional()
});

const ContentAdaptationRequestSchema = z.object({
  content: z.string().min(1),
  culturalContext: CulturalContextSchema,
  targetLanguage: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  subject: z.string().optional()
});

export class CulturalAdapter {
  private supportedCultures: Record<string, any> = {
    'maya': {
      languages: ['maya', 'k\'iche\'', 'q\'eqchi\'', 'kaqchikel', 'mam', 'tzotzil', 'tzeltal'],
      regions: ['Yucatán', 'Quintana Roo', 'Campeche', 'Chiapas', 'Guatemala'],
      values: ['comunidad', 'naturaleza', 'tradición oral', 'respeto a ancianos', 'trabajo colectivo'],
      examples: {
        mathematics: ['maíz', 'milpa', 'cenotes', 'calendario maya'],
        science: ['medicina tradicional', 'astronomía', 'agricultura'],
        history: ['jeroglíficos', 'templos', 'sacerdotes', 'ceremonias'],
        language: ['palabras mayas', 'números mayas', 'saludos tradicionales']
      },
      symbols: {
        meanings: {
          'quetzal': 'libertad y belleza',
          'jaguar': 'fuerza y poder',
          'maíz': 'vida y sustento',
          'cenote': 'conocimiento sagrado'
        }
      }
    },
    'nahuatl': {
      languages: ['nahuatl', 'español'],
      regions: ['México', 'Puebla', 'Morelos', 'Tlaxcala', 'Hidalgo'],
      values: ['respeto a ancianos', 'trabajo colectivo', 'sabiduría ancestral', 'equilibrio'],
      examples: {
        mathematics: ['cacao', 'chinampas', 'volcanes', 'calendario azteca'],
        science: ['medicina tradicional', 'herbolaria', 'astronomía'],
        history: ['códices', 'templos', 'guerreros', 'sacerdotes'],
        language: ['palabras náhuatl', 'números aztecas', 'saludos']
      },
      symbols: {
        meanings: {
          'águila': 'valor y libertad',
          'serpiente': 'sabiduría y transformación',
          'flor': 'belleza y vida',
          'canto': 'comunicación con lo divino'
        }
      }
    },
    'zapoteco': {
      languages: ['zapoteco', 'español'],
      regions: ['Oaxaca', 'Istmo', 'Sierra Norte', 'Valles Centrales'],
      values: ['trabajo comunitario', 'respeto a la tierra', 'tradiciones', 'familia extendida'],
      examples: {
        mathematics: ['maíz', 'frijol', 'calabaza', 'mercados'],
        science: ['medicina tradicional', 'agricultura', 'clima'],
        history: ['monte albán', 'guelaguetza', 'artesanías'],
        language: ['palabras zapotecas', 'números', 'expresiones']
      }
    },
    'mixteco': {
      languages: ['mixteco', 'español'],
      regions: ['Oaxaca', 'Puebla', 'Guerrero'],
      values: ['trabajo duro', 'respeto', 'tradición', 'comunidad'],
      examples: {
        mathematics: ['maíz', 'frijol', 'mercados', 'trueque'],
        science: ['agricultura', 'medicina', 'clima'],
        history: ['códices mixtecos', 'tumbas', 'artesanías'],
        language: ['palabras mixtecas', 'números', 'saludos']
      }
    },
    'otomi': {
      languages: ['otomi', 'español'],
      regions: ['Hidalgo', 'Querétaro', 'México', 'Tlaxcala'],
      values: ['trabajo', 'familia', 'tradición', 'respeto'],
      examples: {
        mathematics: ['maíz', 'frijol', 'mercados', 'trueque'],
        science: ['agricultura', 'medicina', 'clima'],
        history: ['tradiciones', 'artesanías', 'fiestas'],
        language: ['palabras otomíes', 'números', 'expresiones']
      }
    },
    'quechua': {
      languages: ['quechua', 'español'],
      regions: ['Perú', 'Bolivia', 'Ecuador', 'Argentina'],
      values: ['pachamama', 'ayllu', 'trabajo comunitario', 'respeto'],
      examples: {
        mathematics: ['papa', 'quinua', 'maíz', 'llama'],
        science: ['agricultura andina', 'medicina', 'clima'],
        history: ['incas', 'machu picchu', 'quipus'],
        language: ['palabras quechuas', 'números', 'saludos']
      }
    }
  };

  private culturalAssets: Record<string, CulturalAsset[]> = {};

  constructor() {
    this.initializeCulturalAssets();
  }

  /**
   * Inicializa los assets culturales
   */
  private initializeCulturalAssets(): void {
    // Assets para cultura Maya
    this.culturalAssets['maya'] = [
      {
        id: 'maya-maiz-001',
        type: 'image',
        culture: 'maya',
        category: 'agriculture',
        url: '/cultural-assets/maya/maiz-cultivation.jpg',
        metadata: {
          title: 'Cultivo de Maíz Maya',
          description: 'Técnicas tradicionales de cultivo de maíz',
          tags: ['agricultura', 'maíz', 'tradición']
        },
        tags: ['agricultura', 'maíz', 'tradición', 'sustento']
      },
      {
        id: 'maya-cenote-001',
        type: 'image',
        culture: 'maya',
        category: 'geography',
        url: '/cultural-assets/maya/cenote-sacred.jpg',
        metadata: {
          title: 'Cenote Sagrado',
          description: 'Cenote usado para ceremonias y conocimiento',
          tags: ['geografía', 'cenote', 'sagrado']
        },
        tags: ['geografía', 'cenote', 'sagrado', 'conocimiento']
      },
      {
        id: 'maya-calendar-001',
        type: 'image',
        culture: 'maya',
        category: 'mathematics',
        url: '/cultural-assets/maya/calendar-system.jpg',
        metadata: {
          title: 'Sistema de Calendario Maya',
          description: 'Cálculos matemáticos del calendario maya',
          tags: ['matemáticas', 'calendario', 'cálculo']
        },
        tags: ['matemáticas', 'calendario', 'cálculo', 'tiempo']
      }
    ];

    // Assets para cultura Náhuatl
    this.culturalAssets['nahuatl'] = [
      {
        id: 'nahuatl-chinampa-001',
        type: 'image',
        culture: 'nahuatl',
        category: 'agriculture',
        url: '/cultural-assets/nahuatl/chinampa-system.jpg',
        metadata: {
          title: 'Sistema de Chinampas',
          description: 'Técnica agrícola tradicional náhuatl',
          tags: ['agricultura', 'chinampa', 'sostenible']
        },
        tags: ['agricultura', 'chinampa', 'sostenible', 'innovación']
      },
      {
        id: 'nahuatl-cacao-001',
        type: 'image',
        culture: 'nahuatl',
        category: 'trade',
        url: '/cultural-assets/nahuatl/cacao-trade.jpg',
        metadata: {
          title: 'Comercio del Cacao',
          description: 'Sistema de comercio y trueque del cacao',
          tags: ['comercio', 'cacao', 'trueque']
        },
        tags: ['comercio', 'cacao', 'trueque', 'economía']
      }
    ];
  }

  /**
   * Adapta contenido educativo a un contexto cultural específico
   */
  async adaptContent(request: z.infer<typeof ContentAdaptationRequestSchema>): Promise<ContentAdaptation> {
    try {
      // Validar entrada
      const validatedRequest = ContentAdaptationRequestSchema.parse(request);
      
      // Obtener contexto cultural
      const culturalContext = this.getCulturalContext(validatedRequest.culturalContext.culture);
      if (!culturalContext) {
        throw new Error(`Cultura no soportada: ${validatedRequest.culturalContext.culture}`);
      }

      // Adaptar contenido usando IA
      const adaptation = await aiServices.adaptContentWithML(
        validatedRequest.content,
        validatedRequest.culturalContext
      );

      // Aplicar adaptaciones específicas
      const adaptedContent = this.applyCulturalAdaptations(
        validatedRequest.content,
        culturalContext,
        validatedRequest.subject || 'general'
      );

      // Generar elementos culturales
      const culturalElements = this.extractCulturalElements(
        validatedRequest.content,
        culturalContext
      );

      // Crear adaptaciones de lenguaje
      const languageAdaptations = this.createLanguageAdaptations(
        validatedRequest.content,
        culturalContext,
        validatedRequest.targetLanguage || validatedRequest.culturalContext.language
      );

      // Generar adaptaciones visuales
      const visualAdaptations = this.generateVisualAdaptations(
        validatedRequest.content,
        culturalContext,
        validatedRequest.subject || 'general'
      );

      // Generar adaptaciones de audio
      const audioAdaptations = this.generateAudioAdaptations(
        validatedRequest.content,
        culturalContext
      );

      // Generar notas de sensibilidad
      const sensitivityNotes = this.generateSensitivityNotes(
        validatedRequest.content,
        culturalContext
      );

      return {
        originalContent: validatedRequest.content,
        adaptedContent: adaptedContent,
        culturalElements: culturalElements,
        languageAdaptations: languageAdaptations,
        visualAdaptations: visualAdaptations,
        audioAdaptations: audioAdaptations,
        sensitivityNotes: sensitivityNotes,
        confidence: this.calculateAdaptationConfidence(validatedRequest.content, culturalContext)
      };

    } catch (error) {
      console.error('Error adaptando contenido cultural:', error);
      throw error;
    }
  }

  /**
   * Obtiene el contexto cultural para una cultura específica
   */
  private getCulturalContext(culture: string): any {
    return this.supportedCultures[culture.toLowerCase()];
  }

  /**
   * Aplica adaptaciones culturales específicas al contenido
   */
  private applyCulturalAdaptations(content: string, culturalContext: any, subject: string): string {
    let adaptedContent = content;

    // Reemplazar ejemplos con ejemplos culturalmente relevantes
    const examples = culturalContext.examples[subject] || culturalContext.examples.mathematics;
    
    // Adaptar ejemplos matemáticos
    if (subject === 'mathematics') {
      adaptedContent = adaptedContent
        .replace(/manzanas/g, examples[0] || 'maíz')
        .replace(/naranjas/g, examples[1] || 'frijol')
        .replace(/peras/g, examples[2] || 'calabaza');
    }

    // Adaptar ejemplos de ciencias
    if (subject === 'science') {
      adaptedContent = adaptedContent
        .replace(/árboles/g, 'plantas medicinales')
        .replace(/animales domésticos/g, 'animales de la región')
        .replace(/tecnología moderna/g, 'técnicas tradicionales');
    }

    // Adaptar ejemplos históricos
    if (subject === 'history') {
      adaptedContent = adaptedContent
        .replace(/historia universal/g, 'historia de nuestra comunidad')
        .replace(/grandes civilizaciones/g, 'nuestros ancestros')
        .replace(/tecnología moderna/g, 'técnicas ancestrales');
    }

    return adaptedContent;
  }

  /**
   * Extrae elementos culturales del contenido
   */
  private extractCulturalElements(content: string, culturalContext: any): string[] {
    const elements: string[] = [];
    
    // Buscar palabras relacionadas con la cultura
    const culturalWords = [
      ...culturalContext.values,
      ...Object.values(culturalContext.examples).flat(),
      ...Object.keys(culturalContext.symbols?.meanings || {})
    ];

    culturalWords.forEach(word => {
      if (content.toLowerCase().includes(word.toLowerCase())) {
        elements.push(word);
      }
    });

    return [...new Set(elements)];
  }

  /**
   * Crea adaptaciones de lenguaje
   */
  private createLanguageAdaptations(content: string, culturalContext: any, targetLanguage: string): Record<string, string> {
    const adaptations: Record<string, string> = {};

    // Traducciones básicas para términos culturales
    const translations: Record<string, Record<string, string>> = {
      'maya': {
      },
      'nahuatl': {
        'maíz': 'centli',
        'agua': 'atl',
        'sol': 'tonatiuh',
        'luna': 'metztli',
        'tierra': 'tlalli'
      },
      'quechua': {
        'tierra': 'pachamama',
        'sol': 'inti',
        'luna': 'quilla',
        'agua': 'yaku',
        'maíz': 'sara'
      }
    };

    const cultureTranslations = translations[culturalContext.culture] || {};
    
    Object.entries(cultureTranslations).forEach(([spanish, indigenous]) => {
      if (content.toLowerCase().includes(spanish.toLowerCase())) {
        adaptations[spanish] = indigenous;
      }
    });

    return adaptations;
  }

  /**
   * Genera adaptaciones visuales
   */
  private generateVisualAdaptations(content: string, culturalContext: any, subject: string): string[] {
    const adaptations: string[] = [];

    // Sugerir imágenes culturales relevantes
    const assets = this.culturalAssets[culturalContext.culture] || [];
    const relevantAssets = assets.filter(asset => 
      asset.category === subject || asset.category === 'general'
    );

    relevantAssets.forEach(asset => {
      adaptations.push(`Usar imagen: ${asset.metadata.title} - ${asset.url}`);
    });

    // Sugerir colores y símbolos culturales
    const culturalSymbols = culturalContext.symbols?.meanings || {};
    Object.entries(culturalSymbols).forEach(([symbol, meaning]) => {
      adaptations.push(`Incluir símbolo: ${symbol} (${meaning})`);
    });

    return adaptations;
  }

  /**
   * Genera adaptaciones de audio
   */
  private generateAudioAdaptations(content: string, culturalContext: any): string[] {
    const adaptations: string[] = [];

    // Sugerir música tradicional
    adaptations.push(`Incluir música tradicional ${culturalContext.culture}`);
    
    // Sugerir sonidos ambientales
    adaptations.push(`Incluir sonidos de la naturaleza (${culturalContext.culture})`);
    
    // Sugerir narración en idioma indígena
    adaptations.push(`Narración en ${culturalContext.languages[0]}`);

    return adaptations;
  }

  /**
   * Genera notas de sensibilidad cultural
   */
  private generateSensitivityNotes(content: string, culturalContext: any): string[] {
    const notes: string[] = [];

    // Verificar tabús culturales
    const taboos = culturalContext.taboos || [];
    taboos.forEach(taboo => {
      if (content.toLowerCase().includes(taboo.toLowerCase())) {
        notes.push(`Evitar referencia a: ${taboo}`);
      }
    });

    // Verificar respeto a valores culturales
    const values = culturalContext.values || [];
    values.forEach(value => {
      if (!content.toLowerCase().includes(value.toLowerCase())) {
        notes.push(`Considerar incluir valor: ${value}`);
      }
    });

    return notes;
  }

  /**
   * Calcula la confianza de la adaptación
   */
  private calculateAdaptationConfidence(content: string, culturalContext: any): number {
    let confidence = 0.5; // Base

    // Aumentar confianza si hay elementos culturales presentes
    const culturalElements = this.extractCulturalElements(content, culturalContext);
    confidence += culturalElements.length * 0.1;

    // Aumentar confianza si el contenido es relevante
    const examples = Object.values(culturalContext.examples).flat();
    const relevantExamples = examples.filter(example => 
      content.toLowerCase().includes(example.toLowerCase())
    );
    confidence += relevantExamples.length * 0.05;

    return Math.min(confidence, 1.0);
  }

  /**
   * Obtiene assets culturales para una cultura específica
   */
  getCulturalAssets(culture: string, category?: string): CulturalAsset[] {
    const assets = this.culturalAssets[culture] || [];
    
    if (category) {
      return assets.filter(asset => asset.category === category);
    }
    
    return assets;
  }

  /**
   * Obtiene culturas soportadas
   */
  getSupportedCultures(): string[] {
    return Object.keys(this.supportedCultures);
  }

  /**
   * Obtiene información detallada de una cultura
   */
  getCultureInfo(culture: string): any {
    return this.supportedCultures[culture];
  }

  /**
   * Valida si una cultura es soportada
   */
  isCultureSupported(culture: string): boolean {
    return culture.toLowerCase() in this.supportedCultures;
  }

  /**
   * Obtiene idiomas soportados para una cultura
   */
  getSupportedLanguages(culture: string): string[] {
    const cultureInfo = this.getCultureInfo(culture);
    return cultureInfo?.languages || [];
  }
}

// Instancia singleton
export const culturalAdapter = new CulturalAdapter();
