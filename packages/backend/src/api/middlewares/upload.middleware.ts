import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import fileService from '../../services/file.service';

// Ensure upload directories exist
const UPLOAD_DIR = path.join(__dirname, '../../../public/uploads');
const TEMP_DIR = path.join(UPLOAD_DIR, 'temp');

// Create directories if they don't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Storage configuration for multer
 */
const storage = multer.diskStorage({
  destination: async (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    try {
      // All uploads initially go to the temp directory
      cb(null, TEMP_DIR);
    } catch (error) {
      console.error('Error setting upload destination:', error);
      cb(new Error('Error setting upload destination'), TEMP_DIR);
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    try {
      // Generate a unique filename while preserving the original extension
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${uuidv4()}${fileExtension}`;
      cb(null, uniqueName);
    } catch (error) {
      console.error('Error generating filename:', error);
      cb(new Error('Error generating filename'), file.originalname);
    }
  }
});

/**
 * Filter files based on allowed types and maximum size
 */
const fileFilter = async (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  try {
    // Get allowed file types and max size from service
    const allowedTypes = await fileService.getAllowedFileTypes();
    const maxSize = await fileService.getMaxFileSize();
    
    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
    
    // Size check will be handled by multer limits
    return cb(null, true);
  } catch (error) {
    console.error('Error filtering file:', error);
    return cb(new Error('Error processing file'), false);
  }
};

/**
 * Multer configuration for file uploads
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Default max size (10MB), will be checked against system settings
    files: 5 // Maximum number of files per upload
  }
});

export default upload;