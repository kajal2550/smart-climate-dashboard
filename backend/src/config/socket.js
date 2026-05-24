const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io;

const initSocket = (server) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://frontend:3000'];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('subscribe_sensor', (sensorId) => {
      socket.join(`sensor_${sensorId}`);
      logger.info(`Socket ${socket.id} subscribed to sensor ${sensorId}`);
    });

    socket.on('unsubscribe_sensor', (sensorId) => {
      socket.leave(`sensor_${sensorId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
