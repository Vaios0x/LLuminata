'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { 
  Database, 
  HardDrive, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Settings,
  FileText,
  ImageIcon,
  VideoIcon,
  Volume2,
  Archive,
  FolderOpen,
  FileCheck,
  FileX,
  FileClock,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Palette,
  Zap,
  Sparkles,
  Download,
  Upload,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Users,
  Globe,
  Shield,
  Lock,
  Unlock,
  Key,
  Server,
  Network,
  Activity,
  TrendingUp,
  TrendingDown,
  Timer,
  History,
  RotateCcw,
  Play,
  Pause,
  Square,
  Search,
  Filter,
  Heart,
  MapPin,
  BookOpen,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
  Save,
  Edit,
  Copy,
  Share,
  MoreHorizontal,
  Grid,
  List,
  Maximize2,
  Minimize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Crop,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List as ListIcon,
  Link,
  Image,
  Video,
  Music,
  File,
  Folder,
  Home,
  User,
  Mail,
  Phone,
  Map,
  Navigation,
  Compass,
  Target,
  Award,
  Trophy,
  Medal,
  Crown,
  Gift,
  ShoppingCart,
  CreditCard,
  DollarSign,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart3,
  PieChart,
  LineChart,
  ScatterChart,
  AreaChart,
  Gauge,
  Thermometer,
  Droplets,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  Zap as Lightning,
  Flame,
  Snowflake,
  Leaf,
  Trees,
  Flower,
  Sprout,
  Bug,
  Fish,
  Bird,
  Cat,
  Dog,
  Circle,
  Beef,
  PiggyBank,
  Sheet,
  Egg,
  CircleDot,
  CircleDot as Butterfly,
  CircleDot as Spider,
  CircleDot as Snake,
  CircleDot as Turtle,
  CircleDot as Frog,
  CircleDot as Whale,
  CircleDot as Dolphin,
  CircleDot as Shark,
  CircleDot as Octopus,
  CircleDot as Crab,
  CircleDot as Lobster,
  CircleDot as Shrimp,
  CircleDot as Clam,
  CircleDot as Starfish,
  CircleDot as Coral,
  CircleDot as Algae,
  CircleDot as Mushroom,
  CircleDot as Cactus,
  CircleDot as Palm,
  CircleDot as Bamboo,
  Rss,
  CircleDot as Wheat,
  CircleDot as Corn,
  CircleDot as Rice,
  CircleDot as Potato,
  CircleDot as Carrot,
  CircleDot as Tomato,
  CircleDot as Apple,
  CircleDot as Orange,
  CircleDot as Banana,
  CircleDot as Grape,
  CircleDot as Strawberry,
  CircleDot as Cherry,
  CircleDot as Peach,
  Ear,
  CircleDot as Pineapple,
  CircleDot as Mango,
  CircleDot as Avocado,
  CircleDot as Lemon,
  CircleDot as Lime,
  CircleDot as Coconut,
  Nut,
  Coffee,
  CircleDot as Tea,
  CircleDot as Wine,
  CircleDot as Beer,
  CircleDot as Milk,
  CircleDot as Water,
  CircleDot as Juice,
  CircleDot as Soda,
  CircleDot as IceCream,
  CircleDot as Cake,
  CircleDot as Cookie,
  Bed,
  CircleDot as Pizza,
  CircleDot as Hamburger,
  CircleDot as HotDog,
  CircleDot as Taco,
  CircleDot as Sushi,
  CircleDot as RiceIcon,
  CircleDot as Noodles,
  CircleDot as Soup,
  CircleDot as Salad,
  CircleDot as Sandwich,
  CircleDot as Steak,
  CircleDot as ChickenIcon,
  CircleDot as FishIcon,
  CircleDot as Cheese,
  CircleDot as Yogurt,
  CircleDot as Butter,
  CircleDot as Oil,
  CircleDot as Salt,
  CircleDot as Pepper,
  CircleDot as Sugar,
  Phone as Honey,
  CircleDot as Jam,
  CircleDot as Ketchup,
  CircleDot as Mustard,
  CircleDot as Mayo,
  CircleDot as Vinegar,
  CircleDot as SoySauce,
  CircleDot as HotSauce,
  CircleDot as Garlic,
  CircleDot as Onion,
  CircleDot as Ginger,
  CircleDot as Basil,
  CircleDot as Oregano,
  CircleDot as Thyme,
  CircleDot as Rosemary,
  CircleDot as Mint,
  CircleDot as Cinnamon,
  CircleDot as Vanilla,
  CircleDot as Chocolate,
  CircleDot as Caramel,
  Nut as Nuts,
  CircleDot as Raisins,
  CircleDot as Cranberries,
  CircleDot as Blueberries,
  CircleDot as Raspberries,
  CircleDot as Blackberries,
  CircleDot as Gooseberries,
  CircleDot as Currants,
  CircleDot as Figs,
  CircleDot as Dates,
  CircleDot as Prunes,
  CircleDot as Apricots,
  Plus as Plums,
  CircleDot as Nectarines,
  CircleDot as Kiwi,
  CircleDot as PassionFruit,
  CircleDot as DragonFruit,
  CircleDot as Lychee,
  CircleDot as Rambutan,
  CircleDot as Durian,
  CircleDot as Jackfruit,
  CircleDot as Breadfruit,
  CircleDot as Plantain,
  CircleDot as Yam,
  CircleDot as SweetPotato,
  CircleDot as Cassava,
  CircleDot as Taro,
  CircleDot as Yuca,
  CircleDot as Jicama,
  Radius as Radish,
  CircleDot as Turnip,
  CircleDot as Beet,
  CircleDot as Parsnip,
  CircleDot as Celery,
  CircleDot as Cucumber,
  CircleDot as Zucchini,
  CircleDot as Squash,
  CircleDot as Pumpkin,
  CircleDot as Melon,
  CircleDot as Watermelon,
  CircleDot as Cantaloupe,
  CircleDot as Honeydew,
  CircleDot as Papaya,
  CircleDot as Guava,
  CircleDot as Sapodilla,
  CircleDot as Soursop,
  CircleDot as CustardApple,
  CircleDot as SugarApple,
  CircleDot as Cherimoya,
  CircleDot as Atemoya,
  CircleDot as Rollinia,
  CircleDot as Biriba,
  CircleDot as Guanabana,
  CircleDot as Graviola,
  CircleDot as GuanabanaIcon,
  CircleDot as SoursopIcon,
  CircleDot as CustardAppleIcon,
  CircleDot as SugarAppleIcon,
  CircleDot as CherimoyaIcon,
  CircleDot as AtemoyaIcon,
  CircleDot as RolliniaIcon,
  CircleDot as BiribaIcon
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface CachedItem {
  id: string;
  type: 'lesson' | 'quiz' | 'media' | 'resource' | 'data' | 'image' | 'video' | 'audio';
  title: string;
  size: number; // en bytes
  lastAccessed: Date;
  lastModified: Date;
  expiresAt?: Date;
  status: 'valid' | 'expired' | 'corrupted' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'critical';
  culturalContext?: string;
  accessibility: string[];
  tags: string[];
  compressionRatio?: number;
  hitCount: number;
  errorCount: number;
}

interface CacheStats {
  totalItems: number;
  totalSize: number; // en bytes
  usedSpace: number; // en bytes
  availableSpace: number; // en bytes
  hitRate: number; // porcentaje
  missRate: number; // porcentaje
  averageAccessTime: number; // en milisegundos
  compressionSavings: number; // en bytes
  expiredItems: number;
  corruptedItems: number;
}

interface CachePolicy {
  maxSize: number; // en bytes
  maxAge: number; // en días
  maxItems: number;
  compressionEnabled: boolean;
  compressionLevel: 'low' | 'medium' | 'high';
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'random';
  culturalPriority: string[];
  accessibilityPriority: string[];
  autoCleanup: boolean;
  cleanupInterval: number; // en horas
}

interface CacheManagerProps {
  onCacheUpdate?: (stats: CacheStats) => void;
  onItemEvicted?: (itemId: string) => void;
  onCacheCleared?: () => void;
  className?: string;
}

export default function CacheManager({
  onCacheUpdate,
  onItemEvicted,
  onCacheCleared,
  className = ''
}: CacheManagerProps) {
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [cachedItems, setCachedItems] = useState<CachedItem[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalItems: 0,
    totalSize: 0,
    usedSpace: 0,
    availableSpace: 0,
    hitRate: 0,
    missRate: 0,
    averageAccessTime: 0,
    compressionSavings: 0,
    expiredItems: 0,
    corruptedItems: 0
  });
  const [cachePolicy, setCachePolicy] = useState<CachePolicy>({
    maxSize: 100 * 1024 * 1024, // 100MB
    maxAge: 30, // 30 días
    maxItems: 1000,
    compressionEnabled: true,
    compressionLevel: 'medium',
    evictionPolicy: 'lru',
    culturalPriority: ['maya', 'nahuatl'],
    accessibilityPriority: ['screenReader', 'highContrast'],
    autoCleanup: true,
    cleanupInterval: 24 // 24 horas
  });
  const [showDetails, setShowDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'items' | 'analytics'>('overview');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'lastAccessed' | 'priority'>('lastAccessed');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    loadCachedItems();
    loadCacheStats();
    
    // Configurar limpieza automática si está habilitada
    if (cachePolicy.autoCleanup) {
      const interval = setInterval(() => {
        handleAutoCleanup();
      }, cachePolicy.cleanupInterval * 60 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [cachePolicy.autoCleanup, cachePolicy.cleanupInterval]);

  const loadCachedItems = async () => {
    try {
      // En producción, esto vendría de IndexedDB o Cache API
      const mockItems: CachedItem[] = [
        {
          id: 'lesson-maya-1',
          type: 'lesson',
          title: 'Matemáticas Mayas: Sistema Numérico',
          size: 2048576, // 2MB
          lastAccessed: new Date('2024-01-15T14:30:00'),
          lastModified: new Date('2024-01-10T10:00:00'),
          expiresAt: new Date('2024-02-10T10:00:00'),
          status: 'valid',
          priority: 'high',
          culturalContext: 'maya',
          accessibility: ['screenReader', 'highContrast'],
          tags: ['matemáticas', 'maya', 'sistema-numérico'],
          compressionRatio: 0.75,
          hitCount: 45,
          errorCount: 0
        },
        {
          id: 'quiz-maya-1',
          type: 'quiz',
          title: 'Evaluación de Conocimientos Mayas',
          size: 512000, // 512KB
          lastAccessed: new Date('2024-01-15T13:15:00'),
          lastModified: new Date('2024-01-12T15:30:00'),
          expiresAt: new Date('2024-02-12T15:30:00'),
          status: 'valid',
          priority: 'medium',
          culturalContext: 'maya',
          accessibility: ['screenReader', 'keyboardNavigation'],
          tags: ['evaluación', 'maya', 'conocimientos'],
          compressionRatio: 0.8,
          hitCount: 23,
          errorCount: 0
        },
        {
          id: 'video-maya-ceremony',
          type: 'video',
          title: 'Video: Ceremonia Maya Tradicional',
          size: 52428800, // 50MB
          lastAccessed: new Date('2024-01-14T09:45:00'),
          lastModified: new Date('2024-01-05T14:20:00'),
          expiresAt: new Date('2024-02-05T14:20:00'),
          status: 'valid',
          priority: 'low',
          culturalContext: 'maya',
          accessibility: ['subtitles', 'audioDescription'],
          tags: ['video', 'ceremonia', 'maya', 'tradicional'],
          compressionRatio: 0.6,
          hitCount: 12,
          errorCount: 0
        },
        {
          id: 'resource-biblioteca',
          type: 'resource',
          title: 'Biblioteca Digital Indígena',
          size: 10485760, // 10MB
          lastAccessed: new Date('2024-01-13T16:20:00'),
          lastModified: new Date('2024-01-08T11:15:00'),
          expiresAt: new Date('2024-01-08T11:15:00'), // Expirado
          status: 'expired',
          priority: 'medium',
          culturalContext: 'general',
          accessibility: ['screenReader', 'subtitles'],
          tags: ['biblioteca', 'digital', 'indígena'],
          compressionRatio: 0.7,
          hitCount: 8,
          errorCount: 0
        },
        {
          id: 'image-maya-glyphs',
          type: 'image',
          title: 'Glifos Mayas: Interpretación',
          size: 3145728, // 3MB
          lastAccessed: new Date('2024-01-12T10:30:00'),
          lastModified: new Date('2024-01-03T09:45:00'),
          status: 'corrupted',
          priority: 'high',
          culturalContext: 'maya',
          accessibility: ['highContrast', 'screenReader'],
          tags: ['glifos', 'maya', 'interpretación'],
          compressionRatio: 0.85,
          hitCount: 67,
          errorCount: 3
        }
      ];

      setCachedItems(mockItems);
    } catch (error) {
      console.error('Error cargando elementos en caché:', error);
    }
  };

  const loadCacheStats = async () => {
    try {
      const mockStats: CacheStats = {
        totalItems: 5,
        totalSize: 67108864, // 64MB
        usedSpace: 67108864,
        availableSpace: 33554432, // 32MB restante
        hitRate: 85,
        missRate: 15,
        averageAccessTime: 150,
        compressionSavings: 16777216, // 16MB ahorrados
        expiredItems: 1,
        corruptedItems: 1
      };

      setCacheStats(mockStats);
    } catch (error) {
      console.error('Error cargando estadísticas de caché:', error);
    }
  };

  const handleAutoCleanup = async () => {
    setIsCleaning(true);
    try {
      // Simular limpieza automática
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remover elementos expirados y corruptos
      const validItems = cachedItems.filter(item => 
        item.status === 'valid' && 
        (!item.expiresAt || item.expiresAt > new Date())
      );
      
      setCachedItems(validItems);
      
      if (screenReaderEnabled) {
        speak('Limpieza automática de caché completada');
      }
    } catch (error) {
      console.error('Error durante limpieza automática:', error);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleManualCleanup = async () => {
    setIsCleaning(true);
    try {
      // Simular limpieza manual
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Remover elementos expirados, corruptos y de baja prioridad
      const cleanedItems = cachedItems.filter(item => 
        item.status === 'valid' && 
        (!item.expiresAt || item.expiresAt > new Date()) &&
        item.priority !== 'low'
      );
      
      setCachedItems(cleanedItems);
      onCacheCleared?.();
      
      if (screenReaderEnabled) {
        speak('Limpieza manual de caché completada');
      }
    } catch (error) {
      console.error('Error durante limpieza manual:', error);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleEvictItem = (itemId: string) => {
    setCachedItems(prev => prev.filter(item => item.id !== itemId));
    onItemEvicted?.(itemId);
    
    if (screenReaderEnabled) {
      speak('Elemento removido del caché');
    }
  };

  const handleRefreshItem = (itemId: string) => {
    // Simular refresco de elemento
    setCachedItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, lastAccessed: new Date(), hitCount: item.hitCount + 1 }
        : item
    ));
    
    if (screenReaderEnabled) {
      speak('Elemento refrescado en caché');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'valid': 'green',
      'expired': 'yellow',
      'corrupted': 'red',
      'pending': 'blue'
    };
    return colors[status] || 'gray';
  };

  const getPriorityColor = (priority: string): string => {
    const colors: { [key: string]: string } = {
      'low': 'gray',
      'medium': 'blue',
      'high': 'orange',
      'critical': 'red'
    };
    return colors[priority] || 'gray';
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      'lesson': FileText,
      'quiz': CheckCircle,
      'media': VideoIcon,
      'resource': Database,
      'data': Database,
      'image': ImageIcon,
      'video': VideoIcon,
      'audio': Volume2
    };
    return icons[type] || FileText;
  };

  const filteredItems = cachedItems
    .filter(item => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'lastAccessed':
          comparison = a.lastAccessed.getTime() - b.lastAccessed.getTime();
          break;
        case 'priority':
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const usagePercentage = (cacheStats.usedSpace / cacheStats.totalSize) * 100;

  return (
    <div className={`space-y-6 ${className}`} style={getStyles()}>
      {/* Panel principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Gestión de Caché</CardTitle>
                <p className="text-sm text-gray-600">
                  Almacenamiento local para contenido offline
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {cacheStats.totalItems} elementos
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
              {/* Uso de espacio */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Uso de Almacenamiento</h4>
                  <span className="text-sm text-gray-600">
                    {formatBytes(cacheStats.usedSpace)} / {formatBytes(cacheStats.totalSize)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.max(0, Math.min(100, usagePercentage))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                  <span>{Math.round(usagePercentage)}% usado</span>
                  <span>{formatBytes(cacheStats.availableSpace)} disponible</span>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">{cacheStats.hitRate}%</div>
                  <div className="text-xs text-gray-600">Tasa de acierto</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">{formatBytes(cacheStats.compressionSavings)}</div>
                  <div className="text-xs text-gray-600">Ahorro compresión</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded">
                  <div className="text-lg font-bold text-yellow-600">{cacheStats.expiredItems}</div>
                  <div className="text-xs text-gray-600">Expirados</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded">
                  <div className="text-lg font-bold text-red-600">{cacheStats.corruptedItems}</div>
                  <div className="text-xs text-gray-600">Corruptos</div>
                </div>
              </div>

              {/* Controles de limpieza */}
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-orange-800">Limpieza de Caché</h4>
                  <p className="text-sm text-orange-600">
                    Liberar espacio removiendo elementos innecesarios
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleManualCleanup}
                    disabled={isCleaning}
                    className="flex items-center gap-2"
                  >
                    {isCleaning ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {isCleaning ? 'Limpiando...' : 'Limpiar Caché'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Configuración de caché */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Caché
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tamaño máximo (MB)</label>
                  <input
                    type="number"
                    value={Math.round(cachePolicy.maxSize / (1024 * 1024))}
                    onChange={(e) => setCachePolicy(prev => ({ 
                      ...prev, 
                      maxSize: parseInt(e.target.value) * 1024 * 1024 
                    }))}
                    className="w-full mt-1 px-3 py-2 border rounded"
                    min="1"
                    max="1000"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Edad máxima (días)</label>
                  <input
                    type="number"
                    value={cachePolicy.maxAge}
                    onChange={(e) => setCachePolicy(prev => ({ 
                      ...prev, 
                      maxAge: parseInt(e.target.value) 
                    }))}
                    className="w-full mt-1 px-3 py-2 border rounded"
                    min="1"
                    max="365"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Política de evicción</label>
                <select
                  value={cachePolicy.evictionPolicy}
                  onChange={(e) => setCachePolicy(prev => ({ 
                    ...prev, 
                    evictionPolicy: e.target.value as any 
                  }))}
                  className="w-full mt-1 px-3 py-2 border rounded"
                >
                  <option value="lru">LRU (Menos usado recientemente)</option>
                  <option value="lfu">LFU (Menos usado frecuentemente)</option>
                  <option value="fifo">FIFO (Primero en entrar, primero en salir)</option>
                  <option value="random">Aleatorio</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cachePolicy.compressionEnabled}
                  onChange={(e) => setCachePolicy(prev => ({ 
                    ...prev, 
                    compressionEnabled: e.target.checked 
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Habilitar compresión</span>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cachePolicy.autoCleanup}
                  onChange={(e) => setCachePolicy(prev => ({ 
                    ...prev, 
                    autoCleanup: e.target.checked 
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Limpieza automática</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navegación de vistas */}
      <div className="flex items-center gap-2">
        <Button
          variant={selectedView === 'overview' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedView('overview')}
        >
          Resumen
        </Button>
        <Button
          variant={selectedView === 'items' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedView('items')}
        >
          Elementos
        </Button>
        <Button
          variant={selectedView === 'analytics' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedView('analytics')}
        >
          Análisis
        </Button>
      </div>

      {/* Vista de resumen */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Rendimiento del Caché
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Tasa de acierto</span>
                  <span className="font-bold">{cacheStats.hitRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.max(0, Math.min(100, cacheStats.hitRate))}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Tiempo promedio de acceso</span>
                  <span className="font-bold">{cacheStats.averageAccessTime}ms</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Ahorro por compresión</span>
                  <span className="font-bold">{formatBytes(cacheStats.compressionSavings)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Estado del Almacenamiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Elementos válidos</span>
                  <span className="font-bold text-green-600">
                    {cachedItems.filter(item => item.status === 'valid').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Elementos expirados</span>
                  <span className="font-bold text-yellow-600">
                    {cachedItems.filter(item => item.status === 'expired').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Elementos corruptos</span>
                  <span className="font-bold text-red-600">
                    {cachedItems.filter(item => item.status === 'corrupted').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Espacio disponible</span>
                  <span className="font-bold">{formatBytes(cacheStats.availableSpace)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vista de elementos */}
      {selectedView === 'items' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Elementos en Caché ({filteredItems.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="lesson">Lecciones</option>
                  <option value="quiz">Evaluaciones</option>
                  <option value="media">Multimedia</option>
                  <option value="resource">Recursos</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="lastAccessed">Último acceso</option>
                  <option value="name">Nombre</option>
                  <option value="size">Tamaño</option>
                  <option value="priority">Prioridad</option>
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar elementos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-1 border rounded text-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                const isExpired = item.expiresAt && item.expiresAt < new Date();
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-${getTypeIcon(item.type) === FileText ? 'blue' : 'green'}-100 rounded-lg flex items-center justify-center`}>
                        <TypeIcon className={`h-5 w-5 text-${getTypeIcon(item.type) === FileText ? 'blue' : 'green'}-600`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{formatBytes(item.size)}</span>
                          <span>•</span>
                          <span>Accesos: {item.hitCount}</span>
                          <span>•</span>
                          <span>{item.lastAccessed.toLocaleString('es-ES')}</span>
                          {item.culturalContext && (
                            <>
                              <span>•</span>
                              <span>🌍 {item.culturalContext}</span>
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.accessibility.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature === 'screenReader' ? 'SR' :
                               feature === 'highContrast' ? 'HC' :
                               feature === 'audioDescription' ? 'AD' :
                               feature === 'keyboardNavigation' ? 'KB' :
                               feature === 'subtitles' ? 'ST' : feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-${getStatusColor(item.status)}-600 border-${getStatusColor(item.status)}-200`}
                      >
                        {item.status === 'valid' ? 'Válido' :
                         item.status === 'expired' ? 'Expirado' :
                         item.status === 'corrupted' ? 'Corrupto' : 'Pendiente'}
                      </Badge>
                      
                      <Badge variant="outline" className={`text-${getPriorityColor(item.priority)}-600`}>
                        {item.priority}
                      </Badge>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRefreshItem(item.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEvictItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista de análisis */}
      {selectedView === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Uso por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['lesson', 'quiz', 'media', 'resource'].map(type => {
                  const typeItems = cachedItems.filter(item => item.type === type);
                  const totalSize = typeItems.reduce((sum, item) => sum + item.size, 0);
                  const percentage = (totalSize / cacheStats.totalSize) * 100;
                  
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(type)({ className: 'h-4 w-4' })}
                        <span className="capitalize">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{formatBytes(totalSize)}</span>
                        <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Elementos Más Accedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cachedItems
                  .sort((a, b) => b.hitCount - a.hitCount)
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <span className="text-sm truncate max-w-32">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{item.hitCount} accesos</span>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
