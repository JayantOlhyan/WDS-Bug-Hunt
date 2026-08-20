import { NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bug = await dataService.getBug(params.id);
    if (!bug) {
      return new NextResponse('Bug report not found', { status: 404 });
    }
    return NextResponse.json(bug);
  } catch (error: any) {
    console.error(`API Error fetching bug ${params.id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST or PATCH is accepted
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const updatedBug = await dataService.updateBug(params.id, {
      status: body.status,
      officialSeverity: body.officialSeverity,
      points: Number(body.points) || 0,
      duplicate: !!body.duplicate,
      firstReport: !!body.firstReport,
      fixed: !!body.fixed,
      internalNotes: body.internalNotes || '',
      reviewer: 'WDS Reviewer',
    });

    return NextResponse.json(updatedBug);
  } catch (error: any) {
    console.error(`API Error updating bug ${params.id}:`, error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
