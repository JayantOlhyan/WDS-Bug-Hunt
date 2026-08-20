import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    const serverPin = process.env.ADMIN_PIN || '123456';
    
    if (pin === serverPin) {
      return new NextResponse('OK', { status: 200 });
    } else {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
