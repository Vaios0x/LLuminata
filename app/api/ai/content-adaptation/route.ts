import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const { content, targetCulture, language } = await request.json();

    const culturalContexts = {
      'maya': {
        examples: 'maíz, milpa, cenotes, quetzal',
        values: 'comunidad, naturaleza, tradición oral',
        avoid: 'referencias urbanas modernas'
      },
      'nahuatl': {
        examples: 'cacao, chinampas, volcanes, águila',
        values: 'respeto a ancianos, trabajo colectivo',
        avoid: 'individualismo excesivo'
      },
      'afrodescendiente': {
        examples: 'música, danza, costa, comunidad',
        values: 'expresión cultural, resilencia, familia extendida',
        avoid: 'estereotipos'
      },
      'rural': {
        examples: 'siembra, animales de granja, río, montaña',
        values: 'trabajo duro, autosuficiencia, naturaleza',
        avoid: 'tecnología compleja no disponible'
      }
    };
    
    const context = culturalContexts[targetCulture] || culturalContexts['rural'];
    
    const adaptedContent = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Eres un experto en educación intercultural en América Latina. 
                    Adapta contenido educativo para la cultura ${targetCulture}.`
        },
        {
          role: "user",
          content: `
            Adapta el siguiente contenido educativo:
            "${content}"
            
            Contexto cultural:
            - Ejemplos relevantes: ${context.examples}
            - Valores importantes: ${context.values}
            - Evitar: ${context.avoid}
            - Idioma: ${language}
            
            Mantén el objetivo educativo pero usa referencias culturalmente relevantes.
            Si el idioma no es español, incluye términos en idioma local con traducción.
          `
        }
      ]
    });
    
    return NextResponse.json({
      success: true,
      adaptedContent: adaptedContent.choices[0].message.content,
      originalContent: content,
      culturalContext: context
    });

  } catch (error) {
    console.error('Error en adaptación cultural:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al adaptar contenido culturalmente',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
