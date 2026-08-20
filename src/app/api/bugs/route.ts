import { NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';

export async function GET() {
  try {
    const bugs = await dataService.getBugs();
    return NextResponse.json(bugs);
  } catch (error: any) {
    console.error('API Error fetching bugs:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Server-side validation
    const required = ['name', 'mobileNumber', 'branch', 'section', 'pageCategory', 'pageUrl', 'description', 'expectedBehaviour', 'actualBehaviour', 'screenshotUrl'];
    for (const field of required) {
      if (!body[field]) {
        return new NextResponse(`Missing required parameter: ${field}`, { status: 400 });
      }
    }

    const bugReport = await dataService.createBug({
      studentMobile: body.mobileNumber,
      avatarEmoji: body.avatarEmoji || '👾',
      studentName: body.name,
      branch: body.branch,
      section: body.section,
      pageCategory: body.pageCategory,
      pageUrl: body.pageUrl,
      description: body.description,
      expectedBehaviour: body.expectedBehaviour,
      actualBehaviour: body.actualBehaviour,
      screenshotUrl: body.screenshotUrl,
      screenRecordingUrl: body.screenRecordingUrl || '',
      suggestedSolution: body.suggestedSolution || '',
      studentSeverity: body.studentSeverity || 'Minor',
      status: 'NEW',
      points: 0,
      duplicate: false,
      firstReport: false,
      fixed: false,
      orientationId: body.orientationId || 'CSE-AUG-20-01', // Fallback orientation id
    });

    return NextResponse.json(bugReport);
  } catch (error: any) {
    console.error('API Error creating bug:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
