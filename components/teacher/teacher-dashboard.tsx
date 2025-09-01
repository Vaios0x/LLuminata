'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Plus,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
  Star,
  Heart,
  Zap,
  Globe,
  Brain,
  Activity,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Settings,
  FileText,
  Video,
  Image,
  Music,
  Code,
  Palette,
  Lightbulb,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeacherDashboardProps {
  teacherId: string;
  className?: string;
}

interface StudentProgress {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  subject: string;
  progress: number;
  score: number;
  timeSpent: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'at-risk';
  culturalBackground: string;
  specialNeeds: string[];
  learningStyle: string;
}

interface ContentItem {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'video' | 'interactive' | 'cultural';
  subject: string;
  grade: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  culturalRelevance: number;
  accessibilityScore: number;
}

interface AnalyticsData {
  overview: {
    totalStudents: number;
    activeStudents: number;
    averageProgress: number;
    totalContent: number;
    engagementRate: number;
    culturalDiversity: number;
  };
  subjects: {
    name: string;
    students: number;
    averageScore: number;
    completionRate: number;
  }[];
  trends: {
    weekly: {
      students: number;
      progress: number;
      engagement: number;
    }[];
  };
  culturalData: {
    background: string;
    students: number;
    averageScore: number;
    engagementRate: number;
  }[];
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacherId,
  className
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [teacherId]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simular carga de datos
      const mockStudents: StudentProgress[] = [
        {
          id: '1',
          name: 'María González',
          avatar: '/avatars/maria.jpg',
          grade: '5to',
          subject: 'Matemáticas',
          progress: 85,
          score: 92,
          timeSpent: 120,
          lastActivity: '2h ago',
          status: 'active',
          culturalBackground: 'maya',
          specialNeeds: ['dislexia'],
          learningStyle: 'visual'
        },
        {
          id: '2',
          name: 'Carlos Méndez',
          avatar: '/avatars/carlos.jpg',
          grade: '5to',
          subject: 'Matemáticas',
          progress: 72,
          score: 78,
          timeSpent: 95,
          lastActivity: '1d ago',
          status: 'at-risk',
          culturalBackground: 'náhuatl',
          specialNeeds: [],
          learningStyle: 'kinestésico'
        },
        {
          id: '3',
          name: 'Ana López',
          avatar: '/avatars/ana.jpg',
          grade: '5to',
          subject: 'Matemáticas',
          progress: 95,
          score: 98,
          timeSpent: 180,
          lastActivity: '30m ago',
          status: 'active',
          culturalBackground: 'zapoteco',
          specialNeeds: [],
          learningStyle: 'auditivo'
        }
      ];

      const mockContent: ContentItem[] = [
        {
          id: '1',
          title: 'Matemáticas Mayas Básicas',
          type: 'lesson',
          subject: 'Matemáticas',
          grade: '5to',
          status: 'published',
          views: 45,
          rating: 4.8,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          culturalRelevance: 0.95,
          accessibilityScore: 0.88
        },
        {
          id: '2',
          title: 'Sistema Numérico Náhuatl',
          type: 'interactive',
          subject: 'Matemáticas',
          grade: '5to',
          status: 'published',
          views: 32,
          rating: 4.6,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
          culturalRelevance: 0.92,
          accessibilityScore: 0.85
        }
      ];

      const mockAnalytics: AnalyticsData = {
        overview: {
          totalStudents: 25,
          activeStudents: 22,
          averageProgress: 78.5,
          totalContent: 15,
          engagementRate: 84.2,
          culturalDiversity: 92.0
        },
        subjects: [
          { name: 'Matemáticas', students: 25, averageScore: 82.5, completionRate: 78.5 },
          { name: 'Ciencias', students: 20, averageScore: 79.2, completionRate: 72.3 },
          { name: 'Historia', students: 18, averageScore: 85.1, completionRate: 81.2 }
        ],
        trends: {
          weekly: [
            { students: 20, progress: 75, engagement: 80 },
            { students: 22, progress: 78, engagement: 82 },
            { students: 25, progress: 80, engagement: 85 },
            { students: 23, progress: 82, engagement: 87 },
            { students: 24, progress: 85, engagement: 89 },
            { students: 22, progress: 87, engagement: 91 },
            { students: 25, progress: 89, engagement: 93 }
          ]
        },
        culturalData: [
          { background: 'Maya', students: 8, averageScore: 85.2, engagementRate: 88.5 },
          { background: 'Náhuatl', students: 6, averageScore: 82.1, engagementRate: 85.2 },
          { background: 'Zapoteco', students: 5, averageScore: 87.3, engagementRate: 90.1 },
          { background: 'Mixteco', students: 4, averageScore: 79.8, engagementRate: 82.3 },
          { background: 'Otros', students: 2, averageScore: 81.5, engagementRate: 84.7 }
        ]
      };

      setStudents(mockStudents);
      setContent(mockContent);
      setAnalytics(mockAnalytics);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'at-risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-4 h-4" />;
      case 'quiz': return <Target className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'interactive': return <Code className="w-4 h-4" />;
      case 'cultural': return <Globe className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getContentStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Dashboard de Maestro
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus estudiantes, crea contenido y analiza el progreso
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Contenido
          </Button>
        </div>
      </div>

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Estudiantes
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Contenido
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Resumen */}
        <TabsContent value="overview" className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                    <p className="text-2xl font-bold">{analytics?.overview.totalStudents}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      +3 esta semana
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Progreso Promedio</p>
                    <p className="text-2xl font-bold">{analytics?.overview.averageProgress}%</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      +2.5% vs semana pasada
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasa de Engagement</p>
                    <p className="text-2xl font-bold">{analytics?.overview.engagementRate}%</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      +1.8% vs semana pasada
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Diversidad Cultural</p>
                    <p className="text-2xl font-bold">{analytics?.overview.culturalDiversity}%</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Excelente
                    </p>
                  </div>
                  <Globe className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos y tendencias */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Progreso Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.trends.weekly.map((week, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-16 text-sm text-gray-600">Semana {index + 1}</div>
                      <div className="flex-1">
                        <Progress value={week.progress} className="h-2" />
                      </div>
                      <div className="w-20 text-sm font-medium">{week.progress}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Distribución por Materia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.subjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">{subject.name}</span>
                      </div>
                      <div className="text-sm font-medium">{subject.students} estudiantes</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estudiantes destacados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Estudiantes Destacados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {students.slice(0, 3).map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{student.name.split(' ')[0][0]}</span>
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.grade} grado</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso:</span>
                        <span className="font-medium">{student.progress}%</span>
                      </div>
                      <Progress value={student.progress} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>Puntuación:</span>
                        <span className="font-medium">{student.score}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Estudiantes */}
        <TabsContent value="students" className="space-y-6">
          {/* Filtros y búsqueda */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar estudiantes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de estudiantes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card 
                key={student.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedStudent(student)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium">{student.name.split(' ')[0][0]}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.grade} grado</p>
                    </div>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status === 'active' ? 'Activo' : 
                       student.status === 'inactive' ? 'Inactivo' : 'En Riesgo'}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progreso</span>
                        <span>{student.progress}%</span>
                      </div>
                      <Progress value={student.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Puntuación:</span>
                        <p className="font-medium">{student.score}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tiempo:</span>
                        <p className="font-medium">{student.timeSpent} min</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-orange-500" />
                      <span>{student.culturalBackground}</span>
                    </div>

                    {student.specialNeeds.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{student.specialNeeds.join(', ')}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <span>Estilo: {student.learningStyle}</span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Última actividad: {student.lastActivity}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalles
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pestaña de Contenido */}
        <TabsContent value="content" className="space-y-6">
          {/* Herramientas de creación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Crear Nuevo Contenido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <BookOpen className="w-6 h-6" />
                  <span className="text-sm">Lección</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Target className="w-6 h-6" />
                  <span className="text-sm">Evaluación</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Video className="w-6 h-6" />
                  <span className="text-sm">Video</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Code className="w-6 h-6" />
                  <span className="text-sm">Interactivo</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Globe className="w-6 h-6" />
                  <span className="text-sm">Cultural</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Palette className="w-6 h-6" />
                  <span className="text-sm">Personalizado</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de contenido */}
          <div className="space-y-4">
            {content.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getContentTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge className={getContentStatusColor(item.status)}>
                            {item.status === 'published' ? 'Publicado' : 
                             item.status === 'draft' ? 'Borrador' : 'Archivado'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Materia:</span>
                            <p className="font-medium">{item.subject}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Grado:</span>
                            <p className="font-medium">{item.grade}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Vistas:</span>
                            <p className="font-medium">{item.views}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Rating:</span>
                            <p className="font-medium">{item.rating}/5</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4 text-orange-500" />
                            <span className="text-sm">Relevancia: {Math.round(item.culturalRelevance * 100)}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Accesibilidad: {Math.round(item.accessibilityScore * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Vista Previa
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pestaña de Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Métricas detalladas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Análisis de Estudiantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{analytics?.overview.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activos:</span>
                    <span className="font-medium text-green-600">{analytics?.overview.activeStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>En riesgo:</span>
                    <span className="font-medium text-red-600">
                      {students.filter(s => s.status === 'at-risk').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Rendimiento por Materia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.subjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{subject.name}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{subject.averageScore}%</p>
                        <p className="text-xs text-gray-600">{subject.students} estudiantes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Diversidad Cultural
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.culturalData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{data.background}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{data.students} estudiantes</p>
                        <p className="text-xs text-gray-600">{data.averageScore}% promedio</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos avanzados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Tendencias de Progreso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-center gap-2">
                {analytics?.trends.weekly.map((week, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-8 bg-blue-500 rounded-t"
                      style={{ height: `${week.progress * 2}px` }}
                    ></div>
                    <span className="text-xs text-gray-600">S{index + 1}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Reportes */}
        <TabsContent value="reports" className="space-y-6">
          {/* Generador de reportes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generar Reportes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Reporte de Estudiantes</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm">Progreso Académico</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Globe className="w-6 h-6" />
                  <span className="text-sm">Análisis Cultural</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <BookOpen className="w-6 h-6" />
                  <span className="text-sm">Efectividad de Contenido</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Activity className="w-6 h-6" />
                  <span className="text-sm">Engagement</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Zap className="w-6 h-6" />
                  <span className="text-sm">Accesibilidad</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reportes recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Reportes Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Reporte de Progreso - Enero 2024</p>
                    <p className="text-sm text-gray-600">Generado el 15 de enero</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Descargar
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Análisis Cultural - Diciembre 2023</p>
                    <p className="text-sm text-gray-600">Generado el 30 de diciembre</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Descargar
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Efectividad de Contenido - Diciembre 2023</p>
                    <p className="text-sm text-gray-600">Generado el 28 de diciembre</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Descargar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
