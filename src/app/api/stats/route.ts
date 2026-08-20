import { NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [bugs, students, orientations] = await Promise.all([
      dataService.getBugs(),
      dataService.getStudents(),
      dataService.getOrientations(),
    ]);

    const totalBugs = bugs.length;
    const totalPoints = students.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
    const activeHunters = students.length;
    const orientationsCount = orientations.length;

    return NextResponse.json({
      totalBugs,
      totalPoints,
      activeHunters,
      orientationsCount,
    });
  } catch (error: any) {
    console.error('API Error fetching stats:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
