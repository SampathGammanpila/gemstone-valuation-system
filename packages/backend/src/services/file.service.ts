// packages/backend/src/services/file.service.ts
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import adminConfig from '../config/admin.config';
import { Request } from 'express';

// Configure file storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    // Determine destination based on file type
    let uploadPath = adminConfig.uploads.tempUploads;
    
    if (file.fieldname === 'gemstoneImages') {
      uploadPath = adminConfig.uploads.gemstoneImages;
    } else if (file.fieldname === 'profileImage') {
      uploadPath = adminConfig.uploads.userAvatars;
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // This is the correct way to pass an error with FileFilterCallback
    cb(null, false);
    // You can also use req.fileValidationError to pass the error message
    (req as any).fileValidationError = 'Only image files are allowed!';
  }
};

// Create multer upload instance
export const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

class FileService {
  /**
   * Process and optimize gemstone images
   */
  async processGemstoneImage(filePath: string): Promise<string> {
    try {
      const optimizedPath = filePath.replace(path.extname(filePath), '_optimized.jpg');
      
      // Resize and optimize image
      await sharp(filePath)
        .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(optimizedPath);
      
      // Delete original file
      fs.unlinkSync(filePath);
      
      return path.basename(optimizedPath);
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  }
  
  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('File deletion error:', error);
      throw error;
    }
  }
  
  /**
   * Generate thumbnail for gemstone image
   */
  async generateThumbnail(filePath: string): Promise<string> {
    try {
      const thumbnailPath = filePath.replace(path.extname(filePath), '_thumb.jpg');
      
      // Create thumbnail
      await sharp(filePath)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toFile(thumbnailPath);
      
      return path.basename(thumbnailPath);
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      throw error;
    }
  }
}

export default new FileService();