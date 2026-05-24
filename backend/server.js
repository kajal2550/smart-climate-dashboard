require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const { initSocket } = require('./src/config/socket');
const { startDataSimulator } = require('./src/utils/dataSimulator');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

const start = async () => {
  try {
    await connectDB();
    logger.info('MongoDB connected successfully');

    startDataSimulator();
    logger.info('Climate data simulator started');

    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

start();
