/**
 * Servicios para Funcionalidades Sociales
 * Gestión de grupos de estudio, proyectos colaborativos, mentores y recursos compartidos
 */

import { prisma } from '@/lib/database';
import { redisCache } from '@/lib/redis-cache';
import { z } from 'zod';

// ===== ESQUEMAS DE VALIDACIÓN =====

const CreateStudyGroupSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  subject: z.string().min(2).max(50),
  gradeLevel: z.number().min(1).max(12),
  maxMembers: z.number().min(2).max(20).default(10),
  isPublic: z.boolean().default(true),
  meetingSchedule: z.record(z.any()).optional(),
  studyGoals: z.array(z.string()).optional(),
});

const CreateProjectSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  subject: z.string().min(2).max(50),
  difficulty: z.number().min(1).max(5).default(2),
  estimatedDuration: z.number().min(1).max(365),
  maxParticipants: z.number().min(2).max(10).default(5),
});

const CreateMentorSchema = z.object({
  name: z.string().min(2).max(100),
  expertise: z.array(z.string()).min(1),
  experience: z.number().min(0).max(50),
  availability: z.record(z.any()),
});

const CreateResourceSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  type: z.enum(['DOCUMENT', 'VIDEO', 'AUDIO', 'IMAGE', 'LINK', 'PRESENTATION', 'WORKSHEET', 'QUIZ', 'GAME', 'OTHER']),
  url: z.string().url().optional(),
  fileSize: z.number().optional(),
  tags: z.array(z.string()).default([]),
});

// ===== INTERFACES =====

export interface StudyGroupWithDetails {
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

export interface CollaborativeProjectWithDetails {
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

export interface MentorWithDetails {
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

export interface SharedResourceWithDetails {
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

// ===== CLASE PRINCIPAL =====

export class SocialServices {
  /**
   * Crear un grupo de estudio
   */
  async createStudyGroup(data: z.infer<typeof CreateStudyGroupSchema>, creatorId: string): Promise<StudyGroupWithDetails> {
    const validatedData = CreateStudyGroupSchema.parse(data);

    const group = await prisma.studyGroup.create({
      data: {
        ...validatedData,
        creatorId,
        studyGoals: validatedData.studyGoals ? JSON.stringify(validatedData.studyGoals) : null,
      },
      include: {
        creator: {
          select: { id: true, name: true }
        },
        members: {
          include: {
            student: {
              select: { id: true, name: true }
            }
          }
        },
        meetings: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            status: true,
            attendeesCount: true,
          }
        }
      }
    });

    // Agregar el creador como miembro
    await prisma.studyGroupMember.create({
      data: {
        groupId: group.id,
        studentId: creatorId,
        role: 'CREATOR',
      }
    });

    // Invalidar caché
    await redisCache.del(`study_groups:${creatorId}`);
    await redisCache.del('public_study_groups');

    return group as StudyGroupWithDetails;
  }

  /**
   * Obtener grupos de estudio del estudiante
   */
  async getStudentStudyGroups(studentId: string): Promise<StudyGroupWithDetails[]> {
    const cacheKey = `study_groups:${studentId}`;
    
    // Intentar obtener del caché
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const groups = await prisma.studyGroup.findMany({
      where: {
        OR: [
          { creatorId: studentId },
          { members: { some: { studentId } } }
        ],
        isActive: true
      },
      include: {
        creator: {
          select: { id: true, name: true }
        },
        members: {
          include: {
            student: {
              select: { id: true, name: true }
            }
          }
        },
        meetings: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            status: true,
            attendeesCount: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Guardar en caché por 5 minutos
    await redisCache.set(cacheKey, JSON.stringify(groups), { ttl: 300 });

    return groups as StudyGroupWithDetails[];
  }

  /**
   * Obtener grupos públicos disponibles
   */
  async getPublicStudyGroups(filters?: {
    subject?: string;
    gradeLevel?: number;
    maxMembers?: number;
  }): Promise<StudyGroupWithDetails[]> {
    const cacheKey = `public_study_groups:${JSON.stringify(filters)}`;
    
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const where: any = {
      isPublic: true,
      isActive: true,
    };

    if (filters?.subject) where.subject = filters.subject;
    if (filters?.gradeLevel) where.gradeLevel = filters.gradeLevel;
    if (filters?.maxMembers) where.maxMembers = { lte: filters.maxMembers };

    const groups = await prisma.studyGroup.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true }
        },
        members: {
          include: {
            student: {
              select: { id: true, name: true }
            }
          }
        },
        meetings: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            status: true,
            attendeesCount: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    await redisCache.set(cacheKey, JSON.stringify(groups), { ttl: 300 });

    return groups as StudyGroupWithDetails[];
  }

  /**
   * Unirse a un grupo de estudio
   */
  async joinStudyGroup(groupId: string, studentId: string): Promise<boolean> {
    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: { members: true }
    });

    if (!group || !group.isActive) {
      throw new Error('Grupo no encontrado o inactivo');
    }

    if (group.members.length >= group.maxMembers) {
      throw new Error('Grupo lleno');
    }

    const existingMember = group.members.find(m => m.studentId === studentId);
    if (existingMember) {
      throw new Error('Ya eres miembro de este grupo');
    }

    await prisma.studyGroupMember.create({
      data: {
        groupId,
        studentId,
        role: 'MEMBER',
      }
    });

    // Actualizar métricas del grupo
    await prisma.studyGroup.update({
      where: { id: groupId },
      data: {
        completionRate: group.members.length / group.maxMembers
      }
    });

    // Invalidar caché
    await redisCache.del(`study_groups:${studentId}`);
    await redisCache.del(`study_group:${groupId}`);

    return true;
  }

  /**
   * Crear un proyecto colaborativo
   */
  async createCollaborativeProject(data: z.infer<typeof CreateProjectSchema>, creatorId: string): Promise<CollaborativeProjectWithDetails> {
    const validatedData = CreateProjectSchema.parse(data);

    const project = await prisma.collaborativeProject.create({
      data: {
        ...validatedData,
        creatorId,
      },
      include: {
        creator: {
          select: { id: true, name: true }
        },
        participants: {
          include: {
            student: {
              select: { id: true, name: true }
            }
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignedTo: true,
          }
        }
      }
    });

    // Agregar el creador como participante
    await prisma.projectParticipant.create({
      data: {
        projectId: project.id,
        studentId: creatorId,
        role: 'LEADER',
      }
    });

    // Invalidar caché
    await redisCache.del(`projects:${creatorId}`);
    await redisCache.del('public_projects');

    return project as CollaborativeProjectWithDetails;
  }

  /**
   * Obtener proyectos del estudiante
   */
  async getStudentProjects(studentId: string): Promise<CollaborativeProjectWithDetails[]> {
    const cacheKey = `projects:${studentId}`;
    
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const projects = await prisma.collaborativeProject.findMany({
      where: {
        OR: [
          { creatorId: studentId },
          { participants: { some: { studentId } } }
        ]
      },
      include: {
        creator: {
          select: { id: true, name: true }
        },
        participants: {
          include: {
            student: {
              select: { id: true, name: true }
            }
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignedTo: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    await redisCache.set(cacheKey, JSON.stringify(projects), { ttl: 300 });

    return projects as CollaborativeProjectWithDetails[];
  }

  /**
   * Unirse a un proyecto
   */
  async joinProject(projectId: string, studentId: string): Promise<boolean> {
    const project = await prisma.collaborativeProject.findUnique({
      where: { id: projectId },
      include: { participants: true }
    });

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    if (project.participants.length >= project.maxParticipants) {
      throw new Error('Proyecto lleno');
    }

    const existingParticipant = project.participants.find(p => p.studentId === studentId);
    if (existingParticipant) {
      throw new Error('Ya eres participante de este proyecto');
    }

    await prisma.projectParticipant.create({
      data: {
        projectId,
        studentId,
        role: 'MEMBER',
      }
    });

    // Invalidar caché
    await redisCache.del(`projects:${studentId}`);
    await redisCache.del(`project:${projectId}`);

    return true;
  }

  /**
   * Crear un mentor
   */
  async createMentor(data: z.infer<typeof CreateMentorSchema>, studentId: string): Promise<MentorWithDetails> {
    const validatedData = CreateMentorSchema.parse(data);

    const mentor = await prisma.mentor.create({
      data: {
        ...validatedData,
        studentId,
        availability: JSON.stringify(validatedData.availability),
      },
      include: {
        student: {
          select: { id: true, name: true }
        },
        mentees: {
          include: {
            mentee: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    // Invalidar caché
    await redisCache.del('available_mentors');

    return mentor as MentorWithDetails;
  }

  /**
   * Obtener mentores disponibles
   */
  async getAvailableMentors(filters?: {
    expertise?: string[];
    experience?: number;
  }): Promise<MentorWithDetails[]> {
    const cacheKey = `available_mentors:${JSON.stringify(filters)}`;
    
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const where: any = {
      isActive: true,
    };

    if (filters?.expertise && filters.expertise.length > 0) {
      where.expertise = { hasSome: filters.expertise };
    }

    if (filters?.experience) {
      where.experience = { gte: filters.experience };
    }

    const mentors = await prisma.mentor.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true }
        },
        mentees: {
          include: {
            mentee: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { rating: 'desc' }
    });

    await redisCache.set(cacheKey, JSON.stringify(mentors), { ttl: 300 });

    return mentors as MentorWithDetails[];
  }

  /**
   * Iniciar una mentoría
   */
  async startMentorship(mentorId: string, menteeId: string, subject: string, goals: string[]): Promise<boolean> {
    const existingMentorship = await prisma.mentorship.findFirst({
      where: {
        mentorId,
        menteeId,
        subject,
        status: 'ACTIVE'
      }
    });

    if (existingMentorship) {
      throw new Error('Ya existe una mentoría activa para esta materia');
    }

    await prisma.mentorship.create({
      data: {
        mentorId,
        menteeId,
        subject,
        goals: JSON.stringify(goals),
        status: 'ACTIVE',
      }
    });

    // Invalidar caché
    await redisCache.del(`mentorships:${menteeId}`);
    await redisCache.del(`mentor:${mentorId}`);

    return true;
  }

  /**
   * Compartir un recurso
   */
  async shareResource(data: z.infer<typeof CreateResourceSchema>, creatorId: string, context?: {
    studyGroupId?: string;
    projectId?: string;
  }): Promise<SharedResourceWithDetails> {
    const validatedData = CreateResourceSchema.parse(data);

    const resource = await prisma.sharedResource.create({
      data: {
        ...validatedData,
        creatorId,
        studyGroupId: context?.studyGroupId,
        projectId: context?.projectId,
      },
      include: {
        creator: {
          select: { id: true, name: true }
        }
      }
    });

    // Invalidar caché
    await redisCache.del(`resources:${creatorId}`);
    if (context?.studyGroupId) {
      await redisCache.del(`group_resources:${context.studyGroupId}`);
    }
    if (context?.projectId) {
      await redisCache.del(`project_resources:${context.projectId}`);
    }

    return resource as SharedResourceWithDetails;
  }

  /**
   * Obtener recursos compartidos
   */
  async getSharedResources(filters?: {
    type?: string;
    tags?: string[];
    studyGroupId?: string;
    projectId?: string;
  }): Promise<SharedResourceWithDetails[]> {
    const cacheKey = `shared_resources:${JSON.stringify(filters)}`;
    
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const where: any = {};

    if (filters?.type) where.type = filters.type;
    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }
    if (filters?.studyGroupId) where.studyGroupId = filters.studyGroupId;
    if (filters?.projectId) where.projectId = filters.projectId;

    const resources = await prisma.sharedResource.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    await redisCache.set(cacheKey, JSON.stringify(resources), { ttl: 300 });

    return resources as SharedResourceWithDetails[];
  }

  /**
   * Calificar un recurso
   */
  async rateResource(resourceId: string, rating: number): Promise<boolean> {
    if (rating < 1 || rating > 5) {
      throw new Error('La calificación debe estar entre 1 y 5');
    }

    const resource = await prisma.sharedResource.findUnique({
      where: { id: resourceId }
    });

    if (!resource) {
      throw new Error('Recurso no encontrado');
    }

    const newRating = (resource.rating * resource.ratingCount + rating) / (resource.ratingCount + 1);

    await prisma.sharedResource.update({
      where: { id: resourceId },
      data: {
        rating: newRating,
        ratingCount: resource.ratingCount + 1,
      }
    });

    // Invalidar caché
    await redisCache.del('shared_resources:*');

    return true;
  }

  /**
   * Obtener estadísticas sociales del estudiante
   */
  async getStudentSocialStats(studentId: string): Promise<{
    groupsCreated: number;
    groupsJoined: number;
    projectsCreated: number;
    projectsJoined: number;
    resourcesShared: number;
    totalContributions: number;
    mentorshipSessions: number;
    averageRating: number;
  }> {
    const cacheKey = `social_stats:${studentId}`;
    
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const [
      groupsCreated,
      groupsJoined,
      projectsCreated,
      projectsJoined,
      resourcesShared,
      mentorshipSessions,
      averageRating
    ] = await Promise.all([
      prisma.studyGroup.count({ where: { creatorId: studentId } }),
      prisma.studyGroupMember.count({ where: { studentId } }),
      prisma.collaborativeProject.count({ where: { creatorId: studentId } }),
      prisma.projectParticipant.count({ where: { studentId } }),
      prisma.sharedResource.count({ where: { creatorId: studentId } }),
      prisma.mentorshipSession.count({
        where: {
          mentorship: {
            OR: [
              { mentor: { studentId } },
              { menteeId: studentId }
            ]
          }
        }
      }),
      prisma.sharedResource.aggregate({
        where: { creatorId: studentId },
        _avg: { rating: true }
      })
    ]);

    const stats = {
      groupsCreated,
      groupsJoined,
      projectsCreated,
      projectsJoined,
      resourcesShared,
      totalContributions: groupsCreated + projectsCreated + resourcesShared,
      mentorshipSessions,
      averageRating: averageRating._avg.rating || 0,
    };

    await redisCache.set(cacheKey, JSON.stringify(stats), { ttl: 600 });

    return stats;
  }
}

// Instancia singleton
export const socialServices = new SocialServices();
