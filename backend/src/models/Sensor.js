const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema(
  {
    sensorId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    location: {
      name: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: 'IN' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    type: {
      type: String,
      enum: ['weather_station', 'air_quality', 'indoor', 'outdoor'],
      default: 'weather_station',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    firmware: { type: String, default: '1.0.0' },
    lastSeen: { type: Date, default: Date.now },
    batteryLevel: { type: Number, min: 0, max: 100, default: 100 },
  },
  { timestamps: true, versionKey: false }
);

const Sensor = mongoose.model('Sensor', sensorSchema);
module.exports = Sensor;
