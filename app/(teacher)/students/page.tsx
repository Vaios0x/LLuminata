'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Target,
  Award,
  Brain,
  Heart,
  Zap,
  Globe,
  Settings,
  Download,
  Share2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useScreenReader } from '@/components/accessibility/screen-reader';
import { useHighContrast } from '@/components/accessibility/high-contrast';

interface Student {
  id: string;
  name: string;
  email: string;
  age: number;
  grade: string;
  region: string;
  profile: {
    avatar?: string;
    interests: string[];
    accessibility: string[];
    culturalBackground: string;
    learningStyle: string;
  };
  progress: {
    overallScore: number;
    lessonsCompleted: number;
    totalLessons: number;
    timeSpent: number;
    lastActivity: Date;
    streak: number;
  };
  subjects: {
    [key: string]: {
      score: number;
      lessonsCompleted: number;
      timeSpent: number;
      needs: string[];
    };
  };
  aiAnalysis: {
    learningPattern: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  status: 'active' | 'inactive' | 'at-risk';
}

export default function StudentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { speak, isEnabled: screenReaderEnabled } = useScreenReader();
  const { getStyles } = useHighContrast();

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    grade: 'all',
    riskLevel: 'all'
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedFilters]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      // En producción, esto vendría de la API
      const mockStudents: Student[] = [
        {
          id: '1',
          name: 'María González',
          email: 'maria.gonzalez@email.com',
          age: 12,
          grade: '6to grado',
          region: 'Guatemala',
          profile: {
            interests: ['matemáticas', 'arte', 'música'],
            accessibility: ['lector de pantalla'],
            culturalBackground: 'maya',
            learningStyle: 'visual'
          },
          progress: {
            overallScore: 85,
            lessonsCompleted: 24,
            totalLessons: 30,
            timeSpent: 7200,
            lastActivity: new Date('2024-01-15'),
            streak: 7
          },
          subjects: {
            'matemáticas': {
              score: 92,
              lessonsCompleted: 8,
              timeSpent: 2400,
              needs: ['geometría']
            },
            'ciencias': {
              score: 78,
              lessonsCompleted: 6,
              timeSpent: 1800,
              needs: ['experimentos prácticos']
            }
          },
          aiAnalysis: {
            learningPattern: 'Consistente y dedicada',
            strengths: ['Comprensión matemática', 'Persistencia'],
            weaknesses: ['Ciencias experimentales'],
            recommendations: ['Más práctica en laboratorio virtual', 'Reforzar conceptos de física'],
            riskLevel: 'low'
          },
          status: 'active'
        },
        {
          id: '2',
          name: 'Carlos Rodríguez',
          email: 'carlos.rodriguez@email.com',
          age: 11,
          grade: '5to grado',
          region: 'México',
          profile: {
            interests: ['tecnología', 'deportes'],
            accessibility: ['navegación por teclado'],
            culturalBackground: 'mestizo',
            learningStyle: 'kinestésico'
          },
          progress: {
            overallScore: 72,
            lessonsCompleted: 18,
            totalLessons: 30,
            timeSpent: 5400,
            lastActivity: new Date('2024-01-10'),
            streak: 2
          },
          subjects: {
            'matemáticas': {
              score: 65,
              lessonsCompleted: 6,
              timeSpent: 1800,
              needs: ['aritmética básica', 'concentración']
            },
            'historia': {
              score: 88,
              lessonsCompleted: 8,
              timeSpent: 2400,
              needs: []
            }
          },
          aiAnalysis: {
            learningPattern: 'Variable, necesita motivación',
            strengths: ['Historia', 'Tecnología'],
            weaknesses: ['Matemáticas básicas', 'Concentración'],
            recommendations: ['Ejercicios de atención', 'Matemáticas con juegos'],
            riskLevel: 'medium'
          },
          status: 'at-risk'
        },
        {
          id: '3',
          name: 'Ana Silva',
          email: 'ana.silva@email.com',
          age: 13,
          grade: '7mo grado',
          region: 'Brasil',
          profile: {
            interests: ['literatura', 'idiomas'],
            accessibility: ['alto contraste'],
            culturalBackground: 'afrodescendiente',
            learningStyle: 'auditivo'
          },
          progress: {
            overallScore: 95,
            lessonsCompleted: 28,
            totalLessons: 30,
            timeSpent: 8400,
            lastActivity: new Date('2024-01-15'),
            streak: 12
          },
          subjects: {
            'literatura': {
              score: 98,
              lessonsCompleted: 10,
              timeSpent: 3000,
              needs: []
            },
            'historia': {
              score: 92,
              lessonsCompleted: 8,
              timeSpent: 2400,
              needs: []
            }
          },
          aiAnalysis: {
            learningPattern: 'Excelente y consistente',
            strengths: ['Comprensión lectora', 'Análisis crítico'],
            weaknesses: ['Matemáticas avanzadas'],
            recommendations: ['Desafíos de matemáticas', 'Mentoría para otros estudiantes'],
            riskLevel: 'low'
          },
          status: 'active'
        }
      ];

      setStudents(mockStudents);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.grade.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtros adicionales
    if (selectedFilters.status !== 'all') {
      filtered = filtered.filter(student => student.status === selectedFilters.status);
    }

    if (selectedFilters.grade !== 'all') {
      filtered = filtered.filter(student => student.grade === selectedFilters.grade);
    }

    if (selectedFilters.riskLevel !== 'all') {
      filtered = filtered.filter(student => student.aiAnalysis.riskLevel === selectedFilters.riskLevel);
    }

    setFilteredStudents(filtered);
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'active': 'green',
      'inactive': 'gray',
      'at-risk': 'red'
    };
    return colors[status] || 'gray';
  };

  const getRiskLevelColor = (riskLevel: string): string => {
    const colors: { [key: string]: string } = {
      'low': 'green',
      'medium': 'yellow',
      'high': 'red'
    };
    return colors[riskLevel] || 'gray';
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={getStyles()}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4" style={getStyles()}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Estudiantes</h1>
              <p className="text-gray-600">Gestiona y monitorea el progreso de tus estudiantes</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Estudiante
              </Button>
            </div>
          </div>

          {/* Búsqueda y filtros */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar estudiantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      value={selectedFilters.status}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      <option value="active">Activos</option>
                      <option value="inactive">Inactivos</option>
                      <option value="at-risk">En riesgo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
                    <select
                      value={selectedFilters.grade}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, grade: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los grados</option>
                      <option value="5to grado">5to grado</option>
                      <option value="6to grado">6to grado</option>
                      <option value="7mo grado">7mo grado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Riesgo</label>
                    <select
                      value={selectedFilters.riskLevel}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      <option value="low">Bajo</option>
                      <option value="medium">Medio</option>
                      <option value="high">Alto</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                    <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Activos</p>
                    <p className="text-2xl font-bold text-green-600">
                      {students.filter(s => s.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En Riesgo</p>
                    <p className="text-2xl font-bold text-red-600">
                      {students.filter(s => s.status === 'at-risk').length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Promedio</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(students.reduce((acc, s) => acc + s.progress.overallScore, 0) / students.length)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de estudiantes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.grade} • {student.region}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-${getStatusColor(student.status)}-600 border-${getStatusColor(student.status)}-200`}
                    >
                      {student.status === 'active' ? 'Activo' : student.status === 'inactive' ? 'Inactivo' : 'En riesgo'}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-${getRiskLevelColor(student.aiAnalysis.riskLevel)}-600 border-${getRiskLevelColor(student.aiAnalysis.riskLevel)}-200`}
                    >
                      {student.aiAnalysis.riskLevel === 'low' ? 'Bajo' : student.aiAnalysis.riskLevel === 'medium' ? 'Medio' : 'Alto'} riesgo
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progreso general */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progreso General</span>
                    <span>{student.progress.overallScore}%</span>
                  </div>
                  <Progress value={student.progress.overallScore} />
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{student.progress.lessonsCompleted}</div>
                    <div className="text-gray-600">Lecciones</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{formatTime(student.progress.timeSpent)}</div>
                    <div className="text-gray-600">Tiempo</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{student.progress.streak}</div>
                    <div className="text-gray-600">Días racha</div>
                  </div>
                </div>

                {/* Análisis de IA */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Análisis de IA</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{student.aiAnalysis.learningPattern}</p>
                  <div className="flex flex-wrap gap-1">
                    {student.aiAnalysis.recommendations.slice(0, 2).map((rec, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {rec}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedStudent(student)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensaje si no hay estudiantes */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron estudiantes</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(selectedFilters).some(f => f !== 'all')
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no tienes estudiantes asignados'
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Estudiante
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
