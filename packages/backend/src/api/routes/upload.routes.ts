import { Router } from 'express';
import uploadController from '../controllers/upload.controller';
import upload from '../middlewares/upload.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { createHandler } from '../../types/express.types';

const router = Router();

/**
 * All upload routes require authentication
 */
router.use(authenticate);

/**
 * @route   POST /api/upload/gemstone-image
 * @desc    Upload gemstone image
 * @access  Private
 */
router.post(
  '/gemstone-image', 
  upload.single('file'), 
  createHandler(uploadController.uploadGemstoneImage)
);

/**
 * @route   POST /api/upload/profile-image
 * @desc    Upload profile image
 * @access  Private
 */
router.post(
  '/profile-image', 
  upload.single('file'), 
  createHandler(uploadController.uploadProfileImage)
);

/**
 * @route   DELETE /api/upload/file/:fileId
 * @desc    Delete uploaded file
 * @access  Private
 */
router.delete(
  '/file/:fileId', 
  createHandler(uploadController.deleteFile)
);

export default router;