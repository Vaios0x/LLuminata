import { useState, useCallback } from 'react';
import { ChatMessage, ChatResponse } from '@/lib/ai-services/chatbot-service';

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy Lluminato, tu asistente de IA de LLuminata. Estoy aquí para ayudarte con todo lo relacionado con tu aprendizaje inclusivo. ¿En qué puedo asistirte hoy? 🤖✨',
      timestamp: Date.now(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [actions, setActions] = useState<any[]>([]);

  // Respuestas inteligentes simuladas
  const generateIntelligentResponse = useCallback(async (userMessage: string): Promise<ChatResponse> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Análisis de intención
    let intent = 'AYUDA_GENERAL';
    let response = '';
    let suggestions: string[] = [];
    let actions: any[] = [];

    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos días') || lowerMessage.includes('buenas')) {
      intent = 'SALUDO';
      response = '¡Hola! Me alegra saludarte. Soy Lluminato, tu asistente de IA y estoy aquí para ayudarte con todo lo relacionado con LLuminata. ¿Cómo puedo asistirte hoy? 😊';
      suggestions = [
        '¿Qué es LLuminata? 🤔',
        '¿Cómo funciona el aprendizaje adaptativo? 📚',
        '¿Qué características de accesibilidad tienes? ♿',
        '¿Puedes ayudarme con matemáticas? 📐'
      ];
    } else if (lowerMessage.includes('qué es') || lowerMessage.includes('que es') || lowerMessage.includes('explica')) {
      intent = 'AYUDA_GENERAL';
      response = 'LLuminata es una plataforma educativa revolucionaria diseñada específicamente para ser inclusiva y accesible. 🌟\n\n**Características principales:**\n• Aprendizaje adaptativo con IA\n• Soporte para necesidades especiales\n• Contenido culturalmente relevante\n• Funcionamiento offline\n• Accesibilidad universal\n\n¿Te gustaría que profundice en alguna característica específica?';
      suggestions = [
        '¿Cómo funciona la IA adaptativa? 🧠',
        '¿Qué necesidades especiales soportas? ♿',
        '¿Cómo funciona el modo offline? 📱',
        '¿Qué idiomas soportas? 🌍'
      ];
      actions = [
        {
          type: 'navigate',
          target: '/about',
          description: 'Ver más información'
        }
      ];
    } else if (lowerMessage.includes('matemáticas') || lowerMessage.includes('matematica') || lowerMessage.includes('matematica')) {
      intent = 'APRENDIZAJE';
      response = '¡Excelente! Las matemáticas son fundamentales y en LLuminata las hacemos accesibles para todos. 📐\n\n**Temas disponibles:**\n• Álgebra básica y avanzada\n• Geometría y trigonometría\n• Cálculo diferencial e integral\n• Estadística y probabilidad\n• Matemáticas aplicadas\n\n**Características especiales:**\n• Explicaciones paso a paso\n• Ejercicios interactivos\n• Adaptación a tu ritmo\n• Soporte visual y auditivo\n\n¿Qué tema te interesa más?';
      suggestions = [
        'Quiero empezar con álgebra 📊',
        '¿Puedes explicarme geometría? 🔺',
        'Necesito ayuda con cálculo 📈',
        '¿Tienes ejercicios prácticos? ✏️'
      ];
      actions = [
        {
          type: 'navigate',
          target: '/lessons',
          description: 'Ver lecciones de matemáticas'
        }
      ];
    } else if (lowerMessage.includes('accesibilidad') || lowerMessage.includes('discapacidad') || lowerMessage.includes('necesidades especiales')) {
      intent = 'ACCESIBILIDAD';
      response = 'La accesibilidad es el corazón de LLuminata. Estamos comprometidos con la inclusión total. ♿\n\n**Soporte para necesidades especiales:**\n• **Dislexia:** Fuentes especiales, espaciado adaptativo\n• **TDAH:** Contenido segmentado, recordatorios\n• **Discapacidad visual:** Alto contraste, síntesis de voz\n• **Discapacidad auditiva:** Subtítulos, texto descriptivo\n• **Discapacidad motora:** Navegación por teclado, comandos de voz\n\n**Herramientas de accesibilidad:**\n• Modo alto contraste\n• Zoom hasta 300%\n• Navegación por teclado\n• Síntesis de voz\n• Reconocimiento de voz\n\n¿Qué ajuste específico necesitas?';
      suggestions = [
        '¿Cómo activo el modo alto contraste? 🌈',
        '¿Puedo usar comandos de voz? 🎤',
        '¿Cómo funciona la síntesis de voz? 🔊',
        '¿Tienes navegación por teclado? ⌨️'
      ];
      actions = [
        {
          type: 'navigate',
          target: '/accessibility',
          description: 'Configurar accesibilidad'
        }
      ];
    } else if (lowerMessage.includes('offline') || lowerMessage.includes('sin internet') || lowerMessage.includes('conexión')) {
      intent = 'TECNICO';
      response = '¡Excelente pregunta! LLuminata funciona perfectamente sin conexión a internet. 📱\n\n**Funcionalidades offline:**\n• Descarga de lecciones completas\n• Ejercicios interactivos\n• Evaluaciones\n• Progreso local\n• Contenido multimedia\n\n**Sincronización automática:**\n• Cuando vuelves a tener conexión\n• Sincronización de progreso\n• Actualización de contenido\n• Backup automático\n\n**Ventajas:**\n• Aprendizaje sin interrupciones\n• Ahorro de datos móviles\n• Acceso en áreas remotas\n• Continuidad educativa\n\n¿Te gustaría que te explique cómo descargar contenido?';
      suggestions = [
        '¿Cómo descargo lecciones? 📥',
        '¿Cuánto espacio necesito? 💾',
        '¿Se sincroniza automáticamente? 🔄',
        '¿Puedo usar en áreas remotas? 🏔️'
      ];
    } else if (lowerMessage.includes('idioma') || lowerMessage.includes('lengua') || lowerMessage.includes('maya') || lowerMessage.includes('náhuatl')) {
      intent = 'CULTURAL';
      response = '¡Por supuesto! LLuminata respeta y celebra la diversidad cultural y lingüística. 🌍\n\n**Idiomas soportados:**\n• Español (principal)\n• Maya (Yucateco, K\'iche\', Q\'eqchi\')\n• Náhuatl (clásico y variantes)\n• Inglés (para comunidades bilingües)\n\n**Características culturales:**\n• Contenido culturalmente relevante\n• Ejemplos de la vida cotidiana\n• Historias y tradiciones locales\n• Conectores culturales\n• Respeto a cosmovisiones indígenas\n\n**Adaptación cultural:**\n• Contexto local en ejemplos\n• Referencias culturales apropiadas\n• Celebración de tradiciones\n• Integración de saberes ancestrales\n\n¿En qué idioma prefieres que te ayude?';
      suggestions = [
        '¿Puedes explicar en maya? 🌿',
        '¿Tienes contenido en náhuatl? 🏛️',
        '¿Cómo cambio el idioma? 🌐',
        '¿Tienes contenido cultural? 🎭'
      ];
    } else if (lowerMessage.includes('gracias') || lowerMessage.includes('gracias')) {
      intent = 'SALUDO';
      response = '¡De nada! Es un verdadero placer ayudarte en tu camino de aprendizaje. 🌟\n\nRecuerda que estoy aquí 24/7 para:\n• Resolver tus dudas\n• Explicar conceptos\n• Guiarte en tu aprendizaje\n• Ayudarte con accesibilidad\n• Responder preguntas técnicas\n\n¡Que tengas un excelente día de aprendizaje! 💪✨';
      suggestions = [
        '¿Puedes ayudarme con otra cosa? 🤔',
        '¿Qué más puedo aprender? 📚',
        '¿Cómo mejoro mi progreso? 📈',
        '¿Tienes consejos de estudio? 💡'
      ];
    } else if (lowerMessage.includes('adiós') || lowerMessage.includes('chao') || lowerMessage.includes('hasta luego') || lowerMessage.includes('bye')) {
      intent = 'DESPEDIDA';
      response = '¡Hasta luego! Ha sido un placer ayudarte. 🌟\n\nRecuerda que estoy aquí cuando necesites:\n• Ayuda con tus lecciones\n• Explicaciones de conceptos\n• Ajustes de accesibilidad\n• Soporte técnico\n• Motivación para seguir aprendiendo\n\n¡Que tengas un excelente día y sigue aprendiendo! 💪✨\n\n¡Vuelve pronto! 🚀';
    } else {
      intent = 'AYUDA_GENERAL';
      response = 'Interesante pregunta. Déjame ayudarte con eso. 🤔\n\nComo Lluminato, tu asistente de IA, puedo ayudarte con:\n\n**Aprendizaje:**\n• Explicaciones de cualquier tema\n• Ejercicios personalizados\n• Recursos educativos\n• Estrategias de estudio\n\n**Plataforma:**\n• Navegación del sitio\n• Configuración de accesibilidad\n• Funciones offline\n• Características especiales\n\n**Soporte:**\n• Problemas técnicos\n• Dudas sobre el contenido\n• Ajustes personalizados\n• Motivación y consejos\n\n¿Podrías ser más específico sobre lo que te gustaría saber?';
      suggestions = [
        '¿Qué temas puedes explicar? 📚',
        '¿Cómo funciona la plataforma? 🔧',
        '¿Qué características tienes? ⭐',
        '¿Puedes ayudarme con mi tarea? ✏️'
      ];
    }

    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    return {
      message: {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        metadata: {
          intent,
          confidence: 0.9,
          culturalContext: 'general',
          learningStyle: 'mixed',
        }
      },
      suggestions,
      actions,
      confidence: 0.9,
      culturalAdaptation: true
    };
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await generateIntelligentResponse(message);
      
      setMessages(prev => [...prev, response.message]);
      setSuggestions(response.suggestions || []);
      setActions(response.actions || []);
    } catch (error) {
      console.error('Error generando respuesta:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Lo siento, estoy teniendo dificultades técnicas. ¿Puedes intentar de nuevo? 🔧',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [generateIntelligentResponse]);

  const clearHistory = useCallback(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: '¡Hola! Soy Lluminato, tu asistente de IA de LLuminata. ¿En qué puedo ayudarte hoy? 🤖✨',
        timestamp: Date.now(),
      }
    ]);
    setSuggestions([]);
    setActions([]);
  }, []);

  return {
    messages,
    isLoading,
    suggestions,
    actions,
    sendMessage,
    clearHistory,
  };
}
