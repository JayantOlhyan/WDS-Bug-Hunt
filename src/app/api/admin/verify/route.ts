import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    const serverPin = process.env.ADMIN_PIN || (process.env.NODE_ENV === 'development' ? '123456' : null);
    
    if (!serverPin) {
      return new NextResponse('Server configuration error', { status: 500 });
    }
    
    if (pin === serverPin) {
      return new NextResponse('OK', { status: 200 });
    } else {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
