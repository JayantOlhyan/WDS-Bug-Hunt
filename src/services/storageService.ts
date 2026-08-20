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

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error("IMGBB_API_KEY environment variable is not set");
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // Prepare FormData for ImgBB API
    const formData = new FormData();
    formData.append('image', base64Image);

    // Upload to ImgBB
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to upload image to ImgBB: ${errorData.error?.message || response.statusText}`);
    }

    const resJson = await response.json();
    if (!resJson.success || !resJson.data?.url) {
      throw new Error(resJson.error?.message || "Invalid response from ImgBB API");
    }

    // Return the direct display URL
    return resJson.data.url;
  }
};
