/**
 * Componente de Funcionalidades Sociales
 * Integra grupos de estudio, proyectos colaborativos, mentores y recursos compartidos
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  UserCheck, 
  Share2, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  MessageSquare,
  Video,
  FileText,
  Link,
  Download,
  Presentation,
  Heart,
  Award,
  Target,
  Activity,
  Globe,
  MapPin,
  GraduationCap,
  Lightbulb,
  Zap,
  RefreshCw,
  Settings,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialFeaturesProps {
  studentId: string;
  className?: string;
}

interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  subject: string;
  gradeLevel: number;
  maxMembers: number;
  isPublic: boolean;
  isActive: boolean;
  totalMeetings: number;
  averageAttendance: number;
  completionRate: number;
  creator: {
    id: string;
    name: string;
  };
  members: Array<{
    id: string;
    student: {
      id: string;
      name: string;
    };
    role: string;
    joinedAt: Date;
    meetingsAttended: number;
    contributionsCount: number;
  }>;
  meetings: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    status: string;
    attendeesCount: number;
  }>;
  createdAt: Date;
}

interface CollaborativeProject {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: number;
  estimatedDuration: number;
  maxParticipants: number;
  status: string;
  progress: number;
  qualityScore?: number;
  collaborationScore?: number;
  creator: {
    id: string;
    name: string;
  };
  participants: Array<{
    id: string;
    student: {
      id: string;
      name: string;
    };
    role: string;
    tasksCompleted: number;
    contributionsCount: number;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    assignedTo?: string;
  }>;
  createdAt: Date;
}

interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  experience: number;
  rating: number;
  totalSessions: number;
  isActive: boolean;
  isVerified: boolean;
  student: {
    id: string;
    name: string;
  };
  mentees: Array<{
    id: string;
    mentee: {
      id: string;
      name: string;
    };
    subject: string;
    status: string;
    progressScore?: number;
  }>;
}

interface SharedResource {
  id: string;
  title: string;
  description?: string;
  type: string;
  url?: string;
  fileSize?: number;
  tags: string[];
  downloadsCount: number;
  rating: number;
  ratingCount: number;
  creator: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

export const SocialFeatures: React.FC<SocialFeaturesProps> = ({
  studentId,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('groups');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Datos de las funcionalidades sociales
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [projects, setProjects] = useState<CollaborativeProject[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [socialStats, setSocialStats] = useState<any>(null);

  // Estados para formularios
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateMentor, setShowCreateMentor] = useState(false);
  const [showShareResource, setShowShareResource] = useState(false);

  useEffect(() => {
    loadSocialData();
  }, [studentId]);

  const loadSocialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [groupsRes, projectsRes, mentorsRes, resourcesRes, statsRes] = await Promise.all([
        fetch('/api/social/study-groups'),
        fetch('/api/social/projects'),
        fetch('/api/social/mentors'),
        fetch('/api/social/resources'),
        fetch(`/api/social/stats/${studentId}`)
      ]);

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setStudyGroups(groupsData.data || []);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.data || []);
      }

      if (mentorsRes.ok) {
        const mentorsData = await mentorsRes.json();
        setMentors(mentorsData.data || []);
      }

      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData.data || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setSocialStats(statsData.data);
      }

    } catch (error) {
      console.error('Error cargando datos sociales:', error);
      setError('Error cargando datos sociales');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'bg-green-500';
      case 'planning':
      case 'scheduled':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-500';
    if (difficulty <= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-4 h-4" />;
      case 'DOCUMENT':
        return <FileText className="w-4 h-4" />;
      case 'LINK':
        return <Link className="w-4 h-4" />;
      case 'PRESENTATION':
        return <Presentation className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando funcionalidades sociales...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-4", className)}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
            <Button 
              onClick={loadSocialData} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header con estadísticas */}
      {socialStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Estadísticas Sociales</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{socialStats.groupsCreated}</div>
                <div className="text-sm text-gray-600">Grupos Creados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{socialStats.projectsCreated}</div>
                <div className="text-sm text-gray-600">Proyectos Creados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{socialStats.resourcesShared}</div>
                <div className="text-sm text-gray-600">Recursos Compartidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{socialStats.mentorshipSessions}</div>
                <div className="text-sm text-gray-600">Sesiones de Mentoría</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groups" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Grupos</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Proyectos</span>
          </TabsTrigger>
          <TabsTrigger value="mentors" className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4" />
            <span>Mentores</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Recursos</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab de Grupos de Estudio */}
        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Grupos de Estudio</h3>
            <Button onClick={() => setShowCreateGroup(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Crear Grupo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{group.name}</CardTitle>
                    <Badge 
                      variant={group.isActive ? "default" : "secondary"}
                      className={cn("text-xs", group.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800")}
                    >
                      {group.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Materia:</span>
                    <span className="font-medium">{group.subject}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Miembros:</span>
                    <span className="font-medium">{group.members.length}/{group.maxMembers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reuniones:</span>
                    <span className="font-medium">{group.totalMeetings}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progreso:</span>
                      <span className="font-medium">{(group.completionRate * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={group.completionRate * 100} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-500">
                      Creado por {group.creator.name}
                    </span>
                    <Button size="sm" variant="outline">
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {studyGroups.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No tienes grupos de estudio aún</p>
                <Button onClick={() => setShowCreateGroup(true)} className="mt-2">
                  Crear tu primer grupo
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Proyectos Colaborativos */}
        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Proyectos Colaborativos</h3>
            <Button onClick={() => setShowCreateProject(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Crear Proyecto
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Materia:</span>
                    <span className="font-medium">{project.subject}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Participantes:</span>
                    <span className="font-medium">{project.participants.length}/{project.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Dificultad:</span>
                    <Badge className={getDifficultyColor(project.difficulty)}>
                      {project.difficulty}/5
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progreso:</span>
                      <span className="font-medium">{project.progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-500">
                      {project.tasks.length} tareas
                    </span>
                    <Button size="sm" variant="outline">
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {projects.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No tienes proyectos colaborativos aún</p>
                <Button onClick={() => setShowCreateProject(true)} className="mt-2">
                  Crear tu primer proyecto
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Mentores */}
        <TabsContent value="mentors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Mentores Disponibles</h3>
            <Button onClick={() => setShowCreateMentor(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Convertirse en Mentor
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{mentor.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{mentor.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4" />
                    <span>{mentor.experience} años de experiencia</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-gray-700">Especialidades:</span>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.slice(0, 3).map((exp, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{mentor.expertise.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sesiones:</span>
                    <span className="font-medium">{mentor.totalSessions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mentees:</span>
                    <span className="font-medium">{mentor.mentees.length}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Badge 
                      variant={mentor.isVerified ? "default" : "secondary"}
                      className={cn("text-xs", mentor.isVerified ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800")}
                    >
                      {mentor.isVerified ? 'Verificado' : 'Pendiente'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Contactar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mentors.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <UserCheck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No hay mentores disponibles en este momento</p>
                <Button onClick={() => setShowCreateMentor(true)} className="mt-2">
                  Convertirse en mentor
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Recursos Compartidos */}
        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recursos Compartidos</h3>
            <Button onClick={() => setShowShareResource(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Compartir Recurso
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {getResourceIcon(resource.type)}
                      <CardTitle className="text-base">{resource.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {resource.type}
                    </Badge>
                  </div>
                  {resource.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{resource.tags.length - 3} más
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Descargas:</span>
                    <span className="font-medium">{resource.downloadsCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Calificación:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{resource.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({resource.ratingCount})</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-500">
                      Por {resource.creator.name}
                    </span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {resources.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Share2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No hay recursos compartidos aún</p>
                <Button onClick={() => setShowShareResource(true)} className="mt-2">
                  Compartir tu primer recurso
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Aquí se pueden agregar los modales para crear grupos, proyectos, mentores y recursos */}
      {/* Por simplicidad, no los incluyo en este componente, pero se pueden implementar */}
    </div>
  );
};
