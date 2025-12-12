import mongoose from 'mongoose';



const loanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    issuedAt: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnedAt: { type: Date },
    fineAccrued: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Loan', loanSchema);

