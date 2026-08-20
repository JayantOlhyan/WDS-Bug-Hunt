import { NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';

export async function GET(
  request: Request,
  { params }: { params: { enrollment: string } }
) {
  try {
    const bugs = await dataService.getBugs();
    const studentBugs = bugs.filter(b => b.studentEnrollment === params.enrollment);
    return NextResponse.json(studentBugs);
  } catch (error: any) {
    console.error(`API Error fetching reports for student ${params.enrollment}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
