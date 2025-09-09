import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { language: string } }
) {
  try {
    const { language } = params;
    
    // Validar que el idioma sea válido
    const validLanguages = [
      'es-MX', 'maya', 'nahuatl', 'kiche', 'kaqchikel', 'mam', 'qeqchi',
      'tzotzil', 'tseltal', 'mixteco', 'zapoteco', 'otomi', 'totonaco',
      'mazateco', 'chol', 'mazahua', 'huasteco', 'chinanteco', 'purepecha',
      'mixe', 'tlapaneco', 'tarahumara', 'en', 'pt', 'fr', 'de'
    ];
    
    if (!validLanguages.includes(language)) {
      return NextResponse.json(
        { error: 'Idioma no soportado' },
        { status: 400 }
      );
    }
    
    // Intentar cargar el archivo de traducciones
    const filePath = join(process.cwd(), 'locales', language, 'common.json');
    
    try {
      const fileContent = await readFile(filePath, 'utf-8');
      const translations = JSON.parse(fileContent);
      
      return NextResponse.json(translations, {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    } catch (fileError) {
      // Si no se encuentra el archivo específico, usar español como fallback
      if (language !== 'es-MX') {
        const fallbackPath = join(process.cwd(), 'locales', 'es-MX', 'common.json');
        const fallbackContent = await readFile(fallbackPath, 'utf-8');
        const fallbackTranslations = JSON.parse(fallbackContent);
        
        return NextResponse.json(fallbackTranslations, {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            'Content-Type': 'application/json; charset=utf-8'
          }
        });
      }
      
      throw fileError;
    }
    
  } catch (error) {
    console.error('Error cargando traducciones:', error);
    
    // Traducciones de emergencia
    const emergencyTranslations = {
      common: {
        app: { 
          name: 'Lluminata', 
          tagline: 'Educación Inclusiva' 
        },
        navigation: { 
          home: 'Inicio', 
          about: 'Nosotros', 
          contact: 'Contacto',
          features: 'Características',
          populations: 'Poblaciones',
          technology: 'Tecnología',
          pricing: 'Precios'
        },
        auth: {
          login: 'Iniciar Sesión',
          register: 'Registrarse'
        },
        actions: { 
          save: 'Guardar', 
          cancel: 'Cancelar', 
          search: 'Buscar' 
        }
      }
    };
    
    return NextResponse.json(emergencyTranslations, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
}