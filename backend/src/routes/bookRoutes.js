import express from 'express';
import multer from 'multer';
import { authorize, protect } from '../middleware/auth.js';
import { createBook, deleteBook, getBook, listBooks, updateBook } from '../controllers/bookController.js';

const router = express.Router();
const storage = multer.diskStorage({
  destination: 'backend/uploads',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  }
});
const upload = multer({ storage });

router.get('/', listBooks);
router.get('/:id', getBook);
router.post('/', protect, authorize('admin', 'librarian'), upload.single('cover'), createBook);
router.put('/:id', protect, authorize('admin', 'librarian'), upload.single('cover'), updateBook);
router.delete('/:id', protect, authorize('admin', 'librarian'), deleteBook);

export default router;

