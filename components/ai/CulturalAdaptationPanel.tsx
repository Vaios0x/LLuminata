'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Languages, 
  Users, 
  Palette, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Ear,
  Brain,
  Heart,
  BookOpen,
  Star,
  RefreshCw,
  Save,
  Download,
  Upload,
  Zap,
  Target,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para adaptación cultural
interface CulturalContext {
  id: string;
  name: string;
  language: string;
  region: string;
  description: string;
  icon: string;
  color: string;
  adaptations: CulturalAdaptation[];
}

interface CulturalAdaptation {
  id: string;
  type: 'visual' | 'auditory' | 'cognitive' | 'emotional' | 'linguistic';
  name: string;
  description: string;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high';
  impact: number; // 0-100
}

interface AdaptationSettings {
  userId: string;
  culturalContext: string;
  adaptations: Record<string, boolean>;
  preferences: {
    language: string;
    visualStyle: 'traditional' | 'modern' | 'minimal';
    audioEnabled: boolean;
    textSize: 'small' | 'medium' | 'large';
    colorScheme: 'default' | 'high-contrast' | 'cultural';
    interactionStyle: 'direct' | 'respectful' | 'formal';
  };
  learningStyle: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading: number;
  };
}

interface CulturalAdaptationPanelProps {
  userId: string;
  onAdaptationChange?: (settings: AdaptationSettings) => void;
  onSave?: (settings: AdaptationSettings) => void;
  onReset?: () => void;
  className?: string;
}

// Contextos culturales predefinidos
const CULTURAL_CONTEXTS: CulturalContext[] = [
  {
    id: 'maya',
    name: 'Maya',
    language: 'Maya',
    region: 'Yucatán, México',
    description: 'Cultura maya con tradiciones ancestrales y conexión con la naturaleza',
    icon: '🌿',
    color: 'emerald',
    adaptations: [
      {
        id: 'maya_visual',
        type: 'visual',
        name: 'Símbolos Mayas',
        description: 'Incorporar símbolos y patrones mayas en la interfaz',
        enabled: true,
        priority: 'high',
        impact: 85
      },
      {
        id: 'maya_linguistic',
        type: 'linguistic',
        name: 'Términos Mayas',
        description: 'Usar términos y conceptos de la cultura maya',
        enabled: true,
        priority: 'high',
        impact: 90
      },
      {
        id: 'maya_cognitive',
        type: 'cognitive',
        name: 'Aprendizaje Circular',
        description: 'Estructura de aprendizaje basada en ciclos naturales',
        enabled: true,
        priority: 'medium',
        impact: 75
      }
    ]
  },
  {
    id: 'nahuatl',
    name: 'Náhuatl',
    language: 'Náhuatl',
    region: 'Centro de México',
    description: 'Cultura náhuatl con rica tradición oral y filosófica',
    icon: '🌺',
    color: 'rose',
    adaptations: [
      {
        id: 'nahuatl_auditory',
        type: 'auditory',
        name: 'Narrativa Oral',
        description: 'Enfoque en narrativa y tradición oral',
        enabled: true,
        priority: 'high',
        impact: 88
      },
      {
        id: 'nahuatl_emotional',
        type: 'emotional',
        name: 'Conexión Espiritual',
        description: 'Incorporar elementos espirituales y de conexión',
        enabled: true,
        priority: 'medium',
        impact: 70
      }
    ]
  },
  {
    id: 'zapoteco',
    name: 'Zapoteco',
    language: 'Zapoteco',
    region: 'Oaxaca, México',
    description: 'Cultura zapoteca con tradición de escritura y arte',
    icon: '🏺',
    color: 'amber',
    adaptations: [
      {
        id: 'zapoteco_visual',
        type: 'visual',
        name: 'Arte Zapoteca',
        description: 'Incorporar elementos del arte zapoteca tradicional',
        enabled: true,
        priority: 'high',
        impact: 82
      },
      {
        id: 'zapoteco_cognitive',
        type: 'cognitive',
        name: 'Pensamiento Sistémico',
        description: 'Enfoque en interconexiones y sistemas',
        enabled: true,
        priority: 'medium',
        impact: 78
      }
    ]
  },
  {
    id: 'mixteco',
    name: 'Mixteco',
    language: 'Mixteco',
    region: 'Oaxaca, México',
    description: 'Cultura mixteca con tradición de códices y escritura',
    icon: '📜',
    color: 'indigo',
    adaptations: [
      {
        id: 'mixteco_visual',
        type: 'visual',
        name: 'Códices Mixtecos',
        description: 'Usar elementos visuales de los códices mixtecos',
        enabled: true,
        priority: 'high',
        impact: 80
      },
      {
        id: 'mixteco_linguistic',
        type: 'linguistic',
        name: 'Estructura Narrativa',
        description: 'Estructura basada en narrativas tradicionales',
        enabled: true,
        priority: 'medium',
        impact: 75
      }
    ]
  },
  {
    id: 'purepecha',
    name: 'Purépecha',
    language: 'Purépecha',
    region: 'Michoacán, México',
    description: 'Cultura purépecha con tradición artesanal y musical',
    icon: '🎵',
    color: 'purple',
    adaptations: [
      {
        id: 'purepecha_auditory',
        type: 'auditory',
        name: 'Música Tradicional',
        description: 'Incorporar elementos musicales purépechas',
        enabled: true,
        priority: 'high',
        impact: 85
      },
      {
        id: 'purepecha_kinesthetic',
        type: 'cognitive',
        name: 'Aprendizaje Manual',
        description: 'Enfoque en aprendizaje práctico y manual',
        enabled: true,
        priority: 'medium',
        impact: 72
      }
    ]
  }
];

// Idiomas soportados
const SUPPORTED_LANGUAGES = [
  { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
  { code: 'maya', name: 'Maya', flag: '🌿' },
  { code: 'nahuatl', name: 'Náhuatl', flag: '🌺' },
  { code: 'zapoteco', name: 'Zapoteco', flag: '🏺' },
  { code: 'mixteco', name: 'Mixteco', flag: '📜' },
  { code: 'purepecha', name: 'Purépecha', flag: '🎵' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

export function CulturalAdaptationPanel({
  userId,
  onAdaptationChange,
  onSave,
  onReset,
  className
}: CulturalAdaptationPanelProps) {
  const [selectedContext, setSelectedContext] = useState<string>('maya');
  const [settings, setSettings] = useState<AdaptationSettings>({
    userId,
    culturalContext: 'maya',
    adaptations: {},
    preferences: {
      language: 'es-MX',
      visualStyle: 'traditional',
      audioEnabled: true,
      textSize: 'medium',
      colorScheme: 'cultural',
      interactionStyle: 'respectful'
    },
    learningStyle: {
      visual: 70,
      auditory: 60,
      kinesthetic: 50,
      reading: 40
    }
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Obtener contexto cultural seleccionado
  const currentContext = CULTURAL_CONTEXTS.find(ctx => ctx.id === selectedContext);

  // Actualizar configuraciones
  const updateSettings = useCallback((updates: Partial<AdaptationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    
    if (onAdaptationChange) {
      onAdaptationChange(newSettings);
    }
  }, [settings, onAdaptationChange]);

  // Cambiar contexto cultural
  const changeCulturalContext = useCallback((contextId: string) => {
    setSelectedContext(contextId);
    updateSettings({ culturalContext: contextId });
  }, [updateSettings]);

  // Toggle adaptación
  const toggleAdaptation = useCallback((adaptationId: string) => {
    const newAdaptations = {
      ...settings.adaptations,
      [adaptationId]: !settings.adaptations[adaptationId]
    };
    updateSettings({ adaptations: newAdaptations });
  }, [settings.adaptations, updateSettings]);

  // Analizar adaptaciones
  const analyzeAdaptations = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      // Simular análisis de IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const enabledAdaptations = currentContext?.adaptations.filter(
        adapt => settings.adaptations[adapt.id] !== false
      ) || [];
      
      const totalImpact = enabledAdaptations.reduce((sum, adapt) => sum + adapt.impact, 0);
      const averageImpact = enabledAdaptations.length > 0 ? totalImpact / enabledAdaptations.length : 0;
      
      const analysis = {
        culturalFit: Math.round(averageImpact),
        coverage: Math.round((enabledAdaptations.length / currentContext?.adaptations.length || 1) * 100),
        recommendations: [
          'Considerar agregar más adaptaciones auditivas',
          'Optimizar para aprendizaje visual',
          'Incorporar elementos de narrativa tradicional'
        ],
        strengths: [
          'Buena cobertura de adaptaciones visuales',
          'Respeto por tradiciones culturales',
          'Enfoque en aprendizaje significativo'
        ]
      };
      
      setAnalysisResults(analysis);
    } catch (error) {
      console.error('Error en análisis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentContext, settings.adaptations]);

  // Guardar configuraciones
  const saveSettings = useCallback(() => {
    if (onSave) {
      onSave(settings);
    }
  }, [settings, onSave]);

  // Resetear configuraciones
  const resetSettings = useCallback(() => {
    setSettings({
      userId,
      culturalContext: 'maya',
      adaptations: {},
      preferences: {
        language: 'es-MX',
        visualStyle: 'traditional',
        audioEnabled: true,
        textSize: 'medium',
        colorScheme: 'cultural',
        interactionStyle: 'respectful'
      },
      learningStyle: {
        visual: 70,
        auditory: 60,
        kinesthetic: 50,
        reading: 40
      }
    });
    
    if (onReset) {
      onReset();
    }
  }, [userId, onReset]);

  return (
    <Card className={cn("w-full max-w-6xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-600" />
          Panel de Adaptación Cultural
        </CardTitle>
        <CardDescription>
          Personaliza la experiencia de aprendizaje según tu contexto cultural
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Panel de Contextos Culturales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Contextos Culturales
            </h3>
            
            <div className="space-y-2">
              {CULTURAL_CONTEXTS.map((context) => (
                <div
                  key={context.id}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all",
                    selectedContext === context.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => changeCulturalContext(context.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Seleccionar contexto cultural: ${context.name}`}
                  onKeyDown={(e) => e.key === 'Enter' && changeCulturalContext(context.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{context.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{context.name}</h4>
                      <p className="text-sm text-muted-foreground">{context.language}</p>
                    </div>
                    {selectedContext === context.id && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel de Adaptaciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Adaptaciones Disponibles
            </h3>
            
            {currentContext && (
              <div className="space-y-3">
                {currentContext.adaptations.map((adaptation) => (
                  <div
                    key={adaptation.id}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{adaptation.name}</h4>
                        <p className="text-sm text-muted-foreground">{adaptation.description}</p>
                      </div>
                      <Button
                        variant={settings.adaptations[adaptation.id] !== false ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleAdaptation(adaptation.id)}
                        tabIndex={0}
                        aria-label={`${settings.adaptations[adaptation.id] !== false ? 'Desactivar' : 'Activar'} adaptación: ${adaptation.name}`}
                      >
                        {settings.adaptations[adaptation.id] !== false ? 'Activada' : 'Desactivada'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          adaptation.priority === 'high' ? 'destructive' :
                          adaptation.priority === 'medium' ? 'secondary' : 'outline'
                        }
                      >
                        {adaptation.priority}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Impacto</span>
                          <span>{adaptation.impact}%</span>
                        </div>
                        <Progress value={adaptation.impact} className="h-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel de Preferencias */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Preferencias Personales
            </h3>
            
            <div className="space-y-4">
              {/* Idioma */}
              <div>
                <label className="text-sm font-medium mb-2 block">Idioma Preferido</label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => updateSettings({
                    preferences: { ...settings.preferences, language: e.target.value }
                  })}
                  className="w-full p-2 border rounded-md"
                  tabIndex={0}
                  aria-label="Seleccionar idioma preferido"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estilo Visual */}
              <div>
                <label className="text-sm font-medium mb-2 block">Estilo Visual</label>
                <div className="flex gap-2">
                  {['traditional', 'modern', 'minimal'].map((style) => (
                    <Button
                      key={style}
                      variant={settings.preferences.visualStyle === style ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSettings({
                        preferences: { ...settings.preferences, visualStyle: style as any }
                      })}
                      tabIndex={0}
                      aria-label={`Seleccionar estilo visual: ${style}`}
                    >
                      {style === 'traditional' ? 'Tradicional' :
                       style === 'modern' ? 'Moderno' : 'Mínimo'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tamaño de Texto */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tamaño de Texto</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <Button
                      key={size}
                      variant={settings.preferences.textSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSettings({
                        preferences: { ...settings.preferences, textSize: size as any }
                      })}
                      tabIndex={0}
                      aria-label={`Seleccionar tamaño de texto: ${size}`}
                    >
                      {size === 'small' ? 'Pequeño' :
                       size === 'medium' ? 'Mediano' : 'Grande'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Estilo de Interacción */}
              <div>
                <label className="text-sm font-medium mb-2 block">Estilo de Interacción</label>
                <div className="flex gap-2">
                  {['direct', 'respectful', 'formal'].map((style) => (
                    <Button
                      key={style}
                      variant={settings.preferences.interactionStyle === style ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSettings({
                        preferences: { ...settings.preferences, interactionStyle: style as any }
                      })}
                      tabIndex={0}
                      aria-label={`Seleccionar estilo de interacción: ${style}`}
                    >
                      {style === 'direct' ? 'Directo' :
                       style === 'respectful' ? 'Respetuoso' : 'Formal'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Estilo de Aprendizaje */}
              <div>
                <label className="text-sm font-medium mb-2 block">Estilo de Aprendizaje</label>
                <div className="space-y-2">
                  {Object.entries(settings.learningStyle).map(([style, value]) => (
                    <div key={style}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize">{style}</span>
                        <span>{value}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => updateSettings({
                          learningStyle: {
                            ...settings.learningStyle,
                            [style]: parseInt(e.target.value)
                          }
                        })}
                        className="w-full"
                        tabIndex={0}
                        aria-label={`Ajustar preferencia de aprendizaje ${style}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Análisis de Adaptaciones */}
        {analysisResults && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Análisis de Adaptaciones
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">Ajuste Cultural: {analysisResults.culturalFit}%</Badge>
                  <Badge variant="secondary">Cobertura: {analysisResults.coverage}%</Badge>
                </div>
                
                <h4 className="font-medium mb-2">Fortalezas</h4>
                <ul className="space-y-1">
                  {analysisResults.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recomendaciones</h4>
                <ul className="space-y-1">
                  {analysisResults.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-yellow-600" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Restablecer
          </Button>
          <Button variant="outline" onClick={analyzeAdaptations} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Analizar
              </>
            )}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
          <Button onClick={saveSettings}>
            <Download className="w-4 h-4 mr-2" />
            Aplicar Cambios
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
