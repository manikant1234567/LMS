import express from 'express';
import { authorize, protect } from '../middleware/auth.js';
import { listActivity } from '../controllers/activityController.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'librarian'), listActivity);

export default router;

