import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Book from './src/models/Book.js';

dotenv.config();

const run = async () => {
  await connectDB();
  await User.deleteMany({});
  await Book.deleteMany({});

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin'
  });

  const librarian = await User.create({
    name: 'Libby',
    email: 'librarian@example.com',
    password: 'Lib@12345',
    role: 'librarian'
  });

  const member = await User.create({
    name: 'Member One',
    email: 'member@example.com',
    password: 'Member@123',
    role: 'member'
  });

  const books = await Book.insertMany([
    {
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt',
      isbn: '978-0201616224',
      category: 'Software',
      year: 1999,
      description: 'Classic guide to pragmatic software craftsmanship.',
      quantity: 3,
      available: 3
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category: 'Software',
      year: 2008,
      description: 'A handbook of agile software craftsmanship.',
      quantity: 2,
      available: 2
    }
  ]);

  console.log('Seed complete', { admin: admin.email, librarian: librarian.email, member: member.email, books: books.length });
  mongoose.connection.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

