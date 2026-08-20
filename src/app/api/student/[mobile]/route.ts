import { NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';

export async function GET(
  request: Request,
  { params }: { params: { mobile: string } }
) {
  try {
    const student = await dataService.getStudent(params.mobile);
    if (!student) {
      return new NextResponse('Student profile not found', { status: 404 });
    }
    return NextResponse.json(student);
  } catch (error: any) {
    console.error(`API Error fetching student ${params.mobile}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
