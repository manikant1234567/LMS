import express from 'express';
import { authorize, protect } from '../middleware/auth.js';
import {
  fulfillReservation,
  listReservations,
  myReservations,
  reserveBook
} from '../controllers/reservationController.js';

const router = express.Router();

router.post('/', protect, authorize('member', 'admin', 'librarian'), reserveBook);
router.get('/mine', protect, myReservations);
router.get('/', protect, authorize('admin', 'librarian'), listReservations);
router.put('/:id/fulfill', protect, authorize('admin', 'librarian'), fulfillReservation);

export default router;

