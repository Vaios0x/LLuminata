/**
 * Hook para manejo del sistema de intercambio (trading)
 * Proporciona funcionalidades para marketplace, ofertas y transacciones
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { GamificationService } from '../gamification-service';

// Interfaces
interface TradeItem {
  id: string;
  name: string;
  description: string;
  type: 'BADGE' | 'ACHIEVEMENT' | 'TITLE' | 'CUSTOM_ITEM' | 'POINTS' | 'EXPERIENCE';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  value: number;
  icon?: string;
  metadata: {
    category?: string;
    level?: number;
    points?: number;
    [key: string]: any;
  };
  isTradeable: boolean;
  isStackable: boolean;
  maxStack?: number;
  createdAt: Date;
}

interface TradeOffer {
  id: string;
  sellerId: string;
  itemId: string;
  quantity: number;
  price: number; // En puntos
  currency: 'POINTS' | 'EXPERIENCE' | 'CUSTOM';
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED' | 'EXPIRED';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Información del item
  item: TradeItem;
  seller: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
  };
}

interface TradeTransaction {
  id: string;
  offerId: string;
  buyerId: string;
  sellerId: string;
  itemId: string;
  quantity: number;
  price: number;
  currency: 'POINTS' | 'EXPERIENCE' | 'CUSTOM';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  completedAt?: Date;
  createdAt: Date;
  
  // Información de las partes
  buyer: {
    id: string;
    name: string;
    avatar?: string;
  };
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
  item: TradeItem;
}

interface UserInventory {
  items: {
    itemId: string;
    quantity: number;
    item: TradeItem;
  }[];
  totalItems: number;
  totalValue: number;
}

interface TradingStats {
  totalTrades: number;
  totalVolume: number;
  averagePrice: number;
  tradesByItemType: Record<string, number>;
  recentTrades: TradeTransaction[];
  userStats: {
    itemsSold: number;
    itemsBought: number;
    totalSpent: number;
    totalEarned: number;
    reputation: number;
  };
}

interface UseTradingReturn {
  // Estado
  userInventory: UserInventory;
  availableOffers: TradeOffer[];
  userOffers: TradeOffer[];
  userTransactions: TradeTransaction[];
  stats: TradingStats;
  loading: boolean;
  error: string | null;
  
  // Acciones de inventario
  getInventory: () => Promise<void>;
  addItemToInventory: (itemId: string, quantity: number) => Promise<void>;
  removeItemFromInventory: (itemId: string, quantity: number) => Promise<void>;
  
  // Acciones de ofertas
  createOffer: (itemId: string, quantity: number, price: number, currency?: string) => Promise<TradeOffer>;
  updateOffer: (offerId: string, updates: Partial<TradeOffer>) => Promise<void>;
  cancelOffer: (offerId: string) => Promise<void>;
  buyOffer: (offerId: string, quantity: number) => Promise<TradeTransaction>;
  
  // Acciones de transacciones
  getTransactionHistory: () => Promise<TradeTransaction[]>;
  cancelTransaction: (transactionId: string) => Promise<void>;
  confirmTransaction: (transactionId: string) => Promise<void>;
  
  // Utilidades
  getItemValue: (itemId: string) => number;
  canAfford: (price: number, currency?: string) => boolean;
  getOffersByItem: (itemId: string) => TradeOffer[];
  getOffersByPrice: (minPrice: number, maxPrice: number) => TradeOffer[];
  getOffersByRarity: (rarity: TradeItem['rarity']) => TradeOffer[];
  getUserReputation: () => number;
  getTradingStats: () => TradingStats;
}

export const useTrading = (): UseTradingReturn => {
  const { user } = useAuth();
  const [userInventory, setUserInventory] = useState<UserInventory>({
    items: [],
    totalItems: 0,
    totalValue: 0
  });
  const [availableOffers, setAvailableOffers] = useState<TradeOffer[]>([]);
  const [userOffers, setUserOffers] = useState<TradeOffer[]>([]);
  const [userTransactions, setUserTransactions] = useState<TradeTransaction[]>([]);
  const [stats, setStats] = useState<TradingStats>({
    totalTrades: 0,
    totalVolume: 0,
    averagePrice: 0,
    tradesByItemType: {},
    recentTrades: [],
    userStats: {
      itemsSold: 0,
      itemsBought: 0,
      totalSpent: 0,
      totalEarned: 0,
      reputation: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gamificationService = new GamificationService();

  // Cargar inventario del usuario
  const loadUserInventory = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const inventory = await gamificationService.getUserInventory(user.id);
      setUserInventory(inventory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cargar ofertas disponibles
  const loadAvailableOffers = useCallback(async () => {
    try {
      const offers = await gamificationService.getAvailableOffers();
      setAvailableOffers(offers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ofertas');
    }
  }, []);

  // Cargar ofertas del usuario
  const loadUserOffers = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const offers = await gamificationService.getUserOffers(user.id);
      setUserOffers(offers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ofertas del usuario');
    }
  }, [user?.id]);

  // Cargar transacciones del usuario
  const loadUserTransactions = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const transactions = await gamificationService.getUserTransactions(user.id);
      setUserTransactions(transactions);
      
      // Calcular estadísticas
      const tradingStats = calculateTradingStats(transactions);
      setStats(tradingStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones');
    }
  }, [user?.id]);

  // Calcular estadísticas de trading
  const calculateTradingStats = useCallback((transactions: TradeTransaction[]): TradingStats => {
    const totalTrades = transactions.length;
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.price * tx.quantity, 0);
    const averagePrice = totalTrades > 0 ? totalVolume / totalTrades : 0;
    
    const tradesByItemType = transactions.reduce((acc, tx) => {
      const itemType = tx.item.type;
      acc[itemType] = (acc[itemType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const recentTrades = transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    const userStats = {
      itemsSold: transactions.filter(tx => tx.sellerId === user?.id).length,
      itemsBought: transactions.filter(tx => tx.buyerId === user?.id).length,
      totalSpent: transactions
        .filter(tx => tx.buyerId === user?.id)
        .reduce((sum, tx) => sum + tx.price * tx.quantity, 0),
      totalEarned: transactions
        .filter(tx => tx.sellerId === user?.id)
        .reduce((sum, tx) => sum + tx.price * tx.quantity, 0),
      reputation: 0 // Implementar cálculo de reputación
    };
    
    return {
      totalTrades,
      totalVolume,
      averagePrice,
      tradesByItemType,
      recentTrades,
      userStats
    };
  }, [user?.id]);

  // Obtener inventario
  const getInventory = useCallback(async (): Promise<void> => {
    await loadUserInventory();
  }, [loadUserInventory]);

  // Agregar item al inventario
  const addItemToInventory = useCallback(async (itemId: string, quantity: number): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.addItemToInventory(user.id, itemId, quantity);
      
      // Recargar inventario
      await loadUserInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar item al inventario');
      throw err;
    }
  }, [user?.id, loadUserInventory]);

  // Remover item del inventario
  const removeItemFromInventory = useCallback(async (itemId: string, quantity: number): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.removeItemFromInventory(user.id, itemId, quantity);
      
      // Recargar inventario
      await loadUserInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al remover item del inventario');
      throw err;
    }
  }, [user?.id, loadUserInventory]);

  // Crear oferta
  const createOffer = useCallback(async (
    itemId: string, 
    quantity: number, 
    price: number, 
    currency: string = 'POINTS'
  ): Promise<TradeOffer> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const offer = await gamificationService.createTradeOffer(user.id, itemId, quantity, price, currency);
      
      // Actualizar ofertas del usuario
      setUserOffers(prev => [offer, ...prev]);
      
      return offer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear oferta');
      throw err;
    }
  }, [user?.id]);

  // Actualizar oferta
  const updateOffer = useCallback(async (offerId: string, updates: Partial<TradeOffer>): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.updateTradeOffer(offerId, updates);
      
      // Actualizar ofertas del usuario
      setUserOffers(prev => prev.map(offer => 
        offer.id === offerId ? { ...offer, ...updates } : offer
      ));
      
      // Actualizar ofertas disponibles
      setAvailableOffers(prev => prev.map(offer => 
        offer.id === offerId ? { ...offer, ...updates } : offer
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar oferta');
      throw err;
    }
  }, [user?.id]);

  // Cancelar oferta
  const cancelOffer = useCallback(async (offerId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.cancelTradeOffer(offerId);
      
      // Actualizar ofertas del usuario
      setUserOffers(prev => prev.filter(offer => offer.id !== offerId));
      
      // Actualizar ofertas disponibles
      setAvailableOffers(prev => prev.filter(offer => offer.id !== offerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar oferta');
      throw err;
    }
  }, [user?.id]);

  // Comprar oferta
  const buyOffer = useCallback(async (offerId: string, quantity: number): Promise<TradeTransaction> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const transaction = await gamificationService.buyTradeOffer(user.id, offerId, quantity);
      
      // Actualizar transacciones del usuario
      setUserTransactions(prev => [transaction, ...prev]);
      
      // Recargar inventario
      await loadUserInventory();
      
      // Recargar ofertas disponibles
      await loadAvailableOffers();
      
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al comprar oferta');
      throw err;
    }
  }, [user?.id, loadUserInventory, loadAvailableOffers]);

  // Obtener historial de transacciones
  const getTransactionHistory = useCallback(async (): Promise<TradeTransaction[]> => {
    await loadUserTransactions();
    return userTransactions;
  }, [loadUserTransactions, userTransactions]);

  // Cancelar transacción
  const cancelTransaction = useCallback(async (transactionId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.cancelTransaction(transactionId);
      
      // Recargar transacciones
      await loadUserTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar transacción');
      throw err;
    }
  }, [user?.id, loadUserTransactions]);

  // Confirmar transacción
  const confirmTransaction = useCallback(async (transactionId: string): Promise<void> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await gamificationService.confirmTransaction(transactionId);
      
      // Recargar transacciones
      await loadUserTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al confirmar transacción');
      throw err;
    }
  }, [user?.id, loadUserTransactions]);

  // Utilidades
  const getItemValue = useCallback((itemId: string): number => {
    const item = userInventory.items.find(invItem => invItem.itemId === itemId);
    return item?.item.value || 0;
  }, [userInventory]);

  const canAfford = useCallback((price: number, currency: string = 'POINTS'): boolean => {
    if (currency === 'POINTS') {
      return (user?.points || 0) >= price;
    }
    if (currency === 'EXPERIENCE') {
      return (user?.experience || 0) >= price;
    }
    return false;
  }, [user?.points, user?.experience]);

  const getOffersByItem = useCallback((itemId: string): TradeOffer[] => {
    return availableOffers.filter(offer => offer.itemId === itemId);
  }, [availableOffers]);

  const getOffersByPrice = useCallback((minPrice: number, maxPrice: number): TradeOffer[] => {
    return availableOffers.filter(offer => offer.price >= minPrice && offer.price <= maxPrice);
  }, [availableOffers]);

  const getOffersByRarity = useCallback((rarity: TradeItem['rarity']): TradeOffer[] => {
    return availableOffers.filter(offer => offer.item.rarity === rarity);
  }, [availableOffers]);

  const getUserReputation = useCallback((): number => {
    return stats.userStats.reputation;
  }, [stats.userStats.reputation]);

  const getTradingStats = useCallback((): TradingStats => {
    return stats;
  }, [stats]);

  // Efectos
  useEffect(() => {
    loadUserInventory();
    loadAvailableOffers();
    loadUserOffers();
    loadUserTransactions();
  }, [loadUserInventory, loadAvailableOffers, loadUserOffers, loadUserTransactions]);

  // Actualizar automáticamente cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      loadAvailableOffers();
      if (user?.id) {
        loadUserOffers();
        loadUserTransactions();
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [loadAvailableOffers, loadUserOffers, loadUserTransactions, user?.id]);

  return {
    userInventory,
    availableOffers,
    userOffers,
    userTransactions,
    stats,
    loading,
    error,
    getInventory,
    addItemToInventory,
    removeItemFromInventory,
    createOffer,
    updateOffer,
    cancelOffer,
    buyOffer,
    getTransactionHistory,
    cancelTransaction,
    confirmTransaction,
    getItemValue,
    canAfford,
    getOffersByItem,
    getOffersByPrice,
    getOffersByRarity,
    getUserReputation,
    getTradingStats
  };
};
