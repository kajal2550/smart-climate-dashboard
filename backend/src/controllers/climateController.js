const ClimateData = require('../models/ClimateData');
const Alert = require('../models/Alert');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// GET /api/climate/latest  — latest reading per sensor
exports.getLatest = async (req, res, next) => {
  try {
    const latest = await ClimateData.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$sensorId',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { 'location.city': 1 } },
    ]);
    res.json({ success: true, count: latest.length, data: latest });
  } catch (err) {
    next(err);
  }
};

// GET /api/climate/sensor/:sensorId  — history for one sensor
exports.getSensorHistory = async (req, res, next) => {
  try {
    const { sensorId } = req.params;
    const { hours = 24, limit = 100 } = req.query;

    const since = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);

    const data = await ClimateData.find({ sensorId, timestamp: { $gte: since } })
      .sort({ timestamp: -1 })
      .limit(Math.min(Number(limit), 500))
      .lean();

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/climate/stats  — aggregated stats
exports.getStats = async (req, res, next) => {
  try {
    const { sensorId, hours = 24 } = req.query;
    const since = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);

    const match = { timestamp: { $gte: since } };
    if (sensorId) match.sensorId = sensorId;

    const stats = await ClimateData.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$sensorId',
          avgTemp: { $avg: '$temperature.celsius' },
          maxTemp: { $max: '$temperature.celsius' },
          minTemp: { $min: '$temperature.celsius' },
          avgHumidity: { $avg: '$humidity' },
          avgPressure: { $avg: '$pressure' },
          avgAQI: { $avg: '$airQualityIndex' },
          avgWindSpeed: { $avg: '$windSpeed' },
          totalRainfall: { $sum: '$rainfall' },
          count: { $sum: 1 },
        },
      },
    ]);

    const rounded = stats.map((s) => ({
      ...s,
      avgTemp: +s.avgTemp.toFixed(2),
      maxTemp: +s.maxTemp.toFixed(2),
      minTemp: +s.minTemp.toFixed(2),
      avgHumidity: +s.avgHumidity.toFixed(2),
      avgPressure: +s.avgPressure.toFixed(2),
      avgAQI: +s.avgAQI.toFixed(1),
      avgWindSpeed: +s.avgWindSpeed.toFixed(2),
      totalRainfall: +s.totalRainfall.toFixed(2),
    }));

    res.json({ success: true, data: rounded });
  } catch (err) {
    next(err);
  }
};

// GET /api/climate/chart/:sensorId  — hourly aggregated for charts
exports.getChartData = async (req, res, next) => {
  try {
    const { sensorId } = req.params;
    const { hours = 24 } = req.query;
    const since = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);

    const data = await ClimateData.aggregate([
      { $match: { sensorId, timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%dT%H:00:00.000Z', date: '$timestamp' },
          },
          avgTemp: { $avg: '$temperature.celsius' },
          avgHumidity: { $avg: '$humidity' },
          avgPressure: { $avg: '$pressure' },
          avgAQI: { $avg: '$airQualityIndex' },
          avgWindSpeed: { $avg: '$windSpeed' },
          totalRainfall: { $sum: '$rainfall' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/climate  — ingest new reading
exports.createReading = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const reading = await ClimateData.create(req.body);

    try {
      const io = getIO();
      io.emit('climate_update', reading);
      io.to(`sensor_${reading.sensorId}`).emit('sensor_update', reading);
    } catch (_) {
      // socket may not be ready in tests
    }

    // Threshold-based alert generation
    await generateAlerts(reading);

    res.status(201).json({ success: true, data: reading });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/climate/old  — cleanup old records
exports.deleteOldData = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await ClimateData.deleteMany({ timestamp: { $lt: cutoff } });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    next(err);
  }
};

// ─── helpers ────────────────────────────────────────────────────────────────

async function generateAlerts(reading) {
  const checks = [
    {
      condition: reading.temperature.celsius > 40,
      type: 'temperature', severity: 'critical',
      title: 'Extreme Heat Alert',
      message: `Temperature reached ${reading.temperature.celsius}°C at ${reading.location.name}`,
      value: reading.temperature.celsius, threshold: 40,
    },
    {
      condition: reading.temperature.celsius < 0,
      type: 'temperature', severity: 'warning',
      title: 'Freezing Temperature Alert',
      message: `Temperature dropped to ${reading.temperature.celsius}°C at ${reading.location.name}`,
      value: reading.temperature.celsius, threshold: 0,
    },
    {
      condition: reading.airQualityIndex > 150,
      type: 'aqi', severity: reading.airQualityIndex > 200 ? 'critical' : 'warning',
      title: 'Poor Air Quality Alert',
      message: `AQI reached ${reading.airQualityIndex} at ${reading.location.name}`,
      value: reading.airQualityIndex, threshold: 150,
    },
    {
      condition: reading.windSpeed > 60,
      type: 'wind', severity: 'critical',
      title: 'High Wind Speed Alert',
      message: `Wind speed at ${reading.windSpeed} km/h near ${reading.location.name}`,
      value: reading.windSpeed, threshold: 60,
    },
    {
      condition: reading.humidity > 90,
      type: 'humidity', severity: 'warning',
      title: 'High Humidity Alert',
      message: `Humidity at ${reading.humidity}% at ${reading.location.name}`,
      value: reading.humidity, threshold: 90,
    },
  ];

  for (const check of checks) {
    if (check.condition) {
      const alert = await Alert.create({
        sensorId: reading.sensorId,
        type: check.type,
        severity: check.severity,
        title: check.title,
        message: check.message,
        value: check.value,
        threshold: check.threshold,
      });

      try {
        const io = getIO();
        io.emit('new_alert', alert);
      } catch (_) {}
    }
  }
}
