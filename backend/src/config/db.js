// src/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  // support either variable name: MONGODB_URI (common) or MONGO_URI (your .env)
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/librarydb';

  if (!uri) {
    throw new Error('MongoDB connection string is not set in environment variables');
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

export default connectDB;
