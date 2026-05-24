const Sensor = require('../models/Sensor');

// GET /api/sensors
exports.getSensors = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const sensors = await Sensor.find(filter).sort({ 'location.city': 1 }).lean();
    res.json({ success: true, count: sensors.length, data: sensors });
  } catch (err) {
    next(err);
  }
};

// GET /api/sensors/:sensorId
exports.getSensor = async (req, res, next) => {
  try {
    const sensor = await Sensor.findOne({ sensorId: req.params.sensorId }).lean();
    if (!sensor) return res.status(404).json({ success: false, error: 'Sensor not found' });
    res.json({ success: true, data: sensor });
  } catch (err) {
    next(err);
  }
};

// POST /api/sensors
exports.createSensor = async (req, res, next) => {
  try {
    const sensor = await Sensor.create(req.body);
    res.status(201).json({ success: true, data: sensor });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'Sensor ID already exists' });
    }
    next(err);
  }
};

// PATCH /api/sensors/:sensorId/status
exports.updateSensorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const sensor = await Sensor.findOneAndUpdate(
      { sensorId: req.params.sensorId },
      { status, lastSeen: new Date() },
      { new: true }
    );
    if (!sensor) return res.status(404).json({ success: false, error: 'Sensor not found' });
    res.json({ success: true, data: sensor });
  } catch (err) {
    next(err);
  }
};
