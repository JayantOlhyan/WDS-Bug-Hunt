import { NextResponse } from 'next/server';
import { storageService } from '@/services/storageService';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new NextResponse('Missing upload file payload', { status: 400 });
    }

    const relativeUrl = await storageService.uploadFile(file);
    return NextResponse.json({ url: relativeUrl });
  } catch (error: any) {
    console.error('API Error processing file upload:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

