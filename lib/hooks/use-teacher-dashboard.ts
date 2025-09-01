import { useState, useEffect, useCallback } from 'react';

interface UseTeacherDashboardOptions {
  teacherId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface TeacherDashboardData {
  students: any[];
  content: any[];
  analytics: any;
  reports: any[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useTeacherDashboard = ({
  teacherId,
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutos
}: UseTeacherDashboardOptions) => {
  const [data, setData] = useState<TeacherDashboardData>({
    students: [],
    content: [],
    analytics: null,
    reports: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const [filters, setFilters] = useState({
    period: 'month',
    subject: '',
    grade: '',
    status: ''
  });

  const loadDashboardData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Simular carga de datos
      const mockStudents = [
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

      const mockContent = [
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

      const mockAnalytics = {
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

      const mockReports = [
        {
          id: '1',
          name: 'Reporte de Progreso Mensual',
          type: 'progress',
          description: 'Análisis detallado del progreso de todos los estudiantes',
          lastGenerated: '2024-01-15',
          status: 'ready',
          size: '2.3 MB',
          format: 'pdf'
        },
        {
          id: '2',
          name: 'Análisis Cultural',
          type: 'cultural',
          description: 'Métricas de diversidad cultural y adaptaciones',
          lastGenerated: '2024-01-10',
          status: 'ready',
          size: '1.8 MB',
          format: 'excel'
        }
      ];

      setData({
        students: mockStudents,
        content: mockContent,
        analytics: mockAnalytics,
        reports: mockReports,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      });

    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [teacherId]);

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadDashboardData]);

  // Filtrar estudiantes
  const getFilteredStudents = useCallback(() => {
    let filtered = data.students;

    if (filters.subject) {
      filtered = filtered.filter(student => student.subject === filters.subject);
    }

    if (filters.grade) {
      filtered = filtered.filter(student => student.grade === filters.grade);
    }

    if (filters.status) {
      filtered = filtered.filter(student => student.status === filters.status);
    }

    return filtered;
  }, [data.students, filters]);

  // Filtrar contenido
  const getFilteredContent = useCallback(() => {
    let filtered = data.content;

    if (filters.subject) {
      filtered = filtered.filter(item => item.subject === filters.subject);
    }

    if (filters.grade) {
      filtered = filtered.filter(item => item.grade === filters.grade);
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    return filtered;
  }, [data.content, filters]);

  // Métricas calculadas
  const getCalculatedMetrics = useCallback(() => {
    const students = getFilteredStudents();
    const content = getFilteredContent();

    return {
      totalStudents: students.length,
      activeStudents: students.filter(s => s.status === 'active').length,
      atRiskStudents: students.filter(s => s.status === 'at-risk').length,
      averageProgress: students.length > 0 
        ? students.reduce((acc, s) => acc + s.progress, 0) / students.length 
        : 0,
      averageScore: students.length > 0 
        ? students.reduce((acc, s) => acc + s.score, 0) / students.length 
        : 0,
      totalContent: content.length,
      publishedContent: content.filter(c => c.status === 'published').length,
      averageCulturalRelevance: content.length > 0 
        ? content.reduce((acc, c) => acc + c.culturalRelevance, 0) / content.length 
        : 0,
      averageAccessibilityScore: content.length > 0 
        ? content.reduce((acc, c) => acc + c.accessibilityScore, 0) / content.length 
        : 0
    };
  }, [getFilteredStudents, getFilteredContent]);

  // Acciones
  const refreshData = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const getStudentById = useCallback((studentId: string) => {
    return data.students.find(student => student.id === studentId);
  }, [data.students]);

  const getContentById = useCallback((contentId: string) => {
    return data.content.find(item => item.id === contentId);
  }, [data.content]);

  return {
    // Datos
    ...data,
    filteredStudents: getFilteredStudents(),
    filteredContent: getFilteredContent(),
    calculatedMetrics: getCalculatedMetrics(),
    
    // Filtros
    filters,
    
    // Acciones
    refreshData,
    updateFilters,
    getStudentById,
    getContentById
  };
};
