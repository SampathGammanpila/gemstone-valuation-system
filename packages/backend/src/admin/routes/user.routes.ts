// packages/backend/src/admin/routes/user.routes.ts
import { Router } from 'express';
import userController from '../controllers/user.controller';

const router = Router();

// User management routes
router.get('/', userController.getAllUsers);
router.get('/create', userController.getCreateUserForm);
router.post('/create', userController.createUser);
router.get('/:id', userController.getUserDetails);
router.get('/:id/edit', userController.getEditUserForm);
router.post('/:id/edit', userController.updateUser);
router.post('/:id/verify', userController.verifyUser);
router.delete('/:id', userController.deleteUser);

export default router;