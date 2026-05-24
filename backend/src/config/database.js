const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/climate_db';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error.message);
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});

module.exports = { connectDB };
