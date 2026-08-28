import { NextResponse } from 'next/server';
import { db } from '@/services/db';

export async function GET(
  request: Request,
  { params }: { params: { mobile: string } }
) {
  try {
    const bugs = await db.getBugs();
    const studentBugs = bugs.filter(b => b.studentMobile === params.mobile);
    return NextResponse.json(studentBugs);
  } catch (error: any) {
    console.error(`API Error fetching reports for student ${params.mobile}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
