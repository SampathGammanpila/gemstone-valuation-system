import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import fileService from '../../services/file.service';
import systemSettingsRepository from '../../db/repositories/system-settings.repository';

class UploadController {
  /**
   * Upload gemstone image
   */
  async uploadGemstoneImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      // Process the uploaded file
      const processedImage = await this.processImage(req.file, 'gemstones');

      res.status(200).json({
        success: true,
        ...processedImage
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      // Process the uploaded file
      const processedImage = await this.processImage(req.file, 'profiles');

      res.status(200).json({
        success: true,
        ...processedImage
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;

      if (!fileId) {
        res.status(400).json({
          success: false,
          message: 'File ID is required'
        });
        return;
      }

      // Get file path from database or directly from the fileId
      // This is a simplistic approach; in a real app, you'd likely store file metadata in a database
      const filePath = path.join(__dirname, '../../../public/uploads', fileId);
      const thumbnailPath = path.join(__dirname, '../../../public/uploads/thumbnails', fileId);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
        return;
      }

      // Delete the file and its thumbnail if it exists
      await fileService.deleteFile(filePath);
      if (fs.existsSync(thumbnailPath)) {
        await fileService.deleteFile(thumbnailPath);
      }

      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process uploaded image
   */
  private async processImage(file: Express.Multer.File, type: 'gemstones' | 'profiles'): Promise<any> {
    // Generate a unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    // Define the path where the file will be stored
    const uploadDir = path.join(__dirname, `../../../public/uploads/${type}`);
    const thumbnailDir = path.join(__dirname, `../../../public/uploads/${type}/thumbnails`);
    
    // Ensure directories exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    
    // Optimize and save the image
    const optimizedImagePath = await fileService.processGemstoneImage(file.path, filePath);
    
    // Generate thumbnail
    const thumbnailPath = path.join(thumbnailDir, fileName);
    const thumbnailFileName = await fileService.generateThumbnail(optimizedImagePath, thumbnailPath);
    
    // Construct URLs
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    const fileUrl = `${baseUrl}/public/uploads/${type}/${path.basename(optimizedImagePath)}`;
    const thumbnailUrl = `${baseUrl}/public/uploads/${type}/thumbnails/${thumbnailFileName}`;
    
    // Return file information
    return {
      filePath: `/public/uploads/${type}/${path.basename(optimizedImagePath)}`,
      fileUrl,
      thumbnailUrl,
      fileId: path.basename(optimizedImagePath),
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    };
  }

  /**
   * Get allowed image types
   */
  private async getAllowedImageTypes(): Promise<string[]> {
    try {
      const setting = await systemSettingsRepository.getSettingByKey('allowed_image_types');
      if (setting && setting.value) {
        return setting.value.split(',').map((type: string) => type.trim());
      }
      // Default allowed types
      return ['image/jpeg', 'image/png', 'image/webp'];
    } catch (error) {
      console.error('Error getting allowed image types:', error);
      // Default allowed types if there's an error
      return ['image/jpeg', 'image/png', 'image/webp'];
    }
  }

  /**
   * Get max image size
   */
  private async getMaxImageSize(): Promise<number> {
    try {
      const setting = await systemSettingsRepository.getSettingByKey('max_image_size_kb');
      if (setting && setting.value) {
        return parseInt(setting.value) * 1024; // Convert KB to bytes
      }
      // Default max size: 5MB
      return 5 * 1024 * 1024;
    } catch (error) {
      console.error('Error getting max image size:', error);
      // Default max size if there's an error: 5MB
      return 5 * 1024 * 1024;
    }
  }
}

export default new UploadController();