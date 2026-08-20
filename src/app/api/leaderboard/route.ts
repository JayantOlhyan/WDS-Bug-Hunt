import { NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';

export async function GET() {
  try {
    const leaderboard = await dataService.getLeaderboard();
    return NextResponse.json(leaderboard);
  } catch (error: any) {
    console.error('API Error fetching leaderboard:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
