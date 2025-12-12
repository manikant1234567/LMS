import express from 'express';
import { authorize, protect } from '../middleware/auth.js';
import { allLoans, issueBook, myLoans, overdue, returnBook } from '../controllers/loanController.js';

const router = express.Router();

router.get('/mine', protect, myLoans);
router.get('/overdue', protect, authorize('admin', 'librarian'), overdue);
router.get('/', protect, authorize('admin', 'librarian'), allLoans);
router.post('/issue', protect, authorize('admin', 'librarian', 'member'), issueBook);
router.post('/return', protect, authorize('admin', 'librarian', 'member'), returnBook);

export default router;

