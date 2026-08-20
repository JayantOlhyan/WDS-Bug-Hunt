export interface BugReport {
  id: string;
  studentEnrollment: string;
  studentName: string;
  studentEmail: string;
  branch: string;
  section: string;
  pageCategory: string;
  pageUrl: string;
  description: string;
  expectedBehaviour: string;
  actualBehaviour: string;
  reproductionSteps: string;
  screenshotUrl: string;
  screenRecordingUrl?: string;
  suggestedSolution?: string;
  studentSeverity?: string; // 'Minor' | 'Moderate' | 'Major' | 'Critical' | 'Not sure'
  officialSeverity?: string; // 'Minor' | 'Moderate' | 'Major' | 'Critical'
  status: 'NEW' | 'UNDER REVIEW' | 'VALID' | 'INVALID' | 'DUPLICATE' | 'NEEDS MORE INFORMATION' | 'PRIORITIZED' | 'IN PROGRESS' | 'FIXED' | 'VERIFIED';
  points: number;
  duplicate: boolean;
  firstReport: boolean;
  fixed: boolean;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewer?: string | null;
  orientationId?: string;
  internalNotes?: string;
}

export interface Student {
  enrollmentNumber: string;
  name: string;
  email: string;
  branch: string;
  section: string;
  github?: string;
  linkedin?: string;
  totalReports: number;
  validReports: number;
  duplicateReports: number;
  fixedReports: number;
  totalPoints: number;
  currentRank?: number;
  badges: string[];
  orientationId?: string;
  wdsInterest?: string; // 'Yes' | 'No'
  createdAt: string;
}

export interface Orientation {
  id: string;
  date: string;
  branch: string;
  section: string;
  studentsPresent: number;
  qrScans: number;
  reports: number;
  validReports: number;
  duplicateReports: number;
  invalidReports: number;
  totalPoints: number;
  topContributor?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  icon: string;
  active: boolean;
}
