import { NextResponse } from 'next/server';
import { db } from '@/services/db';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const badges = await db.getBadges();
    return NextResponse.json(badges);
  } catch (error: any) {
    console.error('API Error fetching badges definitions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
