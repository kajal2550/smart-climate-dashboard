const ClimateData = require('../models/ClimateData');
const logger = require('./logger');

/**
 * Simple forecast: computes average temperature and humidity for each sensor over the past 24h
 * and creates a predicted reading for the next hour.
 */
async function generateHourlyForecast() {
  try {
    // Get distinct sensor IDs
    const sensors = await ClimateData.distinct('sensorId');
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const forecasts = [];
    for (const sensorId of sensors) {
      const recent = await ClimateData.find({
        sensorId,
        timestamp: { $gte: oneDayAgo, $lt: now },
      }).sort({ timestamp: -1 }).limit(100);
      if (recent.length === 0) continue;
      // Simple averages
      const avgTemp = recent.reduce((sum, r) => sum + r.temperature.celsius, 0) / recent.length;
      const avgHum = recent.reduce((sum, r) => sum + r.humidity, 0) / recent.length;
      const forecast = {
        sensorId,
        temperature: { celsius: Number(avgTemp.toFixed(2)) },
        humidity: Number(avgHum.toFixed(2)),
        isForecast: true,
        timestamp: new Date(now.getTime() + 60 * 60 * 1000), // next hour
      };
      forecasts.push(forecast);
    }
    if (forecasts.length) {
      await ClimateData.insertMany(forecasts);
      logger.info(`Inserted ${forecasts.length} forecast records`);
    }
  } catch (err) {
    logger.error('Forecast generation error:', err.message);
  }
}

module.exports = { generateHourlyForecast };
