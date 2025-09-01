'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { cn } from '@/lib/utils';

interface RealTimeDataPoint {
  timestamp: number;
  value: number;
  category?: string;
  label?: string;
  metadata?: Record<string, any>;
}

interface RealTimeChartProps {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  maxDataPoints?: number; // Máximo número de puntos a mostrar
  updateInterval?: number; // Intervalo de actualización en ms
  dataStream?: 'websocket' | 'polling' | 'manual';
  websocketUrl?: string;
  pollingUrl?: string;
  categories?: string[];
  colors?: string[];
  size?: 'sm' | 'md' | 'lg';
  showGrid?: boolean;
  showLegend?: boolean;
  animate?: boolean;
  className?: string;
  onDataUpdate?: (data: RealTimeDataPoint[]) => void;
  onError?: (error: Error) => void;
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    enableKeyboardNavigation?: boolean;
  };
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({
  title,
  xAxisLabel = 'Tiempo',
  yAxisLabel = 'Valor',
  maxDataPoints = 100,
  updateInterval = 1000,
  dataStream = 'manual',
  websocketUrl,
  pollingUrl,
  categories = ['default'],
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  size = 'md',
  showGrid = true,
  showLegend = true,
  animate = true,
  className,
  onDataUpdate,
  onError,
  accessibility = {}
}) => {
  const [data, setData] = useState<RealTimeDataPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPoints: 0,
    currentValue: 0,
    averageValue: 0,
    maxValue: 0,
    minValue: 0,
    updateRate: 0
  });

  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const updateCountRef = useRef<number>(0);

  // Generar datos de ejemplo para demostración
  const generateSampleData = useCallback(() => {
    const now = Date.now();
    const newPoint: RealTimeDataPoint = {
      timestamp: now,
      value: Math.random() * 100,
      category: categories[Math.floor(Math.random() * categories.length)],
      label: `Dato ${data.length + 1}`
    };
    return newPoint;
  }, [data.length, categories]);

  // Actualizar datos
  const updateData = useCallback((newPoint: RealTimeDataPoint) => {
    setData(prevData => {
      const updatedData = [...prevData, newPoint];
      
      // Mantener solo los últimos maxDataPoints
      if (updatedData.length > maxDataPoints) {
        return updatedData.slice(-maxDataPoints);
      }
      
      return updatedData;
    });

    // Actualizar estadísticas
    const now = Date.now();
    const timeDiff = now - lastUpdateRef.current;
    updateCountRef.current++;
    
    if (timeDiff > 0) {
      const updateRate = (updateCountRef.current / timeDiff) * 1000;
      setStats(prev => ({
        ...prev,
        totalPoints: data.length + 1,
        currentValue: newPoint.value,
        updateRate: Math.round(updateRate * 100) / 100
      }));
    }

    lastUpdateRef.current = now;
    onDataUpdate?.(data);
  }, [data, maxDataPoints, onDataUpdate]);

  // Configurar WebSocket
  const setupWebSocket = useCallback(() => {
    if (!websocketUrl) return;

    try {
      wsRef.current = new WebSocket(websocketUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('WebSocket conectado');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'data' && message.payload) {
            updateData(message.payload);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onerror = (event) => {
        setError('Error en WebSocket');
        onError?.(new Error('WebSocket error'));
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket desconectado');
      };

    } catch (err) {
      setError('Error conectando WebSocket');
      onError?.(err as Error);
    }
  }, [websocketUrl, updateData, onError]);

  // Configurar polling
  const setupPolling = useCallback(() => {
    if (!pollingUrl) return;

    const pollData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(pollingUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.data) {
          updateData(result.data);
        }
      } catch (err) {
        setError('Error en polling');
        onError?.(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    // Polling inicial
    pollData();
    
    // Configurar intervalo
    intervalRef.current = setInterval(pollData, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pollingUrl, updateInterval, updateData, onError]);

  // Configurar datos de ejemplo
  const setupSampleData = useCallback(() => {
    const generateData = () => {
      updateData(generateSampleData());
    };

    // Generar dato inicial
    generateData();
    
    // Configurar intervalo para datos de ejemplo
    intervalRef.current = setInterval(generateData, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateData, generateSampleData, updateInterval]);

  // Inicializar según el tipo de stream
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    switch (dataStream) {
      case 'websocket':
        setupWebSocket();
        break;
      case 'polling':
        cleanup = setupPolling();
        break;
      case 'manual':
      default:
        cleanup = setupSampleData();
        break;
    }

    return () => {
      cleanup?.();
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dataStream, setupWebSocket, setupPolling, setupSampleData]);

  // Calcular estadísticas
  useEffect(() => {
    if (data.length === 0) return;

    const values = data.map(d => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    setStats(prev => ({
      ...prev,
      averageValue: avg,
      maxValue: max,
      minValue: min
    }));
  }, [data]);

  // Formatear timestamp para el eje X
  const formatTimestamp = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  // Tooltip personalizado
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {formatTimestamp(data.timestamp)}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Valor: {data.value.toFixed(2)}
        </p>
        {data.category && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Categoría: {data.category}
          </p>
        )}
        {data.label && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Etiqueta: {data.label}
          </p>
        )}
      </div>
    );
  }, [formatTimestamp]);

  // Agrupar datos por categoría
  const groupedData = useMemo(() => {
    const grouped: Record<string, RealTimeDataPoint[]> = {};
    
    categories.forEach(category => {
      grouped[category] = data.filter(point => point.category === category);
    });
    
    return grouped;
  }, [data, categories]);

  // Renderizar líneas por categoría
  const renderLines = useCallback(() => {
    return categories.map((category, index) => {
      const categoryData = groupedData[category];
      if (!categoryData.length) return null;

      return (
        <Line
          key={category}
          type="monotone"
          dataKey="value"
          data={categoryData}
          stroke={colors[index % colors.length]}
          strokeWidth={2}
          dot={false}
          name={category}
          isAnimationActive={animate}
        />
      );
    });
  }, [categories, groupedData, colors, animate]);

  return (
    <div 
      className={cn(
        'w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
        className
      )}
      role="region"
      aria-label={accessibility.ariaLabel || title || 'Gráfico en Tiempo Real'}
      aria-describedby={accessibility.ariaDescription ? 'realtime-description' : undefined}
    >
      {accessibility.ariaDescription && (
        <div id="realtime-description" className="sr-only">
          {accessibility.ariaDescription}
        </div>
      )}

      {/* Header con estado de conexión */}
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        )}
        
        <div className="flex items-center space-x-2">
          {/* Indicador de estado */}
          <div className="flex items-center space-x-1">
            <div 
              className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-red-500'
              )}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          {/* Indicador de carga */}
          {isLoading && (
            <div className="flex items-center space-x-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Cargando...</span>
            </div>
          )}

          {/* Contador de datos */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {data.length} puntos
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Gráfico */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={size === 'sm' ? 200 : size === 'lg' ? 400 : 300}>
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            
            <XAxis 
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              name={xAxisLabel}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            
            <YAxis 
              name={yAxisLabel}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            
            {/* Área de fondo */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="transparent"
              fill="#3b82f6"
              fillOpacity={0.1}
            />
            
            {/* Líneas por categoría */}
            {renderLines()}
          </AreaChart>
        </ResponsiveContainer>

        {/* Indicador de actualización en tiempo real */}
        <div className="absolute top-2 right-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs animate-pulse">
          EN VIVO
        </div>
      </div>

      {/* Estadísticas en tiempo real */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {stats.currentValue.toFixed(1)}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Actual</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {stats.averageValue.toFixed(1)}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Promedio</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {stats.maxValue.toFixed(1)}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Máximo</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {stats.updateRate}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Actualizaciones/s</div>
        </div>
      </div>

      {/* Información del stream */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            Stream: {dataStream === 'websocket' ? 'WebSocket' : 
                    dataStream === 'polling' ? 'Polling' : 'Manual'}
          </span>
          <span>
            Intervalo: {updateInterval}ms
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span>
            Total de puntos: {stats.totalPoints}
          </span>
          <span>
            Última actualización: {data.length > 0 ? formatTimestamp(data[data.length - 1].timestamp) : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChart;
