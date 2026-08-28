import { NextResponse } from 'next/server';
import { db } from '@/services/db';

export async function GET(
  request: Request,
  { params }: { params: { mobile: string } }
) {
  try {
    const student = await db.getStudent(params.mobile);
    if (!student) {
      return new NextResponse('Student profile not found', { status: 404 });
    }
    return NextResponse.json(student);
  } catch (error: any) {
    console.error(`API Error fetching student ${params.mobile}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
