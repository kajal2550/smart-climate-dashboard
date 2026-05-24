const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.originalUrl, method: req.method });

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, error: 'Validation Error', details: messages });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'Invalid ID format' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, error: 'Duplicate field value' });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, error: 'CORS policy violation' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
};

module.exports = errorHandler;
