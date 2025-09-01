import Dexie, { Table } from 'dexie';

export interface OfflineStudent {
  id?: number;
  uuid: string;
  name: string;
  progress: any;
  pendingSync: boolean;
}

export interface OfflineLesson {
  id?: number;
  uuid: string;
  title: string;
  content: any;
  completions: any[];
}

export interface SyncQueue {
  id?: number;
  type: 'lesson_completion' | 'assessment' | 'progress';
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineDB extends Dexie {
  students!: Table<OfflineStudent>;
  lessons!: Table<OfflineLesson>;
  syncQueue!: Table<SyncQueue>;
  
  constructor() {
    super('LLuminataOffline');
    
    this.version(1).stores({
      students: '++id, uuid, name, pendingSync',
      lessons: '++id, uuid, title',
      syncQueue: '++id, type, timestamp, synced'
    });
  }
  
  async addToSyncQueue(type: string, data: any) {
    await this.syncQueue.add({
      type: type as any,
      data,
      timestamp: Date.now(),
      synced: false
    });
  }
  
  async getPendingSync() {
    return await this.syncQueue
      .where('synced')
      .equals(false)
      .toArray();
  }
  
  async markAsSynced(ids: number[]) {
    await this.syncQueue
      .where('id')
      .anyOf(ids)
      .modify({ synced: true });
  }

  async cacheStudent(student: any) {
    await this.students.put({
      uuid: student.id,
      name: student.name,
      progress: student,
      pendingSync: false
    });
  }

  async getCachedStudent(uuid: string) {
    return await this.students
      .where('uuid')
      .equals(uuid)
      .first();
  }

  async cacheLesson(lesson: any) {
    await this.lessons.put({
      uuid: lesson.id,
      title: lesson.title,
      content: lesson,
      completions: []
    });
  }

  async getCachedLessons() {
    return await this.lessons.toArray();
  }

  async getCachedLesson(uuid: string) {
    return await this.lessons
      .where('uuid')
      .equals(uuid)
      .first();
  }

  async clearOldData() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Limpiar datos antiguos de la cola de sincronización
    await this.syncQueue
      .where('timestamp')
      .below(oneWeekAgo)
      .delete();
  }
}

export const offlineDB = new OfflineDB();
