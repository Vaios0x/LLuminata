'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  RefreshCw, 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  ArrowRight,
  Users,
  Clock,
  CheckCircle,
  X,
  AlertTriangle,
  Info,
  Star,
  Award,
  Gift,
  TrendingUp,
  Shield,
  Zap,
  Heart,
  Target,
  Crown,
  Medal,
  Coins,
  Package,
  ShoppingCart,
  History,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

interface TradeItem {
  id: string;
  type: 'badge' | 'achievement' | 'title' | 'points' | 'custom';
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  value: number;
  category: string;
  tradeable: boolean;
  quantity: number;
  acquiredAt: string;
}

interface TradeOffer {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  itemsOffered: TradeItem[];
  itemsRequested: TradeItem[];
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  isUserCreator: boolean;
  isUserTarget: boolean;
}

interface TradeHistory {
  id: string;
  partnerName: string;
  partnerAvatar?: string;
  itemsReceived: TradeItem[];
  itemsGiven: TradeItem[];
  completedAt: string;
  rating?: number;
}

interface TradingSystemProps {
  userId: string;
  className?: string;
  refreshInterval?: number;
}

export const TradingSystem: React.FC<TradingSystemProps> = ({ 
  userId, 
  className = '',
  refreshInterval = 30000 
}) => {
  const [userInventory, setUserInventory] = useState<TradeItem[]>([]);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{
    offered: TradeItem[];
    requested: TradeItem[];
  }>({ offered: [], requested: [] });

  const loadTradingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/trading?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Error cargando datos de trading');
      }

      const data = await response.json();
      setUserInventory(data.inventory || []);
      setTradeOffers(data.offers || []);
      setTradeHistory(data.history || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createTradeOffer = async (offerData: {
    itemsOffered: string[];
    itemsRequested: string[];
    targetUserId?: string;
  }) => {
    try {
      const response = await fetch('/api/gamification/trading/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...offerData, creatorId: userId })
      });

      if (response.ok) {
        await loadTradingData();
        setShowCreateOffer(false);
        setSelectedItems({ offered: [], requested: [] });
      } else {
        throw new Error('Error al crear la oferta de intercambio');
      }
    } catch (err) {
      console.error('Error creating trade offer:', err);
    }
  };

  const respondToOffer = async (offerId: string, accept: boolean) => {
    try {
      const response = await fetch('/api/gamification/trading/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, userId, accept })
      });

      if (response.ok) {
        await loadTradingData();
      } else {
        throw new Error('Error al responder a la oferta');
      }
    } catch (err) {
      console.error('Error responding to offer:', err);
    }
  };

  const cancelOffer = async (offerId: string) => {
    try {
      const response = await fetch('/api/gamification/trading/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, userId })
      });

      if (response.ok) {
        await loadTradingData();
      } else {
        throw new Error('Error al cancelar la oferta');
      }
    } catch (err) {
      console.error('Error canceling offer:', err);
    }
  };

  const rateTrade = async (tradeId: string, rating: number) => {
    try {
      const response = await fetch('/api/gamification/trading/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId, userId, rating })
      });

      if (response.ok) {
        await loadTradingData();
      } else {
        throw new Error('Error al calificar el intercambio');
      }
    } catch (err) {
      console.error('Error rating trade:', err);
    }
  };

  useEffect(() => {
    loadTradingData();
    
    const interval = setInterval(loadTradingData, refreshInterval);
    return () => clearInterval(interval);
  }, [loadTradingData, refreshInterval]);

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

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'badge': return <Award className="w-5 h-5" />;
      case 'achievement': return <Star className="w-5 h-5" />;
      case 'title': return <Crown className="w-5 h-5" />;
      case 'points': return <Coins className="w-5 h-5" />;
      case 'custom': return <Gift className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'DECLINED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      case 'EXPIRED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'ACCEPTED': return 'Aceptado';
      case 'DECLINED': return 'Rechazado';
      case 'CANCELLED': return 'Cancelado';
      case 'EXPIRED': return 'Expirado';
      default: return status;
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const toggleItemSelection = (item: TradeItem, type: 'offered' | 'requested') => {
    setSelectedItems(prev => {
      const currentList = prev[type];
      const isSelected = currentList.some(selected => selected.id === item.id);
      
      if (isSelected) {
        return {
          ...prev,
          [type]: currentList.filter(selected => selected.id !== item.id)
        };
      } else {
        return {
          ...prev,
          [type]: [...currentList, item]
        };
      }
    });
  };

  const filteredInventory = userInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesRarity && matchesCategory;
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
            <Button onClick={loadTradingData} className="mt-4">
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
          <h1 className="text-3xl font-bold">Sistema de Intercambio</h1>
          <p className="text-gray-600 mt-1">Intercambia badges y elementos con otros estudiantes</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowCreateOffer(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Oferta
          </Button>
          <Button onClick={loadTradingData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="offers">Ofertas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="market">Mercado</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar elementos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Buscar elementos"
              />
            </div>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filtrar por rareza"
            >
              <option value="all">Todas las rarezas</option>
              <option value="COMMON">Común</option>
              <option value="UNCOMMON">Poco común</option>
              <option value="RARE">Raro</option>
              <option value="EPIC">Épico</option>
              <option value="LEGENDARY">Legendario</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filtrar por categoría"
            >
              <option value="all">Todas las categorías</option>
              <option value="LEARNING">Aprendizaje</option>
              <option value="CULTURAL">Cultural</option>
              <option value="SOCIAL">Social</option>
              <option value="TECHNICAL">Técnico</option>
              <option value="MILESTONE">Hito</option>
            </select>
          </div>

          {/* Inventario */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {getItemIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getRarityColor(item.rarity)}>
                          {item.rarity}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-800">
                          x{item.quantity}
                        </Badge>
                        {!item.tradeable && (
                          <Badge className="bg-red-100 text-red-800">
                            No intercambiable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInventory.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No se encontraron elementos</h3>
                <p className="text-gray-500">Intenta cambiar los filtros</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <div className="space-y-4">
            {tradeOffers.map((offer) => (
              <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {offer.creatorAvatar ? (
                          <img src={offer.creatorAvatar} alt={offer.creatorName} className="w-10 h-10 rounded-full" />
                        ) : (
                          <Users className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{offer.creatorName}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {new Date(offer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(offer.status)}>
                        {getStatusText(offer.status)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatTimeRemaining(offer.expiresAt)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Elementos ofrecidos */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Ofrece:</h4>
                      <div className="space-y-2">
                        {offer.itemsOffered.map((item) => (
                          <div key={item.id} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                            {getItemIcon(item.type)}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <Badge className={getRarityColor(item.rarity)}>
                                {item.rarity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Elementos solicitados */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Solicita:</h4>
                      <div className="space-y-2">
                        {offer.itemsRequested.map((item) => (
                          <div key={item.id} className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                            {getItemIcon(item.type)}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <Badge className={getRarityColor(item.rarity)}>
                                {item.rarity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  {offer.status === 'PENDING' && !offer.isUserCreator && (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => respondToOffer(offer.id, true)}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aceptar
                      </Button>
                      <Button 
                        onClick={() => respondToOffer(offer.id, false)}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  )}
                  {offer.status === 'PENDING' && offer.isUserCreator && (
                    <Button 
                      onClick={() => cancelOffer(offer.id)}
                      variant="outline"
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar Oferta
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            {tradeOffers.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <RefreshCw className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No hay ofertas de intercambio</h3>
                  <p className="text-gray-500">Crea una oferta o espera a que otros estudiantes hagan propuestas</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {tradeHistory.map((trade) => (
              <Card key={trade.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {trade.partnerAvatar ? (
                          <img src={trade.partnerAvatar} alt={trade.partnerName} className="w-10 h-10 rounded-full" />
                        ) : (
                          <Users className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{trade.partnerName}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(trade.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {!trade.rating && (
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => rateTrade(trade.id, star)}
                            className="text-gray-300 hover:text-yellow-400"
                          >
                            <Star className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Recibiste:</h4>
                      <div className="space-y-2">
                        {trade.itemsReceived.map((item) => (
                          <div key={item.id} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                            {getItemIcon(item.type)}
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <Badge className={getRarityColor(item.rarity)}>
                                {item.rarity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Diste:</h4>
                      <div className="space-y-2">
                        {trade.itemsGiven.map((item) => (
                          <div key={item.id} className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                            {getItemIcon(item.type)}
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <Badge className={getRarityColor(item.rarity)}>
                                {item.rarity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {tradeHistory.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <History className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No hay historial de intercambios</h3>
                  <p className="text-gray-500">Completa tu primer intercambio para ver el historial</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">Mercado de Intercambios</h3>
              <p className="text-gray-500">Próximamente: Mercado público de intercambios</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para crear oferta */}
      {showCreateOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Crear Oferta de Intercambio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Elementos a ofrecer */}
                <div>
                  <h4 className="font-semibold mb-4">Elementos que ofreces:</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userInventory.filter(item => item.tradeable).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItemSelection(item, 'offered')}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedItems.offered.some(selected => selected.id === item.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {getItemIcon(item.type)}
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <Badge className={getRarityColor(item.rarity)}>
                              {item.rarity}
                            </Badge>
                          </div>
                          {selectedItems.offered.some(selected => selected.id === item.id) && (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Elementos solicitados */}
                <div>
                  <h4 className="font-semibold mb-4">Elementos que solicitas:</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userInventory.filter(item => item.tradeable).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItemSelection(item, 'requested')}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedItems.requested.some(selected => selected.id === item.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {getItemIcon(item.type)}
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <Badge className={getRarityColor(item.rarity)}>
                              {item.rarity}
                            </Badge>
                          </div>
                          {selectedItems.requested.some(selected => selected.id === item.id) && (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => setShowCreateOffer(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => createTradeOffer({
                    itemsOffered: selectedItems.offered.map(item => item.id),
                    itemsRequested: selectedItems.requested.map(item => item.id)
                  })}
                  className="flex-1"
                  disabled={selectedItems.offered.length === 0 || selectedItems.requested.length === 0}
                >
                  Crear Oferta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TradingSystem;
