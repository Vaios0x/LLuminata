'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Languages, 
  Globe, 
  Mic, 
  Volume2, 
  Settings, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Heart,
  MapPin,
  Users,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface Language {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  type: 'primary' | 'secondary' | 'indigenous';
  region: string;
  speakers: number;
  status: 'active' | 'beta' | 'planned';
  features: {
    translation: boolean;
    speechRecognition: boolean;
    textToSpeech: boolean;
    culturalAdaptation: boolean;
  };
  accessibility: {
    screenReader: boolean;
    voiceSynthesis: boolean;
    subtitles: boolean;
    signLanguage: boolean;
  };
  culturalContext: {
    writingSystem: string;
    readingDirection: 'ltr' | 'rtl';
    numberSystem: string;
    culturalReferences: string[];
  };
  proficiency: number; // 0-100
}

interface LanguageSelectorProps {
  selectedLanguage?: string;
  onLanguageChange?: (language: string) => void;
  onProficiencyChange?: (proficiency: number) => void;
  showIndigenous?: boolean;
  showAccessibility?: boolean;
  className?: string;
}

export default function LanguageSelector({
  selectedLanguage = 'es',
  onLanguageChange,
  onProficiencyChange,
  showIndigenous = true,
  showAccessibility = true,
  className = ''
}: LanguageSelectorProps) {
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [languages, setLanguages] = useState<Language[]>([]);
  const [filteredLanguages, setFilteredLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'primary' | 'secondary' | 'indigenous'>('all');
  const [showDetails, setShowDetails] = useState(false);
  const [detectingLanguage, setDetectingLanguage] = useState(false);
  const [userProficiency, setUserProficiency] = useState(0);
  const [expandedLanguage, setExpandedLanguage] = useState<string | null>(null);

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    filterLanguages();
  }, [languages, searchTerm, selectedType]);

  const loadLanguages = async () => {
    setIsLoading(true);
    try {
      // En producción, esto vendría de la API
      const mockLanguages: Language[] = [
        {
          id: 'es',
          name: 'Español',
          nativeName: 'Español',
          code: 'es',
          type: 'primary',
          region: 'América Latina',
          speakers: 500000000,
          status: 'active',
          features: {
            translation: true,
            speechRecognition: true,
            textToSpeech: true,
            culturalAdaptation: true
          },
          accessibility: {
            screenReader: true,
            voiceSynthesis: true,
            subtitles: true,
            signLanguage: false
          },
          culturalContext: {
            writingSystem: 'Latin',
            readingDirection: 'ltr',
            numberSystem: 'Arabic',
            culturalReferences: ['Día de los Muertos', 'Carnaval', 'Fiesta de San Juan']
          },
          proficiency: 95
        },
        {
          id: 'quc',
          name: 'K\'iche\'',
          nativeName: 'K\'iche\'',
          code: 'quc',
          type: 'indigenous',
          region: 'Guatemala',
          speakers: 1100000,
          status: 'active',
          features: {
            translation: true,
            speechRecognition: true,
            textToSpeech: true,
            culturalAdaptation: true
          },
          accessibility: {
            screenReader: true,
            voiceSynthesis: true,
            subtitles: true,
            signLanguage: false
          },
          culturalContext: {
            writingSystem: 'Latin',
            readingDirection: 'ltr',
            numberSystem: 'Maya',
            culturalReferences: ['Popol Vuh', 'Ceremonia del Fuego', 'Tz\'olkin']
          },
          proficiency: 60
        },
        {
          id: 'pt',
          name: 'Portugués',
          nativeName: 'Português',
          code: 'pt',
          type: 'primary',
          region: 'Brasil',
          speakers: 260000000,
          status: 'active',
          features: {
            translation: true,
            speechRecognition: true,
            textToSpeech: true,
            culturalAdaptation: true
          },
          accessibility: {
            screenReader: true,
            voiceSynthesis: true,
            subtitles: true,
            signLanguage: false
          },
          culturalContext: {
            writingSystem: 'Latin',
            readingDirection: 'ltr',
            numberSystem: 'Arabic',
            culturalReferences: ['Carnaval', 'Capoeira', 'Festa Junina']
          },
          proficiency: 85
        },
        {
          id: 'tzo',
          name: 'Tzotzil',
          nativeName: 'Bats\'i k\'op',
          code: 'tzo',
          type: 'indigenous',
          region: 'México',
          speakers: 450000,
          status: 'beta',
          features: {
            translation: true,
            speechRecognition: false,
            textToSpeech: false,
            culturalAdaptation: true
          },
          accessibility: {
            screenReader: true,
            voiceSynthesis: false,
            subtitles: true,
            signLanguage: false
          },
          culturalContext: {
            writingSystem: 'Latin',
            readingDirection: 'ltr',
            numberSystem: 'Arabic',
            culturalReferences: ['Chamula', 'Zinacantán', 'Tradiciones mayas']
          },
          proficiency: 30
        },
        {
          id: 'en',
          name: 'Inglés',
          nativeName: 'English',
          code: 'en',
          type: 'secondary',
          region: 'Global',
          speakers: 1500000000,
          status: 'active',
          features: {
            translation: true,
            speechRecognition: true,
            textToSpeech: true,
            culturalAdaptation: true
          },
          accessibility: {
            screenReader: true,
            voiceSynthesis: true,
            subtitles: true,
            signLanguage: true
          },
          culturalContext: {
            writingSystem: 'Latin',
            readingDirection: 'ltr',
            numberSystem: 'Arabic',
            culturalReferences: ['Thanksgiving', 'Halloween', 'Christmas']
          },
          proficiency: 90
        },
        {
          id: 'mam',
          name: 'Mam',
          nativeName: 'Mam',
          code: 'mam',
          type: 'indigenous',
          region: 'Guatemala',
          speakers: 520000,
          status: 'planned',
          features: {
            translation: false,
            speechRecognition: false,
            textToSpeech: false,
            culturalAdaptation: false
          },
          accessibility: {
            screenReader: false,
            voiceSynthesis: false,
            subtitles: false,
            signLanguage: false
          },
          culturalContext: {
            writingSystem: 'Latin',
            readingDirection: 'ltr',
            numberSystem: 'Arabic',
            culturalReferences: ['Tradiciones mam', 'Agricultura tradicional']
          },
          proficiency: 20
        }
      ];

      setLanguages(mockLanguages);
      setUserProficiency(mockLanguages.find(lang => lang.code === selectedLanguage)?.proficiency || 0);
    } catch (error) {
      console.error('Error cargando idiomas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLanguages = () => {
    let filtered = languages;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(language =>
        language.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        language.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        language.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(language => language.type === selectedType);
    }

    setFilteredLanguages(filtered);
  };

  const detectLanguage = async () => {
    setDetectingLanguage(true);
    try {
      // Simular detección de idioma
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // En producción, esto usaría la API de detección de idioma
      const detectedLanguage = 'es';
      onLanguageChange?.(detectedLanguage);
      
      if (screenReaderEnabled) {
        speak(`Idioma detectado: Español`);
      }
    } catch (error) {
      console.error('Error detectando idioma:', error);
    } finally {
      setDetectingLanguage(false);
    }
  };

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange?.(languageCode);
    const language = languages.find(lang => lang.code === languageCode);
    if (language) {
      setUserProficiency(language.proficiency);
      onProficiencyChange?.(language.proficiency);
    }
  };

  const handleProficiencyChange = (proficiency: number) => {
    setUserProficiency(proficiency);
    onProficiencyChange?.(proficiency);
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'active': 'green',
      'beta': 'yellow',
      'planned': 'gray'
    };
    return colors[status] || 'gray';
  };

  const getTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'primary': 'blue',
      'secondary': 'purple',
      'indigenous': 'orange'
    };
    return colors[type] || 'gray';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);

  return (
    <div className={`space-y-6 ${className}`} style={getStyles()}>
      {/* Panel principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Selector de Idioma
            </CardTitle>
            <div className="flex items-center gap-2">
              {currentLanguage && (
                <Badge variant="outline" className="text-blue-600">
                  {currentLanguage.name}
                </Badge>
              )}
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
              {/* Búsqueda y filtros */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar idiomas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={detectLanguage}
                  disabled={detectingLanguage}
                  className="flex items-center gap-2"
                >
                  {detectingLanguage ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                  {detectingLanguage ? 'Detectando...' : 'Detectar'}
                </Button>
              </div>

              {/* Filtros de tipo */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Filtrar por tipo:</span>
                <div className="flex items-center gap-2">
                  {(['all', 'primary', 'secondary', 'indigenous'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                    >
                      {type === 'all' ? 'Todos' : 
                       type === 'primary' ? 'Primarios' :
                       type === 'secondary' ? 'Secundarios' : 'Indígenas'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Lista de idiomas */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredLanguages.map((language) => (
                  <div
                    key={language.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedLanguage === language.code
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleLanguageSelect(language.code)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-${getTypeColor(language.type)}-100 rounded-lg flex items-center justify-center`}>
                          <Languages className={`h-5 w-5 text-${getTypeColor(language.type)}-600`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{language.name}</h4>
                            <Badge 
                              variant="outline" 
                              className={`text-${getStatusColor(language.status)}-600 border-${getStatusColor(language.status)}-200`}
                            >
                              {language.status === 'active' ? 'Activo' : 
                               language.status === 'beta' ? 'Beta' : 'Planificado'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{language.nativeName} • {language.code}</p>
                          <p className="text-xs text-gray-500">{formatNumber(language.speakers)} hablantes</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-${getTypeColor(language.type)}-600`}>
                          {language.type === 'primary' ? 'Primario' : 
                           language.type === 'secondary' ? 'Secundario' : 'Indígena'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedLanguage(expandedLanguage === language.code ? null : language.code);
                          }}
                        >
                          {expandedLanguage === language.code ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Detalles expandidos */}
                    {expandedLanguage === language.code && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        {/* Características */}
                        <div>
                          <h5 className="font-medium mb-2">Características</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(language.features).map(([feature, enabled]) => (
                              <div key={feature} className="flex items-center gap-2">
                                {enabled ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-sm">
                                  {feature === 'translation' ? 'Traducción' :
                                   feature === 'speechRecognition' ? 'Reconocimiento' :
                                   feature === 'textToSpeech' ? 'TTS' :
                                   feature === 'culturalAdaptation' ? 'Adaptación' : feature}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Accesibilidad */}
                        {showAccessibility && (
                          <div>
                            <h5 className="font-medium mb-2">Accesibilidad</h5>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(language.accessibility).map(([feature, enabled]) => (
                                <div key={feature} className="flex items-center gap-2">
                                  {enabled ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className="text-sm">
                                    {feature === 'screenReader' ? 'Lector Pantalla' :
                                     feature === 'voiceSynthesis' ? 'Síntesis' :
                                     feature === 'subtitles' ? 'Subtítulos' :
                                     feature === 'signLanguage' ? 'Lengua de Señas' : feature}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Contexto cultural */}
                        <div>
                          <h5 className="font-medium mb-2">Contexto Cultural</h5>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Sistema de escritura: {language.culturalContext.writingSystem}</p>
                            <p>Dirección de lectura: {language.culturalContext.readingDirection.toUpperCase()}</p>
                            <p>Sistema numérico: {language.culturalContext.numberSystem}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Nivel de proficiencia */}
              {currentLanguage && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Tu nivel en {currentLanguage.name}</span>
                    <span className="text-sm text-gray-600">{userProficiency}%</span>
                  </div>
                  <Progress value={userProficiency} className="mb-2" />
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    {userProficiency >= 80 ? (
                      <>
                        <Star className="h-3 w-3 text-yellow-600" />
                        <span>Avanzado</span>
                      </>
                    ) : userProficiency >= 60 ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Intermedio</span>
                      </>
                    ) : (
                      <>
                        <Info className="h-3 w-3 text-blue-600" />
                        <span>Principiante</span>
                      </>
                    )}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={userProficiency}
                    onChange={(e) => handleProficiencyChange(parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Información del idioma seleccionado */}
      {currentLanguage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {currentLanguage.name} ({currentLanguage.nativeName})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Hablantes</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {formatNumber(currentLanguage.speakers)}
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Región</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {currentLanguage.region}
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Características</span>
                </div>
                <div className="text-lg font-bold text-purple-600">
                  {Object.values(currentLanguage.features).filter(Boolean).length}/4
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
