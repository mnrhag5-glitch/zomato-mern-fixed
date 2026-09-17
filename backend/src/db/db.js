const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in environment variables');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('MongoDB connected successfully ✅');
  } catch (error) {
    console.error('MongoDB connection error 🩻:', error.message);
    throw error;
  }
}

module.exports = connectDB;
