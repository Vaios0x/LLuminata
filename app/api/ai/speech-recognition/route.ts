import { NextRequest, NextResponse } from 'next/server';
import { speechRecognitionService, VoiceCommand } from '@/lib/ai-services/speech-recognition-service';

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'start':
        speechRecognitionService.start();
        return NextResponse.json({
          success: true,
          message: 'Reconocimiento de voz iniciado'
        });

      case 'stop':
        speechRecognitionService.stop();
        return NextResponse.json({
          success: true,
          message: 'Reconocimiento de voz detenido'
        });

      case 'register-command':
        const command: VoiceCommand = data.command;
        speechRecognitionService.registerCommand(command);
        return NextResponse.json({
          success: true,
          message: 'Comando registrado exitosamente'
        });

      case 'unregister-command':
        const commandId = data.commandId;
        const removed = speechRecognitionService.unregisterCommand(commandId);
        return NextResponse.json({
          success: true,
          removed,
          message: removed ? 'Comando eliminado' : 'Comando no encontrado'
        });

      case 'set-language':
        const language = data.language;
        speechRecognitionService.setLanguage(language);
        return NextResponse.json({
          success: true,
          message: `Idioma cambiado a ${language}`
        });

      case 'set-cultural-context':
        const context = data.context;
        speechRecognitionService.setCulturalContext(context);
        return NextResponse.json({
          success: true,
          message: `Contexto cultural cambiado a ${context}`
        });

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error en reconocimiento de voz:', error);
    return NextResponse.json(
      { error: 'Error en reconocimiento de voz' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Obtener información del servicio
    const isSupported = speechRecognitionService.isSupported();
    const isListening = speechRecognitionService.isListening();
    const currentLanguage = speechRecognitionService.getLanguage();
    const culturalContext = speechRecognitionService.getCulturalContext();
    
    const commands = category 
      ? speechRecognitionService.getCommandsByCategory(category)
      : speechRecognitionService.getCommands();

    return NextResponse.json({
      isSupported,
      isListening,
      currentLanguage,
      culturalContext,
      commands,
      stats: {
        totalCommands: speechRecognitionService.getCommands().length,
        categories: ['navigation', 'interaction', 'accessibility', 'learning', 'custom']
      },
      features: {
        continuous: true,
        interimResults: true,
        multipleAlternatives: true,
        culturalContext: true,
        aiInterpretation: true
      }
    });

  } catch (error) {
    console.error('Error obteniendo información de reconocimiento:', error);
    return NextResponse.json(
      { error: 'Error obteniendo información' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { commands } = await request.json();

    if (!Array.isArray(commands)) {
      return NextResponse.json(
        { error: 'Comandos debe ser un array' },
        { status: 400 }
      );
    }

    // Limpiar comandos existentes y registrar nuevos
    speechRecognitionService.clearCommands();
    
    commands.forEach((command: VoiceCommand) => {
      speechRecognitionService.registerCommand(command);
    });

    return NextResponse.json({
      success: true,
      message: `${commands.length} comandos registrados exitosamente`
    });

  } catch (error) {
    console.error('Error actualizando comandos:', error);
    return NextResponse.json(
      { error: 'Error actualizando comandos' },
      { status: 500 }
    );
  }
}
