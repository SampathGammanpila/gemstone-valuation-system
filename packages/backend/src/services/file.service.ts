import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import { Request } from 'express';
import systemSettingsRepository from '../db/repositories/system-settings.repository';

// Default settings
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * File service for handling file operations
 */
class FileService {
  /**
   * Process and optimize gemstone image
   * @param sourcePath Source path of the uploaded file
   * @param destinationPath Destination path to save the processed image
   * @returns Path to the optimized image
   */
  async processGemstoneImage(sourcePath: string, destinationPath: string): Promise<string> {
    try {
      // Get file extension
      const ext = path.extname(destinationPath).toLowerCase();
      const outputPath = destinationPath.replace(ext, '.jpg');
      
      // Process image based on type
      await sharp(sourcePath)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toFile(outputPath);
      
      // Delete the original uploaded file
      await this.deleteFile(sourcePath);
      
      return outputPath;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * Generate thumbnail for image
   * @param sourcePath Source path of the image
   * @param destinationPath Destination path to save the thumbnail
   * @returns Filename of the generated thumbnail
   */
  async generateThumbnail(sourcePath: string, destinationPath: string): Promise<string> {
    try {
      // Get file extension
      const ext = path.extname(destinationPath).toLowerCase();
      const thumbnailPath = destinationPath.replace(ext, '.jpg');
      
      // Generate thumbnail
      await sharp(sourcePath)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toFile(thumbnailPath);
      
      return path.basename(thumbnailPath);
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  /**
   * Delete file
   * @param filePath Path of the file to delete
   */
  async deleteFile(filePath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          reject(new Error('Failed to delete file'));
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Get allowed file types from system settings
   * @returns Array of allowed MIME types
   */
  async getAllowedFileTypes(): Promise<string[]> {
    try {
      const setting = await systemSettingsRepository.getSettingByKey('allowed_image_types');
      if (setting && setting.value) {
        return setting.value.split(',').map((type: string) => type.trim());
      }
      return DEFAULT_ALLOWED_TYPES;
    } catch (error) {
      console.error('Error getting allowed file types:', error);
      return DEFAULT_ALLOWED_TYPES;
    }
  }

  /**
   * Get maximum file size from system settings
   * @returns Maximum file size in bytes
   */
  async getMaxFileSize(): Promise<number> {
    try {
      const setting = await systemSettingsRepository.getSettingByKey('max_image_size_kb');
      if (setting && setting.value) {
        return parseInt(setting.value) * 1024; // Convert KB to bytes
      }
      return DEFAULT_MAX_SIZE;
    } catch (error) {
      console.error('Error getting max file size:', error);
      return DEFAULT_MAX_SIZE;
    }
  }

  /**
   * Create temp directory if it doesn't exist
   * @param directory Directory path
   */
  async ensureDirectoryExists(directory: string): Promise<void> {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  /**
   * Get file information
   * @param filePath Path of the file
   * @returns Object containing file information
   */
  async getFileInfo(filePath: string): Promise<{ size: number; type: string; dimensions?: { width: number; height: number } }> {
    try {
      const stats = fs.statSync(filePath);
      
      // Get file type using file extension
      const ext = path.extname(filePath).toLowerCase();
      let type = 'application/octet-stream'; // Default MIME type
      
      if (ext === '.jpg' || ext === '.jpeg') {
        type = 'image/jpeg';
      } else if (ext === '.png') {
        type = 'image/png';
      } else if (ext === '.webp') {
        type = 'image/webp';
      }
      
      // For images, get dimensions
      if (type.startsWith('image/')) {
        const metadata = await sharp(filePath).metadata();
        return {
          size: stats.size,
          type,
          dimensions: {
            width: metadata.width || 0,
            height: metadata.height || 0,
          },
        };
      }
      
      return {
        size: stats.size,
        type,
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error('Failed to get file information');
    }
  }
}

export default new FileService();