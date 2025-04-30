import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  maxWidthOrHeightMobile: number;
  qualityMobile: number;
}

export async function compressImage(file: File): Promise<File> {
  const options: CompressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    maxWidthOrHeightMobile: 1280,
    qualityMobile: 0.7
  };

  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    options.maxWidthOrHeight = options.maxWidthOrHeightMobile;
    options.maxSizeMB = 0.5;
  }

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original file if compression fails
  }
}

export function generateImageUrl(url: string, width: number): string {
  try {
    const baseUrl = new URL(url);
    const quality = width < 768 ? 75 : 85; // Lower quality for mobile devices
    
    // Add width and quality parameters
    baseUrl.searchParams.set('w', width.toString());
    baseUrl.searchParams.set('q', quality.toString());
    
    return baseUrl.toString();
  } catch (error) {
    console.error('Error generating image URL:', error);
    return url; // Return original URL if generation fails
  }
}