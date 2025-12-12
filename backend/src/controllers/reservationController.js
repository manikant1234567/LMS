import Reservation from '../models/Reservation.js';
import Book from '../models/Book.js';

export const reserveBook = async (req, res) => {
  const { bookId } = req.body;
  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const existing = await Reservation.findOne({
    book: bookId,
    user: req.user._id,
    status: { $in: ['queued', 'ready'] }
  });
  if (existing) return res.status(400).json({ message: 'Already in queue' });
  const position = (await Reservation.countDocuments({ book: bookId, status: 'queued' })) + 1;
  const reservation = await Reservation.create({
    book: bookId,
    user: req.user._id,
    position,
    status: 'queued'
  });
  res.status(201).json(reservation);
};

export const listReservations = async (_req, res) => {
  const items = await Reservation.find().populate('book user').sort({ createdAt: 1 });
  res.json(items);
};

export const myReservations = async (req, res) => {
  const items = await Reservation.find({ user: req.user._id }).populate('book').sort({ createdAt: 1 });
  res.json(items);
};

export const fulfillReservation = async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ message: 'Not found' });
  reservation.status = 'fulfilled';
  await reservation.save();
  const remaining = await Reservation.find({ book: reservation.book, status: 'queued' }).sort({
    position: 1
  });
  for (let i = 0; i < remaining.length; i += 1) {
    remaining[i].position = i + 1;
    await remaining[i].save();
  }
  res.json(reservation);
};

