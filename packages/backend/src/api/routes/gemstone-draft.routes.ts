// packages/backend/src/api/routes/gemstone-draft.routes.ts

import { Router } from 'express';
import gemstoneDraftController from '../controllers/gemstone-draft.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateIdParam, validatePagination } from '../middlewares/validation.middleware';
import { validateSaveDraft } from '../validators/gemstone.validator';

const router = Router();

// All draft routes require authentication
router.use(authenticate);

// Get all drafts
router.get('/', validatePagination, gemstoneDraftController.getAllDrafts);

// Get draft count
router.get('/count', gemstoneDraftController.getDraftCount);

// Get draft by ID
router.get('/:id', validateIdParam('id'), gemstoneDraftController.getDraftById);

// Create a new draft
router.post('/', validateSaveDraft, gemstoneDraftController.createDraft);

// Update an existing draft
router.put('/:id', validateIdParam('id'), validateSaveDraft, gemstoneDraftController.updateDraft);

// Delete a draft
router.delete('/:id', validateIdParam('id'), gemstoneDraftController.deleteDraft);

export default router;