'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';

interface DataPoint {
  date: string;
  actual: number;
  predicted?: number;
  confidence?: number;
  upperBound?: number;
  lowerBound?: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
  seasonality?: number;
  anomaly?: boolean;
  metadata?: Record<string, any>;
}

interface PredictiveChartProps {
  data: DataPoint[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  predictionHorizon?: number; // Días hacia el futuro
  confidenceLevel?: number; // 0-1
  showConfidenceInterval?: boolean;
  showTrend?: boolean;
  showSeasonality?: boolean;
  showAnomalies?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
  onPointClick?: (point: DataPoint) => void;
  onPredictionUpdate?: (predictions: DataPoint[]) => void;
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    enableKeyboardNavigation?: boolean;
  };
}

const PredictiveChart: React.FC<PredictiveChartProps> = ({
  data,
  title,
  xAxisLabel = 'Fecha',
  yAxisLabel = 'Valor',
  predictionHorizon = 30,
  confidenceLevel = 0.95,
  showConfidenceInterval = true,
  showTrend = true,
  showSeasonality = false,
  showAnomalies = true,
  size = 'md',
  interactive = true,
  className,
  onPointClick,
  onPredictionUpdate,
  accessibility = {}
}) => {
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [focusedPoint, setFocusedPoint] = useState<number | null>(null);
  const [predictions, setPredictions] = useState<DataPoint[]>([]);
  const [isGeneratingPredictions, setIsGeneratingPredictions] = useState(false);

  // Calcular predicciones usando algoritmo simple de tendencia lineal
  const generatePredictions = useCallback(async () => {
    if (data.length < 3) return;

    setIsGeneratingPredictions(true);
    
    try {
      // Algoritmo de predicción simple basado en tendencia lineal
      const recentData = data.slice(-10); // Últimos 10 puntos
      const xValues = recentData.map((_, i) => i);
      const yValues = recentData.map(d => d.actual);
      
      // Calcular pendiente y intercepto
      const n = xValues.length;
      const sumX = xValues.reduce((a, b) => a + b, 0);
      const sumY = yValues.reduce((a, b) => a + b, 0);
      const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0);
      const sumXX = xValues.reduce((a, b) => a + b * b, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      // Calcular intervalo de confianza
      const residuals = yValues.map((y, i) => y - (slope * xValues[i] + intercept));
      const mse = residuals.reduce((a, b) => a + b * b, 0) / (n - 2);
      const standardError = Math.sqrt(mse * (1/n + Math.pow(n, 2) / (n * sumXX - sumX * sumX)));
      const tValue = 1.96; // Para 95% de confianza
      const marginOfError = tValue * standardError;
      
      // Generar predicciones futuras
      const newPredictions: DataPoint[] = [];
      const lastDate = new Date(data[data.length - 1].date);
      
      for (let i = 1; i <= predictionHorizon; i++) {
        const futureDate = new Date(lastDate);
        futureDate.setDate(lastDate.getDate() + i);
        
        const predictedValue = slope * (n + i - 1) + intercept;
        const confidence = Math.max(0, 1 - (i / predictionHorizon));
        
        newPredictions.push({
          date: futureDate.toISOString().split('T')[0],
          actual: 0, // No hay datos reales para el futuro
          predicted: Math.max(0, predictedValue),
          confidence,
          upperBound: predictedValue + marginOfError * Math.sqrt(i),
          lowerBound: Math.max(0, predictedValue - marginOfError * Math.sqrt(i)),
          trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable'
        });
      }
      
      setPredictions(newPredictions);
      onPredictionUpdate?.(newPredictions);
      
    } catch (error) {
      console.error('Error generando predicciones:', error);
    } finally {
      setIsGeneratingPredictions(false);
    }
  }, [data, predictionHorizon, onPredictionUpdate]);

  // Combinar datos históricos con predicciones
  const combinedData = useMemo(() => {
    const historical = data.map(point => ({
      ...point,
      type: 'historical' as const
    }));
    
    const predicted = predictions.map(point => ({
      ...point,
      type: 'predicted' as const
    }));
    
    return [...historical, ...predicted];
  }, [data, predictions]);

  // Detectar anomalías usando método de desviación estándar
  const detectAnomalies = useCallback((dataPoints: DataPoint[]) => {
    if (dataPoints.length < 3) return dataPoints;
    
    const values = dataPoints.map(d => d.actual).filter(v => v > 0);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const threshold = 2 * stdDev; // 2 desviaciones estándar
    
    return dataPoints.map(point => ({
      ...point,
      anomaly: Math.abs(point.actual - mean) > threshold
    }));
  }, []);

  // Datos con anomalías detectadas
  const dataWithAnomalies = useMemo(() => {
    return detectAnomalies(data);
  }, [data, detectAnomalies]);

  // Manejar clic en punto
  const handlePointClick = useCallback((point: any) => {
    if (!interactive) return;
    
    const dataPoint = combinedData[point.index];
    setSelectedPoint(dataPoint);
    onPointClick?.(dataPoint);
  }, [interactive, combinedData, onPointClick]);

  // Navegación con teclado
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!accessibility.enableKeyboardNavigation || !combinedData.length) return;

    const currentIndex = focusedPoint ?? -1;
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        newIndex = Math.min(currentIndex + 1, combinedData.length - 1);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(currentIndex - 1, 0);
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
    }
  }, [accessibility.enableKeyboardNavigation, focusedPoint, combinedData, handlePointClick]);

  // Tooltip personalizado
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const isPrediction = data.type === 'predicted';
    
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {label}
        </p>
        {isPrediction ? (
          <>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Predicción: {data.predicted?.toFixed(2)}
            </p>
            {showConfidenceInterval && data.upperBound && data.lowerBound && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Intervalo: {data.lowerBound.toFixed(2)} - {data.upperBound.toFixed(2)}
              </p>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Confianza: {(data.confidence * 100).toFixed(1)}%
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Valor: {data.actual.toFixed(2)}
            </p>
            {data.anomaly && (
              <p className="text-xs text-red-600 dark:text-red-400">
                ⚠️ Anomalía detectada
              </p>
            )}
          </>
        )}
        {data.trend && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Tendencia: {data.trend === 'increasing' ? '↗️ Aumentando' : 
                       data.trend === 'decreasing' ? '↘️ Disminuyendo' : '→ Estable'}
          </p>
        )}
      </div>
    );
  }, [showConfidenceInterval]);

  // Generar predicciones al montar el componente
  useEffect(() => {
    generatePredictions();
  }, [generatePredictions]);

  // Estadísticas del dataset
  const stats = useMemo(() => {
    if (!data.length) return null;
    
    const values = data.map(d => d.actual).filter(v => v > 0);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const anomalies = dataWithAnomalies.filter(d => d.anomaly).length;
    
    return { sum, avg, max, min, count: data.length, anomalies };
  }, [data, dataWithAnomalies]);

  return (
    <div 
      className={cn(
        'w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
        className
      )}
      role="region"
      aria-label={accessibility.ariaLabel || title || 'Gráfico Predictivo'}
      aria-describedby={accessibility.ariaDescription ? 'predictive-description' : undefined}
      tabIndex={accessibility.enableKeyboardNavigation ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {accessibility.ariaDescription && (
        <div id="predictive-description" className="sr-only">
          {accessibility.ariaDescription}
        </div>
      )}

      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <button
            onClick={generatePredictions}
            disabled={isGeneratingPredictions}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            aria-label="Regenerar predicciones"
          >
            {isGeneratingPredictions ? 'Generando...' : '🔄'}
          </button>
        </div>
      )}

      <div className="relative">
        <ResponsiveContainer width="100%" height={size === 'sm' ? 200 : size === 'lg' ? 400 : 300}>
          <AreaChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            
            <XAxis 
              dataKey="date" 
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
            <Legend />
            
            {/* Datos históricos */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Datos Históricos"
              strokeWidth={2}
              dot={(props) => {
                const data = props.payload;
                return (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={data.anomaly ? 6 : 4}
                    fill={data.anomaly ? "#ef4444" : "#3b82f6"}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              }}
            />
            
            {/* Predicciones */}
            {predictions.length > 0 && (
              <>
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicción"
                  dot={false}
                />
                
                {/* Intervalo de confianza */}
                {showConfidenceInterval && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="upperBound"
                      stroke="transparent"
                      fill="#10b981"
                      fillOpacity={0.1}
                      name="Intervalo de Confianza"
                    />
                    <Area
                      type="monotone"
                      dataKey="lowerBound"
                      stroke="transparent"
                      fill="#10b981"
                      fillOpacity={0.1}
                    />
                  </>
                )}
              </>
            )}
            
            {/* Línea de separación entre datos históricos y predicciones */}
            {predictions.length > 0 && (
              <ReferenceLine
                x={data[data.length - 1]?.date}
                stroke="#6b7280"
                strokeDasharray="3 3"
                label="Hoy"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Indicador de punto seleccionado */}
        {selectedPoint && (
          <div className="absolute top-2 right-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-md text-sm">
            {selectedPoint.predicted ? 'Predicción' : 'Dato'} - {selectedPoint.date}
          </div>
        )}
      </div>

      {/* Estadísticas y métricas */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {stats && (
          <>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {stats.count}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Datos</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {stats.avg.toFixed(1)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Promedio</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {predictions.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Predicciones</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600 dark:text-red-400">
                {stats.anomalies}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Anomalías</div>
            </div>
          </>
        )}
      </div>

      {/* Leyenda de colores */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Datos históricos</span>
        </div>
        {predictions.length > 0 && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Predicción</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 bg-opacity-20 rounded"></div>
              <span>Intervalo de confianza</span>
            </div>
          </>
        )}
        {showAnomalies && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Anomalía</span>
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

export default PredictiveChart;
