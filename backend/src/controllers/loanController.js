import mongoose from 'mongoose';
import Book from '../models/Book.js';
import Loan from '../models/Loan.js';
import Reservation from '../models/Reservation.js';
import ActivityLog from '../models/ActivityLog.js';

const loanPeriodDays = Number(process.env.LOAN_PERIOD_DAYS || 14);
const finePerDay = Number(process.env.FINE_PER_DAY || 2);

const logActivity = (actorId, action, entity, entityId, details) =>
  ActivityLog.create({ actor: actorId, action, entity, entityId, details });

const getNextDueDate = () => {
  const due = new Date();
  due.setDate(due.getDate() + loanPeriodDays);
  return due;
};

export const issueBook = async (req, res) => {
  const { userId, bookId } = req.body;
  let book;
  if (mongoose.Types.ObjectId.isValid(bookId)) {
    book = await Book.findById(bookId);
  }
  // allow issuing by ISBN (fallback for UI input mistakes)
  if (!book) {
    book = await Book.findOne({ isbn: bookId });
  }
  if (!book || book.available <= 0) return res.status(400).json({ message: 'Book unavailable' });

  const targetUser = req.user.role === 'member' ? req.user._id : userId || req.user._id;
  if (!targetUser) return res.status(400).json({ message: 'userId required' });

  // Check if user already has an active (unreturned) loan for this book
  const existingLoan = await Loan.findOne({
    user: targetUser,
    book: book._id,
    returnedAt: null
  });
  if (existingLoan) {
    return res.status(400).json({ message: 'You already have this book on loan' });
  }

  const loan = await Loan.create({
    user: targetUser,
    book: bookId,
    dueDate: getNextDueDate()
  });
  book.available -= 1;
  await book.save();
  await logActivity(req.user?._id, 'loan:issue', 'Loan', loan._id, `Issued ${book.title}`);
  res.status(201).json(loan);
};

export const returnBook = async (req, res) => {
  const { loanId } = req.body;
  const loan = await Loan.findById(loanId).populate('book');
  if (!loan || loan.returnedAt) return res.status(400).json({ message: 'Invalid loan' });

  // members can only return their own loans
  if (req.user.role === 'member' && String(loan.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  loan.returnedAt = new Date();

  const overdueDays = Math.max(
    0,
    Math.ceil((loan.returnedAt - loan.dueDate) / (1000 * 60 * 60 * 24))
  );
  loan.fineAccrued = overdueDays * finePerDay;
  await loan.save();

  // Update availability and fulfill reservation if exists

  const book = await Book.findById(loan.book._id);
  book.available += 1;
  await book.save();
 

  const nextReservation = await Reservation.findOne({ book: book._id, status: 'queued' }).sort({
    position: 1
  });
  if (nextReservation) {
    nextReservation.status = 'ready';
    await nextReservation.save();
  }

  await logActivity(req.user?._id, 'loan:return', 'Loan', loan._id, `Returned ${book.title}`);
  res.json({ loan, overdueDays, fine: loan.fineAccrued });
};

export const myLoans = async (req, res) => {
  const loans = await Loan.find({ user: req.user._id })
    .populate('book')
    .sort({ issuedAt: -1 });
  res.json(loans);
};

export const allLoans = async (_req, res) => {
  const loans = await Loan.find().populate('book user').sort({ issuedAt: -1 });
  res.json(loans);
};

export const overdue = async (_req, res) => {
  const now = new Date();
  const loans = await Loan.find({ returnedAt: null, dueDate: { $lt: now } })
    .populate('book user')
    .sort({ dueDate: 1 });
  res.json(loans);
};

