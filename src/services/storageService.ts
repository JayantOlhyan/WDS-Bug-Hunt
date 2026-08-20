import { google } from 'googleapis';
import { Readable } from 'stream';

// Initialize Google Drive API lazily
let driveService: any = null;

function getDriveService() {
  if (!driveService) {
    const credsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!credsJson) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set");
    }

    const credentials = JSON.parse(credsJson);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    driveService = google.drive({ version: 'v3', auth });
  }
  return driveService;
}

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

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      throw new Error("GOOGLE_DRIVE_FOLDER_ID environment variable is not set");
    }

    // Generate unique filename
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const filename = `${Date.now()}-${uniqueId}.${extension}`;

    // Read file bytes and convert to Readable stream for googleapis
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const drive = getDriveService();

    // Upload to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
      },
      media: {
        mimeType: file.type || `image/${extension}`,
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    const fileId = response.data.id;

    if (!fileId) {
      throw new Error("Failed to upload file to Google Drive");
    }

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Return the link that can be embedded/viewed
    return response.data.webViewLink || response.data.webContentLink;
  }
};
