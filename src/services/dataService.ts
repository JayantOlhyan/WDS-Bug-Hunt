import { mockDb } from './mockDb';
import { notionDb } from './notionDb';
import { BugReport, Student, Orientation, Badge } from '../types';

const useNotion = notionDb.isEnabled();

if (useNotion) {
  console.log("NOTION BACKEND ACTIVE: Connecting to Notion workspace databases.");
} else {
  console.log("MOCK BACKEND ACTIVE: Connecting to local db.json database.");
}

export const dataService = {
  async getBugs(): Promise<BugReport[]> {
    if (useNotion) return notionDb.getBugs();
    return mockDb.getBugs();
  },

  async getBug(id: string): Promise<BugReport | undefined> {
    if (useNotion) return notionDb.getBug(id);
    return mockDb.getBug(id);
  },

  async createBug(bug: Omit<BugReport, 'id' | 'submittedAt'>): Promise<BugReport> {
    if (useNotion) return notionDb.createBug(bug);
    return mockDb.createBug(bug);
  },

  async updateBug(
    id: string,
    updates: Partial<Pick<BugReport, 'status' | 'officialSeverity' | 'points' | 'duplicate' | 'firstReport' | 'fixed' | 'internalNotes' | 'reviewer'>>
  ): Promise<BugReport> {
    if (useNotion) return notionDb.updateBug(id, updates);
    return mockDb.updateBug(id, updates);
  },

  async getStudent(enrollmentNumber: string): Promise<Student | undefined> {
    if (useNotion) return notionDb.getStudent(enrollmentNumber);
    return mockDb.getStudent(enrollmentNumber);
  },

  async getStudents(): Promise<Student[]> {
    if (useNotion) return notionDb.getStudents();
    return mockDb.getStudents();
  },

  async upsertStudent(studentData: Omit<Student, 'totalReports' | 'validReports' | 'duplicateReports' | 'fixedReports' | 'totalPoints' | 'badges' | 'createdAt'>): Promise<Student> {
    if (useNotion) return notionDb.upsertStudent(studentData);
    return mockDb.upsertStudent(studentData);
  },

  async getLeaderboard(): Promise<Student[]> {
    if (useNotion) return notionDb.getLeaderboard();
    return mockDb.getLeaderboard();
  },

  async getOrientations(): Promise<Orientation[]> {
    if (useNotion) return notionDb.getOrientations();
    return mockDb.getOrientations();
  },

  async createOrientation(id: string, branch: string, section: string): Promise<Orientation> {
    if (useNotion) return notionDb.createOrientation(id, branch, section);
    return mockDb.createOrientation(id, branch, section);
  },

  async incrementOrientationScans(id: string): Promise<void> {
    if (useNotion) return notionDb.incrementOrientationScans(id);
    return mockDb.incrementOrientationScans(id);
  },

  async getBadges(): Promise<Badge[]> {
    if (useNotion) return notionDb.getBadges();
    return mockDb.getBadges();
  }
};
