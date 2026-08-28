import { NextResponse } from 'next/server';
import { db } from '@/services/db';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const leaderboard = await db.getLeaderboard();
    return NextResponse.json(leaderboard);
  } catch (error: any) {
    console.error('API Error fetching leaderboard:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
