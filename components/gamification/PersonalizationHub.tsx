'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  User, 
  Palette, 
  Settings, 
  Save, 
  RefreshCw, 
  Plus,
  Minus,
  RotateCw,
  Eye,
  EyeOff,
  Download,
  Upload,
  Star,
  Heart,
  Zap,
  Crown,
  Award,
  Gift,
  Coins,
  Package,
  ShoppingCart,
  History,
  Search,
  Filter,
  CheckCircle,
  X,
  AlertTriangle,
  Info,
  Camera,
  Image,
  Sparkles,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Flag,
  Music,
  Volume2,
  VolumeX
} from 'lucide-react';

interface AvatarItem {
  id: string;
  type: 'hair' | 'eyes' | 'mouth' | 'accessory' | 'outfit' | 'background';
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  category: string;
  unlocked: boolean;
  equipped: boolean;
  price?: number;
  currency: 'points' | 'coins' | 'real';
}

interface Theme {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    surface: string;
  };
  unlocked: boolean;
  equipped: boolean;
  price?: number;
  currency: 'points' | 'coins' | 'real';
  features: {
    hasAnimations: boolean;
    hasSounds: boolean;
    hasParticles: boolean;
    isDark: boolean;
    isCultural: boolean;
  };
}

interface UserAvatar {
  id: string;
  currentOutfit: {
    hair: string;
    eyes: string;
    mouth: string;
    accessory: string;
    outfit: string;
    background: string;
  };
  customizations: {
    skinTone: string;
    hairColor: string;
    eyeColor: string;
  };
  animations: {
    idle: string;
    walk: string;
    celebrate: string;
  };
}

interface UserPreferences {
  theme: string;
  language: string;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    voiceVolume: number;
  };
  notifications: {
    push: boolean;
    email: boolean;
    inApp: boolean;
  };
  privacy: {
    showProfile: boolean;
    showProgress: boolean;
    allowMessages: boolean;
  };
}

interface PersonalizationHubProps {
  userId: string;
  className?: string;
  refreshInterval?: number;
}

export const PersonalizationHub: React.FC<PersonalizationHubProps> = ({ 
  userId, 
  className = '',
  refreshInterval = 30000 
}) => {
  const [avatarItems, setAvatarItems] = useState<AvatarItem[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [userAvatar, setUserAvatar] = useState<UserAvatar | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('avatar');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'avatar' | 'theme'>('avatar');

  const loadPersonalizationData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/personalization?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Error cargando datos de personalización');
      }

      const data = await response.json();
      setAvatarItems(data.avatarItems || []);
      setThemes(data.themes || []);
      setUserAvatar(data.userAvatar || null);
      setUserPreferences(data.userPreferences || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const equipAvatarItem = async (itemId: string, type: string) => {
    try {
      const response = await fetch('/api/gamification/personalization/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemId, type })
      });

      if (response.ok) {
        await loadPersonalizationData();
      } else {
        throw new Error('Error al equipar el elemento');
      }
    } catch (err) {
      console.error('Error equipping item:', err);
    }
  };

  const purchaseItem = async (itemId: string, type: 'avatar' | 'theme') => {
    try {
      const response = await fetch('/api/gamification/personalization/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemId, type })
      });

      if (response.ok) {
        await loadPersonalizationData();
      } else {
        throw new Error('Error al comprar el elemento');
      }
    } catch (err) {
      console.error('Error purchasing item:', err);
    }
  };

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    try {
      const response = await fetch('/api/gamification/personalization/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, preferences })
      });

      if (response.ok) {
        await loadPersonalizationData();
      } else {
        throw new Error('Error al actualizar preferencias');
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
    }
  };

  const saveAvatar = async () => {
    try {
      const response = await fetch('/api/gamification/personalization/save-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, avatar: userAvatar })
      });

      if (response.ok) {
        // Mostrar notificación de éxito
      } else {
        throw new Error('Error al guardar el avatar');
      }
    } catch (err) {
      console.error('Error saving avatar:', err);
    }
  };

  useEffect(() => {
    loadPersonalizationData();
    
    const interval = setInterval(loadPersonalizationData, refreshInterval);
    return () => clearInterval(interval);
  }, [loadPersonalizationData, refreshInterval]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'bg-gray-100 text-gray-800';
      case 'UNCOMMON': return 'bg-green-100 text-green-800';
      case 'RARE': return 'bg-blue-100 text-blue-800';
      case 'EPIC': return 'bg-purple-100 text-purple-800';
      case 'LEGENDARY': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'hair': return <User className="w-5 h-5" />;
      case 'eyes': return <Eye className="w-5 h-5" />;
      case 'mouth': return <Heart className="w-5 h-5" />;
      case 'accessory': return <Crown className="w-5 h-5" />;
      case 'outfit': return <Package className="w-5 h-5" />;
      case 'background': return <Image className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CULTURAL': return <Globe className="w-5 h-5" />;
      case 'SEASONAL': return <Sparkles className="w-5 h-5" />;
      case 'SPECIAL': return <Star className="w-5 h-5" />;
      case 'BASIC': return <User className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const filteredAvatarItems = avatarItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredThemes = themes.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         theme.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <Button onClick={loadPersonalizationData} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centro de Personalización</h1>
          <p className="text-gray-600 mt-1">Personaliza tu avatar y temas de la plataforma</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowPreview(true)} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={saveAvatar}>
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
          <TabsTrigger value="themes">Temas</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          <TabsTrigger value="store">Tienda</TabsTrigger>
        </TabsList>

        <TabsContent value="avatar" className="space-y-6">
          {/* Vista previa del avatar */}
          {userAvatar && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Tu Avatar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
                    {/* Aquí iría el renderizado del avatar */}
                    <div className="text-4xl">👤</div>
                    {userAvatar.currentOutfit.accessory && (
                      <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Crown className="w-4 h-4 text-yellow-600" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">Personaliza tu apariencia</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categorías de elementos */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Todos
            </Button>
            <Button
              variant={selectedCategory === 'CULTURAL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('CULTURAL')}
            >
              <Globe className="w-4 h-4 mr-1" />
              Cultural
            </Button>
            <Button
              variant={selectedCategory === 'SEASONAL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('SEASONAL')}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Estacional
            </Button>
            <Button
              variant={selectedCategory === 'SPECIAL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('SPECIAL')}
            >
              <Star className="w-4 h-4 mr-1" />
              Especial
            </Button>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar elementos de avatar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Buscar elementos de avatar"
            />
          </div>

          {/* Elementos de avatar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvatarItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        getItemTypeIcon(item.type)
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getRarityColor(item.rarity)}>
                          {item.rarity}
                        </Badge>
                        {item.equipped && (
                          <Badge className="bg-green-100 text-green-800">
                            Equipado
                          </Badge>
                        )}
                        {!item.unlocked && item.price && (
                          <Badge className="bg-orange-100 text-orange-800">
                            {item.price} {item.currency === 'points' ? 'pts' : item.currency}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    {item.unlocked ? (
                      <Button
                        onClick={() => equipAvatarItem(item.id, item.type)}
                        variant={item.equipped ? 'outline' : 'default'}
                        size="sm"
                        className="flex-1"
                      >
                        {item.equipped ? 'Desequipar' : 'Equipar'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => purchaseItem(item.id, 'avatar')}
                        size="sm"
                        className="flex-1"
                      >
                        <Coins className="w-4 h-4 mr-1" />
                        Comprar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAvatarItems.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No se encontraron elementos</h3>
                <p className="text-gray-500">Intenta cambiar los filtros o busca en la tienda</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="themes" className="space-y-6">
          {/* Tema actual */}
          {userPreferences && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>Tema Actual</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white rounded-lg shadow-md flex items-center justify-center">
                    <Palette className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Tema Personalizado</h3>
                    <p className="text-sm text-gray-600">Tu configuración personalizada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Búsqueda de temas */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar temas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Buscar temas"
            />
          </div>

          {/* Lista de temas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredThemes.map((theme) => (
              <Card key={theme.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="w-full h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                      <Palette className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{theme.name}</h3>
                      <p className="text-sm text-gray-600">{theme.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {theme.equipped && (
                          <Badge className="bg-green-100 text-green-800">
                            Activo
                          </Badge>
                        )}
                        {!theme.unlocked && theme.price && (
                          <Badge className="bg-orange-100 text-orange-800">
                            {theme.price} {theme.currency === 'points' ? 'pts' : theme.currency}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {theme.unlocked ? (
                        <Button
                          onClick={() => updatePreferences({ theme: theme.id })}
                          variant={theme.equipped ? 'outline' : 'default'}
                          size="sm"
                          className="flex-1"
                        >
                          {theme.equipped ? 'Activo' : 'Activar'}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => purchaseItem(theme.id, 'theme')}
                          size="sm"
                          className="flex-1"
                        >
                          <Coins className="w-4 h-4 mr-1" />
                          Comprar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredThemes.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Palette className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No se encontraron temas</h3>
                <p className="text-gray-500">Intenta cambiar los filtros o busca en la tienda</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          {userPreferences && (
            <div className="space-y-6">
              {/* Accesibilidad */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Accesibilidad</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Alto Contraste</label>
                      <p className="text-xs text-gray-600">Mejora la visibilidad del texto</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userPreferences.accessibility.highContrast}
                      onChange={(e) => updatePreferences({
                        accessibility: {
                          ...userPreferences.accessibility,
                          highContrast: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Texto Grande</label>
                      <p className="text-xs text-gray-600">Aumenta el tamaño del texto</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userPreferences.accessibility.largeText}
                      onChange={(e) => updatePreferences({
                        accessibility: {
                          ...userPreferences.accessibility,
                          largeText: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Reducir Movimiento</label>
                      <p className="text-xs text-gray-600">Minimiza las animaciones</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userPreferences.accessibility.reducedMotion}
                      onChange={(e) => updatePreferences({
                        accessibility: {
                          ...userPreferences.accessibility,
                          reducedMotion: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Audio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Volume2 className="w-5 h-5" />
                    <span>Audio</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Volumen Principal</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={userPreferences.audio.masterVolume}
                      onChange={(e) => updatePreferences({
                        audio: {
                          ...userPreferences.audio,
                          masterVolume: parseInt(e.target.value)
                        }
                      })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Volumen de Música</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={userPreferences.audio.musicVolume}
                      onChange={(e) => updatePreferences({
                        audio: {
                          ...userPreferences.audio,
                          musicVolume: parseInt(e.target.value)
                        }
                      })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Volumen de Efectos</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={userPreferences.audio.sfxVolume}
                      onChange={(e) => updatePreferences({
                        audio: {
                          ...userPreferences.audio,
                          sfxVolume: parseInt(e.target.value)
                        }
                      })}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Privacidad */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Privacidad</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Mostrar Perfil</label>
                      <p className="text-xs text-gray-600">Permitir que otros vean tu perfil</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userPreferences.privacy.showProfile}
                      onChange={(e) => updatePreferences({
                        privacy: {
                          ...userPreferences.privacy,
                          showProfile: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Mostrar Progreso</label>
                      <p className="text-xs text-gray-600">Compartir tu progreso de aprendizaje</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userPreferences.privacy.showProgress}
                      onChange={(e) => updatePreferences({
                        privacy: {
                          ...userPreferences.privacy,
                          showProgress: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Permitir Mensajes</label>
                      <p className="text-xs text-gray-600">Recibir mensajes de otros usuarios</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userPreferences.privacy.allowMessages}
                      onChange={(e) => updatePreferences({
                        privacy: {
                          ...userPreferences.privacy,
                          allowMessages: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">Tienda de Personalización</h3>
              <p className="text-gray-500">Próximamente: Compra elementos exclusivos con puntos y monedas</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de vista previa */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Vista Previa</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-48 h-48 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="text-6xl">👤</div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Vista previa de tu avatar personalizado</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PersonalizationHub;
