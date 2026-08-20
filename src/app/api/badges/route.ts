import { NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';

export async function GET() {
  try {
    const badges = await dataService.getBadges();
    return NextResponse.json(badges);
  } catch (error: any) {
    console.error('API Error fetching badges definitions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
