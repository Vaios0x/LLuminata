'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, Treemap, TreemapItem } from 'recharts';
import { cn } from '@/lib/utils';

interface CulturalDataPoint {
  culture: string;
  language: string;
  region: string;
  value: number;
  population?: number;
  adaptation?: number;
  engagement?: number;
  satisfaction?: number;
  accessibility?: number;
  content?: number;
  symbols?: string[];
  colors?: string[];
  traditions?: string[];
  metadata?: Record<string, any>;
}

interface CulturalInsight {
  type: string;
  culture: string;
  metric: string;
  value: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
  confidence: number;
}

interface CulturalChartProps {
  data: CulturalDataPoint[];
  title?: string;
  chartType?: 'bar' | 'pie' | 'treemap' | 'radar';
  focus?: 'culture' | 'language' | 'region' | 'adaptation';
  showInsights?: boolean;
  showAdaptation?: boolean;
  showEngagement?: boolean;
  showAccessibility?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
  onCultureClick?: (culture: string) => void;
  onInsightDetected?: (insight: CulturalInsight) => void;
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    enableKeyboardNavigation?: boolean;
  };
}

const CulturalChart: React.FC<CulturalChartProps> = ({
  data,
  title,
  chartType = 'bar',
  focus = 'culture',
  showInsights = true,
  showAdaptation = true,
  showEngagement = true,
  showAccessibility = true,
  size = 'md',
  interactive = true,
  className,
  onCultureClick,
  onInsightDetected,
  accessibility = {}
}) => {
  const [selectedCulture, setSelectedCulture] = useState<string | null>(null);
  const [insights, setInsights] = useState<CulturalInsight[]>([]);
  const [focusedInsight, setFocusedInsight] = useState<CulturalInsight | null>(null);

  // Colores culturales representativos
  const culturalColors = {
    maya: '#8B4513',
    nahuatl: '#FF6B35',
    zapoteco: '#2E8B57',
    mixteco: '#FFD700',
    otomi: '#4169E1',
    purepecha: '#DC143C',
    tzotzil: '#9932CC',
    tzeltal: '#FF6347',
    chol: '#32CD32',
    totonaco: '#FF4500',
    huasteco: '#00CED1',
    mazateco: '#FF69B4',
    mixe: '#DDA0DD',
    chinanteco: '#F0E68C',
    mazahua: '#98FB98',
    default: '#6B7280'
  };

  // Procesar datos por cultura
  const processedData = useMemo(() => {
    if (!data.length) return [];

    const grouped = data.reduce((acc, point) => {
      const key = point[focus];
      if (!acc[key]) {
        acc[key] = {
          [focus]: key,
          totalValue: 0,
          count: 0,
          totalPopulation: 0,
          totalAdaptation: 0,
          totalEngagement: 0,
          totalSatisfaction: 0,
          totalAccessibility: 0,
          totalContent: 0,
          languages: new Set<string>(),
          regions: new Set<string>(),
          symbols: new Set<string>(),
          colors: new Set<string>(),
          traditions: new Set<string>()
        };
      }

      acc[key].totalValue += point.value;
      acc[key].count += 1;
      acc[key].totalPopulation += point.population || 0;
      acc[key].totalAdaptation += point.adaptation || 0;
      acc[key].totalEngagement += point.engagement || 0;
      acc[key].totalSatisfaction += point.satisfaction || 0;
      acc[key].totalAccessibility += point.accessibility || 0;
      acc[key].totalContent += point.content || 0;
      
      if (point.language) acc[key].languages.add(point.language);
      if (point.region) acc[key].regions.add(point.region);
      if (point.symbols) point.symbols.forEach(s => acc[key].symbols.add(s));
      if (point.colors) point.colors.forEach(c => acc[key].colors.add(c));
      if (point.traditions) point.traditions.forEach(t => acc[key].traditions.add(t));

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      averageValue: item.totalValue / item.count,
      averagePopulation: item.totalPopulation / item.count,
      averageAdaptation: item.totalAdaptation / item.count,
      averageEngagement: item.totalEngagement / item.count,
      averageSatisfaction: item.totalSatisfaction / item.count,
      averageAccessibility: item.totalAccessibility / item.count,
      averageContent: item.totalContent / item.count,
      languages: Array.from(item.languages),
      regions: Array.from(item.regions),
      symbols: Array.from(item.symbols),
      colors: Array.from(item.colors),
      traditions: Array.from(item.traditions),
      color: culturalColors[item[focus] as keyof typeof culturalColors] || culturalColors.default
    }));
  }, [data, focus]);

  // Detectar insights culturales
  const detectInsights = useCallback(() => {
    if (!data.length) return [];

    const detectedInsights: CulturalInsight[] = [];

    // Insight de adaptación más alta
    const highAdaptation = processedData.reduce((max, item) => 
      item.averageAdaptation > max.averageAdaptation ? item : max, processedData[0]);
    
    if (highAdaptation && highAdaptation.averageAdaptation > 80) {
      detectedInsights.push({
        type: 'Alta Adaptación',
        culture: highAdaptation[focus],
        metric: 'Adaptación',
        value: highAdaptation.averageAdaptation,
        trend: 'increasing',
        recommendation: 'Replicar estrategias de adaptación exitosas en otras culturas',
        confidence: highAdaptation.averageAdaptation / 100
      });
    }

    // Insight de baja accesibilidad
    const lowAccessibility = processedData.reduce((min, item) => 
      item.averageAccessibility < min.averageAccessibility ? item : min, processedData[0]);
    
    if (lowAccessibility && lowAccessibility.averageAccessibility < 50) {
      detectedInsights.push({
        type: 'Baja Accesibilidad',
        culture: lowAccessibility[focus],
        metric: 'Accesibilidad',
        value: lowAccessibility.averageAccessibility,
        trend: 'decreasing',
        recommendation: 'Priorizar mejoras de accesibilidad para esta cultura',
        confidence: (100 - lowAccessibility.averageAccessibility) / 100
      });
    }

    // Insight de alto engagement
    const highEngagement = processedData.reduce((max, item) => 
      item.averageEngagement > max.averageEngagement ? item : max, processedData[0]);
    
    if (highEngagement && highEngagement.averageEngagement > 85) {
      detectedInsights.push({
        type: 'Alto Engagement',
        culture: highEngagement[focus],
        metric: 'Engagement',
        value: highEngagement.averageEngagement,
        trend: 'increasing',
        recommendation: 'Estudiar factores de éxito para replicar en otras culturas',
        confidence: highEngagement.averageEngagement / 100
      });
    }

    // Insight de diversidad lingüística
    const diverseLanguages = processedData.reduce((max, item) => 
      item.languages.length > max.languages.length ? item : max, processedData[0]);
    
    if (diverseLanguages && diverseLanguages.languages.length > 3) {
      detectedInsights.push({
        type: 'Diversidad Lingüística',
        culture: diverseLanguages[focus],
        metric: 'Idiomas',
        value: diverseLanguages.languages.length,
        trend: 'stable',
        recommendation: 'Desarrollar contenido multilingüe específico',
        confidence: Math.min(diverseLanguages.languages.length / 5, 1)
      });
    }

    setInsights(detectedInsights);
    return detectedInsights;
  }, [data, processedData, focus]);

  // Detectar insights al cambiar datos
  useEffect(() => {
    if (showInsights) {
      const detectedInsights = detectInsights();
      detectedInsights.forEach(insight => onInsightDetected?.(insight));
    }
  }, [data, showInsights, detectInsights, onInsightDetected]);

  // Manejar clic en cultura
  const handleCultureClick = useCallback((culture: string) => {
    if (!interactive) return;
    
    setSelectedCulture(culture);
    onCultureClick?.(culture);
  }, [interactive, onCultureClick]);

  // Navegación con teclado
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!accessibility.enableKeyboardNavigation || !processedData.length) return;

    const currentIndex = processedData.findIndex(item => item[focus] === selectedCulture);
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
          handleCultureClick(processedData[currentIndex][focus]);
        }
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex && newIndex >= 0) {
      event.preventDefault();
      setSelectedCulture(processedData[newIndex][focus]);
    }
  }, [accessibility.enableKeyboardNavigation, processedData, selectedCulture, focus, handleCultureClick]);

  // Tooltip personalizado
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {data[focus]}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Valor promedio: {data.averageValue.toFixed(2)}
        </p>
        {showAdaptation && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adaptación: {data.averageAdaptation.toFixed(1)}%
          </p>
        )}
        {showEngagement && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Engagement: {data.averageEngagement.toFixed(1)}%
          </p>
        )}
        {showAccessibility && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Accesibilidad: {data.averageAccessibility.toFixed(1)}%
          </p>
        )}
        {data.languages.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Idiomas: {data.languages.join(', ')}
          </p>
        )}
        {data.regions.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Regiones: {data.regions.join(', ')}
          </p>
        )}
        {data.symbols.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Símbolos: {data.symbols.slice(0, 3).join(', ')}
            {data.symbols.length > 3 && '...'}
          </p>
        )}
      </div>
    );
  }, [focus, showAdaptation, showEngagement, showAccessibility]);

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
                nameKey={focus}
                cx="50%"
                cy="50%"
                outerRadius={chartHeight / 3}
                onClick={(data) => handleCultureClick(data[focus])}
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={selectedCulture === entry[focus] ? 0.8 : 1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'treemap':
        const treemapData = processedData.map(item => ({
          name: item[focus],
          size: item.averageValue,
          color: item.color,
          ...item
        }));

        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill={treemapData[0]?.color}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        );

      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey={focus}
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
                onClick={(data) => handleCultureClick(data[focus])}
                opacity={selectedCulture ? 0.6 : 1}
              />
              {showAdaptation && (
                <Bar
                  dataKey="averageAdaptation"
                  fill="#10b981"
                  onClick={(data) => handleCultureClick(data[focus])}
                />
              )}
              {showEngagement && (
                <Bar
                  dataKey="averageEngagement"
                  fill="#f59e0b"
                  onClick={(data) => handleCultureClick(data[focus])}
                />
              )}
              {showAccessibility && (
                <Bar
                  dataKey="averageAccessibility"
                  fill="#8b5cf6"
                  onClick={(data) => handleCultureClick(data[focus])}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  }, [chartType, processedData, size, selectedCulture, focus, showAdaptation, showEngagement, showAccessibility, handleCultureClick, CustomTooltip]);

  // Estadísticas culturales
  const stats = useMemo(() => {
    if (!data.length) return null;

    const totalCultures = processedData.length;
    const totalLanguages = new Set(data.map(d => d.language)).size;
    const totalRegions = new Set(data.map(d => d.region)).size;
    const averageAdaptation = processedData.reduce((sum, item) => sum + item.averageAdaptation, 0) / totalCultures;
    const averageEngagement = processedData.reduce((sum, item) => sum + item.averageEngagement, 0) / totalCultures;

    return {
      totalCultures,
      totalLanguages,
      totalRegions,
      averageAdaptation: Math.round(averageAdaptation),
      averageEngagement: Math.round(averageEngagement)
    };
  }, [data, processedData]);

  return (
    <div 
      className={cn(
        'w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
        className
      )}
      role="region"
      aria-label={accessibility.ariaLabel || title || 'Gráfico Cultural'}
      aria-describedby={accessibility.ariaDescription ? 'cultural-description' : undefined}
      tabIndex={accessibility.enableKeyboardNavigation ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {accessibility.ariaDescription && (
        <div id="cultural-description" className="sr-only">
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

        {/* Indicador de cultura seleccionada */}
        {selectedCulture && (
          <div className="absolute top-2 right-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-md text-sm">
            Seleccionado: {selectedCulture}
          </div>
        )}
      </div>

      {/* Insights culturales */}
      {showInsights && insights.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Insights Culturales
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                onMouseEnter={() => setFocusedInsight(insight)}
                onMouseLeave={() => setFocusedInsight(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {insight.type}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {(insight.confidence * 100).toFixed(0)}% confianza
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <p>Cultura: {insight.culture}</p>
                  <p>Métrica: {insight.metric} ({insight.value.toFixed(1)})</p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Tendencia: {insight.trend === 'increasing' ? '↗️ Aumentando' : 
                             insight.trend === 'decreasing' ? '↘️ Disminuyendo' : '→ Estable'}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  💡 {insight.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.totalCultures}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Culturas</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.totalLanguages}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Idiomas</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.totalRegions}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Regiones</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.averageAdaptation}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Adaptación</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.averageEngagement}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Engagement</div>
          </div>
        </div>
      )}

      {/* Información cultural */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            Enfoque: {focus.charAt(0).toUpperCase() + focus.slice(1)}
          </span>
          <span>
            Tipo: {chartType.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span>
            Culturas: {processedData.length}
          </span>
          <span>
            Insights: {insights.length}
          </span>
        </div>
      </div>

      {/* Instrucciones de accesibilidad */}
      {accessibility.enableKeyboardNavigation && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Usa las flechas para navegar, Enter para seleccionar cultura
        </div>
      )}
    </div>
  );
};

export default CulturalChart;
