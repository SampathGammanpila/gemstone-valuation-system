import api from './api.service';
import API_ENDPOINTS from '../../config/api.config';

/**
 * Interface for upload progress
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Interface for upload response
 */
export interface UploadResponse {
  success: boolean;
  filePath: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileId?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Service for file uploads
 */
class UploadService {
  /**
   * Upload a gemstone image
   * @param file The file to upload
   * @param onProgress Optional callback for upload progress
   */
  async uploadGemstoneImage(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    return this.uploadFile(file, API_ENDPOINTS.UPLOAD.GEMSTONE_IMAGE, onProgress);
  }

  /**
   * Upload multiple gemstone images
   * @param files The files to upload
   * @param onProgress Optional callback for upload progress
   */
  async uploadMultipleGemstoneImages(
    files: File[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse[]> {
    return Promise.all(files.map(file => this.uploadGemstoneImage(file, onProgress)));
  }

  /**
   * Upload a user profile image
   * @param file The file to upload
   * @param onProgress Optional callback for upload progress
   */
  async uploadProfileImage(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    return this.uploadFile(file, API_ENDPOINTS.UPLOAD.PROFILE_IMAGE, onProgress);
  }

  /**
   * Delete an uploaded file
   * @param fileId The ID of the file to delete
   */
  async deleteFile(fileId: string): Promise<{ success: boolean }> {
    return api.delete(`${API_ENDPOINTS.UPLOAD.DELETE}/${fileId}`);
  }

  /**
   * Generic file upload method
   * @param file The file to upload
   * @param endpoint The API endpoint for the upload
   * @param onProgress Optional callback for upload progress
   */
  private async uploadFile(
    file: File,
    endpoint: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Check if the file is an image and if it needs resizing
    if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
      // For images larger than 2MB, add a flag to resize
      formData.append('resize', 'true');
      formData.append('maxWidth', '1200');
      formData.append('maxHeight', '1200');
      formData.append('quality', '0.8');
    }

    try {
      // Create config with progress tracking if needed
      const config = onProgress
        ? {
            onUploadProgress: (progressEvent: any) => {
              const loaded = progressEvent.loaded;
              const total = progressEvent.total;
              const percentage = Math.round((loaded * 100) / total);
              
              if (onProgress) {
                onProgress({ loaded, total, percentage });
              }
            },
          }
        : undefined;

      const response = await api.post<UploadResponse>(endpoint, formData, config);
      return response;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Get the URL for a file
   * @param filePath The path of the file
   */
  getFileUrl(filePath: string): string {
    // If already a full URL, return as is
    if (filePath.startsWith('http')) {
      return filePath;
    }
    
    // Otherwise, construct the URL
    const baseUrl = process.env.REACT_APP_API_URL || '';
    return `${baseUrl}${filePath}`;
  }
}