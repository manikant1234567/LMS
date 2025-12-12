import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    category: { type: String },
    year: { type: Number },
    description: { type: String },
    quantity: { type: Number, default: 1 },
    available: { type: Number, default: 1 },
    coverImage: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Book', bookSchema);

