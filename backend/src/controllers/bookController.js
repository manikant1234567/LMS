import Book from '../models/Book.js';
import ActivityLog from '../models/ActivityLog.js';

const logActivity = async (actorId, action, entity, entityId, details) => {
  await ActivityLog.create({ actor: actorId, action, entity, entityId, details });
};

export const listBooks = async (req, res) => {
  const { q, category, available } = req.query;
  const filter = {};
  if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { author: new RegExp(q, 'i') }];
  if (category) filter.category = category;
  if (available === 'true') filter.available = { $gt: 0 };
  const books = await Book.find(filter).sort({ createdAt: -1 });
  res.json(books);
};

export const getBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Not found' });
  res.json(book);
};

export const createBook = async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.coverImage = `/uploads/${req.file.filename}`;
  data.available = data.quantity;
  const book = await Book.create(data);
  await logActivity(req.user?._id, 'book:create', 'Book', book._id, book.title);
  res.status(201).json(book);
};

export const updateBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Not found' });
  const updates = { ...req.body };
  if (req.file) updates.coverImage = `/uploads/${req.file.filename}`;
  const prevQty = book.quantity;
  Object.assign(book, updates);
  if (updates.quantity !== undefined) {
    const diff = Number(updates.quantity) - prevQty;
    book.available = Math.max(book.available + diff, 0);
  }
  await book.save();
  await logActivity(req.user?._id, 'book:update', 'Book', book._id, book.title);
  res.json(book);
};

export const deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Not found' });
  await book.deleteOne();
  await logActivity(req.user?._id, 'book:delete', 'Book', book._id, book.title);
  res.json({ message: 'Deleted' });
};

