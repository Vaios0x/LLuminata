'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ZAxis } from 'recharts';
import { cn } from '@/lib/utils';

interface HeatmapDataPoint {
  x: number;
  y: number;
  value: number;
  label?: string;
  category?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

interface HeatmapChartProps {
  data: HeatmapDataPoint[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colorScale?: string[];
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  className?: string;
  onPointClick?: (point: HeatmapDataPoint) => void;
  onPointHover?: (point: HeatmapDataPoint) => void;
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    enableKeyboardNavigation?: boolean;
  };
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  title,
  xAxisLabel = 'X Axis',
  yAxisLabel = 'Y Axis',
  colorScale = ['#f7fafc', '#e2e8f0', '#cbd5e0', '#a0aec0', '#718096', '#4a5568', '#2d3748', '#1a202c'],
  size = 'md',
  interactive = true,
  showTooltip = true,
  showGrid = true,
  className,
  onPointClick,
  onPointHover,
  accessibility = {}
}) => {
  const [selectedPoint, setSelectedPoint] = useState<HeatmapDataPoint | null>(null);
  const [focusedPoint, setFocusedPoint] = useState<number | null>(null);

  // Normalizar datos para el heatmap
  const normalizedData = useMemo(() => {
    if (!data.length) return [];
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    
    return data.map((point, index) => ({
      ...point,
      normalizedValue: maxValue === minValue ? 0.5 : (point.value - minValue) / (maxValue - minValue),
      index
    }));
  }, [data]);

  // Generar colores basados en el valor
  const getColor = useCallback((value: number) => {
    const index = Math.floor(value * (colorScale.length - 1));
    return colorScale[Math.min(index, colorScale.length - 1)];
  }, [colorScale]);

  // Calcular tamaño de los puntos
  const getPointSize = useCallback((value: number) => {
    const baseSize = size === 'sm' ? 4 : size === 'lg' ? 12 : 8;
    return baseSize + (value * 8);
  }, [size]);

  // Manejar clic en punto
  const handlePointClick = useCallback((point: any) => {
    if (!interactive) return;
    
    const dataPoint = normalizedData[point.index];
    setSelectedPoint(dataPoint);
    onPointClick?.(dataPoint);
  }, [interactive, normalizedData, onPointClick]);

  // Manejar hover en punto
  const handlePointHover = useCallback((point: any, isEnter: boolean) => {
    if (!interactive) return;
    
    if (isEnter) {
      const dataPoint = normalizedData[point.index];
      setFocusedPoint(point.index);
      onPointHover?.(dataPoint);
    } else {
      setFocusedPoint(null);
    }
  }, [interactive, normalizedData, onPointHover]);

  // Navegación con teclado
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!accessibility.enableKeyboardNavigation || !normalizedData.length) return;

    const currentIndex = focusedPoint ?? -1;
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        newIndex = Math.min(currentIndex + 1, normalizedData.length - 1);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - 10, 0);
        break;
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + 10, normalizedData.length - 1);
        break;
      case 'Enter':
      case ' ':
        if (currentIndex >= 0) {
          handlePointClick({ index: currentIndex });
        }
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      setFocusedPoint(newIndex);
      onPointHover?.(normalizedData[newIndex]);
    }
  }, [accessibility.enableKeyboardNavigation, focusedPoint, normalizedData, handlePointClick, onPointHover]);

  // Tooltip personalizado
  const CustomTooltip = useCallback(({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {data.label || `Punto (${data.x}, ${data.y})`}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Valor: {data.value}
        </p>
        {data.category && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Categoría: {data.category}
          </p>
        )}
        {data.timestamp && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Fecha: {data.timestamp.toLocaleDateString()}
          </p>
        )}
      </div>
    );
  }, []);

  // Estadísticas del dataset
  const stats = useMemo(() => {
    if (!data.length) return null;
    
    const values = data.map(d => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return { sum, avg, max, min, count: data.length };
  }, [data]);

  return (
    <div 
      className={cn(
        'w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
        className
      )}
      role="region"
      aria-label={accessibility.ariaLabel || title || 'Gráfico de Heatmap'}
      aria-describedby={accessibility.ariaDescription ? 'heatmap-description' : undefined}
      tabIndex={accessibility.enableKeyboardNavigation ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {accessibility.ariaDescription && (
        <div id="heatmap-description" className="sr-only">
          {accessibility.ariaDescription}
        </div>
      )}

      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
      )}

      <div className="relative">
        <ResponsiveContainer width="100%" height={size === 'sm' ? 200 : size === 'lg' ? 400 : 300}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            data={normalizedData}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            
            <XAxis 
              type="number" 
              dataKey="x" 
              name={xAxisLabel}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            
            <YAxis 
              type="number" 
              dataKey="y" 
              name={yAxisLabel}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            
            <ZAxis type="number" dataKey="normalizedValue" range={[0, 1]} />
            
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            
            <Scatter
              dataKey="y"
              fill="#8884d8"
              onClick={handlePointClick}
              onMouseEnter={(point) => handlePointHover(point, true)}
              onMouseLeave={(point) => handlePointHover(point, false)}
            >
              {normalizedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(entry.normalizedValue)}
                  r={getPointSize(entry.normalizedValue)}
                  opacity={focusedPoint === index ? 0.8 : 1}
                  stroke={selectedPoint === entry ? '#000' : 'none'}
                  strokeWidth={selectedPoint === entry ? 2 : 0}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Indicador de punto seleccionado */}
        {selectedPoint && (
          <div className="absolute top-2 right-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-md text-sm">
            Seleccionado: {selectedPoint.label || `(${selectedPoint.x}, ${selectedPoint.y})`}
          </div>
        )}
      </div>

      {/* Leyenda de colores */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Intensidad:</span>
          <div className="flex space-x-1">
            {colorScale.map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
                title={`Nivel ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {stats.count} puntos | Max: {stats.max.toFixed(1)} | Prom: {stats.avg.toFixed(1)}
          </div>
        )}
      </div>

      {/* Instrucciones de accesibilidad */}
      {accessibility.enableKeyboardNavigation && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Usa las flechas para navegar, Enter para seleccionar
        </div>
      )}
    </div>
  );
};

export default HeatmapChart;
