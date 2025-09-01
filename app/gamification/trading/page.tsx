'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Coins, 
  Gift, 
  Star, 
  Target, 
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  UserPlus,
  Settings,
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
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Interfaces
interface TradeItem {
  id: string;
  name: string;
  description: string;
  type: 'BADGE' | 'TITLE' | 'POINTS' | 'FEATURE' | 'CUSTOM';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  value: number;
  currentPrice: number;
  priceHistory: PricePoint[];
  seller: TradeUser;
  buyer?: TradeUser;
  status: 'LISTED' | 'SOLD' | 'CANCELLED' | 'EXPIRED';
  listedAt: string;
  expiresAt: string;
  image?: string;
  tags: string[];
  isUserItem: boolean;
  canAfford: boolean;
}

interface TradeUser {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  reputation: number;
  totalTrades: number;
  successRate: number;
}

interface PricePoint {
  date: string;
  price: number;
}

interface TradeOffer {
  id: string;
  item: TradeItem;
  buyer: TradeUser;
  offeredPrice: number;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  expiresAt: string;
}

interface UserInventory {
  points: number;
  badges: TradeItem[];
  titles: TradeItem[];
  features: TradeItem[];
  customItems: TradeItem[];
}

interface TradeFilters {
  search: string;
  type: string;
  rarity: string;
  priceRange: string;
  status: string;
}

export default function TradingPage() {
  const [tradeItems, setTradeItems] = useState<TradeItem[]>([]);
  const [userInventory, setUserInventory] = useState<UserInventory | null>(null);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TradeFilters>({
    search: '',
    type: 'all',
    rarity: 'all',
    priceRange: 'all',
    status: 'all'
  });
  const [selectedItem, setSelectedItem] = useState<TradeItem | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'inventory' | 'offers' | 'history'>('marketplace');

  // Datos de ejemplo
  const mockTradeItems: TradeItem[] = [
    {
      id: 'item_1',
      name: 'Badge de Maestro Maya',
      description: 'Un badge exclusivo otorgado a quienes dominan la lengua maya yucateco. Solo 100 unidades disponibles.',
      type: 'BADGE',
      rarity: 'LEGENDARY',
      value: 1000,
      currentPrice: 2500,
      priceHistory: [
        { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), price: 2000 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), price: 2200 },
        { date: new Date().toISOString(), price: 2500 }
      ],
      seller: {
        id: 'user_1',
        username: 'María López',
        level: 10,
        reputation: 95,
        totalTrades: 45,
        successRate: 98
      },
      status: 'LISTED',
      listedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['Maya', 'Lengua', 'Exclusivo', 'Cultural'],
      isUserItem: false,
      canAfford: true
    },
    {
      id: 'item_2',
      name: 'Título de Guardián Cultural',
      description: 'Título especial para quienes preservan y promueven las culturas indígenas.',
      type: 'TITLE',
      rarity: 'EPIC',
      value: 500,
      currentPrice: 800,
      priceHistory: [
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), price: 750 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), price: 780 },
        { date: new Date().toISOString(), price: 800 }
      ],
      seller: {
        id: 'user_2',
        username: 'Carlos Ruiz',
        level: 8,
        reputation: 87,
        totalTrades: 32,
        successRate: 94
      },
      status: 'LISTED',
      listedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['Cultural', 'Preservación', 'Título'],
      isUserItem: false,
      canAfford: true
    },
    {
      id: 'item_3',
      name: '500 Puntos de Experiencia',
      description: 'Paquete de puntos de experiencia para acelerar tu progreso de nivel.',
      type: 'POINTS',
      rarity: 'COMMON',
      value: 500,
      currentPrice: 450,
      priceHistory: [
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), price: 500 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), price: 470 },
        { date: new Date().toISOString(), price: 450 }
      ],
      seller: {
        id: 'user_3',
        username: 'Ana García',
        level: 6,
        reputation: 92,
        totalTrades: 28,
        successRate: 96
      },
      status: 'LISTED',
      listedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['Puntos', 'Experiencia', 'Progreso'],
      isUserItem: false,
      canAfford: true
    }
  ];

  const mockUserInventory: UserInventory = {
    points: 1500,
    badges: [
      {
        id: 'badge_1',
        name: 'Badge de Estudiante Consistente',
        description: 'Otorgado por completar 10 lecciones consecutivas',
        type: 'BADGE',
        rarity: 'UNCOMMON',
        value: 100,
        currentPrice: 0,
        priceHistory: [],
        seller: {
          id: 'current_user',
          username: 'Usuario Actual',
          level: 5,
          reputation: 85,
          totalTrades: 12,
          successRate: 92
        },
        status: 'LISTED',
        listedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['Estudiante', 'Consistencia'],
        isUserItem: true,
        canAfford: false
      }
    ],
    titles: [],
    features: [],
    customItems: []
  };

  const mockTradeOffers: TradeOffer[] = [
    {
      id: 'offer_1',
      item: mockTradeItems[0],
      buyer: {
        id: 'buyer_1',
        username: 'Roberto Méndez',
        level: 7,
        reputation: 89,
        totalTrades: 23,
        successRate: 95
      },
      offeredPrice: 2300,
      message: 'Me interesa mucho este badge. ¿Podrías considerar mi oferta?',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    loadTradingData();
  }, []);

  const loadTradingData = async () => {
    try {
      setLoading(true);
      // En producción, esto sería una llamada a la API
      // const response = await fetch('/api/gamification/trading');
      // const data = await response.json();
      
      // Simulando carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTradeItems(mockTradeItems);
      setUserInventory(mockUserInventory);
      setTradeOffers(mockTradeOffers);
    } catch (err) {
      setError('Error al cargar los datos de trading');
    } finally {
      setLoading(false);
    }
  };

  const buyItem = async (itemId: string) => {
    try {
      // En producción, esto sería una llamada a la API
      // await fetch(`/api/gamification/trading/buy`, { method: 'POST', body: JSON.stringify({ itemId }) });
      
      setTradeItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, status: 'SOLD', buyer: { id: 'current_user', username: 'Usuario Actual', level: 5, reputation: 85, totalTrades: 12, successRate: 92 } }
          : item
      ));
      
      setShowBuyModal(false);
    } catch (err) {
      setError('Error al comprar el item');
    }
  };

  const sellItem = async (itemId: string, price: number) => {
    try {
      // En producción, esto sería una llamada a la API
      // await fetch(`/api/gamification/trading/sell`, { method: 'POST', body: JSON.stringify({ itemId, price }) });
      
      const newItem: TradeItem = {
        id: `item_${Date.now()}`,
        name: 'Item Nuevo',
        description: 'Item puesto en venta',
        type: 'BADGE',
        rarity: 'COMMON',
        value: 100,
        currentPrice: price,
        priceHistory: [{ date: new Date().toISOString(), price }],
        seller: {
          id: 'current_user',
          username: 'Usuario Actual',
          level: 5,
          reputation: 85,
          totalTrades: 12,
          successRate: 92
        },
        status: 'LISTED',
        listedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['Nuevo'],
        isUserItem: true,
        canAfford: false
      };
      
      setTradeItems(prev => [newItem, ...prev]);
      setShowSellModal(false);
    } catch (err) {
      setError('Error al vender el item');
    }
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
      case 'BADGE': return <Award className="w-4 h-4" />;
      case 'TITLE': return <Crown className="w-4 h-4" />;
      case 'POINTS': return <Coins className="w-4 h-4" />;
      case 'FEATURE': return <Zap className="w-4 h-4" />;
      case 'CUSTOM': return <Gift className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LISTED': return 'text-green-600 bg-green-100 border-green-200';
      case 'SOLD': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'CANCELLED': return 'text-red-600 bg-red-100 border-red-200';
      case 'EXPIRED': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriceChange = (priceHistory: PricePoint[]) => {
    if (priceHistory.length < 2) return { change: 0, percentage: 0, trend: 'neutral' };
    
    const current = priceHistory[priceHistory.length - 1].price;
    const previous = priceHistory[priceHistory.length - 2].price;
    const change = current - previous;
    const percentage = (change / previous) * 100;
    
    return {
      change,
      percentage,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  };

  const filteredItems = tradeItems.filter(item => {
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.type !== 'all' && item.type !== filters.type) return false;
    if (filters.rarity !== 'all' && item.rarity !== filters.rarity) return false;
    if (filters.status !== 'all' && item.status !== filters.status) return false;
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (item.currentPrice < min || (max && item.currentPrice > max)) return false;
    }
    return true;
  });

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-MX');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX');
  };

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mercado de Trading</h1>
              <p className="text-gray-600">Compra, vende e intercambia items con otros estudiantes</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowSellModal(true)}
            className="flex items-center space-x-2"
            tabIndex={0}
            aria-label="Vender item"
          >
            <Plus className="w-4 h-4" />
            <span>Vender Item</span>
          </Button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Mis Puntos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {userInventory?.points.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Items en Venta</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {tradeItems.filter(item => item.status === 'LISTED').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Ofertas Recibidas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {tradeOffers.filter(offer => offer.status === 'PENDING').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Transacciones</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {tradeItems.filter(item => item.status === 'SOLD').length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="flex space-x-1 border-b mb-6">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            activeTab === 'marketplace' 
              ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700" 
              : "text-gray-600 hover:text-gray-800"
          )}
          tabIndex={0}
          aria-label="Ver marketplace"
        >
          Marketplace
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            activeTab === 'inventory' 
              ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700" 
              : "text-gray-600 hover:text-gray-800"
          )}
          tabIndex={0}
          aria-label="Ver inventario"
        >
          Mi Inventario
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            activeTab === 'offers' 
              ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700" 
              : "text-gray-600 hover:text-gray-800"
          )}
          tabIndex={0}
          aria-label="Ver ofertas"
        >
          Ofertas
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            activeTab === 'history' 
              ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700" 
              : "text-gray-600 hover:text-gray-800"
          )}
          tabIndex={0}
          aria-label="Ver historial"
        >
          Historial
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
                  placeholder="Buscar items..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  tabIndex={0}
                  aria-label="Buscar items"
                />
              </div>
            </div>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              tabIndex={0}
              aria-label="Filtrar por tipo"
            >
              <option value="all">Todos los tipos</option>
              <option value="BADGE">Badges</option>
              <option value="TITLE">Títulos</option>
              <option value="POINTS">Puntos</option>
              <option value="FEATURE">Características</option>
              <option value="CUSTOM">Personalizados</option>
            </select>
            
            <select
              value={filters.rarity}
              onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              tabIndex={0}
              aria-label="Filtrar por rango de precio"
            >
              <option value="all">Todos los precios</option>
              <option value="0-100">0 - 100 pts</option>
              <option value="100-500">100 - 500 pts</option>
              <option value="500-1000">500 - 1000 pts</option>
              <option value="1000-999999">1000+ pts</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Contenido de las tabs */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron items</h3>
                <p className="text-gray-600">Intenta ajustar los filtros o vuelve más tarde</p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => {
              const priceChange = getPriceChange(item.priceHistory);
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                              {getTypeIcon(item.type)}
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={cn("text-xs", getRarityColor(item.rarity))}>
                                  {item.rarity === 'COMMON' ? 'Común' :
                                   item.rarity === 'UNCOMMON' ? 'Poco Común' :
                                   item.rarity === 'RARE' ? 'Raro' :
                                   item.rarity === 'EPIC' ? 'Épico' : 'Legendario'}
                                </Badge>
                                <Badge className={cn("text-xs", getStatusColor(item.status))}>
                                  {item.status === 'LISTED' ? 'En Venta' : 
                                   item.status === 'SOLD' ? 'Vendido' :
                                   item.status === 'CANCELLED' ? 'Cancelado' : 'Expirado'}
                                </Badge>
                                {item.isUserItem && (
                                  <Badge className="text-xs bg-blue-100 text-blue-800">
                                    Mi Item
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Precio: {formatPrice(item.currentPrice)} pts
                            </span>
                            {priceChange.trend !== 'neutral' && (
                              <span className={cn(
                                "text-xs",
                                priceChange.trend === 'up' ? "text-green-600" : "text-red-600"
                              )}>
                                {priceChange.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {Math.abs(priceChange.percentage).toFixed(1)}%
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Valor: {formatPrice(item.value)} pts
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Vendedor: {item.seller.username}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Listado: {formatDate(item.listedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Reputación del vendedor */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Star className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium">{item.seller.username}</div>
                                <div className="text-xs text-gray-600">
                                  Nivel {item.seller.level} • {item.seller.reputation}% reputación
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{item.seller.totalTrades} transacciones</div>
                              <div className="text-xs text-gray-600">{item.seller.successRate}% éxito</div>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 lg:ml-4">
                        {item.isUserItem ? (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setSelectedItem(item)}
                            tabIndex={0}
                            aria-label="Ver detalles del item"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </Button>
                        ) : item.canAfford ? (
                          <Button 
                            className="w-full"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowBuyModal(true);
                            }}
                            tabIndex={0}
                            aria-label="Comprar item"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Comprar
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            disabled 
                            className="w-full"
                            tabIndex={0}
                            aria-label="No tienes suficientes puntos"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Puntos Insuficientes
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mi Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium">Puntos</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {userInventory?.points.toLocaleString() || 0}
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Badges</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {userInventory?.badges.length || 0}
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Títulos</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {userInventory?.titles.length || 0}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Características</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {userInventory?.features.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items del inventario */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mis Items</h3>
            {userInventory?.badges.length === 0 && userInventory?.titles.length === 0 && userInventory?.features.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes items para vender</h3>
                  <p className="text-gray-600">Completa actividades para ganar badges y títulos</p>
                </CardContent>
              </Card>
            ) : (
              [...(userInventory?.badges || []), ...(userInventory?.titles || []), ...(userInventory?.features || [])].map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <Badge className={cn("text-xs mt-1", getRarityColor(item.rarity))}>
                            {item.rarity}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowSellModal(true);
                        }}
                        tabIndex={0}
                        aria-label="Vender item"
                      >
                        <Tag className="w-4 h-4 mr-2" />
                        Vender
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'offers' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Ofertas Recibidas</h3>
          {tradeOffers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes ofertas pendientes</h3>
                <p className="text-gray-600">Las ofertas aparecerán aquí cuando otros usuarios hagan ofertas por tus items</p>
              </CardContent>
            </Card>
          ) : (
            tradeOffers.map((offer) => (
              <Card key={offer.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                        {getTypeIcon(offer.item.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{offer.item.name}</h4>
                        <p className="text-sm text-gray-600">
                          Oferta de {offer.buyer.username} por {formatPrice(offer.offeredPrice)} pts
                        </p>
                        {offer.message && (
                          <p className="text-xs text-gray-500 mt-1">"{offer.message}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-green-600"
                        tabIndex={0}
                        aria-label="Aceptar oferta"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aceptar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600"
                        tabIndex={0}
                        aria-label="Rechazar oferta"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Historial de Transacciones</h3>
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transacciones aún</h3>
              <p className="text-gray-600">Tu historial de compras y ventas aparecerá aquí</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de compra */}
      {showBuyModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <span>Comprar Item</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">{selectedItem.name}</h4>
                  <p className="text-sm text-gray-600">{selectedItem.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">Precio:</span>
                    <span className="font-medium">{formatPrice(selectedItem.currentPrice)} pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tus puntos:</span>
                    <span className="font-medium">{userInventory?.points.toLocaleString()} pts</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBuyModal(false)}
                    className="flex-1"
                    tabIndex={0}
                    aria-label="Cancelar compra"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => buyItem(selectedItem.id)}
                    className="flex-1"
                    tabIndex={0}
                    aria-label="Confirmar compra"
                  >
                    Confirmar Compra
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de venta */}
      {showSellModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <span>Vender Item</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">{selectedItem.name}</h4>
                  <p className="text-sm text-gray-600">{selectedItem.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">Valor base:</span>
                    <span className="font-medium">{formatPrice(selectedItem.value)} pts</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Precio de venta (pts)</label>
                  <input
                    type="number"
                    min={selectedItem.value}
                    defaultValue={selectedItem.value}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    tabIndex={0}
                    aria-label="Precio de venta"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSellModal(false)}
                    className="flex-1"
                    tabIndex={0}
                    aria-label="Cancelar venta"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => sellItem(selectedItem.id, selectedItem.value)}
                    className="flex-1"
                    tabIndex={0}
                    aria-label="Confirmar venta"
                  >
                    Poner en Venta
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
