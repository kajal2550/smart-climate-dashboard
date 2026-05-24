const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    sensorId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['temperature', 'humidity', 'pressure', 'wind', 'aqi', 'uv', 'rainfall'],
    },
    severity: {
      type: String,
      required: true,
      enum: ['info', 'warning', 'critical'],
      default: 'warning',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    value: { type: Number },
    threshold: { type: Number },
    acknowledged: { type: Boolean, default: false },
    acknowledgedAt: { type: Date },
    resolvedAt: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

alertSchema.index({ active: 1, severity: 1 });
alertSchema.index({ createdAt: -1 });

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;
