import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

// Tipos para el chatbot
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    context?: string;
    intent?: string;
    confidence?: number;
    culturalContext?: string;
    learningStyle?: string;
    specialNeeds?: string[];
  };
}

export interface ChatContext {
  userId?: string;
  sessionId: string;
  currentPage: string;
  userPreferences: {
    language: string;
    learningStyle: string;
    accessibility: string[];
    culturalBackground: string;
    name?: string;
    specialNeeds?: string[];
  };
  conversationHistory: ChatMessage[];
  systemKnowledge: {
    siteContent: string[];
    features: string[];
    capabilities: string[];
  };
}

export interface ChatResponse {
  message: ChatMessage;
  suggestions: string[];
  actions: {
    type: 'navigate' | 'open_feature' | 'show_resource' | 'start_lesson' | 'accessibility_adjust';
    target: string;
    description: string;
  }[];
  confidence: number;
  culturalAdaptation: boolean;
}

export class SuperIntelligentChatbotService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private prisma: PrismaClient;
  private context: ChatContext;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.prisma = new PrismaClient();
    
    this.context = {
      sessionId: this.generateSessionId(),
      currentPage: '/',
      userPreferences: {
        language: 'es',
        learningStyle: 'mixed',
        accessibility: [],
        culturalBackground: 'general'
      },
      conversationHistory: [],
      systemKnowledge: {
        siteContent: [
          'LLuminata es una plataforma educativa inclusiva',
          'Ofrece lecciones adaptativas para diferentes estilos de aprendizaje',
          'Incluye soporte para necesidades especiales (dislexia, TDAH, etc.)',
          'Proporciona contenido culturalmente relevante',
          'Funciona offline con sincronización automática',
          'Incluye herramientas de accesibilidad avanzadas',
          'Soporte multiidioma (español, maya, náhuatl)',
          'Sistema de evaluación continua y personalizada',
          'Recursos multimedia adaptativos',
          'Comunidad de aprendizaje colaborativo'
        ],
        features: [
          'Dashboard personalizado con progreso visual',
          'Lecciones interactivas con IA adaptativa',
          'Sistema de reconocimiento de voz',
          'Síntesis de voz para contenido auditivo',
          'Modo offline con contenido descargable',
          'Herramientas de accesibilidad (alto contraste, zoom, etc.)',
          'Evaluaciones adaptativas',
          'Seguimiento de progreso detallado',
          'Recursos culturales específicos',
          'Sistema de recompensas y gamificación'
        ],
        capabilities: [
          'Detección automática de necesidades especiales',
          'Adaptación de contenido en tiempo real',
          'Soporte multiidioma con contexto cultural',
          'Análisis de patrones de aprendizaje',
          'Generación de contenido personalizado',
          'Evaluación continua del progreso',
          'Recomendaciones inteligentes',
          'Sincronización offline-online',
          'Accesibilidad universal',
          'Integración con servicios educativos externos'
        ]
      }
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Actualizar contexto del usuario
  async updateContext(updates: Partial<ChatContext>): Promise<void> {
    this.context = { ...this.context, ...updates };
    
    // Si hay userId, actualizar preferencias en la base de datos
    if (this.context.userId) {
      try {
        // Actualizar usuario principal
        await this.prisma.student.update({
          where: { id: this.context.userId },
          data: {
            language: this.context.userPreferences.language,
            culturalBackground: this.context.userPreferences.culturalBackground,
            learningProfile: this.context.userPreferences.accessibility,
          }
        });

        // Nota: El modelo Student no tiene relación directa con User en el esquema actual
        // Se puede crear un Student independiente si es necesario
      } catch (error) {
        console.error('Error actualizando contexto del usuario:', error);
      }
    }
  }

  // Cargar contexto del usuario autenticado
  async loadUserContext(userId: string): Promise<void> {
    try {
      const user = await this.prisma.student.findUnique({
        where: { id: userId }
      });

      if (user) {
        this.context.userId = userId;
        this.context.userPreferences = {
          language: user.language || 'es-MX',
          learningStyle: 'mixed', // Valor por defecto
          accessibility: (user.learningProfile as any)?.accessibility || [],
          culturalBackground: user.culturalBackground || 'general',
          name: user.name || 'Estudiante',
        };

        // Cargar necesidades especiales si existen (desde el campo JSON)
        if (user.learningProfile) {
          try {
            const learningProfile = user.learningProfile as any;
            if (learningProfile.specialNeeds && Array.isArray(learningProfile.specialNeeds)) {
              this.context.userPreferences.specialNeeds = learningProfile.specialNeeds;
            }
          } catch (error) {
            console.error('Error parsing learning profile:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error cargando contexto del usuario:', error);
    }
  }

  // Analizar intención del usuario
  private async analyzeIntent(message: string): Promise<{
    intent: string;
    confidence: number;
    entities: Record<string, any>;
  }> {
    const prompt = `
    Analiza la intención del siguiente mensaje del usuario en el contexto de una plataforma educativa inclusiva:

    Mensaje: "${message}"

    Contexto:
            - Plataforma: LLuminata
    - Usuario: ${this.context.userPreferences.language === 'es' ? 'Hispano' : 'Otro'}
    - Estilo de aprendizaje: ${this.context.userPreferences.learningStyle}
    - Necesidades de accesibilidad: ${this.context.userPreferences.accessibility.join(', ')}

    Clasifica la intención en una de estas categorías:
    1. SALUDO - Saludos o presentaciones
    2. AYUDA_GENERAL - Solicitud de ayuda general
    3. NAVEGACION - Preguntas sobre navegación del sitio
    4. APRENDIZAJE - Preguntas sobre contenido educativo
    5. ACCESIBILIDAD - Solicitudes de ajustes de accesibilidad
    6. RECURSOS - Solicitud de recursos o materiales
    7. PROGRESO - Consultas sobre progreso o evaluación
    8. TECNICO - Problemas técnicos o errores
    9. CULTURAL - Preguntas sobre contenido cultural
    10. DESPEDIDA - Despedidas o cierre de conversación

    Responde en formato JSON:
    {
      "intent": "CATEGORIA",
      "confidence": 0.95,
      "entities": {
        "subject": "matemáticas",
        "topic": "álgebra",
        "action": "explicar"
      }
    }
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      const result = JSON.parse(content.type === 'text' ? content.text : '{}');
      return result;
    } catch (error) {
      console.error('Error analizando intención:', error);
      return {
        intent: 'AYUDA_GENERAL',
        confidence: 0.5,
        entities: {}
      };
    }
  }

  // Generar respuesta inteligente
  private async generateIntelligentResponse(
    userMessage: string,
    intent: string,
    entities: Record<string, any>
  ): Promise<ChatResponse> {
    const systemPrompt = `
          Eres Lluminato, un asistente de IA para LLuminata, una plataforma educativa inclusiva.

    CONTEXTO DEL SISTEMA:
    ${this.context.systemKnowledge.siteContent.join('\n')}

    CARACTERÍSTICAS DISPONIBLES:
    ${this.context.systemKnowledge.features.join('\n')}

    CAPACIDADES:
    ${this.context.systemKnowledge.capabilities.join('\n')}

    PREFERENCIAS DEL USUARIO:
    - Idioma: ${this.context.userPreferences.language}
    - Estilo de aprendizaje: ${this.context.userPreferences.learningStyle}
    - Accesibilidad: ${this.context.userPreferences.accessibility.join(', ')}
    - Contexto cultural: ${this.context.userPreferences.culturalBackground}

    INSTRUCCIONES:
    1. Responde siempre en español de manera clara y accesible
    2. Adapta tu respuesta al estilo de aprendizaje del usuario
    3. Considera las necesidades de accesibilidad
    4. Incluye contexto cultural relevante cuando sea apropiado
    5. Proporciona sugerencias útiles y acciones específicas
    6. Sé empático y motivador
    7. Mantén un tono profesional pero amigable
    8. Incluye emojis apropiados para hacer la conversación más amigable

    INTENCIÓN DETECTADA: ${intent}
    ENTIDADES: ${JSON.stringify(entities)}
    `;

    const userPrompt = `
    Mensaje del usuario: "${userMessage}"

    Genera una respuesta que incluya:
    1. Respuesta principal al mensaje
    2. 3-4 sugerencias útiles relacionadas
    3. 1-2 acciones específicas que el usuario puede realizar
    4. Adaptación cultural si es relevante

    Responde en formato JSON:
    {
      "response": "Respuesta principal...",
      "suggestions": ["Sugerencia 1", "Sugerencia 2", "Sugerencia 3"],
      "actions": [
        {
          "type": "navigate",
          "target": "/dashboard",
          "description": "Ir al dashboard"
        }
      ],
      "culturalAdaptation": true
    }
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
        ],
      });

      const content = response.content[0];
      const result = JSON.parse(content.type === 'text' ? content.text : '{}');
      
      return {
        message: {
          id: Date.now().toString(),
          role: 'assistant',
          content: result.response,
          timestamp: Date.now(),
          metadata: {
            intent,
            confidence: 0.9,
            culturalContext: this.context.userPreferences.culturalBackground,
            learningStyle: this.context.userPreferences.learningStyle,
          }
        },
        suggestions: result.suggestions,
        actions: result.actions,
        confidence: 0.9,
        culturalAdaptation: result.culturalAdaptation
      };
    } catch (error) {
      console.error('Error generando respuesta:', error);
      
      // Respuesta de fallback
      return {
        message: {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Lo siento, estoy teniendo dificultades técnicas. ¿Puedes reformular tu pregunta o intentar más tarde? 🤖',
          timestamp: Date.now(),
        },
        suggestions: [
          'Revisar la conexión a internet',
          'Intentar con una pregunta más simple',
          'Contactar soporte técnico'
        ],
        actions: [],
        confidence: 0.3,
        culturalAdaptation: false
      };
    }
  }

  // Procesar mensaje del usuario
  async processMessage(userMessage: string): Promise<ChatResponse> {
    // Agregar mensaje del usuario al historial
    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };

    this.context.conversationHistory.push(userChatMessage);

    // Analizar intención
    const intentAnalysis = await this.analyzeIntent(userMessage);

    // Generar respuesta inteligente
    const response = await this.generateIntelligentResponse(
      userMessage,
      intentAnalysis.intent,
      intentAnalysis.entities
    );

    // Agregar respuesta al historial
    this.context.conversationHistory.push(response.message);

    // Mantener solo los últimos 20 mensajes
    if (this.context.conversationHistory.length > 20) {
      this.context.conversationHistory = this.context.conversationHistory.slice(-20);
    }

    return response;
  }

  // Obtener sugerencias contextuales
  async getContextualSuggestions(): Promise<string[]> {
    const lastMessage = this.context.conversationHistory[this.context.conversationHistory.length - 1];
    
    if (!lastMessage || lastMessage.role === 'user') {
      return [
        '¿Puedes ayudarme con matemáticas? 📐',
        '¿Cómo funciona el modo offline? 📱',
        'Necesito ajustes de accesibilidad ♿',
        '¿Qué lecciones me recomiendas? 📚'
      ];
    }

    // Generar sugerencias basadas en el contexto
    const suggestions = [
      '¿Te gustaría explorar más sobre este tema? 🔍',
      '¿Necesitas ayuda con algo específico? 💡',
      '¿Quieres ver recursos relacionados? 📖',
      '¿Te gustaría cambiar a otro tema? 🔄'
    ];

    return suggestions;
  }

  // Obtener historial de conversación
  getConversationHistory(): ChatMessage[] {
    return this.context.conversationHistory;
  }

  // Limpiar historial
  clearHistory(): void {
    this.context.conversationHistory = [];
  }

  // Obtener contexto actual
  getContext(): ChatContext {
    return { ...this.context };
  }
}

// Instancia singleton del servicio
let chatbotServiceInstance: SuperIntelligentChatbotService | null = null;

export function getChatbotService(): SuperIntelligentChatbotService {
  if (!chatbotServiceInstance) {
    chatbotServiceInstance = new SuperIntelligentChatbotService();
  }
  return chatbotServiceInstance;
}
