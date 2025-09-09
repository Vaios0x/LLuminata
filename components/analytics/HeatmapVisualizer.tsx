'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Settings,
  Info,
  HelpCircle,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Share2,
  BarChart3,
  PieChart,
  LineChart,
  AreaChart,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Brain,
  Lightbulb,
  GraduationCap,
  Trophy,
  Star,
  Heart,
  MessageSquare,
  BookOpen,
  Target,
  Award,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Link,
  Unlink,
  Lock,
  Unlock,
  Shield,
  Key,
  Bell,
  Mail,
  Phone,
  Video,
  Image,
  FileText,
  File,
  Folder,
  FolderOpen,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Signal,
  Battery,
  BatteryCharging,
  WifiOff,
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero,
  WifiHigh,
  WifiLow,
  WifiZero,
  BatteryFull
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface HeatmapData {
  date: string;
  hour: number;
  value: number;
  category: string;
  userId?: string;
  sessionId?: string;
  deviceType?: string;
  location?: string;
  activity?: string;
}

interface HeatmapVisualizerProps {
  userId?: string;
  className?: string;
  refreshInterval?: number;
  data?: HeatmapData[];
  onDataUpdate?: (data: HeatmapData[]) => void;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
  onFilterChange?: (filters: HeatmapFilters) => void;
}

interface HeatmapFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  categories: string[];
  deviceTypes: string[];
  locations: string[];
  activities: string[];
  minValue: number;
  maxValue: number;
}

interface HeatmapCell {
  date: string;
  hour: number;
  value: number;
  intensity: number;
  category: string;
  tooltip: string;
}

export const HeatmapVisualizer: React.FC<HeatmapVisualizerProps> = ({
  userId,
  className = '',
  refreshInterval = 30000,
  data = [],
  onDataUpdate,
  onExport,
  onFilterChange
}) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>(data);
  const [filters, setFilters] = useState<HeatmapFilters>({
    dateRange: {
      start: startOfWeek(new Date()),
      end: endOfWeek(new Date())
    },
    categories: [],
    deviceTypes: [],
    locations: [],
    activities: [],
    minValue: 0,
    maxValue: 100
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedView, setSelectedView] = useState<'heatmap' | 'chart' | 'table'>('heatmap');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadHeatmapData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: userId || '',
        startDate: filters.dateRange.start.toISOString(),
        endDate: filters.dateRange.end.toISOString(),
        ...(filters.categories.length > 0 && { categories: filters.categories.join(',') }),
        ...(filters.deviceTypes.length > 0 && { deviceTypes: filters.deviceTypes.join(',') }),
        ...(filters.locations.length > 0 && { locations: filters.locations.join(',') }),
        ...(filters.activities.length > 0 && { activities: filters.activities.join(',') })
      });

      const response = await fetch(`/api/analytics/heatmap?${params}`);
      
      if (!response.ok) {
        throw new Error('Error cargando datos del heatmap');
      }

      const responseData = await response.json();
      setHeatmapData(responseData.data || []);
      
      if (onDataUpdate) {
        onDataUpdate(responseData.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userId, filters, onDataUpdate]);

  const processHeatmapData = useMemo(() => {
    if (!heatmapData.length) return [];

    const maxValue = Math.max(...heatmapData.map(d => d.value));
    const minValue = Math.min(...heatmapData.map(d => d.value));

    return heatmapData.map(item => ({
      ...item,
      intensity: maxValue > minValue ? (item.value - minValue) / (maxValue - minValue) : 0.5,
      tooltip: `${format(parseISO(item.date), 'EEEE, d MMMM yyyy', { locale: es })}\n${item.hour}:00 - ${item.hour + 1}:00\n${item.category}: ${item.value} sesiones\n${item.deviceType || 'Dispositivo desconocido'}\n${item.location || 'Ubicación desconocida'}`
    }));
  }, [heatmapData]);

  const getIntensityColor = (intensity: number, category: string): string => {
    const baseColors = {
      'lesson': 'bg-blue',
      'assessment': 'bg-green',
      'social': 'bg-purple',
      'cultural': 'bg-orange',
      'default': 'bg-gray'
    };

    const baseColor = baseColors[category as keyof typeof baseColors] || baseColors.default;
    
    if (intensity < 0.2) return `${baseColor}-100`;
    if (intensity < 0.4) return `${baseColor}-200`;
    if (intensity < 0.6) return `${baseColor}-300`;
    if (intensity < 0.8) return `${baseColor}-400`;
    return `${baseColor}-500`;
  };

  const generateWeeklyHeatmap = useMemo(() => {
    const days = eachDayOfInterval({
      start: filters.dateRange.start,
      end: filters.dateRange.end
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const cells: HeatmapCell[][] = [];

    days.forEach(day => {
      const dayCells: HeatmapCell[] = [];
      const dayData = processHeatmapData.filter(d => isSameDay(parseISO(d.date), day));

      hours.forEach(hour => {
        const hourData = dayData.find(d => d.hour === hour);
        if (hourData) {
          dayCells.push({
            date: hourData.date,
            hour: hourData.hour,
            value: hourData.value,
            intensity: hourData.intensity,
            category: hourData.category,
            tooltip: hourData.tooltip
          });
        } else {
          dayCells.push({
            date: format(day, 'yyyy-MM-dd'),
            hour,
            value: 0,
            intensity: 0,
            category: 'default',
            tooltip: `${format(day, 'EEEE, d MMMM yyyy', { locale: es })}\n${hour}:00 - ${hour + 1}:00\nSin actividad`
          });
        }
      });
      cells.push(dayCells);
    });

    return cells;
  }, [processHeatmapData, filters.dateRange]);

  const handleFilterChange = (newFilters: Partial<HeatmapFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    if (onExport) {
      onExport(format);
    } else {
      // Implementación por defecto
      const dataStr = format === 'json' 
        ? JSON.stringify(heatmapData, null, 2)
        : heatmapData.map(d => `${d.date},${d.hour},${d.value},${d.category}`).join('\n');
      
      const blob = new Blob([dataStr], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `heatmap-data.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    loadHeatmapData();
    
    if (autoRefresh) {
      const interval = setInterval(loadHeatmapData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadHeatmapData, autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" 
               role="status" 
               aria-label="Cargando datos del heatmap">
            <span className="sr-only">Cargando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Error: {error}</p>
            <Button onClick={loadHeatmapData} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <CardTitle>Visualizador de Heatmap</CardTitle>
            <Badge variant="outline" className="ml-2">
              {heatmapData.length} registros
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Mostrar filtros"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              aria-label="Exportar como CSV"
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
              aria-label="Exportar como JSON"
            >
              <Download className="w-4 h-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtros */}
        {showFilters && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Rango de fechas</label>
                  <div className="flex space-x-2 mt-1">
                    <input
                      type="date"
                      value={format(filters.dateRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => handleFilterChange({
                        dateRange: { ...filters.dateRange, start: new Date(e.target.value) }
                      })}
                      className="text-sm border rounded px-2 py-1"
                      aria-label="Fecha de inicio"
                    />
                    <input
                      type="date"
                      value={format(filters.dateRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => handleFilterChange({
                        dateRange: { ...filters.dateRange, end: new Date(e.target.value) }
                      })}
                      className="text-sm border rounded px-2 py-1"
                      aria-label="Fecha de fin"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Categorías</label>
                  <select
                    multiple
                    value={filters.categories}
                    onChange={(e) => handleFilterChange({
                      categories: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                    className="text-sm border rounded px-2 py-1 w-full mt-1"
                    aria-label="Seleccionar categorías"
                  >
                    <option value="lesson">Lecciones</option>
                    <option value="assessment">Evaluaciones</option>
                    <option value="social">Social</option>
                    <option value="cultural">Cultural</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Dispositivos</label>
                  <select
                    multiple
                    value={filters.deviceTypes}
                    onChange={(e) => handleFilterChange({
                      deviceTypes: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                    className="text-sm border rounded px-2 py-1 w-full mt-1"
                    aria-label="Seleccionar tipos de dispositivo"
                  >
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Móvil</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Auto-refresh</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="rounded"
                      aria-label="Activar auto-refresh"
                    />
                    <span className="text-sm">Activo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs de vista */}
        <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="chart">Gráfico</TabsTrigger>
            <TabsTrigger value="table">Tabla</TabsTrigger>
          </TabsList>

          <TabsContent value="heatmap" className="space-y-4">
            {/* Heatmap semanal */}
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* Encabezados de horas */}
                <div className="flex">
                  <div className="w-20 h-8"></div>
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="w-8 h-8 flex items-center justify-center text-xs font-medium border-b border-r">
                      {i}
                    </div>
                  ))}
                </div>

                {/* Filas de días */}
                {generateWeeklyHeatmap.map((dayCells, dayIndex) => (
                  <div key={dayIndex} className="flex">
                    <div className="w-20 h-8 flex items-center justify-center text-xs font-medium border-b border-r">
                      {format(parseISO(dayCells[0]?.date || new Date().toISOString()), 'EEE', { locale: es })}
                    </div>
                    {dayCells.map((cell, hourIndex) => (
                      <div
                        key={hourIndex}
                        className={`w-8 h-8 border-b border-r cursor-pointer transition-colors ${
                          cell.value > 0 ? getIntensityColor(cell.intensity, cell.category) : 'bg-gray-50'
                        }`}
                        title={cell.tooltip}
                        role="button"
                        tabIndex={0}
                        aria-label={`${cell.tooltip} - ${cell.value} sesiones`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            // Acción al hacer clic
                          }
                        }}
                      >
                        {cell.value > 0 && (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {cell.value}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Leyenda */}
            <div className="flex items-center justify-center space-x-4">
              <span className="text-sm font-medium">Intensidad:</span>
              <div className="flex space-x-1">
                {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
                  <div
                    key={intensity}
                    className={`w-6 h-6 rounded border ${
                      intensity === 0 ? 'bg-gray-50' : getIntensityColor(intensity, 'default')
                    }`}
                    title={`Intensidad ${Math.round(intensity * 100)}%`}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chart" className="space-y-4">
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Gráfico de actividad por hora</p>
                <p className="text-sm text-gray-500">Implementación con Recharts próximamente</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="table" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Hora</th>
                    <th className="text-left p-2">Categoría</th>
                    <th className="text-left p-2">Sesiones</th>
                    <th className="text-left p-2">Dispositivo</th>
                    <th className="text-left p-2">Ubicación</th>
                  </tr>
                </thead>
                <tbody>
                  {processHeatmapData.slice(0, 20).map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{format(parseISO(item.date), 'dd/MM/yyyy')}</td>
                      <td className="p-2">{item.hour}:00</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="p-2">{item.value}</td>
                      <td className="p-2">{item.deviceType || 'N/A'}</td>
                      <td className="p-2">{item.location || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Estadísticas resumidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Sesiones</p>
                  <p className="text-lg font-semibold">
                    {heatmapData.reduce((sum, item) => sum + item.value, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Hora Pico</p>
                  <p className="text-lg font-semibold">
                    {heatmapData.reduce((max, item) => 
                      item.value > max.value ? item : max, 
                      { value: 0, hour: 0 }
                    ).hour}:00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Categoría Top</p>
                  <p className="text-lg font-semibold">
                    {Object.entries(
                      heatmapData.reduce((acc, item) => {
                        acc[item.category] = (acc[item.category] || 0) + item.value;
                        return acc;
                      }, {} as Record<string, number>)
                    ).reduce((max, [category, value]) => 
                      value > max[1] ? [category, value] : max, 
                      ['', 0]
                    )[0]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Promedio/Hora</p>
                  <p className="text-lg font-semibold">
                    {Math.round(heatmapData.reduce((sum, item) => sum + item.value, 0) / 24)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatmapVisualizer;
