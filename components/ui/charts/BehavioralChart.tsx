'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { cn } from '@/lib/utils';

interface BehavioralDataPoint {
  timestamp: number;
  category: string;
  value: number;
  duration?: number;
  frequency?: number;
  intensity?: number;
  context?: string;
  emotion?: string;
  attention?: number;
  engagement?: number;
  metadata?: Record<string, any>;
}

interface BehavioralPattern {
  type: string;
  frequency: number;
  averageDuration: number;
  peakTime: string;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendations: string[];
}

interface BehavioralChartProps {
  data: BehavioralDataPoint[];
  title?: string;
  chartType?: 'bar' | 'pie' | 'radar' | 'heatmap';
  categories?: string[];
  timeRange?: 'hour' | 'day' | 'week' | 'month';
  showPatterns?: boolean;
  showEmotions?: boolean;
  showAttention?: boolean;
  showEngagement?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
  onPatternDetected?: (pattern: BehavioralPattern) => void;
  onCategoryClick?: (category: string) => void;
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    enableKeyboardNavigation?: boolean;
  };
}

const BehavioralChart: React.FC<BehavioralChartProps> = ({
  data,
  title,
  chartType = 'bar',
  categories = [],
  timeRange = 'day',
  showPatterns = true,
  showEmotions = true,
  showAttention = true,
  showEngagement = true,
  size = 'md',
  interactive = true,
  className,
  onPatternDetected,
  onCategoryClick,
  accessibility = {}
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [focusedPattern, setFocusedPattern] = useState<BehavioralPattern | null>(null);
  const [patterns, setPatterns] = useState<BehavioralPattern[]>([]);

  // Colores para diferentes categorías
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  // Procesar datos por categoría
  const processedData = useMemo(() => {
    if (!data.length) return [];

    const grouped = data.reduce((acc, point) => {
      if (!acc[point.category]) {
        acc[point.category] = {
          category: point.category,
          totalValue: 0,
          count: 0,
          totalDuration: 0,
          totalFrequency: 0,
          totalIntensity: 0,
          totalAttention: 0,
          totalEngagement: 0,
          emotions: {} as Record<string, number>,
          contexts: {} as Record<string, number>,
          timestamps: [] as number[]
        };
      }

      acc[point.category].totalValue += point.value;
      acc[point.category].count += 1;
      acc[point.category].totalDuration += point.duration || 0;
      acc[point.category].totalFrequency += point.frequency || 0;
      acc[point.category].totalIntensity += point.intensity || 0;
      acc[point.category].totalAttention += point.attention || 0;
      acc[point.category].totalEngagement += point.engagement || 0;
      acc[point.category].timestamps.push(point.timestamp);

      if (point.emotion) {
        acc[point.category].emotions[point.emotion] = 
          (acc[point.category].emotions[point.emotion] || 0) + 1;
      }

      if (point.context) {
        acc[point.category].contexts[point.context] = 
          (acc[point.category].contexts[point.context] || 0) + 1;
      }

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      averageValue: item.totalValue / item.count,
      averageDuration: item.totalDuration / item.count,
      averageFrequency: item.totalFrequency / item.count,
      averageIntensity: item.totalIntensity / item.count,
      averageAttention: item.totalAttention / item.count,
      averageEngagement: item.totalEngagement / item.count,
      dominantEmotion: Object.keys(item.emotions).reduce((a, b) => 
        item.emotions[a] > item.emotions[b] ? a : b, 'neutral'),
      dominantContext: Object.keys(item.contexts).reduce((a, b) => 
        item.contexts[a] > item.contexts[b] ? a : b, 'general')
    }));
  }, [data]);

  // Detectar patrones de comportamiento
  const detectPatterns = useCallback(() => {
    if (!data.length) return [];

    const detectedPatterns: BehavioralPattern[] = [];

    // Patrón de frecuencia
    const frequencyPattern = processedData.reduce((max, item) => 
      item.averageFrequency > max.averageFrequency ? item : max, processedData[0]);
    
    if (frequencyPattern) {
      detectedPatterns.push({
        type: 'Frecuencia Alta',
        frequency: frequencyPattern.averageFrequency,
        averageDuration: frequencyPattern.averageDuration,
        peakTime: new Date(Math.max(...frequencyPattern.timestamps)).toLocaleTimeString(),
        confidence: Math.min(frequencyPattern.averageFrequency / 10, 1),
        trend: frequencyPattern.averageFrequency > 5 ? 'increasing' : 'stable',
        recommendations: [
          'Considerar reducir la frecuencia de esta actividad',
          'Evaluar si es necesario o compulsivo',
          'Buscar alternativas menos frecuentes'
        ]
      });
    }

    // Patrón de duración
    const durationPattern = processedData.reduce((max, item) => 
      item.averageDuration > max.averageDuration ? item : max, processedData[0]);
    
    if (durationPattern) {
      detectedPatterns.push({
        type: 'Duración Extendida',
        frequency: durationPattern.averageFrequency,
        averageDuration: durationPattern.averageDuration,
        peakTime: new Date(Math.max(...durationPattern.timestamps)).toLocaleTimeString(),
        confidence: Math.min(durationPattern.averageDuration / 3600, 1),
        trend: durationPattern.averageDuration > 1800 ? 'increasing' : 'stable',
        recommendations: [
          'Establecer límites de tiempo para esta actividad',
          'Implementar recordatorios de descanso',
          'Buscar actividades alternativas más cortas'
        ]
      });
    }

    // Patrón de atención
    const attentionPattern = processedData.reduce((max, item) => 
      item.averageAttention > max.averageAttention ? item : max, processedData[0]);
    
    if (attentionPattern) {
      detectedPatterns.push({
        type: 'Alta Atención',
        frequency: attentionPattern.averageFrequency,
        averageDuration: attentionPattern.averageDuration,
        peakTime: new Date(Math.max(...attentionPattern.timestamps)).toLocaleTimeString(),
        confidence: attentionPattern.averageAttention / 100,
        trend: attentionPattern.averageAttention > 80 ? 'increasing' : 'stable',
        recommendations: [
          'Aprovechar este patrón para actividades importantes',
          'Programar tareas críticas en estos momentos',
          'Mantener el entorno libre de distracciones'
        ]
      });
    }

    setPatterns(detectedPatterns);
    return detectedPatterns;
  }, [data, processedData]);

  // Detectar patrones al cambiar datos
  useEffect(() => {
    if (showPatterns) {
      const detectedPatterns = detectPatterns();
      detectedPatterns.forEach(pattern => onPatternDetected?.(pattern));
    }
  }, [data, showPatterns, detectPatterns, onPatternDetected]);

  // Manejar clic en categoría
  const handleCategoryClick = useCallback((category: string) => {
    if (!interactive) return;
    
    setSelectedCategory(category);
    onCategoryClick?.(category);
  }, [interactive, onCategoryClick]);

  // Navegación con teclado
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!accessibility.enableKeyboardNavigation || !processedData.length) return;

    const currentIndex = processedData.findIndex(item => item.category === selectedCategory);
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        newIndex = Math.min(currentIndex + 1, processedData.length - 1);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Enter':
      case ' ':
        if (currentIndex >= 0) {
          handleCategoryClick(processedData[currentIndex].category);
        }
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex && newIndex >= 0) {
      event.preventDefault();
      setSelectedCategory(processedData[newIndex].category);
    }
  }, [accessibility.enableKeyboardNavigation, processedData, selectedCategory, handleCategoryClick]);

  // Tooltip personalizado
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {data.category}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Valor promedio: {data.averageValue.toFixed(2)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Frecuencia: {data.averageFrequency.toFixed(1)}/hora
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Duración: {Math.round(data.averageDuration / 60)} min
        </p>
        {showAttention && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Atención: {data.averageAttention.toFixed(1)}%
          </p>
        )}
        {showEngagement && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Compromiso: {data.averageEngagement.toFixed(1)}%
          </p>
        )}
        {data.dominantEmotion && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Emoción dominante: {data.dominantEmotion}
          </p>
        )}
      </div>
    );
  }, [showAttention, showEngagement]);

  // Renderizar gráfico según tipo
  const renderChart = useCallback(() => {
    const chartHeight = size === 'sm' ? 200 : size === 'lg' ? 400 : 300;

    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={processedData}
                dataKey="averageValue"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={chartHeight / 3}
                onClick={(data) => handleCategoryClick(data.payload?.category || '')}
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                    opacity={selectedCategory === entry.category ? 0.8 : 1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        const radarData = processedData.map(item => ({
          subject: item.category,
          A: item.averageValue,
          B: item.averageFrequency,
          C: item.averageDuration / 60, // Convertir a minutos
          D: item.averageAttention,
          E: item.averageEngagement,
          fullMark: 100
        }));

        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Valor"
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Radar
                name="Frecuencia"
                dataKey="B"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <Radar
                name="Duración"
                dataKey="C"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.3}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="averageValue"
                fill="#3b82f6"
                onClick={(data) => handleCategoryClick(data.payload?.category || '')}
                opacity={selectedCategory ? 0.6 : 1}
              />
              {showAttention && (
                <Bar
                  dataKey="averageAttention"
                  fill="#10b981"
                  onClick={(data) => handleCategoryClick(data.payload?.category || '')}
                />
              )}
              {showEngagement && (
                <Bar
                  dataKey="averageEngagement"
                  fill="#f59e0b"
                  onClick={(data) => handleCategoryClick(data.payload?.category || '')}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  }, [chartType, processedData, size, selectedCategory, showAttention, showEngagement, handleCategoryClick, CustomTooltip, colors]);

  // Estadísticas generales
  const stats = useMemo(() => {
    if (!data.length) return null;

    const totalInteractions = data.length;
    const totalDuration = data.reduce((sum, item) => sum + (item.duration || 0), 0);
    const averageAttention = data.reduce((sum, item) => sum + (item.attention || 0), 0) / totalInteractions;
    const averageEngagement = data.reduce((sum, item) => sum + (item.engagement || 0), 0) / totalInteractions;

    return {
      totalInteractions,
      totalDuration: Math.round(totalDuration / 60), // En minutos
      averageAttention: Math.round(averageAttention),
      averageEngagement: Math.round(averageEngagement),
      categories: processedData.length
    };
  }, [data, processedData]);

  return (
    <div 
      className={cn(
        'w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
        className
      )}
      role="region"
      aria-label={accessibility.ariaLabel || title || 'Gráfico de Comportamiento'}
      aria-describedby={accessibility.ariaDescription ? 'behavioral-description' : undefined}
      tabIndex={accessibility.enableKeyboardNavigation ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {accessibility.ariaDescription && (
        <div id="behavioral-description" className="sr-only">
          {accessibility.ariaDescription}
        </div>
      )}

      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
      )}

      {/* Gráfico */}
      <div className="relative">
        {renderChart()}

        {/* Indicador de categoría seleccionada */}
        {selectedCategory && (
          <div className="absolute top-2 right-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-md text-sm">
            Seleccionado: {selectedCategory}
          </div>
        )}
      </div>

      {/* Patrones detectados */}
      {showPatterns && patterns.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Patrones Detectados
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.map((pattern, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                onMouseEnter={() => setFocusedPattern(pattern)}
                onMouseLeave={() => setFocusedPattern(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {pattern.type}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {(pattern.confidence * 100).toFixed(0)}% confianza
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <p>Frecuencia: {pattern.frequency.toFixed(1)}/hora</p>
                  <p>Duración: {Math.round(pattern.averageDuration / 60)} min</p>
                  <p>Pico: {pattern.peakTime}</p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Tendencia: {pattern.trend === 'increasing' ? '↗️ Aumentando' : 
                             pattern.trend === 'decreasing' ? '↘️ Disminuyendo' : '→ Estable'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.totalInteractions}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Interacciones</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.totalDuration}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Minutos</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.averageAttention}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Atención</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.averageEngagement}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Compromiso</div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            Tipo: {chartType.toUpperCase()}
          </span>
          <span>
            Categorías: {processedData.length}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span>
            Rango: {timeRange}
          </span>
          <span>
            Patrones: {patterns.length}
          </span>
        </div>
      </div>

      {/* Instrucciones de accesibilidad */}
      {accessibility.enableKeyboardNavigation && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Usa las flechas para navegar, Enter para seleccionar categoría
        </div>
      )}
    </div>
  );
};

export default BehavioralChart;
