import express from 'express';
import { authorize, protect } from '../middleware/auth.js';
import { createLibrarian, login, me, register } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.post('/librarians', protect, authorize('admin'), createLibrarian);

export default router;

