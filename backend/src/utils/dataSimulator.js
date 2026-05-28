const cron = require('node-cron');
const ClimateData = require('../models/ClimateData');
const Sensor = require('../models/Sensor');
const { getIO } = require('../config/socket');
const logger = require('./logger');

const SENSORS = [
  { sensorId: 'SENSOR-001', name: 'Connaught Place Station', city: 'New Delhi', lat: 28.6315, lng: 77.2167 },
  { sensorId: 'SENSOR-002', name: 'Marine Drive Station', city: 'Mumbai', lat: 18.9438, lng: 72.8230 },
  { sensorId: 'SENSOR-003', name: 'MG Road Station', city: 'Bengaluru', lat: 12.9742, lng: 77.6082 },
  { sensorId: 'SENSOR-004', name: 'Park Street Station', city: 'Kolkata', lat: 22.5535, lng: 88.3537 },
  { sensorId: 'SENSOR-005', name: 'Anna Nagar Station', city: 'Chennai', lat: 13.0850, lng: 80.2101 },
  { sensorId: 'SENSOR-006', name: 'Banjara Hills Station', city: 'Hyderabad', lat: 17.4156, lng: 78.4347 },
  { sensorId: 'SENSOR-007', name: 'Saraba Nagar Station, Punjab', city: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
];

const CONDITIONS = ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy', 'windy', 'partly-cloudy'];
const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function randomBetween(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateReading(sensor) {
  const temp = randomBetween(18, 42);
  return {
    sensorId: sensor.sensorId,
    location: {
      name: sensor.name,
      city: sensor.city,
      country: 'IN',
      coordinates: { lat: sensor.lat, lng: sensor.lng },
    },
    temperature: { celsius: temp },
    humidity: randomBetween(30, 95),
    pressure: randomBetween(995, 1020),
    windSpeed: randomBetween(0, 45),
    windDirection: DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)],
    airQualityIndex: randomBetween(20, 250, 0),
    uvIndex: randomBetween(0, 11, 0),
    visibility: randomBetween(2, 25, 1),
    rainfall: Math.random() > 0.7 ? randomBetween(0, 15) : 0,
    cloudCover: randomBetween(0, 100, 0),
    condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
    timestamp: new Date(),
  };
}

async function seedSensors() {
  for (const s of SENSORS) {
    await Sensor.findOneAndUpdate(
      { sensorId: s.sensorId },
      {
        sensorId: s.sensorId,
        name: s.name,
        location: { name: s.name, city: s.city, country: 'IN', coordinates: { lat: s.lat, lng: s.lng } },
        status: 'active',
        lastSeen: new Date(),
      },
      { upsert: true, new: true }
    );
  }
  logger.info('Sensors seeded');
}

async function emitReadings() {
  try {
    const readings = SENSORS.map(generateReading);
    await ClimateData.insertMany(readings);

    try {
      const io = getIO();
      io.emit('bulk_update', readings);
    } catch (_) {}

    logger.debug(`Simulated ${readings.length} readings`);
  } catch (err) {
    logger.error('Simulator error:', err.message);
  }
}

// Emit a single sensor reading (used for high-frequency staggered updates)
let _sensorIdx = 0;
async function emitOneSensor() {
  const sensor = SENSORS[_sensorIdx % SENSORS.length];
  _sensorIdx++;
  try {
    const reading = generateReading(sensor);
    await ClimateData.create(reading);
    try {
      const io = getIO();
      io.emit('climate_update', reading);
      io.to(`sensor_${reading.sensorId}`).emit('sensor_update', reading);
    } catch (_) {}
    logger.debug(`Live update → ${sensor.city}`);
  } catch (err) {
    logger.error('Single-sensor emit error:', err.message);
  }
}

const startDataSimulator = () => {
  seedSensors();

  // Emit initial bulk snapshot so the UI has data immediately
  emitReadings();

  if (process.env.NODE_ENV === 'production') {
    // Production: bulk sync every 2 minutes via cron
    cron.schedule('*/2 * * * *', emitReadings);
  } else {
    // Development: round-robin individual sensor updates every 5 seconds
    // (gives a truly live feel — one city updates at a time)
    setInterval(emitOneSensor, 5000);

    // Full bulk sync every 60 s so nothing drifts out of sync
    setInterval(emitReadings, 60_000);
  }

  // Clean data older than 7 days daily at midnight
  cron.schedule('0 0 * * *', async () => {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await ClimateData.deleteMany({ timestamp: { $lt: cutoff } });
    logger.info(`Cleaned ${result.deletedCount} old records`);
  });
};

module.exports = { startDataSimulator, SENSORS };
