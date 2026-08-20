import { Client } from '@notionhq/client';
import { BugReport, Student, Orientation, Badge } from '../types';

// Initialize Notion Client lazily
let notionClient: Client | null = null;

function getNotionClient(): any {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error("NOTION_TOKEN is not configured");
  }
  if (!notionClient) {
    notionClient = new Client({ auth: token }) as any;
  }
  return notionClient;
}

const BUGS_DB_ID = process.env.NOTION_DATABASE_BUGS_ID || '';
const STUDENTS_DB_ID = process.env.NOTION_DATABASE_STUDENTS_ID || '';
const ORIENTATIONS_DB_ID = process.env.NOTION_DATABASE_ORIENTATIONS_ID || '';
const BADGES_DB_ID = process.env.NOTION_DATABASE_BADGES_ID || '';

export const notionDb = {
  isEnabled(): boolean {
    return !!process.env.NOTION_TOKEN;
  },

  async getBugs(): Promise<BugReport[]> {
    const notion = getNotionClient();
    const response = await notion.databases.query({
      database_id: BUGS_DB_ID,
      sorts: [{ property: 'Submitted At', direction: 'descending' }],
    });

    return response.results.map((page: any) => this.mapPageToBug(page));
  },

  async getBug(id: string): Promise<BugReport | undefined> {
    const notion = getNotionClient();
    const response = await notion.databases.query({
      database_id: BUGS_DB_ID,
      filter: {
        property: 'Report ID',
        rich_text: {
          equals: id,
        },
      },
    });

    if (response.results.length === 0) return undefined;
    return this.mapPageToBug(response.results[0]);
  },

  async createBug(bug: Omit<BugReport, 'id' | 'submittedAt'>): Promise<BugReport> {
    const notion = getNotionClient();
    
    // Query count of bugs to generate ID
    const currentBugs = await this.getBugs();
    const count = currentBugs.length + 1;
    const formattedId = `MSIT-${String(count).padStart(4, '0')}`;
    const submittedAt = new Date().toISOString();

    const properties: any = {
      'Report ID': { rich_text: [{ text: { content: formattedId } }] },
      'Student': { title: [{ text: { content: bug.studentName } }] },
      'Avatar Emoji': { rich_text: [{ text: { content: bug.avatarEmoji || '👾' } }] },
      'Mobile Number': { rich_text: [{ text: { content: bug.studentMobile } }] },
      'Branch': { select: { name: bug.branch } },
      'Section': { select: { name: bug.section } },
      'Page Category': { select: { name: bug.pageCategory } },
      'Page URL': { url: bug.pageUrl },
      'Bug Description': { rich_text: [{ text: { content: bug.description } }] },
      'Expected Behaviour': { rich_text: [{ text: { content: bug.expectedBehaviour } }] },
      'Actual Behaviour': { rich_text: [{ text: { content: bug.actualBehaviour } }] },
      'Screenshot URL': { url: bug.screenshotUrl },
      'Points': { number: 0 },
      'Duplicate': { checkbox: false },
      'First Report': { checkbox: false },
      'Fixed': { checkbox: false },
      'Submitted At': { date: { start: submittedAt } },
    };

    if (bug.screenRecordingUrl) {
      properties['Screen Recording URL'] = { url: bug.screenRecordingUrl };
    }
    if (bug.suggestedSolution) {
      properties['Suggested Solution'] = { rich_text: [{ text: { content: bug.suggestedSolution } }] };
    }
    if (bug.studentSeverity) {
      properties['Student Severity'] = { select: { name: bug.studentSeverity } };
    }
    if (bug.orientationId) {
      properties['Orientation'] = { rich_text: [{ text: { content: bug.orientationId } }] };
    }

    await notion.pages.create({
      parent: { database_id: BUGS_DB_ID },
      properties,
    });

    // Proactively update student's record
    await this.updateStudentMetrics(bug.studentMobile, bug.studentName, bug.avatarEmoji, bug.branch, bug.section, bug.orientationId);

    return {
      ...bug,
      id: formattedId,
      status: 'NEW',
      points: 0,
      duplicate: false,
      firstReport: false,
      fixed: false,
      submittedAt,
    };
  },

  async updateBug(
    id: string,
    updates: Partial<Pick<BugReport, 'status' | 'officialSeverity' | 'points' | 'duplicate' | 'firstReport' | 'fixed' | 'internalNotes' | 'reviewer'>>
  ): Promise<BugReport> {
    const notion = getNotionClient();
    
    // Find the page ID
    const response = await notion.databases.query({
      database_id: BUGS_DB_ID,
      filter: {
        property: 'Report ID',
        rich_text: {
          equals: id,
        },
      },
    });

    if (response.results.length === 0) {
      throw new Error(`Bug report ${id} not found in Notion`);
    }

    const pageId = response.results[0].id;
    const bug = this.mapPageToBug(response.results[0]);
    const reviewedAt = new Date().toISOString();

    const properties: any = {
      'Reviewed At': { date: { start: reviewedAt } },
    };

    if (updates.officialSeverity) {
      properties['Official Severity'] = { select: { name: updates.officialSeverity } };
    }
    if (updates.points !== undefined) {
      properties['Points'] = { number: updates.points };
    }
    if (updates.duplicate !== undefined) {
      properties['Duplicate'] = { checkbox: updates.duplicate };
    }
    if (updates.firstReport !== undefined) {
      properties['First Report'] = { checkbox: updates.firstReport };
    }
    if (updates.fixed !== undefined) {
      properties['Fixed'] = { checkbox: updates.fixed };
    }
    if (updates.internalNotes !== undefined) {
      properties['Internal Notes'] = { rich_text: [{ text: { content: updates.internalNotes } }] };
    }
    if (updates.reviewer) {
      properties['Reviewer'] = { rich_text: [{ text: { content: updates.reviewer } }] };
    }

    await notion.pages.update({
      page_id: pageId,
      properties,
    });

    const updatedBug = {
      ...bug,
      ...updates,
      reviewedAt,
    };

    // Update student stats
    await this.updateStudentMetrics(updatedBug.studentMobile, updatedBug.studentName, updatedBug.avatarEmoji, updatedBug.branch, updatedBug.section, updatedBug.orientationId);

    return updatedBug;
  },

  async getStudent(mobileNumber: string): Promise<Student | undefined> {
    const notion = getNotionClient();
    const response = await notion.databases.query({
      database_id: STUDENTS_DB_ID,
      filter: {
        property: 'Mobile Number',
        rich_text: {
          equals: mobileNumber,
        },
      },
    });

    if (response.results.length === 0) return undefined;
    return this.mapPageToStudent(response.results[0]);
  },

  async getStudents(): Promise<Student[]> {
    const notion = getNotionClient();
    const response = await notion.databases.query({
      database_id: STUDENTS_DB_ID,
    });
    return response.results.map((page: any) => this.mapPageToStudent(page));
  },

  async upsertStudent(studentData: Omit<Student, 'totalReports' | 'validReports' | 'duplicateReports' | 'fixedReports' | 'totalPoints' | 'badges' | 'createdAt'>): Promise<Student> {
    const notion = getNotionClient();
    const existing = await this.getStudent(studentData.mobileNumber);

    if (existing) {
      // Find page
      const response = await notion.databases.query({
        database_id: STUDENTS_DB_ID,
        filter: {
          property: 'Mobile Number',
          rich_text: { equals: studentData.mobileNumber },
        },
      });
      const pageId = response.results[0].id;

      const properties: any = {
        'Name': { title: [{ text: { content: studentData.name } }] },
        'Avatar Emoji': { rich_text: [{ text: { content: studentData.avatarEmoji || '👾' } }] },
        'Branch': { select: { name: studentData.branch } },
        'Section': { select: { name: studentData.section } },
      };
      if (studentData.github) properties['GitHub'] = { url: studentData.github };
      if (studentData.linkedin) properties['LinkedIn'] = { url: studentData.linkedin };
      if (studentData.wdsInterest) properties['WDS Interest'] = { select: { name: studentData.wdsInterest } };

      await notion.pages.update({
        page_id: pageId,
        properties,
      });

      return {
        ...existing,
        ...studentData,
      };
    } else {
      const properties: any = {
        'Student ID': { rich_text: [{ text: { content: `STU-${studentData.mobileNumber}` } }] },
        'Name': { title: [{ text: { content: studentData.name } }] },
        'Avatar Emoji': { rich_text: [{ text: { content: studentData.avatarEmoji || '👾' } }] },
        'Mobile Number': { rich_text: [{ text: { content: studentData.mobileNumber } }] },
        'Branch': { select: { name: studentData.branch } },
        'Section': { select: { name: studentData.section } },
        'Total Reports': { number: 0 },
        'Valid Reports': { number: 0 },
        'Duplicate Reports': { number: 0 },
        'Fixed Reports': { number: 0 },
        'Total Points': { number: 0 },
        'Badges': { multi_select: [] },
        'Created At': { date: { start: new Date().toISOString() } },
      };

      if (studentData.github) properties['GitHub'] = { url: studentData.github };
      if (studentData.linkedin) properties['LinkedIn'] = { url: studentData.linkedin };
      if (studentData.wdsInterest) properties['WDS Interest'] = { select: { name: studentData.wdsInterest } };
      if (studentData.orientationId) properties['Orientation'] = { rich_text: [{ text: { content: studentData.orientationId } }] };

      const newPage = await notion.pages.create({
        parent: { database_id: STUDENTS_DB_ID },
        properties,
      });

      return this.mapPageToStudent(newPage);
    }
  },

  async getLeaderboard(): Promise<Student[]> {
    const students = await this.getStudents();
    return students.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.fixedReports !== a.fixedReports) return b.fixedReports - a.fixedReports;
      return a.name.localeCompare(b.name);
    });
  },

  async getOrientations(): Promise<Orientation[]> {
    const notion = getNotionClient();
    const response = await notion.databases.query({
      database_id: ORIENTATIONS_DB_ID,
    });
    return response.results.map((page: any) => this.mapPageToOrientation(page));
  },

  async createOrientation(id: string, branch: string, section: string): Promise<Orientation> {
    const notion = getNotionClient();
    const properties: any = {
      'Orientation ID': { title: [{ text: { content: id } }] },
      'Date': { date: { start: new Date().toISOString().split('T')[0] } },
      'Branch': { select: { name: branch } },
      'Section': { select: { name: section } },
      'Students Present': { number: 0 },
      'QR Scans': { number: 0 },
      'Reports': { number: 0 },
      'Valid Reports': { number: 0 },
      'Duplicate Reports': { number: 0 },
      'Invalid Reports': { number: 0 },
      'Total Points': { number: 0 },
    };

    const page = await notion.pages.create({
      parent: { database_id: ORIENTATIONS_DB_ID },
      properties,
    });

    return this.mapPageToOrientation(page);
  },

  async incrementOrientationScans(id: string): Promise<void> {
    const notion = getNotionClient();
    const response = await notion.databases.query({
      database_id: ORIENTATIONS_DB_ID,
      filter: {
        property: 'Orientation ID',
        title: { equals: id },
      },
    });

    if (response.results.length > 0) {
      const page = response.results[0];
      const currentScans = (page as any).properties['QR Scans']?.number || 0;
      await notion.pages.update({
        page_id: page.id,
        properties: {
          'QR Scans': { number: currentScans + 1 },
        },
      });
    }
  },

  async getBadges(): Promise<Badge[]> {
    const notion = getNotionClient();
    const response = await notion.databases.query({
      database_id: BADGES_DB_ID,
    });
    return response.results.map((page: any) => this.mapPageToBadge(page));
  },

  // Dynamic metrics updates in Notion
  async updateStudentMetrics(
    mobileNumber: string,
    name: string,
    avatarEmoji: string | undefined,
    branch: string,
    section: string,
    orientationId?: string
  ): Promise<void> {
    const notion = getNotionClient();
    
    // Get all bugs for this student
    const allBugsResponse = await notion.databases.query({
      database_id: BUGS_DB_ID,
      filter: {
        property: 'Mobile Number',
        rich_text: { equals: mobileNumber },
      },
    });
    
    const studentBugs: BugReport[] = allBugsResponse.results.map((page: any) => this.mapPageToBug(page));
    const totalReports = studentBugs.length;
    const validReports = studentBugs.filter(b => b.status === 'VALID' || b.status === 'FIXED' || b.status === 'VERIFIED').length;
    const duplicateReports = studentBugs.filter(b => b.status === 'DUPLICATE').length;
    const fixedReports = studentBugs.filter(b => b.fixed || b.status === 'FIXED' || b.status === 'VERIFIED').length;
    const totalPoints = studentBugs.reduce((sum, b) => sum + (b.points || 0), 0);

    const badges = new Set<string>();
    if (validReports >= 1) badges.add('FIRST_FIND');
    if (validReports >= 5) badges.add('BUG_HUNTER');
    if (fixedReports >= 1) badges.add('FIX_FINDER');
    
    const highQualityBugs = studentBugs.filter(b => b.description && b.description.length > 50 && b.screenshotUrl);
    if (highQualityBugs.length >= 3) badges.add('QUALITY_REPORTER');

    // Find student page
    const studentResponse = await notion.databases.query({
      database_id: STUDENTS_DB_ID,
      filter: {
        property: 'Mobile Number',
        rich_text: { equals: mobileNumber },
      },
    });

    const badgeArray = Array.from(badges).map(b => ({ name: b }));

    const properties: any = {
      'Total Reports': { number: totalReports },
      'Valid Reports': { number: validReports },
      'Duplicate Reports': { number: duplicateReports },
      'Fixed Reports': { number: fixedReports },
      'Total Points': { number: totalPoints },
      'Badges': { multi_select: badgeArray },
    };

    if (studentResponse.results.length > 0) {
      await notion.pages.update({
        page_id: studentResponse.results[0].id,
        properties,
      });
    } else {
      // Create student page
      const studentProps: any = {
        'Student ID': { rich_text: [{ text: { content: `STU-${mobileNumber}` } }] },
        'Name': { title: [{ text: { content: name } }] },
        'Avatar Emoji': { rich_text: [{ text: { content: avatarEmoji || '👾' } }] },
        'Mobile Number': { rich_text: [{ text: { content: mobileNumber } }] },
        'Branch': { select: { name: branch } },
        'Section': { select: { name: section } },
        ...properties,
        'Created At': { date: { start: new Date().toISOString() } },
      };
      if (orientationId) studentProps['Orientation'] = { rich_text: [{ text: { content: orientationId } }] };
      
      await notion.pages.create({
        parent: { database_id: STUDENTS_DB_ID },
        properties: studentProps,
      });
    }
  },

  // Helper mappings
  mapPageToBug(page: any): BugReport {
    const props = page.properties;
    return {
      id: props['Report ID']?.rich_text[0]?.text?.content || page.id,
      studentName: props['Student']?.title[0]?.text?.content || '',
      avatarEmoji: props['Avatar Emoji']?.rich_text[0]?.text?.content || '👾',
      studentMobile: props['Mobile Number']?.rich_text[0]?.text?.content || '',
      branch: props['Branch']?.select?.name || '',
      section: props['Section']?.select?.name || '',
      pageCategory: props['Page Category']?.select?.name || '',
      pageUrl: props['Page URL']?.url || '',
      description: props['Bug Description']?.rich_text[0]?.text?.content || '',
      expectedBehaviour: props['Expected Behaviour']?.rich_text[0]?.text?.content || '',
      actualBehaviour: props['Actual Behaviour']?.rich_text[0]?.text?.content || '',
      screenshotUrl: props['Screenshot URL']?.url || '',
      screenRecordingUrl: props['Screen Recording URL']?.url || undefined,
      suggestedSolution: props['Suggested Solution']?.rich_text[0]?.text?.content || undefined,
      studentSeverity: props['Student Severity']?.select?.name || undefined,
      officialSeverity: props['Official Severity']?.select?.name || undefined,
      status: mapNotionStatus(
        props['Status']?.status?.name,
        props['Points']?.number || 0,
        props['Duplicate']?.checkbox || false,
        props['Fixed']?.checkbox || false
      ),
      points: props['Points']?.number || 0,
      duplicate: props['Duplicate']?.checkbox || false,
      firstReport: props['First Report']?.checkbox || false,
      fixed: props['Fixed']?.checkbox || false,
      submittedAt: props['Submitted At']?.date?.start || '',
      reviewedAt: props['Reviewed At']?.date?.start || null,
      reviewer: props['Reviewer']?.rich_text[0]?.text?.content || null,
      orientationId: props['Orientation']?.rich_text[0]?.text?.content || undefined,
      internalNotes: props['Internal Notes']?.rich_text[0]?.text?.content || undefined,
    };
  },

  mapPageToStudent(page: any): Student {
    const props = page.properties;
    return {
      mobileNumber: props['Mobile Number']?.rich_text[0]?.text?.content || '',
      name: props['Name']?.title[0]?.text?.content || '',
      avatarEmoji: props['Avatar Emoji']?.rich_text[0]?.text?.content || '👾',
      branch: props['Branch']?.select?.name || '',
      section: props['Section']?.select?.name || '',
      github: props['GitHub']?.url || undefined,
      linkedin: props['LinkedIn']?.url || undefined,
      totalReports: props['Total Reports']?.number || 0,
      validReports: props['Valid Reports']?.number || 0,
      duplicateReports: props['Duplicate Reports']?.number || 0,
      fixedReports: props['Fixed Reports']?.number || 0,
      totalPoints: props['Total Points']?.number || 0,
      badges: props['Badges']?.multi_select?.map((s: any) => s.name) || [],
      orientationId: props['Orientation']?.rich_text[0]?.text?.content || undefined,
      wdsInterest: props['WDS Interest']?.select?.name || undefined,
      createdAt: props['Created At']?.date?.start || '',
    };
  },

  mapPageToOrientation(page: any): Orientation {
    const props = page.properties;
    return {
      id: props['Orientation ID']?.title[0]?.text?.content || '',
      date: props['Date']?.date?.start || '',
      branch: props['Branch']?.select?.name || '',
      section: props['Section']?.select?.name || '',
      studentsPresent: props['Students Present']?.number || 0,
      qrScans: props['QR Scans']?.number || 0,
      reports: props['Reports']?.number || 0,
      validReports: props['Valid Reports']?.number || 0,
      duplicateReports: props['Duplicate Reports']?.number || 0,
      invalidReports: props['Invalid Reports']?.number || 0,
      totalPoints: props['Total Points']?.number || 0,
      topContributor: props['Top Contributor']?.rich_text[0]?.text?.content || undefined,
    };
  },

  mapPageToBadge(page: any): Badge {
    const props = page.properties;
    return {
      id: props['Badge ID']?.rich_text[0]?.text?.content || page.id,
      name: props['Badge Name']?.title[0]?.text?.content || '',
      description: props['Description']?.rich_text[0]?.text?.content || '',
      requirement: props['Requirement']?.rich_text[0]?.text?.content || '',
      icon: props['Icon']?.rich_text[0]?.text?.content || '',
      active: props['Active']?.checkbox || false,
    };
  }
};

function mapNotionStatus(
  statusName: string | undefined,
  points: number,
  duplicate: boolean,
  fixed: boolean
): any {
  if (statusName) {
    const name = statusName.toUpperCase();
    const allowed = ['VALID', 'INVALID', 'DUPLICATE', 'NEEDS MORE INFORMATION', 'PRIORITIZED', 'IN PROGRESS', 'FIXED', 'VERIFIED', 'UNDER REVIEW'];
    if (allowed.includes(name)) {
      return name;
    }
  }

  // Fallback to dynamic mapping from checkboxes and points
  if (duplicate) return 'DUPLICATE';
  if (fixed) return 'FIXED';
  if (points > 0) return 'VALID';

  if (statusName) {
    const name = statusName.toUpperCase();
    if (name === 'NOT STARTED' || name === 'TO DO' || name === 'NEW' || name === 'BACKLOG') {
      return 'NEW';
    }
  }
  return 'NEW';
}

