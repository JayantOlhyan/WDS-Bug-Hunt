import fs from 'fs/promises';
import path from 'path';
import { BugReport, Student, Orientation, Badge } from '../types';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

interface Schema {
  bugs: BugReport[];
  students: Student[];
  orientations: Orientation[];
  badges: Badge[];
}

async function readDb(): Promise<Schema> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read mock db.json, returning empty structure', error);
    return { bugs: [], students: [], orientations: [], badges: [] };
  }
}

async function writeDb(data: Schema): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const mockDb = {
  async getBugs(): Promise<BugReport[]> {
    const db = await readDb();
    return db.bugs;
  },

  async getBug(id: string): Promise<BugReport | undefined> {
    const db = await readDb();
    return db.bugs.find(b => b.id === id);
  },

  async createBug(bug: Omit<BugReport, 'id' | 'submittedAt'>): Promise<BugReport> {
    const db = await readDb();
    
    // Generate Report ID
    const count = db.bugs.length + 1;
    const formattedId = `MSIT-${String(count).padStart(4, '0')}`;
    
    const newBug: BugReport = {
      ...bug,
      id: formattedId,
      submittedAt: new Date().toISOString(),
    };
    
    db.bugs.push(newBug);
    
    // Upsert student total count
    let student = db.students.find(s => s.mobileNumber === bug.studentMobile);
    if (!student) {
      student = {
        mobileNumber: bug.studentMobile,
        name: bug.studentName,
        
        branch: bug.branch,
        section: bug.section,
        totalReports: 0,
        validReports: 0,
        duplicateReports: 0,
        fixedReports: 0,
        totalPoints: 0,
        badges: [],
        orientationId: bug.orientationId,
        createdAt: new Date().toISOString()
      };
      db.students.push(student);
    }
    
    student.totalReports += 1;
    
    // Track stats in orientation if applicable
    if (bug.orientationId) {
      const orientation = db.orientations.find(o => o.id === bug.orientationId);
      if (orientation) {
        orientation.reports += 1;
      }
    }
    
    await writeDb(db);
    await this.recalculateRanks();
    return newBug;
  },

  async updateBug(
    id: string, 
    updates: Partial<Pick<BugReport, 'status' | 'officialSeverity' | 'points' | 'duplicate' | 'firstReport' | 'fixed' | 'internalNotes' | 'reviewer'>>
  ): Promise<BugReport> {
    const db = await readDb();
    const bugIdx = db.bugs.findIndex(b => b.id === id);
    if (bugIdx === -1) {
      throw new Error(`Bug report ${id} not found`);
    }

    const oldBug = db.bugs[bugIdx];
    const newBug = {
      ...oldBug,
      ...updates,
      reviewedAt: new Date().toISOString(),
    };
    
    db.bugs[bugIdx] = newBug;

    // Update student stats based on this validation
    const student = db.students.find(s => s.mobileNumber === newBug.studentMobile);
    if (student) {
      // Recalculate total points & report counters for this student
      const studentBugs = db.bugs.filter(b => b.studentMobile === student.mobileNumber);
      
      student.validReports = studentBugs.filter(b => b.status === 'VALID' || b.status === 'FIXED' || b.status === 'VERIFIED').length;
      student.duplicateReports = studentBugs.filter(b => b.status === 'DUPLICATE').length;
      student.fixedReports = studentBugs.filter(b => b.fixed || b.status === 'FIXED' || b.status === 'VERIFIED').length;
      
      // Sum all points awarded
      student.totalPoints = studentBugs.reduce((sum, b) => sum + (b.points || 0), 0);
      
      // Award badges dynamically
      const badges = new Set(student.badges);
      if (student.validReports >= 1) badges.add('FIRST_FIND');
      if (student.validReports >= 5) badges.add('BUG_HUNTER');
      if (student.fixedReports >= 1) badges.add('FIX_FINDER');
      
      // Quality check
      const highQualityBugs = studentBugs.filter(b => b.actualBehaviour && b.actualBehaviour.length > 50 && b.screenshotUrl);
      if (highQualityBugs.length >= 3) badges.add('QUALITY_REPORTER');
      
      student.badges = Array.from(badges);
    }

    // Update orientation stats if applicable
    if (newBug.orientationId) {
      const orientation = db.orientations.find(o => o.id === newBug.orientationId);
      if (orientation) {
        const oBugs = db.bugs.filter(b => b.orientationId === orientation.id);
        orientation.validReports = oBugs.filter(b => b.status === 'VALID' || b.status === 'FIXED' || b.status === 'VERIFIED').length;
        orientation.duplicateReports = oBugs.filter(b => b.status === 'DUPLICATE').length;
        orientation.invalidReports = oBugs.filter(b => b.status === 'INVALID').length;
        orientation.totalPoints = oBugs.reduce((sum, b) => sum + (b.points || 0), 0);
        
        // Find top contributor in orientation
        const studentScores: Record<string, number> = {};
        oBugs.forEach(b => {
          studentScores[b.studentName] = (studentScores[b.studentName] || 0) + (b.points || 0);
        });
        
        let topName = '';
        let maxScore = -1;
        Object.entries(studentScores).forEach(([name, score]) => {
          if (score > maxScore) {
            maxScore = score;
            topName = name;
          }
        });
        
        if (topName) {
          orientation.topContributor = topName;
        }
      }
    }

    await writeDb(db);
    await this.recalculateRanks();
    return newBug;
  },

  async getStudent(mobileNumber: string): Promise<Student | undefined> {
    const db = await readDb();
    return db.students.find(s => s.mobileNumber === mobileNumber);
  },

  async getStudents(): Promise<Student[]> {
    const db = await readDb();
    return db.students;
  },

  async upsertStudent(studentData: Omit<Student, 'totalReports' | 'validReports' | 'duplicateReports' | 'fixedReports' | 'totalPoints' | 'badges' | 'createdAt'>): Promise<Student> {
    const db = await readDb();
    const existingIdx = db.students.findIndex(s => s.mobileNumber === studentData.mobileNumber);
    
    if (existingIdx !== -1) {
      db.students[existingIdx] = {
        ...db.students[existingIdx],
        ...studentData,
      };
      await writeDb(db);
      return db.students[existingIdx];
    } else {
      const newStudent: Student = {
        ...studentData,
        totalReports: 0,
        validReports: 0,
        duplicateReports: 0,
        fixedReports: 0,
        totalPoints: 0,
        badges: [],
        createdAt: new Date().toISOString()
      };
      db.students.push(newStudent);
      await writeDb(db);
      await this.recalculateRanks();
      return newStudent;
    }
  },

  async getLeaderboard(): Promise<Student[]> {
    const db = await readDb();
    // Sorted by totalPoints desc, tie breaker: fixedReports desc, validReports desc, name asc
    return [...db.students].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.fixedReports !== a.fixedReports) return b.fixedReports - a.fixedReports;
      if (b.validReports !== a.validReports) return b.validReports - a.validReports;
      return a.name.localeCompare(b.name);
    });
  },

  async getOrientations(): Promise<Orientation[]> {
    const db = await readDb();
    return db.orientations;
  },

  async createOrientation(id: string, branch: string, section: string): Promise<Orientation> {
    const db = await readDb();
    const newOrientation: Orientation = {
      id,
      date: new Date().toISOString().split('T')[0],
      branch,
      section,
      studentsPresent: 0,
      qrScans: 0,
      reports: 0,
      validReports: 0,
      duplicateReports: 0,
      invalidReports: 0,
      totalPoints: 0,
    };
    db.orientations.push(newOrientation);
    await writeDb(db);
    return newOrientation;
  },

  async incrementOrientationScans(id: string): Promise<void> {
    const db = await readDb();
    const orientation = db.orientations.find(o => o.id === id);
    if (orientation) {
      orientation.qrScans += 1;
      await writeDb(db);
    }
  },

  async getBadges(): Promise<Badge[]> {
    const db = await readDb();
    return db.badges;
  },

  // Internal helper to calculate current leaderboard ranks
  async recalculateRanks(): Promise<void> {
    const db = await readDb();
    const sorted = [...db.students].sort((a, b) => b.totalPoints - a.totalPoints);
    
    db.students = db.students.map(student => {
      const idx = sorted.findIndex(s => s.mobileNumber === student.mobileNumber);
      return {
        ...student,
        currentRank: idx !== -1 ? idx + 1 : undefined
      };
    });
    
    await writeDb(db);
  }
};
