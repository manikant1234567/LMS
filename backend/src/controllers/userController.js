import Loan from '../models/Loan.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';

export const profile = async (req, res) => {
  const loans = await Loan.find({ user: req.user._id }).populate('book').sort({ issuedAt: -1 });
  const reservations = await Reservation.find({ user: req.user._id }).populate('book').sort({
    createdAt: -1
  });
  const outstandingFine = loans
    .filter((l) => !l.returnedAt && l.dueDate < new Date())
    .reduce((sum, l) => sum + l.fineAccrued, 0);
  res.json({
    user: req.user,
    loans,
    reservations,
    outstandingFine
  });
};

export const listUsers = async (_req, res) => {
  const users = await User.find({}, 'name email role').sort({ createdAt: -1 });
  res.json(users);
};
// import Loan from '../models/Loan.js';
// import Reservation from '../models/Reservation.js';

// export const profile = async (req, res) => {
//   const loans = await Loan.find({ user: req.user._id }).populate('book').sort({ issuedAt: -1 });
//   const reservations = await Reservation.find({ user: req.user._id }).populate('book').sort({
//     createdAt: -1
//   });
//   const outstandingFine = loans
//     .filter((l) => !l.returnedAt && l.dueDate < new Date())
//     .reduce((sum, l) => sum + l.fineAccrued, 0);
//   res.json({
//     user: req.user,
//     loans,
//     reservations,
//     outstandingFine
//   });
// };

