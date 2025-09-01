/**
 * Integración con LMS Externos - InclusiveAI Coach
 * Soporte para Moodle, Canvas, Blackboard y otros sistemas LMS
 */

import { PrismaClient } from '@prisma/client';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

// Interfaces para LMS
export interface LMSConfig {
  type: 'moodle' | 'canvas' | 'blackboard' | 'schoology' | 'google-classroom';
  baseUrl: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  token?: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface LMSConnection {
  id: string;
  institutionId: string;
  config: LMSConfig;
  status: 'active' | 'inactive' | 'error';
  lastSync: Date;
  syncStatus: 'idle' | 'syncing' | 'error';
  errorMessage?: string;
}

export interface LMSUser {
  id: string;
  externalId: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  courses: string[];
  lastSync: Date;
}

export interface LMSCourse {
  id: string;
  externalId: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'archived';
  students: string[];
  teachers: string[];
  modules: LMSModule[];
}

export interface LMSModule {
  id: string;
  externalId: string;
  name: string;
  type: 'assignment' | 'quiz' | 'resource' | 'forum' | 'workshop';
  content?: any;
  dueDate?: Date;
  points?: number;
}

export interface LMSGrade {
  userId: string;
  moduleId: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
}

export interface LMSSyncResult {
  success: boolean;
  syncedUsers: number;
  syncedCourses: number;
  syncedGrades: number;
  errors: string[];
  warnings: string[];
}

/**
 * Clase base para integración con LMS
 */
abstract class BaseLMSIntegration {
  protected config: LMSConfig;
  protected client: AxiosInstance;
  protected connectionId: string;

  constructor(config: LMSConfig, connectionId: string) {
    this.config = config;
    this.connectionId = connectionId;
    
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LLuminata/1.0'
      }
    });

    this.setupInterceptors();
  }

  protected setupInterceptors() {
    // Interceptor para manejo de errores
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.error(`LMS API Error (${this.config.type}):`, error.message);
        
        if (error.response?.status === 401) {
          await this.refreshToken();
        }
        
        return Promise.reject(error);
      }
    );
  }

  abstract authenticate(): Promise<boolean>;
  abstract refreshToken(): Promise<boolean>;
  abstract getUsers(): Promise<LMSUser[]>;
  abstract getCourses(): Promise<LMSCourse[]>;
  abstract getGrades(courseId: string): Promise<LMSGrade[]>;
  abstract syncGrades(grades: LMSGrade[]): Promise<boolean>;
  abstract createAssignment(courseId: string, assignment: any): Promise<string>;
  abstract updateGrade(gradeId: string, grade: any): Promise<boolean>;
}

/**
 * Integración con Moodle
 */
class MoodleIntegration extends BaseLMSIntegration {
  private token: string;

  constructor(config: LMSConfig, connectionId: string) {
    super(config, connectionId);
    this.token = config.token || '';
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.client.post('/login/token.php', {
        username: this.config.username,
        password: this.config.password,
        service: 'moodle_mobile_app'
      });

      if (response.data.token) {
        this.token = response.data.token;
        this.client.defaults.headers['Authorization'] = `Bearer ${this.token}`;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error autenticando con Moodle:', error);
      return false;
    }
  }

  async refreshToken(): Promise<boolean> {
    return this.authenticate();
  }

  async getUsers(): Promise<LMSUser[]> {
    try {
      const response = await this.client.get('/webservice/rest/server.php', {
        params: {
          wstoken: this.token,
          wsfunction: 'core_user_get_users',
          moodlewsrestformat: 'json'
        }
      });

      return response.data.users.map((user: any) => ({
        id: user.id.toString(),
        externalId: user.id.toString(),
        email: user.email,
        name: `${user.firstname} ${user.lastname}`,
        role: this.mapMoodleRole(user.roles),
        courses: [],
        lastSync: new Date()
      }));
    } catch (error) {
      console.error('Error obteniendo usuarios de Moodle:', error);
      return [];
    }
  }

  async getCourses(): Promise<LMSCourse[]> {
    try {
      const response = await this.client.get('/webservice/rest/server.php', {
        params: {
          wstoken: this.token,
          wsfunction: 'core_course_get_enrolled_courses_by_timeline_classification',
          moodlewsrestformat: 'json'
        }
      });

      return response.data.courses.map((course: any) => ({
        id: course.id.toString(),
        externalId: course.id.toString(),
        name: course.fullname,
        description: course.summary,
        startDate: course.startdate ? new Date(course.startdate * 1000) : undefined,
        endDate: course.enddate ? new Date(course.enddate * 1000) : undefined,
        status: course.visible ? 'active' : 'inactive',
        students: [],
        teachers: [],
        modules: []
      }));
    } catch (error) {
      console.error('Error obteniendo cursos de Moodle:', error);
      return [];
    }
  }

  async getGrades(courseId: string): Promise<LMSGrade[]> {
    try {
      const response = await this.client.get('/webservice/rest/server.php', {
        params: {
          wstoken: this.token,
          wsfunction: 'gradereport_user_get_grade_items',
          moodlewsrestformat: 'json',
          courseid: courseId
        }
      });

      return response.data.usergrades.flatMap((userGrade: any) =>
        userGrade.gradeitems.map((item: any) => ({
          userId: userGrade.userid.toString(),
          moduleId: item.id.toString(),
          score: parseFloat(item.gradeformatted) || 0,
          maxScore: parseFloat(item.grademax) || 100,
          percentage: parseFloat(item.percentageformatted) || 0,
          feedback: item.feedback,
          submittedAt: new Date(),
          gradedAt: item.timecreated ? new Date(item.timecreated * 1000) : undefined
        }))
      );
    } catch (error) {
      console.error('Error obteniendo calificaciones de Moodle:', error);
      return [];
    }
  }

  async syncGrades(grades: LMSGrade[]): Promise<boolean> {
    try {
      for (const grade of grades) {
        await this.client.post('/webservice/rest/server.php', {
          wstoken: this.token,
          wsfunction: 'core_grades_update_grades',
          moodlewsrestformat: 'json',
          source: 'LLuminata',
          courseid: grade.moduleId,
          component: 'mod_assign',
          itemnumber: 0,
          grades: [{
            studentid: grade.userId,
            grade: grade.score
          }]
        });
      }
      return true;
    } catch (error) {
      console.error('Error sincronizando calificaciones con Moodle:', error);
      return false;
    }
  }

  async createAssignment(courseId: string, assignment: any): Promise<string> {
    try {
      const response = await this.client.post('/webservice/rest/server.php', {
        wstoken: this.token,
        wsfunction: 'mod_assign_add_instance',
        moodlewsrestformat: 'json',
        course: courseId,
        name: assignment.name,
        intro: assignment.description,
        duedate: assignment.dueDate ? Math.floor(assignment.dueDate.getTime() / 1000) : 0,
        cutoffdate: 0,
        allowsubmissionsfromdate: 0,
        maxattempts: -1,
        markingworkflow: 0,
        markingallocation: 0,
        sendnotifications: 1,
        preventsubmissionnotingroup: 0,
        teamsubmission: 0,
        requireallteammemberssubmit: 0,
        teamsubmissiongroupingid: 0,
        blindmarking: 0,
        hidegrader: 0,
        revealidentities: 0,
        attemptreopenmethod: 'none',
        maxattempts: -1,
        markingworkflow: 0,
        markingallocation: 0,
        sendnotifications: 1,
        preventsubmissionnotingroup: 0,
        teamsubmission: 0,
        requireallteammemberssubmit: 0,
        teamsubmissiongroupingid: 0,
        blindmarking: 0,
        hidegrader: 0,
        revealidentities: 0,
        attemptreopenmethod: 'none'
      });

      return response.data.id.toString();
    } catch (error) {
      console.error('Error creando tarea en Moodle:', error);
      throw error;
    }
  }

  async updateGrade(gradeId: string, grade: any): Promise<boolean> {
    try {
      await this.client.post('/webservice/rest/server.php', {
        wstoken: this.token,
        wsfunction: 'core_grades_update_grades',
        moodlewsrestformat: 'json',
                  source: 'LLuminata',
          courseid: gradeId,
        component: 'mod_assign',
        itemnumber: 0,
        grades: [{
          studentid: grade.userId,
          grade: grade.score,
          feedback: grade.feedback
        }]
      });
      return true;
    } catch (error) {
      console.error('Error actualizando calificación en Moodle:', error);
      return false;
    }
  }

  private mapMoodleRole(roles: any[]): 'student' | 'teacher' | 'admin' {
    if (!roles || roles.length === 0) return 'student';
    
    const roleNames = roles.map(role => role.shortname?.toLowerCase());
    
    if (roleNames.includes('editingteacher') || roleNames.includes('teacher')) {
      return 'teacher';
    }
    if (roleNames.includes('manager') || roleNames.includes('admin')) {
      return 'admin';
    }
    return 'student';
  }
}

/**
 * Integración con Canvas
 */
class CanvasIntegration extends BaseLMSIntegration {
  private accessToken: string;

  constructor(config: LMSConfig, connectionId: string) {
    super(config, connectionId);
    this.accessToken = config.token || '';
    this.client.defaults.headers['Authorization'] = `Bearer ${this.accessToken}`;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/v1/users/self');
      return response.status === 200;
    } catch (error) {
      console.error('Error autenticando con Canvas:', error);
      return false;
    }
  }

  async refreshToken(): Promise<boolean> {
    // Canvas usa OAuth2, el refresh se maneja automáticamente
    return true;
  }

  async getUsers(): Promise<LMSUser[]> {
    try {
      const response = await this.client.get('/api/v1/accounts/self/users');
      
      return response.data.map((user: any) => ({
        id: user.id.toString(),
        externalId: user.id.toString(),
        email: user.email,
        name: user.name,
        role: this.mapCanvasRole(user.enrollment_type),
        courses: [],
        lastSync: new Date()
      }));
    } catch (error) {
      console.error('Error obteniendo usuarios de Canvas:', error);
      return [];
    }
  }

  async getCourses(): Promise<LMSCourse[]> {
    try {
      const response = await this.client.get('/api/v1/courses', {
        params: {
          enrollment_state: 'active',
          include: ['teachers', 'total_students']
        }
      });

      return response.data.map((course: any) => ({
        id: course.id.toString(),
        externalId: course.id.toString(),
        name: course.name,
        description: course.description,
        startDate: course.start_at ? new Date(course.start_at) : undefined,
        endDate: course.end_at ? new Date(course.end_at) : undefined,
        status: course.workflow_state === 'available' ? 'active' : 'inactive',
        students: [],
        teachers: course.teachers?.map((t: any) => t.id.toString()) || [],
        modules: []
      }));
    } catch (error) {
      console.error('Error obteniendo cursos de Canvas:', error);
      return [];
    }
  }

  async getGrades(courseId: string): Promise<LMSGrade[]> {
    try {
      const response = await this.client.get(`/api/v1/courses/${courseId}/enrollments`, {
        params: {
          include: ['grades']
        }
      });

      return response.data.flatMap((enrollment: any) => {
        if (!enrollment.grades) return [];
        
        return Object.entries(enrollment.grades).map(([assignmentId, grade]: [string, any]) => ({
          userId: enrollment.user_id.toString(),
          moduleId: assignmentId,
          score: parseFloat(grade.score) || 0,
          maxScore: parseFloat(grade.possible) || 100,
          percentage: parseFloat(grade.percentage) || 0,
          feedback: grade.comments,
          submittedAt: new Date(),
          gradedAt: grade.graded_at ? new Date(grade.graded_at) : undefined
        }));
      });
    } catch (error) {
      console.error('Error obteniendo calificaciones de Canvas:', error);
      return [];
    }
  }

  async syncGrades(grades: LMSGrade[]): Promise<boolean> {
    try {
      for (const grade of grades) {
        await this.client.put(`/api/v1/courses/${grade.moduleId}/assignments/${grade.moduleId}/submissions/${grade.userId}`, {
          submission: {
            posted_grade: grade.score.toString()
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Error sincronizando calificaciones con Canvas:', error);
      return false;
    }
  }

  async createAssignment(courseId: string, assignment: any): Promise<string> {
    try {
      const response = await this.client.post(`/api/v1/courses/${courseId}/assignments`, {
        assignment: {
          name: assignment.name,
          description: assignment.description,
          due_at: assignment.dueDate?.toISOString(),
          points_possible: assignment.points || 100,
          submission_types: ['online_text_entry', 'online_upload'],
          allowed_attempts: -1
        }
      });

      return response.data.id.toString();
    } catch (error) {
      console.error('Error creando tarea en Canvas:', error);
      throw error;
    }
  }

  async updateGrade(gradeId: string, grade: any): Promise<boolean> {
    try {
      await this.client.put(`/api/v1/courses/${gradeId}/assignments/${gradeId}/submissions/${grade.userId}`, {
        submission: {
          posted_grade: grade.score.toString(),
          comment: grade.feedback
        }
      });
      return true;
    } catch (error) {
      console.error('Error actualizando calificación en Canvas:', error);
      return false;
    }
  }

  private mapCanvasRole(enrollmentType?: string): 'student' | 'teacher' | 'admin' {
    switch (enrollmentType) {
      case 'TeacherEnrollment':
        return 'teacher';
      case 'TaEnrollment':
        return 'teacher';
      case 'DesignerEnrollment':
        return 'admin';
      case 'ObserverEnrollment':
        return 'admin';
      default:
        return 'student';
    }
  }
}

/**
 * Integración con Blackboard
 */
class BlackboardIntegration extends BaseLMSIntegration {
  private accessToken: string;

  constructor(config: LMSConfig, connectionId: string) {
    super(config, connectionId);
    this.accessToken = config.token || '';
    this.client.defaults.headers['Authorization'] = `Bearer ${this.accessToken}`;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.client.post('/learn/api/public/v1/oauth2/token', {
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      });

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        this.client.defaults.headers['Authorization'] = `Bearer ${this.accessToken}`;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error autenticando con Blackboard:', error);
      return false;
    }
  }

  async refreshToken(): Promise<boolean> {
    return this.authenticate();
  }

  async getUsers(): Promise<LMSUser[]> {
    try {
      const response = await this.client.get('/learn/api/public/v1/users');
      
      return response.data.results.map((user: any) => ({
        id: user.id,
        externalId: user.id,
        email: user.contact?.email || '',
        name: user.name?.given + ' ' + user.name?.family,
        role: this.mapBlackboardRole(user.systemRoleIds),
        courses: [],
        lastSync: new Date()
      }));
    } catch (error) {
      console.error('Error obteniendo usuarios de Blackboard:', error);
      return [];
    }
  }

  async getCourses(): Promise<LMSCourse[]> {
    try {
      const response = await this.client.get('/learn/api/public/v1/courses', {
        params: {
          availability: 'Available'
        }
      });

      return response.data.results.map((course: any) => ({
        id: course.id,
        externalId: course.id,
        name: course.name,
        description: course.description,
        startDate: course.startDate ? new Date(course.startDate) : undefined,
        endDate: course.endDate ? new Date(course.endDate) : undefined,
        status: course.availability === 'Available' ? 'active' : 'inactive',
        students: [],
        teachers: [],
        modules: []
      }));
    } catch (error) {
      console.error('Error obteniendo cursos de Blackboard:', error);
      return [];
    }
  }

  async getGrades(courseId: string): Promise<LMSGrade[]> {
    try {
      const response = await this.client.get(`/learn/api/public/v1/courses/${courseId}/gradebook/columns`);
      
      const grades: LMSGrade[] = [];
      
      for (const column of response.data.results) {
        const attemptsResponse = await this.client.get(
          `/learn/api/public/v1/courses/${courseId}/gradebook/columns/${column.id}/attempts`
        );
        
        grades.push(...attemptsResponse.data.results.map((attempt: any) => ({
          userId: attempt.userId,
          moduleId: column.id,
          score: attempt.score || 0,
          maxScore: column.score?.possible || 100,
          percentage: attempt.score ? (attempt.score / (column.score?.possible || 100)) * 100 : 0,
          feedback: attempt.feedback,
          submittedAt: new Date(attempt.created),
          gradedAt: attempt.modified ? new Date(attempt.modified) : undefined
        })));
      }
      
      return grades;
    } catch (error) {
      console.error('Error obteniendo calificaciones de Blackboard:', error);
      return [];
    }
  }

  async syncGrades(grades: LMSGrade[]): Promise<boolean> {
    try {
      for (const grade of grades) {
        await this.client.post(`/learn/api/public/v1/courses/${grade.moduleId}/gradebook/columns/${grade.moduleId}/attempts`, {
          userId: grade.userId,
          score: grade.score,
          feedback: grade.feedback
        });
      }
      return true;
    } catch (error) {
      console.error('Error sincronizando calificaciones con Blackboard:', error);
      return false;
    }
  }

  async createAssignment(courseId: string, assignment: any): Promise<string> {
    try {
      const response = await this.client.post(`/learn/api/public/v1/courses/${courseId}/gradebook/columns`, {
        name: assignment.name,
        description: assignment.description,
        score: {
          possible: assignment.points || 100
        },
        grading: {
          type: 'Attempts',
          attempts: {
            unlimited: true
          }
        },
        content: {
          due: assignment.dueDate?.toISOString()
        }
      });

      return response.data.id;
    } catch (error) {
      console.error('Error creando tarea en Blackboard:', error);
      throw error;
    }
  }

  async updateGrade(gradeId: string, grade: any): Promise<boolean> {
    try {
      await this.client.patch(`/learn/api/public/v1/courses/${gradeId}/gradebook/columns/${gradeId}/attempts/${grade.userId}`, {
        score: grade.score,
        feedback: grade.feedback
      });
      return true;
    } catch (error) {
      console.error('Error actualizando calificación en Blackboard:', error);
      return false;
    }
  }

  private mapBlackboardRole(systemRoleIds: string[]): 'student' | 'teacher' | 'admin' {
    if (!systemRoleIds || systemRoleIds.length === 0) return 'student';
    
    if (systemRoleIds.includes('SystemAdmin')) {
      return 'admin';
    }
    if (systemRoleIds.includes('Instructor') || systemRoleIds.includes('TeachingAssistant')) {
      return 'teacher';
    }
    return 'student';
  }
}

/**
 * Gestor principal de integración con LMS
 */
export class LMSIntegrationManager {
  private connections: Map<string, BaseLMSIntegration> = new Map();
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Registra una nueva conexión LMS
   */
  async registerConnection(connection: LMSConnection): Promise<boolean> {
    try {
      let integration: BaseLMSIntegration;

      switch (connection.config.type) {
        case 'moodle':
          integration = new MoodleIntegration(connection.config, connection.id);
          break;
        case 'canvas':
          integration = new CanvasIntegration(connection.config, connection.id);
          break;
        case 'blackboard':
          integration = new BlackboardIntegration(connection.config, connection.id);
          break;
        default:
          throw new Error(`LMS type ${connection.config.type} not supported`);
      }

      // Verificar autenticación
      const isAuthenticated = await integration.authenticate();
      if (!isAuthenticated) {
        throw new Error(`Failed to authenticate with ${connection.config.type}`);
      }

      this.connections.set(connection.id, integration);

      // Guardar en base de datos
      await this.prisma.lMSConnection.upsert({
        where: { id: connection.id },
        update: {
          config: connection.config,
          status: 'active',
          lastSync: new Date(),
          syncStatus: 'idle'
        },
        create: {
          id: connection.id,
          institutionId: connection.institutionId,
          config: connection.config,
          status: 'active',
          lastSync: new Date(),
          syncStatus: 'idle'
        }
      });

      return true;
    } catch (error) {
      console.error('Error registrando conexión LMS:', error);
      return false;
    }
  }

  /**
   * Sincroniza datos con LMS externo
   */
  async syncWithLMS(connectionId: string): Promise<LMSSyncResult> {
    const integration = this.connections.get(connectionId);
    if (!integration) {
      throw new Error(`LMS connection ${connectionId} not found`);
    }

    const result: LMSSyncResult = {
      success: true,
      syncedUsers: 0,
      syncedCourses: 0,
      syncedGrades: 0,
      errors: [],
      warnings: []
    };

    try {
      // Actualizar estado de sincronización
      await this.prisma.lMSConnection.update({
        where: { id: connectionId },
        data: { syncStatus: 'syncing' }
      });

      // Sincronizar usuarios
      const users = await integration.getUsers();
      for (const user of users) {
        await this.syncUser(user, connectionId);
        result.syncedUsers++;
      }

      // Sincronizar cursos
      const courses = await integration.getCourses();
      for (const course of courses) {
        await this.syncCourse(course, connectionId);
        result.syncedCourses++;
      }

      // Sincronizar calificaciones
      for (const course of courses) {
        const grades = await integration.getGrades(course.id);
        for (const grade of grades) {
          await this.syncGrade(grade, connectionId);
          result.syncedGrades++;
        }
      }

      // Actualizar estado final
      await this.prisma.lMSConnection.update({
        where: { id: connectionId },
        data: {
          syncStatus: 'idle',
          lastSync: new Date(),
          status: 'active'
        }
      });

    } catch (error) {
      result.success = false;
      result.errors.push(error.message);
      
      await this.prisma.lMSConnection.update({
        where: { id: connectionId },
        data: {
          syncStatus: 'error',
          errorMessage: error.message
        }
      });
    }

    return result;
  }

  /**
   * Sincroniza un usuario específico
   */
  private async syncUser(lmsUser: LMSUser, connectionId: string): Promise<void> {
    await this.prisma.lMSUser.upsert({
      where: {
        externalId_connectionId: {
          externalId: lmsUser.externalId,
          connectionId: connectionId
        }
      },
      update: {
        email: lmsUser.email,
        name: lmsUser.name,
        role: lmsUser.role,
        lastSync: new Date()
      },
      create: {
        externalId: lmsUser.externalId,
        connectionId: connectionId,
        email: lmsUser.email,
        name: lmsUser.name,
        role: lmsUser.role,
        lastSync: new Date()
      }
    });
  }

  /**
   * Sincroniza un curso específico
   */
  private async syncCourse(lmsCourse: LMSCourse, connectionId: string): Promise<void> {
    await this.prisma.lMSCourse.upsert({
      where: {
        externalId_connectionId: {
          externalId: lmsCourse.externalId,
          connectionId: connectionId
        }
      },
      update: {
        name: lmsCourse.name,
        description: lmsCourse.description,
        startDate: lmsCourse.startDate,
        endDate: lmsCourse.endDate,
        status: lmsCourse.status,
        lastSync: new Date()
      },
      create: {
        externalId: lmsCourse.externalId,
        connectionId: connectionId,
        name: lmsCourse.name,
        description: lmsCourse.description,
        startDate: lmsCourse.startDate,
        endDate: lmsCourse.endDate,
        status: lmsCourse.status,
        lastSync: new Date()
      }
    });
  }

  /**
   * Sincroniza una calificación específica
   */
  private async syncGrade(lmsGrade: LMSGrade, connectionId: string): Promise<void> {
    await this.prisma.lMSGrade.upsert({
      where: {
        userId_moduleId_connectionId: {
          userId: lmsGrade.userId,
          moduleId: lmsGrade.moduleId,
          connectionId: connectionId
        }
      },
      update: {
        score: lmsGrade.score,
        maxScore: lmsGrade.maxScore,
        percentage: lmsGrade.percentage,
        feedback: lmsGrade.feedback,
        submittedAt: lmsGrade.submittedAt,
        gradedAt: lmsGrade.gradedAt,
        lastSync: new Date()
      },
      create: {
        userId: lmsGrade.userId,
        moduleId: lmsGrade.moduleId,
        connectionId: connectionId,
        score: lmsGrade.score,
        maxScore: lmsGrade.maxScore,
        percentage: lmsGrade.percentage,
        feedback: lmsGrade.feedback,
        submittedAt: lmsGrade.submittedAt,
        gradedAt: lmsGrade.gradedAt,
        lastSync: new Date()
      }
    });
  }

  /**
   * Obtiene todas las conexiones LMS
   */
  async getConnections(): Promise<LMSConnection[]> {
    const connections = await this.prisma.lMSConnection.findMany({
      include: {
        institution: true
      }
    });

    return connections.map(conn => ({
      id: conn.id,
      institutionId: conn.institutionId,
      config: conn.config as LMSConfig,
      status: conn.status as 'active' | 'inactive' | 'error',
      lastSync: conn.lastSync,
      syncStatus: conn.syncStatus as 'idle' | 'syncing' | 'error',
      errorMessage: conn.errorMessage
    }));
  }

  /**
   * Elimina una conexión LMS
   */
  async removeConnection(connectionId: string): Promise<boolean> {
    try {
      this.connections.delete(connectionId);
      
      await this.prisma.lMSConnection.delete({
        where: { id: connectionId }
      });

      return true;
    } catch (error) {
      console.error('Error eliminando conexión LMS:', error);
      return false;
    }
  }

  /**
   * Exporta calificaciones a LMS externo
   */
  async exportGrades(connectionId: string, grades: LMSGrade[]): Promise<boolean> {
    const integration = this.connections.get(connectionId);
    if (!integration) {
      throw new Error(`LMS connection ${connectionId} not found`);
    }

    try {
      return await integration.syncGrades(grades);
    } catch (error) {
      console.error('Error exportando calificaciones:', error);
      return false;
    }
  }

  /**
   * Crea una tarea en LMS externo
   */
  async createAssignment(connectionId: string, courseId: string, assignment: any): Promise<string> {
    const integration = this.connections.get(connectionId);
    if (!integration) {
      throw new Error(`LMS connection ${connectionId} not found`);
    }

    try {
      return await integration.createAssignment(courseId, assignment);
    } catch (error) {
      console.error('Error creando tarea en LMS:', error);
      throw error;
    }
  }

  /**
   * Actualiza una calificación en LMS externo
   */
  async updateGrade(connectionId: string, gradeId: string, grade: any): Promise<boolean> {
    const integration = this.connections.get(connectionId);
    if (!integration) {
      throw new Error(`LMS connection ${connectionId} not found`);
    }

    try {
      return await integration.updateGrade(gradeId, grade);
    } catch (error) {
      console.error('Error actualizando calificación en LMS:', error);
      return false;
    }
  }
}

// Instancia global del gestor de LMS
export const lmsIntegrationManager = new LMSIntegrationManager();
