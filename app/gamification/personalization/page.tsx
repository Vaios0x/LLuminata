'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Palette, 
  Settings, 
  User, 
  Star, 
  Target, 
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  UserPlus,
  Award,
  Zap,
  Heart,
  Flag,
  BookOpen,
  Globe,
  Lock,
  Unlock,
  CheckCircle,
  X,
  AlertTriangle,
  Users2,
  Building2,
  Sword,
  Shield as ShieldIcon,
  Video,
  Mic,
  Camera,
  MessageSquare,
  Share2,
  Bookmark,
  Bell,
  Play,
  Pause,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ShoppingCart,
  Package,
  Tag,
  Percent,
  Minus,
  Equal,
  Sparkles,
  Crown,
  Coins,
  Gift,
  Palette as PaletteIcon,
  Brush,
  Image,
  Download,
  Upload,
  Save,
  Trash2,
  RotateCcw,
  Eye as EyeIcon,
  EyeOff,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Interfaces
interface CustomizationItem {
  id: string;
  name: string;
  description: string;
  type: 'AVATAR' | 'THEME' | 'SOUND' | 'ANIMATION' | 'UI_ELEMENT' | 'BACKGROUND';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  value: number;
  isUnlocked: boolean;
  isEquipped: boolean;
  canUnlock: boolean;
  unlockRequirements: {
    level: number;
    experience: number;
    badges: string[];
    achievements: string[];
  };
  preview?: string;
  tags: string[];
}

interface UserCustomization {
  avatar: CustomizationItem | null;
  theme: CustomizationItem | null;
  sounds: CustomizationItem[];
  animations: CustomizationItem[];
  uiElements: CustomizationItem[];
  backgrounds: CustomizationItem[];
  settings: {
    soundEnabled: boolean;
    animationsEnabled: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
    colorScheme: 'light' | 'dark' | 'auto';
  };
}

interface CustomizationFilters {
  search: string;
  type: string;
  rarity: string;
  status: string;
}

export default function PersonalizationPage() {
  const [customizationItems, setCustomizationItems] = useState<CustomizationItem[]>([]);
  const [userCustomization, setUserCustomization] = useState<UserCustomization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CustomizationFilters>({
    search: '',
    type: 'all',
    rarity: 'all',
    status: 'all'
  });
  const [selectedItem, setSelectedItem] = useState<CustomizationItem | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked' | 'equipped'>('all');

  // Datos de ejemplo
  const mockCustomizationItems: CustomizationItem[] = [
    {
      id: 'avatar_1',
      name: 'Avatar Maya',
      description: 'Un avatar inspirado en la cultura maya con elementos tradicionales.',
      type: 'AVATAR',
      rarity: 'RARE',
      value: 500,
      isUnlocked: true,
      isEquipped: true,
      canUnlock: false,
      unlockRequirements: {
        level: 5,
        experience: 1000,
        badges: ['badge_cultural_awareness'],
        achievements: []
      },
      tags: ['Maya', 'Cultural', 'Tradicional']
    },
    {
      id: 'theme_1',
      name: 'Tema Oscuro Elegante',
      description: 'Un tema oscuro con acentos dorados para una experiencia premium.',
      type: 'THEME',
      rarity: 'EPIC',
      value: 750,
      isUnlocked: true,
      isEquipped: false,
      canUnlock: false,
      unlockRequirements: {
        level: 3,
        experience: 500,
        badges: [],
        achievements: []
      },
      tags: ['Oscuro', 'Elegante', 'Premium']
    },
    {
      id: 'sound_1',
      name: 'Sonidos Indígenas',
      description: 'Efectos de sonido inspirados en instrumentos indígenas tradicionales.',
      type: 'SOUND',
      rarity: 'UNCOMMON',
      value: 200,
      isUnlocked: false,
      isEquipped: false,
      canUnlock: true,
      unlockRequirements: {
        level: 2,
        experience: 200,
        badges: ['badge_beginner'],
        achievements: []
      },
      tags: ['Indígena', 'Tradicional', 'Cultural']
    },
    {
      id: 'animation_1',
      name: 'Animación de Celebración Maya',
      description: 'Animación especial que celebra logros con elementos mayas.',
      type: 'ANIMATION',
      rarity: 'LEGENDARY',
      value: 1000,
      isUnlocked: false,
      isEquipped: false,
      canUnlock: false,
      unlockRequirements: {
        level: 8,
        experience: 2000,
        badges: ['badge_expert', 'badge_cultural_master'],
        achievements: ['achievement_maya_scholar']
      },
      tags: ['Maya', 'Celebración', 'Legendario']
    }
  ];

  const mockUserCustomization: UserCustomization = {
    avatar: mockCustomizationItems[0],
    theme: null,
    sounds: [],
    animations: [],
    uiElements: [],
    backgrounds: [],
    settings: {
      soundEnabled: true,
      animationsEnabled: true,
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium',
      colorScheme: 'auto'
    }
  };

  useEffect(() => {
    loadCustomizationData();
  }, []);

  const loadCustomizationData = async () => {
    try {
      setLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch('/api/gamification/personalization');
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCustomizationItems(mockCustomizationItems);
      setUserCustomization(mockUserCustomization);
    } catch (err) {
      setError('Error al cargar los datos de personalización');
    } finally {
      setLoading(false);
    }
  };

  const unlockItem = async (itemId: string) => {
    try {
      // En producción, esto sería una llamada a la API
      // await fetch(`/api/gamification/personalization/unlock`, { method: 'POST', body: JSON.stringify({ itemId }) });
      
      setCustomizationItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, isUnlocked: true, canUnlock: false }
          : item
      ));
    } catch (err) {
      setError('Error al desbloquear el item');
    }
  };

  const equipItem = async (itemId: string) => {
    try {
      // En producción, esto sería una llamada a la API
      // await fetch(`/api/gamification/personalization/equip`, { method: 'POST', body: JSON.stringify({ itemId }) });
      
      setCustomizationItems(prev => prev.map(item => 
        item.type === selectedItem?.type
          ? { ...item, isEquipped: item.id === itemId }
          : item
      ));
      
      setUserCustomization(prev => {
        if (!prev || !selectedItem) return prev;
        
        const updatedItem = customizationItems.find(item => item.id === itemId);
        if (!updatedItem) return prev;
        
        switch (selectedItem.type) {
          case 'AVATAR':
            return { ...prev, avatar: updatedItem };
          case 'THEME':
            return { ...prev, theme: updatedItem };
          case 'SOUND':
            return { ...prev, sounds: [...prev.sounds.filter(s => s.id !== itemId), updatedItem] };
          case 'ANIMATION':
            return { ...prev, animations: [...prev.animations.filter(a => a.id !== itemId), updatedItem] };
          default:
            return prev;
        }
      });
    } catch (err) {
      setError('Error al equipar el item');
    }
  };

  const updateSettings = (updates: Partial<UserCustomization['settings']>) => {
    setUserCustomization(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: { ...prev.settings, ...updates }
      };
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'text-gray-600 bg-gray-100';
      case 'UNCOMMON': return 'text-green-600 bg-green-100';
      case 'RARE': return 'text-blue-600 bg-blue-100';
      case 'EPIC': return 'text-purple-600 bg-purple-100';
      case 'LEGENDARY': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'AVATAR': return <User className="w-4 h-4" />;
      case 'THEME': return <Palette className="w-4 h-4" />;
      case 'SOUND': return <Volume2 className="w-4 h-4" />;
      case 'ANIMATION': return <Sparkles className="w-4 h-4" />;
      case 'UI_ELEMENT': return <Settings className="w-4 h-4" />;
      case 'BACKGROUND': return <Image className="w-4 h-4" />;
      default: return <Palette className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'AVATAR': return 'text-blue-600 bg-blue-100';
      case 'THEME': return 'text-purple-600 bg-purple-100';
      case 'SOUND': return 'text-green-600 bg-green-100';
      case 'ANIMATION': return 'text-pink-600 bg-pink-100';
      case 'UI_ELEMENT': return 'text-orange-600 bg-orange-100';
      case 'BACKGROUND': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredItems = customizationItems.filter(item => {
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.type !== 'all' && item.type !== filters.type) return false;
    if (filters.rarity !== 'all' && item.rarity !== filters.rarity) return false;
    if (filters.status !== 'all') {
      if (filters.status === 'unlocked' && !item.isUnlocked) return false;
      if (filters.status === 'locked' && item.isUnlocked) return false;
      if (filters.status === 'equipped' && !item.isEquipped) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Personalización</h1>
            <p className="text-gray-600">Personaliza tu experiencia de aprendizaje</p>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Unlock className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Desbloqueados</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {customizationItems.filter(item => item.isUnlocked).length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Bloqueados</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {customizationItems.filter(item => !item.isUnlocked).length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Equipados</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {customizationItems.filter(item => item.isEquipped).length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Total Items</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {customizationItems.length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="flex space-x-1 border-b mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            activeTab === 'all' 
              ? "bg-purple-100 text-purple-700 border-b-2 border-purple-700" 
              : "text-gray-600 hover:text-gray-800"
          )}
          tabIndex={0}
          aria-label="Ver todos los items"
        >
          Todos
        </button>
        <button
          onClick={() => setActiveTab('unlocked')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            activeTab === 'unlocked' 
              ? "bg-purple-100 text-purple-700 border-b-2 border-purple-700" 
              : "text-gray-600 hover:text-gray-800"
          )}
          tabIndex={0}
          aria-label="Ver items desbloqueados"
        >
          Desbloqueados
        </button>
        <button
          onClick={() => setActiveTab('locked')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            activeTab === 'locked' 
              ? "bg-purple-100 text-purple-700 border-b-2 border-purple-700" 
              : "text-gray-600 hover:text-gray-800"
          )}
          tabIndex={0}
          aria-label="Ver items bloqueados"
        >
          Bloqueados
        </button>
        <button
          onClick={() => setActiveTab('equipped')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            activeTab === 'equipped' 
              ? "bg-purple-100 text-purple-700 border-b-2 border-purple-700" 
              : "text-gray-600 hover:text-gray-800"
          )}
          tabIndex={0}
          aria-label="Ver items equipados"
        >
          Equipados
        </button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar personalizaciones..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  tabIndex={0}
                  aria-label="Buscar personalizaciones"
                />
              </div>
            </div>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              tabIndex={0}
              aria-label="Filtrar por tipo"
            >
              <option value="all">Todos los tipos</option>
              <option value="AVATAR">Avatares</option>
              <option value="THEME">Temas</option>
              <option value="SOUND">Sonidos</option>
              <option value="ANIMATION">Animaciones</option>
              <option value="UI_ELEMENT">Elementos UI</option>
              <option value="BACKGROUND">Fondos</option>
            </select>
            
            <select
              value={filters.rarity}
              onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              tabIndex={0}
              aria-label="Filtrar por rareza"
            >
              <option value="all">Todas las rarezas</option>
              <option value="COMMON">Común</option>
              <option value="UNCOMMON">Poco Común</option>
              <option value="RARE">Raro</option>
              <option value="EPIC">Épico</option>
              <option value="LEGENDARY">Legendario</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Configuración actual */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-purple-600" />
            <span>Configuración Actual</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sonido</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSettings({ soundEnabled: !userCustomization?.settings.soundEnabled })}
                  tabIndex={0}
                  aria-label="Alternar sonido"
                >
                  {userCustomization?.settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Animaciones</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSettings({ animationsEnabled: !userCustomization?.settings.animationsEnabled })}
                  tabIndex={0}
                  aria-label="Alternar animaciones"
                >
                  {userCustomization?.settings.animationsEnabled ? <EyeIcon className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tema</span>
                <select
                  value={userCustomization?.settings.colorScheme}
                  onChange={(e) => updateSettings({ colorScheme: e.target.value as any })}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  tabIndex={0}
                  aria-label="Seleccionar tema"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de items de personalización */}
      <div className="space-y-6">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Palette className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron items</h3>
              <p className="text-gray-600">Intenta ajustar los filtros o completa más actividades para desbloquear personalizaciones</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={cn("text-xs", getTypeColor(item.type))}>
                            {item.type === 'AVATAR' ? 'Avatar' :
                             item.type === 'THEME' ? 'Tema' :
                             item.type === 'SOUND' ? 'Sonido' :
                             item.type === 'ANIMATION' ? 'Animación' :
                             item.type === 'UI_ELEMENT' ? 'UI' : 'Fondo'}
                          </Badge>
                          <Badge className={cn("text-xs", getRarityColor(item.rarity))}>
                            {item.rarity === 'COMMON' ? 'Común' :
                             item.rarity === 'UNCOMMON' ? 'Poco Común' :
                             item.rarity === 'RARE' ? 'Raro' :
                             item.rarity === 'EPIC' ? 'Épico' : 'Legendario'}
                          </Badge>
                          {item.isEquipped && (
                            <Badge className="text-xs bg-green-100 text-green-800">
                              Equipado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Requisitos de desbloqueo */}
                  {!item.isUnlocked && (
                    <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                      <h4 className="text-sm font-medium text-orange-900 mb-2">Requisitos para desbloquear</h4>
                      <div className="space-y-1 text-xs text-orange-800">
                        <div>Nivel {item.unlockRequirements.level}+</div>
                        <div>{item.unlockRequirements.experience} experiencia</div>
                        {item.unlockRequirements.badges.length > 0 && (
                          <div>{item.unlockRequirements.badges.length} badges requeridos</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex space-x-2">
                    {item.isUnlocked ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowPreviewModal(true);
                          }}
                          className="flex-1"
                          tabIndex={0}
                          aria-label="Vista previa del item"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Vista Previa
                        </Button>
                        <Button
                          variant={item.isEquipped ? "default" : "outline"}
                          size="sm"
                          onClick={() => equipItem(item.id)}
                          className="flex-1"
                          tabIndex={0}
                          aria-label={item.isEquipped ? "Desequipar item" : "Equipar item"}
                        >
                          {item.isEquipped ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Equipado
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Equipar
                            </>
                          )}
                        </Button>
                      </>
                    ) : item.canUnlock ? (
                      <Button
                        onClick={() => unlockItem(item.id)}
                        className="w-full"
                        tabIndex={0}
                        aria-label="Desbloquear item"
                      >
                        <Unlock className="w-4 h-4 mr-2" />
                        Desbloquear
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        disabled
                        className="w-full"
                        tabIndex={0}
                        aria-label="No cumple los requisitos para desbloquear"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Requisitos No Cumplidos
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de vista previa */}
      {showPreviewModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <span>Vista Previa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    {getTypeIcon(selectedItem.type)}
                  </div>
                  <h4 className="font-medium">{selectedItem.name}</h4>
                  <p className="text-sm text-gray-600">{selectedItem.description}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreviewModal(false)}
                    className="flex-1"
                    tabIndex={0}
                    aria-label="Cerrar vista previa"
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => {
                      equipItem(selectedItem.id);
                      setShowPreviewModal(false);
                    }}
                    className="flex-1"
                    tabIndex={0}
                    aria-label="Equipar item"
                  >
                    Equipar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
