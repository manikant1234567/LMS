import express from 'express';
import { authorize, protect } from '../middleware/auth.js';
import { listUsers, profile } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', protect, profile);
router.get('/', protect, authorize('admin', 'librarian'), listUsers);

export default router;

