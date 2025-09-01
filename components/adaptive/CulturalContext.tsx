'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Heart, 
  Languages, 
  MapPin, 
  Users, 
  BookOpen, 
  Sparkles,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Volume2,
  ImageIcon,
  VideoIcon,
  FileText,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface CulturalBackground {
  id: string;
  name: string;
  region: string;
  languages: string[];
  traditions: string[];
  values: string[];
  examples: {
    mathematics: string[];
    science: string[];
    history: string[];
    art: string[];
  };
  symbols: {
    images: string[];
    meanings: string[];
  };
  celebrations: {
    name: string;
    description: string;
    date: string;
  }[];
}

interface CulturalAdaptation {
  originalContent: string;
  adaptedContent: {
    [language: string]: string;
  };
  culturalReferences: {
    background: string;
    examples: string[];
    symbols: string[];
  };
  localExamples: {
    category: string;
    examples: string[];
  }[];
  multimedia: {
    images: string[];
    videos: string[];
    audio: string[];
  };
  accessibility: {
    translations: boolean;
    culturalContext: boolean;
    localExamples: boolean;
    multimedia: boolean;
  };
}

interface CulturalContextProps {
  content: CulturalAdaptation;
  userBackground?: string;
  onAdaptationChange?: (adaptation: any) => void;
  onLanguageChange?: (language: string) => void;
  className?: string;
}

export default function CulturalContext({
  content,
  userBackground = 'maya',
  onAdaptationChange,
  onLanguageChange,
  className = ''
}: CulturalContextProps) {
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [selectedLanguage, setSelectedLanguage] = useState('español');
  const [selectedBackground, setSelectedBackground] = useState(userBackground);
  const [culturalBackgrounds, setCulturalBackgrounds] = useState<CulturalBackground[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [adaptationQuality, setAdaptationQuality] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    loadCulturalBackgrounds();
  }, []);

  useEffect(() => {
    if (content && selectedBackground) {
      generateCulturalAdaptation();
    }
  }, [content, selectedBackground, selectedLanguage]);

  const loadCulturalBackgrounds = async () => {
    try {
      // En producción, esto vendría de la API
      const mockBackgrounds: CulturalBackground[] = [
        {
          id: 'maya',
          name: 'Maya',
          region: 'Mesoamérica',
          languages: ['k\'iche\'', 'kaqchikel', 'q\'eqchi\'', 'mam'],
          traditions: ['Popol Vuh', 'Calendario Maya', 'Ceremonia del Fuego'],
          values: ['Respeto a la naturaleza', 'Comunidad', 'Sabiduría ancestral'],
          examples: {
            mathematics: [
              'Sistema numérico vigesimal',
              'Cálculo del tiempo con el calendario maya',
              'Geometría en la arquitectura de Tikal'
            ],
            science: [
              'Astronomía y observación de Venus',
              'Medicina tradicional con plantas locales',
              'Agricultura sostenible (milpa)'
            ],
            history: [
              'Historia de los grandes señoríos mayas',
              'Comercio y rutas comerciales',
              'Conquista y resistencia'
            ],
            art: [
              'Arte en jade y obsidiana',
              'Textiles tradicionales',
              'Arquitectura ceremonial'
            ]
          },
          symbols: {
            images: ['/cultural-assets/maya/jaguar.svg', '/cultural-assets/maya/calendar.svg'],
            meanings: ['Fuerza y poder', 'Ciclos del tiempo']
          },
          celebrations: [
            {
              name: 'Wajxaqib\' B\'atz\'',
              description: 'Día sagrado del mono',
              date: 'Variable según calendario maya'
            },
            {
              name: 'K\'at',
              description: 'Ceremonia de agradecimiento',
              date: 'Variable según calendario maya'
            }
          ]
        },
        {
          id: 'afrodescendiente',
          name: 'Afrodescendiente',
          region: 'Caribe y Costa Atlántica',
          languages: ['español', 'criollo', 'patois'],
          traditions: ['Capoeira', 'Candomblé', 'Música afrocaribeña'],
          values: ['Resistencia', 'Comunidad', 'Expresión cultural'],
          examples: {
            mathematics: [
              'Patrones rítmicos en música',
              'Geometría en danzas tradicionales',
              'Medidas en artesanías'
            ],
            science: [
              'Medicina tradicional afro',
              'Agricultura de subsistencia',
              'Navegación costera'
            ],
            history: [
              'Historia de la diáspora africana',
              'Resistencia y cimarronaje',
              'Contribuciones culturales'
            ],
            art: [
              'Música y danza afrocaribeña',
              'Artesanías en madera y fibra',
              'Gastronomía tradicional'
            ]
          },
          symbols: {
            images: ['/cultural-assets/afro/drum.svg', '/cultural-assets/afro/ancestors.svg'],
            meanings: ['Comunicación espiritual', 'Conexión con ancestros']
          },
          celebrations: [
            {
              name: 'Día de la Afrodescendencia',
              description: 'Celebración de la herencia africana',
              date: '31 de agosto'
            },
            {
              name: 'Festival de Tambores',
              description: 'Celebración de la música afro',
              date: 'Variable'
            }
          ]
        },
        {
          id: 'quechua',
          name: 'Quechua',
          region: 'Andes Centrales',
          languages: ['quechua', 'aymara'],
          traditions: ['Pachamama', 'Ayni', 'Minka'],
          values: ['Reciprocidad', 'Respeto a la tierra', 'Comunidad'],
          examples: {
            mathematics: [
              'Sistema de conteo con quipus',
              'Medidas tradicionales',
              'Geometría en textiles'
            ],
            science: [
              'Agricultura en terrazas',
              'Medicina tradicional andina',
              'Astronomía inca'
            ],
            history: [
              'Imperio Inca',
              'Resistencia colonial',
              'Movimientos indígenas'
            ],
            art: [
              'Textiles andinos',
              'Arquitectura en piedra',
              'Música con instrumentos tradicionales'
            ]
          },
          symbols: {
            images: ['/cultural-assets/quechua/inti.svg', '/cultural-assets/quechua/condor.svg'],
            meanings: ['Sol y vida', 'Libertad y sabiduría']
          },
          celebrations: [
            {
              name: 'Inti Raymi',
              description: 'Fiesta del Sol',
              date: '24 de junio'
            },
            {
              name: 'Pachamama',
              description: 'Ofrenda a la Madre Tierra',
              date: '1 de agosto'
            }
          ]
        }
      ];

      setCulturalBackgrounds(mockBackgrounds);
    } catch (error) {
      console.error('Error cargando contextos culturales:', error);
    }
  };

  const generateCulturalAdaptation = useCallback(async () => {
    if (!content || !selectedBackground) return;

    setIsLoading(true);
    try {
      // Simular adaptación cultural con IA
      await new Promise(resolve => setTimeout(resolve, 800));

      const background = culturalBackgrounds.find(bg => bg.id === selectedBackground);
      if (!background) return;

      const adaptation = {
        ...content,
        adaptedContent: {
          ...content.adaptedContent,
          [selectedLanguage]: content.adaptedContent[selectedLanguage] || content.originalContent
        },
        culturalReferences: {
          background: background.name,
          examples: background.examples.mathematics.slice(0, 2),
          symbols: background.symbols.meanings
        },
        localExamples: [
          {
            category: 'Matemáticas',
            examples: background.examples.mathematics
          },
          {
            category: 'Ciencias',
            examples: background.examples.science
          }
        ]
      };

      setAdaptationQuality(calculateCulturalQuality(adaptation, background));
      onAdaptationChange?.(adaptation);
    } catch (error) {
      console.error('Error generando adaptación cultural:', error);
    } finally {
      setIsLoading(false);
    }
  }, [content, selectedBackground, selectedLanguage, culturalBackgrounds, onAdaptationChange]);

  const calculateCulturalQuality = (adaptation: any, background: CulturalBackground): number => {
    let quality = 0;
    let factors = 0;

    // Evaluar traducción
    if (adaptation.adaptedContent[selectedLanguage]) {
      quality += 25;
    }
    factors++;

    // Evaluar referencias culturales
    if (adaptation.culturalReferences.examples.length > 0) {
      quality += 20;
    }
    factors++;

    // Evaluar ejemplos locales
    if (adaptation.localExamples.length > 0) {
      quality += 25;
    }
    factors++;

    // Evaluar multimedia
    const multimediaCount = Object.values(adaptation.multimedia).flat().length;
    quality += Math.min((multimediaCount / 10) * 20, 20);
    factors++;

    // Evaluar accesibilidad cultural
    const accessibilityScore = Object.values(adaptation.accessibility).filter(Boolean).length;
    quality += (accessibilityScore / 4) * 10;
    factors++;

    return Math.round(quality / factors);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    onLanguageChange?.(language);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const currentBackground = culturalBackgrounds.find(bg => bg.id === selectedBackground);

  return (
    <div className={`space-y-6 ${className}`} style={getStyles()}>
      {/* Panel de control cultural */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Contexto Cultural
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                {adaptationQuality}% Adaptado
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showDetails && (
          <CardContent>
            <div className="space-y-4">
              {/* Selector de contexto cultural */}
              <div>
                <h4 className="font-medium mb-3">Contexto Cultural</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {culturalBackgrounds.map((background) => (
                    <Button
                      key={background.id}
                      variant={selectedBackground === background.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedBackground(background.id)}
                      className="justify-start"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {background.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selector de idioma */}
              <div>
                <h4 className="font-medium mb-3">Idioma</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {currentBackground?.languages.map((language) => (
                    <Button
                      key={language}
                      variant={selectedLanguage === language ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleLanguageChange(language)}
                    >
                      <Languages className="h-4 w-4 mr-2" />
                      {language}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Información del contexto cultural */}
              {currentBackground && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium mb-2">Tradiciones</h5>
                    <div className="space-y-1">
                      {currentBackground.traditions.map((tradition, index) => (
                        <Badge key={index} variant="secondary" className="mr-1 mb-1">
                          {tradition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h5 className="font-medium mb-2">Valores</h5>
                    <div className="space-y-1">
                      {currentBackground.values.map((value, index) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Contenido adaptado culturalmente */}
      {isLoading ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Adaptando contenido culturalmente...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Contenido principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Contenido Adaptado
                <Badge variant="outline" className="text-green-600">
                  {selectedLanguage}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="text-lg leading-relaxed">
                  {content.adaptedContent[selectedLanguage] || content.originalContent}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referencias culturales */}
          {content.culturalReferences && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Referencias Culturales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.culturalReferences.examples.map((example, index) => (
                    <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">Ejemplo Cultural</span>
                      </div>
                      <p className="text-sm text-gray-700">{example}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ejemplos locales */}
          {content.localExamples && content.localExamples.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ejemplos Locales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.localExamples.map((category, index) => (
                    <div key={index}>
                      <div 
                        className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg"
                        onClick={() => toggleSection(category.category)}
                      >
                        <h4 className="font-medium">{category.category}</h4>
                        {expandedSections.includes(category.category) ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </div>
                      
                      {expandedSections.includes(category.category) && (
                        <div className="mt-2 space-y-2">
                          {category.examples.map((example, exampleIndex) => (
                            <div key={exampleIndex} className="p-3 bg-white border rounded-lg">
                              <p className="text-sm text-gray-700">{example}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Multimedia cultural */}
          {content.multimedia && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Recursos Multimedia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {content.multimedia.images.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Imágenes</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {content.multimedia.images.length} recursos disponibles
                      </div>
                    </div>
                  )}
                  
                  {content.multimedia.videos.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <VideoIcon className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Videos</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {content.multimedia.videos.length} recursos disponibles
                      </div>
                    </div>
                  )}
                  
                  {content.multimedia.audio.length > 0 && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Audio</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {content.multimedia.audio.length} recursos disponibles
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calidad de adaptación cultural */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Calidad de Adaptación Cultural</span>
                <span className="text-sm text-gray-600">{adaptationQuality}%</span>
              </div>
              <Progress value={adaptationQuality} className="mb-2" />
              <div className="flex items-center gap-2 text-xs text-gray-600">
                {adaptationQuality >= 80 ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>Excelente adaptación cultural</span>
                  </>
                ) : adaptationQuality >= 60 ? (
                  <>
                    <Info className="h-3 w-3 text-yellow-600" />
                    <span>Buena adaptación cultural</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    <span>Necesita más adaptación cultural</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
