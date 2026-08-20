import fs from 'fs/promises';
import path from 'path';

export const storageService = {
  async uploadFile(file: File): Promise<string> {
    // Check file size (limit: 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('File exceeds maximum size of 5MB');
    }

    // Check extension
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      throw new Error(`File type .${extension || ''} is not allowed. Only PNG, JPG, JPEG, and WEBP files are accepted.`);
    }

    // Generate unique filename
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const filename = `${Date.now()}-${uniqueId}.${extension}`;

    // Read file bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save locally
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Ensure dir exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // Return public relative path
    return `/uploads/${filename}`;
  }
};
