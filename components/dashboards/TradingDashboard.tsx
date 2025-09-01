'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  BarChart3,
  Activity,
  Plus,
  Settings,
  MessageSquare,
  Trophy,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Target,
  Clock,
  Star
} from 'lucide-react';

interface TradingItem {
  id: string;
  name: string;
  description: string;
  type: 'resource' | 'achievement' | 'badge' | 'tool' | 'material';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  value: number;
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  priceChangePercent: number;
  supply: number;
  demand: number;
  totalTraded: number;
  image?: string;
  tags: string[];
  seller: {
    id: string;
    username: string;
    rating: number;
  };
  createdAt: Date;
  expiresAt?: Date;
}

interface Trade {
  id: string;
  itemId: string;
  itemName: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  price: number;
  quantity: number;
  status: 'pending' | 'completed' | 'cancelled' | 'disputed';
  createdAt: Date;
  completedAt?: Date;
  feedback?: {
    rating: number;
    comment: string;
  };
}

interface MarketStats {
  totalItems: number;
  activeListings: number;
  totalTrades: number;
  totalVolume: number;
  averagePrice: number;
  marketCap: number;
  topGainers: TradingItem[];
  topLosers: TradingItem[];
  trendingItems: TradingItem[];
  recentTrades: Trade[];
}

interface UserPortfolio {
  userId: string;
  username: string;
  totalValue: number;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    averagePrice: number;
    currentValue: number;
    profitLoss: number;
  }[];
  tradingHistory: Trade[];
  rating: number;
  totalTrades: number;
}

export default function TradingDashboard() {
  const [items, setItems] = useState<TradingItem[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<MarketStats>({
    totalItems: 0,
    activeListings: 0,
    totalTrades: 0,
    totalVolume: 0,
    averagePrice: 0,
    marketCap: 0,
    topGainers: [],
    topLosers: [],
    trendingItems: [],
    recentTrades: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('price');

  useEffect(() => {
    loadTradingData();
  }, []);

  const loadTradingData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockItems: TradingItem[] = [
        {
          id: '1',
          name: 'Cristal de Sabiduría',
          description: 'Cristal mágico que otorga experiencia extra',
          type: 'resource',
          rarity: 'epic',
          value: 500,
          currentPrice: 450,
          previousPrice: 400,
          priceChange: 50,
          priceChangePercent: 12.5,
          supply: 25,
          demand: 45,
          totalTraded: 156,
          tags: ['experiencia', 'mágico', 'sabiduría'],
          seller: {
            id: '1',
            username: 'MaríaGarcía',
            rating: 4.8
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          name: 'Insignia de Maestro',
          description: 'Insignia que reconoce el dominio en una materia',
          type: 'achievement',
          rarity: 'legendary',
          value: 1000,
          currentPrice: 1200,
          previousPrice: 1300,
          priceChange: -100,
          priceChangePercent: -7.7,
          supply: 5,
          demand: 12,
          totalTraded: 23,
          tags: ['logro', 'maestro', 'reconocimiento'],
          seller: {
            id: '2',
            username: 'CarlosLópez',
            rating: 4.9
          },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          name: 'Herramienta de Análisis',
          description: 'Herramienta avanzada para análisis de datos',
          type: 'tool',
          rarity: 'rare',
          value: 300,
          currentPrice: 280,
          previousPrice: 250,
          priceChange: 30,
          priceChangePercent: 12,
          supply: 15,
          demand: 20,
          totalTraded: 89,
          tags: ['herramienta', 'análisis', 'datos'],
          seller: {
            id: '3',
            username: 'AnaMartínez',
            rating: 4.7
          },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      ];

      const mockTrades: Trade[] = [
        {
          id: '1',
          itemId: '1',
          itemName: 'Cristal de Sabiduría',
          sellerId: '1',
          sellerName: 'MaríaGarcía',
          buyerId: '4',
          buyerName: 'LuisHernández',
          price: 450,
          quantity: 1,
          status: 'completed',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          feedback: {
            rating: 5,
            comment: 'Excelente transacción, muy recomendado'
          }
        },
        {
          id: '2',
          itemId: '2',
          itemName: 'Insignia de Maestro',
          sellerId: '2',
          sellerName: 'CarlosLópez',
          buyerId: '5',
          buyerName: 'SofiaRodríguez',
          price: 1200,
          quantity: 1,
          status: 'pending',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ];

      setItems(mockItems);
      setTrades(mockTrades);
      
      setStats({
        totalItems: 156,
        activeListings: 89,
        totalTrades: 1247,
        totalVolume: 456789,
        averagePrice: 367,
        marketCap: 2345678,
        topGainers: mockItems.filter(item => item.priceChange > 0).slice(0, 5),
        topLosers: mockItems.filter(item => item.priceChange < 0).slice(0, 5),
        trendingItems: mockItems.slice(0, 5),
        recentTrades: mockTrades.slice(0, 10)
      });
    } catch (error) {
      console.error('Error cargando datos de trading:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resource': return <Package className="h-4 w-4" />;
      case 'achievement': return <Trophy className="h-4 w-4" />;
      case 'badge': return <Star className="h-4 w-4" />;
      case 'tool': return <Settings className="h-4 w-4" />;
      case 'material': return <ShoppingCart className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'disputed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const filteredItems = items.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.currentPrice - a.currentPrice;
      case 'change':
        return b.priceChangePercent - a.priceChangePercent;
      case 'volume':
        return b.totalTraded - a.totalTraded;
      case 'demand':
        return b.demand - a.demand;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Trading</h1>
          <p className="text-gray-600">Mercado de intercambio y transacciones</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Análisis
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Listar Item
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalVolume)}</div>
            <p className="text-xs text-muted-foreground">
              en {stats.totalTrades} transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listados Activos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalItems} items totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averagePrice)}</div>
            <p className="text-xs text-muted-foreground">
              por item
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital de Mercado</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.marketCap)}</div>
            <p className="text-xs text-muted-foreground">
              valor total del mercado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y ordenamiento */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant={filterType === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterType('all')}
          >
            Todos
          </Button>
          <Button 
            variant={filterType === 'resource' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterType('resource')}
          >
            Recursos
          </Button>
          <Button 
            variant={filterType === 'achievement' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterType('achievement')}
          >
            Logros
          </Button>
          <Button 
            variant={filterType === 'tool' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterType('tool')}
          >
            Herramientas
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Ordenar por:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="price">Precio</option>
            <option value="change">Cambio</option>
            <option value="volume">Volumen</option>
            <option value="demand">Demanda</option>
          </select>
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="market">Mercado</TabsTrigger>
          <TabsTrigger value="trades">Transacciones</TabsTrigger>
          <TabsTrigger value="trending">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top ganadores */}
            <Card>
              <CardHeader>
                <CardTitle>Mayores Ganancias</CardTitle>
                <CardDescription>Items con mayor incremento de precio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topGainers.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">+{item.priceChangePercent.toFixed(1)}%</div>
                        <div className="text-sm text-gray-500">{formatCurrency(item.currentPrice)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top perdedores */}
            <Card>
              <CardHeader>
                <CardTitle>Mayores Pérdidas</CardTitle>
                <CardDescription>Items con mayor decremento de precio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topLosers.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-800 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-600">{item.priceChangePercent.toFixed(1)}%</div>
                        <div className="text-sm text-gray-500">{formatCurrency(item.currentPrice)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedItems.map((item) => (
              <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(item.type)}
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </div>
                    <Badge className={getRarityColor(item.rarity)}>
                      {item.rarity}
                    </Badge>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Precio:</span>
                    <span className="font-semibold">{formatCurrency(item.currentPrice)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cambio:</span>
                    <div className={`flex items-center space-x-1 ${
                      item.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.priceChange >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-semibold">
                        {item.priceChange >= 0 ? '+' : ''}{item.priceChangePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Oferta: {item.supply}</span>
                    <span>Demanda: {item.demand}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Volumen: {item.totalTraded}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{item.seller.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedItem(item.id)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transacciones Recientes</CardTitle>
              <CardDescription>Últimas transacciones en el mercado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {trade.itemName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{trade.itemName}</div>
                        <div className="text-sm text-gray-500">
                          {trade.sellerName} → {trade.buyerName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(trade.price)}</div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(trade.status)}>
                          {trade.status === 'pending' ? 'Pendiente' :
                           trade.status === 'completed' ? 'Completado' :
                           trade.status === 'cancelled' ? 'Cancelado' : 'Disputado'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {trade.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Items en Tendencia</CardTitle>
              <CardDescription>Items con mayor actividad y demanda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.trendingItems.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(item.currentPrice)}</div>
                      <div className="text-sm text-gray-500">
                        {item.demand} demandas activas
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
