'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  Volume2, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Upload, 
  Settings,
  Languages,
  User,
  Clock,
  Activity,
  Sliders,
  Save,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Headphones,
  Speaker,
  Music,
  Zap,
  Target,
  Star,
  Heart,
  BookOpen,
  Globe,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para el estudio de voz
interface VoiceProfile {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'child' | 'young' | 'adult' | 'elder';
  accent: string;
  personality: string;
  sampleRate: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

interface VoiceSettings {
  speed: number; // 0.5 - 2.0
  pitch: number; // -12 - 12 semitones
  volume: number; // 0 - 100
  clarity: number; // 0 - 100
  emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'serious';
  emphasis: number; // 0 - 100
  pause: number; // 0 - 2000ms
}

interface AudioTrack {
  id: string;
  text: string;
  voiceProfile: VoiceProfile;
  settings: VoiceSettings;
  duration: number;
  status: 'pending' | 'generating' | 'completed' | 'error';
  audioUrl?: string;
  waveform?: number[];
}

interface VoiceGenerationStudioProps {
  userId: string;
  onGenerate?: (track: AudioTrack) => void;
  onSave?: (project: any) => void;
  onExport?: (audioData: any) => void;
  className?: string;
}

// Perfiles de voz predefinidos
const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'maya_elder_female',
    name: 'Abuela Maya',
    language: 'Maya',
    gender: 'female',
    age: 'elder',
    accent: 'Yucateco',
    personality: 'Sabia y cálida',
    sampleRate: 44100,
    quality: 'high'
  },
  {
    id: 'nahuatl_teacher_male',
    name: 'Maestro Náhuatl',
    language: 'Náhuatl',
    gender: 'male',
    age: 'adult',
    accent: 'Centro',
    personality: 'Autoritativo y respetuoso',
    sampleRate: 48000,
    quality: 'high'
  },
  {
    id: 'zapoteco_storyteller_female',
    name: 'Narradora Zapoteca',
    language: 'Zapoteco',
    gender: 'female',
    age: 'adult',
    accent: 'Oaxaqueño',
    personality: 'Expresiva y narrativa',
    sampleRate: 44100,
    quality: 'high'
  },
  {
    id: 'mixteco_child_male',
    name: 'Niño Mixteco',
    language: 'Mixteco',
    gender: 'male',
    age: 'child',
    accent: 'Mixteco',
    personality: 'Curioso y entusiasta',
    sampleRate: 44100,
    quality: 'medium'
  },
  {
    id: 'purepecha_musician_male',
    name: 'Músico Purépecha',
    language: 'Purépecha',
    gender: 'male',
    age: 'young',
    accent: 'Michoacano',
    personality: 'Rítmico y musical',
    sampleRate: 48000,
    quality: 'high'
  },
  {
    id: 'spanish_teacher_female',
    name: 'Maestra Española',
    language: 'Español',
    gender: 'female',
    age: 'adult',
    accent: 'Mexicano',
    personality: 'Clara y educativa',
    sampleRate: 44100,
    quality: 'high'
  }
];

// Idiomas soportados
const SUPPORTED_LANGUAGES = [
  { code: 'maya', name: 'Maya', flag: '🌿' },
  { code: 'nahuatl', name: 'Náhuatl', flag: '🌺' },
  { code: 'zapoteco', name: 'Zapoteco', flag: '🏺' },
  { code: 'mixteco', name: 'Mixteco', flag: '📜' },
  { code: 'purepecha', name: 'Purépecha', flag: '🎵' },
  { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

export function VoiceGenerationStudio({
  userId,
  onGenerate,
  onSave,
  onExport,
  className
}: VoiceGenerationStudioProps) {
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(VOICE_PROFILES[0]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    speed: 1.0,
    pitch: 0,
    volume: 80,
    clarity: 85,
    emotion: 'neutral',
    emphasis: 50,
    pause: 500
  });
  const [inputText, setInputText] = useState('');
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('Proyecto de Voz');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generar audio
  const generateAudio = useCallback(async () => {
    if (!inputText.trim()) return;

    const track: AudioTrack = {
      id: 'track_' + Date.now(),
      text: inputText,
      voiceProfile: selectedVoice,
      settings: voiceSettings,
      duration: 0,
      status: 'pending'
    };

    setTracks(prev => [...prev, track]);
    setIsGenerating(true);

    try {
      // Simular generación de audio
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const updatedTrack: AudioTrack = {
        ...track,
        status: 'completed',
        duration: Math.random() * 30 + 10, // 10-40 segundos
        audioUrl: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
        waveform: Array.from({ length: 100 }, () => Math.random() * 100)
      };

      setTracks(prev => prev.map(t => t.id === track.id ? updatedTrack : t));
      
      if (onGenerate) {
        onGenerate(updatedTrack);
      }
    } catch (error) {
      console.error('Error generando audio:', error);
      setTracks(prev => prev.map(t => t.id === track.id ? { ...t, status: 'error' } : t));
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, selectedVoice, voiceSettings, onGenerate]);

  // Reproducir audio
  const playAudio = useCallback((trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track?.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      setCurrentTrack(trackId);
    }
  }, [tracks]);

  // Pausar audio
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Detener audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  }, []);

  // Descargar audio
  const downloadAudio = useCallback((trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track?.audioUrl || !track?.voiceProfile) return;

    const link = document.createElement('a');
    link.href = track.audioUrl;
    link.download = track.voiceProfile.name + '_' + track.id + '.wav';
    link.click();
  }, [tracks]);

  // Eliminar track
  const removeTrack = useCallback((trackId: string) => {
    setTracks(prev => prev.filter(t => t.id !== trackId));
  }, []);

  // Guardar proyecto
  const saveProject = useCallback(() => {
    const project = {
      name: projectName,
      userId,
      tracks,
      settings: voiceSettings,
      timestamp: new Date().toISOString()
    };
    
    if (onSave) {
      onSave(project);
    }
  }, [projectName, userId, tracks, voiceSettings, onSave]);

  // Exportar proyecto
  const exportProject = useCallback(() => {
    if (onExport) {
      onExport({
        tracks,
        settings: voiceSettings,
        metadata: {
          name: projectName,
          userId,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [tracks, voiceSettings, projectName, userId, onExport]);

  // Manejar fin de audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTrack(null);
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  return (
    <Card className={cn("w-full max-w-7xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-6 h-6 text-purple-600" />
              Estudio de Generación de Voz
            </CardTitle>
            <CardDescription>
              Crea voces personalizadas en múltiples idiomas indígenas
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
              placeholder="Nombre del proyecto"
              tabIndex={0}
              aria-label="Nombre del proyecto"
            />
            <Button variant="outline" size="sm" onClick={saveProject}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Panel de Configuración de Voz */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil de Voz
            </h3>
            
            <div className="space-y-3">
              {VOICE_PROFILES.map((profile) => (
                <div
                  key={profile.id}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all",
                    selectedVoice.id === profile.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => setSelectedVoice(profile)}
                  tabIndex={0}
                  role="button"
                  aria-label={'Seleccionar perfil de voz: ' + profile.name}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedVoice(profile)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Speaker className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{profile.name}</h4>
                      <p className="text-sm text-muted-foreground">{profile.language}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {profile.gender}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {profile.age}
                        </Badge>
                      </div>
                    </div>
                    {selectedVoice.id === profile.id && (
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Configuración de Voz */}
            <div className="space-y-4 mt-6">
              <h4 className="font-medium flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Configuración de Voz
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Velocidad</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={voiceSettings.speed}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                      className="flex-1"
                      tabIndex={0}
                      aria-label="Ajustar velocidad de voz"
                    />
                    <span className="text-sm w-12">{voiceSettings.speed}x</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tono</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={voiceSettings.pitch}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseInt(e.target.value) }))}
                      className="flex-1"
                      tabIndex={0}
                      aria-label="Ajustar tono de voz"
                    />
                    <span className="text-sm w-12">{voiceSettings.pitch}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Volumen</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={voiceSettings.volume}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                      className="flex-1"
                      tabIndex={0}
                      aria-label="Ajustar volumen"
                    />
                    <span className="text-sm w-12">{voiceSettings.volume}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Claridad</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={voiceSettings.clarity}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, clarity: parseInt(e.target.value) }))}
                      className="flex-1"
                      tabIndex={0}
                      aria-label="Ajustar claridad"
                    />
                    <span className="text-sm w-12">{voiceSettings.clarity}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Emoción</label>
                  <select
                    value={voiceSettings.emotion}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, emotion: e.target.value as any }))}
                    className="w-full p-2 border rounded-md"
                    tabIndex={0}
                    aria-label="Seleccionar emoción"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="happy">Feliz</option>
                    <option value="sad">Triste</option>
                    <option value="excited">Emocionado</option>
                    <option value="calm">Tranquilo</option>
                    <option value="serious">Serio</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Énfasis</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={voiceSettings.emphasis}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, emphasis: parseInt(e.target.value) }))}
                      className="flex-1"
                      tabIndex={0}
                      aria-label="Ajustar énfasis"
                    />
                    <span className="text-sm w-12">{voiceSettings.emphasis}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Entrada de Texto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Texto a Convertir
            </h3>
            
            <div className="space-y-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe el texto que quieres convertir a voz..."
                className="w-full h-32 p-3 border rounded-md resize-none"
                tabIndex={0}
                aria-label="Texto para convertir a voz"
              />
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{inputText.length} caracteres</span>
                <span>~{Math.ceil(inputText.length / 15)} segundos estimados</span>
              </div>
              
              <Button
                onClick={generateAudio}
                disabled={!inputText.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generar Audio
                  </>
                )}
              </Button>
            </div>

            {/* Controles de Audio */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                Controles de Reproducción
              </h4>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => currentTrack && playAudio(currentTrack)}
                  disabled={!currentTrack || isPlaying}
                >
                  <Play className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pauseAudio}
                  disabled={!isPlaying}
                >
                  <Pause className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopAudio}
                  disabled={!isPlaying && !currentTrack}
                >
                  <Square className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Panel de Pistas de Audio */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Pistas Generadas
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tracks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay pistas generadas</p>
                  <p className="text-sm">Genera tu primera pista de audio</p>
                </div>
              ) : (
                tracks.map((track) => (
                  <div
                    key={track.id}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{track.voiceProfile?.name || 'Voz sin nombre'}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{track.text}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant={
                            track.status === 'completed' ? 'default' :
                            track.status === 'generating' ? 'secondary' :
                            track.status === 'error' ? 'destructive' : 'outline'
                          }
                          className="text-xs"
                        >
                          {track.status === 'completed' ? 'Listo' :
                           track.status === 'generating' ? 'Generando' :
                           track.status === 'error' ? 'Error' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>
                    
                    {track.status === 'completed' && (
                      <>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Duración</span>
                            <span>{Math.round(track.duration)}s</span>
                          </div>
                          <Progress value={100} className="h-1" />
                        </div>
                        
                        {track.waveform && (
                          <div className="mb-2">
                            <div className="flex items-end gap-px h-8">
                              {track.waveform.slice(0, 20).map((value, index) => (
                                <div
                                  key={index}
                                  className="bg-purple-400 rounded-sm flex-1"
                                  style={{ height: value + '%' }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playAudio(track.id)}
                            disabled={isPlaying && currentTrack === track.id}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadAudio(track.id)}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeTrack(track.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </>
                    )}
                    
                    {track.status === 'generating' && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Generando audio...</span>
                      </div>
                    )}
                    
                    {track.status === 'error' && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Error en la generación</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveProject}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Proyecto
          </Button>
          <Button variant="outline" onClick={exportProject} disabled={tracks.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{tracks.length} pistas</span>
          <span>•</span>
          <span>{tracks.filter(t => t.status === 'completed').length} completadas</span>
        </div>
      </CardFooter>
      
      {/* Audio element oculto */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </Card>
  );
}
