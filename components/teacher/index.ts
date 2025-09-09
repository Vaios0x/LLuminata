// Componentes del Panel de Maestro
export { TeacherDashboard } from './teacher-dashboard';
export { ContentCreator } from './content-creator';
export { ReportsAnalytics } from './reports-analytics';

// Tipos compartidos - definidos localmente
export interface StudentProgress {
  id: string;
  name: string;
  progress: number;
  lastActivity: string;
  culturalContext: string;
  accessibilityNeeds: string[];
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'video' | 'interactive' | 'cultural';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  totalStudents: number;
  activeStudents: number;
  completedLessons: number;
  averageProgress: number;
  culturalBreakdown: Record<string, number>;
  accessibilityUsage: Record<string, number>;
}
